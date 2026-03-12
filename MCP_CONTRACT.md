# MCP Contract

## Protocol Surface

Endpoint: `/mcp` (rewritten to `/api/mcp`)

Supported JSON-RPC methods:

- `initialize`
- `ping`
- `tools/list`
- `resources/list`
- `resources/read`
- `tools/call`

## Resource Contract

- URI: `ui://widget/gpt-calories-v4.html`
- MIME: `text/html;profile=mcp-app`
- Source: `public/component.html`

## Tool Contract

### V1 tools

- `log_meal`
- `sync_state`
- `delete_meal`
- `update_goals`

### V2 tools

- `log_weight`
- `get_progress`
- `update_preferences`
- `upload_progress_photo`

### V3 tools

- `run_daily_checkin`
- `run_weekly_review`
- `suggest_goal_adjustments`

## Required Behavior

- `sync_state` must remain no-argument compatible.
- `tools/list` and `tools/call` must stay aligned (no phantom tools).
- `resources/list` must include `ui://widget/gpt-calories-v4.html`.
- `resources/read` must return widget HTML with MCP app MIME.

## Auth Signaling

- Tool descriptors expose `securitySchemes`.
- Protected flow errors return `_meta["mcp/www_authenticate"]`.
- Metadata endpoints:
  - `/.well-known/oauth-protected-resource`
  - `/.well-known/oauth-authorization-server`

## Known Integration Pitfalls (Now Guarded)

1. MCP endpoint responds but Supabase endpoint path is wrong.
2. `tools/list` succeeds while `tools/call` fails due backend route mismatch.
3. Local/remote migration drift introduces runtime query errors.

See [`INCIDENT_PREVENTION.md`](./INCIDENT_PREVENTION.md) for mitigation playbooks.
