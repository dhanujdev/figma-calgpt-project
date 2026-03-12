import type { VercelRequest, VercelResponse } from "@vercel/node";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

const SERVER_INFO = {
  name: "gpt-calories-mcp",
  version: "1.0.0",
};

const TOOL_DEFS = [
  {
    name: "log_meal",
    title: "Log meal",
    description:
      "Log a meal with calories/macros (name, calories, protein, carbs, fats).",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Meal name" },
        calories: { type: "number", description: "Calories" },
        protein: { type: "number", description: "Protein in grams" },
        carbs: { type: "number", description: "Carbs in grams" },
        fats: { type: "number", description: "Fats in grams" },
      },
      required: ["name", "calories"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  {
    name: "sync_state",
    title: "Sync state",
    description: "Get today's nutrition totals, goals, and logged meals.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  {
    name: "delete_meal",
    title: "Delete meal",
    description: "Delete a logged meal by meal ID.",
    inputSchema: {
      type: "object",
      properties: {
        meal_id: { type: "string", description: "Meal ID to delete" },
      },
      required: ["meal_id"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "update_goals",
    title: "Update goals",
    description: "Update daily calorie and macro goals.",
    inputSchema: {
      type: "object",
      properties: {
        calories: { type: "number" },
        protein: { type: "number" },
        carbs: { type: "number" },
        fats: { type: "number" },
      },
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
];

function setCors(res: VercelResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function ok(id: JsonRpcId, result: unknown) {
  return {
    jsonrpc: "2.0",
    id,
    result,
  };
}

function err(id: JsonRpcId, code: number, message: string) {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
    },
  };
}

function parseBody(req: VercelRequest): JsonRpcRequest | JsonRpcRequest[] {
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }
  return req.body as JsonRpcRequest | JsonRpcRequest[];
}

async function callSupabaseTool(name: string, args: Record<string, unknown>) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY is not configured");
  }

  const endpoint = `${supabaseUrl}/functions/v1/make-server-ae24ed01/mcp`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({
      method: name,
      params: args,
    }),
  });

  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { success: false, error: text };
  }

  if (!response.ok) {
    const reason =
      (payload as { error?: string })?.error ??
      `Supabase function failed (${response.status})`;
    throw new Error(reason);
  }

  return payload as {
    success?: boolean;
    message?: string;
    error?: string;
    [key: string]: unknown;
  };
}

async function handleSingleRpc(rpc: JsonRpcRequest) {
  const id = rpc.id ?? null;
  const method = rpc.method;
  const params = (rpc.params ?? {}) as Record<string, unknown>;

  if (!method) {
    return err(id, -32600, "Invalid Request");
  }

  // Ignore notifications (requests without id) where no response is expected.
  if (rpc.id === undefined && method.startsWith("notifications/")) {
    return null;
  }

  if (method === "initialize") {
    return ok(id, {
      protocolVersion: "2025-06-18",
      capabilities: {
        tools: {
          listChanged: false,
        },
      },
      serverInfo: SERVER_INFO,
    });
  }

  if (method === "ping") {
    return ok(id, {});
  }

  if (method === "tools/list") {
    return ok(id, { tools: TOOL_DEFS });
  }

  if (method === "tools/call") {
    const toolName = params.name as string | undefined;
    const toolArgs = (params.arguments ?? {}) as Record<string, unknown>;

    if (!toolName) {
      return err(id, -32602, "Missing tool name");
    }

    const exists = TOOL_DEFS.some((tool) => tool.name === toolName);
    if (!exists) {
      return err(id, -32601, `Unknown tool: ${toolName}`);
    }

    try {
      const toolResult = await callSupabaseTool(toolName, toolArgs);
      const isError = toolResult.success === false;
      const message =
        toolResult.message ??
        (isError
          ? toolResult.error ?? "Tool call failed"
          : `${toolName} completed`);

      return ok(id, {
        content: [{ type: "text", text: String(message) }],
        structuredContent: toolResult,
        isError,
      });
    } catch (error) {
      return ok(id, {
        content: [
          {
            type: "text",
            text: `Tool call failed: ${String(error)}`,
          },
        ],
        structuredContent: {
          success: false,
          error: String(error),
        },
        isError: true,
      });
    }
  }

  return err(id, -32601, `Method not found: ${method}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = parseBody(req);
    if (Array.isArray(body)) {
      const responses = await Promise.all(body.map((rpc) => handleSingleRpc(rpc)));
      const filtered = responses.filter((response) => response !== null);
      if (filtered.length === 0) {
        return res.status(204).end();
      }
      return res.status(200).json(filtered);
    }

    const response = await handleSingleRpc(body);
    if (response === null) {
      return res.status(204).end();
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(err(null, -32700, `Parse error: ${String(error)}`));
  }
}
