import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export type BulkActionType = 'delete' | 'changeRole' | 'export';

export const useBulkActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const bulkDelete = async (documentIds: string[]) => {
    if (documentIds.length === 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('sources')
        .delete()
        .in('id', documentIds);

      if (error) throw error;

      toast({
        title: 'Documents deleted',
        description: `Successfully deleted ${documentIds.length} document(s).`,
      });

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['documents'] });
      await queryClient.invalidateQueries({ queryKey: ['sources'] });

      return true;
    } catch (error: any) {
      console.error('Error deleting documents:', error);
      toast({
        title: 'Error',
        description: `Failed to delete documents: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkChangeRole = async (
    documentIds: string[],
    newRole: 'administrator' | 'executive' | 'board' | 'company_operator' | 'system_owner'
  ) => {
    if (documentIds.length === 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('sources')
        .update({ target_role: newRole })
        .in('id', documentIds);

      if (error) throw error;

      toast({
        title: 'Role updated',
        description: `Successfully updated role for ${documentIds.length} document(s) to ${newRole}.`,
      });

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['documents'] });
      await queryClient.invalidateQueries({ queryKey: ['sources'] });

      return true;
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: `Failed to update role: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkExport = async (documentIds: string[]) => {
    if (documentIds.length === 0) return;

    setIsLoading(true);
    try {
      // Fetch document details
      const { data, error } = await supabase
        .from('sources')
        .select('id, title, target_role, processing_status, created_at, policyDate, metadata')
        .in('id', documentIds);

      if (error) throw error;

      // Convert to CSV
      const headers = ['ID', 'Title', 'Role', 'Status', 'Policy Date', 'Created At', 'File Size', 'Page Count'];
      const rows = data.map(doc => [
        doc.id,
        doc.title,
        doc.target_role,
        doc.processing_status,
        doc.policyDate || 'N/A',
        new Date(doc.created_at).toLocaleDateString(),
        doc.metadata?.file_size ? `${(doc.metadata.file_size / (1024 * 1024)).toFixed(2)} MB` : 'N/A',
        doc.metadata?.page_count || 'N/A',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `documents-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export complete',
        description: `Exported ${documentIds.length} document(s) to CSV.`,
      });

      return true;
    } catch (error: any) {
      console.error('Error exporting documents:', error);
      toast({
        title: 'Error',
        description: `Failed to export documents: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    bulkDelete,
    bulkChangeRole,
    bulkExport,
  };
};
