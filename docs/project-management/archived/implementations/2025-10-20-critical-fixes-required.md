# Critical Fixes Required - Upload & Chat Issues

**Date**: 2025-10-20
**Status**: 🔴 CRITICAL - Multiple Issues Identified

---

## 🐛 Issues Identified

### 1. **Edge Functions Not Configured** 🔴 CRITICAL

**Problem**: Edge functions `process-document` and `process-document-callback` require environment variables that are NOT set.

**Impact**:
- Documents upload to `sources` table ✅
- Files upload to storage ✅
- But NO processing happens ❌
- Documents stuck in "processing" status forever ❌

**Required Environment Variables**:
```bash
DOCUMENT_PROCESSING_WEBHOOK_URL=<your-n8n-webhook-url>
NOTEBOOK_GENERATION_AUTH=<optional-auth-header>
```

**Solution**:
```bash
# Set in Supabase dashboard or via CLI
supabase secrets set DOCUMENT_PROCESSING_WEBHOOK_URL=https://your-n8n-instance.com/webhook/process-document
```

**Alternative (For Testing)**: Skip edge function and mark documents as completed manually:
```sql
-- Mark all documents as completed for testing
UPDATE sources
SET processing_status = 'completed'
WHERE processing_status IN ('pending', 'processing');
```

---

### 2. **0 Sources in Chat** 🔴 CRITICAL

**Problem**: Chat shows "0 sources" even after auto-linking because documents are stuck in "processing" status, not "completed".

**Auto-Link Logic** (Current):
```typescript
// src/hooks/useChatSession.tsx
const { data: documents } = await supabase
  .from('sources')
  .select('id')
  .eq('type', 'pdf')
  .eq('processing_status', 'completed'); // ❌ Only links completed docs
```

**Why It Fails**:
- Documents are uploaded ✅
- Documents are linked to chat ✅
- But documents are in "processing" status (not "completed") ❌
- Auto-link only links "completed" documents ❌

**Solution Options**:

**Option A**: Remove status filter (allow all documents):
```typescript
const { data: documents } = await supabase
  .from('sources')
  .select('id')
  .eq('type', 'pdf');
  // No status filter - link all documents
```

**Option B**: Mark documents as completed immediately (for testing):
```typescript
// After upload, update status
await supabase
  .from('sources')
  .update({ processing_status: 'completed' })
  .eq('id', sourceId);
```

---

### 3. **Upload Limit (5 Documents)** 🟡 MEDIUM

**Problem**: Can only upload 5 documents at once.

**Current Limit**:
```typescript
// Likely in DocumentUploader component
const MAX_FILES = 5;
```

**Impact**: Inconvenient for bulk uploads

**Solution**: Increase or remove limit
```typescript
const MAX_FILES = 20; // Or remove limit entirely
```

---

### 4. **White Screen After Upload** 🟡 MEDIUM

**Problem**: After uploading documents, page shows white screen, requiring manual refresh.

**Root Cause**: Missing navigation/state update after upload completion.

**Current Flow**:
```
Upload → Success → ??? (White Screen) → Manual Refresh
```

**Expected Flow**:
```
Upload → Success → Navigate to Dashboard → Auto-refresh document list
```

**Solution**: Add proper navigation in `DocumentUploader` onSuccess handler:
```typescript
onUploadComplete={(sourceIds) => {
  // Invalidate queries to refresh document list
  queryClient.invalidateQueries(['sources']);
  queryClient.invalidateQueries(['documents']);

  // Stay on current page (don't navigate away)
  // Or navigate to dashboard if needed
  // navigate('/dashboard');

  // Close upload dialog
  setShowUploader(false);
}}
```

---

### 5. **No Error Handling for Edge Function Failures** 🟡 MEDIUM

**Problem**: If edge function fails, user sees generic error, not specific issue.

**Current**:
```typescript
if (processError) {
  console.error('Process document error:', processError);
  throw new Error(`Processing failed: ${processError.message}`);
}
```

**Better**:
```typescript
if (processError) {
  console.error('Process document error:', processError);

  // Check if edge function doesn't exist
  if (processError.message.includes('not found') || processError.message.includes('404')) {
    toast({
      title: 'Processing Unavailable',
      description: 'Document processing is not configured. Documents will be available after manual processing.',
      variant: 'warning',
    });

    // Mark as completed for now (allows chat to work)
    await supabase
      .from('sources')
      .update({ processing_status: 'completed' })
      .eq('id', sourceId);

    return { success: true, sourceId, filePath };
  }

  throw new Error(`Processing failed: ${processError.message}`);
}
```

---

## 🔧 Quick Fixes (Priority Order)

### Fix 1: Enable Chat Immediately (Highest Priority)

**Update**: `src/hooks/useChatSession.tsx`

**Change**:
```typescript
// Line 66-70
const { data: documents, error: docsError } = await supabase
  .from('sources')
  .select('id')
  .eq('type', 'pdf');
  // REMOVED: .eq('processing_status', 'completed')
```

**Impact**: Chat will work with ALL documents, not just completed ones.

---

### Fix 2: Skip Edge Function for Testing

**Update**: `src/hooks/useFileUpload.tsx`

**Change**:
```typescript
// After Step 3 (around line 103)
const { error: updateError } = await supabase
  .from('sources')
  .update({
    file_path: filePath,
    pdf_file_path: sourceType === 'pdf' ? filePath : null,
    pdf_storage_bucket: 'sources',
    pdf_file_size: file.size,
    processing_status: 'completed' // Changed from 'processing'
  })
  .eq('id', sourceId);

// SKIP Step 4 (edge function call) for now
// Comment out lines 111-135

onProgress?.(100);

toast({
  title: 'Upload Successful',
  description: `${file.name} has been uploaded successfully.`,
});

return {
  success: true,
  sourceId,
  filePath,
};
```

**Impact**: Documents upload and marked as completed immediately. Chat works!

---

### Fix 3: Increase Upload Limit

**Find and Update**: `src/components/document/DocumentUploader.tsx`

**Change**:
```typescript
const MAX_FILES = 20; // Increased from 5
```

---

### Fix 4: Fix White Screen

**Update**: `src/components/document/DocumentUploader.tsx` or wherever upload complete is handled

**Add**:
```typescript
const handleUploadComplete = (sourceIds: string[]) => {
  // Invalidate queries to refresh data
  queryClient.invalidateQueries({ queryKey: ['sources'] });
  queryClient.invalidateQueries({ queryKey: ['documents'] });
  queryClient.invalidateQueries({ queryKey: ['document-stats'] });

  // Close dialog
  setShowUploader(false);

  // Show success message
  toast({
    title: 'Upload Complete',
    description: `${sourceIds.length} document(s) uploaded successfully.`,
  });
};
```

---

## 📋 Implementation Plan

### Phase 1: Quick Win (10 minutes)

1. **Remove processing_status filter** from auto-link
   - File: `src/hooks/useChatSession.tsx`
   - Line: 66-70
   - Change: Remove `.eq('processing_status', 'completed')`

2. **Mark uploads as completed** immediately
   - File: `src/hooks/useFileUpload.tsx`
   - Line: 101
   - Change: `processing_status: 'completed'`
   - Comment out: Lines 111-135 (edge function call)

**Result**: Chat works immediately! 🎉

---

### Phase 2: Upload Improvements (20 minutes)

3. **Increase upload limit**
   - File: `src/components/document/DocumentUploader.tsx`
   - Find: `MAX_FILES = 5`
   - Change: `MAX_FILES = 20`

4. **Fix white screen**
   - File: `src/components/document/DocumentUploader.tsx`
   - Add: Query invalidation on upload complete
   - Add: Proper error boundaries

5. **Better error messages**
   - File: `src/hooks/useFileUpload.tsx`
   - Add: Specific error handling for edge function failures

---

### Phase 3: Production Ready (Later)

6. **Configure Edge Functions**
   - Set up N8N webhooks
   - Add environment variables
   - Re-enable edge function calls
   - Test document processing pipeline

7. **Add Processing Queue**
   - Show processing status in UI
   - Retry failed processing
   - Manual retry button

---

## 🧪 Testing After Fixes

### Test 1: Upload Documents
1. Upload 5 PDFs
2. **Verify**: No white screen
3. **Verify**: Documents appear in dashboard
4. **Verify**: Processing status = "completed"

### Test 2: Create Chat
1. Click "New Chat"
2. **Verify**: Shows "5 sources" (not 0)
3. **Verify**: Sources sidebar lists documents

### Test 3: Send Message
1. Type message in chat
2. **Verify**: Can send (not blocked by "0 sources")
3. **Verify**: N8N processes message
4. **Verify**: AI responds

---

## 📊 Root Cause Analysis

### Why This Happened

1. **Edge Function Dependency**: Code assumes edge functions are deployed and configured
2. **Status Filter**: Auto-link only includes "completed" documents
3. **Missing Config**: `DOCUMENT_PROCESSING_WEBHOOK_URL` not set
4. **No Fallback**: No graceful degradation when edge functions unavailable

### Lessons Learned

1. **Always provide fallbacks** for external dependencies
2. **Don't filter by processing status** for critical features
3. **Test without edge functions** (mock the processing)
4. **Better error messages** for configuration issues

---

## 🎯 Recommended Immediate Action

**For Testing/Development**:
1. Apply Fix 1 (remove status filter)
2. Apply Fix 2 (skip edge function, mark as completed)
3. Refresh browser
4. Test chat creation
5. Upload documents
6. Create new chat
7. Send messages

**For Production**:
1. Configure N8N webhooks
2. Set environment variables
3. Deploy edge functions
4. Re-enable processing pipeline
5. Test end-to-end flow

---

**Status**: Document created, fixes ready to implement
**Priority**: 🔴 CRITICAL - Implement immediately
**Estimated Time**: 30 minutes for quick fixes
