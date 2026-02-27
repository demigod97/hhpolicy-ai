# Supabase Secrets Configuration

## Required Secrets for Document Processing

The following secrets need to be configured in Supabase for the document processing pipeline to work:

### Method 1: Via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/settings/vault)
2. Navigate to: **Project Settings > Edge Functions > Manage Secrets**
3. Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `DOCUMENT_PROCESSING_WEBHOOK_URL` | `https://n8n-prod.coralshades.ai/webhook/19566c6c-e0a5-4a8f-ba1a-5203c2b663b7` |
| `NOTEBOOK_GENERATION_AUTH` | `Coral@123` |

### Method 2: Via CLI (Requires Auth)

If you have proper authentication:

```bash
cd supabase
npx supabase secrets set --env-file .env.secrets --project-ref vnmsyofypuhxjlzwnuhh
```

### Verification

After setting secrets, verify they're accessible by deploying and testing the `process-document` edge function:

```bash
npx supabase functions deploy process-document --project-ref vnmsyofypuhxjlzwnuhh
```

## Source

Secrets are defined in `n8n/edge_secrets.json` and match the N8N workflow webhooks.

## Auto-Populated Secrets (No Action Needed)

These are automatically available in edge functions:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
