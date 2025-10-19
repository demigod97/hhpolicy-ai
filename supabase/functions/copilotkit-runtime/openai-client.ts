/**
 * OpenAI Client for CopilotKit Runtime
 *
 * Handles streaming chat completions with OpenAI API
 */

import OpenAI from 'npm:openai@4.71.1';

/**
 * Initialize OpenAI client
 */
export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
  });
}

/**
 * Message format for OpenAI API
 */
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Stream chat completion from OpenAI
 */
export async function* streamChatCompletion(
  openai: OpenAI,
  messages: OpenAIMessage[],
  model: string = 'gpt-4-turbo-preview',
  temperature: number = 0.7
) {
  const stream = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    if (delta?.content) {
      yield delta.content;
    }
  }
}

/**
 * Get non-streaming chat completion from OpenAI
 */
export async function getChatCompletion(
  openai: OpenAI,
  messages: OpenAIMessage[],
  model: string = 'gpt-4-turbo-preview',
  temperature: number = 0.7
): Promise<string> {
  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    stream: false,
  });

  return response.choices[0]?.message?.content || '';
}
