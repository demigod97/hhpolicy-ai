# Supabase Utility Scripts

This directory contains SQL utility scripts for database maintenance, verification, repair, and diagnostics.

**Last Updated**: 2025-10-20

---

## ⚠️ Important Notes

**NOT MIGRATIONS**: These scripts are NOT database migrations. For schema changes, use `supabase/migrations/`.

**Purpose**: These scripts are utilities for:
- Verifying database state
- Repairing data issues
- Diagnosing problems
- One-time fixes

**Usage**: Run manually when needed, not automatically

---

## 📁 Directory Structure

```
scripts/
├── README.md           # This file
├── verify/            # Verification and checking scripts
├── repair/            # Repair and fix scripts
└── diagnostics/       # Diagnostic and investigation scripts
```

---

## 📂 Script Categories

### verify/
**Purpose**: Check database state, verify data integrity, confirm migrations applied

**When to use**:
- After deployments to verify success
- Before making changes to check current state
- Troubleshooting to understand what exists

**Examples**:
- `VERIFY-DAY1-DEPLOYMENT.sql` - Check Day 1 migration status
- `QUICK-VERIFY.sql` - Quick check of critical tables
- `verify-rls-policies.sql` - Verify Row Level Security policies exist

**Characteristics**:
- ✅ Read-only (SELECT statements)
- ✅ Safe to run multiple times
- ✅ No data modification

---

### repair/
**Purpose**: Fix data issues, repair broken state, apply corrective changes

**When to use**:
- After identifying issues with verify scripts
- When data is in inconsistent state
- To fix RLS policy problems
- To repair migration issues

**Examples**:
- `fix-rls-migration.sql` - Fix RLS policy issues
- `fix-rls-policy.sql` - Repair specific RLS policies
- `REPAIR-DAY1.sql` - Repair Day 1 deployment issues
- `fix-user-role.sql` - Fix user role assignments

**⚠️ Characteristics**:
- ⚠️ Modifies data (CREATE, ALTER, UPDATE)
- ⚠️ Should be reviewed before running
- ⚠️ May require backups first
- ⚠️ Run only when needed

---

### diagnostics/
**Purpose**: Investigate issues, debug problems, gather information

**When to use**:
- Troubleshooting unexpected behavior
- Understanding data patterns
- Investigating performance issues
- Researching before implementing fixes

**Examples**:
- `INVESTIGATE-SOURCES-DATA.sql` - Check sources table data
- `DIAGNOSE-STORAGE-ISSUE.sql` - Investigate storage problems
- `check-rls-violations.sql` - Find RLS policy violations
- `analyze-query-performance.sql` - Check query performance

**Characteristics**:
- ✅ Read-only (mostly)
- ✅ Informational queries
- ✅ May include EXPLAIN ANALYZE
- ✅ Safe to run multiple times

---

## 🔧 Usage Guidelines

### Running Scripts

**Via psql (Command Line)**:
```bash
psql -h your-supabase-host \
     -U postgres \
     -d postgres \
     -f supabase/scripts/verify/QUICK-VERIFY.sql
```

**Via Supabase SQL Editor**:
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste script content
4. Review script before running
5. Execute query

**Via Supabase CLI**:
```bash
supabase db execute -f supabase/scripts/repair/fix-rls-policy.sql --password your-password
```

---

### Safety Checklist

**Before running any script**:
- [ ] Read the entire script
- [ ] Understand what it does
- [ ] Check if it modifies data (verify/ = safe, repair/ = careful)
- [ ] Backup data if running repair scripts
- [ ] Run on test environment first (if possible)
- [ ] Verify you have correct database connection

**Red Flags** (be extra careful):
- `DROP TABLE`
- `DELETE FROM`
- `TRUNCATE`
- `ALTER TABLE ... DROP COLUMN`
- `UPDATE` without WHERE clause

---

## 📝 Script Naming Convention

### Format
```
[action]-[target]-[description].sql
```

**Examples**:
- `verify-rls-policies.sql` - Verification script for RLS policies
- `fix-storage-bucket.sql` - Repair script for storage bucket
- `diagnose-upload-failures.sql` - Diagnostic script for upload issues

### Date-Prefixed Scripts
Historical scripts may have date prefixes:
```
YYYY-MM-DD-description.sql
```

**Example**: `2025-10-20-verify-deployment.sql`

---

## 🛠️ Common Tasks

### Task 1: Verify Deployment
```bash
# After deploying migrations, verify they applied
psql ... -f supabase/scripts/verify/QUICK-VERIFY.sql
```

### Task 2: Check RLS Policies
```bash
# Check if RLS policies exist and are correct
psql ... -f supabase/scripts/verify/verify-rls-policies.sql
```

### Task 3: Fix RLS Issues
```bash
# After verifying RLS problem, apply fix
psql ... -f supabase/scripts/repair/fix-rls-policy.sql
```

### Task 4: Investigate Upload Failure
```bash
# Diagnose why uploads are failing
psql ... -f supabase/scripts/diagnostics/DIAGNOSE-STORAGE-ISSUE.sql
```

---

## 📋 Script Documentation Template

Each script should include header comments:

```sql
-- ============================================================================
-- Script: script-name.sql
-- Category: verify/repair/diagnostics
-- Purpose: [Brief description of what this script does]
--
-- Safety: [READ-ONLY / MODIFIES DATA]
--
-- Usage:
--   psql -h host -U postgres -d postgres -f script-name.sql
--
-- Description:
--   [Detailed explanation of the script's purpose and what it checks/fixes]
--
-- Expected Output:
--   [What you should see when script runs successfully]
--
-- Notes:
--   - [Important notes or warnings]
--   - [Dependencies or prerequisites]
--
-- Created: YYYY-MM-DD
-- Last Modified: YYYY-MM-DD
-- ============================================================================

-- Script content here
```

---

## 🔍 Finding Scripts

### By Purpose
- Need to check something? → `verify/`
- Need to fix something? → `repair/`
- Need to investigate? → `diagnostics/`

### By Date
- Recently created scripts often have date prefixes
- Sort by filename to see chronological order

### By Name
- Search for keywords in filename
- Check README in each subdirectory

---

## ⚠️ Difference: Scripts vs Migrations

### Migrations (`supabase/migrations/`)
**Purpose**: Schema changes, permanent database modifications

**Characteristics**:
- ✅ Version controlled with timestamps
- ✅ Applied automatically by Supabase CLI
- ✅ Tracked in `supabase_migrations` table
- ✅ Idempotent (safe to run multiple times)
- ✅ Applied in order

**When to use**: Schema changes, new tables, new columns, RLS policy creation

---

### Scripts (`supabase/scripts/`)
**Purpose**: Utilities, repairs, diagnostics

**Characteristics**:
- ⚠️ Run manually when needed
- ⚠️ Not tracked by migration system
- ⚠️ May not be idempotent
- ⚠️ No guaranteed order

**When to use**: One-time fixes, troubleshooting, verification

---

## 📚 Script Inventory

### Current Scripts

**verify/**
- `VERIFY-DAY1-DEPLOYMENT.sql` - Check Day 1 migration status
- `QUICK-VERIFY.sql` - Quick verification of critical tables

**repair/**
- `fix-rls-migration.sql` - Fix RLS policy issues
- `fix-rls-policy.sql` - Repair specific RLS policies
- `fix-user-role.sql` - Fix user role assignments
- `REPAIR-DAY1.sql` - Repair Day 1 deployment issues
- `ADD-MISSING-FUNCTION.sql` - Add missing database function

**diagnostics/**
- `INVESTIGATE-SOURCES-DATA.sql` - Check sources table data
- `DIAGNOSE-STORAGE-ISSUE.sql` - Investigate storage problems

**For complete inventory**, see individual subdirectory README files.

---

## 🔄 Maintenance

### Adding New Scripts
1. Choose appropriate directory (verify/repair/diagnostics)
2. Use naming convention: `[action]-[target]-[description].sql`
3. Add header documentation
4. Test script thoroughly
5. Update this README if significant

### Archiving Old Scripts
- Scripts from resolved one-time issues can be archived
- Create `archived/` subdirectory if needed
- Move scripts older than 6 months (if no longer relevant)

### Cleaning Up
- Review scripts quarterly
- Remove obsolete scripts
- Update documentation
- Ensure all scripts still work

---

## 🔗 Related Documentation

- [../migrations/](../migrations/) - Database migrations (permanent schema changes)
- [../../docs/guides/troubleshooting-guide.md](../../docs/guides/troubleshooting-guide.md) - Troubleshooting guide
- [../../docs/current/known-issues.md](../../docs/current/known-issues.md) - Known database issues

---

## 📞 Need Help?

**Script not working?**
1. Check Supabase connection
2. Verify correct database selected
3. Check for typos in script
4. Review script documentation

**Need a new script?**
1. Check if similar script exists
2. Choose correct category
3. Follow template above
4. Test thoroughly

**Unsure if safe to run?**
- Check script category (verify = always safe)
- Read entire script before running
- Test on development environment first
- Ask for review if uncertain

---

**Scripts Directory**: Created 2025-10-20 (Project Cleanup Plan Phase 3)
**Maintained By**: Dev Team
**Safety Note**: Always review scripts before running, especially repair scripts
