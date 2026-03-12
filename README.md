# CalGPT

CalGPT is a ChatGPT App with an MCP backend for calorie tracking, progress analytics, and goal management.

## Canonical Production Endpoints

- ChatGPT connector MCP endpoint: `https://figma-calgpt-project.vercel.app/mcp`
- Direct MCP endpoint (diagnostics): `https://figma-calgpt-project.vercel.app/api/mcp`
- OAuth protected-resource metadata: `https://figma-calgpt-project.vercel.app/.well-known/oauth-protected-resource`
- OAuth authorization-server metadata: `https://figma-calgpt-project.vercel.app/.well-known/oauth-authorization-server`
- Widget resource URI: `ui://widget/gpt-calories-v4.html`

## Architecture At A Glance

- `api/mcp.ts`
  - JSON-RPC MCP surface for ChatGPT.
  - Publishes tools/resources contract.
  - Proxies tool calls to Supabase Edge Function.
- `supabase/functions/server/`
  - Tool handlers and orchestration logic.
  - Reads/writes Supabase Postgres.
- `public/component.html`
  - Vanilla widget UI rendered by ChatGPT via MCP resource.
- `api/oauth-*.ts`
  - OAuth metadata endpoints used by MCP auth flows.

See full details in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Required Runtime Configuration

### Vercel (required)

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_MCP_ENDPOINT`
  - Recommended value: `https://yaaslbgenkrimghcpeay.supabase.co/functions/v1/server/mcp`

### Supabase Edge Function secrets (required)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOW_DEMO_MODE=false` for production

### Optional OAuth override env vars (Vercel)

- `OAUTH_AUTHORIZATION_SERVER`
- `OAUTH_AUTHORIZATION_ENDPOINT`
- `OAUTH_TOKEN_ENDPOINT`
- `OAUTH_REGISTRATION_ENDPOINT`

Important: do not put `SUPABASE_SERVICE_ROLE_KEY` in Vercel for this architecture.

## Tool Surface

### V1

- `log_meal`
- `sync_state`
- `delete_meal`
- `update_goals`

### V2

- `log_weight`
- `get_progress`
- `update_preferences`
- `upload_progress_photo`

### V3

- `run_daily_checkin`
- `run_weekly_review`
- `suggest_goal_adjustments`

## Setup

```bash
npm install
npm run dev
```

See deployment and operations docs before shipping:

- [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- [`TESTING_GUIDE.md`](./TESTING_GUIDE.md)
- [`MCP_CONTRACT.md`](./MCP_CONTRACT.md)
- [`RELEASE_LOCK.md`](./RELEASE_LOCK.md)
- [`INCIDENT_PREVENTION.md`](./INCIDENT_PREVENTION.md)
