
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

interface ChatRequest {
  session_id: string
  message: string
}

interface UserRole {
  role: string
}

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
    const { session_id, message }: ChatRequest = await req.json();
    
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
    
    console.log('Received message:', { session_id, message, user_id });

    // Query user roles with role hierarchy precedence
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user_id)
      .order('role', { ascending: false }); // This will order by role priority

    if (roleError) {
      console.error('Error fetching user roles:', roleError);
      throw new Error('Failed to fetch user roles');
    }

    // Determine effective role with hierarchy: board > executive > administrator
    let effectiveRole = 'administrator'; // Default role
    
    if (userRoles && userRoles.length > 0) {
      const roles = userRoles.map(r => r.role);
      
      if (roles.includes('board')) {
        effectiveRole = 'board';
      } else if (roles.includes('executive')) {
        effectiveRole = 'executive';
      } else if (roles.includes('administrator')) {
        effectiveRole = 'administrator';
      }
    }

    console.log('User effective role:', effectiveRole);

    // Determine webhook URL based on role
    let webhookUrl: string;
    
    switch (effectiveRole) {
      case 'board':
        webhookUrl = Deno.env.get('BOARD_CHAT_URL') || Deno.env.get('NOTEBOOK_CHAT_URL')!;
        break;
      case 'executive':
        webhookUrl = Deno.env.get('EXECUTIVE_CHAT_URL') || Deno.env.get('NOTEBOOK_CHAT_URL')!;
        break;
      case 'administrator':
      default:
        webhookUrl = Deno.env.get('NOTEBOOK_CHAT_URL')!;
        break;
    }

    // Use the same auth header for all webhooks (Phase 1)
    const webhookAuthHeader = Deno.env.get('NOTEBOOK_GENERATION_AUTH');
    
    if (!webhookUrl) {
      throw new Error('No webhook URL configured for user role');
    }

    if (!webhookAuthHeader) {
      throw new Error('NOTEBOOK_GENERATION_AUTH environment variable not set');
    }

    console.log(`Sending to ${effectiveRole} webhook:`, webhookUrl);

    // Send message to n8n webhook with authentication
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': webhookAuthHeader,
      },
      body: JSON.stringify({
        session_id,
        message,
        user_id,
        user_role: effectiveRole,
        timestamp: new Date().toISOString()
      })
    });

    if (!webhookResponse.ok) {
      console.error(`Webhook responded with status: ${webhookResponse.status}`);
      const errorText = await webhookResponse.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`Webhook responded with status: ${webhookResponse.status}`);
    }

    const webhookData = await webhookResponse.json();
    console.log('Webhook response:', webhookData);

    return new Response(
      JSON.stringify({ success: true, data: webhookData }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in send-chat-message:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send message to webhook' 
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

