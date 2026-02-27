import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface GenerateTitleRequest {
  // For chat session titles (NEW)
  chatHistory?: ChatMessage[];
  sessionId?: string;

  // For source/notebook titles (EXISTING - backward compatible)
  content?: string;
}

console.info('generate-note-title function started');

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatHistory, sessionId, content }: GenerateTitleRequest = await req.json();

    let textToAnalyze = '';
    let titlePrompt = '';

    // NEW: Chat session title generation
    if (chatHistory && chatHistory.length > 0) {
      // Extract first few messages (up to 3 exchanges = 6 messages)
      const messagesToAnalyze = chatHistory.slice(0, 6);

      // Format chat history for analysis
      textToAnalyze = messagesToAnalyze
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      titlePrompt = `Based on this chat conversation, generate a concise 5-word title that captures the main topic or question being discussed. Focus on the user's intent and the subject matter. Return only the title, nothing else.\n\nConversation:\n${textToAnalyze.substring(0, 1500)}`;

    // EXISTING: Source/notebook title generation (backward compatible)
    } else if (content) {
      // Parse content if it's a structured AI response
      try {
        const parsed = JSON.parse(content);
        if (parsed.segments && parsed.segments.length > 0) {
          textToAnalyze = parsed.segments
            .slice(0, 3)
            .map((segment: any) => segment.text)
            .join(' ');
        } else {
          textToAnalyze = content;
        }
      } catch (e) {
        textToAnalyze = content;
      }

      // Truncate content to avoid token limits
      textToAnalyze = textToAnalyze.substring(0, 1000);
      titlePrompt = `Generate a 5-word title for this content: ${textToAnalyze}`;

    } else {
      return new Response(
        JSON.stringify({ error: 'Either chatHistory or content is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Call OpenAI to generate title
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates concise, descriptive titles. Generate a title that is exactly 5 words or fewer, capturing the main topic or theme. Return only the title, nothing else.'
          },
          {
            role: 'user',
            content: titlePrompt
          }
        ],
        max_tokens: 20,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedTitle = data.choices[0].message.content.trim();

    console.log('Generated title:', generatedTitle);

    // If sessionId provided, update chat_sessions table
    if (sessionId) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({
          title: generatedTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating chat session title:', updateError);
        // Don't fail the request, just log the error
      } else {
        console.log(`Updated chat session ${sessionId} with title: ${generatedTitle}`);
      }
    }

    return new Response(
      JSON.stringify({ title: generatedTitle }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Connection': 'keep-alive' },
      }
    );
  } catch (error) {
    console.error('Error in generate-note-title function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
