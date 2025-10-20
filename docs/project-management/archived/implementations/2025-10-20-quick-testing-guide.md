# Quick Testing Guide - Chat Implementation

**Test URL**: `http://localhost:8082`

---

## 🎯 Quick Test (5 minutes)

### 1. Login as Administrator
```
Email: admin@hh.com
Password: Admin@123
```

### 2. Create New Chat
1. Click "**New Chat**" button on Dashboard
2. ✅ **Verify**: Chat opens (not "0 sources" error)
3. ✅ **Verify**: Right sidebar shows your documents

### 3. Send a Message
1. Type: "What policies are available?"
2. Click Send
3. ✅ **Verify**: AI responds (may take 10-30 seconds)

### 4. Test Navigation
1. Click "**Chat**" in top navigation
2. ✅ **Verify**: See your chat sessions list
3. Click your chat session
4. ✅ **Verify**: Returns to chat with history

---

## 🧪 Full Test (15 minutes)

### Test All Roles

1. **Administrator** (`admin@hh.com` / `Admin@123`)
   - Should see: Administrator documents only
   - Secondary nav: [Document Management] [Content Analytics]

2. **Executive** (`executive@hh.com` / `Executive@123`)
   - Should see: Executive + Administrator documents
   - Secondary nav: (none)

3. **Board** (`board@hh.com` / `Board@123`)
   - Should see: ALL documents
   - Secondary nav: [Strategic Overview] [Policy Analysis] [Risk Assessment] [System Alerts]

### For Each Role:
1. Create new chat → Verify sources count
2. Send message → Verify AI response
3. Click Chat nav → Verify sessions list
4. Test secondary nav → Verify Coming Soon pages

---

## ✅ What to Check

### Chat Creation
- [ ] "New Chat" button works
- [ ] Sources sidebar shows documents (not empty)
- [ ] Input shows "X sources" (not 0)
- [ ] Can send messages immediately

### Chat Interface
- [ ] Three panels visible (History | Chat | Sources)
- [ ] Chat history sidebar shows sessions
- [ ] Sources sidebar shows documents
- [ ] Messages send/receive correctly

### Navigation
- [ ] Primary nav: Dashboard, **Chat**, Search, Settings, Help
- [ ] Secondary nav: Role-specific items
- [ ] All Coming Soon pages load

### Role-Based Access
- [ ] Administrator sees only Admin docs
- [ ] Executive sees Admin + Executive docs
- [ ] Board sees ALL docs

---

## 🐛 Known Issues (Not Bugs)

These are **expected limitations**:

1. **Coming Soon Pages**: Board/Admin features show "Coming Soon" → Expected ✅
2. **Citations Don't Highlight**: Citations work but don't highlight PDF → Phase 3 ✅
3. **No Delete Chat**: Delete button doesn't work → Placeholder ✅
4. **No Rename Chat**: Can't rename sessions → Phase 3 ✅

---

## 🆘 Troubleshooting

### "0 sources" still appears
- **Cause**: Documents not linked
- **Fix**: Check console logs for errors
- **Check**: Do you have completed documents?

### Cannot send messages
- **Cause**: N8N webhook not configured
- **Fix**: Check N8N workflow is active
- **Check**: Console for network errors

### Documents not showing
- **Cause**: RLS policy issue or no documents uploaded
- **Fix**: Check sources table has documents
- **Check**: Verify role assignment

### Chat not creating
- **Cause**: Database error
- **Fix**: Check console logs
- **Check**: Migration applied correctly

---

## 📊 Expected Results by Role

### Administrator
- **Sees**: ~3-5 documents (Administrator only)
- **Secondary Nav**: Document Management, Content Analytics
- **Can Upload**: No

### Executive
- **Sees**: ~5-10 documents (Executive + Administrator)
- **Secondary Nav**: None
- **Can Upload**: No

### Board
- **Sees**: ALL documents (~10-20)
- **Secondary Nav**: Board-specific features (Coming Soon)
- **Can Upload**: No

### Company Operator
- **Sees**: Based on permissions
- **Secondary Nav**: User Management, API Keys, Analytics
- **Can Upload**: Yes

### System Owner
- **Sees**: ALL documents
- **Secondary Nav**: System Settings, User Limits, User Management
- **Can Upload**: Yes

---

## 🎬 Demo Flow

**Perfect for showing to stakeholders:**

1. **Login** as Board member
2. **Dashboard**: Show UserGreetingCard with stats
3. **New Chat**: Create chat → Shows ALL documents in sidebar
4. **Send Message**: "Summarize our HR policies"
5. **Wait for Response**: AI responds with citations
6. **Navigation**: Show Chat → Sessions list
7. **Secondary Nav**: Show Coming Soon pages for Board features

**Key Talking Points**:
- ✅ Role-based document access
- ✅ Instant chat with auto-linked documents
- ✅ Clean, professional UI
- ✅ Comprehensive navigation
- ✅ Ready for production testing

---

**Last Updated**: 2025-10-20
**Status**: Ready for Testing
