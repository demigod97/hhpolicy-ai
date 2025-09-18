-- ============================================================================
-- UPDATE RLS POLICIES FOR ROLE-BASED DOCUMENT ACCESS
-- Story 2.1: Administrator Assignment of Executive Policies
-- This migration updates RLS policies to respect role_assignment field
-- ============================================================================

-- Helper function to get user's role for document access
CREATE OR REPLACE FUNCTION public.get_user_role_for_document_access()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT COALESCE(
        (SELECT role
         FROM public.user_roles
         WHERE user_id = auth.uid()
         ORDER BY
             CASE role
                 WHEN 'super_admin' THEN 1
                 WHEN 'administrator' THEN 2
                 WHEN 'executive' THEN 3
                 ELSE 4
             END
         LIMIT 1),
        'none'
    );
$$;

-- Helper function to check if user can access document based on role assignment
CREATE OR REPLACE FUNCTION public.can_access_policy_document(doc_role_assignment TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT CASE
        -- Super admins can access everything
        WHEN public.is_super_admin() THEN TRUE
        -- If document has no role assignment, only owner can access (handled by user_id check)
        WHEN doc_role_assignment IS NULL THEN TRUE
        -- If user's role matches document's role assignment
        WHEN public.get_user_role_for_document_access() = doc_role_assignment THEN TRUE
        -- Otherwise, no access
        ELSE FALSE
    END;
$$;

-- Update policy_documents RLS policies to include role assignment filtering

-- Policy for viewing policy documents
DROP POLICY IF EXISTS "Users can view their own policy documents" ON public.policy_documents;
CREATE POLICY "Role-based policy document access" ON public.policy_documents
    FOR SELECT
    USING (
        -- Super admins can view all documents
        public.is_super_admin() 
        OR 
        -- Users can view documents they own that match their role assignment or have no role assignment
        (auth.uid() = user_id AND public.can_access_policy_document(role_assignment))
    );

-- Policy for creating policy documents (administrators only)
DROP POLICY IF EXISTS "Users can create their own policy documents" ON public.policy_documents;
CREATE POLICY "Administrators can create policy documents" ON public.policy_documents
    FOR INSERT
    WITH CHECK (
        public.is_super_admin() 
        OR 
        (auth.uid() = user_id AND public.has_role('administrator'))
    );

-- Policy for updating policy documents (administrators only)
DROP POLICY IF EXISTS "Users can update their own policy documents" ON public.policy_documents;
CREATE POLICY "Administrators can update policy documents" ON public.policy_documents
    FOR UPDATE
    USING (
        public.is_super_admin() 
        OR 
        (auth.uid() = user_id AND public.has_role('administrator'))
    );

-- Policy for deleting policy documents (administrators only)
DROP POLICY IF EXISTS "Users can delete their own policy documents" ON public.policy_documents;
CREATE POLICY "Administrators can delete policy documents" ON public.policy_documents
    FOR DELETE
    USING (
        public.is_super_admin() 
        OR 
        (auth.uid() = user_id AND public.has_role('administrator'))
    );

-- Keep the super admin policy as a fallback
DROP POLICY IF EXISTS "Super admins can view all policy documents" ON public.policy_documents;
CREATE POLICY "Super admins can manage all policy documents" ON public.policy_documents
    FOR ALL
    USING (public.is_super_admin());

-- Update related table policies to respect role assignment

-- Update sources table policies
DROP POLICY IF EXISTS "Users can view sources from their policy documents" ON public.sources;
CREATE POLICY "Role-based sources access" ON public.sources
    FOR SELECT
    USING (
        public.is_super_admin()
        OR
        EXISTS (
            SELECT 1 FROM public.policy_documents
            WHERE policy_documents.id = sources.notebook_id
            AND policy_documents.user_id = auth.uid()
            AND public.can_access_policy_document(policy_documents.role_assignment)
        )
    );

DROP POLICY IF EXISTS "Users can create sources in their policy documents" ON public.sources;
CREATE POLICY "Administrators can create sources in policy documents" ON public.sources
    FOR INSERT
    WITH CHECK (
        public.is_super_admin()
        OR
        (EXISTS (
            SELECT 1 FROM public.policy_documents
            WHERE policy_documents.id = sources.notebook_id
            AND policy_documents.user_id = auth.uid()
        ) AND public.has_role('administrator'))
    );

DROP POLICY IF EXISTS "Users can update sources in their policy documents" ON public.sources;
CREATE POLICY "Administrators can update sources in policy documents" ON public.sources
    FOR UPDATE
    USING (
        public.is_super_admin()
        OR
        (EXISTS (
            SELECT 1 FROM public.policy_documents
            WHERE policy_documents.id = sources.notebook_id
            AND policy_documents.user_id = auth.uid()
        ) AND public.has_role('administrator'))
    );

DROP POLICY IF EXISTS "Users can delete sources from their policy documents" ON public.sources;
CREATE POLICY "Administrators can delete sources from policy documents" ON public.sources
    FOR DELETE
    USING (
        public.is_super_admin()
        OR
        (EXISTS (
            SELECT 1 FROM public.policy_documents
            WHERE policy_documents.id = sources.notebook_id
            AND policy_documents.user_id = auth.uid()
        ) AND public.has_role('administrator'))
    );

-- Update notes table policies
DROP POLICY IF EXISTS "Users can view notes from their policy documents" ON public.notes;
CREATE POLICY "Role-based notes access" ON public.notes
    FOR SELECT
    USING (
        public.is_super_admin()
        OR
        EXISTS (
            SELECT 1 FROM public.policy_documents
            WHERE policy_documents.id = notes.notebook_id
            AND policy_documents.user_id = auth.uid()
            AND public.can_access_policy_document(policy_documents.role_assignment)
        )
    );

DROP POLICY IF EXISTS "Users can create notes in their policy documents" ON public.notes;
CREATE POLICY "Role-based notes creation" ON public.notes
    FOR INSERT
    WITH CHECK (
        public.is_super_admin()
        OR
        EXISTS (
            SELECT 1 FROM public.policy_documents
            WHERE policy_documents.id = notes.notebook_id
            AND policy_documents.user_id = auth.uid()
            AND public.can_access_policy_document(policy_documents.role_assignment)
        )
    );

DROP POLICY IF EXISTS "Users can update notes in their policy documents" ON public.notes;
CREATE POLICY "Role-based notes updates" ON public.notes
    FOR UPDATE
    USING (
        public.is_super_admin()
        OR
        EXISTS (
            SELECT 1 FROM public.policy_documents
            WHERE policy_documents.id = notes.notebook_id
            AND policy_documents.user_id = auth.uid()
            AND public.can_access_policy_document(policy_documents.role_assignment)
        )
    );

DROP POLICY IF EXISTS "Users can delete notes from their policy documents" ON public.notes;
CREATE POLICY "Role-based notes deletion" ON public.notes
    FOR DELETE
    USING (
        public.is_super_admin()
        OR
        EXISTS (
            SELECT 1 FROM public.policy_documents
            WHERE policy_documents.id = notes.notebook_id
            AND policy_documents.user_id = auth.uid()
            AND public.can_access_policy_document(policy_documents.role_assignment)
        )
    );

-- Update documents table policies (for vector embeddings)
DROP POLICY IF EXISTS "Users can view documents from their policy documents" ON public.documents;
CREATE POLICY "Role-based document embeddings access" ON public.documents
    FOR SELECT
    USING (
        public.is_super_admin()
        OR
        public.is_policy_document_owner_for_document(metadata)
        AND public.can_access_policy_document(
            (SELECT role_assignment 
             FROM public.policy_documents 
             WHERE id = (metadata->>'notebook_id')::uuid)
        )
    );

DROP POLICY IF EXISTS "Users can create documents in their policy documents" ON public.documents;
CREATE POLICY "Administrators can create document embeddings" ON public.documents
    FOR INSERT
    WITH CHECK (
        public.is_super_admin()
        OR
        (public.is_policy_document_owner_for_document(metadata) 
         AND public.has_role('administrator'))
    );

DROP POLICY IF EXISTS "Users can update documents in their policy documents" ON public.documents;
CREATE POLICY "Administrators can update document embeddings" ON public.documents
    FOR UPDATE
    USING (
        public.is_super_admin()
        OR
        (public.is_policy_document_owner_for_document(metadata) 
         AND public.has_role('administrator'))
    );

DROP POLICY IF EXISTS "Users can delete documents from their policy documents" ON public.documents;
CREATE POLICY "Administrators can delete document embeddings" ON public.documents
    FOR DELETE
    USING (
        public.is_super_admin()
        OR
        (public.is_policy_document_owner_for_document(metadata) 
         AND public.has_role('administrator'))
    );

-- Update chat histories policies
DROP POLICY IF EXISTS "Users can view chat histories from their policy documents" ON public.n8n_chat_histories;
CREATE POLICY "Role-based chat histories access" ON public.n8n_chat_histories
    FOR SELECT
    USING (
        public.is_super_admin()
        OR
        EXISTS (
            SELECT 1 FROM public.policy_documents
            WHERE policy_documents.id = n8n_chat_histories.notebook_id
            AND policy_documents.user_id = auth.uid()
            AND public.can_access_policy_document(policy_documents.role_assignment)
        )
    );

DROP POLICY IF EXISTS "Users can create chat histories in their policy documents" ON public.n8n_chat_histories;
CREATE POLICY "Role-based chat histories creation" ON public.n8n_chat_histories
    FOR INSERT
    WITH CHECK (
        public.is_super_admin()
        OR
        EXISTS (
            SELECT 1 FROM public.policy_documents
            WHERE policy_documents.id = n8n_chat_histories.notebook_id
            AND policy_documents.user_id = auth.uid()
            AND public.can_access_policy_document(policy_documents.role_assignment)
        )
    );

DROP POLICY IF EXISTS "Users can delete chat histories from their policy documents" ON public.n8n_chat_histories;
CREATE POLICY "Role-based chat histories deletion" ON public.n8n_chat_histories
    FOR DELETE
    USING (
        public.is_super_admin()
        OR
        EXISTS (
            SELECT 1 FROM public.policy_documents
            WHERE policy_documents.id = n8n_chat_histories.notebook_id
            AND policy_documents.user_id = auth.uid()
            AND public.can_access_policy_document(policy_documents.role_assignment)
        )
    );

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_role_for_document_access() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_policy_document(TEXT) TO authenticated;

-- Insert comment for migration tracking
COMMENT ON FUNCTION public.get_user_role_for_document_access() IS 'Helper function for role-based document access - Story 2.1';
COMMENT ON FUNCTION public.can_access_policy_document(TEXT) IS 'Checks if user can access document based on role assignment - Story 2.1';