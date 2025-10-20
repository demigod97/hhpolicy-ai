# Dashboard Enhancements Implementation Plan

## Issues Identified

1. **PDF Access Issue**: Admin/Executive users get "Failed to load PDF" errors
   - Root cause: Documents may not have `target_role` assigned
   - Root cause: `pdf_storage_bucket` field might be NULL or incorrect
   - Storage policies blocking access due to missing metadata

2. **No Upload UI**: System Owner/Company Operator roles need document management interface

3. **Document Visibility in Chat**: Documents not showing in chat/notebook area

4. **Missing User Greeting**: No welcome card showing user info and role

## Implementation Plan

### Phase 1: Investigate and Fix PDF Access (Priority: CRITICAL)

#### Step 1.1: Check Sources Data
- Query sources table to see actual target_role and pdf_storage_bucket values
- Identify documents with NULL target_role
- Check pdf_file_path vs pdf_storage_bucket consistency

#### Step 1.2: Fix Storage Bucket Configuration
- Ensure storage buckets ('sources', 'policy-documents') exist
- Verify RLS is enabled on storage.objects
- Check if our storage policies were actually created
- Fix any missing pdf_storage_bucket values (default to 'sources')

#### Step 1.3: Create Migration to Fix Existing Data
```sql
-- Set default bucket for documents with NULL pdf_storage_bucket
UPDATE sources
SET pdf_storage_bucket = 'sources'
WHERE pdf_storage_bucket IS NULL AND pdf_file_path IS NOT NULL;

-- Set default target_role for documents with NULL target_role
-- (Make them accessible to all roles for now)
UPDATE sources
SET target_role = 'administrator'
WHERE target_role IS NULL AND type = 'pdf';
```

### Phase 2: Document Management UI for Operators (Priority: HIGH)

#### Step 2.1: Install Required shadcn Components
```bash
npx shadcn@latest add table
npx shadcn@latest add checkbox
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add badge
npx shadcn@latest add alert-dialog
```

#### Step 2.2: Create Document Management Page
- Create `/src/pages/admin/DocumentManagement.tsx`
- Features:
  - Data table with all documents
  - Columns: Title, Target Role, Status, Upload Date, Size, Actions
  - Bulk select with checkboxes
  - Individual row actions (Edit, Delete)
  - Bulk actions (Delete selected, Assign role to selected)

#### Step 2.3: Create Document Edit Dialog
- Component: `/src/components/admin/DocumentEditDialog.tsx`
- Fields:
  - Document title (editable)
  - Target role (dropdown: administrator, executive, board)
  - Status (readonly display)
  - Upload date (readonly)
  - PDF preview (thumbnail or icon)
- Actions: Save, Cancel

#### Step 2.4: Create Bulk Actions Component
- Component: `/src/components/admin/BulkActionsBar.tsx`
- Actions:
  - Assign role to selected (dropdown + apply button)
  - Delete selected (with confirmation)
  - Show count of selected items

#### Step 2.5: Implement Delete Functionality
- Single delete: Confirmation dialog
- Bulk delete: Confirmation with count
- Delete from both sources table AND storage bucket
- Show success/error toasts

### Phase 3: User Greeting Card (Priority: MEDIUM)

#### Step 3.1: Install Required Components
```bash
npx shadcn@latest add card
npx shadcn@latest add avatar
npx shadcn@latest add separator
```

#### Step 3.2: Create Greeting Card Component
- Component: `/src/components/dashboard/UserGreetingCard.tsx`
- Display:
  - Greeting based on time of day ("Good morning", "Good afternoon", etc.)
  - User email
  - Role badge with icon
  - Document stats:
    - Total accessible documents
    - Documents uploaded by user
    - Recent uploads (last 7 days)
  - Quick actions based on role

#### Step 3.3: Integrate into Dashboard
- Place at top of Dashboard, above document grid
- Responsive design (full width on mobile, constrained on desktop)
- Smooth animations on load

### Phase 4: Fix Document Visibility in Chat (Priority: HIGH)

#### Step 4.1: Check Chat/Notebook Component
- Review how documents are loaded in chat context
- Ensure RLS policies apply correctly
- Add document list sidebar or dropdown

#### Step 4.2: Create Document Selector for Chat
- Component: `/src/components/chat/DocumentSelector.tsx`
- Features:
  - List accessible documents
  - Filter by role
  - Search by title
  - Show document count
  - Attach/detach documents to chat session

### Phase 5: Enhanced Dashboard UI/UX (Priority: MEDIUM)

#### Step 5.1: UI Improvements
- Add smooth transitions and animations
- Improve spacing and typography
- Add loading skeletons for better perceived performance
- Responsive grid layout improvements
- Better empty states

#### Step 5.2: Install Additional Components
```bash
npx shadcn@latest add skeleton
npx shadcn@latest add tabs
npx shadcn@latest add breadcrumb
```

#### Step 5.3: Navigation Enhancements
- Add breadcrumb navigation
- Highlight active navigation items
- Add role-specific menu items
- Quick access shortcuts

## Implementation Order

### Sprint 1 (Today - Critical Fixes)
1. ✅ Investigate sources data and identify issues
2. ✅ Create and apply migration to fix existing data
3. ✅ Verify storage buckets and policies
4. ✅ Test PDF access with admin/executive roles

### Sprint 2 (Tomorrow - Core Features)
1. Install required shadcn components for document management
2. Create Document Management page structure
3. Implement document table with data
4. Add edit dialog functionality
5. Test with System Owner/Company Operator roles

### Sprint 3 (Day 3 - Polish & UX)
1. Create User Greeting Card
2. Implement bulk actions (select, delete, assign role)
3. Add document selector to chat area
4. UI/UX enhancements and animations
5. Comprehensive testing

## Success Criteria

- [ ] Admin users can view administrator-role PDFs
- [ ] Executive users can view executive and administrator-role PDFs
- [ ] Board users can view all PDFs
- [ ] System Owner/Company Operator can manage documents (edit, delete, assign roles)
- [ ] User sees personalized greeting with role and stats
- [ ] Documents are visible and accessible in chat/notebook area
- [ ] Dashboard has smooth, professional UI/UX
- [ ] All role-based access controls working correctly

## Technical Notes

- Use React Query for all data fetching and mutations
- Implement optimistic updates for better UX
- Add proper error handling with user-friendly messages
- Ensure all operations respect RLS policies
- Add loading states for all async operations
- Use toast notifications for feedback
