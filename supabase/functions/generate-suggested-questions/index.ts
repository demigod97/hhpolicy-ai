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

interface GenerateSuggestionsRequest {
  chatHistory?: ChatMessage[];  // Optional - for ongoing conversation
  sessionId: string;             // Required
  documentIds?: string[];        // Optional - for context
}

interface GenerateSuggestionsResponse {
  success: boolean;
  questions: string[];
  error?: string;
}

console.info('generate-suggested-questions function started');

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatHistory, sessionId, documentIds }: GenerateSuggestionsRequest = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'sessionId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch document titles/topics for context
    let documentTopics = '';
    if (documentIds && documentIds.length > 0) {
      const { data: docs } = await supabase
        .from('sources')
        .select('title, type, policyName, policyType')
        .in('id', documentIds)
        .limit(10);

      if (docs && docs.length > 0) {
        documentTopics = docs.map(d =>
          d.policyName || d.title
        ).join(', ');
      }
    } else {
      // Fetch all documents for this session via chat_session_documents
      const { data: sessionDocs } = await supabase
        .from('chat_session_documents')
        .select(`
          sources (
            title,
            policyName,
            policyType
          )
        `)
        .eq('chat_session_id', sessionId)
        .limit(10);

      if (sessionDocs && sessionDocs.length > 0) {
        documentTopics = sessionDocs
          .map((sd: any) => sd.sources?.policyName || sd.sources?.title)
          .filter(Boolean)
          .join(', ');
      }
    }

    let systemPrompt = '';
    let userPrompt = '';

    // NEW: Generate questions based on chat history
    if (chatHistory && chatHistory.length > 0) {
      // Format recent chat history (last 3 exchanges = 6 messages)
      const recentHistory = chatHistory.slice(-6);
      const formattedHistory = recentHistory
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      systemPrompt = `You are a helpful assistant that generates relevant follow-up questions for a policy Q&A system. Based on the conversation history and available policy documents, suggest 3-5 questions the user might want to ask next.

Questions should be:
- Natural and conversational
- Relevant to the current topic
- Answerable by the available policy documents
- Progressively more detailed (start broad, get specific)
- Action-oriented and practical

Return ONLY a JSON array of question strings, no other text.`;

      userPrompt = `Available policy topics: ${documentTopics || 'Company policies, benefits, procedures'}

Recent conversation:
${formattedHistory.substring(0, 1500)}

Generate 3-5 relevant follow-up questions as a JSON array of strings.`;

    } else {
      // INITIAL STATE: Generate starter questions
      systemPrompt = `You are a helpful assistant that generates relevant starter questions for a policy Q&A system. Based on the available policy documents, suggest 3-5 questions a user might want to ask to explore the policies.

Questions should be:
- Broad and exploratory
- Cover different policy areas
- Natural and conversational
- Practical and action-oriented

Return ONLY a JSON array of question strings, no other text.`;

      userPrompt = `Available policy topics: ${documentTopics || 'Company policies, benefits, leave, remote work, performance reviews'}

Generate 3-5 starter questions that help users explore these policies. Return as a JSON array of strings.`;
    }

    // Call OpenAI to generate questions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);

      // Return fallback questions
      return new Response(
        JSON.stringify({
          success: true,
          questions: chatHistory && chatHistory.length > 0
            ? [
                "Can you provide more details about this?",
                "What are the exceptions to this policy?",
                "How does this apply in practice?"
              ]
            : [
                "What are the company's remote work policies?",
                "How do I request time off?",
                "What benefits am I eligible for?"
              ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Connection': 'keep-alive' } }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content.trim();

    console.log('Generated content:', generatedContent);

    // Parse the JSON response
    let questions: string[] = [];
    try {
      const parsed = JSON.parse(generatedContent);
      // Handle different possible JSON structures
      if (Array.isArray(parsed)) {
        questions = parsed;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions;
      } else if (parsed.suggested_questions && Array.isArray(parsed.suggested_questions)) {
        questions = parsed.suggested_questions;
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Return fallback questions
      questions = chatHistory && chatHistory.length > 0
        ? [
            "Can you elaborate on this topic?",
            "What are the specific requirements?",
            "How do I get started with this process?"
          ]
        : [
            "What policies are available?",
            "How do I submit a request?",
            "What are my benefits?"
          ];
    }

    // Ensure we have 3-5 questions
    if (questions.length < 3) {
      questions = [
        ...questions,
        "Can you provide more information?",
        "What else should I know?"
      ];
    }
    questions = questions.slice(0, 5);

    console.log('Final questions:', questions);

    return new Response(
      JSON.stringify({
        success: true,
        questions
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Connection': 'keep-alive' },
      }
    );
  } catch (error) {
    console.error('Error in generate-suggested-questions function:', error);

    // Return fallback questions even on error
    return new Response(
      JSON.stringify({
        success: true,
        questions: [
          "What policies are available?",
          "How do I submit a request?",
          "What are my benefits?"
        ]
      }),
      {
        status: 200, // Return 200 with fallback instead of 500
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
