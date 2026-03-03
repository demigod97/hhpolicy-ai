# Task Plan — HHR-175: User Management Add/View/Edit Features

## Goal
Wire the three non-functional User Management features:
1. **Add User** — invite new users via email with initial role assignment
2. **View Details** — connect existing `UserDetailView.tsx` to the table dropdown
3. **Edit User** — allow editing user name/profile from the management screen

## Branch
`HHR-175-user-management-features`

## Pre-Implementation Summary

### What Already Existed
- `UserDetailView.tsx` — fully built detail dialog (profile, role, activity cards) — **never imported anywhere**
- `UserTable.tsx` — had "View Details" and "Edit User" dropdown items with **no onClick handlers**
- `UserManagementDashboard.tsx` — had "Add User" button with **no onClick handler**
- `useUserManagement.tsx` — hook with `fetchUsers`, `updateUserRole`, `bulkUpdateUserRoles` — **no `inviteUser` or `updateUser`**
- Edge Functions: `get-users`, `assign-user-role`, `bulk-assign-user-roles` — **no `invite-user` or `update-user`**

### What Was Built
| Feature | Frontend | Hook | Edge Function |
|---------|----------|------|---------------|
| Add User | `AddUserDialog.tsx` (new) | `inviteUser` method | `invite-user` (new) |
| View Details | Wired `UserDetailView` into dashboard | none needed | none needed |
| Edit User | `EditUserDialog.tsx` (new) | `updateUser` method | `update-user` (new) |

---

## Phases

### Phase 1: Wire "View Details" (Quick Win) ✅
- [x] 1.1 Refactor `UserDetailView.tsx` — changed from self-contained Dialog trigger to controlled Dialog
- [x] 1.2 Add state to `UserManagementDashboard.tsx` — `showDetailView` + `selectedUserForDetail`
- [x] 1.3 Add `onViewDetails` handler to dashboard and pass to `UserTable`
- [x] 1.4 Add `onViewDetails` prop to `UserTable` interface and wire "View Details" dropdown onClick
- [x] 1.5 Import and render `UserDetailView` in dashboard with controlled dialog props
- [x] 1.6 Verify in browser — clicking "View Details" opens the detail dialog

### Phase 2: Create "invite-user" Edge Function ✅
- [x] 2.1 Created `supabase/functions/invite-user/index.ts`
- [x] 2.2 Deployed edge function (860.9kB)

### Phase 3: Create "AddUserDialog" Component ✅
- [x] 3.1 Created `src/components/admin/AddUserDialog.tsx`
- [x] 3.2 Added `inviteUser` method to `useUserManagement.tsx` hook
- [x] 3.3 Wired "Add User" button in `UserManagementDashboard.tsx`
- [x] 3.4 Verified in browser — Add User dialog opens with email/name/role form

### Phase 4: Create "update-user" Edge Function ✅
- [x] 4.1 Created `supabase/functions/update-user/index.ts`
- [x] 4.2 Deployed edge function (860.2kB)

### Phase 5: Create "EditUserDialog" Component ✅
- [x] 5.1 Created `src/components/admin/EditUserDialog.tsx`
- [x] 5.2 Added `updateUser` method to `useUserManagement.tsx` hook
- [x] 5.3 Wired "Edit User" dropdown in `UserTable.tsx` and `UserManagementDashboard.tsx`
- [x] 5.4 Verified in browser — Edit User dialog opens with pre-populated name/email

### Phase 6: TypeScript & Build Verification ✅
- [x] 6.1 `npx tsc --noEmit` — clean, zero errors
- [x] 6.2 `npm run build` — built in 6.20s

### Phase 7: Browser E2E Verification ✅
- [x] 7.1 Dev server started on port 5173
- [x] 7.2 Navigated to User Management — 7 users visible
- [x] 7.3 Tested "View Details" on admin user — dialog shows profile, role, activity
- [x] 7.4 Tested "Add User" — dialog shows email, name, role form with validation
- [x] 7.5 Tested "Edit User" on demi user — dialog shows pre-populated fields
- [x] 7.6 Screenshots saved to docs/screenshots/HHR-175-*.png
- [x] 7.7 Zero console errors (only pre-existing DialogContent a11y warnings)

### Phase 8: Documentation & Commit ⬜
- [x] 8.1 Updated `progress.md`
- [ ] 8.2 Commit all changes
- [ ] 8.3 Push and create PR

---

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Supabase access token not set | CLI deploy failed | User provided token, set as env var |
| (no other errors) | — | — |

## Key Decisions
- **View Details**: Refactor `UserDetailView` from self-contained trigger to controlled Dialog (same pattern as `RoleAssignmentDialog`)
- **Add User**: Use Supabase `auth.admin.inviteUserByEmail()` which sends a magic link email — no password needed
- **Edit User**: Only edit name/email — role changes go through existing `RoleAssignmentDialog`
- **Permission Guard**: Only `system_owner`, `company_operator`, `administrator` can invite/edit (not `board` or `executive`)
- **Edge Function Pattern**: Follow exact same CORS/JWT/response pattern as existing `assign-user-role`
