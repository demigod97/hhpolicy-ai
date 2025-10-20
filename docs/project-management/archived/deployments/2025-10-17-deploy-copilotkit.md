# CopilotKit Cloud Deployment - Quick Start

**Status:** ✅ Ready for deployment
**Last Updated:** January 17, 2025

---

## 🚀 Quick Deployment

### 1. Set Environment Variables (Local)

Create `.env` file (copy from `.env.example`):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://vnmsyofypuhxjlzwnuhh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubXN5b2Z5cHVoeGpsendudWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzQxNjAsImV4cCI6MjA3MzE1MDE2MH0.7HPPem9o3-uaT_f6VKDQdMhDShy7ZcR_prJGdO71aKU

# CopilotKit Cloud
VITE_COPILOTKIT_PUBLIC_API_KEY=ck_pub_824d83fce47e418886702e221b5c6648
VITE_COPILOTKIT_RUNTIME_URL=https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/copilotkit-adapter

# Feature Flags
VITE_ENABLE_AG_UI=true
VITE_ENABLE_DUAL_MODE=false
VITE_ENABLE_N8N_FALLBACK=true
```

### 2. Verify n8n Workflows

**✅ All workflows are deployed and active!**

Webhook URLs are available:
- **Board Chat**: `01c03d10-5f14-4ac5-ba2d-1a7b0361bb38`
- **Executive Chat**: `705f01a7-0cc9-41c4-8ecb-20c6e7f8f0e3`
- **Admin Chat**: `2fabf43f-6e6e-424b-8e93-9150e9ce7d6c`

Verify workflows are active in n8n UI:
1. Go to: `https://n8n-prod.coralshades.ai/`
2. Check **Workflows** tab
3. Ensure all 3 PolicyAi chat workflows have green "Active" status

### 3. Set Supabase Secrets

**✅ All webhook URLs are now available!**

**Option A: Use deployment script (recommended)**
```bash
# Windows
.\deploy-secrets.bat

# Linux/Mac
chmod +x deploy-secrets.sh
./deploy-secrets.sh
```

**Option B: Set manually**
```bash
# Login to Supabase (if needed)
supabase login

# Link to project
supabase link --project-ref vnmsyofypuhxjlzwnuhh

# Set all secrets at once
supabase secrets set BOARD_CHAT_URL="https://n8n-prod.coralshades.ai/webhook/01c03d10-5f14-4ac5-ba2d-1a7b0361bb38"
supabase secrets set EXECUTIVE_CHAT_URL="https://n8n-prod.coralshades.ai/webhook/705f01a7-0cc9-41c4-8ecb-20c6e7f8f0e3"
supabase secrets set NOTEBOOK_CHAT_URL="https://n8n-prod.coralshades.ai/webhook/2fabf43f-6e6e-424b-8e93-9150e9ce7d6c"
supabase secrets set NOTEBOOK_GENERATION_AUTH="Coral@123"
supabase secrets set OPENAI_API_KEY="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"

# Verify all secrets
supabase secrets list
```

**Expected output:**
```
BOARD_CHAT_URL
EXECUTIVE_CHAT_URL
NOTEBOOK_CHAT_URL
NOTEBOOK_GENERATION_AUTH
OPENAI_API_KEY
```

### 4. Deploy Edge Function

```bash
# Deploy copilotkit-adapter
supabase functions deploy copilotkit-adapter

# Expected output:
# ✓ Deployed Function copilotkit-adapter
# ✓ Function URL: https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/copilotkit-adapter
```

### 5. Test Edge Function

Get a JWT token first:
```bash
# Option A: Use Supabase CLI
supabase auth --project-ref vnmsyofypuhxjlzwnuhh token

# Option B: Get from browser (after login)
# Open browser console and run:
# (await supabase.auth.getSession()).data.session.access_token
```

Test the edge function:
```bash
curl -X POST "https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/copilotkit-adapter" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What policies are available?"}],
    "context": {"session_id": "test-session"}
  }'
```

### 6. Build and Deploy Frontend

```bash
# Build the app
npm run build

# Output should be in dist/ folder
# Deploy to your hosting provider (e.g., Vercel, Netlify, etc.)
```

---

## 🧪 Testing

### Test Feature Toggle

1. Start dev server: `npm run dev`
2. Login to the app
3. Navigate to a policy document/notebook
4. Click the **Settings icon** (⚙️) in the header
5. Toggle "AG-UI Protocol" on/off
6. Verify chat switches between CopilotKit and legacy mode

### Test Role-Based Chat

**As Administrator:**
1. Login as admin user
2. Send chat message
3. Check edge function logs: `supabase functions logs copilotkit-adapter --tail`
4. Should see: `Routing administrator to webhook: https://n8n-prod.coralshades.ai/webhook/2fabf43f...`

**As Executive:**
1. Login as executive user
2. Send chat message
3. Check logs - should route to EXECUTIVE_CHAT_URL (or fallback to NOTEBOOK_CHAT_URL if not set)

**As Board:**
1. Login as board user
2. Send chat message
3. Check logs - should route to BOARD_CHAT_URL (or fallback to NOTEBOOK_CHAT_URL if not set)

### Test Citation Clicking

1. Send a message that returns citations
2. Click a citation in the response
3. Verify source document opens in sidebar
4. Verify correct page/line numbers displayed

---

## 📊 Monitoring

### Edge Function Logs
```bash
# Real-time logs
supabase functions logs copilotkit-adapter --tail

# Recent logs (last 100)
supabase functions logs copilotkit-adapter --limit 100

# Filter by level
supabase functions logs copilotkit-adapter --level error
```

### What to Look For

**✅ Success indicators:**
```
Routing {role} to webhook: https://n8n-prod...
Webhook response received
```

**⚠️ Warnings (expected if workflows not deployed):**
```
BOARD_CHAT_URL not set, falling back to NOTEBOOK_CHAT_URL
EXECUTIVE_CHAT_URL not set, falling back to NOTEBOOK_CHAT_URL
```

**❌ Errors to investigate:**
```
Authentication failed
No webhook URL configured
Webhook responded with status: 401
```

---

## 🔧 Troubleshooting

### Issue: "Missing or invalid authorization header"
**Solution:** Ensure JWT token is passed:
```bash
-H "Authorization: Bearer YOUR_ACTUAL_JWT_TOKEN"
```

### Issue: "NOTEBOOK_GENERATION_AUTH not set"
**Solution:** Set the secret:
```bash
supabase secrets set NOTEBOOK_GENERATION_AUTH="Coral@123"
```

### Issue: "Webhook responded with status: 401"
**Solution:** Check n8n authentication:
- Verify webhook URL is correct
- Ensure `NOTEBOOK_GENERATION_AUTH` is exactly `Coral@123` (no extra spaces)
- Test webhook directly with curl (see n8n deployment guide)

### Issue: "Module externalized for browser compatibility"
**Status:** Warning only (can be ignored)
**Cause:** Vite externalizing Node.js modules for browser
**Impact:** None - app works correctly

### Issue: Feature toggle not persisting
**Solution:** Check localStorage:
```javascript
// In browser console
localStorage.getItem('policyai_feature_flags')
```

---

## 🎯 Deployment Checklist

- [ ] **n8n Workflows**
  - [ ] Board Chat deployed and activated
  - [ ] Executive Chat deployed and activated
  - [ ] Admin Chat active (already deployed)

- [ ] **Supabase Secrets**
  - [ ] BOARD_CHAT_URL set
  - [ ] EXECUTIVE_CHAT_URL set
  - [ ] NOTEBOOK_CHAT_URL set
  - [ ] NOTEBOOK_GENERATION_AUTH set
  - [ ] OPENAI_API_KEY set

- [ ] **Edge Function**
  - [ ] copilotkit-adapter deployed
  - [ ] Test request successful
  - [ ] Logs show no errors

- [ ] **Frontend**
  - [ ] .env file configured
  - [ ] Build successful
  - [ ] Deployed to hosting

- [ ] **Testing**
  - [ ] Feature toggle works
  - [ ] Chat sends messages
  - [ ] Citations clickable
  - [ ] Role-based routing verified

---

## 📞 Quick Reference

**Supabase Project:** `vnmsyofypuhxjlzwnuhh`
**n8n Instance:** `https://n8n-prod.coralshades.ai/`
**CopilotKit Key:** `ck_pub_824d83fce47e418886702e221b5c6648`
**Auth Token:** `Coral@123`

**Edge Function URL:**
```
https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/copilotkit-adapter
```

**n8n Webhook URLs:**
```bash
# Board Chat (system_owner, board roles)
BOARD_CHAT_URL="https://n8n-prod.coralshades.ai/webhook/01c03d10-5f14-4ac5-ba2d-1a7b0361bb38"

# Executive Chat (company_operator, executive roles)
EXECUTIVE_CHAT_URL="https://n8n-prod.coralshades.ai/webhook/705f01a7-0cc9-41c4-8ecb-20c6e7f8f0e3"

# Admin Chat (administrator role)
NOTEBOOK_CHAT_URL="https://n8n-prod.coralshades.ai/webhook/2fabf43f-6e6e-424b-8e93-9150e9ce7d6c"
```

---

## 📚 Documentation Links

- **Full Implementation Guide:** `docs/stories/1.8.1.COPILOTKIT-CLOUD-IMPLEMENTATION.md`
- **n8n Workflow Deployment:** `docs/stories/1.8.1.N8N-WORKFLOW-DEPLOYMENT.md`
- **Original Story:** `docs/stories/1.8.1.ag-ui-protocol-implementation.md`

---

**Status:** ✅ READY FOR DEPLOYMENT - All webhooks configured
**Last Updated:** January 17, 2025 (Updated with webhook URLs)
