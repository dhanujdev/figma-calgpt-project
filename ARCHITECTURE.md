# Architecture

## Request Flow

1. User interacts with GPT-Calories inside ChatGPT.
2. ChatGPT calls MCP JSON-RPC on Vercel (`/mcp` -> `/api/mcp`).
3. `api/mcp.ts` validates request and resolves tool/resource contract.
4. For `tools/call`, `api/mcp.ts` forwards to Supabase Edge Function MCP endpoint.
5. Supabase function executes tool logic against Postgres and returns structured payload.
6. ChatGPT renders widget from `resources/read` (`public/component.html`), using tool output.

## Components

### 1) MCP Gateway (Vercel)

- Path: `api/mcp.ts`
- Responsibilities:
  - JSON-RPC methods: `initialize`, `ping`, `tools/list`, `resources/list`, `resources/read`, `tools/call`
  - Tool metadata and annotations
  - Widget template metadata (`ui://widget/gpt-calories-v4.html`)
  - Auth challenge metadata (`mcp/www_authenticate`)
  - Forwarding to Supabase function endpoint

### 2) Tool Runtime (Supabase Edge Function)

- Path: `supabase/functions/server/`
- Responsibilities:
  - Execute tool handlers (V1, V2, V3)
  - Resolve user identity (Supabase Auth token when provided)
  - Read/write Postgres tables
  - Return deterministic response payloads

### 3) Data Layer (Supabase Postgres)

Primary tables used by V2/V3:

- `nutrition_goals`
- `user_preferences`
- `meals`
- `daily_totals`
- `weight_entries`
- `progress_photos`
- `streak_events`
- `badge_events`

### 4) Widget UI (Vanilla HTML)

- Path: `public/component.html`
- Integration points:
  - `window.openai.toolOutput`
  - `window.openai.callTool`
  - `window.openai.setWidgetState`
  - `openai:set_globals`
  - `notifyIntrinsicHeight`

## Routing and Endpoint Contracts

### Public URLs

- `GET/POST /mcp` -> rewritten to `/api/mcp`
- `GET /.well-known/oauth-protected-resource`
- `GET /.well-known/oauth-authorization-server`

### Internal forwarding

- `api/mcp.ts` -> `SUPABASE_MCP_ENDPOINT` (recommended explicit route)

## Auth and Security Boundaries

- Vercel MCP endpoint uses `SUPABASE_ANON_KEY` for function invocation.
- User auth (if provided by ChatGPT/connector) is forwarded as `X-User-Authorization`.
- Supabase function uses `SUPABASE_SERVICE_ROLE_KEY` server-side for DB access.
- Production should run with `ALLOW_DEMO_MODE=false`.

## Failure Domains

- Vercel reachable but Supabase endpoint wrong -> tools listed but `tools/call` fails.
- Supabase function deployed on path A while Vercel points to path B -> `404` on tool execution.
- Data duplicates or schema drift -> runtime errors in progress/state queries.

Operational guardrails are documented in [`INCIDENT_PREVENTION.md`](./INCIDENT_PREVENTION.md).
