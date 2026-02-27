# PolicyAi - Known Issues and Bugs

**Last Updated**: 2025-10-20
**Environment**: Development
**Status**: Active Tracking

---

## 🐛 Active Bugs (Need Fixing)

### Bug 1: NaN File Size Display During Upload
**Severity**: 🟡 **MINOR - UI Cosmetic**
**Status**: Open
**Reported**: 2025-10-20

**Description**:
When uploading documents, the file size displays as "NaN MB" instead of showing the actual file size (e.g., "2.5 MB").

**Location**:
- Component: `src/components/document/DocumentUploader.tsx`
- Likely cause: File size calculation issue in upload progress display

**Steps to Reproduce**:
1. Open Dashboard
2. Click "Upload Documents"
3. Select a PDF file
4. Observe file size display shows "NaN MB"

**Expected Behavior**:
Display actual file size: "2.5 MB" or "1.2 MB"

**Actual Behavior**:
Displays "NaN MB" for all files

**Impact**:
- User cannot see actual file size during upload
- Cosmetic issue only - does not affect upload functionality
- Upload still completes successfully

**Workaround**:
None needed - upload works despite display issue

**Priority**: Low (cosmetic)
**Effort**: Small (1-2 hours)

**Technical Investigation Needed**:
```typescript
// In DocumentUploader.tsx, check file.size calculation:
<p className="text-xs text-gray-500">
  {(file.size / 1024 / 1024).toFixed(2)} MB  // This line may be the issue
</p>
```

---

### Bug 2: Slow Document List Loading (10+ Documents)
**Severity**: 🟠 **MODERATE - Performance**
**Status**: Open
**Reported**: 2025-10-20

**Description**:
When 10 or more documents are uploaded, the document list takes a long time to load on the Dashboard. Users may see loading spinners for 3-5 seconds.

**Location**:
- Page: `src/pages/Dashboard.tsx`
- Hook: `src/hooks/useDocuments.tsx`
- Database: `sources` table query

**Steps to Reproduce**:
1. Upload 10+ PDF documents
2. Navigate to Dashboard
3. Observe loading time for document grid

**Expected Behavior**:
Document list loads within 1 second

**Actual Behavior**:
Document list takes 3-5 seconds to load with 10+ documents

**Impact**:
- Poor user experience with larger document libraries
- Scaling concern as document count grows
- May indicate inefficient query or rendering

**Possible Causes**:
1. Large PDF metadata/content being fetched unnecessarily
2. Missing database indexes on `sources` table
3. Real-time subscription overhead
4. React rendering inefficiency (not virtualized)

**Workaround**:
- Keep document count low during testing
- Reload page to refresh list

**Priority**: Medium (affects UX at scale)
**Effort**: Medium (4-8 hours investigation + optimization)

**Suggested Fixes**:
1. **Add pagination**: Show 20 documents per page
2. **Optimize query**: Only fetch necessary fields (not full content)
3. **Add database indexes**: Index `created_at`, `updated_at`, `user_id`
4. **Implement virtualization**: Use `react-window` or `react-virtual` for long lists
5. **Lazy load document cards**: Load metadata on-demand

**SQL Investigation**:
```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT id, title, type, processing_status, created_at, metadata
FROM sources
WHERE notebook_id = 'xxx'
ORDER BY created_at DESC;

-- Check for missing indexes
SELECT * FROM pg_indexes WHERE tablename = 'sources';
```

---

### Bug 3: Previously Uploaded Files Not Visible Immediately
**Severity**: 🟠 **MODERATE - UX Issue**
**Status**: Open
**Reported**: 2025-10-20

**Description**:
After uploading a document successfully, the document does not immediately appear in the document list. User must manually refresh the page or wait several seconds for the real-time subscription to update.

**Location**:
- Component: `src/components/document/DocumentUploader.tsx`
- Hook: `src/hooks/useDocuments.tsx`
- Dashboard: `src/pages/Dashboard.tsx`

**Steps to Reproduce**:
1. Navigate to Dashboard
2. Upload a new PDF document
3. Wait for upload to complete (see "Upload Complete" toast)
4. Observe document list does NOT immediately show new document
5. Refresh page manually → document now appears

**Expected Behavior**:
- New document appears in list immediately after upload completes
- No manual refresh needed

**Actual Behavior**:
- Document not visible until page refresh or real-time subscription fires
- Delay can be 2-5 seconds

**Impact**:
- Confusing user experience
- Users think upload failed
- Requires manual page refresh

**Root Cause (Suspected)**:
1. **Query invalidation missing**: React Query cache not invalidated after upload
2. **Real-time subscription delay**: Supabase Realtime has 1-2 second propagation delay
3. **Optimistic update missing**: Should add document to UI immediately, then confirm

**Workaround**:
- Manually refresh page after upload
- Wait 3-5 seconds for real-time update

**Priority**: Medium (affects user confidence)
**Effort**: Medium (2-4 hours)

**Suggested Fix**:
```typescript
// In DocumentUploader.tsx or parent component:
const { uploadFileAndProcess } = useFileUpload();
const queryClient = useQueryClient();

const handleUploadComplete = async (sourceIds: string[]) => {
  // Option 1: Invalidate query to refetch
  await queryClient.invalidateQueries(['documents', notebookId]);

  // Option 2: Optimistic update
  queryClient.setQueryData(['documents', notebookId], (old) => {
    return [...old, ...newDocuments];
  });

  // Close dialog after query updated
  setOpen(false);
};
```

---

## ⚠️ Performance Concerns

### Perf 1: PDF Viewer Performance with Large PDFs
**Severity**: 🟡 **MINOR - Performance**
**Status**: Monitoring

**Description**:
PDF viewer may be slow with very large PDFs (50+ pages, 10+ MB files).

**Impact**:
- Not yet tested with production-scale documents
- May need optimization for large files

**Suggested Mitigation**:
- Implement lazy loading of PDF pages
- Show loading indicators for each page
- Consider page-level virtualization
- Test with 100+ page documents

**Priority**: Low (not yet observed in testing)

---

## 🔧 Technical Debt

### TD 1: Root Directory Clutter
**Severity**: 🟠 **MODERATE - Maintainability**
**Status**: In Progress (cleanup plan created)

**Description**:
55+ markdown files and 14 SQL files in project root make navigation and maintenance difficult.

**Impact**:
- Hard to find relevant documentation
- Confusing for new developers
- Unclear project state

**Resolution**:
- PROJECT-CLEANUP-PLAN.md created
- Phase 1 (Documentation Audit) in progress

---

### TD 2: Outdated Core Documentation
**Severity**: 🟠 **MODERATE - Onboarding**
**Status**: In Progress (Phase 1 audit)

**Description**:
- README.md still references "InsightsLM" and removed features
- docs/prd.md describes features not implemented
- docs/architecure.md (typo!) is outdated vs docs/architecture/

**Impact**:
- Confuses new developers
- Unclear what features actually exist
- Misalignment between docs and code

**Resolution**:
- Phase 1: Audit complete, creating current state docs
- Phase 4: Update README, PRD, Architecture (planned)

---

### TD 3: Missing Database Indexes
**Severity**: 🟡 **MINOR - Performance**
**Status**: Investigation Needed

**Description**:
`sources` table may be missing performance indexes on commonly queried columns.

**Likely Missing Indexes**:
- `sources.notebook_id` (for filtering by notebook)
- `sources.created_at` (for sorting)
- `sources.processing_status` (for filtering by status)
- `sources.uploaded_by_user_id` (for RLS queries)

**Investigation**:
```sql
-- Check existing indexes
SELECT * FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'sources';
```

**Priority**: Low (performance concern at scale)

---

## ✅ Recently Fixed Issues

### Fixed (HHR-172) — 2026-02-27

#### HHR-172-F1: Upload Dialog Auto-Opens on Tab Click
**Severity**: 🟠 **MODERATE - UX Bug**
**Fixed**: 2026-02-27 | **Branch**: HHR-172-help-section-expansion
**Root Cause**: `useState(true)` in `Upload.tsx:17` caused the dialog to mount open.
**Fix**: Changed to `useState(false)`, added an explicit "Upload Documents" button trigger, moved `DocumentUploader` outside the card. Auto-reopen `setTimeout` also removed.
**Files**: `src/pages/Upload.tsx`

---

#### HHR-172-F2: Template Library Serves Uneditable PDFs
**Severity**: 🟠 **MODERATE - Feature Gap**
**Fixed**: 2026-02-27 | **Branch**: HHR-172-help-section-expansion
**Root Cause**: All 9 templates in `public/templates/` were PDFs — not editable by users.
**Fix**: Generated 9 `.docx` Word documents via `scripts/generate-templates.mjs` (uses `docx` package). Updated `TemplatePreviewGrid.tsx` paths, renamed `pdfPath` → `filePath` prop, removed PDF preview dialog from `TemplatePreviewCard.tsx`. Cards now show a single "Download Word Template" button.
**Files**: `src/components/help/TemplatePreviewCard.tsx`, `src/components/help/TemplatePreviewGrid.tsx`, `public/templates/*.docx`, `scripts/generate-templates.mjs`

---

#### HHR-172-F3: No Avatar Upload UI in Settings
**Severity**: 🟡 **MINOR - Missing Feature**
**Fixed**: 2026-02-27 | **Branch**: HHR-172-help-section-expansion
**Root Cause**: `avatar_url` existed in DB schema but no upload UI or Supabase Storage mutation was implemented.
**Fix**: Added `useUploadAvatar` mutation (uploads to `avatars` bucket, updates `profiles.avatar_url`). Added camera icon overlay + hidden file input on avatar in `ProfileCard`. Wired up in `Settings.tsx`.
**Pre-requisite**: `avatars` Supabase Storage bucket must exist and be public.
**Files**: `src/hooks/useUserProfile.tsx`, `src/components/settings/ProfileCard.tsx`, `src/pages/Settings.tsx`

---

#### HHR-172-F4: User Management Shows Generic Error Message
**Severity**: 🟡 **MINOR - DX/Debug**
**Fixed**: 2026-02-27 | **Branch**: HHR-172-help-section-expansion
**Root Cause**: Toast `description` hardcoded to generic string instead of actual API error.
**Fix**: Changed toast description to use `error.message` from caught error.
**Note**: Root cause of actual user management failure is likely a backend issue — Edge Function not deployed or user missing `user_roles` entry.
**Files**: `src/hooks/useUserManagement.tsx`

---

### Fixed 1: White Screen Crash on Upload Error
**Severity**: 🔴 **CRITICAL**
**Fixed**: 2025-10-20
**Story**: 1.14.1

**Description**:
Upload errors caused React to crash with white screen due to `file.type` being undefined.

**Root Cause**:
`getFileIcon(file.type)` called `.startsWith()` on undefined value.

**Fix**:
```typescript
// In DocumentUploader.tsx
const getFileIcon = (fileType: string | undefined) => {
  if (!fileType) return File;  // Added null check
  if (fileType.startsWith('image/')) return ImageIcon;
  if (fileType.includes('pdf')) return FileText;
  return File;
};
```

**Files Changed**:
- `src/components/document/DocumentUploader.tsx:56`

---

### Fixed 2: Storage Upload Blocked (403 Unauthorized)
**Severity**: 🔴 **CRITICAL - Blocker**
**Fixed**: 2025-10-20
**Story**: 1.14.1

**Description**:
All file uploads failed with `403 Unauthorized` error. No documents could be uploaded.

**Root Cause**:
`storage.objects` table had RLS enabled but ZERO policies existed, blocking all uploads.

**Fix**:
Created migration `20251020043506_fix_storage_policies_for_sources_bucket.sql` with 4 policies:
- INSERT policy for authenticated users
- SELECT policy for authenticated users
- UPDATE policy for authenticated users
- DELETE policy for authenticated users

**Files Changed**:
- `supabase/migrations/20251020043506_fix_storage_policies_for_sources_bucket.sql`

---

### Fixed 3: Source Creation RLS Violation
**Severity**: 🔴 **CRITICAL - Blocker**
**Fixed**: 2025-10-20
**Story**: 1.14.1

**Description**:
Creating source record failed with `403 Unauthorized` RLS violation.

**Root Cause**:
Missing `uploaded_by_user_id` field in INSERT statement.

**Fix**:
```typescript
// In useFileUpload.tsx
const { data: sourceData, error: sourceError} = await supabase
  .from('sources')
  .insert({
    notebook_id: notebookId,
    type: sourceType,
    title: file.name.replace(/\.[^/.]+$/, ''),
    processing_status: 'pending',
    target_role: 'administrator',
    uploaded_by_user_id: user.id,  // ADDED THIS LINE
    metadata: { /* ... */ },
  })
```

**Files Changed**:
- `src/hooks/useFileUpload.tsx:49`

---

### Fixed 4: Edge Function Not Called
**Severity**: 🔴 **CRITICAL - Blocker**
**Fixed**: 2025-10-20
**Story**: 1.14.1

**Description**:
Documents uploaded but never processed. Edge function call was commented out.

**Root Cause**:
Edge function invocation code was commented out during testing and never re-enabled.

**Fix**:
Un-commented lines 115-133 in `useFileUpload.tsx` to invoke `process-document` edge function.

**Files Changed**:
- `src/hooks/useFileUpload.tsx:115-133`

---

### Fixed 5: Wrong Processing Status
**Severity**: 🟠 **MODERATE - Logic Error**
**Fixed**: 2025-10-20
**Story**: 1.14.1

**Description**:
Documents marked as 'completed' immediately after upload, before actual processing.

**Root Cause**:
Status set to 'completed' instead of 'processing' after file upload.

**Fix**:
```typescript
// Changed from:
processing_status: 'completed'

// To:
processing_status: 'processing'
```

**Files Changed**:
- `src/hooks/useFileUpload.tsx:103`

---

## 📊 Bug Statistics

**Total Active Bugs**: 3
- 🔴 Critical: 0
- 🟠 Moderate: 2 (Bugs 2, 3)
- 🟡 Minor: 1 (Bug 1)

**Recently Fixed**: 5 (all critical/blocker issues)

**Technical Debt Items**: 3

**Bug Trend**: ⬇️ Decreasing (5 critical bugs fixed in last session)

---

## 🔍 Testing Gaps

### Areas Needing More Testing

1. **Large-Scale Document Management**
   - Test with 100+ documents
   - Test with very large PDFs (50+ pages, 20+ MB)
   - Performance benchmarking

2. **Multi-User Scenarios**
   - Concurrent uploads
   - Real-time subscription conflicts
   - RLS policy edge cases

3. **Error Handling**
   - Corrupted PDF files
   - Network failures during upload
   - N8N webhook timeout scenarios
   - Edge function failures

4. **Browser Compatibility**
   - Test on Safari, Firefox, Edge
   - Mobile browser testing
   - Accessibility testing

---

## 🐛 How to Report a Bug

**File Location**: `docs/current/known-issues.md`

**Bug Report Template**:
```markdown
### Bug X: [Short Description]
**Severity**: 🔴/🟠/🟡 **CRITICAL/MODERATE/MINOR**
**Status**: Open
**Reported**: [Date]

**Description**: [What's wrong]

**Location**: [File path]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**: [What should happen]
**Actual Behavior**: [What actually happens]

**Impact**: [How it affects users]

**Workaround**: [Temporary fix if available]

**Priority**: [High/Medium/Low]
**Effort**: [Hours estimate]
```

---

## 📈 Priority Matrix

| Bug/Issue | Severity | User Impact | Effort | Priority |
|-----------|----------|-------------|--------|----------|
| Bug 1: NaN file size | 🟡 Minor | Low | Small | Low |
| Bug 2: Slow loading | 🟠 Moderate | Medium | Medium | **High** |
| Bug 3: Visibility delay | 🟠 Moderate | Medium | Medium | **High** |

**Recommended Fix Order**:
1. **Bug 3** (visibility delay) - Medium effort, high user impact
2. **Bug 2** (slow loading) - Medium effort, scaling concern
3. **Bug 1** (NaN display) - Small effort, cosmetic

---

**Maintained By**: Dev Team
**Review Frequency**: Weekly
**Last Major Update**: 2025-10-20 (Fixed 5 critical bugs)
