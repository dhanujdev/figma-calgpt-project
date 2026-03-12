# Quickstart

Use this for the fastest clean setup path.

## 1) Install and run locally

```bash
npm install
npm run dev
```

## 2) Set required runtime config

### Vercel

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_MCP_ENDPOINT=https://yaaslbgenkrimghcpeay.supabase.co/functions/v1/server/mcp`

### Supabase function secrets

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOW_DEMO_MODE=false`

## 3) Deploy database + function

```bash
supabase db push --project-ref yaaslbgenkrimghcpeay
supabase functions deploy server --project-ref yaaslbgenkrimghcpeay
```

## 4) Deploy app (Vercel)

Deploy latest `main`.

## 5) Verify

```bash
MCP_BASE_URL=https://figma-calgpt-project.vercel.app/mcp npm run smoke:mcp
```

If smoke fails, follow [`INCIDENT_PREVENTION.md`](./INCIDENT_PREVENTION.md).
