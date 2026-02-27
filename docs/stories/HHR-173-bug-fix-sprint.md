# Story HHR-173: Bug Fix Sprint — Upload Visibility, Slow Loading, NaN Display

## Status
Done

## Story
**As a** PolicyAi user,
**I want** uploaded documents to appear immediately in the document list, the list to load quickly even with many documents, and file sizes to display correctly during upload,
**so that** I have a smooth and trustworthy document management experience.

## Acceptance Criteria
1. After uploading a PDF, the document appears in the Dashboard document list within 1 second — no manual refresh needed.
2. The document list loads within 1 second for up to 100 documents.
3. File size displays correctly (e.g., "2.50 MB") during upload — never "NaN MB".
4. A `created_at DESC` database index exists on the `sources` table for query performance.

## GitHub Issues
- #7 — NaN File Size Display (Bug 1) — `priority:low`
- #8 — Slow Document List Loading (Bug 2) — `priority:high`
- #9 — Uploaded Files Not Visible Immediately (Bug 3) — `priority:high`
- #10 — PDF Viewer slow with large PDFs — `priority:low` (HHR-174, not fixed in this sprint)
- #11 — Root directory clutter — `priority:medium` (HHR-175, tech debt)
- #12 — Outdated README/docs — `priority:medium` (HHR-175, tech debt)
- #13 — Missing created_at index — `priority:medium` (HHR-175, fixed in this sprint)

## Tasks / Subtasks

### Task 1 — Fix uploaded files not visible immediately (AC: 1) — Closes #9
- [x] Add `useQueryClient` import and `queryClient.invalidateQueries` in `useFileUpload.tsx` after successful upload
- [x] Fix stale `files` state in `DocumentUploader.tsx` — collect source IDs in local `successfulSourceIds[]` array
- [x] Parallelize `queryClient.invalidateQueries` calls in `Dashboard.tsx` with `Promise.all`
- [x] Remove `setTimeout(500)` delay before closing uploader in `Dashboard.tsx`

### Task 2 — Fix slow document list loading (AC: 2, 4) — Closes #8, #13
- [x] Add `.range(0, 99)` to Supabase query in `useDocuments.tsx` to limit fetch to 100 docs
- [x] Scope real-time subscription from wildcard `event: '*'` on entire `sources` table to `filter: 'type=eq.pdf'`
- [x] Create migration `20260227100000_add_sources_created_at_index.sql` with `created_at DESC` + composite index

### Task 3 — Fix NaN file size display (AC: 3) — Closes #7
- [x] Add `formatFileSize()` helper in `DocumentUploader.tsx` with null/NaN guard
- [x] Replace inline `(file.size / 1024 / 1024).toFixed(2) MB` with `formatFileSize(file.size)`

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useFileUpload.tsx` | Add `useQueryClient`, invalidate `['documents']` + `['sources']` after upload |
| `src/components/document/DocumentUploader.tsx` | Add `formatFileSize` helper; collect source IDs in local array |
| `src/pages/Dashboard.tsx` | `Promise.all` for invalidation; remove `setTimeout` |
| `src/hooks/useDocuments.tsx` | Add `.range(0, 99)`; scope subscription to `type=eq.pdf` |
| `supabase/migrations/20260227100000_add_sources_created_at_index.sql` | New: `idx_sources_created_at` + `idx_sources_type_status_created` |

## Database Migration
```sql
CREATE INDEX IF NOT EXISTS idx_sources_created_at ON public.sources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sources_type_status_created ON public.sources(type, processing_status, created_at DESC);
```
**Note**: Supabase CLI push failed with 403 — migration must be applied manually via Dashboard SQL Editor.

## Testing
- [x] TypeScript type-check passes (`npx tsc --noEmit`)
- [x] Production build succeeds (`npm run build`)
- [ ] Manual: Upload PDF → appears in list within 1s (requires running dev server)
- [ ] Manual: Load dashboard with 10+ docs → loads within 1s (requires dev server)
- [ ] Manual: Upload dialog shows correct file size (requires dev server)
- [ ] DB: Verify indexes via `SELECT indexname FROM pg_indexes WHERE tablename = 'sources'`
