import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface GetUsersResponse {
  success: boolean;
  data?: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
    last_active: string;
    is_active: boolean;
  }>;
  error?: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
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

    // Check if current user has permission to view users
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
    
    // Only system_owner and company_operator can view all users
    if (!['system_owner', 'company_operator'].includes(currentUserRole)) {
      return new Response(
        JSON.stringify({
          error: 'Access denied. Only System Owners and Company Operators can view user lists.'
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        created_at,
        last_active,
        is_active
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      throw usersError;
    }

    const response: GetUsersResponse = {
      success: true,
      data: users || []
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-users function:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
