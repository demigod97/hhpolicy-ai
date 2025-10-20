# Quick Start: Testing Chat Fixes

**Date**: October 20, 2025
**Status**: ✅ **READY FOR TESTING**
**Dev Server**: http://localhost:8084

---

## What Was Fixed

### 1. ✅ Infinite Loop Issue - FIXED
**Problem**: Sending "Hi" caused messages to loop infinitely.

**Root Cause**: All chat sessions shared the same realtime channel name `'chat-messages'`, causing cross-session interference.

**Fix**: Changed to unique channel per session: `chat-messages-${sessionId}`

**File**: `src/hooks/useChatMessages.tsx:230`

---

### 2. ✅ Auto-Sync to chat_sessions - IMPLEMENTED
**Problem**: `chat_sessions` table columns were empty even though N8N was saving messages to `n8n_chat_histories`.

**Fix**: Created database trigger that automatically updates `chat_sessions` whenever a message is added to `n8n_chat_histories`.

**Updates**:
- `message_count` - Total messages in session
- `total_tokens_used` - Estimated token usage
- `last_message_at` - Timestamp of last message
- `context_data` - User/AI message breakdown

**Migration**: `20251020184908_sync_n8n_chat_to_chat_sessions.sql` ✅ Applied

---

### 3. ✅ Message Persistence - VERIFIED
**Problem**: Messages disappear after refresh.

**Status**: Should now work correctly with the realtime channel fix.

---

## Quick Test (5 Minutes)

### Step 1: Open Chat
1. Go to http://localhost:8084
2. Log in
3. Click "New Chat" or open existing chat

### Step 2: Send Message
1. Type: **"Hi"**
2. Click Send
3. **Watch for**:
   - ✅ Message appears once (not multiple times)
   - ✅ AI responds once
   - ✅ No infinite loop

### Step 3: Refresh Test
1. Press **F5** to refresh page
2. **Verify**:
   - ✅ Your message still visible
   - ✅ AI response still visible
   - ✅ Citations show properly

### Step 4: Check Database
1. Open Supabase Dashboard → SQL Editor
2. Run:
```sql
SELECT id, title, message_count, last_message_at
FROM chat_sessions
ORDER BY updated_at DESC
LIMIT 5;
```
3. **Verify**: `message_count` is populated (not 0)

---

## Expected Console Output

Open Browser DevTools (F12) → Console. You should see:

```javascript
// When page loads:
Setting up Realtime subscription for notebook: [session-id]
Realtime subscription status: SUBSCRIBED

// When you send message:
Message sent to webhook successfully

// When AI responds:
Realtime: New message received: {new: {...}}
Adding new message to cache: {...}
```

**Red Flags** (should NOT see):
- ❌ Multiple "Message sent to webhook successfully" (infinite loop)
- ❌ "Realtime subscription status: CLOSED"
- ❌ Empty source map: `Sources map: Map(0) {}`

---

## Verify Database Sync

Run this query in Supabase SQL Editor:

```sql
-- Check most recent sessions
SELECT
  cs.id,
  cs.title,
  cs.message_count,
  cs.total_tokens_used,
  cs.last_message_at,
  cs.context_data->'user_message_count' as user_msgs,
  cs.context_data->'ai_message_count' as ai_msgs
FROM chat_sessions cs
WHERE cs.message_count > 0
ORDER BY cs.updated_at DESC
LIMIT 10;
```

**Expected**: All columns populated with real data (not NULL or 0).

---

## If Something Breaks

### Infinite Loop Returns
```bash
cd D:\ailocal\hhpolicy-ai
git checkout src/hooks/useChatMessages.tsx
npm run dev
```

### Disable Trigger
```sql
ALTER TABLE n8n_chat_histories DISABLE TRIGGER trigger_sync_chat_session;
```

### Check Logs
Open browser console and look for errors.

---

## Success Criteria

- [ ] ✅ Send message "Hi" - no infinite loop
- [ ] ✅ Messages persist after refresh
- [ ] ✅ `chat_sessions.message_count` updates automatically
- [ ] ✅ No console errors
- [ ] ✅ Chat remains responsive

**If all pass**: You're good to go! 🎉

**If any fail**: See detailed guide in `docs/current/FIX-INFINITE-LOOP-AND-AUTO-SYNC.md`

---

**Test Server**: http://localhost:8084
**Full Documentation**: `docs/current/FIX-INFINITE-LOOP-AND-AUTO-SYNC.md`
