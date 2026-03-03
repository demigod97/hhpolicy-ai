import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface InviteUserRequest {
  email: string;
  role: 'system_owner' | 'company_operator' | 'board' | 'administrator' | 'executive';
  name?: string;
}

interface InviteUserResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_ROLES = ['system_owner', 'company_operator', 'board', 'administrator', 'executive'];

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Service role client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract user from JWT (already verified by Supabase gateway)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let user: { id: string; email: string };
    try {
      const payloadStr = atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadStr);
      if (!payload.sub) throw new Error('Missing sub claim');
      user = { id: payload.sub, email: payload.email || '' };
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if current user has permission to invite users (query user_roles table)
    const { data: currentUserRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleCheckError || !currentUserRole) {
      return new Response(
        JSON.stringify({ error: 'User role not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only system_owner, company_operator, and administrator can invite users
    if (!['system_owner', 'company_operator', 'administrator'].includes(currentUserRole.role)) {
      return new Response(
        JSON.stringify({
          error: 'Access denied. Only System Owners, Company Operators, and Administrators can invite users.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: InviteUserRequest = await req.json();
    const { email, role, name } = body;

    // Validate input
    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return new Response(
        JSON.stringify({
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // administrator cannot invite as system_owner or company_operator
    if (currentUserRole.role === 'administrator' && ['system_owner', 'company_operator'].includes(role)) {
      return new Response(
        JSON.stringify({
          error: 'Administrators can only invite board members, administrators, or executives.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // company_operator cannot invite as system_owner
    if (currentUserRole.role === 'company_operator' && role === 'system_owner') {
      return new Response(
        JSON.stringify({ error: 'Only System Owners can invite another System Owner.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send invite email via Supabase Auth admin API
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          name: name || email.split('@')[0],
        },
      }
    );

    if (inviteError) {
      // Detect duplicate / already-registered user
      if (
        inviteError.message?.toLowerCase().includes('already registered') ||
        inviteError.message?.toLowerCase().includes('already exists') ||
        inviteError.status === 422
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `User with email ${email} already exists in the system.`,
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Failed to invite user: ${inviteError.message}`);
    }

    const invitedUser = inviteData.user;

    // Insert role into user_roles table
    const { error: roleInsertError } = await supabase
      .from('user_roles')
      .insert({ user_id: invitedUser.id, role });

    if (roleInsertError) {
      throw new Error(`User invited but role assignment failed: ${roleInsertError.message}`);
    }

    const result: InviteUserResponse = {
      success: true,
      message: 'User invited successfully',
      data: { user_id: invitedUser.id },
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in invite-user function:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
