# Findings — HHR-175 User Management Features (2026-03-03)

## Research: Current State of User Management

### Feature Status Matrix

| Feature | Button/Menu | onClick | Component | Hook Method | Edge Function |
|---------|-------------|---------|-----------|-------------|---------------|
| Add User | Button exists (L212-215) | **NONE** | **NONE** | **NONE** | **NONE** |
| View Details | Menu item exists (L234-237) | **NONE** | `UserDetailView.tsx` exists but **never imported** | N/A | N/A |
| Edit User | Menu item exists (L238-241) | **NONE** | **NONE** | **NONE** | **NONE** |
| Assign Role | Menu item (L230-233) | Working | `RoleAssignmentDialog.tsx` | `updateUserRole` | `assign-user-role` |
| Bulk Update | Button (L296-304) | Working | `BulkActionBar.tsx` | `bulkUpdateUserRoles` | `bulk-assign-user-roles` |

### File Inventory

**Working Components:**
- `UserManagementDashboard.tsx` — main orchestrator (state, filtering, handlers)
- `UserTable.tsx` — table with checkboxes, role badges, dropdown actions
- `RoleAssignmentDialog.tsx` — controlled dialog for single-user role assignment
- `BulkActionBar.tsx` — bulk role update bar

**Dead Component:**
- `UserDetailView.tsx` — fully implemented dialog (profile, role, activity cards) — **never imported or used anywhere**

**Hook:**
- `useUserManagement.tsx` — exports: `fetchUsers`, `updateUserRole`, `bulkUpdateUserRoles`

**Edge Functions (User-related):**
- `get-users/index.ts` — GET, admin list all users with roles
- `assign-user-role/index.ts` — POST, assign/revoke role
- `bulk-assign-user-roles/index.ts` — POST, bulk role assignment

### UserDetailView Analysis

`UserDetailView.tsx` is a self-contained Dialog with its own `<DialogTrigger>`. This won't work when called from a dropdown menu item — it needs refactoring to a **controlled Dialog** pattern (accept `open`/`onOpenChange` props) like `RoleAssignmentDialog.tsx`.

Current signature:
```tsx
interface UserDetailViewProps {
  user: User;
  onRoleAssignment: (user: User) => void;
}
```

Needs to become:
```tsx
interface UserDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onRoleAssignment: (user: User) => void;
}
```

### Supabase Auth Admin API Capabilities

For `invite-user`:
```typescript
// Sends an invite email with magic link
const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
  data: { name: 'John Doe' }  // optional user_metadata
});
// Returns: { user: { id, email, ... } }
```

For `update-user`:
```typescript
// Updates user metadata or email
const { data, error } = await supabase.auth.admin.updateUserById(userId, {
  email: 'new@example.com',      // optional
  user_metadata: { name: 'New Name' }  // optional
});
```

### Edge Function Pattern (from assign-user-role)

Standard pattern used across all edge functions:
1. CORS preflight handler (OPTIONS → 204)
2. Method check (POST/GET only)
3. Supabase client init with service role key
4. JWT extraction from Authorization header (manual base64 decode)
5. Permission check via `user_roles` table query
6. Business logic
7. JSON response with `{ success, message, data?, error? }`
8. Error catch with 500 response

### Database Schema Relevant to Changes

```sql
-- user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('administrator', 'executive', 'board', 'company_operator', 'system_owner')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);
```

### Role Hierarchy (who can do what)
| Caller Role | Can Invite? | Can Edit? | Can Assign Roles? |
|-------------|------------|-----------|-------------------|
| system_owner | Yes (any role) | Yes | Yes (any role) |
| company_operator | Yes (except system_owner) | Yes | Yes (except system_owner) |
| administrator | Yes (executive/board only) | Yes | Yes (limited) |
| board | No | No | No |
| executive | No | No | No |
