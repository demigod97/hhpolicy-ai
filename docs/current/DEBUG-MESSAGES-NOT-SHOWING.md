# Debug Guide: Messages Not Showing in Frontend

**Date**: October 20, 2025
**Status**: 🔍 **DEBUGGING IN PROGRESS**
**Dev Server**: http://localhost:8084

---

## Problem Summary

Messages exist in `n8n_chat_histories` table and sources are properly linked via `chat_session_documents`, but messages are not displaying in the frontend chat interface.

**Verified**:
- ✅ Messages exist in database (session `85a2fd3f-f11b-4a70-a002-fb5d52721572` has 2 messages)
- ✅ Sources are linked (10 sources linked to session via junction table)
- ✅ Queries work correctly when tested directly

**Issue**: Messages not rendering in UI

---

## Debug Logging Added

I've added comprehensive console logging to track the data flow:

### 1. `useChatMessages` Hook Logging

**Location**: `src/hooks/useChatMessages.tsx`

**Logs**:
```javascript
========== useChatMessages Query Results ==========
Raw data from database: [...]
Number of messages: X
Sources map: Map(X) {...}
Sources map size: X
Transformed messages: [...]
Returning X messages to component
====================================================

useChatMessages hook returning: {
  messagesCount: X,
  isLoading: boolean,
  isSuccess: boolean,
  isFetching: boolean,
  error: undefined,
  notebookId: 'session-id'
}
```

### 2. `ChatArea` Component Logging

**Location**: `src/components/notebook/ChatArea.tsx`

**Logs**:
```javascript
========== ChatArea Component State ==========
notebookId: 'session-id'
messages from hook: [...]
messages.length: X
sources.length: X
hasProcessedSources: boolean
==============================================
```

---

## Testing Instructions

### Step 1: Open Chat Session

1. Navigate to: **http://localhost:8084**
2. Log in with your credentials
3. Click on an existing chat session OR click "New Chat"
4. Note the session ID in URL: `/chat/[SESSION-ID]`

### Step 2: Open Browser DevTools

1. Press **F12** (or Right-click → Inspect)
2. Go to **Console** tab
3. Clear console: **Ctrl+L** (or click clear button)

### Step 3: Reload Page

1. Press **F5** or **Ctrl+R** to refresh
2. Watch console output carefully

---

## What to Look For

### Scenario A: Query Returns Empty Data

If you see:
```javascript
========== useChatMessages Query Results ==========
Raw data from database: []
Number of messages: 0
...
====================================================
```

**Diagnosis**: Query is running but returning no results.

**Possible Causes**:
- Session ID mismatch
- RLS policy blocking query
- Query is using wrong `session_id`

**Fix**: Check if `notebookId` in URL matches `session_id` in database

### Scenario B: Data Returns But Transform Fails

If you see:
```javascript
Raw data from database: [{id: 165, session_id: '...', message: {...}}, ...]
Number of messages: 2
...
Transformed messages: []  // ❌ EMPTY!
Returning 0 messages to component
```

**Diagnosis**: Transformation function is failing or filtering out messages.

**Possible Causes**:
- `transformMessage()` function throwing errors
- Message format doesn't match expected structure
- Filter removing all messages

**Fix**: Check browser console for JavaScript errors

### Scenario C: Hook Returns Data But Component Doesn't Receive

If you see:
```javascript
useChatMessages hook returning: {
  messagesCount: 2,  // ✅ Hook has messages
  ...
}

========== ChatArea Component State ==========
messages.length: 0  // ❌ Component doesn't have them!
```

**Diagnosis**: React Query caching issue or component re-rendering problem.

**Possible Causes**:
- Query key mismatch
- Component unmounting before data arrives
- React Query `enabled` flag preventing query

**Fix**: Check `enabled: !!notebookId && !!user` condition

### Scenario D: Component Receives But Doesn't Render

If you see:
```javascript
========== ChatArea Component State ==========
messages from hook: [{id: 165, ...}, {id: 166, ...}]
messages.length: 2  // ✅ Component has messages
```

BUT messages don't show on screen...

**Diagnosis**: UI rendering issue.

**Possible Causes**:
- CSS hiding elements
- Conditional rendering logic excluding messages
- Messages array being overwritten
- Scroll area not displaying properly

**Fix**: Check component JSX rendering logic

---

## Additional Checks

### Check 1: Verify Session ID Matches

Open **DevTools → Console** and run:
```javascript
// Get session ID from URL
window.location.pathname.split('/').pop()
```

Compare with database:
```sql
SELECT session_id FROM n8n_chat_histories
WHERE session_id = 'YOUR-SESSION-ID';
```

Should match!

### Check 2: Check for JavaScript Errors

In **DevTools → Console**, filter by "Errors" (red X icon).

Look for:
- `TypeError: Cannot read property...`
- `ReferenceError: ... is not defined`
- `SyntaxError: ...`

### Check 3: Check Network Tab

1. Go to **DevTools → Network** tab
2. Refresh page
3. Filter by **"supabase"** or **"postgrest"**
4. Look for query to `n8n_chat_histories`
5. Click on request → Preview tab
6. **Expected**: Should show array of messages

---

## Report Back

After following the steps above, please report:

1. **Console Output**: Copy the full console output (all the log sections)
2. **Scenario Identified**: Which scenario (A, B, C, or D) matches what you see?
3. **JavaScript Errors**: Any red errors in console?
4. **Network Response**: What does the Network tab show for `n8n_chat_histories` query?

---

## Quick Verification Queries

Run these in **Supabase SQL Editor** to double-check data:

### Check Messages for Session
```sql
SELECT
  id,
  session_id,
  message->>'type' as type,
  message->>'content' as content
FROM n8n_chat_histories
WHERE session_id = 'YOUR-SESSION-ID'
ORDER BY id ASC;
```

### Check Sources for Session
```sql
SELECT
  csd.source_id,
  s.title,
  s.type,
  s.processing_status
FROM chat_session_documents csd
INNER JOIN sources s ON s.id = csd.source_id
WHERE csd.chat_session_id = 'YOUR-SESSION-ID';
```

### Check React Query Cache

In browser console, run:
```javascript
// Access React Query DevTools data
window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__?.reactQuery
```

---

## Known Session IDs (for testing)

From database verification:
- `85a2fd3f-f11b-4a70-a002-fb5d52721572` - 2 messages, 10 sources
- `19993041-7764-43ec-8fff-e97f341ff79b` - 4 messages, 20 sources

Try navigating directly to:
- http://localhost:8084/chat/85a2fd3f-f11b-4a70-a002-fb5d52721572

---

## Next Steps

Once you provide the console output, I can:

1. ✅ Identify exact failure point
2. ✅ Determine if it's data, transformation, or rendering issue
3. ✅ Provide specific fix
4. ✅ Test fix works

---

**Current Status**: Waiting for console output from browser testing

---

**Debug Session**: October 20, 2025
**Investigator**: Claude Code
**Dev Server**: http://localhost:8084
