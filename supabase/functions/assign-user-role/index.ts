import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface AssignRoleRequest {
  user_id: string;
  role: 'system_owner' | 'company_operator' | 'board_member' | 'administrator' | 'executive';
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

    // Check if current user has permission to assign roles
    const { data: currentUserData, error: roleCheckError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (roleCheckError || !currentUserData) {
      return new Response(
        JSON.stringify({
          error: 'User role not found'
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const currentUserRole = currentUserData.role;
    
    // Only system_owner and company_operator can assign roles
    if (!['system_owner', 'company_operator'].includes(currentUserRole)) {
      return new Response(
        JSON.stringify({
          error: 'Access denied. Only System Owners and Company Operators can assign roles.'
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

    if (!['system_owner', 'company_operator', 'board_member', 'administrator', 'executive'].includes(role)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid role. Must be: system_owner, company_operator, board_member, administrator, or executive'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Company operators cannot assign system_owner role
    if (currentUserRole === 'company_operator' && role === 'system_owner') {
      return new Response(
        JSON.stringify({
          error: 'Company Operators cannot assign System Owner role'
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
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
      // Update the user's role in the users table
      const { data: updatedUser, error: assignError } = await supabase
        .from('users')
        .update({ role })
        .eq('id', user_id)
        .select('*')
        .single();

      if (assignError) {
        throw assignError;
      }

      // Log the role change for audit
      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert({
          action: 'role_assignment',
          user_id,
          performed_by: user.id,
          details: {
            new_role: role,
            timestamp: new Date().toISOString()
          }
        });

      if (auditError) {
        console.warn('Failed to log role change:', auditError);
      }

      result = {
        success: true,
        message: `Successfully assigned ${role} role to user`,
        data: updatedUser,
      };
    } else {
      // For revoke action, we'll set the role to a default role
      // In a real system, you might want to handle this differently
      const { data: updatedUser, error: revokeError } = await supabase
        .from('users')
        .update({ role: 'executive' }) // Default role when revoking
        .eq('id', user_id)
        .select('*')
        .single();

      if (revokeError) {
        throw revokeError;
      }

      // Log the role change for audit
      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert({
          action: 'role_revocation',
          user_id,
          performed_by: user.id,
          details: {
            new_role: 'executive',
            timestamp: new Date().toISOString()
          }
        });

      if (auditError) {
        console.warn('Failed to log role revocation:', auditError);
      }

      result = {
        success: true,
        message: `Successfully revoked ${role} role from user`,
        data: updatedUser,
      };
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