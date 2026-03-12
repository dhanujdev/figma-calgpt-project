# ChatGPT Acceptance Test

Run this after production deploy.

## Connector checks

1. Connector endpoint is exactly `https://figma-calgpt-project.vercel.app/mcp`.
2. App opens without endpoint errors.
3. Widget renders and updates after tool calls.

## Functional checks

1. Ask to log a meal.
   - Expect successful `log_meal` behavior and updated totals.
2. Ask for current status.
   - Expect successful `sync_state` behavior.
3. Ask for progress summary.
   - Expect successful `get_progress` behavior.
4. Update preferences/goals.
   - Expect successful writes and persisted state.

## Error checks

Must not see:

- `404 Not Found [endpoint=...]`
- `Unknown method: <tool>`
- OAuth metadata 404 errors

## Manual fallback diagnostics

If app fails to open:

1. Probe MCP directly:

```bash
curl -sS https://figma-calgpt-project.vercel.app/mcp \
  -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

2. Probe tool call:

```bash
curl -sS https://figma-calgpt-project.vercel.app/mcp \
  -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"sync_state","arguments":{}}}'
```

3. If these pass, reconnect app in ChatGPT and retry in a fresh chat.
