# PolicyAi - Known Issues and Bugs

**Last Updated**: 2026-02-27
**Environment**: Development
**Status**: Active Tracking

---

## 🐛 Active Bugs (Need Fixing)

_No active bugs at this time._

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
**Status**: Fixed (HHR-173) — migration created, pending manual application

**Description**:
`sources` table was missing `created_at DESC` index used by the document list query.

**Resolution**:
Migration `20260227100000_add_sources_created_at_index.sql` created with:
- `idx_sources_created_at` — `created_at DESC`
- `idx_sources_type_status_created` — composite `(type, processing_status, created_at DESC)`

**Note**: Must be applied manually via Supabase Dashboard SQL Editor (CLI returns 403).

**Priority**: Resolved

---

## ✅ Recently Fixed Issues

### Fixed (HHR-173) — 2026-02-27

#### HHR-173-F1: Uploaded Files Not Visible Immediately (Bug 3)
**Severity**: 🟠 **MODERATE - UX Issue**
**Fixed**: 2026-02-27 | **Branch**: HHR-173-bug-fixes | **Issue**: #9
**Root Cause**: `useFileUpload.tsx` did not call `queryClient.invalidateQueries` after upload. `Dashboard.tsx` had sequential invalidation + `setTimeout(500)` delay. `DocumentUploader.tsx` read stale React state for source IDs.
**Fix**: Added `useQueryClient` + `invalidateQueries` in `useFileUpload.tsx` after upload. Parallelized invalidation in `Dashboard.tsx` with `Promise.all`. Collected source IDs in local array in `DocumentUploader.tsx`. Removed `setTimeout` delay.
**Files**: `src/hooks/useFileUpload.tsx`, `src/pages/Dashboard.tsx`, `src/components/document/DocumentUploader.tsx`

---

#### HHR-173-F2: Slow Document List Loading (Bug 2)
**Severity**: 🟠 **MODERATE - Performance**
**Fixed**: 2026-02-27 | **Branch**: HHR-173-bug-fixes | **Issue**: #8
**Root Cause**: No server-side limit on query (fetched ALL documents). Missing `created_at DESC` index. Wildcard real-time subscription on entire `sources` table.
**Fix**: Added `.range(0, 99)` to limit fetch to 100 docs. Scoped real-time subscription to `filter: 'type=eq.pdf'`. Created migration for `created_at DESC` + composite index.
**Files**: `src/hooks/useDocuments.tsx`, `supabase/migrations/20260227100000_add_sources_created_at_index.sql`

---

#### HHR-173-F3: NaN File Size Display (Bug 1)
**Severity**: 🟡 **MINOR - UI Cosmetic**
**Fixed**: 2026-02-27 | **Branch**: HHR-173-bug-fixes | **Issue**: #7
**Root Cause**: `file.size` can be undefined when File object is cloned via `Object.assign`, causing `(undefined / 1024 / 1024).toFixed(2)` to produce "NaN".
**Fix**: Added `formatFileSize()` helper with null/NaN guard. Replaced inline calculation.
**Files**: `src/components/document/DocumentUploader.tsx`

---

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

**Total Active Bugs**: 0
- 🔴 Critical: 0
- 🟠 Moderate: 0
- 🟡 Minor: 0

**Recently Fixed**: 8 (5 critical in Oct 2025 + 3 moderate/minor in HHR-173)

**Technical Debt Items**: 2 (TD 1, TD 2 — TD 3 resolved in HHR-173)

**Bug Trend**: ⬇️ All known bugs resolved

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

_All tracked bugs have been resolved. See "Recently Fixed" section above._

---

**Maintained By**: Dev Team
**Review Frequency**: Weekly
**Last Major Update**: 2026-02-27 (Fixed 3 bugs in HHR-173 sprint)
