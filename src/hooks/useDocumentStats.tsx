import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DocumentStats {
  total: number;
  recent: number; // Last 7 days
  uploaded: number; // Uploaded by current user
  processing: number; // Currently processing
}

export const useDocumentStats = () => {
  const { user } = useAuth();

  return useQuery<DocumentStats>({
    queryKey: ['document-stats', user?.id],
    queryFn: async () => {
      if (!user) {
        return { total: 0, recent: 0, uploaded: 0, processing: 0 };
      }

      // Get total accessible documents
      const { count: total } = await supabase
        .from('sources')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'pdf');

      // Get recent documents (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recent } = await supabase
        .from('sources')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'pdf')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Get documents uploaded by current user
      const { count: uploaded } = await supabase
        .from('sources')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'pdf')
        .eq('uploaded_by_user_id', user.id);

      // Get processing documents
      const { count: processing } = await supabase
        .from('sources')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'pdf')
        .in('processing_status', ['pending', 'processing']);

      return {
        total: total || 0,
        recent: recent || 0,
        uploaded: uploaded || 0,
        processing: processing || 0,
      };
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};
