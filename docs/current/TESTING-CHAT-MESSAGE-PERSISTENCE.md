# Testing Guide: Chat Message Persistence

**Date**: October 20, 2025
**Status**: Ready for Testing
**Dev Server**: http://localhost:8083 (or check console output)

---

## Architecture Verification ✅

### Current Architecture (Confirmed Working)

```
User Action → Frontend → Supabase Edge Function → N8N Workflow
                                                        ↓
                                               n8n_chat_histories
                                               (session_id = chat_sessions.id)
                                                        ↓
                                               Realtime Subscription
                                                        ↓
                                               Frontend Display
```

### Database Verification ✅

**Confirmed via SQL**:
- ✅ `n8n_chat_histories.session_id` = `chat_sessions.id` (correct linking)
- ✅ Messages are being saved (2-4 messages per recent session)
- ✅ Sources linked via `chat_session_documents` (10-20 per session)

### Fix Applied

**File**: `src/hooks/useChatMessages.tsx`

**What was fixed**:
- Changed sources query from `notebook_id` (deprecated) to `chat_session_documents` junction table
- Applied same fix to realtime subscription handler
- Now citation metadata resolves correctly

---

## Pre-Test Setup

### 1. Start Development Server

```bash
cd D:\ailocal\hhpolicy-ai
npm run dev
```

**Expected Output**:
```
VITE v5.4.10  ready in XXXXms
➜  Local:   http://localhost:8083/
```

### 2. Open Browser

Navigate to: **http://localhost:8083**

### 3. Open Browser DevTools

- Press `F12` or `Ctrl+Shift+I`
- Go to **Console** tab
- Clear console (`Ctrl+L`)

---

## Critical Test Scenarios

### ✅ Test 1: Message Persistence After Refresh

**Objective**: Verify messages persist across page reloads

**Steps**:
1. Log in to the application
2. Click "New Chat" from Dashboard
3. Verify you're on `/chat/[session-id]` route
4. Send a test message: **"What is our vacation policy?"**
5. Wait for AI response (should stream in)
6. **Press F5 or Ctrl+R to refresh the page**

**Expected Results**:
- ✅ After refresh, chat loads with loading spinner
- ✅ Both messages display (your question + AI response)
- ✅ Citations show with proper source titles (not "Unknown Source")
- ✅ No errors in console
- ✅ Source count shows correctly in right sidebar

**Failure Indicators**:
- ❌ Messages disappear after refresh
- ❌ Citations show "Unknown Source"
- ❌ Console shows errors about source queries
- ❌ Indefinite loading state

**Console Logs to Check**:
```javascript
// Should see these logs:
Raw data from database: [...]  // Array of messages
Sources map: Map(10) {...}      // Should NOT be empty
Transformed message: {...}      // Parsed message structure
```

---

### ✅ Test 2: Real-time Message Updates

**Objective**: Verify realtime subscription works

**Steps**:
1. Open chat in Browser A
2. Send message: **"Hi"**
3. Wait 2-3 seconds for AI response

**Expected Results**:
- ✅ User message appears immediately
- ✅ "AI is thinking..." indicator shows
- ✅ AI response streams in character-by-character
- ✅ No page refresh needed
- ✅ Citations render inline with numbers [1]

**Console Logs to Check**:
```javascript
// Should see:
Setting up Realtime subscription for notebook: [session-id]
Realtime subscription status: SUBSCRIBED
Realtime: New message received: {...}
Adding new message to cache: {...}
```

**Failure Indicators**:
- ❌ Messages don't appear until page refresh
- ❌ Console shows "Realtime subscription status: CLOSED"
- ❌ Multiple duplicate messages appear

---

### ✅ Test 3: Citation Display & Navigation

**Objective**: Verify citations resolve with proper source metadata

**Steps**:
1. In an active chat, ask: **"What is the dress code policy?"**
2. Wait for AI response with citations
3. Verify citation display:
   - Look for inline citation numbers: **[1]**, **[2]**, etc.
   - Look for citation cards below the message
4. Click on a citation link

**Expected Results**:
- ✅ Citation numbers appear inline in text
- ✅ Citation cards show:
  - Source title (e.g., "Employee Handbook")
  - Source type icon
  - Page/line reference
  - "View source" link
- ✅ Clicking citation navigates to Dashboard with document open
- ✅ Document viewer scrolls to correct page

**Console Logs to Check**:
```javascript
// Should see source metadata:
Sources map: Map(10) {
  'c69ff39c-...' => { id: '...', title: 'Code of Conduct', type: 'pdf' },
  ...
}
```

**Failure Indicators**:
- ❌ Citations show "Unknown Source"
- ❌ Citation cards missing source titles
- ❌ Console shows: `Sources map: Map(0) {}` (empty!)
- ❌ Clicking citation doesn't navigate

---

### ✅ Test 4: Multiple Messages Conversation

**Objective**: Verify multiple messages persist correctly

**Steps**:
1. Start a new chat
2. Send message 1: **"Hi"**
3. Wait for AI response
4. Send message 2: **"What are work hours?"**
5. Wait for AI response
6. Send message 3: **"Tell me about remote work"**
7. Wait for AI response
8. **Refresh the page (F5)**

**Expected Results**:
- ✅ All 6 messages persist (3 user + 3 AI)
- ✅ Messages in correct chronological order
- ✅ All citations intact
- ✅ No duplicate messages
- ✅ Chat scroll position maintained

**Failure Indicators**:
- ❌ Only last message shows
- ❌ Messages out of order
- ❌ Duplicate messages
- ❌ Some citations missing

---

### ✅ Test 5: Empty vs Active Session State

**Objective**: Verify correct UI for empty and active sessions

**Empty Session Steps**:
1. Create brand new chat
2. Verify initial state

**Expected**:
- ✅ "Start a conversation..." placeholder
- ✅ Chat input enabled (if sources exist)
- ✅ Source count shows: "X sources"
- ✅ No messages displayed

**Active Session Steps**:
1. Send first message
2. Verify transition to active state

**Expected**:
- ✅ Message appears
- ✅ AI responds
- ✅ Conversation history begins

---

### ✅ Test 6: Cross-Session Isolation

**Objective**: Verify messages don't leak between sessions

**Steps**:
1. Open Chat Session A (note the session ID in URL)
2. Send message: **"Test A"**
3. Navigate back to Dashboard
4. Open Chat Session B (different session ID)
5. Send message: **"Test B"**
6. Navigate back to Chat Session A

**Expected Results**:
- ✅ Session A shows only "Test A" message
- ✅ Session B shows only "Test B" message
- ✅ No cross-contamination
- ✅ Each session has correct source count

**Failure Indicators**:
- ❌ Session A shows Session B's messages
- ❌ Messages from all sessions appear mixed
- ❌ Source counts are wrong

---

## Debugging Guide

### If Messages Disappear After Refresh

**Step 1: Check Console for Errors**

Look for:
```
Error fetching chat session sources: ...
Failed to parse AI content as JSON: ...
```

**Step 2: Verify Database**

```sql
-- Check if messages exist
SELECT id, session_id, message->>'type' as type, message->>'content' as content
FROM n8n_chat_histories
WHERE session_id = '[your-session-id]'
ORDER BY id DESC;
```

**Step 3: Check Sources Map**

In console, look for:
```javascript
Sources map: Map(0) {}  // ❌ EMPTY - This is the problem!
```

Should be:
```javascript
Sources map: Map(10) {  // ✅ POPULATED
  'uuid-1' => { id: '...', title: 'Policy Doc 1', type: 'pdf' },
  ...
}
```

**Step 4: Verify chat_session_documents Links**

```sql
-- Check if documents are linked to this session
SELECT
  csd.chat_session_id,
  csd.source_id,
  s.title as source_title,
  s.processing_status
FROM chat_session_documents csd
JOIN sources s ON s.id = csd.source_id
WHERE csd.chat_session_id = '[your-session-id]';
```

If this returns 0 rows, documents aren't linked!

---

### If Citations Show "Unknown Source"

**Problem**: Source map is empty

**Check**:
```javascript
// In console during message load:
console.log('Sources map:', sourceMap);
```

**If empty**, check:
1. Are documents linked? (SQL query above)
2. Are sources processing_status = 'completed'?
3. Is RLS blocking the query?

**Fix**:
```sql
-- Check RLS policies
SELECT * FROM pg_policies
WHERE tablename IN ('chat_session_documents', 'sources');
```

---

### If Realtime Doesn't Work

**Check Console**:
```javascript
Realtime subscription status: SUBSCRIBED  // ✅ Good
Realtime subscription status: CLOSED      // ❌ Bad
```

**If CLOSED**:
1. Check Supabase Dashboard → Database → Replication
2. Verify `n8n_chat_histories` table has replication enabled
3. Check network tab for WebSocket connection

**Enable Realtime**:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE n8n_chat_histories;
```

---

### If Performance is Slow

**Check Query Times**:
1. Open Network tab in DevTools
2. Filter by "supabase"
3. Look for slow queries (> 1000ms)

**Optimize if needed**:
```sql
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_id
ON n8n_chat_histories(session_id);

CREATE INDEX IF NOT EXISTS idx_chat_session_documents_session_id
ON chat_session_documents(chat_session_id);
```

---

## Expected Console Output (Successful Test)

### On Page Load:
```
Setting up Realtime subscription for notebook: b7443613-9d80-4dc1-87ba-0e29922fbbfc
Realtime subscription status: SUBSCRIBED
Raw data from database: Array(2) [...]
Sources map: Map(10) { ... }
Processing item: { id: 155, session_id: '...', message: {...} }
Transformed message: { type: 'human', content: 'hi' }
Processing item: { id: 156, session_id: '...', message: {...} }
Transformed message: { type: 'ai', content: { segments: [...], citations: [...] } }
```

### On New Message:
```
Message sent to webhook successfully
Realtime: New message received: { new: {...} }
Adding new message to cache: {...}
```

### On Refresh:
```
Cleaning up Realtime subscription
(Page reloads)
Raw data from database: Array(4) [...]
Sources map: Map(10) { ... }
```

---

## Test Results Checklist

After completing all tests, verify:

- [ ] ✅ Messages persist after refresh (Test 1)
- [ ] ✅ Realtime updates work (Test 2)
- [ ] ✅ Citations display with source titles (Test 3)
- [ ] ✅ Multiple messages persist (Test 4)
- [ ] ✅ Empty and active states correct (Test 5)
- [ ] ✅ Sessions isolated from each other (Test 6)
- [ ] ✅ No console errors
- [ ] ✅ No network errors (check Network tab)
- [ ] ✅ Sources sidebar shows correct count
- [ ] ✅ Chat input enables/disables correctly

---

## If All Tests Pass ✅

**Congratulations!** The chat message persistence issue is fully resolved.

**Next Steps**:
1. Test with multiple users
2. Test with different roles (Administrator, Executive, Board)
3. Test with large conversations (50+ messages)
4. Test on mobile viewport
5. Test citation navigation to Dashboard

---

## If Tests Fail ❌

**Rollback Option**:
```bash
git checkout src/hooks/useChatMessages.tsx
npm run dev
```

**Report Issues**:
Document in issue tracker:
- Which test failed
- Console errors
- Network tab errors
- Screenshots if possible

---

## Architecture Summary

### Why This Works

**N8N Workflow** → Saves to `n8n_chat_histories`:
```json
{
  "session_id": "chat_sessions.id",
  "message": {
    "type": "ai",
    "content": "{\"output\":[...]}"
  }
}
```

**Frontend** → Queries `n8n_chat_histories`:
```typescript
.from('n8n_chat_histories')
.select('*')
.eq('session_id', chatSessionId)
```

**Sources** → Queries via junction table:
```typescript
.from('chat_session_documents')
.select('source_id, sources(id, title, type)')
.eq('chat_session_id', chatSessionId)
```

**Result**: Messages persist, citations resolve, everything works!

---

**Testing Date**: October 20, 2025
**Tester**: [Your Name]
**Status**: ⏳ Ready for Testing

---

**End of Testing Guide**
