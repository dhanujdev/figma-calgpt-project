# Incident Prevention and Known Errors

This document records the concrete outage patterns seen in production and the guardrails to prevent repeats.

## Error Class 1: MCP Opens, Tool Calls Fail

### Symptom

- ChatGPT can discover actions/tools.
- Actual tool calls fail with errors like:
  - `404 Not Found [endpoint=...]`

### Root Cause

- `SUPABASE_MCP_ENDPOINT` pointed to a non-working function route.

### Prevention

- Lock `SUPABASE_MCP_ENDPOINT` to tested endpoint.
- Run pre-release function probe using anon key.
- Keep smoke tests mandatory before deploy.

## Error Class 2: Function Path Mismatch

### Symptom

- One path works (`/functions/v1/make-server-ae24ed01/mcp`) while another fails (`/functions/v1/server/mcp`).

### Root Cause

- Function deployment and route prefix conventions drifted.

### Prevention

- Standardize on `server` function path in docs/env.
- Validate both direct function probe and Vercel MCP probe after each function deploy.

## Error Class 3: Migration History Drift

### Symptom

- `supabase db push` / `db pull` blocked by local vs remote migration mismatch.

### Root Cause

- Remote migration applied with version not present locally, or local migration renamed inconsistently.

### Prevention

- Use `supabase migration fetch` to align local history first.
- Reconcile SQL via diff and create explicit reconcile migration.
- Avoid `migration repair --status reverted` unless schema rollback is intentional.

## Error Class 4: Runtime Query Failures from Data Drift

### Symptom

- Errors like `Cannot coerce the result to a single JSON object`.

### Root Cause

- Duplicate rows or schema differences versus strict single-row assumptions.

### Prevention

- Keep handler queries tolerant of duplicate rows where safe.
- Add uniqueness constraints where intended.
- Add data cleanup migration if duplicates are discovered.

## Operational Checklist (Before Marking Healthy)

1. Supabase function probe returns `200` for `sync_state`.
2. Vercel `/mcp` initialize returns `200`.
3. Vercel `tools/call sync_state` and `tools/call get_progress` both succeed.
4. ChatGPT app opens and widget updates after action.
5. Smoke suite passes against live endpoint.

