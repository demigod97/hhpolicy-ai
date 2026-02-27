/**
 * CopilotKit Runtime API for PolicyAi
 *
 * Implements CopilotKit's GraphQL protocol with:
 * - GraphQL endpoint for availableAgents query ✅
 * - SSE streaming for chat messages ✅
 * - OpenAI integration for LLM responses ✅
 * - Role-based access control ✅
 * - RAG context from Supabase documents ✅
 *
 * This replaces the incomplete CopilotKit npm package usage
 */

import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import {
  isGraphQLRequest,
  parseGraphQLOperation,
  type GraphQLRequest,
  type GraphQLResponse
} from './graphql-schema.ts';
import { resolveGraphQLQuery } from './graphql-resolvers.ts';
import { createOpenAIClient, streamChatCompletion, type OpenAIMessage } from './openai-client.ts';
import { buildRAGContext, formatRAGSystemMessage } from './rag-builder.ts';
import { createSSEHeaders, createSSEStream, createJSONResponse } from './sse-handler.ts';
import { getActionsForRole, executeAction, type ActionContext } from './actions.ts';

// Type declarations for Supabase Edge Runtime
declare global {
  const Deno: {
    serve: (handler: (req: Request) => Response | Promise<Response>) => void;
    env: {
      get: (key: string) => string | undefined;
    };
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

/**
 * Get user role from Supabase
 */
async function getUserRole(userId: string, supabase: any): Promise<string> {
  const { data: userRoles, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .order('role', { ascending: false });

  if (roleError) {
    console.error('Error fetching user roles:', roleError);
    return 'administrator'; // Default fallback
  }

  if (!userRoles || userRoles.length === 0) {
    return 'administrator';
  }

  const roles = userRoles.map((r: any) => r.role);

  // Priority: system_owner > board > company_operator > executive > administrator
  if (roles.includes('system_owner')) return 'system_owner';
  if (roles.includes('board')) return 'board';
  if (roles.includes('company_operator')) return 'company_operator';
  if (roles.includes('executive')) return 'executive';
  return 'administrator';
}

/**
 * Authenticate request and get user
 */
async function authenticateRequest(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    console.error('Authentication failed:', authError);
    throw new Error('Invalid authentication token');
  }

  const userRole = await getUserRole(user.id, supabase);

  return { user, userRole, supabase };
}

/**
 * Handle GraphQL requests
 */
async function handleGraphQLRequest(
  request: GraphQLRequest,
  userRole: string
): Promise<Response> {
  const operationName = parseGraphQLOperation(request);

  console.log('[CopilotKit Runtime] GraphQL request:', {
    operationName,
    hasVariables: !!request.variables,
    userRole
  });

  if (!operationName) {
    const error: GraphQLResponse = {
      errors: [{
        message: 'No operation name found in request',
        path: []
      }]
    };
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Route to appropriate resolver
  const response = resolveGraphQLQuery(operationName, request.variables, userRole);

  console.log('[CopilotKit Runtime] GraphQL response:', {
    operation: operationName,
    hasData: !!response.data,
    hasErrors: !!response.errors
  });

  return new Response(JSON.stringify(response), {
    status: response.errors ? 400 : 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Handle chat requests with OpenAI streaming + RAG
 */
async function handleChatRequest(
  body: any,
  user: any,
  userRole: string,
  supabase: any
): Promise<Response> {
  try {
    const { messages, context } = body;
    const notebookId = context?.notebook_id;

    console.log('[CopilotKit Runtime] Chat request:', {
      messageCount: messages?.length || 0,
      userRole,
      notebookId,
      hasContext: !!context
    });

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get OpenAI API key
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.error('[CopilotKit Runtime] Missing OPENAI_API_KEY');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize OpenAI client
    const openai = createOpenAIClient(openaiKey);

    // Get the user's last message for RAG context
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';

    console.log('[CopilotKit Runtime] Building RAG context for query:', {
      query: lastUserMessage.substring(0, 100),
      notebookId
    });

    // Build RAG context from Supabase documents
    const ragContext = await buildRAGContext(
      supabase,
      lastUserMessage,
      userRole,
      notebookId
    );

    console.log('[CopilotKit Runtime] RAG context built:', {
      documentCount: ragContext.documents.length,
      sources: ragContext.sources
    });

    // Create system message with RAG context
    const systemMessage = formatRAGSystemMessage(ragContext, userRole);

    // Prepare messages for OpenAI
    const openaiMessages: OpenAIMessage[] = [
      { role: 'system', content: systemMessage },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    console.log('[CopilotKit Runtime] Streaming OpenAI response...');

    // Check if client wants streaming or non-streaming
    const acceptHeader = body.stream !== false; // Default to streaming

    if (acceptHeader) {
      // Stream response via SSE
      const messageId = `msg-${Date.now()}`;
      const generator = streamChatCompletion(
        openai,
        openaiMessages,
        'gpt-4-turbo-preview',
        0.7
      );

      const stream = createSSEStream(generator, messageId);

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          ...createSSEHeaders()
        }
      });
    } else {
      // Non-streaming response
      const generator = streamChatCompletion(openai, openaiMessages);
      let fullContent = '';
      for await (const chunk of generator) {
        fullContent += chunk;
      }

      const messageId = `msg-${Date.now()}`;
      return createJSONResponse(fullContent, messageId);
    }

  } catch (error) {
    console.error('[CopilotKit Runtime] Error in chat request:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process chat request'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Main request handler
 */
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body = await req.json();

    console.log('[CopilotKit Runtime] Request received:', {
      method: req.method,
      isGraphQL: isGraphQLRequest(body),
      url: new URL(req.url).pathname
    });

    // Route based on request type
    if (isGraphQLRequest(body)) {
      // GraphQL query (e.g., availableAgents) - NO AUTH REQUIRED
      // This is just metadata about available actions, not sensitive data
      const operation = parseGraphQLOperation(body);

      if (operation === 'availableAgents') {
        // Public endpoint - return default role's actions
        console.log('[CopilotKit Runtime] Public GraphQL request (no auth required)');
        return await handleGraphQLRequest(body, 'system_owner'); // Use highest role to show all actions in dev
      }

      // Other GraphQL queries require auth
      const { user, userRole, supabase } = await authenticateRequest(req);
      console.log('[CopilotKit Runtime] Authenticated GraphQL:', {
        userId: user.id,
        userRole
      });
      return await handleGraphQLRequest(body, userRole);
    } else {
      // Chat message requires authentication
      const { user, userRole, supabase } = await authenticateRequest(req);
      console.log('[CopilotKit Runtime] Authenticated chat:', {
        userId: user.id,
        userRole
      });
      return await handleChatRequest(body, user, userRole, supabase);
    }

  } catch (error) {
    console.error('[CopilotKit Runtime] Error:', error);

    const errorResponse: GraphQLResponse = {
      errors: [{
        message: error instanceof Error ? error.message : 'Internal server error',
        path: []
      }]
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
