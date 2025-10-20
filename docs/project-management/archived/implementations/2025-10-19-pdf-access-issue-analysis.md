# PDF Access Issue - Root Cause Analysis

## Problem Statement
Administrator and Executive users are getting "Failed to load PDF file" errors with 400 status codes when trying to view PDFs. Only Board role users can successfully view PDFs.

## Investigation Steps Completed

### 1. Database Level Fixes ✅
- **Migration `20251019172407`**: Fixed NULL `target_role` and `pdf_storage_bucket` values
- **Migration `20251019173405`**: Ensured storage buckets exist
- **Migration `20251019173500`**: Granted execute permissions on helper functions

### 2. RLS Policies Created ✅
- `can_access_source()` function with role-based logic
- 7 RLS policies on `sources` table
- `can_access_pdf_storage()` function for storage access
- 8 storage policies on `storage.objects` table

## Root Cause Identified

The 400 errors are coming from the **Supabase Storage API**, not from RLS policy violations. This indicates one of the following issues:

### Potential Causes:

1. **Storage Policies Not Applied to Signed URL Generation**
   - Supabase Storage's `createSignedUrl()` method checks storage policies
   - The policies might not be applying correctly during URL generation
   - The `storage.can_access_pdf_storage()` function might not be executing properly

2. **Function Permission Issues**
   - The storage policy function needs proper grants to `authenticated` role
   - Function might be failing silently during policy evaluation

3. **Policy Evaluation Order**
   - Storage policies run BEFORE signed URL generation
   - If policy returns FALSE, the API returns 400 before checking RLS

## Recommended Solution

### Option A: Use Service Role for Signed URLs (Temporary Workaround)
Instead of relying on storage policies for signed URL generation, check access at the application level:

```typescript
// In Dashboard.tsx
const handleDocumentSelect = async (documentId: string) => {
  // 1. Check if user has access via sources table RLS (this works correctly)
  const { data, error } = await supabase
    .from('sources')
    .select('id, title, pdf_file_path, pdf_storage_bucket, target_role, uploaded_by_user_id')
    .eq('id', documentId)
    .single();

  if (error) {
    // RLS blocked this - user doesn't have access
    showAccessDeniedError();
    return;
  }

  // 2. If we got here, user has access. Create signed URL with service role
  const { data: urlData, error: urlError } = await supabase.storage
    .from(data.pdf_storage_bucket || 'sources')
    .createSignedUrl(data.pdf_file_path, 3600);

  // This should work because sources RLS already checked access
}
```

**Problem with this approach**: It bypasses storage policies, relying only on sources table RLS.

### Option B: Fix Storage Policies (Recommended)

The issue is likely that our storage policies are TOO restrictive or the function call is failing. Let's simplify:

1. **Remove complex storage policies**
2. **Rely on sources table RLS** (which IS working correctly)
3. **Make storage policies more permissive** - just check if source exists

```sql
-- Simplified storage policy: If source record exists and RLS allows it, allow storage access
CREATE POLICY "allow_access_if_source_accessible" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('sources', 'policy-documents')
    AND EXISTS (
      SELECT 1 FROM public.sources
      WHERE (pdf_file_path = name OR file_path = name)
    )
  );
```

This works because:
1. When user queries `sources` table, RLS filters what they can see
2. If they can see the source record, they got past RLS
3. Storage policy just checks "does this file belong to a source?"
4. If yes, allow access (user already proved they can access the source)

### Option C: Edge Function for PDF Access (Most Secure)

Create an Edge Function that:
1. Accepts document ID
2. Checks user's role and access (using get_user_role and can_access_source)
3. If allowed, retrieves file from storage with service role
4. Returns file stream to user

This gives us complete control over access logic.

## Next Steps

I recommend **Option B** - simplifying storage policies to rely on sources table RLS, which we know is working correctly.

### Implementation:

1. Create new migration to replace complex storage policies with simplified ones
2. Test with all roles
3. If this works, proceed with document management UI
4. If this doesn't work, implement Option C (Edge Function)

Would you like me to proceed with Option B?
