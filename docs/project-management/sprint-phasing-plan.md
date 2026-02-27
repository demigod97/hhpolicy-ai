# Sprint Phasing Plan: AG-UI + CopilotKit Integration

## Sprint Overview

**Duration:** 2 weeks (10 working days)
**Team Size:** Solo developer
**Approach:** Phased implementation with daily milestones
**Priority:** Option A - Roles + Token Tracking → AI Chat → UI

---

## Week 1: Foundation & Infrastructure (Days 1-5)

### Day 1: Database Schema & Migrations

**Focus:** Extend roles, create new tables

**Tasks:**
- [ ] Create migration: Extend user_roles constraint (5 roles)
- [ ] Create migration: api_keys table with encryption
- [ ] Create migration: token_usage tracking table
- [ ] Create migration: user_limits table
- [ ] Create migration: chat_sessions + chat_messages
- [ ] Update RLS policies for new roles
- [ ] Test all migrations locally
- [ ] Verify RLS policies work correctly

**Deliverable:** All database schema changes deployed

**Estimated Time:** 6-8 hours

---

### Day 2: API Key Management Backend

**Focus:** Encryption, storage, retrieval

**Tasks:**
- [ ] Install crypto-js library
- [ ] Implement encryption/decryption utilities
- [ ] Create Supabase function: store_api_key
- [ ] Create Supabase function: retrieve_api_key
- [ ] Create Supabase function: test_api_key
- [ ] Add API endpoints in Edge Functions
- [ ] Test encryption/decryption cycle
- [ ] Verify key security

**Deliverable:** API key management backend complete

**Estimated Time:** 6-8 hours

---

### Day 3: Token Usage Tracking System

**Focus:** Track requests, messages, evaluations

**Tasks:**
- [ ] Create hook: useTokenUsage
- [ ] Create Supabase function: track_token_usage
- [ ] Create Supabase function: get_user_usage
- [ ] Create Supabase function: check_limits
- [ ] Implement automatic token counting
- [ ] Add usage middleware to chat
- [ ] Create limit enforcement logic
- [ ] Test tracking accuracy

**Deliverable:** Token usage tracking operational

**Estimated Time:** 6-8 hours

---

### Day 4: User Management Backend

**Focus:** Role assignment, limits management

**Tasks:**
- [ ] Create Supabase function: assign_role
- [ ] Create Supabase function: update_user_limits
- [ ] Create Supabase function: get_all_users
- [ ] Create Supabase function: bulk_operations
- [ ] Add authorization checks
- [ ] Test role hierarchy
- [ ] Verify permission cascades
- [ ] Document API endpoints

**Deliverable:** User management API complete

**Estimated Time:** 6-8 hours

---

### Day 5: Settings UI & API Key Management

**Focus:** User-facing configuration

**Tasks:**
- [ ] Create SettingsHub component
- [ ] Create ApiKeyManager component
- [ ] Create ApiKeyDialog component
- [ ] Create KeyTestInterface component
- [ ] Implement key CRUD operations
- [ ] Add encryption indicators
- [ ] Add success/error toasts
- [ ] Test end-to-end key flow

**Deliverable:** API key configuration UI complete

**Estimated Time:** 6-8 hours

---

## Week 2: AI Integration & User Interface (Days 6-10)

### Day 6: AG-UI + CopilotKit Integration

**Focus:** Install, configure, basic chat

**Tasks:**
- [ ] Install @copilotkit/react-core
- [ ] Install @ag-ui/react
- [ ] Configure CopilotKitProvider
- [ ] Configure AgUiProvider
- [ ] Create basic chat interface
- [ ] Implement streaming responses
- [ ] Add role-based context
- [ ] Test chat connectivity

**Deliverable:** Basic AI chat working

**Estimated Time:** 6-8 hours

---

### Day 7: Chat Interface & Migration

**Focus:** Replace n8n with in-app chat

**Tasks:**
- [ ] Create StreamingChatInterface component
- [ ] Create MessageBubble component
- [ ] Create ChatInputBar component
- [ ] Create TypingIndicator component
- [ ] Implement citation inline display
- [ ] Add chat history sidebar
- [ ] Connect to token tracking
- [ ] Test role-based filtering

**Deliverable:** Full chat interface functional

**Estimated Time:** 6-8 hours

---

### Day 8: PDF Viewer & Document Experience

**Focus:** View actual PDFs with citations

**Tasks:**
- [ ] Install react-pdf
- [ ] Create PdfViewer component
- [ ] Create PdfNavigationBar component
- [ ] Create PdfThumbnailSidebar component
- [ ] Implement citation highlighting
- [ ] Add page search functionality
- [ ] Create DocumentMetadataPanel
- [ ] Test PDF rendering

**Deliverable:** PDF viewer complete

**Estimated Time:** 6-8 hours

---

### Day 9: User Management & Token Dashboard

**Focus:** Admin interfaces

**Tasks:**
- [ ] Create UserManagementDashboard component
- [ ] Create UserTable component
- [ ] Create RoleAssignmentDialog component
- [ ] Create TokenUsageDashboard component
- [ ] Install and configure Recharts
- [ ] Create UsageOverviewCard component
- [ ] Create TokenTrendChart component
- [ ] Add bulk operations

**Deliverable:** Admin dashboards complete

**Estimated Time:** 6-8 hours

---

### Day 10: Dual Navigation & Polish

**Focus:** Navigation, testing, deployment

**Tasks:**
- [ ] Create PrimaryNavigationBar component
- [ ] Create SecondaryNavigationBar component
- [ ] Implement breadcrumb navigation
- [ ] Add quick access menu
- [ ] Update UserGreetingCard for new roles
- [ ] Add notification system
- [ ] Comprehensive testing
- [ ] Deploy to staging

**Deliverable:** Complete system ready for production

**Estimated Time:** 6-8 hours

---

## Daily Workflow

Each day follows this pattern:

1. **Morning (2-3 hours):** Core implementation
2. **Midday (1-2 hours):** Testing & debugging
3. **Afternoon (2-3 hours):** Documentation & integration
4. **End of Day:** Commit, push, update progress

---

## Risk Mitigation

### High-Risk Items

1. **AG-UI + CopilotKit complexity**
   - **Mitigation:** Start with basic implementation, iterate
   - **Fallback:** Keep n8n as backup

2. **Token tracking accuracy**
   - **Mitigation:** Test thoroughly on Day 3
   - **Fallback:** Manual tracking initially

3. **PDF viewer performance**
   - **Mitigation:** Implement lazy loading
   - **Fallback:** Keep markdown viewer as option

### Contingency Plan

If falling behind:
- **Skip:** Token usage dashboard charts (use simple tables)
- **Defer:** PDF thumbnail sidebar (keep simple navigation)
- **Simplify:** User management bulk operations (manual one-by-one)

---

## Success Criteria

### Week 1 Complete When:
- ✅ All 5 roles in database
- ✅ API keys can be stored/retrieved encrypted
- ✅ Token usage tracking functional
- ✅ Settings UI allows key configuration

### Week 2 Complete When:
- ✅ Chat works in-app with AG-UI + CopilotKit
- ✅ PDF viewer displays documents
- ✅ User management dashboard functional
- ✅ Token usage dashboard shows data
- ✅ Dual navigation implemented

### Sprint Complete When:
- ✅ All requirements from original request implemented
- ✅ No critical bugs
- ✅ All 40+ components created
- ✅ Documentation updated
- ✅ Deployed to staging

---

## Post-Sprint Tasks

**Not in scope for this sprint:**
- n8n deprecation (keep as fallback)
- Advanced analytics
- Cost optimization
- Mobile responsiveness polish
- Dark mode refinement

**Schedule for next sprint:**
- Performance optimization
- Advanced token analytics
- Mobile UX improvements
- n8n complete migration
