# Phase 1 Testing: GraphQL Endpoint

**Date:** October 18, 2025
**Status:** ✅ Deployed and ready for testing

---

## 🎉 What Was Implemented

### Phase 1 Complete: GraphQL Endpoint
- ✅ GraphQL schema for CopilotKit
- ✅ GraphQL resolver for `availableAgents` query
- ✅ Request routing (GraphQL vs REST)
- ✅ Role-based agent filtering
- ✅ Deployed to Supabase Edge Functions

### What's Working Now
The `availableAgents` GraphQL query should now work! This was the error you were seeing before:
```
{"operationName":"availableAgents","query":"query availableAgents {...}"}
```

The new `copilotkit-runtime` function now properly handles this GraphQL query and returns role-based agents.

---

## 🧪 Testing Instructions

### Step 1: Restart Development Server
```bash
npm run dev
```

### Step 2: Test GraphQL Endpoint Directly (Optional)

You can test the GraphQL endpoint using curl or Postman:

```bash
# Get your JWT token from browser DevTools:
# Application → Local Storage → supabase.auth.token

curl -X POST https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/copilotkit-runtime \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "operationName": "availableAgents",
    "query": "query availableAgents { availableAgents { agents { id name description __typename } __typename } }",
    "variables": {}
  }'
```

**Expected Response:**
```json
{
  "data": {
    "availableAgents": {
      "agents": [
        {
          "id": "policy-search",
          "name": "Policy Search",
          "description": "Search across policy documents with natural language queries...",
          "__typename": "Agent"
        },
        {
          "id": "citation-lookup",
          "name": "Citation Lookup",
          "description": "Retrieve full text and context for specific policy citations.",
          "__typename": "Agent"
        },
        {
          "id": "policy-summary",
          "name": "Policy Summary",
          "description": "Generate concise summaries of policy documents.",
          "__typename": "Agent"
        }
      ],
      "__typename": "AvailableAgentsResponse"
    }
  }
}
```

### Step 3: Test in Browser

1. **Open browser**: http://localhost:5173
2. **Login** to your account
3. **Navigate** to any notebook
4. **Open DevTools** (F12) → Network tab
5. **Enable AG-UI mode**:
   - Click Settings icon (⚙️)
   - Toggle "AG-UI Protocol" to ON
   - Debug panel should show: `Chat Mode: CopilotKit`

6. **Watch Network tab**:
   - Filter by "copilotkit-runtime"
   - Should see GraphQL request: `availableAgents`
   - **Expected**: Status 200, response with agents data
   - **Previous error**: GraphQL error or 500

### Step 4: Check Logs

Monitor the edge function logs:
```bash
supabase functions logs copilotkit-runtime --tail
```

**Expected logs:**
```
[CopilotKit Runtime] Request received: { method: 'POST', isGraphQL: true, ... }
[CopilotKit Runtime] Authenticated: { userId: '...', userRole: 'administrator' }
[CopilotKit Runtime] GraphQL request: { operationName: 'availableAgents', ... }
[CopilotKit Runtime] GraphQL response: { operation: 'availableAgents', hasData: true, hasErrors: false }
```

---

## ✅ Success Criteria

Phase 1 is successful when:
- ✅ No GraphQL errors in browser console
- ✅ `availableAgents` query returns data (check Network tab)
- ✅ Role-based agents appear (Administrators get 3 agents, Board members get all 6)
- ✅ Debug panel shows "CopilotKit" mode

---

## ⚠️ Known Limitations (Phase 1)

### What Works
- ✅ GraphQL endpoint for `availableAgents`
- ✅ Role-based agent filtering
- ✅ No more GraphQL errors

### What Doesn't Work Yet
- ❌ **Sending chat messages** - Phase 2
  - Chat input will show error or 501 response
  - Error message: "Chat streaming not yet implemented"
  - **This is expected!**

- ❌ **Real-time streaming** - Phase 2
  - No SSE streaming yet
  - OpenAI integration pending

- ❌ **RAG context** - Phase 3
  - Not pulling from Supabase documents yet
  - No citations yet

### What to Expect
When you try to send a chat message in CopilotKit mode, you'll see:
```json
{
  "error": "Chat streaming not yet implemented",
  "message": "Please use legacy chat mode for now...",
  "phase": "Phase 1 complete - GraphQL endpoint working",
  "nextPhase": "Phase 2 - SSE streaming chat"
}
```

**This is correct!** Phase 1 only fixes the GraphQL endpoint. Chat will come in Phase 2.

---

## 🐛 Troubleshooting

### Still Getting GraphQL Errors?

**Check 1: Correct endpoint**
```bash
cat .env | grep RUNTIME_URL
```
Should show: `VITE_COPILOTKIT_RUNTIME_URL=...copilotkit-runtime` (NOT copilotkit-adapter)

**Check 2: Deployment successful**
```bash
supabase functions list
```
Should show `copilotkit-runtime` with recent deployment time

**Check 3: Browser cache**
- Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear localStorage
- Restart dev server

**Check 4: Check Network request**
- DevTools → Network tab
- Find `copilotkit-runtime` request
- Check Request Headers (should have Authorization)
- Check Request Payload (should be GraphQL query)
- Check Response (should be 200 with data)

---

## 📊 Role-Based Agents

Different roles see different agents:

### Administrator (You)
- policy-search
- citation-lookup
- policy-summary

### Executive
- policy-search
- citation-lookup
- compliance-check
- policy-summary
- policy-comparison

### Board / System Owner
- policy-search
- citation-lookup
- compliance-check
- policy-summary
- policy-comparison
- policy-flag (outdated detector)

---

## 🚀 Next Steps

### Phase 1 Complete ✅
You should now see:
1. No GraphQL errors when enabling AG-UI
2. `availableAgents` query succeeds
3. Agents list appears based on your role

### Ready for Phase 2?
Once you confirm Phase 1 works:
1. **SSE streaming** - Real-time chat responses
2. **OpenAI integration** - Actual LLM responses
3. **Chat message handling** - Send and receive messages

### Want to Test Now?
1. Enable AG-UI mode in settings
2. Check Network tab for `availableAgents` request
3. Confirm it returns 200 with agents data
4. **Don't try to send messages yet** - that's Phase 2!

---

## 📝 Report Results

Please check:
- [ ] GraphQL endpoint works (no errors in console)
- [ ] availableAgents query returns data
- [ ] Correct number of agents for your role
- [ ] Ready to proceed to Phase 2 (SSE streaming)

OR if issues:
- Screenshot of Network tab showing GraphQL request/response
- Console errors (if any)
- Edge function logs output

---

**Last Updated:** October 18, 2025
**Phase:** 1 of 4 complete
**Next:** Phase 2 - SSE Streaming Chat
