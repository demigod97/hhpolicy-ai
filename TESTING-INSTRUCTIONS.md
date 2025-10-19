# Testing Instructions for PDF Access Fix

## ⚠️ IMPORTANT: Temporary Testing Mode Active

The storage buckets have been **temporarily made PUBLIC** to test if storage policies are causing the 400 errors.

**Status**: 🧪 TESTING IN PROGRESS

## What Was Done

Applied migration `20251019180724_temp_make_storage_public_for_testing.sql` which:
- Made 'sources' bucket PUBLIC
- Made 'policy-documents' bucket PUBLIC
- This bypasses all storage policies

## Test Credentials

Use these credentials to test different roles:

```
Administrator:
Email: admin@hh.com
Password: Admin@123

Executive:
Email: executive@hh.com
Password: Executive@123

Board:
Email: board@hh.com
Password: Board@123

System Owner:
Email: system_owner@hh.com
Password: System@123
```

## Testing Steps

### Test 1: Login as Administrator
1. Navigate to http://localhost:8082
2. Login with admin@hh.com / Admin@123
3. Go to Dashboard
4. Click on a document with "Admin" badge
5. **Expected**: PDF should load successfully (no 400 error)
6. **If successful**: ✅ Storage policies were the problem
7. **If still 400 error**: ❌ Issue is deeper (file paths, etc.)

### Test 2: Login as Executive
1. Logout and login with executive@hh.com / Executive@123
2. Go to Dashboard
3. Click on a document with "Executive" badge
4. **Expected**: PDF should load successfully
5. Try clicking on a document with "Admin" badge
6. **Expected**: PDF should load (executives can access admin docs)

### Test 3: Verify Board Still Works
1. Logout and login with board@hh.com / Board@123
2. Go to Dashboard
3. Click on ANY document
4. **Expected**: All PDFs load successfully

## Expected Outcomes

### Scenario A: PDFs Now Load for Admin/Executive ✅
**This means**: Storage policies were blocking access incorrectly

**Next Steps**:
1. Revert buckets to private
2. Implement service role approach (Option 2 from FINAL-FIX-PLAN.md)
3. Update Dashboard.tsx to use service role for storage operations only
4. Keep sources table RLS for access control

### Scenario B: PDFs Still Fail with 400 Error ❌
**This means**: Issue is NOT storage policies

**Possible causes**:
1. PDF file paths don't match actual files in storage
2. Files don't exist in storage buckets
3. File path format issues (special characters, encoding)
4. Storage API configuration problem

**Next Steps**:
1. Check actual files in Supabase Storage dashboard
2. Verify pdf_file_path values match real file names
3. Check for any special characters or encoding issues
4. May need to re-upload PDFs with correct paths

## Browser Console Logs

While testing, open browser DevTools (F12) and check:

1. **Console Tab**: Look for error messages
2. **Network Tab**:
   - Filter by "storage" or "signed"
   - Look for 400 errors
   - Check the request URL and response

Take screenshots of any errors and share them for further diagnosis.

## After Testing

### If Test Successful (PDFs Load)
Run this to revert to private buckets:

```sql
-- Revert buckets to private
UPDATE storage.buckets
SET public = false
WHERE id IN ('sources', 'policy-documents');
```

Then implement the service role fix in Dashboard.tsx.

### If Test Failed (Still 400 Errors)
Investigate file paths and storage contents:

```sql
-- Check what files exist in sources table
SELECT
  id,
  title,
  pdf_file_path,
  pdf_storage_bucket,
  file_path,
  target_role
FROM sources
WHERE type = 'pdf' AND processing_status = 'completed'
LIMIT 10;
```

Compare these paths with actual files in Supabase Storage dashboard.

## Critical Information Needed

Please provide:

1. **Test Results**: Which scenario occurred (A or B)?
2. **Browser Console Logs**: Any error messages
3. **Network Tab**: Screenshot of failed requests (if any)
4. **User Role Tested**: Which role showed the issue
5. **Specific Document**: Title of document that failed

This will help us implement the permanent fix.

## Security Note

⚠️ **IMPORTANT**: With buckets public, anyone with a file URL can access PDFs. This is **ONLY for testing**.

- Sources table RLS still prevents users from seeing documents they shouldn't
- But if someone gets a direct file URL, they can access it
- **Do NOT leave buckets public** - this is temporary for diagnosis only

Once we confirm the issue, we'll implement proper security with service role approach.
