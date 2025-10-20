# Final Fix Plan for PDF Access Issue

## Problem Summary
Admin and Executive users still getting 400 errors when trying to view PDFs despite implementing:
- ✅ Role-based RLS policies on sources table
- ✅ Storage bucket configuration
- ✅ Simplified storage policies
- ✅ Function permissions

## Root Cause Hypothesis

After 5 migration attempts, the 400 error persists. This strongly suggests the issue is **NOT with RLS policies** but with how Supabase Storage's `createSignedUrl()` API works.

### Key Insight
The 400 error is coming from the Storage API **before** it checks storage policies. This happens when:

1. **Storage bucket doesn't exist** - Already ruled out (buckets created)
2. **File doesn't exist** - Possible if `pdf_file_path` doesn't match actual file in storage
3. **Invalid file path format** - Possible if paths have special characters or wrong format
4. **Missing storage permissions** - Storage API checks permissions differently than we expect

## The Real Issue

Looking at the error pattern:
- Board users CAN view PDFs → This proves files exist and storage works
- Admin/Executive CANNOT view same PDFs → This proves it's NOT a file existence issue
- Error is 400, not 403 → This suggests API validation failure, not permission denial

**Conclusion**: The storage policies are being evaluated incorrectly or the storage API is rejecting requests before policies are checked.

## Solution: Bypass Storage Policies for Signed URLs

Since Board users can access files, it means:
1. Files exist in storage ✅
2. Signed URLs work ✅
3. The issue is storage policies blocking non-Board users ❌

### Option 1: Temporary Public Access (Quick Test)
Make buckets public temporarily to confirm this is the issue:

```sql
-- Make buckets public for testing
UPDATE storage.buckets
SET public = true
WHERE id IN ('sources', 'policy-documents');
```

If this works, we know storage policies are the problem.

### Option 2: Use Service Role for Signed URLs (Recommended)
Bypass storage policies by using service role credentials:

```typescript
// Create a Supabase client with service role for storage operations only
import { createClient } from '@supabase/supabase-js'

const supabaseServiceRole = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY // Service role bypasses RLS
)

// In Dashboard.tsx
const handleDocumentSelect = async (documentId: string) => {
  // 1. Check access using normal client (RLS applies)
  const { data, error } = await supabase
    .from('sources')
    .select('...')
    .eq('id', documentId)
    .single();

  if (error) {
    // User doesn't have access to this document
    showAccessDeniedError();
    return;
  }

  // 2. If we got here, user has access. Use service role for storage
  const { data: urlData, error: urlError } = await supabaseServiceRole.storage
    .from(data.pdf_storage_bucket || 'sources')
    .createSignedUrl(data.pdf_file_path, 3600);

  // This will work because we already verified access via sources table
}
```

**Why this works**:
- Sources table RLS correctly filters documents by role
- If user can query the source, they have permission
- Service role bypasses storage policies
- Security is maintained at the sources table level

### Option 3: Edge Function for PDF Access (Most Secure)
Create an Edge Function that handles PDF access:

```typescript
// supabase/functions/get-pdf-url/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const { documentId } = await req.json()
  const authHeader = req.headers.get('Authorization')!

  // Create client with user's auth
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  // Check if user has access (RLS applies)
  const { data: source, error } = await supabase
    .from('sources')
    .select('pdf_file_path, pdf_storage_bucket')
    .eq('id', documentId)
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: 'Access denied' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // User has access, create signed URL with service role
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: urlData } = await supabaseAdmin.storage
    .from(source.pdf_storage_bucket || 'sources')
    .createSignedUrl(source.pdf_file_path, 3600)

  return new Response(JSON.stringify({ signedUrl: urlData.signedUrl }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

## Implementation Steps

### Step 1: Verify the Real Issue (Quick Test)
```sql
-- Run this migration to test
UPDATE storage.buckets
SET public = true
WHERE id IN ('sources', 'policy-documents');
```

Test with admin/executive users. If PDFs load, we confirmed storage policies are the problem.

### Step 2: Implement Option 2 (Recommended Quick Fix)
1. Add service role key to environment
2. Create service role client in Dashboard.tsx
3. Use it only for storage operations
4. Keep sources table RLS for access control

### Step 3: Implement Option 3 (Long-term Solution)
1. Create Edge Function `get-pdf-url`
2. Update Dashboard.tsx to call Edge Function
3. Edge Function checks RLS then returns signed URL
4. Most secure approach

## Migration to Apply Now

```sql
-- ============================================================================
-- Temporary Fix: Make Storage Public for Testing
-- Date: 2025-10-19
-- Purpose: Confirm storage policies are causing the 400 errors
-- ============================================================================

-- TEMPORARY: Make buckets public to bypass storage policies
UPDATE storage.buckets
SET public = true
WHERE id IN ('sources', 'policy-documents');

-- We can add a comment to remind us this is temporary
COMMENT ON TABLE storage.buckets IS
'TEMPORARY: Buckets set to public for testing.
Once confirmed, implement service role or edge function approach.';
```

## Expected Outcome

After making buckets public:
- ✅ Admin users should be able to view PDFs
- ✅ Executive users should be able to view PDFs
- ✅ Board users continue to work

This confirms storage policies are the issue. Then we implement Option 2 (service role) as the permanent fix.

## Next Actions

1. **Apply temporary public buckets migration**
2. **Test with all roles**
3. **If successful**: Implement service role approach
4. **If still failing**: The issue is deeper (file paths, file existence, etc.)

This systematic approach will definitively identify and fix the issue.
