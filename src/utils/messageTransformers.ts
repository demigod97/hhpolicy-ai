/**
 * Message Transformers
 *
 * Bidirectional transformers between n8n message format and AG-UI/CopilotKit format.
 * Ensures backward compatibility while enabling AG-UI protocol features.
 *
 * @module utils/messageTransformers
 */

import { Message } from '@copilotkit/runtime-client-gql';
import { Citation, MessageSegment, EnhancedChatMessage } from '@/types/message';

/**
 * Source information for citation mapping
 */
interface SourceInfo {
  id: string;
  title: string;
  type: string;
}

/**
 * n8n AI response content structure
 */
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

/**
 * Transform n8n message format to AG-UI/CopilotKit format
 *
 * @param n8nMessage - Message from n8n_chat_histories table
 * @param sourceMap - Map of source IDs to source information for citation resolution
 * @returns CopilotKit Message format
 */
export function transformN8nToAGUI(
  n8nMessage: any,
  sourceMap: Map<string, SourceInfo>
): Message {
  const messageObj = n8nMessage.message;

  // Handle human messages
  if (messageObj?.type === 'human') {
    return {
      id: n8nMessage.id.toString(),
      role: 'user',
      content: typeof messageObj.content === 'string'
        ? messageObj.content
        : JSON.stringify(messageObj.content),
      createdAt: new Date().toISOString()
    };
  }

  // Handle AI messages with citations
  if (messageObj?.type === 'ai') {
    let content = '';
    let metadata: any = {};

    // Try to parse structured content
    if (typeof messageObj.content === 'string') {
      try {
        const parsed = JSON.parse(messageObj.content) as N8nAiResponseContent;
        if (parsed.output && Array.isArray(parsed.output)) {
          // Extract text and citations
          const textParts: string[] = [];
          const citations: Citation[] = [];
          let citationIdCounter = 1;

          parsed.output.forEach((item: any, idx: number) => {
            textParts.push(item.text);

            if (item.citations && Array.isArray(item.citations)) {
              item.citations.forEach((cite: any) => {
                const sourceInfo = sourceMap.get(cite.chunk_source_id);
                citations.push({
                  citation_id: citationIdCounter,
                  source_id: cite.chunk_source_id,
                  source_title: sourceInfo?.title || `Source ${cite.chunk_source_id.substring(0, 8)}...`,
                  source_type: sourceInfo?.type || 'pdf',
                  chunk_lines_from: cite.chunk_lines_from,
                  chunk_lines_to: cite.chunk_lines_to,
                  chunk_index: cite.chunk_index,
                  excerpt: `Lines ${cite.chunk_lines_from}-${cite.chunk_lines_to}`
                });
              });
              citationIdCounter++;
            }
          });

          content = textParts.join('\n\n');
          metadata = { citations };
        } else {
          content = messageObj.content;
        }
      } catch (e) {
        // If parsing fails, treat as plain text
        content = messageObj.content;
      }
    } else if (typeof messageObj.content === 'object') {
      // Already structured content
      if (messageObj.content.segments) {
        content = messageObj.content.segments
          .map((seg: any) => seg.text)
          .join('');
      }
      metadata = {
        citations: messageObj.content.citations || []
      };
    }

    return {
      id: n8nMessage.id.toString(),
      role: 'assistant',
      content,
      metadata,
      createdAt: new Date().toISOString()
    };
  }

  // Fallback for unknown message types
  return {
    id: n8nMessage.id.toString(),
    role: 'user',
    content: 'Unknown message format',
    createdAt: new Date().toISOString()
  };
}

/**
 * Transform AG-UI/CopilotKit message to n8n format for storage
 *
 * @param aguiMessage - CopilotKit Message format
 * @returns n8n message format for storage in n8n_chat_histories
 */
export function transformAGUIToN8n(aguiMessage: Message): any {
  const isHuman = aguiMessage.role === 'user';

  // For messages with citations, create structured content
  if (aguiMessage.metadata?.citations && Array.isArray(aguiMessage.metadata.citations)) {
    const segments: MessageSegment[] = [{
      text: aguiMessage.content,
      citation_id: aguiMessage.metadata.citations.length > 0 ? 1 : undefined
    }];

    return {
      type: isHuman ? 'human' : 'ai',
      content: {
        segments,
        citations: aguiMessage.metadata.citations
      },
      additional_kwargs: aguiMessage.metadata?.additional_kwargs || {},
      response_metadata: aguiMessage.metadata?.response_metadata || {}
    };
  }

  // For simple messages without citations
  return {
    type: isHuman ? 'human' : 'ai',
    content: aguiMessage.content,
    additional_kwargs: aguiMessage.metadata?.additional_kwargs || {},
    response_metadata: aguiMessage.metadata?.response_metadata || {}
  };
}

/**
 * Transform EnhancedChatMessage to CopilotKit Message format
 *
 * @param enhancedMessage - EnhancedChatMessage from current system
 * @returns CopilotKit Message format
 */
export function transformEnhancedToAGUI(enhancedMessage: EnhancedChatMessage): Message {
  const isHuman = enhancedMessage.message.type === 'human';

  let content = '';
  let metadata: any = {};

  // Extract content based on message structure
  if (typeof enhancedMessage.message.content === 'string') {
    content = enhancedMessage.message.content;
  } else if (typeof enhancedMessage.message.content === 'object') {
    const contentObj = enhancedMessage.message.content as any;

    if (contentObj.segments && Array.isArray(contentObj.segments)) {
      content = contentObj.segments.map((seg: MessageSegment) => seg.text).join('');
    }

    if (contentObj.citations) {
      metadata.citations = contentObj.citations;
    }
  }

  return {
    id: enhancedMessage.id,
    role: isHuman ? 'user' : 'assistant',
    content,
    metadata,
    createdAt: new Date().toISOString()
  };
}

/**
 * Batch transform multiple n8n messages to AG-UI format
 *
 * @param n8nMessages - Array of n8n messages
 * @param sourceMap - Map of source IDs to source information
 * @returns Array of CopilotKit Messages
 */
export function transformN8nMessagesToAGUI(
  n8nMessages: any[],
  sourceMap: Map<string, SourceInfo>
): Message[] {
  return n8nMessages.map(msg => transformN8nToAGUI(msg, sourceMap));
}

/**
 * Validate message format before transformation
 *
 * @param message - Message to validate
 * @returns boolean indicating if message is valid
 */
export function validateMessageFormat(message: any): boolean {
  if (!message) return false;
  if (!message.id) return false;
  if (!message.message) return false;
  if (!message.message.type) return false;
  if (!message.message.content) return false;

  return true;
}
