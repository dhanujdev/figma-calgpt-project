# Setup Guide

This guide defines the canonical setup for local work and production parity.

## Local prerequisites

- Node.js 20+
- Supabase CLI
- Access to Supabase project `yaaslbgenkrimghcpeay`
- Access to Vercel project for CalGPT

## Local app run

```bash
npm install
npm run dev
```

## Supabase setup

### Link project

```bash
supabase link --project-ref yaaslbgenkrimghcpeay
```

### Migration handling rule

If migration history mismatch appears, align with:

```bash
supabase migration fetch --project-ref yaaslbgenkrimghcpeay
```

Then reconcile local SQL changes before `db push`.

### Apply SQL + deploy function

```bash
supabase db push --project-ref yaaslbgenkrimghcpeay
supabase functions deploy server --project-ref yaaslbgenkrimghcpeay
```

## Vercel setup

Set required env vars:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_MCP_ENDPOINT`

Deploy from latest `main`.

## Final checks

```bash
MCP_BASE_URL=https://figma-calgpt-project.vercel.app/mcp npm run smoke:mcp
```

Then run ChatGPT acceptance from [`TEST_CHATGPT.md`](./TEST_CHATGPT.md).
