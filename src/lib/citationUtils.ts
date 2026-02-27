import { EnhancedChatMessage } from '@/types/message';

/**
 * Detects if a message content string contains citation markers
 * Looks for patterns like [^1], [^2], etc.
 */
export function hasMarkdownCitations(content: string): boolean {
  return /\[\^\d+\]/.test(content);
}

/**
 * Checks if a chat message contains citations
 * Handles both string content (with markdown citations) and structured content (with citations array)
 */
export function messageHasCitations(message: EnhancedChatMessage): boolean {
  // Only check AI messages
  if (message.message.type !== 'ai') {
    return false;
  }

  const content = message.message.content;

  // Case 1: Structured content with citations array
  if (typeof content === 'object' && content.citations && Array.isArray(content.citations)) {
    return content.citations.length > 0;
  }

  // Case 2: String content with markdown citations
  if (typeof content === 'string') {
    return hasMarkdownCitations(content);
  }

  return false;
}

/**
 * Checks if any messages in the array contain citations
 */
export function chatHasCitations(messages: EnhancedChatMessage[]): boolean {
  return messages.some(messageHasCitations);
}

/**
 * Checks if chat has any user messages (messages sent by the user)
 */
export function chatHasUserMessages(messages: EnhancedChatMessage[]): boolean {
  return messages.some(msg => msg.message.type === 'human');
}

/**
 * Determines if the sources sidebar should be shown
 * Returns true if user has sent messages AND there are citations present
 */
export function shouldShowSourcesSidebar(messages: EnhancedChatMessage[]): boolean {
  const hasUserMessages = chatHasUserMessages(messages);
  const hasCitations = chatHasCitations(messages);
  return hasUserMessages && hasCitations;
}
