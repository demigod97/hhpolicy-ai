import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface GenerateTitleParams {
  chatHistory: ChatMessage[];
  sessionId: string;
}

export const useGenerateChatTitle = () => {
  const generateTitle = useMutation({
    mutationFn: async ({ chatHistory, sessionId }: GenerateTitleParams) => {
      const { data, error } = await supabase.functions.invoke('generate-note-title', {
        body: {
          chatHistory,
          sessionId,
        },
      });

      if (error) throw error;
      return data;
    },
  });

  return {
    generateTitle,
  };
};
