# Release Lock: v1.0.0

This document defines the locked, reproducible baseline for V1.

## Release Identity

- Version: `1.0.0`
- Git tag: `v1.0.0`
- Branch at release: `main`
- Deployment target: Vercel production
- Canonical MCP URL: `https://figma-calgpt-project.vercel.app/mcp`
- Canonical widget URI: `ui://widget/gpt-calories-v3.html`

## Runtime Inputs (Required)

Set in Vercel project environment:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Dependency Lock

- Use `npm ci` (not `npm install`) for reproducible installs.
- Dependency graph is pinned via `package-lock.json`.
- Project version is pinned at `1.0.0` in `package.json` and `package-lock.json`.

## Smoke Test Contract

Run these after any redeploy:

```bash
# MCP health
curl https://figma-calgpt-project.vercel.app/mcp

# Tool metadata (must include ui://widget/gpt-calories-v3.html)
curl -X POST https://figma-calgpt-project.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Resources list (must include v3 widget URI)
curl -X POST https://figma-calgpt-project.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"resources/list"}'

# Resources read (must return text/html;profile=mcp-app)
curl -X POST https://figma-calgpt-project.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"ui://widget/gpt-calories-v3.html"}}'

# State call (must return structuredContent with date/goals/meals)
curl -X POST https://figma-calgpt-project.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"sync_state","arguments":{}}}'
```

## ChatGPT Connector Note

ChatGPT can cache template metadata by URI. If metadata appears stale:

1. Open ChatGPT settings: **Apps**.
2. Open `GPT-Calories`.
3. Click **Refresh**.
4. If still stale, disconnect and reconnect with the same MCP URL.

## Change Control After V1

For any post-V1 changes:

1. Keep V1 tag immutable.
2. Bump widget URI for breaking UI/template changes.
3. Update `CHANGELOG.md`.
4. Add a new semantic version tag.
