# Deployment Guide

## 0) Pre-Deploy Assumptions

- `main` branch is the deploy source of truth.
- Supabase project ref: `yaaslbgenkrimghcpeay`.
- Canonical connector endpoint: `https://figma-calgpt-project.vercel.app/mcp`.

## 1) Configure Environment

### Vercel env vars

Required:

- `SUPABASE_URL=https://yaaslbgenkrimghcpeay.supabase.co`
- `SUPABASE_ANON_KEY=<anon key>`
- `SUPABASE_MCP_ENDPOINT=https://yaaslbgenkrimghcpeay.supabase.co/functions/v1/server/mcp`

Optional OAuth overrides:

- `OAUTH_AUTHORIZATION_SERVER`
- `OAUTH_AUTHORIZATION_ENDPOINT`
- `OAUTH_TOKEN_ENDPOINT`
- `OAUTH_REGISTRATION_ENDPOINT`

### Supabase function secrets

Required:

- `SUPABASE_URL=https://yaaslbgenkrimghcpeay.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=<service role key>`
- `ALLOW_DEMO_MODE=false`

## 2) Align Migration History Before SQL Push

If `supabase db push` or `supabase db pull` fails due local/remote history mismatch:

1. Preserve local-only migration files outside `supabase/migrations`.
2. Run `supabase migration fetch --project-ref yaaslbgenkrimghcpeay`.
3. Reconcile local vs fetched SQL via diff.
4. Add a new reconcile migration if needed.
5. Avoid `migration repair --status reverted` unless you intentionally rolled schema back.

## 3) Apply SQL Changes

```bash
supabase db push --project-ref yaaslbgenkrimghcpeay
```

## 4) Deploy Supabase Edge Function

```bash
supabase functions deploy server --project-ref yaaslbgenkrimghcpeay
```

## 5) Deploy Vercel

Deploy from latest `main` commit in Vercel project.

## 6) Verify End-to-End

### Supabase function probe

```bash
curl -i 'https://yaaslbgenkrimghcpeay.supabase.co/functions/v1/server/mcp' \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "apikey: <SUPABASE_ANON_KEY>" \
  -H 'content-type: application/json' \
  --data '{"method":"sync_state","params":{}}'
```

Must return `200`.

### MCP probe via Vercel

```bash
curl -sS https://figma-calgpt-project.vercel.app/mcp \
  -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'

curl -sS https://figma-calgpt-project.vercel.app/mcp \
  -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"sync_state","arguments":{}}}'

curl -sS https://figma-calgpt-project.vercel.app/mcp \
  -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_progress","arguments":{"range":"90D"}}}'
```

## 7) ChatGPT Connector Finalization

- Connector endpoint should be exact: `https://figma-calgpt-project.vercel.app/mcp`
- Reconnect app once after deployment.
- Validate widget loads and tool call actions work from ChatGPT chat.

## 8) Fast Rollback

1. Revert Vercel to last known good deployment.
2. Keep DB schema unless migration itself is faulty.
3. Restore previous `SUPABASE_MCP_ENDPOINT` if endpoint mismatch is the failure.
4. Re-run verification probes.
