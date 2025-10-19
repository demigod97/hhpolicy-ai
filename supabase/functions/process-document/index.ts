/**
 * Process Document Edge Function
 *
 * Handles document processing by:
 * 1. Receiving source ID, file path, and source type
 * 2. Creating a signed URL for the file
 * 3. Calling external N8N webhook for document processing
 * 4. Handling success/failure and updating source status
 *
 * Environment Variables:
 * - DOCUMENT_PROCESSING_WEBHOOK_URL: N8N webhook URL for document processing
 * - NOTEBOOK_GENERATION_AUTH: Optional auth header for webhook
 * - SUPABASE_URL: Auto-populated by Supabase
 * - SUPABASE_SERVICE_ROLE_KEY: Auto-populated by Supabase
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessDocumentRequest {
  sourceId: string;
  filePath: string;
  sourceType: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    const { sourceId, filePath, sourceType }: ProcessDocumentRequest = await req.json();

    if (!sourceId || !filePath || !sourceType) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          details: 'sourceId, filePath, and sourceType are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing document:', {
      source_id: sourceId,
      file_path: filePath,
      source_type: sourceType
    });

    // Get environment variables
    const webhookUrl = Deno.env.get('DOCUMENT_PROCESSING_WEBHOOK_URL');
    const authHeader = Deno.env.get('NOTEBOOK_GENERATION_AUTH');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!webhookUrl) {
      console.error('Missing DOCUMENT_PROCESSING_WEBHOOK_URL environment variable');

      // Initialize Supabase client to update status
      const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

      // Update source status to failed
      await supabaseClient
        .from('sources')
        .update({ processing_status: 'failed' })
        .eq('id', sourceId);

      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          details: 'Document processing webhook URL not configured'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Calling external webhook:', webhookUrl);

    // Initialize Supabase client for creating signed URL
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Determine the storage bucket (default to 'sources')
    const { data: sourceData } = await supabaseClient
      .from('sources')
      .select('pdf_storage_bucket')
      .eq('id', sourceId)
      .single();

    const bucket = sourceData?.pdf_storage_bucket || 'sources';

    // Create a signed URL for secure access (1 hour expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabaseClient
      .storage
      .from(bucket)
      .createSignedUrl(filePath, 3600);

    if (signedUrlError || !signedUrlData) {
      console.error('Failed to create signed URL:', signedUrlError);

      // Update source status to failed
      await supabaseClient
        .from('sources')
        .update({ processing_status: 'failed' })
        .eq('id', sourceId);

      return new Response(
        JSON.stringify({
          error: 'Storage error',
          details: 'Failed to create signed URL for document'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare the payload for the webhook
    const payload = {
      source_id: sourceId,
      file_url: signedUrlData.signedUrl,
      file_path: filePath,
      source_type: sourceType,
      callback_url: `${supabaseUrl}/functions/v1/process-document-callback`
    };

    console.log('Webhook payload prepared:', {
      source_id: payload.source_id,
      source_type: payload.source_type,
      has_file_url: !!payload.file_url
    });

    // Prepare headers for webhook call
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Call external webhook for processing
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook call failed:', response.status, errorText);

      // Update source status to failed
      await supabaseClient
        .from('sources')
        .update({ processing_status: 'failed' })
        .eq('id', sourceId);

      return new Response(
        JSON.stringify({
          error: 'Processing failed',
          details: `Webhook returned ${response.status}: ${errorText}`
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = await response.json();
    console.log('Webhook response:', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Document processing initiated',
        result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in process-document function:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
