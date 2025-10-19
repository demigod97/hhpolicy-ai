import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface BulkAssignRoleRequest {
  user_ids: string[];
  role: 'system_owner' | 'company_operator' | 'board_member' | 'administrator' | 'executive';
}

interface BulkAssignRoleResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
  results?: Array<{
    user_id: string;
    success: boolean;
    error?: string;
  }>;
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
    const body: BulkAssignRoleRequest = await req.json();
    const { user_ids, role } = body;

    // Validate input
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Missing or invalid user_ids array'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!role) {
      return new Response(
        JSON.stringify({
          error: 'Missing required field: role'
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

    // Process each user
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const user_id of user_ids) {
      try {
        // Update the user's role
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ role })
          .eq('id', user_id)
          .select('*')
          .single();

        if (updateError) {
          results.push({
            user_id,
            success: false,
            error: updateError.message
          });
          errorCount++;
        } else {
          results.push({
            user_id,
            success: true
          });
          successCount++;

          // Log the role change for audit
          const { error: auditError } = await supabase
            .from('audit_logs')
            .insert({
              action: 'bulk_role_assignment',
              user_id,
              performed_by: user.id,
              details: {
                new_role: role,
                bulk_operation: true,
                affected_users: user_ids.length,
                timestamp: new Date().toISOString()
              }
            });

          if (auditError) {
            console.warn('Failed to log bulk role change:', auditError);
          }
        }
      } catch (error) {
        results.push({
          user_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        errorCount++;
      }
    }

    const response: BulkAssignRoleResponse = {
      success: errorCount === 0,
      message: `Successfully updated ${successCount} user${successCount !== 1 ? 's' : ''} role${successCount !== 1 ? 's' : ''}. ${errorCount} error${errorCount !== 1 ? 's' : ''} occurred.`,
      results
    };

    return new Response(
      JSON.stringify(response),
      {
        status: errorCount === 0 ? 200 : 207, // 207 Multi-Status for partial success
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in bulk-assign-user-roles function:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
