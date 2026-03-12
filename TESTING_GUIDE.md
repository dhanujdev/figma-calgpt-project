# Testing Guide

## Required Local Gate

```bash
npm run test:strict
```

Current strict gate components:

1. `check:mcp-contract`
2. `check:widget-contract`
3. `check:sql-migration`
4. `check:ui-shell`
5. `build`
6. `smoke:mcp` (runs when `MCP_BASE_URL` is set)

## Live MCP Smoke

```bash
MCP_BASE_URL=https://figma-calgpt-project.vercel.app/mcp npm run smoke:mcp
```

Use `/api/mcp` as diagnostic fallback during connector issues:

```bash
MCP_BASE_URL=https://figma-calgpt-project.vercel.app/api/mcp npm run smoke:mcp
```

## Production Verification Matrix

### MCP base health

- `POST /mcp initialize` -> `200`
- `POST /mcp tools/list` -> includes V1/V2/V3 tools
- `POST /mcp tools/call sync_state` -> success payload
- `POST /mcp tools/call get_progress` -> success payload

### OAuth metadata

- `GET /.well-known/oauth-protected-resource` -> `200`
- `GET /.well-known/oauth-authorization-server` -> `200`

### Supabase function health

`SUPABASE_MCP_ENDPOINT` must return `200` with anon key and `sync_state` method payload.

## ChatGPT Acceptance Checks

1. Open GPT-Calories app from ChatGPT.
2. Log a meal via conversation.
3. Confirm widget updates totals and meal list.
4. Trigger progress and settings actions.
5. Confirm no `404 Not Found [endpoint=...]` error in tool response.

## Failure Triage Priority

1. Verify `SUPABASE_MCP_ENDPOINT` first.
2. Verify Supabase function route response with anon key.
3. Verify migration history consistency.
4. Verify ChatGPT connector endpoint is exact `/mcp`.
