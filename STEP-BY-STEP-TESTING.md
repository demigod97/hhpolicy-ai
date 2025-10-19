# Step-by-Step Testing Guide
## Fixing White Screen & Testing All Features

**Date:** January 17, 2025
**Purpose:** Systematically test desktop layout and identify issues

---

## 🔧 What Was Just Fixed

### 1. Added Error Boundaries
- Each desktop component (SourcesSidebar, ChatArea, StudioSidebar) wrapped in error boundary
- If a component fails, you'll see which one with error details
- Other components will still render

### 2. Lazy Loading for CopilotKit
- `ChatAreaCopilotKit` now only loads when AG-UI is enabled
- Won't cause issues when AG-UI is off
- Reduces initial bundle size

### 3. Debug Panel
- Shows current feature flag status
- Located in bottom-right corner (dev only)
- Helps track which mode is active

---

## 📋 Step 1: Restart Development Server

```bash
# Stop current server (Ctrl+C if running)

# Start fresh
npm run dev
```

**Expected output:**
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 📋 Step 2: Test Desktop View (Width >= 1100px)

### 2.1 Open in Browser
1. Open http://localhost:5173
2. Ensure browser width is **> 1100px** (full desktop)
3. Open **DevTools** (F12)
4. Go to **Console** tab (keep this open to see errors)

### 2.2 Login
1. Login to your account
2. Should see dashboard

### 2.3 Navigate to Notebook
1. Click on any notebook/policy document
2. **Watch what happens:**

**Scenario A: Desktop view works ✅**
- You see 3 columns:
  - Left: SourcesSidebar (documents list)
  - Middle: ChatArea (chat interface)
  - Right: StudioSidebar (notes)
- Debug panel in bottom-right showing:
  ```
  enableAGUI: false
  Chat Mode: Legacy
  ```
- **If this happens: You're good! Proceed to Step 3**

**Scenario B: One component shows error ⚠️**
- You see colored error panels:
  - **Yellow background**: SourcesSidebar or StudioSidebar failed
  - **Red background**: ChatArea failed
- Error panel shows:
  ```
  Component Error: [ComponentName]
  [Error Details] (click to expand)
  ```
- **If this happens: Take screenshot and check Step 2.4**

**Scenario C: Still white screen ❌**
- Nothing renders except header
- **If this happens: Check Step 2.4**

### 2.4 Debug - Check Console

In browser DevTools Console, look for:

**Common Error 1: CopilotKit Provider**
```
Error: useCopilotChat must be used within CopilotKit provider
```
**Fix:** Verify `.env` has `VITE_ENABLE_AG_UI=false`

**Common Error 2: Hook Error**
```
Error: Cannot read property 'X' of undefined
```
**Fix:** Check which component is failing (error boundary will show)

**Common Error 3: Network Error**
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```
**Fix:** Check if trying to call CopilotKit runtime when AG-UI is off

---

## 📋 Step 3: Test Mobile/Tablet View (Width < 1100px)

### 3.1 Resize Browser
1. In DevTools, click **Toggle device toolbar** (Ctrl+Shift+M)
2. Select **iPad** or **Tablet** preset
3. OR: Manually resize browser to < 1100px width

### 3.2 Verify Layout Switches
- Should see tabbed interface instead of 3 columns
- Tabs: Chat | Sources | Studio
- **This should work** (you mentioned it does)

---

## 📋 Step 4: Test Legacy Chat Functionality

### 4.1 Verify AG-UI is OFF
- Check debug panel: `Chat Mode: Legacy`
- Or check `.env`: `VITE_ENABLE_AG_UI=false`

### 4.2 Upload a Document (if needed)
1. Click "Upload" button
2. Select a PDF
3. Wait for processing

### 4.3 Send a Chat Message
1. Type message in chat input: "What is our remote work policy?"
2. Click Send (or press Enter)
3. **Watch the console**

**Expected behavior:**
- Message appears in chat
- Loading indicator shows
- Response appears with citations
- Console shows: `Sending message...` (from chat component)

### 4.4 Monitor Edge Function
In a separate terminal:
```bash
supabase functions logs send-chat-message --tail
```

**Expected logs:**
```
Received message: { session_id: '...', message: 'What is...', user_id: '...' }
User effective role: administrator
Sending to administrator webhook: https://n8n-prod...
Webhook response: {...}
```

---

## 📋 Step 5: Test Feature Toggle

### 5.1 Toggle AG-UI On
1. Click **Settings icon** (⚙️) in header
2. Toggle **"AG-UI Protocol"** to ON
3. Debug panel should update: `Chat Mode: CopilotKit`

### 5.2 Observe What Happens

**Expected (with current setup):**
- Chat area shows loading spinner: "Loading CopilotKit..."
- Then either:
  - **Works**: CopilotKit chat loads (unlikely without proper runtime)
  - **Fails**: Red error panel shows "ChatAreaCopilotKit failed to load"

### 5.3 Check Console for Errors
Common errors when AG-UI is ON:
```
Error: useCopilotChat hook error
Error: Failed to fetch runtime
```

**This is expected** - CopilotKit needs proper runtime implementation.

### 5.4 Toggle Back to Legacy
1. Click Settings icon again
2. Toggle **"AG-UI Protocol"** to OFF
3. Chat should switch back to legacy (working) mode

---

## 📋 Step 6: Test Citation Clicking

### 6.1 Get a Response with Citations
- Send a message that would return citations
- Look for clickable citation markers like `[1]` or `[doc.pdf:10]`

### 6.2 Click Citation
- Should open source document in left sidebar
- Should highlight correct section

---

## 📋 Step 7: Test All Three Roles

### 7.1 Administrator Role (your current role)
```bash
# Monitor logs
supabase functions logs send-chat-message --tail
```

Send message → Should route to `NOTEBOOK_CHAT_URL` (admin webhook)

### 7.2 Executive Role (if you have test user)
- Login as executive user
- Send message → Should route to `EXECUTIVE_CHAT_URL`
- Should only access exec + admin docs

### 7.3 Board Role (if you have test user)
- Login as board user
- Send message → Should route to `BOARD_CHAT_URL`
- Should access ALL documents

---

## 🎯 Expected Test Results

### What Should Work ✅
- [ ] Desktop view shows 3 columns (no white screen)
- [ ] Mobile/tablet view shows tabs
- [ ] Debug panel visible in dev mode
- [ ] Legacy chat sends messages
- [ ] Responses appear with citations
- [ ] Citations clickable
- [ ] Edge function `send-chat-message` being called
- [ ] Role-based routing works

### What Won't Work (Expected) ⚠️
- [ ] AG-UI/CopilotKit mode (not properly implemented)
- [ ] Dual mode (not implemented)
- [ ] `copilotkit-adapter` not being called

---

## 🐛 Troubleshooting by Scenario

### Scenario: White screen persists on desktop

**Check 1: Feature flags**
```bash
cat .env | grep ENABLE
```
Should show: `VITE_ENABLE_AG_UI=false`

**Check 2: Console errors**
- Open DevTools → Console
- Look for red errors
- Copy error message

**Check 3: Which component failed?**
- If error boundaries working, you'll see colored panel
- Note which component name is shown

**Check 4: Try mobile view**
- Resize to < 1100px
- If mobile works, issue is desktop-specific component

### Scenario: Chat sends but no response

**Check 1: Edge function logs**
```bash
supabase functions logs send-chat-message --tail
```

**Check 2: n8n workflow status**
- Go to: https://n8n-prod.coralshades.ai/
- Check if workflow is active
- Check execution history

**Check 3: Webhook URL**
```bash
supabase secrets list | grep CHAT_URL
```

### Scenario: Error boundary shows component failed

**For SourcesSidebar failure:**
- Check if `notebookId` is valid
- Check if `sources` query is working

**For ChatArea failure:**
- Check if `useChatMessages` hook is working
- Check if `notebookId` is valid

**For StudioSidebar failure:**
- Check if notes feature is working
- Check if `notebookId` is valid

---

## 📸 What to Report

If issues persist, provide:

1. **Screenshot** of the page (including debug panel)
2. **Console errors** (copy full error message)
3. **Browser width** (show DevTools dimension)
4. **Which component failed** (from error boundary)
5. **.env file check:**
   ```bash
   cat .env | grep VITE_ENABLE_AG_UI
   ```

---

## ✅ Success Criteria

You're done testing when:
- [ ] Desktop view works (no white screen)
- [ ] Can send chat messages
- [ ] Can receive responses with citations
- [ ] Can click citations to view sources
- [ ] Debug panel shows "Chat Mode: Legacy"
- [ ] Edge function logs show `send-chat-message` being called

---

## 🎉 Next Steps After Testing

### If desktop view works now:
**Proceed to Steps 1, 2, 3 as requested:**
1. ✅ **Test current setup** (this guide)
2. 🎨 **Enhance legacy chat UI** (improve UX without CopilotKit)
3. 🚀 **Implement proper CopilotKit** (2-3 days of work)

### If desktop view still broken:
- Share results from this testing guide
- We'll fix the specific component that's failing

---

**Last Updated:** January 17, 2025
**Status:** Error boundaries added, ready for systematic testing
