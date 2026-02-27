/**
 * AG-UI Chat Messages Hook
 *
 * Integrates CopilotKit's useCopilotChat with existing n8n infrastructure
 * Maintains backward compatibility while enabling AG-UI protocol features
 *
 * @module hooks/useAGUIChatMessages
 */

import { useState, useEffect, useCallback } from 'react';
import { useCopilotChat, useCopilotReadable } from '@copilotkit/react-core';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getRoleBasedInstructions, getRoleDescription } from '@/utils/roleInstructions';
import {
  transformN8nToAGUI,
  transformAGUIToN8n,
  transformN8nMessagesToAGUI,
  validateMessageFormat
} from '@/utils/messageTransformers';
import { EnhancedChatMessage } from '@/types/message';

/**
 * CopilotKit Message type (simplified)
 */
interface CopilotMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

/**
 * Hook configuration options
 */
interface UseAGUIChatMessagesOptions {
  notebookId?: string;
  userRole?: string;
  enableDualMode?: boolean; // If true, sends to both AG-UI and n8n
  enableFallback?: boolean; // If true, falls back to n8n on AG-UI error
}

/**
 * Hook return type
 */
interface UseAGUIChatMessagesReturn {
  messages: EnhancedChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  isSending: boolean;
  error: Error | null;
  deleteChatHistory: (notebookId: string) => void;
  isDeletingChatHistory: boolean;
  stopGeneration: () => void;
  reset: () => void;
}

/**
 * AG-UI Chat Messages Hook
 *
 * Provides AG-UI/CopilotKit integration while maintaining backward compatibility
 * with existing n8n webhook system
 *
 * @param options - Configuration options
 * @returns Chat interface methods and state
 */
export const useAGUIChatMessages = (
  options: UseAGUIChatMessagesOptions = {}
): UseAGUIChatMessagesReturn => {
  const {
    notebookId,
    userRole = 'general_user',
    enableDualMode = true, // Default: send to both systems
    enableFallback = true  // Default: fallback to n8n if AG-UI fails
  } = options;

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  // Get role-based instructions for AI
  const instructions = getRoleBasedInstructions(userRole);
  const roleDescription = getRoleDescription(userRole);

  // Make notebook context readable to CopilotKit
  useCopilotReadable({
    description: `Current notebook/policy document ID: ${notebookId || 'none'}`,
    value: notebookId || 'none'
  });

  useCopilotReadable({
    description: `User role and permissions: ${roleDescription}`,
    value: userRole
  });

  // Initialize CopilotKit chat
  const {
    visibleMessages: copilotMessages,
    appendMessage,
    setMessages: setCopilotMessages,
    isLoading: isCopilotLoading,
    stopGeneration,
    reloadMessages
  } = useCopilotChat({
    instructions,
    makeSystemMessage: () => instructions
  });

  // Load existing messages from database
  const {
    data: dbMessages = [],
    isLoading: isDbLoading,
    error: dbError
  } = useQuery({
    queryKey: ['chat-messages', notebookId],
    queryFn: async () => {
      if (!notebookId) return [];

      // Fetch messages from n8n_chat_histories
      const { data: messagesData, error: messagesError } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', notebookId)
        .order('id', { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch sources for citation mapping
      const { data: sourcesData } = await supabase
        .from('sources')
        .select('id, title, type')
        .eq('notebook_id', notebookId);

      const sourceMap = new Map(sourcesData?.map(s => [s.id, s]) || []);

      // Validate and transform messages
      const validMessages = messagesData.filter(validateMessageFormat);
      return validMessages.map((item: any) => {
        // Return original EnhancedChatMessage format
        const messageObj = item.message;
        return {
          id: item.id,
          session_id: item.session_id,
          message: messageObj
        } as EnhancedChatMessage;
      });
    },
    enabled: !!notebookId && !!user,
    refetchOnMount: true,
    refetchOnReconnect: true
  });

  // Setup Realtime subscription for new messages
  useEffect(() => {
    if (!notebookId || !user) return;

    console.log('[AG-UI] Setting up Realtime subscription for notebook:', notebookId);

    const channel = supabase
      .channel(`chat-${notebookId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'n8n_chat_histories',
          filter: `session_id=eq.${notebookId}`
        },
        async (payload) => {
          console.log('[AG-UI] Realtime: New message received:', payload);

          if (!validateMessageFormat(payload.new)) {
            console.warn('[AG-UI] Invalid message format received:', payload.new);
            return;
          }

          // Fetch sources for transformation
          const { data: sourcesData } = await supabase
            .from('sources')
            .select('id, title, type')
            .eq('notebook_id', notebookId);

          const sourceMap = new Map(sourcesData?.map(s => [s.id, s]) || []);

          // Transform and add to messages
          const newMessage: EnhancedChatMessage = {
            id: payload.new.id,
            session_id: payload.new.session_id,
            message: payload.new.message
          };

          // Update query cache
          queryClient.setQueryData(
            ['chat-messages', notebookId],
            (old: EnhancedChatMessage[] = []) => {
              if (old.some(m => m.id === newMessage.id)) return old;
              return [...old, newMessage];
            }
          );
        }
      )
      .subscribe((status) => {
        console.log('[AG-UI] Realtime subscription status:', status);
      });

    return () => {
      console.log('[AG-UI] Cleaning up Realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [notebookId, user, queryClient]);

  // Send message function with dual-mode support
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !notebookId) {
      throw new Error('User not authenticated or notebook ID missing');
    }

    setIsSending(true);

    try {
      let aguiSuccess = false;
      let n8nSuccess = false;

      // Try AG-UI first
      try {
        console.log('[AG-UI] Sending message via CopilotKit...');
        await appendMessage({
          role: 'user',
          content
        });
        aguiSuccess = true;
        console.log('[AG-UI] Message sent via CopilotKit successfully');
      } catch (aguiError) {
        console.error('[AG-UI] CopilotKit send failed:', aguiError);

        if (!enableFallback && !enableDualMode) {
          throw aguiError;
        }
      }

      // Send to n8n (either as dual-mode or fallback)
      if (enableDualMode || (!aguiSuccess && enableFallback)) {
        try {
          console.log('[AG-UI] Sending message via n8n webhook...');
          const { error: n8nError } = await supabase.functions.invoke('send-chat-message', {
            body: {
              session_id: notebookId,
              message: content,
              user_id: user.id
            }
          });

          if (n8nError) throw n8nError;

          n8nSuccess = true;
          console.log('[AG-UI] Message sent via n8n successfully');
        } catch (n8nError) {
          console.error('[AG-UI] n8n send failed:', n8nError);

          if (!aguiSuccess) {
            throw new Error('Both AG-UI and n8n failed to send message');
          }
        }
      }

      if (!aguiSuccess && !n8nSuccess) {
        throw new Error('Failed to send message via any method');
      }

    } catch (error) {
      console.error('[AG-UI] Send message error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [user, notebookId, appendMessage, enableDualMode, enableFallback, toast]);

  // Delete chat history mutation
  const deleteChatHistory = useMutation({
    mutationFn: async (notebookId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('[AG-UI] Deleting chat history for notebook:', notebookId);

      const { error } = await supabase
        .from('n8n_chat_histories')
        .delete()
        .eq('session_id', notebookId);

      if (error) throw error;

      return notebookId;
    },
    onSuccess: (notebookId) => {
      console.log('[AG-UI] Chat history cleared for notebook:', notebookId);
      toast({
        title: 'Chat history cleared',
        description: 'All messages have been deleted successfully.'
      });

      // Clear query cache
      queryClient.setQueryData(['chat-messages', notebookId], []);
      queryClient.invalidateQueries({
        queryKey: ['chat-messages', notebookId]
      });

      // Reset CopilotKit messages
      setCopilotMessages([]);
    },
    onError: (error) => {
      console.error('[AG-UI] Failed to delete chat history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear chat history. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Reset function
  const reset = useCallback(() => {
    setCopilotMessages([]);
    queryClient.invalidateQueries({
      queryKey: ['chat-messages', notebookId]
    });
  }, [setCopilotMessages, queryClient, notebookId]);

  return {
    messages: dbMessages,
    sendMessage,
    isLoading: isDbLoading || isCopilotLoading,
    isSending,
    error: dbError,
    deleteChatHistory: deleteChatHistory.mutate,
    isDeletingChatHistory: deleteChatHistory.isPending,
    stopGeneration,
    reset
  };
};
