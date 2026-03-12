# Release Lock (Production Baseline)

This file defines the minimum state required before shipping CalGPT.

## Locked Runtime Targets

- Public MCP URL: `https://figma-calgpt-project.vercel.app/mcp`
- Diagnostic MCP URL: `https://figma-calgpt-project.vercel.app/api/mcp`
- Widget URI: `ui://widget/gpt-calories-v4.html`
- Supabase function endpoint: `https://yaaslbgenkrimghcpeay.supabase.co/functions/v1/server/mcp`

## Locked Env Requirements

### Vercel

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_MCP_ENDPOINT`

### Supabase function secrets

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOW_DEMO_MODE=false`

## Locked Pre-Release Checks

1. `npm ci`
2. `npm run test:strict`
3. Live smoke:
   - `MCP_BASE_URL=https://figma-calgpt-project.vercel.app/mcp npm run smoke:mcp`
4. Manual ChatGPT open + tool-call sanity

## Locked No-Go Conditions

Do not release if any of these occur:

- `tools/list` passes but `tools/call` returns `404 Not Found [endpoint=...]`
- Supabase MCP endpoint returns non-200 for `sync_state`
- Migration history mismatch unresolved
- Widget URI mismatch between `tools/list` and `resources/list`

## Incident Escalation Defaults

1. Confirm endpoint wiring (`SUPABASE_MCP_ENDPOINT`) first.
2. Confirm function route response second.
3. Confirm migration history alignment third.
4. Reconnect ChatGPT app only after backend is verified healthy.
