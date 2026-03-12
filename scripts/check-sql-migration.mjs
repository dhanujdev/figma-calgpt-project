import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../supabase/migrations/20260312_v2_v3_schema.sql', import.meta.url), 'utf8');
const requiredTables = [
  'nutrition_goals',
  'user_preferences',
  'meals',
  'daily_totals',
  'weight_entries',
  'progress_photos',
  'streak_events',
  'badge_events',
];

for (const table of requiredTables) {
  if (!sql.includes(`create table if not exists public.${table}`)) {
    throw new Error(`Missing table in migration: ${table}`);
  }
  if (!sql.includes(`alter table public.${table} enable row level security`)) {
    throw new Error(`Missing RLS enable for table: ${table}`);
  }
}

console.log('check-sql-migration: OK');
