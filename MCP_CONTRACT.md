# MCP Contract (V2/V3)

## Core Protocol

- Endpoint: `/mcp` (rewritten to `/api/mcp`)
- Supports: `initialize`, `ping`, `tools/list`, `resources/list`, `resources/read`, `tools/call`
- Widget URI: `ui://widget/gpt-calories-v4.html`
- Widget MIME: `text/html;profile=mcp-app`

## Tools

### V1 Compatibility

1. `log_meal`
2. `sync_state`
3. `delete_meal`
4. `update_goals`

### V2 Functional Pages

1. `log_weight`
2. `get_progress`
3. `update_preferences`
4. `upload_progress_photo`

### V3 Orchestration

1. `run_daily_checkin`
2. `run_weekly_review`
3. `suggest_goal_adjustments`

## Structured Content Shape

`sync_state` returns:

```json
{
  "success": true,
  "state": {
    "date": "YYYY-MM-DD",
    "meals": [],
    "totalCalories": 0,
    "totalProtein": 0,
    "totalCarbs": 0,
    "totalFats": 0,
    "goals": {},
    "preferences": {}
  },
  "progress": {},
  "mode": "authenticated|demo",
  "page": "home|progress|settings"
}
```

## Auth Signaling

- Tool descriptors publish mixed auth via `securitySchemes`.
- Auth challenge path returns `_meta["mcp/www_authenticate"]` on tool error.
- Protected-resource metadata served from:
  - `/.well-known/oauth-protected-resource`
  - `/.well-known/oauth-authorization-server`

## Stability Rules

1. Preserve V1 tool names and basic behavior.
2. Keep `sync_state` no-arg compatible.
3. Version widget URI on breaking widget changes.
4. Keep large UI-only payloads in `_meta` when needed.
