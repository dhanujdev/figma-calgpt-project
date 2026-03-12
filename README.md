# GPT-Calories - ChatGPT App (V2/V3)

A ChatGPT-native nutrition tracker with:

- V1 compatibility (`log_meal`, `sync_state`, `delete_meal`, `update_goals`)
- V2 backend tooling (`log_weight`, `get_progress`, `update_preferences`, `upload_progress_photo`)
- V3 deterministic coaching orchestration (`run_daily_checkin`, `run_weekly_review`, `suggest_goal_adjustments`)

## Production URLs

- MCP endpoint: `https://figma-calgpt-project.vercel.app/mcp`
- OAuth protected resource metadata: `https://figma-calgpt-project.vercel.app/.well-known/oauth-protected-resource`
- OAuth authorization server metadata: `https://figma-calgpt-project.vercel.app/.well-known/oauth-authorization-server`
- Widget template URI: `ui://widget/gpt-calories-v4.html`

## Architecture

- `api/mcp.ts`: ChatGPT-facing MCP endpoint and tool/resource contract.
- `supabase/functions/server/`: Tool handlers and domain logic (SQL-first with legacy KV fallback).
- `public/component.html`: ChatGPT widget v4 (`window.openai.toolOutput` + `window.openai.callTool`).
- `src/app/App.tsx`: Lightweight local dev harness that previews the vanilla widget and state snapshot.

## Required Environment Variables

Set in Vercel and Supabase function runtime:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional OAuth metadata overrides:

- `OAUTH_AUTHORIZATION_SERVER`
- `OAUTH_AUTHORIZATION_ENDPOINT`
- `OAUTH_TOKEN_ENDPOINT`
- `OAUTH_REGISTRATION_ENDPOINT`

Optional rollout guard:

- `ALLOW_DEMO_MODE` (`true` by default; set to `false` to require auth)

## Database Migration

Run SQL migration before V2/V3 rollout:

- [`supabase/migrations/20260312_v2_v3_schema.sql`](./supabase/migrations/20260312_v2_v3_schema.sql)

It creates:

- `nutrition_goals`
- `user_preferences`
- `meals`
- `daily_totals`
- `weight_entries`
- `progress_photos`
- `streak_events`
- `badge_events`

## Strict Release Gate

Run before deploy:

```bash
npm run test:strict
```

This validates:

- MCP contract coverage and widget v4 URI
- Widget bridge hooks (`toolOutput`, `callTool`, `setWidgetState`)
- SQL migration table/RLS coverage
- Widget-first dev harness wiring
- Build
- Optional live MCP smoke tests (`MCP_BASE_URL`)

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Tool List

- `log_meal`
- `sync_state`
- `delete_meal`
- `update_goals`
- `log_weight`
- `get_progress`
- `update_preferences`
- `upload_progress_photo`
- `run_daily_checkin`
- `run_weekly_review`
- `suggest_goal_adjustments`

## Notes on Auth + Safety

- Mixed auth metadata is exposed in MCP tool descriptors.
- For protected tool flows, MCP returns auth challenge metadata (`mcp/www_authenticate`) when needed.
- Legacy KV fallback is kept to avoid hard breakage before SQL migration is applied.
