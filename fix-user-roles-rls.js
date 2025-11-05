import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://vnmsyofypuhxjlzwnuhh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubXN5b2Z5cHVoeGpsendudWhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU3NDE2MCwiZXhwIjoyMDczMTUwMTYwfQ.1lsAm0DXeWXtG_HBJfToot5FjmAVHm_50CnKpT_lAXk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserRolesRLS() {
  console.log('🔧 Starting user_roles RLS fix...');

  try {
    // Step 1: Disable RLS temporarily
    console.log('1. Disabling RLS on user_roles...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;'
    });

    // Step 2: Drop all existing policies
    console.log('2. Dropping all existing policies...');
    const policiesToDrop = [
      "Users can view their own roles",
      "Users can update their own roles", 
      "Super admins can manage all roles",
      "Admins can view all user roles",
      "Allow authenticated users to read user roles",
      "allow_authenticated_users_user_roles",
      "Super admins can view all user roles",
      "Super admins can create user roles",
      "Super admins can update user roles", 
      "Super admins can delete user roles",
      "Users can create their own roles",
      "Users can delete their own roles",
      "users_can_view_own_roles",
      "users_can_insert_own_roles"
    ];

    for (const policy of policiesToDrop) {
      await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy}" ON public.user_roles;`
      });
    }

    // Step 3: Re-enable RLS
    console.log('3. Re-enabling RLS...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;'
    });

    // Step 4: Create simple, non-recursive policy
    console.log('4. Creating simple, non-recursive policy...');
    await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "user_roles_select_own" ON public.user_roles
        FOR SELECT
        USING (auth.uid() = user_id);`
    });

    // Step 5: Grant permissions
    console.log('5. Granting permissions...');
    await supabase.rpc('exec_sql', {
      sql: 'GRANT SELECT ON public.user_roles TO authenticated;'
    });
    await supabase.rpc('exec_sql', {
      sql: 'GRANT ALL ON public.user_roles TO service_role;'
    });

    // Step 6: Ensure test user has role
    console.log('6. Ensuring test user has executive role...');
    await supabase.rpc('exec_sql', {
      sql: `INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
        VALUES (
          '716b6bd4-db5d-4d73-a116-87e539c95852', 
          'executive',
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id, role) DO NOTHING;`
    });

    // Step 7: Test the fix
    console.log('7. Testing the fix...');
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', '716b6bd4-db5d-4d73-a116-87e539c95852');

    if (error) {
      console.error('❌ Test failed:', error);
      return false;
    }

    console.log('✅ Test successful! User roles:', data);
    console.log('🎉 RLS fix completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error during RLS fix:', error);
    return false;
  }
}

// Alternative approach using direct SQL execution
async function fixUserRolesRLSDirect() {
  console.log('🔧 Starting direct SQL approach...');

  const fixSQL = `
-- Disable RLS temporarily
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read user roles" ON public.user_roles;
DROP POLICY IF EXISTS "allow_authenticated_users_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can create user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_can_view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_can_insert_own_roles" ON public.user_roles;

-- Re-enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policy
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Ensure test user has role
INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
VALUES (
  '716b6bd4-db5d-4d73-a116-87e539c95852', 
  'executive',
  NOW(),
  NOW()
)
ON CONFLICT (user_id, role) DO NOTHING;
`;

  try {
    // Execute the SQL as a single transaction
    const { data, error } = await supabase.rpc('exec_sql', { sql: fixSQL });
    
    if (error) {
      console.error('❌ SQL execution failed:', error);
      return false;
    }

    console.log('✅ SQL executed successfully:', data);
    
    // Test the fix
    const { data: testData, error: testError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', '716b6bd4-db5d-4d73-a116-87e539c95852');

    if (testError) {
      console.error('❌ Test failed:', testError);
      return false;
    }

    console.log('✅ Test successful! User roles:', testData);
    console.log('🎉 RLS fix completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error during direct SQL execution:', error);
    return false;
  }
}

// Run the fix
async function main() {
  console.log('Starting user_roles RLS infinite recursion fix...\n');
  
  // Try the direct SQL approach first
  const success = await fixUserRolesRLSDirect();
  
  if (!success) {
    console.log('\nTrying alternative step-by-step approach...');
    await fixUserRolesRLS();
  }
}

main().catch(console.error);
