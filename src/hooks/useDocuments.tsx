import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

export interface Document {
  id: string;
  title: string;
  type: string;
  metadata: any;
  created_at: string;
  processing_status: string;
  pdf_file_path: string | null;
  target_role: 'administrator' | 'executive' | 'board' | 'company_operator' | 'system_owner';
  notebook_id: string | null;
}

export const useDocuments = () => {
  const { userRole } = useUserRole();
  const queryClient = useQueryClient();

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents', userRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('id, title, type, metadata, created_at, processing_status, pdf_file_path, target_role, notebook_id')
        .eq('type', 'pdf')
        // Show completed, processing, and pending documents
        .in('processing_status', ['completed', 'processing', 'pending'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // RLS policies automatically filter by user role
      return data as Document[];
    },
    enabled: !!userRole,
    // Poll every 5 seconds to check for status updates
    refetchInterval: (query) => {
      // If any document is processing or pending, poll every 5 seconds
      const docs = query?.state?.data as Document[] | undefined;
      const hasProcessing = docs?.some(doc =>
        doc.processing_status === 'processing' || doc.processing_status === 'pending'
      );
      return hasProcessing ? 5000 : false;
    },
  });

  // Set up real-time subscription for sources table updates
  useEffect(() => {
    if (!userRole) return;

    console.log('Setting up real-time subscription for sources (documents)');

    const channel = supabase
      .channel('sources-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'sources',
        },
        (payload) => {
          console.log('Real-time source update received:', payload);

          // Invalidate and refetch documents when any change occurs
          queryClient.invalidateQueries({ queryKey: ['documents', userRole] });
          queryClient.invalidateQueries({ queryKey: ['sources'] });
          queryClient.invalidateQueries({ queryKey: ['notebooks'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up sources real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [userRole, queryClient]);

  return {
    documents: documents || [],
    isLoading,
    error: error?.message,
  };
};
