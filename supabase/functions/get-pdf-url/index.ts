/**
 * Edge Function: get-pdf-url
 *
 * Purpose: Generate signed URLs for PDF documents with role-based access control
 *
 * This function:
 * 1. Checks if the user has access to the document via RLS policies
 * 2. If authorized, generates a signed URL using service role (bypasses storage policies)
 * 3. Returns the signed URL for the client to load the PDF
 *
 * This approach solves the "ambiguous column reference" issue by avoiding
 * storage policies entirely and relying on sources table RLS for authorization.
 */

import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

interface RequestBody {
  documentId: string;
}

interface ErrorResponse {
  error: string;
  message?: string;
}

interface SuccessResponse {
  signedUrl: string;
  expiresIn: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' } as ErrorResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { documentId }: RequestBody = await req.json();
    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Missing documentId parameter' } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with user's auth token
    // This client will respect RLS policies
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Step 1: Check if user has access to this document via RLS
    // If they can query it, they have permission
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .select('id, pdf_file_path, pdf_storage_bucket, title, target_role')
      .eq('id', documentId)
      .eq('type', 'pdf')
      .single();

    if (sourceError || !source) {
      console.error('Access check failed:', sourceError);
      return new Response(
        JSON.stringify({
          error: 'Access denied',
          message: 'You do not have permission to access this document',
        } as ErrorResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 2: Verify document has a PDF file path
    if (!source.pdf_file_path) {
      return new Response(
        JSON.stringify({
          error: 'No PDF available',
          message: 'This document does not have an associated PDF file',
        } as ErrorResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 3: User has access, now create signed URL using service role
    // Service role bypasses storage policies completely
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const bucket = source.pdf_storage_bucket || 'sources';
    const filePath = source.pdf_file_path;
    const expiresIn = 3600; // 1 hour

    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (urlError || !urlData?.signedUrl) {
      console.error('Failed to create signed URL:', urlError);
      return new Response(
        JSON.stringify({
          error: 'Failed to generate URL',
          message: 'Could not create signed URL for the PDF file',
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 4: Return the signed URL
    return new Response(
      JSON.stringify({
        signedUrl: urlData.signedUrl,
        expiresIn,
      } as SuccessResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
