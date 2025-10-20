# Phase 2 Testing Guide: OpenAI + Actions + SSE

## What's Been Implemented

### Backend (copilotkit-runtime)
✅ **Phase 2.1**: OpenAI streaming integration
✅ **Phase 2.2**: SSE (Server-Sent Events) response format
✅ **Phase 2.3**: RAG context from Supabase documents
✅ **Phase 2.4**: CopilotKit actions for Inspector UI

### Actions Available by Role

**Board / System Owner** (all actions):
- `searchPolicies` - Search across policy documents
- `getCitation` - Retrieve full citation text
- `checkCompliance` - Check situation compliance
- `flagOutdatedPolicy` - Flag policies older than 18 months

**Executive** (most actions):
- `searchPolicies`
- `getCitation`
- `checkCompliance`

**Administrator** (basic actions):
- `searchPolicies`
- `getCitation`
- `checkCompliance`

---

## Testing Steps

### Step 1: Enable AG-UI Mode

1. Open the application in **development mode**:
   ```bash
   npm run dev
   ```

2. Navigate to a notebook (create one if needed)

3. Open **browser console** (F12)

4. Enable AG-UI mode via localStorage:
   ```javascript
   localStorage.setItem('enableAGUI', 'true')
   location.reload()
   ```

5. You should now see "CopilotKit AG-UI" badge in the chat header

---

### Step 2: Open CopilotKit Inspector

The Inspector should appear automatically when:
- You're in development mode (`npm run dev`)
- AG-UI is enabled (`VITE_ENABLE_AG_UI=true` or localStorage)
- `showDevConsole: true` in App.tsx (already configured)

**If Inspector doesn't appear:**
1. Check browser console for errors
2. Verify AG-UI mode is enabled
3. Check that you're running in dev mode (not production build)

The Inspector typically appears as a floating panel or sidebar with:
- Available Agents section
- Available Actions section
- Runtime information

---

### Step 3: Verify Actions in Inspector

1. Look for "Available Actions" section in the Inspector

2. You should see these actions (based on your role):
   - **Search Policies**
   - **Get Citation**
   - **Check Compliance**
   - **Flag Outdated Policy** (board/system_owner only)

3. Click on an action to see:
   - Description
   - Parameters (name, type, required)

4. **Check GraphQL Response:**
   Open Network tab → Send a message → Look for GraphQL request:
   ```
   POST /functions/v1/copilotkit-runtime
   {"operationName":"availableAgents"...}
   ```

   Response should include:
   ```json
   {
     "data": {
       "availableAgents": {
         "agents": [...],
         "actions": [
           {
             "name": "searchPolicies",
             "description": "Search across policy documents...",
             "parameters": [...]
           },
           ...
         ]
       }
     }
   }
   ```

---

### Step 4: Test Chat with OpenAI

1. **Upload a source document** (if not already done)

2. **Wait for processing** to complete

3. **Send a message** in the chat, for example:
   ```
   What is the remote work policy?
   ```

4. **Verify OpenAI response:**
   - Check Network tab for POST to `/copilotkit-runtime`
   - Look for response with:
     - `Content-Type: text/event-stream` (SSE streaming)
     - OR `Content-Type: application/json` (fallback)

5. **Check response quality:**
   - Response should reference relevant documents
   - Should include citations [1], [2], etc.
   - Should be contextually relevant to uploaded sources

---

### Step 5: Test RAG Context

1. **Send a specific question** about your uploaded document:
   ```
   How many vacation days do employees get?
   ```

2. **Check console logs** for RAG context building:
   ```
   [CopilotKit Runtime] Building RAG context for query: ...
   [CopilotKit Runtime] RAG context built: {documentCount: X, sources: [...]}
   ```

3. **Verify response uses RAG:**
   - Response should reference specific documents
   - Should include page numbers if available
   - Should cite sources: "According to [document name], page [X]..."

---

### Step 6: Test Action Execution (Manual)

1. In the chat, **try triggering an action** by asking:
   ```
   Search for policies about remote work
   ```
   OR
   ```
   Check if working from home for 2 weeks complies with policy
   ```

2. The AI should recognize the intent and potentially invoke the appropriate action

3. **Check console logs** for action execution:
   ```
   [Action Executor] Running action: searchPolicies
   [Action: searchPolicies] {...}
   ```

---

## Expected Behavior

### ✅ Success Indicators

- [ ] **Inspector visible** in AG-UI mode
- [ ] **Actions appear** in Inspector UI
- [ ] **Actions match role** (e.g., administrators don't see flagOutdatedPolicy)
- [ ] **Chat messages work** with OpenAI responses
- [ ] **RAG context** included in responses (citations, source references)
- [ ] **Streaming works** (see messages appear token by token) OR fallback JSON works
- [ ] **No console errors** related to CopilotKit or OpenAI

### ❌ Failure Indicators

- **White screen**: AG-UI mode breaking the UI
- **No actions in Inspector**: GraphQL response not including actions
- **Chat not working**: OpenAI API key issues or runtime errors
- **No RAG context**: Documents not being searched or included
- **Console errors**: Check for authentication, API key, or network issues

---

## Troubleshooting

### Issue: Inspector not showing actions

**Check:**
1. Open browser Network tab
2. Look for GraphQL request to `/copilotkit-runtime`
3. Verify response includes `actions` array

**Fix:**
```bash
# Re-deploy runtime
supabase functions deploy copilotkit-runtime
```

### Issue: Chat not working

**Check console for:**
```
[CopilotKit Runtime] Missing OPENAI_API_KEY
```

**Fix:**
```bash
# Set OpenAI API key in Supabase
supabase secrets set OPENAI_API_KEY=sk-...
```

### Issue: No RAG context in responses

**Check:**
1. Are documents uploaded and processed?
2. Does `documents` table have data?
3. Check console logs:
   ```
   [RAG] Found documents: 0
   ```

**Fix:**
- Upload and process documents first
- Verify document embeddings exist in database
- Check RLS policies on `documents` table

### Issue: Actions not executing

**Check console for:**
```
[Action Executor] Unknown action: ...
```

**This is expected** - Action execution from the Inspector is a Phase 3 feature. For now, actions should be visible but may not execute when clicked in the Inspector.

---

## Next Steps

After verifying Phase 2 works:

### Phase 3: Action Execution
- Wire action execution from frontend to backend
- Handle action results in chat
- Update UI to show action execution status

### Phase 4: Advanced Features
- File upload actions
- Multi-document search
- Policy comparison
- Automated compliance checks

---

## Quick Verification Checklist

```bash
# 1. Check runtime is deployed
curl -X POST https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/copilotkit-runtime \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"operationName":"availableAgents","query":"query availableAgents { availableAgents { agents { id name } actions { name } } }"}'

# Expected: {"data":{"availableAgents":{"agents":[...],"actions":[...]}}}
```

---

## Configuration Summary

| Setting | Value | Location |
|---------|-------|----------|
| Runtime URL | `https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/copilotkit-runtime` | `.env` |
| OpenAI API Key | Set in Supabase secrets | Cloud dashboard |
| AG-UI Enabled | `false` (toggle via localStorage) | `.env` or localStorage |
| Dev Console | `true` in dev mode | `App.tsx` |
| Streaming | Enabled (SSE) | `copilotkit-runtime/index.ts` |

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase function logs: https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/functions
3. Verify OpenAI API key is set and valid
4. Check RLS policies allow access to documents

---

**Phase 2 Complete** ✅
- OpenAI streaming integration
- SSE response format
- RAG context from Supabase
- Actions in Inspector UI
