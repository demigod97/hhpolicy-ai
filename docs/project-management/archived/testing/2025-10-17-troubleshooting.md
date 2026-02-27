# Troubleshooting Guide - CopilotKit Integration Issues

**Date:** January 17, 2025
**Issues:** White screen on desktop, CopilotKit not working

---

## 🐛 Issues Discovered

### Issue 1: White Screen on Desktop Resolution
**Symptoms:**
- Notebook page shows white screen on desktop resolution
- Works fine on tablet/mobile resolution
- Legacy chat (non-AG-UI) works fine

**Root Cause:**
CopilotKit integration has architectural issues (see Issue 2)

**Immediate Fix:**
`.env` has been updated with `VITE_ENABLE_AG_UI=false` to use legacy chat by default

### Issue 2: CopilotKit Not Being Invoked
**Symptoms:**
- Both AG-UI and legacy mode call `send-chat-message` edge function
- `copilotkit-adapter` is never invoked
- No difference between AG-UI on/off

**Root Cause:**
`ChatAreaCopilotKit` component has fundamental architectural issues:

1. **CopilotKit Runtime API Not Implemented**
   - CopilotKit expects a streaming runtime API (Server-Sent Events)
   - Our `copilotkit-adapter` is just an HTTP proxy to n8n
   - Missing: streaming support, tool execution, state management

2. **Incorrect Integration Approach**
   - We mixed CopilotKit Cloud with custom n8n backend
   - This requires implementing the full CopilotKit Runtime API spec
   - Current implementation is too simplistic

---

## ✅ Immediate Solution: Use Legacy Chat

The legacy `ChatArea` component works perfectly and already:
- ✅ Integrates with n8n webhooks
- ✅ Supports role-based routing
- ✅ Renders citations correctly
- ✅ Handles all message types
- ✅ Works on all screen sizes

**Recommendation:** Continue using legacy chat until we decide on proper CopilotKit architecture.

---

## 🔧 How to Test & Debug

### 1. Check Feature Flags

Start dev server and look for debug panel in bottom-right:
```bash
npm run dev
```

Navigate to a notebook and you should see:
```
🐛 Debug Panel
enableAGUI: false
enableDualMode: false
enableN8NFallback: true
Chat Mode: Legacy
```

### 2. Toggle Feature Flags

Click the Settings (⚙️) icon in the header to toggle:
- **AG-UI Protocol** - Switches between CopilotKit and legacy chat
- **Dual Mode** - Run both in parallel (not implemented yet)
- **n8n Fallback** - Fallback to n8n on errors

### 3. Monitor Edge Function Calls

**Check which edge function is being called:**

```bash
# Terminal 1: Monitor send-chat-message (legacy)
supabase functions logs send-chat-message --tail

# Terminal 2: Monitor copilotkit-adapter (AG-UI)
supabase functions logs copilotkit-adapter --tail
```

**With AG-UI OFF (legacy):**
- You should see logs in `send-chat-message`
- Format: `Received message: { session_id, message, user_id }`

**With AG-UI ON (CopilotKit):**
- You should see logs in `copilotkit-adapter`
- Currently: Nothing (component error prevents calls)

### 4. Check Browser Console

Open DevTools (F12) and look for errors:
```
Console > Errors/Warnings
```

Common errors when AG-UI is ON:
- `useCopilotChat` hook errors
- Network errors to CopilotKit runtime
- React component errors

---

## 🎯 Three Paths Forward

### Option A: Continue with Legacy Chat (Recommended)
**Pros:**
- ✅ Already working perfectly
- ✅ Zero changes needed
- ✅ Reliable and tested

**Cons:**
- ❌ No CopilotKit UI components
- ❌ No AI-powered actions

**Action:** Keep `VITE_ENABLE_AG_UI=false` in `.env`

---

### Option B: Implement Proper CopilotKit Integration
**What's needed:**

1. **Implement CopilotKit Runtime API in `copilotkit-adapter`:**
   ```typescript
   // Must support:
   - Server-Sent Events (SSE) streaming
   - Tool execution protocol
   - State management
   - Error handling
   - Retry logic
   ```

2. **Transform n8n responses to streaming format:**
   ```typescript
   // Convert:
   { output: [{ text, citations }] }

   // To CopilotKit streaming events:
   event: delta
   data: {"type":"text","content":"chunk"}

   event: tool_call
   data: {"tool":"search","args":{...}}
   ```

3. **Add proper error boundaries and fallback:**
   ```typescript
   <ErrorBoundary fallback={<ChatArea />}>
     <ChatAreaCopilotKit />
   </ErrorBoundary>
   ```

**Estimated effort:** 2-3 days of development + testing

---

### Option C: Hybrid Approach - Enhance Legacy Chat
Instead of using CopilotKit, enhance the existing `ChatArea`:

**Enhancements to add:**
1. ✨ Streaming responses (fake streaming from n8n response)
2. 🎨 Better UI/UX (animations, loading states)
3. 🔧 Quick actions (save to note, copy, etc.)
4. 💬 Suggested follow-up questions
5. 🎯 Better citation rendering

**Estimated effort:** 1-2 days of development

**Benefits:**
- Works with existing architecture
- No new dependencies
- Incremental improvements

---

## 📋 Current State Checklist

- [x] `.env` file corrected with proper URLs
- [x] AG-UI disabled by default (`VITE_ENABLE_AG_UI=false`)
- [x] Legacy chat working on all resolutions
- [x] Debug panel added for development
- [x] Edge functions deployed:
  - [x] `send-chat-message` (legacy) - ✅ Working
  - [x] `copilotkit-adapter` - ⏳ Deployed but not being called
- [x] n8n webhooks configured:
  - [x] Board Chat
  - [x] Executive Chat
  - [x] Admin Chat

---

## 🔍 Debugging Commands

### Check Environment Variables
```bash
# View all env vars
cat .env

# Check specific var
cat .env | grep COPILOTKIT
```

### Test Edge Functions
```bash
# Get JWT token
supabase auth token

# Test send-chat-message (legacy)
curl -X POST "https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/send-chat-message" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test","message":"hello"}'

# Test copilotkit-adapter (currently not working)
curl -X POST "https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/copilotkit-adapter" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

### Monitor Real-time
```bash
# Watch logs
supabase functions logs send-chat-message --tail

# Check recent errors
supabase functions logs send-chat-message --level error --limit 50
```

---

## 💡 Recommendations

### Immediate (Today):
1. ✅ Keep AG-UI disabled
2. ✅ Use legacy chat
3. ✅ Deploy `send-chat-message` if not already deployed
4. ✅ Test all three roles (Board/Executive/Admin)

### Short-term (This Week):
1. Decide on path forward (A, B, or C)
2. If choosing B or C, create detailed technical spec
3. Test legacy chat thoroughly with all users

### Long-term (Next Sprint):
1. If CopilotKit is required, implement proper runtime API
2. Otherwise, enhance legacy chat with better UX
3. Add comprehensive testing

---

## 📞 Need Help?

**If legacy chat stops working:**
1. Check edge function logs: `supabase functions logs send-chat-message --tail`
2. Verify n8n webhooks are active: https://n8n-prod.coralshades.ai/
3. Check Supabase secrets: `supabase secrets list`

**If you want to attempt CopilotKit fix:**
1. Reference: https://docs.copilotkit.ai/coagents/runtime-api
2. Study: CopilotKit Runtime API spec
3. Implement streaming in `copilotkit-adapter`

---

**Last Updated:** January 17, 2025
**Status:** Legacy chat working, CopilotKit disabled pending architectural fixes
