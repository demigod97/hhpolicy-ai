# Story HHR-172: Help Section Expansion — Bug Fixes & Enhancements

## Status
Done

## Story
**As a** PolicyAi user,
**I want** the Help section and related app pages to work correctly without UI glitches,
**so that** I can upload documents intuitively, download editable policy templates, and maintain a personalised profile with an avatar.

## Acceptance Criteria
1. The Upload page dialog does **not** auto-open when the user clicks the Upload nav tab — it opens only when the user explicitly clicks the "Upload Documents" button.
2. All 9 template files in the Help page Template Library are downloadable as editable `.docx` (Word) files, not PDFs.
3. The PDF preview dialog is removed from template cards since Word files cannot be previewed inline.
4. Users can upload a profile picture (avatar) from the Settings page via a camera icon overlay on the avatar.
5. The User Management page shows a meaningful error message (the actual API error) instead of a generic "Failed to fetch users" when the Edge Function returns an error.

## Tasks / Subtasks

### Task 1 — Fix Upload page auto-open (AC: 1)
- [x] Change `useState(true)` → `useState(false)` in `src/pages/Upload.tsx`
- [x] Add "Upload Documents" button inside the card to trigger the dialog
- [x] Move `DocumentUploader` outside the card to render at page level
- [x] Remove auto-reopen `setTimeout` in `handleUploadComplete`

### Task 2 — Replace PDF templates with Word documents (AC: 2, 3)
- [x] Install `docx` npm package (dev dependency)
- [x] Create `scripts/generate-templates.mjs` to generate all 9 `.docx` files
- [x] Run script → produces `public/templates/*.docx` for all 9 templates (policy/process/checklist × general/executive/board)
- [x] Update `src/components/help/TemplatePreviewGrid.tsx` — change all 9 file paths from `.pdf` → `.docx`, rename prop `pdfPath` → `filePath`
- [x] Update `src/components/help/TemplatePreviewCard.tsx` — remove PDF Preview Dialog + PDFViewer import, rename prop `pdfPath` → `filePath`, update download filename to `.docx`

### Task 3 — Avatar upload UI (AC: 4)
- [x] Add `useUploadAvatar` mutation to `src/hooks/useUserProfile.tsx` — uploads to Supabase `avatars` bucket, gets public URL, updates `profiles.avatar_url`
- [x] Update `src/components/settings/ProfileCard.tsx` — add `avatarUrl` and `onUploadAvatar` props, show `AvatarImage` when URL present, add camera icon overlay with hidden file input
- [x] Update `src/pages/Settings.tsx` — import and wire up `useUploadAvatar`, pass `avatarUrl` and `onUploadAvatar` to `ProfileCard`

### Task 4 — Improve User Management error message (AC: 5)
- [x] Update `src/hooks/useUserManagement.tsx` — toast `description` uses caught `error.message` rather than a hardcoded generic string

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Upload.tsx` | Fix auto-open; add button trigger; move uploader to page level |
| `src/hooks/useUserProfile.tsx` | Add `useUploadAvatar` mutation |
| `src/components/settings/ProfileCard.tsx` | Add avatar display + camera upload overlay |
| `src/pages/Settings.tsx` | Wire up avatar upload hook and props |
| `src/hooks/useUserManagement.tsx` | Improve error toast message |
| `src/components/help/TemplatePreviewCard.tsx` | Remove PDF preview; add Word download; rename prop |
| `src/components/help/TemplatePreviewGrid.tsx` | Update 9 file paths `.pdf` → `.docx`; rename prop |
| `public/templates/*.docx` | 9 new Word template files generated |
| `scripts/generate-templates.mjs` | One-time script to generate `.docx` templates |
| `package.json` | Added `docx` dev dependency |

## Dev Notes

### Avatar Upload — Supabase Storage Requirement
The avatar upload uses Supabase Storage bucket `avatars`. This bucket must exist and be configured as **public** before the upload will work in production:
```sql
-- Run in Supabase dashboard → SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```
RLS policies for the avatars bucket should also be added (INSERT/SELECT for authenticated users).

### Template Generation
Templates can be regenerated at any time by running:
```
node scripts/generate-templates.mjs
```
Each template includes structured sections with placeholder text. Template content can be customised in `scripts/generate-templates.mjs`.

### User Management Root Cause (Issue 1)
The "Failed to fetch users" error is primarily a backend issue. The `get-users` Edge Function returns HTTP 403 if:
- The current user has no entry in the `user_roles` table, OR
- The Edge Function is not deployed to Supabase
Frontend now surfaces the actual error message to help debug these scenarios.

## QA Verification Checklist

- [ ] Navigate to `/upload` — dialog does NOT open automatically
- [ ] Click "Upload Documents" button — dialog opens
- [ ] Navigate to Help → Template Library — cards show "Download Word Template" (no Preview button)
- [ ] Click "Download Word Template" — `.docx` file downloads
- [ ] Navigate to Settings — avatar area shows camera icon overlay on hover
- [ ] Click camera icon → select image → avatar updates
- [ ] Navigate to User Management with user lacking `user_roles` entry — specific API error shown in toast

## Branch
`HHR-172-help-section-expansion`

## Completed
2026-02-27
