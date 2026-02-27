# 🚀 DAY 1 DEPLOYMENT - QUICK START

## ⏱️ 5-Minute Deployment

### Option 1: Supabase Dashboard (RECOMMENDED)

**Step 1:** Open SQL Editor
```
https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/sql
```

**Step 2:** Copy & Paste
- Open file: `DEPLOY-DAY1.sql`
- Copy entire contents
- Paste into SQL Editor
- Click "Run" (or press Ctrl+Enter)

**Step 3:** Verify Success
```sql
-- Run this query to check all tables created
SELECT 'SUCCESS' as status, 
       COUNT(*) as tables_created 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages');

-- Expected: 5 tables
```

---

### Option 2: Individual Migrations

If you prefer to run migrations one at a time:

1. **Migration 1:** `20251016145126_extend_user_roles_for_operators.sql`
2. **Migration 2:** `20251016145127_create_api_keys_table.sql`
3. **Migration 3:** `20251016145128_create_token_usage_tracking.sql`
4. **Migration 4:** `20251016145129_create_user_limits_table.sql`
5. **Migration 5:** `20251016145130_create_native_chat_sessions.sql`
6. **Migration 6:** `20251016145131_enhance_sources_for_pdf_storage.sql`

---

## ✅ What You Get

After deployment, your database will have:

### 📊 New Tables (5)
- `api_keys` - Store encrypted OpenAI/Gemini/Mistral keys
- `token_usage` - Track every AI request & cost
- `user_limits` - Daily/monthly token quotas
- `chat_sessions` - Native chat storage (replaces n8n)
- `chat_messages` - Individual messages with token tracking

### 🔐 New Roles (2)
- `company_operator` - Can assign roles, upload docs
- `system_owner` - Full system access

### ⚙️ New Functions (9)
- API key management
- Token cost calculation
- Usage limit checking
- Chat session helpers
- Daily quota reset (automatic)

### 📅 Scheduled Jobs (1)
- Daily token limit reset (runs at midnight UTC)

---

## 🧪 Quick Test

After deployment, run these queries:

### Test 1: Check Tables
```sql
\dt public.*
```
Should see: api_keys, token_usage, user_limits, chat_sessions, chat_messages

### Test 2: Check Roles
```sql
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public.user_role_enum'::regtype;
```
Should see: administrator, executive, board, company_operator, system_owner

### Test 3: Check Functions
```sql
\df public.*
```
Should see 9 new functions

---

## ⚠️ Troubleshooting

**Error: "constraint already exists"**
- ✅ Normal! Migration handles this with IF EXISTS
- Continue running

**Error: "permission denied"**
- ❌ Check database password
- ❌ Verify you have OWNER privileges

**Error: "table already exists"**
- ✅ Some migrations may be partially applied
- Run verification queries to check status

---

## 📞 Need Help?

**Full Guide:** `docs/project-management/day1-deployment-guide.md`

**Supabase Dashboard:** https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh

**Support:** https://discord.supabase.com

---

## 🎯 Next: Day 2-3

Once Day 1 is complete:
1. Create Edge Functions for API key management
2. Build token tracking middleware
3. Create chat session handlers
4. Start frontend components

---

**Estimated Time:** 5-10 minutes  
**Risk:** ⬜⬜⬜⬜⬜ Very Low  
**Rollback:** All migrations use IF EXISTS - safe to rerun
