import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface GenerateSuggestionsParams {
  chatHistory?: ChatMessage[];
  sessionId: string;
  documentIds?: string[];
}

interface GenerateSuggestionsResponse {
  success: boolean;
  questions: string[];
  error?: string;
}

/**
 * Hook for generating AI-powered suggested questions based on chat history
 *
 * Features:
 * - Generates 3-5 contextual follow-up questions after AI responses
 * - Generates starter questions for empty chat sessions
 * - Uses OpenAI API via Supabase Edge Function
 * - Includes fallback questions if generation fails
 *
 * @returns {object} - { generateQuestions, isGenerating }
 *
 * @example
 * ```tsx
 * const { generateQuestions, isGenerating } = useGenerateSuggestedQuestions();
 *
 * // Generate initial questions (empty chat)
 * generateQuestions.mutate(
 *   { sessionId: 'abc-123', documentIds: ['doc1', 'doc2'] },
 *   { onSuccess: (data) => console.log(data.questions) }
 * );
 *
 * // Generate follow-up questions (ongoing conversation)
 * generateQuestions.mutate(
 *   {
 *     chatHistory: [
 *       { role: 'user', content: 'What is the leave policy?' },
 *       { role: 'assistant', content: '...' }
 *     ],
 *     sessionId: 'abc-123'
 *   },
 *   { onSuccess: (data) => console.log(data.questions) }
 * );
 * ```
 */
export const useGenerateSuggestedQuestions = () => {
  const generateQuestions = useMutation<
    GenerateSuggestionsResponse,
    Error,
    GenerateSuggestionsParams
  >({
    mutationFn: async ({
      chatHistory,
      sessionId,
      documentIds
    }: GenerateSuggestionsParams) => {
      const { data, error } = await supabase.functions.invoke(
        'generate-suggested-questions',
        {
          body: {
            chatHistory,
            sessionId,
            documentIds,
          },
        }
      );

      if (error) throw error;

      return data as GenerateSuggestionsResponse;
    },
    // Don't retry on failure - use fallback questions instead
    retry: false,
  });

  return {
    generateQuestions,
    isGenerating: generateQuestions.isPending,
  };
};
