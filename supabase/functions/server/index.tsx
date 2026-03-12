import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as mcpHandler from "./mcp_handler.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ae24ed01/health", (c) => {
  return c.json({ status: "ok" });
});

// MCP Protocol Endpoint
app.post("/make-server-ae24ed01/mcp", async (c) => {
  try {
    const body = await c.req.json();
    const { method, params } = body;

    console.log(`MCP call: ${method}`, params);

    let result;
    switch (method) {
      case "log_meal":
        result = await mcpHandler.logMeal(params);
        break;
      case "sync_state":
        result = await mcpHandler.syncState();
        break;
      case "delete_meal":
        result = await mcpHandler.deleteMeal(params);
        break;
      case "update_goals":
        result = await mcpHandler.updateGoals(params);
        break;
      default:
        return c.json({ error: `Unknown method: ${method}` }, 400);
    }

    return c.json(result);
  } catch (error) {
    console.log(`MCP error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// REST API endpoints for direct access (testing/fallback)
app.get("/make-server-ae24ed01/state", async (c) => {
  try {
    const result = await mcpHandler.syncState();
    return c.json(result);
  } catch (error) {
    console.log(`Error fetching state: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-ae24ed01/log-meal", async (c) => {
  try {
    const params = await c.req.json();
    const result = await mcpHandler.logMeal(params);
    return c.json(result);
  } catch (error) {
    console.log(`Error logging meal: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-ae24ed01/meal/:id", async (c) => {
  try {
    const meal_id = c.req.param('id');
    const result = await mcpHandler.deleteMeal({ meal_id });
    
    if (!result.success) {
      return c.json(result, 404);
    }
    
    return c.json(result);
  } catch (error) {
    console.log(`Error deleting meal: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-ae24ed01/goals", async (c) => {
  try {
    const params = await c.req.json();
    const result = await mcpHandler.updateGoals(params);
    return c.json(result);
  } catch (error) {
    console.log(`Error updating goals: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);