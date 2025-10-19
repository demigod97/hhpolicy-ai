# Sprint Change Proposal: Epic 1.14 - Document & Chat Architecture Restructure

**Date**: October 19, 2025
**Proposed By**: Sarah (Product Owner)
**Status**: Awaiting Approval
**Priority**: 🔴 **CRITICAL - HIGHEST PRIORITY**

---

## 📋 Executive Summary

This proposal introduces a foundational architectural change to PolicyAi that separates document viewing from chat functionality, creating a more intuitive user experience with proper PDF document viewing capabilities.

**Key Changes**:
- Dashboard becomes a **PDF document viewer** with role-based filtering
- Chat functionality moves to dedicated components (no longer page-level)
- Chat history displayed in sidebar (replacing notebook list)
- Legacy N8N chat system retained (AG-UI/CopilotKit deprecated)

**Timeline**: ~1 week (5-7 days)
**Risk Level**: Low
**Impact**: High value enhancement to user experience

---

## 🎯 Issue Summary

### Original Problem

The current application architecture conflates two distinct concepts:
1. **Documents** (PDF policy files to view/reference)
2. **Chats** (conversational sessions for Q&A)

This creates confusion where:
- Dashboard shows "notebooks" (chat sessions) instead of documents
- No way to directly view PDF files in their native format
- Chat interface tied to page-level routing (`/notebook/:id`)
- Users cannot browse available policy documents easily

### User Request

Transform the application to:
1. **Dashboard** → PDF document library with viewer
2. **Chat** → Separate component with session history
3. **PDF Viewing** → Native PDF rendering (not markdown)
4. **Legacy Chat Only** → Use N8N system, exclude AG-UI/CopilotKit

---

## 📊 Epic Impact Summary

### Completed Epics: ✅ No Impact

- **Epic 1.1-1.4** (Foundation): Fully preserved
- **Epic 1.5** (Role Hierarchy): Fully preserved
- All completed work remains intact

### Planned Epics: Updated

**Epic 1.7** (API Management):
- Status: No changes needed
- Can proceed after Epic 1.14

**Epic 1.8** (AI Integration): ⚠️ **Restructured**
- Story 1.8.1 (AG-UI): ~~Partial~~ → **Deprecated by Design**
- Story 1.8.2 (CopilotKit): ~~Not Started~~ → **Cancelled**
- Story 1.8.3 (N8N Migration): ~~Not Started~~ → **Deferred (Low Priority)**

**Epic 1.9-1.13**: ✅ No Impact
- Can proceed as planned after foundation

### New Epic Created

**Epic 1.14** (Document & Chat Architecture): 🆕 **NEW - HIGHEST PRIORITY**
- 5 new stories (detailed below)
- Must be completed before other work
- ~1 week timeline

---

## 📝 Artifact Adjustment Needs

### Critical Updates Required

| Artifact | Section | Change Required | Priority |
|----------|---------|-----------------|----------|
| **PRD** | FR23 | Update: Remove AG-UI/CopilotKit reference, specify N8N | 🔴 Critical |
| **PRD** | FR31-35 | Add: New requirements for PDF viewer, chat reorganization | 🔴 Critical |
| **PRD** | NFR1, NFR7 | Update: Remove AG-UI references | 🔴 Critical |
| **High-Level Architecture** | AI Integration | Replace: AG-UI diagrams with N8N chat flow | 🔴 Critical |
| **High-Level Architecture** | Database | Update: notebooks → chat_sessions | 🔴 Critical |
| **Frontend Architecture** | Paradigm | Reverse: "Chat-First" → "Document-First with Chat" | 🔴 Critical |
| **Frontend Architecture** | Components | Update: Dashboard, Notebook component descriptions | 🟡 High |
| **Database Schema** | Tables | Document: notebooks → chat_sessions rename | 🔴 Critical |
| **Tech Stack** | Dependencies | Add: react-pdf library | 🟡 High |

### Specific Proposed Edits

#### PRD Updates

**FR23 - CURRENT**:
```
FR23: The system shall provide an in-app AI chat interface powered by
AG-UI Protocol and CopilotKit, replacing the external n8n chat workflow.
```

**FR23 - PROPOSED**:
```
FR23: The system shall provide an in-app AI chat interface powered by
legacy N8N workflows with SSE streaming support.
```

**NEW REQUIREMENTS - ADD**:
```
FR31: The Dashboard shall display a grid of available PDF policy documents
filtered by the user's role via RLS policies.

FR32: Users shall be able to view PDF documents in a split-view layout
with document list on the left and PDF viewer on the right.

FR33: The PDF viewer shall use react-pdf library with support for
navigation, zoom, search, and page thumbnails.

FR34: Chat functionality shall be accessible via a dedicated chat interface
separate from the document dashboard.

FR35: Users shall be able to view past chat sessions in a sidebar list
with session metadata (date, title, message count).
```

**NFR1 - UPDATE**:
```
BEFORE: The system shall be built using the existing InsightsLM technical
stack (React, Supabase, N8N) enhanced with AG-UI Protocol and CopilotKit
for in-app AI chat.

AFTER: The system shall be built using the existing InsightsLM technical
stack (React, Supabase, N8N) with react-pdf for document viewing.
```

#### Architecture Document Updates

**High-Level Architecture Diagram - REPLACE**:

Remove AG-UI/CopilotKit subgraph, replace with:

```mermaid
subgraph "N8N Cloud (Chat & Processing)"
    J[Administrator Chat Workflow]
    K[Executive Chat Workflow]
    L[Board Chat Workflow]
    M[Extract Text Workflow]
    N[Upsert to Vector Store]
    O[Generate Notebook Details]
end

A -- "Chat Message" --> J/K/L
J/K/L -- "Streams Response" --> A
A1 -- "Views PDF" --> D
```

**Chat Flow Section - REPLACE**:

```markdown
### Chat Flow (N8N-Based Implementation)

1. User sends message via legacy ChatArea component
2. Request sent to `send-chat-message` Edge Function
3. Edge Function routes to role-specific N8N webhook
   - Administrator → NOTEBOOK_CHAT_URL
   - Executive → EXECUTIVE_CHAT_URL
   - Board → BOARD_CHAT_URL
4. N8N workflow:
   - Queries vector store with RLS-filtered access
   - Calls OpenAI API with role-based context
   - Generates response with citations
5. Response streamed back to client via SSE
6. Messages stored in chat_sessions table
```

**Database Section - UPDATE**:

```markdown
### Database Schema Changes

**chat_sessions** (renamed from notebooks):
- Primary table for storing chat conversation sessions
- Each session represents one conversation thread
- Links to user via user_id with RLS filtering

**chat_messages** (existing n8n_chat_histories):
- Stores individual messages within sessions
- Links to chat_sessions via session_id
```

#### Frontend Architecture Updates

**Overview Section - UPDATE**:

```markdown
BEFORE:
The application has been transformed from a traditional policy document
management system to a **chat-first interface** focused on conversational
interaction with policy documents.

AFTER:
The application is a **document-first interface** with integrated chat
capabilities, focused on browsing and viewing policy documents with
conversational Q&A support.
```

**Component Structure - ADD**:

```markdown
### Dashboard Page (`src/pages/Dashboard.tsx`)
- **Purpose**: Primary landing page displaying PDF document library
- **Features**:
  - Role-filtered document grid
  - Split-view layout (document list + PDF viewer)
  - Search and filter capabilities
  - Document upload (admin roles)

### Chat Interface (`src/components/chat/ChatInterface.tsx`)
- **Purpose**: Dedicated chat component (moved from Notebook page)
- **Features**:
  - Legacy N8N chat integration
  - Chat history sidebar
  - Session management
  - Citation linking to source documents
```

---

## 🚀 Recommended Path Forward

**Selected Approach**: **Direct Adjustment / Integration**

Implement as new **Epic 1.14** with 5 sequential stories, executed over ~1 week.

### Why This Path?

✅ **Preserves Completed Work**: All Epics 1.1-1.5 remain intact
✅ **Low Risk**: Incremental, testable changes
✅ **High Value**: Significantly improves user experience
✅ **Fast Execution**: Clear path, well-defined scope
✅ **Clean Architecture**: Proper separation of concerns

### Alternatives Considered & Rejected

**Option 2: Rollback AG-UI Work**
- ❌ Provides minimal benefit (work already self-contained)
- ❌ Doesn't accelerate forward progress
- ✅ Can simply archive components instead

**Option 3: PRD MVP Re-scoping**
- ❌ Not needed - this enhances MVP, doesn't reduce it
- ❌ Would delay timeline unnecessarily
- ✅ Minor PRD updates sufficient

---

## 📖 Epic 1.14: Detailed Story Breakdown

### Story 1.14.1: Database Schema - Chat Sessions Migration

**Effort**: 1 day
**Priority**: 🔴 Critical (blocking other stories)

**Acceptance Criteria**:
- [ ] `notebooks` table renamed to `chat_sessions`
- [ ] All foreign key references updated
- [ ] Migration script tested and verified
- [ ] All existing data preserved
- [ ] RLS policies updated for new table name
- [ ] Database functions updated

**Technical Approach**:
```sql
-- Migration script
ALTER TABLE notebooks RENAME TO chat_sessions;
ALTER TABLE notes RENAME COLUMN notebook_id TO chat_session_id;
-- Update all foreign key constraints
-- Update RLS policies
-- Update database functions
```

**Dependencies**: None
**Risks**: Medium (database migration) - mitigated by careful testing

---

### Story 1.14.2: Dashboard PDF Document Grid

**Effort**: 2 days
**Priority**: 🔴 Critical

**Acceptance Criteria**:
- [ ] Dashboard shows PDF documents (from `sources` table)
- [ ] Role-based filtering via RLS (Board sees all, Executive sees exec+admin, Admin sees admin only)
- [ ] Document grid with cards showing:
  - [ ] Document title
  - [ ] Document type (PDF icon)
  - [ ] Role assignment badge
  - [ ] Upload date
- [ ] Search/filter functionality
- [ ] Upload button for admin roles
- [ ] Split-view layout structure (list + viewer placeholder)

**Technical Approach**:
- Replace `NotebookGrid` component with `DocumentGrid`
- Query `sources` table instead of `notebooks`/`chat_sessions`
- Use shadcn/ui Card components
- Implement split-view layout with ResizablePanels
- RLS automatically filters based on user role

**Dependencies**: None
**Risks**: Low

---

### Story 1.14.3: React-PDF Viewer Integration

**Effort**: 1 day
**Priority**: 🔴 Critical

**Acceptance Criteria**:
- [ ] `react-pdf` library installed and configured
- [ ] PDF viewer component created using shadcn/ui styling
- [ ] Navigation controls:
  - [ ] Previous/Next page buttons
  - [ ] Page number input
  - [ ] Total page count display
- [ ] Zoom controls (zoom in/out/fit)
- [ ] Document search functionality
- [ ] Page thumbnail sidebar (optional - nice to have)
- [ ] Citation highlighting capability (integrate with existing citation system)
- [ ] Loading states and error handling
- [ ] Performance optimized for documents up to 100 pages

**Technical Approach**:
```bash
npm install react-pdf pdfjs-dist
```

```tsx
// Component structure
<PDFViewer>
  <PDFControls /> {/* Navigation, zoom, search */}
  <Document file={pdfUrl}>
    <Page pageNumber={currentPage} />
  </Document>
  <ThumbnailSidebar /> {/* Optional */}
</PDFViewer>
```

- Use Supabase Storage signed URLs for PDF access
- Implement lazy loading for large documents
- Use shadcn/ui components for controls

**Dependencies**: Story 1.14.2 (split-view layout)
**Risks**: Medium (PDF library performance) - mitigated by optimization

---

### Story 1.14.4: Chat Component Reorganization

**Effort**: 1.5 days
**Priority**: 🔴 Critical

**Acceptance Criteria**:
- [ ] New route created: `/chat/:sessionId`
- [ ] `ChatInterface.tsx` component created in `src/components/chat/`
- [ ] Legacy `ChatArea.tsx` integrated (NOT `ChatAreaCopilotKit.tsx`)
- [ ] N8N chat functionality preserved
- [ ] All existing chat features working:
  - [ ] Send/receive messages
  - [ ] Source integration
  - [ ] Citation clicks
  - [ ] Save to notes
  - [ ] Example questions
- [ ] `Notebook.tsx` page deprecated (archived)
- [ ] Navigation updated (remove /notebook routes)
- [ ] `ChatAreaCopilotKit.tsx` moved to `archive/`

**Technical Approach**:
```
src/components/chat/
├── ChatInterface.tsx          # NEW - Main chat wrapper
├── ChatArea.tsx              # EXISTING - Keep as-is
├── ChatHistorySidebar.tsx    # NEW - Created in next story
└── archive/
    └── ChatAreaCopilotKit.tsx # ARCHIVED
```

**File Changes**:
- Create `ChatInterface.tsx` wrapper component
- Update `App.tsx` routing
- Archive `src/pages/Notebook.tsx`
- Update navigation components

**Dependencies**: Story 1.14.1 (database migration)
**Risks**: Low (mostly file reorganization)

---

### Story 1.14.5: Chat History Sidebar

**Effort**: 1.5 days
**Priority**: 🟡 High

**Acceptance Criteria**:
- [ ] `ChatHistorySidebar.tsx` component created
- [ ] Lists all chat sessions for current user
- [ ] Session cards show:
  - [ ] Session title (editable)
  - [ ] Last message date
  - [ ] Message count
  - [ ] Role context badge
- [ ] Click session to navigate to `/chat/:sessionId`
- [ ] "New Chat" button to create session
- [ ] Search/filter sessions
- [ ] Sort options (date, title, role)
- [ ] Delete session functionality
- [ ] Integration with legacy `ChatArea.tsx`

**Technical Approach**:
```tsx
<ChatHistorySidebar>
  <NewChatButton />
  <SearchBar />
  <SessionList>
    {sessions.map(session => (
      <SessionCard
        title={session.title}
        lastMessage={session.updated_at}
        messageCount={session.message_count}
        onClick={() => navigate(`/chat/${session.id}`)}
      />
    ))}
  </SessionList>
</ChatHistorySidebar>
```

- Query `chat_sessions` table with RLS
- Use shadcn/ui ScrollArea for session list
- Implement real-time updates with Supabase subscriptions

**Dependencies**: Story 1.14.4 (chat reorganization)
**Risks**: Low

---

## 📅 Implementation Timeline

### Week 1: Epic 1.14 Implementation

```
Monday (Day 1):
├── Story 1.14.1: Database Migration
└── Testing & verification

Tuesday-Wednesday (Days 2-3):
├── Story 1.14.2: Dashboard PDF Grid
└── Integration testing

Thursday (Day 4):
├── Story 1.14.3: React-PDF Viewer
└── Performance testing

Friday (Day 5):
├── Story 1.14.4: Chat Reorganization (Start)
└── Component creation

Monday (Day 6):
├── Story 1.14.4: Chat Reorganization (Complete)
└── Story 1.14.5: Chat History Sidebar (Start)

Tuesday (Day 7):
├── Story 1.14.5: Chat History Sidebar (Complete)
└── Epic integration testing
```

### Week 2: Polish & Documentation

```
Wednesday-Thursday (Days 8-9):
├── End-to-end testing
├── Bug fixes
├── UX polish
└── Performance optimization

Friday (Day 10):
├── Documentation updates (PRD, Architecture)
├── Story status updates
└── Epic 1.14 completion review
```

**Total Timeline**: 10 days (2 weeks with buffer)

---

## 🎯 PRD MVP Impact

### Current MVP Status

✅ **Core Features Complete**:
- User authentication & role-based access
- Document upload & processing
- Chat interface (N8N-based)
- Citation system
- Role hierarchy (5 tiers)

🆕 **New Enhancements (Epic 1.14)**:
- PDF document viewing (native format)
- Improved document discovery
- Chat history management
- Better separation of concerns

### MVP Scope: **Enhanced, Not Reduced**

| Requirement | Before Epic 1.14 | After Epic 1.14 | Impact |
|-------------|------------------|-----------------|--------|
| Document Upload | ✅ Working | ✅ Enhanced (better UI) | + |
| Document Viewing | ⚠️ Markdown only | ✅ Native PDF | ++ |
| Chat Interface | ✅ Working (N8N) | ✅ Working + History | + |
| Role-Based Access | ✅ Working | ✅ Working | = |
| Citation System | ✅ Working | ✅ Enhanced (PDF linking) | + |

**Conclusion**: This change **strengthens** the MVP by improving core document viewing capabilities. No features are removed.

---

## 🎬 High-Level Action Plan

### Immediate Actions (This Week)

1. **Archive AG-UI/CopilotKit Components**
   - Move `ChatAreaCopilotKit.tsx` to `archive/`
   - Update `1.8.1` story status to "Deprecated by Design"
   - Archive related hooks and utilities

2. **Update Project Documentation**
   - PRD: Update FR23, add FR31-35, update NFRs
   - Architecture: Replace AG-UI diagrams with N8N flow
   - Frontend Spec: Update paradigm description

3. **Create Epic 1.14 Story Documents**
   - Write 5 story files in `docs/stories/`
   - Include detailed acceptance criteria
   - Document technical approaches
   - Add effort estimates

4. **Update Project Roadmap**
   - Set Epic 1.14 as **HIGHEST PRIORITY**
   - Update `STORY-STATUS-SUMMARY.md`
   - Create Epic tracking document

### Development Sequence (Next Week)

**Day 1**: Story 1.14.1 (Database)
**Days 2-3**: Story 1.14.2 (Dashboard)
**Day 4**: Story 1.14.3 (PDF Viewer)
**Days 5-6**: Story 1.14.4 (Chat Reorg)
**Day 7**: Story 1.14.5 (Chat History)

### Post-Implementation (Week 2)

- Integration testing
- Documentation finalization
- User acceptance testing
- Performance optimization
- Epic 1.14 completion review

---

## 🤝 Agent Handoff Plan

### Immediate Handoff: **Product Owner (Sarah - Me)**

**Actions**:
1. ✅ Create 5 detailed story documents (1.14.1 through 1.14.5)
2. ✅ Update artifact edits (PRD, Architecture)
3. ✅ Update project status documents
4. ✅ Archive deprecated AG-UI work

### Next Handoff: **Developer Agent**

**When**: After story approval
**Deliverables to Provide**:
- 5 approved story documents
- Updated architecture diagrams
- Technical specifications for each component
- Database migration scripts

**Developer Actions**:
- Implement stories in sequence
- Write tests for each component
- Integrate with existing systems
- Conduct performance testing

### Optional Handoff: **QA Agent**

**When**: After development complete
**Purpose**: End-to-end testing and validation
**Scope**:
- Test all acceptance criteria
- Verify role-based access
- Performance testing (PDF rendering)
- Integration testing (chat + documents)

---

## ✅ Success Criteria

### Epic 1.14 Acceptance

- [ ] All 5 stories completed with acceptance criteria met
- [ ] Database migration successful with zero data loss
- [ ] PDF documents viewable in dashboard with role filtering
- [ ] PDF viewer functional with all controls working
- [ ] Chat interface operational at `/chat/:sessionId`
- [ ] Chat history sidebar displaying sessions
- [ ] Legacy N8N chat functionality preserved
- [ ] No regressions in existing features (Epics 1.1-1.5)
- [ ] Performance acceptable (PDF load < 1s for typical documents)
- [ ] Documentation updated (PRD, Architecture, Stories)

### Validation Methods

1. **Manual Testing**: Each story tested during implementation
2. **Integration Testing**: Full workflow test (upload → view → chat → history)
3. **Role Testing**: Verify RLS filtering for all 5 roles
4. **Performance Testing**: PDF load times, chat responsiveness
5. **Regression Testing**: Verify Epics 1.1-1.5 still working

---

## 📊 Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database migration data loss | Low | Critical | Backup before migration, test on staging |
| React-PDF performance issues | Medium | Medium | Lazy loading, optimization, document size limits |
| Chat functionality breaks | Low | High | Preserve legacy ChatArea.tsx as-is, minimal changes |
| RLS policy errors | Low | High | Thorough testing with all 5 roles |
| Timeline overrun | Medium | Low | 2-week buffer built into estimate |

---

## 🔄 Rollback Plan

If critical issues arise during implementation:

### Story-Level Rollback

**Per Story**:
1. Revert git commits for that story
2. Restore database from backup (if Story 1.14.1)
3. Continue with remaining stories

**Effort**: < 1 hour per story

### Epic-Level Rollback

**If Epic Must Be Abandoned**:
1. Restore database to pre-Epic state
2. Revert all frontend changes
3. Restore archived AG-UI components (if needed)
4. Return to Story 1.7.1 (API Management)

**Effort**: 4-6 hours
**Data Loss**: None (backups maintained)

---

## 📋 Approval Checklist

Before proceeding, confirm:

- [ ] User understands architectural change (Dashboard → PDF viewer, Chat → Component)
- [ ] User approves 5-story Epic 1.14 approach
- [ ] User confirms ~1 week timeline acceptable
- [ ] User approves deprecating AG-UI/CopilotKit work
- [ ] User approves using react-pdf library
- [ ] User confirms legacy N8N chat must be preserved
- [ ] User approves artifact updates (PRD, Architecture)
- [ ] User ready to prioritize Epic 1.14 above all other work

---

## 📝 Conclusion

This Sprint Change Proposal outlines a clear, low-risk path to implement a significant architectural enhancement to PolicyAi. By creating Epic 1.14 with 5 well-defined stories, we can:

✅ Improve user experience with native PDF viewing
✅ Properly separate document viewing from chat functionality
✅ Maintain all completed work (Epics 1.1-1.5)
✅ Preserve the working N8N chat system
✅ Complete implementation in ~1 week

**Recommended Action**: **APPROVE** and proceed with Epic 1.14 story creation.

---

**Document Status**: Ready for Review
**Next Step**: User approval → Create 5 story documents → Begin implementation

**End of Sprint Change Proposal**
