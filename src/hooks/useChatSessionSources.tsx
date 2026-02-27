import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatSessionSource {
  id: string;
  title: string;
  type: 'pdf' | 'text' | 'website' | 'youtube' | 'audio';
  processing_status: string;
  file_path?: string;
  pdf_file_path?: string;
  pdf_storage_bucket?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  target_role?: string;
  policyDate?: string; // Format: "Month-Year" e.g., "February-2024"
  created_at: string;
  updated_at: string;
  linked_at?: string; // When it was linked to this chat
}

/**
 * Hook to fetch sources linked to a specific chat session
 * via the chat_session_documents junction table
 */
export const useChatSessionSources = (chatSessionId?: string) => {
  const { user } = useAuth();

  const { data: sources, isLoading, error, refetch } = useQuery({
    queryKey: ['chat-session-sources', chatSessionId],
    queryFn: async () => {
      if (!chatSessionId) return [];

      // Query sources via the junction table
      const { data, error } = await supabase
        .from('chat_session_documents')
        .select(`
          added_at,
          source_id,
          sources (
            id,
            title,
            type,
            processing_status,
            file_path,
            pdf_file_path,
            pdf_storage_bucket,
            url,
            metadata,
            target_role,
            policyDate,
            created_at,
            updated_at
          )
        `)
        .eq('chat_session_id', chatSessionId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat session sources:', error);
        throw error;
      }

      // Transform the data to flatten sources
      const transformedSources = data
        .map((item: any) => {
          if (!item.sources) return null;
          return {
            ...item.sources,
            linked_at: item.added_at,
          } as ChatSessionSource;
        })
        .filter((source): source is ChatSessionSource => source !== null);

      console.log(`Fetched ${transformedSources.length} sources for chat session ${chatSessionId}`);
      return transformedSources;
    },
    enabled: !!chatSessionId && !!user,
  });

  return {
    sources: sources || [],
    isLoading,
    error: error?.message,
    refetch,
    // Helper flags
    hasAnySources: (sources?.length || 0) > 0,
    hasProcessedSources: sources?.some(s => s.processing_status === 'completed') || false,
    processingCount: sources?.filter(s => s.processing_status === 'processing' || s.processing_status === 'pending').length || 0,
    completedCount: sources?.filter(s => s.processing_status === 'completed').length || 0,
    failedCount: sources?.filter(s => s.processing_status === 'failed').length || 0,
  };
};

/**
 * Hook to add a source to a chat session
 */
export const useAddSourceToChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatSessionId,
      sourceId
    }: {
      chatSessionId: string;
      sourceId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('chat_session_documents')
        .insert({
          chat_session_id: chatSessionId,
          source_id: sourceId,
          added_by_user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chat-session-sources', variables.chatSessionId]
      });
    },
  });
};

/**
 * Hook to remove a source from a chat session
 */
export const useRemoveSourceFromChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatSessionId,
      sourceId
    }: {
      chatSessionId: string;
      sourceId: string;
    }) => {
      const { error } = await supabase
        .from('chat_session_documents')
        .delete()
        .eq('chat_session_id', chatSessionId)
        .eq('source_id', sourceId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chat-session-sources', variables.chatSessionId]
      });
    },
  });
};
