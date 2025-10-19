/**
 * Custom CopilotKit Chat Hook
 *
 * This replaces @copilotkit/react-core's useCopilotChat hook with a lightweight
 * implementation that directly calls our copilotkit-runtime edge function.
 *
 * This avoids compatibility issues between the CopilotKit npm package and our
 * Deno-based Supabase Edge Functions.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface UseCopilotKitChatOptions {
  id: string;
  makeSystemMessage?: () => string;
  context?: Record<string, any>;
}

export interface UseCopilotKitChatReturn {
  messages: CopilotMessage[];
  appendMessage: (message: { role: 'user' | 'assistant'; content: string }) => Promise<void>;
  isLoading: boolean;
  deleteMessages: () => Promise<void>;
  error: Error | null;
}

/**
 * Custom CopilotKit chat hook that directly calls our edge function
 */
export function useCopilotKitChat(
  options: UseCopilotKitChatOptions
): UseCopilotKitChatReturn {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Append a message and get AI response
   */
  const appendMessage = useCallback(async (message: { role: 'user' | 'assistant'; content: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: CopilotMessage = {
        id: `user-${Date.now()}`,
        role: message.role,
        content: message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // Only call AI if it's a user message
      if (message.role === 'user') {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('No active session');
        }

        // Call our copilotkit-runtime edge function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/copilotkit-runtime`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              messages: [
                ...(options.makeSystemMessage ? [{
                  role: 'system',
                  content: options.makeSystemMessage()
                }] : []),
                ...messages.map(m => ({
                  role: m.role,
                  content: m.content
                })),
                {
                  role: 'user',
                  content: message.content
                }
              ],
              context: options.context
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'Failed to get response');
        }

        const data = await response.json();

        // Handle different response formats
        let assistantContent = '';

        if (data.messages && Array.isArray(data.messages)) {
          // CopilotKit format: { messages: [...] }
          const lastMessage = data.messages[data.messages.length - 1];
          assistantContent = lastMessage.content;
        } else if (data.content) {
          // Direct content format: { content: "..." }
          assistantContent = data.content;
        } else if (data.text) {
          // Text format: { text: "..." }
          assistantContent = data.text;
        } else if (typeof data === 'string') {
          // Plain string response
          assistantContent = data;
        } else {
          throw new Error('Unexpected response format from runtime');
        }

        // Add assistant message
        const assistantMessage: CopilotMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Error in appendMessage:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));

      // Add error message to chat
      const errorMessage: CopilotMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}. Please try again or use legacy chat mode.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, options]);

  /**
   * Clear all messages
   */
  const deleteMessages = useCallback(async () => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    appendMessage,
    isLoading,
    deleteMessages,
    error
  };
}
