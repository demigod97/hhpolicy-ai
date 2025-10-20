# Edge Functions Deployment Guide

## ⚠️ CLI Authentication Issue

The Supabase CLI is experiencing authentication issues preventing automated deployment. Manual deployment via Dashboard required.

## Method 1: Via Supabase Dashboard (Recommended)

### 1. Deploy `process-document` Function

1. Go to [Supabase Dashboard - Edge Functions](https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/functions)
2. Click **"Create a new function"** or **"Deploy new version"** for existing function
3. **Function Name:** `process-document`
4. **Copy & paste** the entire content from:
   - File: `supabase/functions/process-document/index.ts`
5. Click **"Deploy"**

### 2. Deploy `process-document-callback` Function

1. Same dashboard location
2. **Function Name:** `process-document-callback`
3. **Copy & paste** the entire content from:
   - File: `supabase/functions/process-document-callback/index.ts`
4. Click **"Deploy"**

## Method 2: Via CLI (When Auth Fixed)

```bash
# Login to Supabase
npx supabase login

# Deploy both functions
npx supabase functions deploy process-document --project-ref vnmsyofypuhxjlzwnuhh
npx supabase functions deploy process-document-callback --project-ref vnmsyofypuhxjlzwnuhh
```

## Verification

### 1. Check Function Logs

Dashboard → Edge Functions → Select function → Logs tab

### 2. Test `process-document` Manually

```bash
curl -i --location --request POST \
  'https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/process-document' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"sourceId":"test-id","filePath":"test/path.pdf","sourceType":"pdf"}'
```

### 3. Monitor Callback Endpoint

Check N8N workflow logs to verify callbacks are received.

## Required Environment Variables

Ensure these secrets are set (see `docs/SETUP-SUPABASE-SECRETS.md`):

- ✅ `DOCUMENT_PROCESSING_WEBHOOK_URL`
- ✅ `NOTEBOOK_GENERATION_AUTH`

Auto-populated (no action needed):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Function URLs

After deployment, functions are available at:
- **process-document**: `https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/process-document`
- **process-document-callback**: `https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/process-document-callback`

## Changes Made

### `process-document/index.ts`
- ✅ Modern Deno.serve syntax
- ✅ npm: imports for better compatibility
- ✅ Comprehensive error handling
- ✅ Signed URL generation (1 hour expiry)

### `process-document-callback/index.ts`
- ✅ Updated from deprecated `serve` to `Deno.serve`
- ✅ Changed import from `esm.sh` to `npm:` prefix
- ✅ Added comprehensive JSDoc comments
- ✅ Maintains backward compatibility with existing N8N workflows

## Testing Checklist

After deployment:
- [ ] Upload a PDF document via Dashboard
- [ ] Check `process-document` function logs for invocation
- [ ] Verify N8N workflow receives webhook
- [ ] Check N8N workflow completes processing
- [ ] Verify `process-document-callback` receives callback
- [ ] Check database: `sources` table status updated to 'completed'
- [ ] Verify extracted content appears in `sources.content` field
- [ ] Test chat with processed document

## Troubleshooting

### Function Not Invoked
- Check `useFileUpload.tsx` edge function call is uncommented
- Verify user is authenticated
- Check browser console for errors

### 403 Error from N8N
- Verify `DOCUMENT_PROCESSING_WEBHOOK_URL` secret is set
- Check N8N workflow is active
- Verify webhook URL is accessible

### Callback Not Received
- Check N8N workflow has correct callback URL
- Verify `process-document-callback` function is deployed
- Check N8N logs for callback errors

### Processing Status Stuck
- Check both function logs for errors
- Verify N8N workflow completed successfully
- Manually trigger callback if needed
