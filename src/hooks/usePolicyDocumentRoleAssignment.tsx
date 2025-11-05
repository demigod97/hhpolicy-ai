import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { hasRole } from '@/services/authService';

interface UpdateRoleAssignmentParams {
  documentId: string;
  newRole: 'administrator' | 'executive';
}

interface UpdateRoleAssignmentResult {
  success: boolean;
  error?: string;
}

interface BulkUpdateRoleAssignmentParams {
  documentIds: string[];
  newRole: 'administrator' | 'executive';
}

interface BulkUpdateRoleAssignmentResult {
  success: boolean;
  successCount: number;
  failedCount: number;
  error?: string;
}

export const usePolicyDocumentRoleAssignment = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const { toast } = useToast();

  /**
   * Update role assignment for a single policy document
   */
  const updateRoleAssignment = useCallback(async (params: UpdateRoleAssignmentParams): Promise<UpdateRoleAssignmentResult> => {
    const { documentId, newRole } = params;

    try {
      setIsUpdating(true);

      // Check user permissions - allow executives to manage role assignments for testing
      const isAdmin = await hasRole('administrator');
      const isExec = await hasRole('executive');

      if (!isAdmin && !isExec) {
        return {
          success: false,
          error: 'You must have administrator or executive role to change policy document role assignments'
        };
      }

      // Validate inputs
      if (!documentId || !newRole) {
        return {
          success: false,
          error: 'Document ID and new role are required'
        };
      }

      if (!['administrator', 'executive'].includes(newRole)) {
        return {
          success: false,
          error: 'Invalid role. Must be administrator or executive'
        };
      }

      // Update the policy document's role assignment
      const { data, error } = await supabase
        .from('policy_documents')
        .update({ 
          role_assignment: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select('id, title, role_assignment')
        .single();

      if (error) {
        console.error('Role assignment update error:', error);
        const errorMessage = `Failed to update role assignment: ${error.message}`;
        toast({
          title: 'Update Failed',
          description: errorMessage,
          variant: 'destructive'
        });
        return {
          success: false,
          error: errorMessage
        };
      }

      if (!data) {
        const errorMessage = 'Document not found or you do not have permission to update it';
        toast({
          title: 'Update Failed',
          description: errorMessage,
          variant: 'destructive'
        });
        return {
          success: false,
          error: errorMessage
        };
      }

      // Show success message
      toast({
        title: 'Role Assignment Updated',
        description: `"${data.title}" is now assigned to ${newRole} role`,
        variant: 'default'
      });

      return {
        success: true
      };

    } catch (error) {
      console.error('Role assignment update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update role assignment';
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsUpdating(false);
    }
  }, [toast]);

  /**
   * Update role assignment for multiple policy documents (bulk operation)
   */
  const bulkUpdateRoleAssignment = useCallback(async (params: BulkUpdateRoleAssignmentParams): Promise<BulkUpdateRoleAssignmentResult> => {
    const { documentIds, newRole } = params;

    try {
      setIsBulkUpdating(true);

      // Check user permissions - allow executives to manage role assignments for testing
      const isAdmin = await hasRole('administrator');
      const isExec = await hasRole('executive');

      if (!isAdmin && !isExec) {
        return {
          success: false,
          successCount: 0,
          failedCount: documentIds.length,
          error: 'You must have administrator or executive role to change policy document role assignments'
        };
      }

      // Validate inputs
      if (!documentIds || documentIds.length === 0) {
        return {
          success: false,
          successCount: 0,
          failedCount: 0,
          error: 'No documents selected for bulk update'
        };
      }

      if (!['administrator', 'executive'].includes(newRole)) {
        return {
          success: false,
          successCount: 0,
          failedCount: documentIds.length,
          error: 'Invalid role. Must be administrator or executive'
        };
      }

      // Perform bulk update
      const { data, error } = await supabase
        .from('policy_documents')
        .update({ 
          role_assignment: newRole,
          updated_at: new Date().toISOString()
        })
        .in('id', documentIds)
        .select('id, title, role_assignment');

      if (error) {
        console.error('Bulk role assignment update error:', error);
        const errorMessage = `Failed to update role assignments: ${error.message}`;
        toast({
          title: 'Bulk Update Failed',
          description: errorMessage,
          variant: 'destructive'
        });
        return {
          success: false,
          successCount: 0,
          failedCount: documentIds.length,
          error: errorMessage
        };
      }

      const successCount = data?.length || 0;
      const failedCount = documentIds.length - successCount;

      // Show appropriate success/warning message
      if (successCount > 0 && failedCount === 0) {
        toast({
          title: 'Bulk Update Successful',
          description: `${successCount} document${successCount > 1 ? 's' : ''} assigned to ${newRole} role`,
          variant: 'default'
        });
      } else if (successCount > 0 && failedCount > 0) {
        toast({
          title: 'Partial Update Success',
          description: `${successCount} updated, ${failedCount} failed`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Update Failed',
          description: 'No documents could be updated',
          variant: 'destructive'
        });
      }

      return {
        success: successCount > 0,
        successCount,
        failedCount,
        error: failedCount > 0 ? `${failedCount} documents could not be updated` : undefined
      };

    } catch (error) {
      console.error('Bulk role assignment update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update role assignments';
      toast({
        title: 'Bulk Update Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return {
        success: false,
        successCount: 0,
        failedCount: documentIds.length,
        error: errorMessage
      };
    } finally {
      setIsBulkUpdating(false);
    }
  }, [toast]);

  /**
   * Get role assignment for a specific document
   */
  const getRoleAssignment = useCallback(async (documentId: string): Promise<'administrator' | 'executive' | null> => {
    try {
      const { data, error } = await supabase
        .from('policy_documents')
        .select('role_assignment')
        .eq('id', documentId)
        .single();

      if (error || !data) {
        console.error('Failed to get role assignment:', error);
        return null;
      }

      return data.role_assignment as 'administrator' | 'executive' | null;

    } catch (error) {
      console.error('Get role assignment error:', error);
      return null;
    }
  }, []);

  return {
    updateRoleAssignment,
    bulkUpdateRoleAssignment,
    getRoleAssignment,
    isUpdating,
    isBulkUpdating
  };
};