import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface AssignRoleRequest {
  user_id: string;
  role: 'administrator' | 'executive' | 'super_admin';
  action: 'assign' | 'revoke';
}

interface AssignRoleResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the current user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if current user is super admin
    const { data: currentUserRoles, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin');

    if (roleCheckError || !currentUserRoles || currentUserRoles.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Access denied. Only super admins can assign roles.'
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: AssignRoleRequest = await req.json();
    const { user_id, role, action } = body;

    // Validate input
    if (!user_id || !role || !action) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: user_id, role, action'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['administrator', 'executive', 'super_admin'].includes(role)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid role. Must be: administrator, executive, or super_admin'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['assign', 'revoke'].includes(action)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid action. Must be: assign or revoke'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify target user exists
    const { data: targetUser, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !targetUser.user) {
      return new Response(
        JSON.stringify({ error: 'Target user not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let result: AssignRoleResponse;

    if (action === 'assign') {
      // Check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user_id)
        .eq('role', role)
        .single();

      if (existingRole) {
        result = {
          success: false,
          message: `User already has ${role} role`,
        };
      } else {
        // Assign the role
        const { data: roleData, error: assignError } = await supabase
          .from('user_roles')
          .insert({
            user_id,
            role,
          })
          .select('*')
          .single();

        if (assignError) {
          throw assignError;
        }

        result = {
          success: true,
          message: `Successfully assigned ${role} role to user`,
          data: roleData,
        };
      }
    } else {
      // Revoke the role
      const { data: revokedRole, error: revokeError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .eq('role', role)
        .select('*');

      if (revokeError) {
        throw revokeError;
      }

      if (!revokedRole || revokedRole.length === 0) {
        result = {
          success: false,
          message: `User does not have ${role} role to revoke`,
        };
      } else {
        result = {
          success: true,
          message: `Successfully revoked ${role} role from user`,
          data: revokedRole[0],
        };
      }
    }

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in assign-user-role function:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});