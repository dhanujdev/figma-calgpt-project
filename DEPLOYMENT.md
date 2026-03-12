# Deployment Guide (V2/V3)

## 1) Run SQL Migration

Execute in Supabase SQL editor:

- `supabase/migrations/20260312_v2_v3_schema.sql`

## 2) Set Environment Variables

### Required

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Optional

- `ALLOW_DEMO_MODE` (`true` default)
- `OAUTH_AUTHORIZATION_SERVER`
- `OAUTH_AUTHORIZATION_ENDPOINT`
- `OAUTH_TOKEN_ENDPOINT`
- `OAUTH_REGISTRATION_ENDPOINT`

## 3) Run Strict Gate Locally

```bash
npm ci
npm run test:strict
```

Optional live smoke test:

```bash
MCP_BASE_URL=https://figma-calgpt-project.vercel.app/mcp npm run smoke:mcp
```

## 4) Deploy to Vercel

```bash
vercel --prod
```

## 5) Post-Deploy Checks

1. `tools/list` includes all V1 + V2 + V3 tools.
2. `resources/list` returns `ui://widget/gpt-calories-v4.html`.
3. `resources/read` returns `text/html;profile=mcp-app`.
4. `tools/call sync_state` returns state + progress.
5. `/.well-known/oauth-protected-resource` is reachable.

## 6) Rollback Strategy

1. Roll back to previous deployment in Vercel.
2. Keep SQL migration applied; schema is backward tolerant.
3. If auth causes incidents, temporarily set `ALLOW_DEMO_MODE=true`.
4. Re-run post-deploy checks after rollback.
