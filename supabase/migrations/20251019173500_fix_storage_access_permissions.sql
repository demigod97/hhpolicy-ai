-- ============================================================================
-- Fix Storage Access Permissions
-- Date: 2025-10-19
-- Purpose: Grant execute permissions and fix storage policy function
-- ============================================================================

-- Grant execute permission on helper functions to authenticated role
grant execute on function public.can_access_source(text, uuid) to authenticated;
grant execute on function public.can_access_pdf_storage(text, text, uuid) to authenticated;
grant execute on function public.get_user_role(uuid) to authenticated;

-- Also grant to anon for potential public access scenarios
grant execute on function public.get_user_role(uuid) to anon;

-- Ensure RLS is enabled on storage.objects
alter table storage.objects enable row level security;

-- Add helpful comments
comment on function public.can_access_pdf_storage is
'Determines if a user can access a PDF file in storage.
Called by storage policies to enforce role-based access control.
Returns TRUE if user has permission, FALSE otherwise.';

comment on function public.can_access_source is
'Determines if a user can access a source document based on their role.
Hierarchy: system_owner/company_operator > board > executive > administrator
Users can always access their own uploads.';

comment on function public.get_user_role is
'Returns the role of the specified user from the user_roles table.
Returns NULL if user has no assigned role.';
