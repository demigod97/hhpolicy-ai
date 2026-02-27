import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  notebook_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch a single chat session by ID
 */
export const useChatSession = (sessionId?: string) => {
  const { data: chatSession, isLoading, error } = useQuery({
    queryKey: ['chat-session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data as ChatSession;
    },
    enabled: !!sessionId,
  });

  return {
    chatSession,
    isLoading,
    error: error?.message,
  };
};

/**
 * Hook to create a new chat session
 * Automatically links all accessible completed documents to the chat
 */
export const useCreateChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Create chat session
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: title || 'New Chat',
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 2. Get all accessible documents (RLS will filter by role)
      // Note: No processing_status filter - link all documents regardless of processing state
      const { data: documents, error: docsError } = await supabase
        .from('sources')
        .select('id')
        .eq('type', 'pdf');

      if (docsError) {
        console.error('Error fetching documents for auto-link:', docsError);
        // Don't fail the chat creation, just log the error
      }

      // 3. Auto-link all accessible documents to the chat session
      if (documents && documents.length > 0) {
        const links = documents.map(doc => ({
          chat_session_id: session.id,
          source_id: doc.id,
          added_by_user_id: user.id,
        }));

        const { error: linkError } = await supabase
          .from('chat_session_documents')
          .insert(links);

        if (linkError) {
          console.error('Error linking documents to chat:', linkError);
          // Don't fail the chat creation
        } else {
          console.log(`Auto-linked ${documents.length} documents to chat session ${session.id}`);
        }
      }

      return session as ChatSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['chat-session-documents'] });
    },
  });
};

/**
 * Hook to update a chat session title
 */
export const useUpdateChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, title }: { sessionId: string; title: string }) => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data as ChatSession;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-session', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
};

/**
 * Hook to delete a chat session
 */
export const useDeleteChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      return sessionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
};

/**
 * Hook to fetch all chat sessions for the current user
 */
export const useChatSessions = () => {
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as ChatSession[];
    },
  });

  return {
    sessions: sessions || [],
    isLoading,
    error: error?.message,
  };
};
