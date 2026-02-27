import { useMemo } from 'react';
import { EnhancedChatMessage } from '@/types/message';
import {
  chatHasCitations,
  chatHasUserMessages,
  shouldShowSourcesSidebar,
} from '@/lib/citationUtils';

/**
 * Hook to determine sources sidebar visibility based on chat messages
 *
 * @param messages - Array of chat messages
 * @returns Object containing visibility flags and sidebar state
 */
export function useChatSidebarVisibility(messages: EnhancedChatMessage[] | undefined) {
  const hasUserMessages = useMemo(() => {
    if (!messages || messages.length === 0) return false;
    return chatHasUserMessages(messages);
  }, [messages]);

  const hasCitations = useMemo(() => {
    if (!messages || messages.length === 0) return false;
    return chatHasCitations(messages);
  }, [messages]);

  const showSourcesSidebar = useMemo(() => {
    if (!messages || messages.length === 0) return false;
    return shouldShowSourcesSidebar(messages);
  }, [messages]);

  return {
    hasUserMessages,
    hasCitations,
    showSourcesSidebar,
  };
}
