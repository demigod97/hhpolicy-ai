import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { EnhancedChatMessage, Citation, MessageSegment } from '@/types/message';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { UserRole } from '@/services/authService';

// Type for the expected message structure from n8n_chat_histories
interface N8nMessageFormat {
  type: 'human' | 'ai';
  content: string | {
    segments: Array<{ text: string; citation_id?: number }>;
    citations: Array<{
      citation_id: number;
      source_id: string;
      source_title: string;
      source_type: string;
      page_number?: number;
      chunk_index?: number;
      excerpt?: string;
    }>;
  };
  additional_kwargs?: Record<string, unknown>;
  response_metadata?: Record<string, unknown>;
  tool_calls?: Record<string, unknown>[];
  invalid_tool_calls?: Record<string, unknown>[];
}

// Type for the AI response structure from n8n
interface N8nAiResponseContent {
  output: Array<{
    text: string;
    citations?: Array<{
      chunk_index: number;
      chunk_source_id: string;
      chunk_lines_from: number;
      chunk_lines_to: number;
    }>;
  }>;
}

const transformMessage = (item: { id: string; session_id: string; message: unknown }, sourceMap: Map<string, { id: string; title: string; type: string }>): EnhancedChatMessage => {
  console.log('PolicyChat: Processing item:', item);

  // Handle the message format based on your JSON examples
  let transformedMessage: EnhancedChatMessage['message'];

  // Check if message is an object and has the expected structure
  if (item.message &&
      typeof item.message === 'object' &&
      !Array.isArray(item.message) &&
      'type' in item.message &&
      'content' in item.message) {

    // Type assertion with proper checking
    const messageObj = item.message as unknown as N8nMessageFormat;

    // Check if this is an AI message with JSON content that needs parsing
    if (messageObj.type === 'ai' && typeof messageObj.content === 'string') {
      try {
        const parsedContent = JSON.parse(messageObj.content) as N8nAiResponseContent;

        if (parsedContent.output && Array.isArray(parsedContent.output)) {
          // Transform the parsed content into segments and citations
          const segments: MessageSegment[] = [];
          const citations: Citation[] = [];
          let citationIdCounter = 1;

          parsedContent.output.forEach((outputItem) => {
            // Add the text segment
            segments.push({
              text: outputItem.text,
              citation_id: outputItem.citations && outputItem.citations.length > 0 ? citationIdCounter : undefined
            });

            // Process citations if they exist
            if (outputItem.citations && outputItem.citations.length > 0) {
              outputItem.citations.forEach((citation) => {
                const sourceInfo = sourceMap.get(citation.chunk_source_id);
                console.log('PolicyChat: Processing citation:', {
                  chunk_source_id: citation.chunk_source_id,
                  sourceInfo: sourceInfo,
                  foundInMap: sourceMap.has(citation.chunk_source_id)
                });
                citations.push({
                  citation_id: citationIdCounter,
                  source_id: citation.chunk_source_id,
                  source_title: sourceInfo?.title || `Source Reference ${citation.chunk_source_id.substring(0, 8)}...`,
                  source_type: sourceInfo?.type || 'pdf',
                  chunk_lines_from: citation.chunk_lines_from,
                  chunk_lines_to: citation.chunk_lines_to,
                  chunk_index: citation.chunk_index,
                  excerpt: `Lines ${citation.chunk_lines_from}-${citation.chunk_lines_to}`
                });
              });
              citationIdCounter++;
            }
          });

          transformedMessage = {
            type: 'ai',
            content: {
              segments,
              citations
            },
            additional_kwargs: messageObj.additional_kwargs,
            response_metadata: messageObj.response_metadata,
            tool_calls: messageObj.tool_calls,
            invalid_tool_calls: messageObj.invalid_tool_calls
          };
        } else {
          // Fallback for AI messages that don't match expected format
          transformedMessage = {
            type: 'ai',
            content: messageObj.content,
            additional_kwargs: messageObj.additional_kwargs,
            response_metadata: messageObj.response_metadata,
            tool_calls: messageObj.tool_calls,
            invalid_tool_calls: messageObj.invalid_tool_calls
          };
        }
      } catch (parseError) {
        console.log('PolicyChat: Failed to parse AI content as JSON, treating as plain text:', parseError);
        // If parsing fails, treat as regular string content
        transformedMessage = {
          type: 'ai',
          content: messageObj.content,
          additional_kwargs: messageObj.additional_kwargs,
          response_metadata: messageObj.response_metadata,
          tool_calls: messageObj.tool_calls,
          invalid_tool_calls: messageObj.invalid_tool_calls
        };
      }
    } else {
      // Handle non-AI messages or AI messages that don't need parsing
      transformedMessage = {
        type: messageObj.type === 'human' ? 'human' : 'ai',
        content: messageObj.content || 'Empty message',
        additional_kwargs: messageObj.additional_kwargs,
        response_metadata: messageObj.response_metadata,
        tool_calls: messageObj.tool_calls,
        invalid_tool_calls: messageObj.invalid_tool_calls
      };
    }
  } else if (typeof item.message === 'string') {
    // Handle case where message is just a string
    transformedMessage = {
      type: 'human',
      content: item.message
    };
  } else {
    // Fallback for any other cases
    transformedMessage = {
      type: 'human',
      content: 'Unable to parse message'
    };
  }

  console.log('PolicyChat: Transformed message:', transformedMessage);

  return {
    id: item.id,
    session_id: item.session_id,
    message: transformedMessage
  };
};

export const usePolicyChat = (policyDocumentId?: string) => {
  const { user } = useAuth();
  const { userRole, isAuthenticated } = useUserRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['policy-chat-messages', policyDocumentId, userRole],
    queryFn: async () => {
      if (!policyDocumentId || !userRole) return [];

      console.log('PolicyChat: Fetching messages for role:', userRole);

      const { data, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', policyDocumentId)
        .order('id', { ascending: true });

      if (error) throw error;

      // Also fetch sources to get proper source titles
      // EXPANDED: Fetch all sources for the notebook to resolve citation IDs
      const { data: sourcesData, error: sourcesError } = await supabase
        .from('sources')
        .select(`
          id,
          title,
          type,
          policy_documents!inner(
            id,
            role_assignment
          )
        `)
        .eq('notebook_id', policyDocumentId);
        // Note: Removed role filter to ensure all citation source IDs can be resolved

      console.log('PolicyChat: Sources query result:', { sourcesData, sourcesError, userRole });

      const sourceMap = new Map(sourcesData?.map(s => [s.id, s]) || []);

      console.log('PolicyChat: Sources filtered by role:', sourceMap.size);
      console.log('PolicyChat: SourceMap entries:', Array.from(sourceMap.entries()));
      console.log('PolicyChat: Sample source data:', sourcesData?.slice(0, 2));

      // Transform the data to match our expected format
      return data.map((item) => transformMessage(item, sourceMap));
    },
    enabled: !!policyDocumentId && !!user && !!userRole && isAuthenticated,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Set up Realtime subscription for new messages with role awareness
  useEffect(() => {
    if (!policyDocumentId || !user || !userRole) return;

    console.log('PolicyChat: Setting up Realtime subscription for policy document:', policyDocumentId, 'role:', userRole);

    const channel = supabase
      .channel('policy-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'n8n_chat_histories',
          filter: `session_id=eq.${policyDocumentId}`
        },
        async (payload) => {
          console.log('PolicyChat: Realtime: New message received:', payload);

          // Fetch role-filtered sources for proper transformation
          const { data: sourcesData } = await supabase
            .from('sources')
            .select(`
              id,
              title,
              type,
              policy_documents!inner(
                id,
                role_assignment
              )
            `)
            .eq('notebook_id', policyDocumentId)
            .eq('policy_documents.role_assignment', userRole);

          const sourceMap = new Map(sourcesData?.map(s => [s.id, s]) || []);

          // Transform the new message
          const newMessage = transformMessage(payload.new, sourceMap);

          // Update the query cache with the new message
          queryClient.setQueryData(['policy-chat-messages', policyDocumentId, userRole], (oldMessages: EnhancedChatMessage[] = []) => {
            // Check if message already exists to prevent duplicates
            const messageExists = oldMessages.some(msg => msg.id === newMessage.id);
            if (messageExists) {
              console.log('PolicyChat: Message already exists, skipping:', newMessage.id);
              return oldMessages;
            }

            console.log('PolicyChat: Adding new message to cache:', newMessage);
            return [...oldMessages, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('PolicyChat: Realtime subscription status:', status);
      });

    return () => {
      console.log('PolicyChat: Cleaning up Realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [policyDocumentId, user, userRole, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async (messageData: {
      policyDocumentId: string;
      role: 'user' | 'assistant';
      content: string;
    }) => {
      if (!user || !userRole) throw new Error('User not authenticated or role not assigned');

      // CRITICAL SECURITY: Include user role in the request
      // Call the n8n webhook with role information
      const webhookResponse = await supabase.functions.invoke('send-policy-chat-message', {
        body: {
          session_id: messageData.policyDocumentId,
          message: messageData.content,
          user_id: user.id,
          user_role: userRole, // CRITICAL: Pass user role for backend filtering
          policy_document_id: messageData.policyDocumentId
        }
      });

      if (webhookResponse.error) {
        throw new Error(`Webhook error: ${webhookResponse.error.message}`);
      }

      return webhookResponse.data;
    },
    onSuccess: () => {
      // The response will appear via Realtime, so we don't need to do anything here
      console.log('PolicyChat: Message sent to webhook successfully');
    },
    onError: (error) => {
      console.error('PolicyChat: Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please check your permissions and try again.",
        variant: "destructive",
      });
    }
  });

  const deleteChatHistory = useMutation({
    mutationFn: async (policyDocumentId: string) => {
      if (!user || !userRole) throw new Error('User not authenticated or role not assigned');

      console.log('PolicyChat: Deleting chat history for policy document:', policyDocumentId);

      // CRITICAL SECURITY: Only delete messages for documents the user has access to
      // First verify the user has access to this policy document
      const { data: policyDoc, error: policyError } = await supabase
        .from('policy_documents')
        .select('id, role_assignment')
        .eq('id', policyDocumentId)
        .eq('role_assignment', userRole)
        .single();

      if (policyError || !policyDoc) {
        throw new Error('Access denied: You do not have permission to access this policy document');
      }

      const { error } = await supabase
        .from('n8n_chat_histories')
        .delete()
        .eq('session_id', policyDocumentId);

      if (error) {
        console.error('PolicyChat: Error deleting chat history:', error);
        throw error;
      }

      console.log('PolicyChat: Chat history deleted successfully');
      return policyDocumentId;
    },
    onSuccess: (policyDocumentId) => {
      console.log('PolicyChat: Chat history cleared for policy document:', policyDocumentId);
      toast({
        title: "Chat history cleared",
        description: "All messages have been deleted successfully.",
      });

      // Clear the query data and refetch to confirm
      queryClient.setQueryData(['policy-chat-messages', policyDocumentId, userRole], []);
      queryClient.invalidateQueries({
        queryKey: ['policy-chat-messages', policyDocumentId, userRole]
      });
    },
    onError: (error) => {
      console.error('PolicyChat: Failed to delete chat history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history. You may not have permission for this action.",
        variant: "destructive",
      });
    }
  });

  // Check if user has access to a specific policy document
  const hasAccessToPolicyDocument = async (policyDocumentId: string): Promise<boolean> => {
    if (!user || !userRole) return false;

    try {
      const { data, error } = await supabase
        .from('policy_documents')
        .select('id')
        .eq('id', policyDocumentId)
        .eq('role_assignment', userRole)
        .single();

      if (error || !data) {
        console.log('PolicyChat: Access denied for policy document:', policyDocumentId, 'role:', userRole);
        return false;
      }

      return true;
    } catch (error) {
      console.error('PolicyChat: Error checking policy document access:', error);
      return false;
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessage.mutate,
    sendMessageAsync: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
    deleteChatHistory: deleteChatHistory.mutate,
    isDeletingChatHistory: deleteChatHistory.isPending,
    hasAccessToPolicyDocument,
    userRole,
    isAuthenticated: isAuthenticated && !!userRole
  };
};