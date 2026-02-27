import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface AssignRoleRequest {
  user_id: string;
  role: 'system_owner' | 'company_operator' | 'board' | 'administrator' | 'executive';
  action: 'assign' | 'revoke';
}

interface AssignRoleResponse {
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

    // Check if current user has permission to assign roles (query user_roles table)
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

    // system_owner, company_operator, board, and administrator can assign roles
    if (!['system_owner', 'company_operator', 'board', 'administrator'].includes(currentUserRole.role)) {
      return new Response(
        JSON.stringify({
          error: 'Access denied. Only System Owners, Company Operators, Board Members, and Administrators can assign roles.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: AssignRoleRequest = await req.json();
    const { user_id, role, action } = body;

    // Validate input
    if (!user_id || !role || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, role, action' }),
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

    if (!['assign', 'revoke'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be: assign or revoke' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Company operators, board members, and administrators cannot assign system_owner role
    if (['company_operator', 'board', 'administrator'].includes(currentUserRole.role) && role === 'system_owner') {
      return new Response(
        JSON.stringify({ error: 'Only System Owners can assign the System Owner role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify target user exists
    const { data: targetUser, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !targetUser.user) {
      return new Response(
        JSON.stringify({ error: 'Target user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: AssignRoleResponse;

    if (action === 'assign') {
      // Delete existing roles for this user, then insert the new one
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user_id);

      const { data: newRole, error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id, role })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to assign role: ${insertError.message}`);
      }

      result = {
        success: true,
        message: `Successfully assigned ${role} role to user`,
        data: newRole,
      };
    } else {
      // Revoke: delete the role entry
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .eq('role', role);

      if (deleteError) {
        throw new Error(`Failed to revoke role: ${deleteError.message}`);
      }

      result = {
        success: true,
        message: `Successfully revoked ${role} role from user`,
      };
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in assign-user-role function:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
