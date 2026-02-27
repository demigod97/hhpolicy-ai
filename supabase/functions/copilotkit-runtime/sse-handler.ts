/**
 * Server-Sent Events (SSE) Handler
 *
 * Handles streaming responses for CopilotKit chat
 */

/**
 * SSE Event Types
 */
export type SSEEventType =
  | 'message_start'
  | 'content_delta'
  | 'message_end'
  | 'citation'
  | 'error';

export interface SSEEvent {
  type: SSEEventType;
  data: any;
}

/**
 * Create SSE response headers
 */
export function createSSEHeaders(): Record<string, string> {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

/**
 * Format SSE event
 */
export function formatSSEEvent(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Create SSE stream from async generator
 */
export function createSSEStream(
  generator: AsyncGenerator<string, void, unknown>,
  messageId: string
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        // Send message start event
        controller.enqueue(
          encoder.encode(formatSSEEvent({
            type: 'message_start',
            data: { messageId }
          }))
        );

        // Stream content deltas
        for await (const chunk of generator) {
          controller.enqueue(
            encoder.encode(formatSSEEvent({
              type: 'content_delta',
              data: { content: chunk }
            }))
          );
        }

        // Send message end event
        controller.enqueue(
          encoder.encode(formatSSEEvent({
            type: 'message_end',
            data: { messageId }
          }))
        );

      } catch (error) {
        console.error('[SSE] Error in stream:', error);

        // Send error event
        controller.enqueue(
          encoder.encode(formatSSEEvent({
            type: 'error',
            data: {
              message: error instanceof Error ? error.message : 'Unknown error'
            }
          }))
        );
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Create non-streaming JSON response (fallback)
 */
export function createJSONResponse(content: string, messageId: string): Response {
  return new Response(
    JSON.stringify({
      id: messageId,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString()
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    }
  );
}
