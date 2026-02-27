# PolicyAi Development Roadmap

**Last Updated**: 2025-10-20
**Status**: Active Development
**Current Version**: v1.0-beta

---

## 📊 Overall Progress

| Epic | Stories | Completion | Status |
|------|---------|------------|--------|
| **Epic 1: Core Application** | 5 stories | 100% | ✅ **COMPLETE** |
| **Epic 1.5: Role Hierarchy** | 4 stories | 60% | 🟡 **PARTIAL** |
| **Epic 1.7: SaaS Infrastructure** | 4 stories | 0% | 📋 **PLANNED** |
| **Epic 2: AI-Powered Chat** | 5 stories | 0% | 📋 **PLANNED** |
| **Epic 3: Enhanced Document** | 4 stories | 25% | 🟡 **PARTIAL** |
| **Epic 4: Settings & Administration** | 4 stories | 0% | 📋 **PLANNED** |

**Overall Project Completion**: ~40% of PRD v2.0 features

---

## ✅ Completed Features

### Epic 1: Core Application & Administrator Experience
**Status**: ✅ **COMPLETE** (100%)

All stories from Epic 1 are fully implemented and tested:

#### Story 1.1: Project Foundation & Rebranding ✅
- Application rebranded from "InsightsLM" to "PolicyAi"
- "Notebook" concept renamed to "Policy Document"
- All audio/podcast features removed
- Clean, professional UI established

#### Story 1.2: Database Schema & Role Setup ✅
- Database schema created with `user_roles` and `policy_documents` tables
- Role assignment mechanism working via Supabase
- RLS policies enforcing role-based access
- Migration system established

#### Story 1.3: Administrator Document Upload ✅
- Drag-and-drop PDF upload interface
- Successful file storage in Supabase Storage
- Document records created and linked to users
- Processing status tracking (processing → completed)

#### Story 1.4: Basic RAG Ingestion ✅
- N8N ingestion workflow fully functional
- Text extraction from PDF documents
- Chunking and vector storage in Supabase
- Automatic status updates upon completion
- Real-time progress updates via Supabase Realtime

#### Story 1.5: Role-Aware Chat ✅
- Chat interface sends user queries with identity
- N8N workflow filters by user role
- Cited answers returned successfully
- Clear "no results" messaging when no documents match

**What Works**:
- Complete document upload → processing → storage → chat pipeline
- Role-based document segregation (3 roles)
- Real-time status updates
- PDF viewing with basic navigation
- AI-powered Q&A with citations

---

## 🟡 Partially Completed Features

### Epic 1.5: Role Hierarchy & Access Control
**Status**: 🟡 **PARTIAL** (60% complete)

**Implemented**:
- ✅ 3 roles working: Board Member, Administrator, Executive
- ✅ RLS policies enforce role-based access
- ✅ UI adapts based on user role
- ✅ Role assignment via Supabase

**Not Implemented**:
- ❌ Company Operator role (0%)
- ❌ System Owner role (0%)
- ❌ 5-tier role hierarchy (only 3 roles)
- ❌ User Management Dashboard for Company Operators
- ❌ Role assignment UI for Company Operators

**Required Work**:
1. Database migration: Add `'company_operator'` and `'system_owner'` to role constraints
2. Update RLS policies for 5-role system
3. Create User Management Dashboard
4. Implement role assignment UI with permission controls
5. Add navigation menu role-based visibility

**Estimated Effort**: 12-16 hours

---

### Epic 3: Enhanced Document Experience
**Status**: 🟡 **PARTIAL** (25% complete)

**Implemented**:
- ✅ Basic PDF viewer using react-pdf (Story 3.1 - 100%)
- ✅ Page-by-page rendering with zoom controls
- ✅ Text selection for copying
- ✅ Print functionality

**Not Implemented**:
- ❌ PDF Navigation & Search (Story 3.2 - 0%)
  - Page thumbnails sidebar
  - In-document text search
  - Keyboard shortcuts for navigation

- ❌ Citation Highlighting (Story 3.3 - 0%)
  - Highlight cited sections in PDF
  - Click citation to jump to source
  - Visual overlay for citations

- ❌ Dual Navigation System (Story 3.4 - 0%)
  - Contextual breadcrumbs
  - Document metadata panel
  - Document age warnings (>18 months)
  - Quick access menu

**Required Work**:
1. Implement thumbnail sidebar with react-pdf
2. Add text search with highlight functionality
3. Create citation metadata extraction during document processing
4. Build citation highlighting component
5. Design and implement dual navigation bars
6. Create document metadata panel

**Estimated Effort**: 16-20 hours

---

## 📋 Planned Features (Not Started)

### Epic 1.7: SaaS Infrastructure
**Status**: 📋 **PLANNED** (0% complete)
**Priority**: HIGH
**Dependencies**: Requires Epic 1.5 complete

This epic delivers core SaaS operational capabilities:

#### Story 1.7.1: API Key Management System
**What It Enables**:
- Company Operators can configure API keys for OpenAI, Gemini, Mistral, Anthropic
- AES-256 encryption for secure key storage
- Test keys before saving
- Key usage tracking and monitoring

**Technical Requirements**:
- New `api_keys` table with encryption
- API Key Manager UI component
- Key testing endpoint
- Encryption service using crypto-js

**Estimated Effort**: 8-10 hours

---

#### Story 1.7.2: Token Usage Tracking System
**What It Enables**:
- Comprehensive tracking of all AI interactions
- Token count (prompt + completion)
- Cost estimation per request
- Usage analytics and reporting

**Technical Requirements**:
- New `token_usage` table
- Middleware to track every AI request
- Provider-specific tokenizer integration
- Cost calculation service with pricing data

**Estimated Effort**: 10-12 hours

---

#### Story 1.7.3: User Limits & Quota Management
**What It Enables**:
- System Owners configure per-user token limits
- Daily and monthly quotas
- Automatic limit enforcement
- Usage counter resets via cron jobs

**Technical Requirements**:
- New `user_limits` table
- Limit check function (must run in <50ms)
- Cron jobs for daily/monthly resets
- User limit configuration UI

**Estimated Effort**: 10-12 hours

---

#### Story 1.7.4: Token Usage Dashboard & Monitoring
**What It Enables**:
- Visual dashboard with charts (Recharts)
- Usage trends and cost projections
- User usage breakdown
- Alert system for users approaching limits

**Technical Requirements**:
- Token Usage Dashboard component
- Recharts integration (line, bar, pie charts)
- Real-time polling (30s refresh)
- CSV export functionality

**Estimated Effort**: 12-14 hours

**Total Epic 1.7 Effort**: 40-48 hours (5-6 days)

---

### Epic 2: AI-Powered Chat Experience
**Status**: 📋 **PLANNED** (0% complete)
**Priority**: HIGH
**Dependencies**: Requires Epic 1.5 complete

This epic replaces the current N8N webhook-based chat with in-app AG-UI + CopilotKit implementation.

**Current State**: Chat uses external N8N workflows via webhooks
**Target State**: Native in-app chat with real-time streaming

#### Story 2.1: AG-UI + CopilotKit Integration Foundation
**What It Enables**:
- In-app AI chat with streaming support
- Real-time message updates
- Event-driven architecture (AG-UI Protocol)

**Technical Requirements**:
- Install: `@ag-ui/react`, `@copilotkit/react-core`, `@copilotkit/react-ui`
- Configure CopilotKit provider
- Create Supabase Edge Function for AG-UI event handling
- Implement 16 AG-UI event types (RUN_STARTED, TEXT_MESSAGE_CONTENT, etc.)

**Estimated Effort**: 12-16 hours

---

#### Story 2.2: Native Chat Interface with Streaming
**What It Enables**:
- Real-time streaming responses (token-by-token)
- Typing indicators
- Mobile-responsive chat UI

**Technical Requirements**:
- StreamingChatInterface component
- CopilotTextarea with AI assistance
- TypingIndicator component
- Error handling and timeout logic

**Estimated Effort**: 10-12 hours

---

#### Story 2.3: Chat Session Management
**What It Enables**:
- Persistent chat history
- Organized sessions with favorites
- Context maintenance across conversations

**Technical Requirements**:
- New `chat_sessions` table
- New `chat_messages` table
- Chat History Sidebar component
- Session title auto-generation

**Estimated Effort**: 10-12 hours

---

#### Story 2.4: Role-Based Vector Store Filtering
**What It Enables**:
- Automatic role-based document filtering
- Clear visibility of search scope
- Zero cross-role data leakage

**Technical Requirements**:
- Update vector store queries with role parameter
- RLS policies on `documents` table
- Search scope display in UI

**Estimated Effort**: 6-8 hours

---

#### Story 2.5: Advanced Chat Features & Citations
**What It Enables**:
- Citation highlighting (links to Epic 3.3)
- Message rating (thumbs up/down)
- Copy, regenerate, tool call display
- Token usage display per message

**Technical Requirements**:
- Citation chip components
- Rating system (stored in `chat_messages.user_rating`)
- Copy to clipboard functionality
- Token counter display

**Estimated Effort**: 12-14 hours

**Total Epic 2 Effort**: 50-62 hours (6-8 days)

---

### Epic 4: Settings & Administration
**Status**: 📋 **PLANNED** (0% complete)
**Priority**: MEDIUM
**Dependencies**: Requires Epics 1.5 and 1.7 complete

This epic provides comprehensive configuration and administration interfaces.

#### Story 4.1: Settings Hub & Navigation
**What It Enables**:
- Centralized settings interface
- Tab-based navigation (Profile, API Keys, Token Usage, User Management, Preferences)
- Role-based tab visibility

**Technical Requirements**:
- SettingsHub component with tab navigation
- SettingsLayout component
- Unsaved changes warning
- Toast notification system

**Estimated Effort**: 6-8 hours

---

#### Story 4.2: API Key Configuration Interface
**What It Enables**:
- User-friendly UI for API key management
- Key testing before saving
- Secure key display (last 4 chars only)
- Activate/deactivate keys

**Technical Requirements**:
- API Keys settings tab
- ApiKeyDialog modal
- Key testing endpoint integration
- EncryptionIndicator component

**Estimated Effort**: 10-12 hours

---

#### Story 4.3: User Management Dashboard
**What It Enables**:
- Company Operators manage user roles
- View all company users with statistics
- Bulk role assignments
- User suspension (System Owners only)

**Technical Requirements**:
- UserManagementDashboard component
- RoleAssignmentDialog
- User search and filter functionality
- Bulk action support

**Estimated Effort**: 14-16 hours

---

#### Story 4.4: Token Usage Monitoring Dashboard
**What It Enables**:
- Detailed token usage analytics
- Cost tracking and projections
- User drill-down views
- Export to CSV

**Technical Requirements**:
- Token Usage tab in Settings
- TokenTrendChart (Recharts line chart)
- UserUsageTable with drill-down
- CostProjectionWidget
- Auto-refresh every 30s

**Estimated Effort**: 12-14 hours

**Total Epic 4 Effort**: 42-50 hours (5-6 days)

---

## 🐛 Known Issues (Deferred Features)

These are minor bugs identified but deferred for later resolution:

### Bug 1: NaN File Size Display During Upload
**Severity**: 🟡 Minor - UI Cosmetic
**Status**: Documented, not blocking
**Fix Effort**: 1-2 hours

### Bug 2: Slow Document Loading (10+ Documents)
**Severity**: 🟠 Moderate - Performance
**Status**: Documented, workaround available
**Fix Effort**: 4-6 hours (pagination + optimization)

### Bug 3: Document Visibility Delay After Upload
**Severity**: 🟡 Minor - Cache Invalidation
**Status**: Documented, refresh works
**Fix Effort**: 2-3 hours

**Total Bug Fix Effort**: 7-11 hours

---

## 📅 Suggested Implementation Timeline

Based on effort estimates and dependencies:

### Phase 1: Complete Role Hierarchy (Weeks 1-2)
**Goal**: Finish Epic 1.5 to unlock dependent features

- [ ] Complete Story 1.5.1: Add Company Operator & System Owner roles (4h)
- [ ] Complete Story 1.5.2: Update RLS policies for 5-tier system (4h)
- [ ] Complete Story 1.5.3: Role Assignment UI (8h)
- [ ] Complete Story 1.5.4: Role-based navigation (8h)

**Total**: 24 hours (3 days)

---

### Phase 2: SaaS Infrastructure (Weeks 3-4)
**Goal**: Enable API key management and token tracking

- [ ] Complete Story 1.7.1: API Key Management (10h)
- [ ] Complete Story 1.7.2: Token Usage Tracking (12h)
- [ ] Complete Story 1.7.3: User Limits & Quotas (12h)
- [ ] Complete Story 1.7.4: Token Usage Dashboard (14h)

**Total**: 48 hours (6 days)

---

### Phase 3: AI-Powered Chat Migration (Weeks 5-6)
**Goal**: Migrate from N8N to in-app AG-UI + CopilotKit

- [ ] Complete Story 2.1: AG-UI + CopilotKit Foundation (16h)
- [ ] Complete Story 2.2: Native Chat Interface (12h)
- [ ] Complete Story 2.3: Chat Session Management (12h)
- [ ] Complete Story 2.4: Role-Based Vector Filtering (8h)
- [ ] Complete Story 2.5: Advanced Chat Features (14h)

**Total**: 62 hours (8 days)

---

### Phase 4: Enhanced PDF Experience (Week 7)
**Goal**: Complete Epic 3 features

- [ ] Complete Story 3.2: PDF Navigation & Search (10h)
- [ ] Complete Story 3.3: Citation Highlighting (14h)
- [ ] Complete Story 3.4: Dual Navigation System (12h)

**Total**: 36 hours (4-5 days)

---

### Phase 5: Settings & Administration (Week 8)
**Goal**: Complete Epic 4 features

- [ ] Complete Story 4.1: Settings Hub (8h)
- [ ] Complete Story 4.2: API Key Configuration UI (12h)
- [ ] Complete Story 4.3: User Management Dashboard (16h)
- [ ] Complete Story 4.4: Token Monitoring Dashboard (14h)

**Total**: 50 hours (6-7 days)

---

### Phase 6: Bug Fixes & Polish (Week 9)
**Goal**: Resolve known issues and polish features

- [ ] Fix Bug 1: NaN File Size Display (2h)
- [ ] Fix Bug 2: Slow Document Loading (6h)
- [ ] Fix Bug 3: Document Visibility Delay (3h)
- [ ] UI/UX polish and refinement (8h)
- [ ] Comprehensive testing (8h)

**Total**: 27 hours (3-4 days)

---

## 📊 Effort Summary

| Phase | Effort (Hours) | Duration (Days) | Status |
|-------|----------------|-----------------|--------|
| **Phase 1**: Complete Role Hierarchy | 24h | 3 days | 📋 Planned |
| **Phase 2**: SaaS Infrastructure | 48h | 6 days | 📋 Planned |
| **Phase 3**: AI-Powered Chat | 62h | 8 days | 📋 Planned |
| **Phase 4**: Enhanced PDF | 36h | 5 days | 📋 Planned |
| **Phase 5**: Settings & Admin | 50h | 7 days | 📋 Planned |
| **Phase 6**: Bug Fixes & Polish | 27h | 4 days | 📋 Planned |
| **TOTAL** | **247 hours** | **33 days** | 📋 Planned |

**Note**: Estimates assume full-time development. Actual timeline may vary based on resource availability, testing requirements, and unforeseen issues.

---

## 🎯 Prioritization Rationale

### High Priority
1. **Epic 1.5 (Role Hierarchy)**: Foundation for all other features. Blocks Epic 1.7, 2, and 4.
2. **Epic 1.7 (SaaS Infrastructure)**: Core SaaS capabilities. Enables operational use.
3. **Epic 2 (AI-Powered Chat)**: Major user-facing improvement over current N8N webhook approach.

### Medium Priority
4. **Epic 3 (Enhanced Document)**: Improves user experience but not blocking.
5. **Epic 4 (Settings & Admin)**: Important for operational management but can use workarounds initially.

### Low Priority
6. **Bug Fixes**: Minor issues with workarounds available.

---

## 🔗 Related Documentation

- **PRD v2.0** (Original): [docs/reference/prd-original-v2.0.md](../reference/prd-original-v2.0.md) - Aspirational feature set
- **Current Features**: [docs/current/features-implemented.md](features-implemented.md) - What actually works
- **Known Issues**: [docs/current/known-issues.md](known-issues.md) - Active bugs
- **User Stories**: [docs/stories/](../stories/) - Detailed story breakdowns

---

## 📞 Questions?

**How do I prioritize my work?**
- Follow the suggested timeline phases
- Complete Epic 1.5 first (foundation for everything)
- Focus on high-priority epics (1.7, 2) before medium-priority (3, 4)

**What if I find a new feature need?**
- Document in [docs/current/features-implemented.md](features-implemented.md) if relevant to current work
- Add to [docs/stories/planned/](../stories/planned/) if it's a new story
- Update this roadmap with estimated effort

**How accurate are these estimates?**
- Estimates based on similar completed work (Epic 1 stories)
- Include buffer for testing and bug fixes
- Should be treated as rough guidelines, not commitments

---

**Roadmap Created**: 2025-10-20 (Project Cleanup Plan Phase 4.2)
**Maintained By**: Dev Team
**Review Frequency**: Monthly or after each epic completion
