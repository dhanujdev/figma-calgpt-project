# Testing Guide (V2/V3)

## Strict Gate (Required)

```bash
npm run test:strict
```

This runs:

1. `check:mcp-contract`
2. `check:widget-contract`
3. `check:sql-migration`
4. `check:ui-shell`
5. `build`
6. `smoke:mcp` (skips unless `MCP_BASE_URL` is set)

## Live MCP Smoke

```bash
MCP_BASE_URL=https://figma-calgpt-project.vercel.app/mcp npm run smoke:mcp
```

Expected:

- `tools/list` includes all V1 + V2 + V3 tools.
- `resources/list` includes `ui://widget/gpt-calories-v4.html`.
- `resources/read` returns widget HTML with MCP app MIME.
- `tools/call sync_state` returns structured state payload.

## Manual UI Checks

1. `/component.html` renders with Home/Progress/Settings tabs and refresh actions.
2. Widget settings actions (`update_goals`, `update_preferences`) complete without UI errors.
3. Widget orchestration actions (`run_daily_checkin`, `suggest_goal_adjustments`) return visible results.
4. React dev harness loads `/api/state` and iframe preview without runtime errors.

## Auth Checks

1. No token + `ALLOW_DEMO_MODE=true`: app runs in demo mode.
2. Valid token: app reports authenticated mode and isolates user data.
3. Invalid token + `ALLOW_DEMO_MODE=false`: protected tools return auth-required error path.
