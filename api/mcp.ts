import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "fs";
import path from "path";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

type RpcContext = {
  appOrigin: string;
  supabaseUrl?: string;
};

const SERVER_INFO = {
  name: "gpt-calories-mcp",
  version: "1.1.0",
};

const WIDGET_URI = "ui://widget/gpt-calories-v2.html";
const WIDGET_MIME_TYPE = "text/html;profile=mcp-app";
const NOAUTH_SCHEME = { type: "noauth" } as const;

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
    securitySchemes: [NOAUTH_SCHEME],
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    _meta: {
      securitySchemes: [NOAUTH_SCHEME],
      ui: {
        resourceUri: WIDGET_URI,
        visibility: ["model", "app"],
      },
      "openai/outputTemplate": WIDGET_URI,
      "openai/toolInvocation/invoking": "Logging meal...",
      "openai/toolInvocation/invoked": "Meal logged",
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
    securitySchemes: [NOAUTH_SCHEME],
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
    _meta: {
      securitySchemes: [NOAUTH_SCHEME],
      ui: {
        resourceUri: WIDGET_URI,
        visibility: ["model", "app"],
      },
      "openai/outputTemplate": WIDGET_URI,
      "openai/toolInvocation/invoking": "Syncing state...",
      "openai/toolInvocation/invoked": "State synced",
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
    securitySchemes: [NOAUTH_SCHEME],
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    _meta: {
      securitySchemes: [NOAUTH_SCHEME],
      ui: {
        resourceUri: WIDGET_URI,
        visibility: ["model", "app"],
      },
      "openai/outputTemplate": WIDGET_URI,
      "openai/toolInvocation/invoking": "Deleting meal...",
      "openai/toolInvocation/invoked": "Meal deleted",
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
    securitySchemes: [NOAUTH_SCHEME],
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    _meta: {
      securitySchemes: [NOAUTH_SCHEME],
      ui: {
        resourceUri: WIDGET_URI,
        visibility: ["model", "app"],
      },
      "openai/outputTemplate": WIDGET_URI,
      "openai/toolInvocation/invoking": "Updating goals...",
      "openai/toolInvocation/invoked": "Goals updated",
    },
  },
];

function getWidgetHtml(): string {
  const candidates = [
    path.join(process.cwd(), "public", "component.html"),
    path.join(process.cwd(), "dist", "component.html"),
  ];

  for (const filePath of candidates) {
    try {
      return readFileSync(filePath, "utf8");
    } catch {
      // Try next location.
    }
  }

  return [
    "<!DOCTYPE html>",
    "<html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'>",
    "<title>GPT-Calories Widget</title></head>",
    "<body><pre id='root'>Loading...</pre>",
    "<script>",
    "function readOutput(){return window.openai?.toolOutput||null}",
    "function render(){const out=readOutput();document.getElementById('root').textContent=JSON.stringify(out,null,2)}",
    "window.addEventListener('openai:set_globals',render,{passive:true});render();",
    "</script></body></html>",
  ].join("");
}

function widgetResourceMeta(context: RpcContext) {
  const connectDomains = new Set<string>([context.appOrigin]);
  if (context.supabaseUrl) {
    connectDomains.add(context.supabaseUrl);
  }
  const connectDomainList = Array.from(connectDomains);
  const resourceDomainList = ["https://*.oaistatic.com", context.appOrigin];

  return {
    ui: {
      prefersBorder: true,
      domain: context.appOrigin,
      csp: {
        connectDomains: connectDomainList,
        resourceDomains: resourceDomainList,
      },
    },
    "openai/widgetPrefersBorder": true,
    "openai/widgetDomain": context.appOrigin,
    "openai/widgetCSP": {
      connect_domains: connectDomainList,
      resource_domains: resourceDomainList,
    },
    "openai/widgetDescription":
      "Shows today's calories, macros, and meals from GPT-Calories.",
  };
}

function toolStructuredContent(toolResult: Record<string, unknown>) {
  const maybeState = toolResult.state;
  if (maybeState && typeof maybeState === "object" && !Array.isArray(maybeState)) {
    return maybeState;
  }
  return toolResult;
}

function setCors(res: VercelResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, apikey, MCP-Protocol-Version",
  );
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
  if (req.body === undefined || req.body === null) {
    throw new Error("Missing request body");
  }
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

async function handleSingleRpc(rpc: JsonRpcRequest, context: RpcContext) {
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
        resources: {
          subscribe: false,
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

  if (method === "resources/list") {
    return ok(id, {
      resources: [
        {
          uri: WIDGET_URI,
          name: "GPT-Calories Widget",
          description: "Interactive nutrition dashboard widget",
          mimeType: WIDGET_MIME_TYPE,
        },
      ],
    });
  }

  if (method === "resources/read") {
    const uri = params.uri as string | undefined;
    if (!uri) {
      return err(id, -32602, "Missing resource uri");
    }
    if (uri !== WIDGET_URI) {
      return err(id, -32602, `Unknown resource uri: ${uri}`);
    }

    return ok(id, {
      contents: [
        {
          uri: WIDGET_URI,
          mimeType: WIDGET_MIME_TYPE,
          text: getWidgetHtml(),
          _meta: widgetResourceMeta(context),
        },
      ],
    });
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
        structuredContent: toolStructuredContent(toolResult),
        _meta: {
          rawResult: toolResult,
        },
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

  const hostHeader = (req.headers["x-forwarded-host"] ?? req.headers.host ?? "") as
    | string
    | string[];
  const protoHeader = (req.headers["x-forwarded-proto"] ?? "https") as
    | string
    | string[];
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  const proto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader;
  const safeHost = host.split(",")[0].trim() || "figma-calgpt-project.vercel.app";
  const appOrigin = `${proto.split(",")[0].trim() || "https"}://${safeHost}`;
  const context: RpcContext = {
    appOrigin,
    supabaseUrl: process.env.SUPABASE_URL,
  };

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      endpoint: "/api/mcp",
      widgetResourceUri: WIDGET_URI,
      message: "MCP endpoint is up. Use POST with JSON-RPC body.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = parseBody(req);
    if (Array.isArray(body)) {
      const responses = await Promise.all(
        body.map((rpc) => handleSingleRpc(rpc, context)),
      );
      const filtered = responses.filter((response) => response !== null);
      if (filtered.length === 0) {
        return res.status(204).end();
      }
      return res.status(200).json(filtered);
    }

    const response = await handleSingleRpc(body, context);
    if (response === null) {
      return res.status(204).end();
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(err(null, -32700, `Parse error: ${String(error)}`));
  }
}
