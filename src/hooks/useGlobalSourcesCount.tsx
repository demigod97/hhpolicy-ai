import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from './useUserRole';

export const useGlobalSourcesCount = () => {
  const { user } = useAuth();
  const { userRole } = useUserRole();

  const {
    data: globalSourcesCount = 0,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['global-sources-count', userRole],
    queryFn: async () => {
      // Use Supabase's count feature for efficient counting
      // RLS policies will handle role-based filtering at database level
      const { count, error } = await supabase
        .from('sources')
        .select('*', { count: 'exact', head: true })
        .eq('visibility_scope', 'global');

      if (error) {
        console.error('Error fetching global sources count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!user && !!userRole,
    staleTime: 2 * 60 * 1000, // 2 minutes - fresher than full sources query
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  // Helper function to get role-appropriate description
  const getSourcesDescription = () => {
    if (!userRole || globalSourcesCount === 0) {
      return 'No policy documents available';
    }

    const roleDescriptions = {
      board: `${globalSourcesCount} policy document${globalSourcesCount !== 1 ? 's' : ''} available (all organizational policies)`,
      administrator: `${globalSourcesCount} policy document${globalSourcesCount !== 1 ? 's' : ''} available (administrator-level policies)`, 
      executive: `${globalSourcesCount} policy document${globalSourcesCount !== 1 ? 's' : ''} available (executive and administrator policies)`
    };

    return roleDescriptions[userRole as keyof typeof roleDescriptions] || 
           `${globalSourcesCount} policy document${globalSourcesCount !== 1 ? 's' : ''} available`;
  };

  return {
    globalSourcesCount,
    isLoading,
    error,
    sourcesDescription: getSourcesDescription(),
    hasGlobalSources: globalSourcesCount > 0
  };
};