# 🔧 DAY 1 DEPLOYMENT FIX - SUMMARY

**Issue Found:** Column name mismatch in RLS policies  
**Status:** ✅ FIXED  
**Date:** October 16, 2025

---

## ❌ Problem

The original `DEPLOY-DAY1.sql` script had an error on line 107:

```sql
ERROR: column "user_id" does not exist
LINE 107: user_id = auth.uid() AND
```

### Root Cause

The `sources` table uses the column name **`uploaded_by_user_id`**, but the RLS policy was trying to reference **`user_id`**.

### Database Schema Verification

Using Supabase MCP, I verified the actual column names:

**`sources` table columns:**
- ✅ `uploaded_by_user_id` (correct)
- ❌ `user_id` (does not exist)

**`user_roles` table columns:**
- ✅ `user_id` (correct)

---

## ✅ Solution

### Fixed Files Created:

1. **`DEPLOY-DAY1-FIXED.sql`** - Corrected consolidated deployment script
2. **`supabase/migrations/20251016145126_extend_user_roles_for_operators.sql`** - Fixed source migration file

### Change Made:

**Before (Line 107):**
```sql
CREATE POLICY "company_operators_upload_documents" ON public.sources
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND  -- ❌ WRONG
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('company_operator', 'system_owner', 'board', 'administrator')
  )
);
```

**After (Fixed):**
```sql
CREATE POLICY "company_operators_upload_documents" ON public.sources
FOR INSERT
WITH CHECK (
  uploaded_by_user_id = auth.uid() AND  -- ✅ CORRECT
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('company_operator', 'system_owner', 'board', 'administrator')
  )
);
```

---

## 🚀 How to Deploy (UPDATED)

### **Option 1: Use Fixed Consolidated Script (RECOMMENDED)**

1. Open Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/sql
   ```

2. Open local file: **`DEPLOY-DAY1-FIXED.sql`** (NOT the old `DEPLOY-DAY1.sql`)

3. Copy all contents (Ctrl+A, Ctrl+C)

4. Paste into SQL Editor (Ctrl+V)

5. Click "Run" or press Ctrl+Enter

6. Wait for "Query successful" message

### **Option 2: Use Individual Migration Files**

The individual migration file has also been fixed:
- `supabase/migrations/20251016145126_extend_user_roles_for_operators.sql` ✅ Fixed

You can now run migrations individually if you prefer.

---

## ✅ Verification

After deployment, run this query to verify:

```sql
-- Check that the policy was created successfully
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'sources'
  AND policyname = 'company_operators_upload_documents';
```

**Expected Result:**
- Should return 1 row showing the policy exists

---

## 📊 What Changed

| File | Status | Change |
|------|--------|--------|
| `DEPLOY-DAY1.sql` | ❌ Deprecated | Column mismatch error |
| `DEPLOY-DAY1-FIXED.sql` | ✅ New | Fixed version - use this |
| `20251016145126_extend_user_roles_for_operators.sql` | ✅ Updated | Fixed column reference |

---

## 🔍 Technical Details

### Why This Happened

The `sources` table was designed with a more descriptive column name (`uploaded_by_user_id`) to avoid ambiguity, but the RLS policy was written assuming the generic `user_id` column name.

### Impact

- **Scope:** Only affected the "company_operators_upload_documents" RLS policy
- **Tables Affected:** `sources` table only
- **Other Policies:** All other policies reference correct column names

### Prevention

Going forward, always verify column names against the actual schema using:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sources'
ORDER BY ordinal_position;
```

---

## 📞 Next Steps

1. ✅ Use **`DEPLOY-DAY1-FIXED.sql`** instead of `DEPLOY-DAY1.sql`
2. ✅ Run the deployment following the updated instructions above
3. ✅ Run verification queries to confirm success
4. ✅ Continue with Day 2-10 development as planned

---

## ✨ Summary

- **Problem:** Column name mismatch (`user_id` vs `uploaded_by_user_id`)
- **Solution:** Created fixed deployment script with correct column reference
- **Status:** Ready to deploy with `DEPLOY-DAY1-FIXED.sql`
- **Impact:** Minimal - one policy fixed, all other migrations unaffected

**You're now ready to deploy Day 1 migrations successfully!** 🎉
