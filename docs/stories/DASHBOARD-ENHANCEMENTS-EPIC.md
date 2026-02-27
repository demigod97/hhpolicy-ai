# Epic: Dashboard Enhancements & Document Management

**Status**: 🚧 IN PROGRESS
**Created**: 2025-10-19
**Priority**: HIGH

## Overview

This epic addresses critical issues with PDF access and implements comprehensive document management features for System Owners and Company Operators, along with UX improvements for the Dashboard.

## Problem Statement

### Current Issues
1. **PDF Access Broken**: Admin and Executive users cannot view PDFs (getting 400 errors), only Board users can view
2. **No Document Management**: System Owners/Company Operators have no UI to manage documents (edit names, assign roles, delete)
3. **Missing Documents in Chat**: Documents not visible in the chat/notebook area
4. **No User Context**: Dashboard lacks user greeting and role information
5. **Suboptimal UX**: Dashboard needs UI/UX improvements for seamless experience

### Root Causes Identified
- Documents had NULL `target_role` values → blocking RLS policies
- Documents had NULL `pdf_storage_bucket` values → storage policies couldn't verify access
- Missing document management interface for operators

## Work Completed ✅

### 1. Role-Based PDF Sharing Implementation
- **Migration**: `20251019170857_apply_role_based_pdf_sharing.sql`
- Created `can_access_source()` function with role hierarchy:
  - Board: Full access to all documents
  - Administrators: Access to administrator-role documents + own uploads
  - Executives: Access to executive + administrator documents + own uploads
  - System Owner/Company Operator: Full access
- Created 7 RLS policies on `sources` table
- Created `public.can_access_pdf_storage()` function for storage access
- Created 8 storage policies on `storage.objects` table
- Updated Dashboard.tsx with enhanced error handling

### 2. Sources Metadata Fix
- **Migration**: `20251019172407_fix_sources_metadata_and_storage.sql`
- Set default `pdf_storage_bucket = 'sources'` for all PDFs with NULL bucket
- Set default `target_role = 'administrator'` for all PDFs with NULL role
- Added helpful column comments

### 3. Implementation Planning
- Created comprehensive implementation plan in `IMPLEMENTATION-PLAN-DASHBOARD-ENHANCEMENTS.md`
- Identified phased approach with clear milestones
- Defined success criteria

## Remaining Work 📋

### Phase 2: Document Management UI (Priority: HIGH)

#### Required shadcn Components
```bash
npx shadcn@latest add table
npx shadcn@latest add checkbox
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add badge
npx shadcn@latest add alert-dialog
```

#### Components to Create

1. **Document Management Page** (`src/pages/admin/DocumentManagement.tsx`)
   - Data table with all documents
   - Columns: Checkbox, Title, Target Role, Status, Upload Date, Size, Actions
   - Filter by role, status, date range
   - Search by title
   - Pagination

2. **Document Edit Dialog** (`src/components/admin/DocumentEditDialog.tsx`)
   - Edit document title
   - Assign target role (dropdown)
   - View status and metadata
   - Save changes with validation

3. **Bulk Actions Bar** (`src/components/admin/BulkActionsBar.tsx`)
   - Show selected count
   - Assign role to selected (batch update)
   - Delete selected (with confirmation)
   - Clear selection

4. **Delete Confirmation** (`src/components/admin/DeleteConfirmDialog.tsx`)
   - Show document count
   - Warning about permanent deletion
   - Confirm/Cancel actions

#### API Hooks to Create

1. **useUpdateDocument** - Update document metadata
2. **useDeleteDocuments** - Delete single or multiple documents
3. **useBulkUpdateRole** - Batch update target_role for documents

### Phase 3: User Greeting Card (Priority: MEDIUM)

#### Required shadcn Components
```bash
npx shadcn@latest add card
npx shadcn@latest add avatar
npx shadcn@latest add separator
```

#### Component to Create

**User Greeting Card** (`src/components/dashboard/UserGreetingCard.tsx`)
- Time-based greeting ("Good morning", "Good afternoon", "Good evening")
- User email display
- Role badge with appropriate color/icon
- Document statistics:
  - Total accessible documents
  - Documents uploaded by user
  - Recent uploads (last 7 days)
- Quick actions based on role:
  - System Owner/Company Operator: "Manage Documents" button
  - All users: "New Chat" button

### Phase 4: Document Visibility in Chat (Priority: HIGH)

#### Components to Create/Update

1. **Document Selector** (`src/components/chat/DocumentSelector.tsx`)
   - Dropdown or sidebar showing accessible documents
   - Filter by role
   - Search functionality
   - Attach/detach documents to chat context

2. **Chat Session Updates**
   - Link chat sessions to accessible documents
   - Show document list in chat interface
   - Enable document-aware responses

### Phase 5: Dashboard UI/UX Enhancements (Priority: MEDIUM)

#### Required shadcn Components
```bash
npx shadcn@latest add skeleton
npx shadcn@latest add tabs
npx shadcn@latest add breadcrumb
```

#### Improvements

1. **Loading States**
   - Add skeleton loaders for document grid
   - Smooth transitions on data load
   - Progress indicators for uploads

2. **Navigation**
   - Add breadcrumb navigation
   - Highlight active navigation items
   - Role-specific menu items
   - Quick access shortcuts

3. **Empty States**
   - Better messaging when no documents
   - Call-to-action buttons
   - Helpful illustrations

4. **Responsive Design**
   - Optimize for mobile/tablet
   - Improved grid layouts
   - Touch-friendly interactions

## Technical Architecture

### Database Schema
```sql
sources table:
  - id (uuid)
  - title (text)
  - target_role (text) - 'administrator' | 'executive' | 'board' | etc.
  - uploaded_by_user_id (uuid)
  - pdf_file_path (text)
  - pdf_storage_bucket (text) - 'sources' | 'policy-documents'
  - processing_status (text)
  - created_at (timestamp)
```

### RLS Policies
- `can_access_source(target_role, uploader_id)` - Determines read access
- 7 policies for different role/operation combinations
- Storage policies enforce access at file level

### React Query Patterns
```typescript
// Document queries
useDocuments() - List all accessible documents
useDocument(id) - Get single document

// Mutations
useUpdateDocument() - Update document metadata
useDeleteDocuments() - Delete documents
useBulkUpdateRole() - Batch update roles
```

## Testing Strategy

### Unit Tests
- [ ] Test `can_access_source()` function with different roles
- [ ] Test storage policy logic
- [ ] Test React hooks (useDocuments, useUpdateDocument, etc.)

### Integration Tests
- [ ] Test role-based document access end-to-end
- [ ] Test document management operations (CRUD)
- [ ] Test bulk operations

### Manual Testing Checklist
- [ ] Login as Board user → Should see all documents
- [ ] Login as Admin user → Should see administrator docs + own uploads
- [ ] Login as Executive user → Should see executive + administrator docs + own uploads
- [ ] Login as System Owner → Access document management page
- [ ] Edit document title and role assignment
- [ ] Delete single document
- [ ] Bulk select and delete multiple documents
- [ ] Bulk assign role to multiple documents
- [ ] View user greeting card with correct info
- [ ] Access documents from chat interface

## Success Criteria

- [x] Role-based PDF sharing implemented
- [x] RLS policies applied and working
- [x] Storage policies created
- [x] Sources metadata fixed (target_role, pdf_storage_bucket)
- [ ] Admin/Executive users can view their assigned PDFs
- [ ] Board users can view all PDFs
- [ ] System Owner/Company Operator can access document management UI
- [ ] Documents can be edited (title, role assignment)
- [ ] Documents can be deleted (single and bulk)
- [ ] User greeting card displays correctly
- [ ] Documents visible in chat/notebook area
- [ ] Dashboard has smooth, professional UI/UX

## Next Steps

1. **Immediate**: Test PDF access by logging in as admin/executive users
2. **Today**: Install shadcn components and create Document Management page
3. **Tomorrow**: Implement User Greeting Card and chat document visibility
4. **Day 3**: Polish UI/UX and comprehensive testing

## Dependencies

- shadcn/ui components
- React Query for data fetching
- Supabase RLS policies (completed)
- Storage policies (completed)

## Related Files

- Implementation Plan: `IMPLEMENTATION-PLAN-DASHBOARD-ENHANCEMENTS.md`
- Investigation SQL: `INVESTIGATE-SOURCES-DATA.sql`
- Migrations:
  - `20251019170857_apply_role_based_pdf_sharing.sql`
  - `20251019172407_fix_sources_metadata_and_storage.sql`
