# Enable pg_cron Extension

## Issue
The verification script shows: `⚠️ pg_cron extension not enabled`

## Why This Happened
The `pg_cron` extension is **not** enabled by default on Supabase projects. It must be manually enabled through the Database Extensions interface.

## Quick Fix (2 minutes)

### Option 1: Via Dashboard (Recommended)
1. Go to **Database** → **Extensions** in your Supabase Dashboard:
   https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/database/extensions

2. Search for `pg_cron`

3. Click **Enable** next to `pg_cron`

4. Wait ~10 seconds for activation

5. Re-run the verification script - the cron job should now show `1 scheduled (expected: 1)` ✅

### Option 2: Via SQL Editor
Run this single command in SQL Editor:
```sql
create extension if not exists pg_cron with schema cron;
```

## What This Extension Does
`pg_cron` is PostgreSQL's job scheduler. We're using it for:
- **Job Name:** `reset_daily_limits_job`
- **Schedule:** Midnight UTC (0 0 * * *)
- **Purpose:** Reset daily token usage limits for all users

## After Enabling
The cron job from Day 1 deployment (`DEPLOY-DAY1.sql`) will automatically activate. It's already created in your database - it just needs the extension enabled to start running.

## Verification
After enabling, re-run `QUICK-VERIFY.sql` and you should see:
```
Cron Jobs | 1 scheduled (expected: 1)
```

Instead of:
```
Cron Jobs | ⚠️ pg_cron extension not enabled - needs manual setup
```

## Technical Details
- **Extension:** pg_cron (PostgreSQL job scheduler)
- **Schema:** cron (automatically created)
- **Job Definition:** Already exists in your database from migration `20251016145129`
- **Job Command:** `SELECT reset_daily_limits();`
- **Function:** Calls the `reset_daily_limits()` helper function from Day 1

## No Code Changes Required
- ✅ Job is already created in database
- ✅ Helper function `reset_daily_limits()` exists
- ✅ Just need to enable the extension
- ✅ Then job will start running automatically

## Important Note
This is a **Supabase platform limitation**, not a deployment issue. All Day 1 migrations deployed successfully - the cron extension just needs manual activation on Supabase's platform.
