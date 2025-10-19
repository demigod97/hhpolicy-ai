// deno-lint-ignore-file no-window
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

// Type declarations for Supabase Edge Runtime
declare global {
  const Deno: {
    serve: (handler: (req: Request) => Response | Promise<Response>) => void;
    env: {
      get: (key: string) => string | undefined;
    };
  };
}

interface CopilotKitMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
}

interface CopilotKitRequest {
  messages: CopilotKitMessage[];
  context?: {
    session_id?: string;
    [key: string]: any;
  };
}

interface UserRole {
  role: string;
}

// Role-based instructions for AI behavior
const ROLE_INSTRUCTIONS: Record<string, string> = {
  board: `You are a strategic policy advisor for board-level executives. Focus on:
- High-level strategic implications
- Risk assessment and compliance
- Cross-departmental policy impacts
- Long-term organizational effects
Always cite sources with document names and page numbers.`,

  executive: `You are an executive assistant with access to executive and administrative policies. Focus on:
- Operational implications
- Department-specific guidance
- Implementation details
- Compliance requirements
Always cite sources with document names and page numbers.`,

  administrator: `You are a comprehensive policy assistant. Focus on:
- Detailed policy information
- Step-by-step procedures
- Specific requirements
- Practical application
Always cite sources with document names and page numbers.`,

  company_operator: `You are a company operations assistant. Focus on:
- Company-wide operations
- User management
- System administration
- Policy oversight
Always cite sources with document names and page numbers.`,

  system_owner: `You are a system administrator with full access. Focus on:
- System configuration
- Security policies
- Access control
- Strategic oversight
Always cite sources with document names and page numbers.`
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody: CopilotKitRequest = await req.json();
    const { messages, context } = requestBody;

    // Get the authorization header to extract user_id from JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    // Initialize Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      throw new Error('Invalid authentication token');
    }

    const user_id = user.id;

    console.log('CopilotKit adapter received request:', {
      messageCount: messages.length,
      user_id,
      session_id: context?.session_id
    });

    // Query user roles with role hierarchy precedence
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user_id)
      .order('role', { ascending: false });

    if (roleError) {
      console.error('Error fetching user roles:', roleError);
      throw new Error('Failed to fetch user roles');
    }

    // Determine effective role with hierarchy
    // Priority: system_owner > board > company_operator > executive > administrator
    let effectiveRole = 'administrator'; // Default role

    if (userRoles && userRoles.length > 0) {
      const roles = userRoles.map(r => r.role);

      if (roles.includes('system_owner')) {
        effectiveRole = 'system_owner';
      } else if (roles.includes('board')) {
        effectiveRole = 'board';
      } else if (roles.includes('company_operator')) {
        effectiveRole = 'company_operator';
      } else if (roles.includes('executive')) {
        effectiveRole = 'executive';
      } else if (roles.includes('administrator')) {
        effectiveRole = 'administrator';
      }
    }

    console.log('User effective role:', effectiveRole);

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      throw new Error('No user message found in request');
    }

    // Generate session_id if not provided
    const session_id = context?.session_id || `copilotkit_${user_id}_${Date.now()}`;

    // Determine webhook URL based on role
    // NOTE: Board and Executive workflows need to be deployed to n8n first
    // For now, all roles use NOTEBOOK_CHAT_URL until dedicated workflows are available
    let webhookUrl: string;
    let webhookKey: string;

    switch (effectiveRole) {
      case 'system_owner':
      case 'board':
        webhookKey = 'BOARD_CHAT_URL';
        webhookUrl = Deno.env.get('BOARD_CHAT_URL') || Deno.env.get('NOTEBOOK_CHAT_URL')!;
        if (!Deno.env.get('BOARD_CHAT_URL')) {
          console.warn('BOARD_CHAT_URL not set, falling back to NOTEBOOK_CHAT_URL');
        }
        break;
      case 'company_operator':
      case 'executive':
        webhookKey = 'EXECUTIVE_CHAT_URL';
        webhookUrl = Deno.env.get('EXECUTIVE_CHAT_URL') || Deno.env.get('NOTEBOOK_CHAT_URL')!;
        if (!Deno.env.get('EXECUTIVE_CHAT_URL')) {
          console.warn('EXECUTIVE_CHAT_URL not set, falling back to NOTEBOOK_CHAT_URL');
        }
        break;
      case 'administrator':
      default:
        webhookKey = 'NOTEBOOK_CHAT_URL';
        webhookUrl = Deno.env.get('NOTEBOOK_CHAT_URL')!;
        break;
    }

    // Get auth token from Supabase secrets
    // Format: Authorization: Coral@123
    const webhookAuthHeader = Deno.env.get('NOTEBOOK_GENERATION_AUTH');

    if (!webhookUrl) {
      throw new Error(`No webhook URL configured for ${effectiveRole} role (${webhookKey} not set)`);
    }

    if (!webhookAuthHeader) {
      throw new Error('NOTEBOOK_GENERATION_AUTH environment variable not set');
    }

    console.log(`Routing ${effectiveRole} to webhook:`, webhookUrl.substring(0, 50) + '...');

    // Add role-based system instruction to messages
    const roleInstruction = ROLE_INSTRUCTIONS[effectiveRole] || ROLE_INSTRUCTIONS.administrator;
    const enhancedMessages = [
      { role: 'system' as const, content: roleInstruction },
      ...messages
    ];

    // Send message to n8n webhook with authentication
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': webhookAuthHeader,
      },
      body: JSON.stringify({
        session_id,
        message: lastUserMessage.content,
        user_id,
        user_role: effectiveRole,
        timestamp: new Date().toISOString(),
        copilotkit_messages: enhancedMessages // Pass full conversation context
      })
    });

    if (!webhookResponse.ok) {
      console.error(`Webhook responded with status: ${webhookResponse.status}`);
      const errorText = await webhookResponse.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`Webhook responded with status: ${webhookResponse.status}`);
    }

    const webhookData = await webhookResponse.json();
    console.log('Webhook response received');

    // Transform n8n response to CopilotKit format
    // n8n returns: { output: [{ text, citations }] }
    let assistantMessage = '';

    if (webhookData.output && Array.isArray(webhookData.output)) {
      // Extract text and citations from n8n format
      assistantMessage = webhookData.output
        .map((item: any) => {
          if (typeof item === 'string') return item;
          if (item.text) return item.text;
          return '';
        })
        .join('\n\n');
    } else if (webhookData.text) {
      assistantMessage = webhookData.text;
    } else if (typeof webhookData === 'string') {
      assistantMessage = webhookData;
    }

    // Return CopilotKit-compatible response
    const response = {
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: assistantMessage,
          id: `assistant_${Date.now()}`
        }
      ],
      context: {
        ...context,
        session_id,
        user_role: effectiveRole,
        webhook_data: webhookData // Include raw webhook data for debugging
      }
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in copilotkit-adapter:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process CopilotKit request',
        messages: []
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
