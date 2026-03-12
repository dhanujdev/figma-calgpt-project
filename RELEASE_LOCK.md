# Release Lock: v2.0.0 (V2/V3 Contract)

This document defines the locked reproducible baseline for V2/V3 rollout.

## Release Identity

- Version: `2.0.0`
- Branch baseline: `main`
- Canonical MCP URL: `https://figma-calgpt-project.vercel.app/mcp`
- Canonical widget URI: `ui://widget/gpt-calories-v4.html`
- SQL migration: `supabase/migrations/20260312_v2_v3_schema.sql`

## Runtime Inputs (Required)

Set in Vercel project + Supabase function runtime:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:

- `ALLOW_DEMO_MODE=true|false`
- `OAUTH_AUTHORIZATION_SERVER`
- `OAUTH_AUTHORIZATION_ENDPOINT`
- `OAUTH_TOKEN_ENDPOINT`
- `OAUTH_REGISTRATION_ENDPOINT`

## Reproducibility Rules

1. Use `npm ci` for deterministic install.
2. Keep `package-lock.json` in sync with `package.json`.
3. Run SQL migration before production traffic switch.
4. Do not reuse old widget URI for breaking widget changes.

## Strict Gate (Block Deploy On Failure)

```bash
npm run test:strict
```

Gate includes:

- MCP contract checks
- Widget bridge checks
- SQL migration checks
- UI shell checks
- Build
- Optional live smoke (`MCP_BASE_URL`)

## MCP Smoke Contract

```bash
curl https://figma-calgpt-project.vercel.app/mcp

curl -X POST https://figma-calgpt-project.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

curl -X POST https://figma-calgpt-project.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"resources/list"}'

curl -X POST https://figma-calgpt-project.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"ui://widget/gpt-calories-v4.html"}}'

curl -X POST https://figma-calgpt-project.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"sync_state","arguments":{}}}'
```

## Rollback Steps

1. Re-point tool metadata to prior widget URI if needed.
2. Keep SQL tables intact; rollback app/api code first.
3. Enable `ALLOW_DEMO_MODE=true` during incident if auth enforcement causes blocking.
4. Re-run MCP smoke contract after rollback.
