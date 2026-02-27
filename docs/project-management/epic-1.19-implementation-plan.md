# Epic 1.19: Template Library & Enhanced Document Upload
## Implementation Plan & Sprint Change Proposal

**Date Created**: 2025-11-28
**Status**: 📋 APPROVED - Ready for Implementation
**Priority**: HIGH
**Estimated Duration**: 3-4 weeks
**Method**: BMAD Correct Course Task
**Related Documents**: Sprint Change Proposal (2025-11-28)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Change Trigger & Context](#change-trigger--context)
3. [Epic Impact Assessment](#epic-impact-assessment)
4. [Technical Architecture](#technical-architecture)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Story Breakdown](#story-breakdown)
7. [Success Criteria](#success-criteria)
8. [Risk Management](#risk-management)
9. [Progress Tracking](#progress-tracking)
10. [Appendix](#appendix)

---

## Executive Summary

### Overview

This implementation plan addresses **9 UI/UX improvements** identified during stakeholder feedback sessions with Human Habitat. The work is organized into **Epic 1.19: Template Library & Enhanced Document Upload**, consisting of 5 stories plus quick wins from feature removals.

### Key Deliverables

**Phase 1: Quick Wins** (Week 1)
- Remove Suggested Questions feature
- Hide Notes saving UI (preserve data)
- Remove "Back to Dashboard" button
- Update filter terminology (Admin → General, role display names)
- Fix duplicate close buttons
- Review status filter labels

**Phase 2-4: Epic 1.19** (Weeks 2-4)
- Template Library Infrastructure (Story 1.19.1)
- Template Download Component (Story 1.19.2)
- Enhanced Document Upload Flow (Story 1.19.3)
- Help Section Expansion (Story 1.19.4)
- User Settings Page - Basic (Story 1.19.5)

### Business Value

- 📈 **Improved Consistency**: Standardized templates enforce proper document structure
- 📈 **Time Savings**: Download pre-formatted templates vs. create from scratch
- 📈 **Better Search**: Consistent structure improves RAG search accuracy
- 📈 **Enhanced Compliance**: Template-enforced sections ensure completeness
- 📈 **Reduced Confusion**: Remove unnecessary features, fix terminology

### Timeline

| Week | Phase | Completion % |
|------|-------|--------------|
| 1 | Quick Wins | 25% |
| 2 | Template Infrastructure | 50% |
| 3 | Template UI | 75% |
| 4 | Integration & Polish | 100% |

---

## Change Trigger & Context

### 1.1 Triggering Event

**Source**: Stakeholder feedback session with Human Habitat management
**Date**: November 2025
**Type**: Consolidated improvement request (not a story failure)

### 1.2 Identified Issues (9 Total)

#### Category A: Feature Removals (4 items)

**Issue 1: Suggested Questions**
- **Current**: AI-generated questions shown below chat input
- **Problem**: Deemed confusing and unnecessary by stakeholders
- **Action**: Complete removal of component and edge function

**Issue 2: Notes Saving Feature**
- **Current**: SaveToNoteButton allows saving chat responses
- **Problem**: Unintuitive, unclear value proposition
- **Action**: Hide UI, preserve database table and data

**Issue 3: "Back to Dashboard" Button**
- **Current**: Button on Help page
- **Problem**: References non-existent dashboard (broken link)
- **Action**: Remove button entirely

**Issue 4: Outdated Policies Filter**
- **Current**: "Show outdated policies only (18+ months)" filter available to all
- **Problem**: Not logical for general users, clutters filter UI
- **Action**: Remove or restrict to admin-only view

#### Category B: New Feature - Template Management (1 major item)

**Issue 5: Missing Template System**
- **Current**: No standardized templates for policy creation
- **Problem**: Users create policies from scratch, inconsistent structure
- **Required**: Two-layer template system
  - Layer 1: Documents folder containing Templates subfolder
  - Layer 2: Template types (Policy, Process, Checklist)
  - Layer 3: Access levels (General, Executive, Board)
  - Total: 9 templates (3 types × 3 levels)
- **Format**: Word documents (.docx)
- **Source**: `docs/HH Data/HH Policy -Policy Template.docx`

#### Category C: Content & Terminology Fixes (4 items)

**Issue 6: Help Section Insufficient**
- **Current**: Minimal content, placeholder cards, incorrect information
- **Problem**: Misleading Quick Start Guide, no role explanations
- **Action**: Complete rewrite with 5+ comprehensive sections

**Issue 7: Document Page - Duplicate Close Buttons**
- **Current**: Two "X" buttons appear when viewing PDF
- **Problem**: Confusing UX, unclear which button to use
- **Action**: Identify and remove duplicate button

**Issue 8: Filter Terminology - Role Labels**
- **Problem a**: "Admin" filter label should be "General"
- **Problem b**: Unclear "System Ops" vs "Company Owner" labels
- **Action**: Create proper UI label mapping

**Issue 9: Status Filter Labels Unclear**
- **Current**: Status filter options unclear to users
- **Problem**: Labels don't match user mental models
- **Action**: Review and simplify status options

### 1.3 Stakeholder Clarifications

**Notes Feature** → Hide UI, preserve data (users may want it later)
**Templates** → Supabase Storage + Admin UI management (not static files)
**"Admin" vs "General"** → UI label change only (database role `administrator` unchanged)
**Role Clarity**:
- `system_owner` → "System Owner" (developer/backend access)
- `company_operator` → "Company Operator" (document management)
- `administrator`, `executive`, `board` → "General", "Executive", "Board" (staff access levels)

---

## Epic Impact Assessment

### 2.1 Affected Existing Epics

#### Epic 1.14: Chat Component Reorganization ✅ Completed
**Impact**: Modifications Required

**Changes**:
- Remove `SuggestedQuestions` component from `ChatArea.tsx`
- Remove `SaveToNoteButton` component from chat interface
- Fix duplicate close buttons in document viewer

**Components to Remove**:
```
src/components/chat/SuggestedQuestions.tsx
src/components/notebook/SaveToNoteButton.tsx
src/components/notebook/NoteEditor.tsx
src/hooks/useNotes.tsx
src/hooks/useGenerateSuggestedQuestions.ts
supabase/functions/generate-suggested-questions/
```

**Effort**: 1 day

---

#### Epic 1.15: UX/UI Audit and Enhancement Plan ✅ Completed
**Impact**: Expansion Required

**Changes**:
- Expand Help section (Story 1.19.4 may be linked here)
- Add comprehensive user guidance

**Effort**: Covered by Story 1.19.4 (2-3 days)

---

#### Epic 1.16: User Experience & Account Management 📋 In Progress
**Impact**: Story Cancellation

**Changes**:
- **Cancel Story 1.16.6**: Suggested Questions Feature
- Archive to `docs/stories/archive/cancelled/`
- Add cancellation rationale

**Effort**: 30 minutes (documentation only)

---

#### Epic 1.17: Dashboard Interactive Document Table ✅ Completed
**Impact**: Terminology Updates

**Changes**:
- Modify `DocumentTableFilters.tsx` label mappings:
  - `administrator` → Display as "General"
  - `company_operator` → Display as "Company Operator"
  - `system_owner` → Display as "System Owner"
- Update `useDocumentFilters.tsx` role display logic

**Files**:
```
src/components/dashboard/DocumentTableFilters.tsx
src/hooks/useDocumentFilters.tsx
```

**Effort**: 4 hours

---

#### Epic 1.18: Blue Theme Migration ✅ Completed
**Impact**: None

No changes required - theme migration unaffected.

---

### 2.2 New Epic Created

#### Epic 1.19: Template Library & Enhanced Document Upload ⭐ NEW
**Status**: Not Started
**Priority**: HIGH
**Estimated Effort**: 2-3 weeks
**Stories**: 5 (1.19.1 through 1.19.5)

**Rationale for New Epic**:
- Template management is a major new feature (not a modification)
- Requires significant backend infrastructure
- Warrants dedicated tracking and planning
- Clean separation from existing work

**Epic Goals**:
1. Enable Company Operators to upload/manage templates
2. Provide staff with downloadable Word templates
3. Enforce template structure for better searchability
4. Collect enhanced metadata during document upload
5. Improve user guidance and account management

**Dependencies**: None (standalone epic)

---

## Technical Architecture

### 3.1 Database Schema Changes

#### New Table: `templates`

```sql
CREATE TABLE public.templates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    template_type text NOT NULL CHECK (template_type IN ('policy', 'process', 'checklist')),
    access_level text NOT NULL CHECK (access_level IN ('general', 'executive', 'board')),
    file_path text NOT NULL,
    file_name text NOT NULL,
    file_size integer,
    storage_bucket text DEFAULT 'templates' NOT NULL,
    version integer DEFAULT 1,
    is_active boolean DEFAULT true,
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT unique_template_type_level UNIQUE(template_type, access_level, is_active)
);
```

**Indexes**:
- `idx_templates_type_level` - For filtering by type/level
- `idx_templates_uploaded_by` - For audit queries

**RLS Policies**:
- All authenticated users can view active templates
- Company Operators and System Owners can insert/update
- System Owners can delete (soft delete)

---

#### Enhanced `sources` Table

```sql
-- Additional metadata columns for enhanced upload flow
ALTER TABLE public.sources ADD COLUMN IF NOT EXISTS policy_summary text;
ALTER TABLE public.sources ADD COLUMN IF NOT EXISTS attributed_to text;
ALTER TABLE public.sources ADD COLUMN IF NOT EXISTS eligibility text;
ALTER TABLE public.sources ADD COLUMN IF NOT EXISTS policy_information text;
ALTER TABLE public.sources ADD COLUMN IF NOT EXISTS policy_notes text;
ALTER TABLE public.sources ADD COLUMN IF NOT EXISTS policy_comments text;
ALTER TABLE public.sources ADD COLUMN IF NOT EXISTS release_month integer;
ALTER TABLE public.sources ADD COLUMN IF NOT EXISTS release_year integer;
```

**Purpose**: Support Story 1.19.3 (Enhanced Upload Flow) metadata collection

---

### 3.2 Supabase Storage Configuration

**New Bucket**: `templates`

**Configuration**:
- Public: `false` (authenticated access only)
- File size limit: `10MB`
- Allowed MIME types:
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (.docx)
  - `application/msword` (.doc)

**Storage RLS Policies**:
- All authenticated users can read from `templates` bucket
- Company Operators and System Owners can upload/update
- System Owners can delete

**Folder Structure**:
```
templates/
├── policy/
│   ├── general/
│   │   └── policy-general-template.docx
│   ├── executive/
│   │   └── policy-executive-template.docx
│   └── board/
│       └── policy-board-template.docx
├── process/
│   ├── general/
│   ├── executive/
│   └── board/
└── checklist/
    ├── general/
    ├── executive/
    └── board/
```

---

### 3.3 Component Architecture

#### New Components (10+)

**Template Management**:
```
src/components/templates/
├── TemplateLibrary.tsx            # Main template browsing UI
├── TemplateCard.tsx               # Individual template display
├── TemplateUploadDialog.tsx       # Company Operator upload
└── TemplateDownloadButton.tsx     # Download with signed URL
```

**Enhanced Document Upload**:
```
src/components/document/
├── EnhancedDocumentUploader.tsx   # Multi-step upload wizard
├── DocumentMetadataForm.tsx       # 8-field metadata form
└── UploadProgressTracker.tsx      # Enhanced progress feedback
```

**User Settings**:
```
src/pages/
└── UserSettings.tsx               # Account management page
```

**Hooks**:
```
src/hooks/
├── useTemplates.tsx               # Template CRUD operations
├── useTemplateDownload.tsx        # Download with signed URLs
└── useEnhancedUpload.tsx          # Enhanced upload logic
```

**Types**:
```
src/types/
└── template.ts                    # Template type definitions
```

---

#### Components to Remove (4)

```
src/components/chat/
└── SuggestedQuestions.tsx         # ❌ DELETE

src/components/notebook/
├── SaveToNoteButton.tsx           # ❌ DELETE
├── NoteEditor.tsx                 # ❌ DELETE
└── MobileNotebookTabs.tsx         # ❌ REVIEW (if notes-related)

src/hooks/
├── useNotes.tsx                   # ❌ DELETE
└── useGenerateSuggestedQuestions.ts  # ❌ DELETE

supabase/functions/
└── generate-suggested-questions/  # ❌ DELETE
```

---

### 3.4 Role Terminology Mapping

**Database vs UI Labels**:

| Database Role | Current UI Label | New UI Label | Context |
|---------------|------------------|--------------|---------|
| `system_owner` | System Owner | **System Owner** | Software updates, backend |
| `company_operator` | Company Operator | **Company Operator** | Document management |
| `administrator` | Administrator | **General** | Staff access - general policies |
| `executive` | Executive | **Executive** | Executive-level policies |
| `board` | Board | **Board** | Board-level policies |

**Implementation**:
- Create `src/lib/roleLabelMapping.ts` utility
- Update all filter components to use mapping
- Update badge components
- Update help documentation

---

## Implementation Roadmap

### Phase 1: Quick Wins (Week 1)

**Objective**: Remove deprecated features, fix terminology, address obvious issues

#### Tasks

**Day 1-2: Feature Removals**
- [ ] Remove `SuggestedQuestions` component
  - Delete `src/components/chat/SuggestedQuestions.tsx`
  - Remove import/usage from `ChatArea.tsx`
  - Delete `src/hooks/useGenerateSuggestedQuestions.ts`
  - Delete `supabase/functions/generate-suggested-questions/`
  - Remove related tests
- [ ] Hide Notes UI
  - Comment out `SaveToNoteButton` component renders
  - Comment out `NoteEditor` component renders
  - Keep database table intact
  - Keep hooks for potential future use
  - Add feature flag for easy re-enable if needed
- [ ] Remove "Back to Dashboard" button
  - Edit `src/pages/Help.tsx`
  - Remove button and imports

**Day 3: Terminology Updates**
- [ ] Create role label mapping utility
  - File: `src/lib/roleLabelMapping.ts`
  - Map database roles to display labels
- [ ] Update filter components
  - `src/components/dashboard/DocumentTableFilters.tsx`
  - `src/hooks/useDocumentFilters.tsx`
  - Update role dropdown labels
- [ ] Update badge components
  - `src/components/dashboard/RoleAssignmentBadge.tsx`
  - Use new label mapping

**Day 4: Bug Fixes & Review**
- [ ] Fix duplicate close buttons
  - Identify component with duplicate buttons
  - Likely `src/components/pdf/PDFViewer.tsx` or parent
  - Remove redundant button
- [ ] Review status filters
  - Analyze current status values
  - Determine if simplification needed
  - Update if necessary
- [ ] Test all changes
  - Manual QA of affected features
  - Verify no regressions
  - Update tests

**Day 5: Code Review & Merge**
- [ ] Code review
- [ ] Update documentation
- [ ] Merge to main branch
- [ ] Deploy to staging

**Deliverables**:
- ✅ Cleaner UI (no suggested questions, no notes buttons)
- ✅ Accurate terminology (General, not Admin)
- ✅ Fixed duplicate close buttons
- ✅ Reviewed status filters

**Success Metrics**:
- All removed components no longer in codebase
- No broken imports or references
- All tests passing
- Filter labels match new terminology
- Single close button per document viewer

---

### Phase 2: Template Foundation (Week 2)

**Objective**: Build backend infrastructure for template management

**Story**: 1.19.1 - Template Library Infrastructure (3-4 days)

#### Tasks

**Day 1: Database**
- [ ] Create migration: `20251128000001_create_templates_table.sql`
- [ ] Test migration locally
- [ ] Create RLS policies
- [ ] Create indexes
- [ ] Test with different user roles

**Day 2: Storage & Seeding**
- [ ] Create `templates` storage bucket
- [ ] Configure bucket policies (10MB, .docx only)
- [ ] Write seeding script: `scripts/seed-initial-templates.ts`
- [ ] Upload 9 templates from `docs/HH Data/`
- [ ] Verify signed URLs work

**Day 3: React Hooks**
- [ ] Create TypeScript types: `src/types/template.ts`
- [ ] Implement `useTemplates()` hook
- [ ] Implement `useUploadTemplate()` mutation
- [ ] Implement `useUpdateTemplate()` mutation
- [ ] Implement `useDeleteTemplate()` mutation
- [ ] Implement `useTemplateDownloadUrl()` query

**Day 4: Testing**
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Manual testing
- [ ] Update documentation
- [ ] Code review & merge

**Deliverables**:
- ✅ Templates table with 9 seeded templates
- ✅ Functional CRUD APIs via React Query hooks
- ✅ Proper access control via RLS
- ✅ < 500ms query performance

**Success Metrics**:
- All 9 templates stored and queryable
- RLS policies prevent unauthorized access
- Hooks work correctly with React Query DevTools
- Test coverage > 80%

---

### Phase 3: Template UI (Week 3)

**Objective**: Build user-facing template library and enhanced upload UI

**Stories**: 1.19.2 (Template Download) + 1.19.3 Part 1 (Upload UI)

#### Story 1.19.2: Template Download Component (2-3 days)

**Day 1-2: UI Components**
- [ ] Create `TemplateLibrary.tsx`
  - Tabbed interface (Policy | Process | Checklist)
  - Grid layout (3 columns)
  - Filter by access level
- [ ] Create `TemplateCard.tsx`
  - Display template info (type, level, description)
  - Show file size and download count
  - Download button
- [ ] Create `TemplateDownloadButton.tsx`
  - Generate signed URL
  - Initiate browser download
  - Show progress/confirmation
- [ ] Add template library to navigation

**Day 3: Testing**
- [ ] Test download flow
- [ ] Test with different user roles
- [ ] Verify downloaded files open correctly
- [ ] Mobile responsiveness testing

**Deliverables**:
- ✅ Browsable template library
- ✅ Download functionality for all templates
- ✅ Role-based access respected

---

#### Story 1.19.3 Part 1: Enhanced Upload UI (2-3 days)

**Day 1-2: Multi-Step Form**
- [ ] Create `EnhancedDocumentUploader.tsx`
  - Step 1: File selection (PDF only)
  - Step 2: Metadata form (8 fields)
  - Step 3: Review & confirm
  - Step 4: Processing status
- [ ] Create `DocumentMetadataForm.tsx`
  - User Group dropdown (General/Executive/Board)
  - Policy Summary textarea
  - Release Month/Year date pickers
  - Attributed To text input
  - Eligibility textarea
  - Information textarea
  - Notes textarea
  - Comments textarea
- [ ] Form validation
  - Required fields marked
  - Date validation
  - Max length limits
- [ ] Create `UploadProgressTracker.tsx`
  - Multi-step progress indicator
  - Upload progress bar
  - Processing status updates

**Day 3: Integration**
- [ ] Connect form to existing upload flow
- [ ] Test UI only (no backend yet)
- [ ] Mobile responsiveness

**Deliverables**:
- ✅ Multi-step upload wizard UI
- ✅ Form collects all 8 metadata fields
- ✅ Form validation prevents invalid data

---

### Phase 4: Integration & Polish (Week 4)

**Objective**: Complete backend integration, expand Help content, add user settings

**Stories**: 1.19.3 Part 2 + 1.19.4 + 1.19.5

#### Story 1.19.3 Part 2: Upload Backend Integration (1-2 days)

- [ ] Create migration for enhanced source metadata
  - Add 8 new columns to `sources` table
- [ ] Update document processing edge function
  - Accept new metadata fields
  - Store in database
- [ ] Test end-to-end upload flow
  - Upload PDF with metadata
  - Verify processing completes
  - Verify metadata stored correctly
- [ ] Update document display
  - Show enhanced metadata on document cards
  - Display in document viewer sidebar

**Deliverables**:
- ✅ Uploaded documents include all metadata
- ✅ Metadata visible throughout application
- ✅ Processing pipeline handles new fields

---

#### Story 1.19.4: Help Section Expansion (2-3 days)

**Day 1: Content Writing**
- [ ] Rewrite Quick Start Guide
  - Expand from 5 to 8-10 steps
  - Include template download step
  - Include metadata explanation step
  - Add role-based guidance
- [ ] Write Templates section
  - Why templates matter
  - How to download
  - Template types and access levels
  - Naming conventions
- [ ] Write Upload Guidelines section
  - Step-by-step process
  - Metadata field explanations
  - User group selection guide
  - Best practices
- [ ] Write Access Levels & Roles section
  - Staff roles (General, Executive, Board)
  - Operational roles (Company Operator, System Owner)
  - Permission differences
  - How role assignments work
- [ ] Fix Admin Access section
  - Remove misleading upload information
  - Clarify who can upload (Company Operators only)
  - Explain role-based visibility

**Day 2: Implementation**
- [ ] Update `src/pages/Help.tsx`
- [ ] Add expandable sections
- [ ] Add visual elements (icons, badges)
- [ ] Make interactive per UX spec
- [ ] Add search functionality (optional)

**Day 3: Review & Polish**
- [ ] Stakeholder review of content
- [ ] Verify accuracy of all information
- [ ] Add screenshots/visuals
- [ ] Test on mobile

**Deliverables**:
- ✅ Comprehensive Help page (5+ sections)
- ✅ Accurate, validated information
- ✅ Interactive, user-friendly design

---

#### Story 1.19.5: User Settings Page (2-3 days)

**Day 1-2: Implementation**
- [ ] Create `src/pages/UserSettings.tsx`
- [ ] Profile Information section
  - Display email (read-only from Supabase Auth)
  - Display role (read-only from user_roles table)
  - Display name field (editable via user_metadata)
- [ ] Display Name Editor
  - Input field with validation
  - Save button
  - Update Supabase Auth user_metadata
- [ ] Password Change section
  - Current password field
  - New password field
  - Confirm password field
  - Validation (min 8 chars, etc.)
  - Call Supabase Auth updateUser()
- [ ] Link from UserGreetingCard
  - Update "Manage" button to navigate to /settings

**Day 3: Testing**
- [ ] Test display name update
- [ ] Test password change
- [ ] Verify Supabase Auth integration
- [ ] Test with different user roles
- [ ] Mobile responsiveness

**Deliverables**:
- ✅ Functional user settings page
- ✅ Display name update working
- ✅ Password change working
- ✅ Accessible from user greeting card

---

## Story Breakdown

### Story 1.19.1: Template Library Infrastructure
**Status**: 📋 Ready for Development
**Priority**: HIGH
**Story Points**: 8
**Estimated Effort**: 3-4 days
**File**: `docs/stories/1.19.1.template-library-infrastructure.md`

**Summary**: Create backend infrastructure for template management including database schema, storage bucket, RLS policies, and React Query hooks.

**Key Deliverables**:
- Templates database table
- Supabase Storage bucket configuration
- 9 initial templates seeded
- TypeScript types and React Query hooks
- Comprehensive testing

**Dependencies**: None (foundation story)

---

### Story 1.19.2: Template Download Component
**Status**: ⏳ To Be Created
**Priority**: HIGH
**Story Points**: 5
**Estimated Effort**: 2-3 days

**Summary**: Build user-facing template library with browsing and download functionality.

**Key Deliverables**:
- TemplateLibrary component with tabbed interface
- TemplateCard component showing template info
- Download functionality with signed URLs
- Navigation integration

**Dependencies**: Story 1.19.1 (requires templates table and storage)

---

### Story 1.19.3: Enhanced Document Upload Flow
**Status**: ⏳ To Be Created
**Priority**: HIGH
**Story Points**: 13
**Estimated Effort**: 4-5 days

**Summary**: Create multi-step upload wizard with 8 metadata fields, integrate with document processing pipeline.

**Key Deliverables**:
- Multi-step upload wizard UI
- 8-field metadata form with validation
- Backend schema changes (enhanced sources table)
- Edge function integration
- Document display updates

**Dependencies**: Story 1.19.1 (may reference templates)

---

### Story 1.19.4: Help Section Expansion
**Status**: ⏳ To Be Created
**Priority**: MEDIUM
**Story Points**: 8
**Estimated Effort**: 2-3 days

**Summary**: Complete rewrite of Help page with comprehensive, accurate content covering templates, upload, roles, and access levels.

**Key Deliverables**:
- Expanded Quick Start Guide (8-10 steps)
- Templates section (why, how, naming)
- Upload Guidelines section (step-by-step)
- Access Levels & Roles section
- Corrected Admin Access information
- Interactive, visually appealing design

**Dependencies**: Stories 1.19.1, 1.19.2, 1.19.3 (documents their features)

---

### Story 1.19.5: User Settings Page (Basic)
**Status**: ⏳ To Be Created
**Priority**: MEDIUM
**Story Points**: 5
**Estimated Effort**: 2-3 days

**Summary**: Create basic user settings page for profile management, display name editing, and password changes.

**Key Deliverables**:
- UserSettings page component
- Display name editor
- Password change functionality
- Supabase Auth integration
- Link from UserGreetingCard "Manage" button

**Dependencies**: None (independent feature)

---

## Success Criteria

### Overall Epic Success

**Quantitative Metrics**:
- [ ] All 9 templates available for download
- [ ] < 500ms template query performance
- [ ] < 5s upload time for 1MB document
- [ ] 100% of uploaded documents include metadata
- [ ] > 80% test coverage for new code
- [ ] 0 regressions in existing functionality

**Qualitative Metrics**:
- [ ] Stakeholder approval of template system
- [ ] User feedback positive on enhanced upload flow
- [ ] Help content validated as accurate
- [ ] Code review approved
- [ ] Documentation complete and updated

**User Acceptance**:
- [ ] Company Operators can upload/manage templates
- [ ] Staff can browse and download templates
- [ ] Enhanced upload flow collects all metadata
- [ ] Help page provides clear, accurate guidance
- [ ] User settings work correctly

---

### Phase-Specific Success Criteria

**Phase 1: Quick Wins**
- [ ] No suggested questions in UI
- [ ] Notes saving hidden but data accessible
- [ ] No "Back to Dashboard" button
- [ ] Filter labels show correct role names
- [ ] Single close button per document viewer

**Phase 2: Template Foundation**
- [ ] 9 templates stored in Supabase
- [ ] All CRUD operations working
- [ ] RLS policies enforced
- [ ] Performance benchmarks met

**Phase 3: Template UI**
- [ ] Template library navigable
- [ ] All templates downloadable
- [ ] Upload form collects all fields
- [ ] Form validation prevents errors

**Phase 4: Integration**
- [ ] Metadata flows end-to-end
- [ ] Help content comprehensive
- [ ] User settings functional
- [ ] All tests passing

---

## Risk Management

### Risk Assessment Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Timeline Overrun** | Medium | High | Phased approach allows partial delivery; Phase 1 ships independently |
| **Template Complexity** | Medium | Medium | Use existing upload pipeline; minimal new infrastructure |
| **User Data Loss (Notes)** | Low | High | Preserve DB table; UI removal only; export capability if needed |
| **Help Content Errors** | Medium | Medium | Stakeholder review; validate against system behavior |
| **Storage Costs** | Low | Low | 9 .docx files minimal; monitor bucket size |
| **Role Confusion** | Medium | Medium | Clear docs; UI label mapping; Help explanations |
| **Integration Issues** | Medium | High | Incremental integration; extensive testing |

### Mitigation Strategies

**Timeline Management**:
- Weekly progress reviews
- Early identification of blockers
- Flexible sprint boundaries
- Phase 1 can ship independently if needed

**Quality Assurance**:
- Test-driven development
- Code reviews before merge
- Staging environment testing
- User acceptance testing with stakeholders

**Communication**:
- Daily stand-ups during implementation
- Weekly demos to stakeholders
- Slack channel for questions/blockers
- Documentation updates in real-time

**Rollback Plan**:
- Feature flags for easy enable/disable
- Database migrations reversible
- Git tags for each phase completion
- Component removals tracked in version control

---

## Progress Tracking

### Week 1: Quick Wins

| Task | Assigned | Status | Completion Date |
|------|----------|--------|-----------------|
| Remove SuggestedQuestions | TBD | ⏳ Not Started | - |
| Hide Notes UI | TBD | ⏳ Not Started | - |
| Remove Back to Dashboard | TBD | ⏳ Not Started | - |
| Update Filter Labels | TBD | ⏳ Not Started | - |
| Fix Duplicate Close Buttons | TBD | ⏳ Not Started | - |
| Review Status Filters | TBD | ⏳ Not Started | - |

**Progress**: 0% (0/6 tasks complete)

---

### Week 2: Story 1.19.1 - Template Infrastructure

| Task | Assigned | Status | Completion Date |
|------|----------|--------|-----------------|
| Create Database Migration | TBD | ⏳ Not Started | - |
| Create Storage Bucket | TBD | ⏳ Not Started | - |
| Write Seeding Script | TBD | ⏳ Not Started | - |
| Upload 9 Templates | TBD | ⏳ Not Started | - |
| Implement React Hooks | TBD | ⏳ Not Started | - |
| Write Tests | TBD | ⏳ Not Started | - |

**Progress**: 0% (0/6 tasks complete)

---

### Week 3: Stories 1.19.2 + 1.19.3 Part 1

| Task | Assigned | Status | Completion Date |
|------|----------|--------|-----------------|
| Template Library Component | TBD | ⏳ Not Started | - |
| Template Card Component | TBD | ⏳ Not Started | - |
| Download Button Component | TBD | ⏳ Not Started | - |
| Enhanced Uploader UI | TBD | ⏳ Not Started | - |
| Metadata Form | TBD | ⏳ Not Started | - |
| Progress Tracker | TBD | ⏳ Not Started | - |

**Progress**: 0% (0/6 tasks complete)

---

### Week 4: Stories 1.19.3 Part 2 + 1.19.4 + 1.19.5

| Task | Assigned | Status | Completion Date |
|------|----------|--------|-----------------|
| Backend Metadata Integration | TBD | ⏳ Not Started | - |
| Help Content Writing | TBD | ⏳ Not Started | - |
| Help Page Implementation | TBD | ⏳ Not Started | - |
| User Settings Page | TBD | ⏳ Not Started | - |
| End-to-End Testing | TBD | ⏳ Not Started | - |
| Documentation Updates | TBD | ⏳ Not Started | - |

**Progress**: 0% (0/6 tasks complete)

---

### Overall Epic Progress

**Stories Completed**: 0/5 (0%)

| Story | Status | Completion % | Target Date |
|-------|--------|--------------|-------------|
| 1.19.1: Template Infrastructure | ⏳ Not Started | 0% | Week 2 |
| 1.19.2: Template Download | ⏳ Not Started | 0% | Week 3 |
| 1.19.3: Enhanced Upload | ⏳ Not Started | 0% | Week 3-4 |
| 1.19.4: Help Expansion | ⏳ Not Started | 0% | Week 4 |
| 1.19.5: User Settings | ⏳ Not Started | 0% | Week 4 |

**Epic Completion**: 0% (Target: 100% by end of Week 4)

---

## Appendix

### A. File Locations

**Stories**:
```
docs/stories/
├── 1.19.1.template-library-infrastructure.md          # ✅ Created
├── 1.19.2.template-download-component.md              # ⏳ To Create
├── 1.19.3.enhanced-document-upload-flow.md            # ⏳ To Create
├── 1.19.4.help-section-expansion.md                   # ⏳ To Create
└── 1.19.5.user-settings-page-basic.md                 # ⏳ To Create
```

**Implementation Files**:
```
supabase/migrations/
└── 20251128000001_create_templates_table.sql

scripts/
└── seed-initial-templates.ts

src/types/
└── template.ts

src/hooks/
└── useTemplates.tsx

src/components/templates/
├── TemplateLibrary.tsx
├── TemplateCard.tsx
├── TemplateUploadDialog.tsx
└── TemplateDownloadButton.tsx

src/components/document/
├── EnhancedDocumentUploader.tsx
├── DocumentMetadataForm.tsx
└── UploadProgressTracker.tsx

src/pages/
└── UserSettings.tsx

src/lib/
└── roleLabelMapping.ts
```

**Documentation**:
```
docs/project-management/
└── epic-1.19-implementation-plan.md                   # ✅ This File

docs/architecture/
├── data-models-database-schema.md                     # ⚠️ Needs Update
├── frontend-architecture.md                           # ⚠️ Needs Update
└── role-terminology-mapping.md                        # ⚠️ To Create

docs/ux-ui-specification.md                            # ⚠️ Needs Update
```

---

### B. Stakeholder Communication Plan

**Weekly Status Updates**:
- Email to stakeholders every Friday
- Include completed tasks, blockers, next week's plan
- Demo of working features

**Phase Completion Demos**:
- End of Week 1: Feature removals demo
- End of Week 2: Template infrastructure demo
- End of Week 3: Template library & upload UI demo
- End of Week 4: Complete feature walkthrough

**Feedback Loops**:
- Help content review (Week 4, Day 2)
- Template library UX review (Week 3, Day 3)
- Enhanced upload flow review (Week 4, Day 1)
- Final acceptance testing (Week 4, Day 5)

---

### C. Related Documents

**Sprint Change Proposal** - Full analysis in conversation transcript (2025-11-28)

**Correct Course Task Checklist** - All 6 sections completed:
1. ✅ Understand the Trigger & Context
2. ✅ Epic Impact Assessment
3. ✅ Artifact Conflict & Impact Analysis
4. ✅ Path Forward Evaluation
5. ✅ Sprint Change Proposal
6. ✅ Detailed User Story (1.19.1)

**Cancelled Stories**:
- Story 1.16.6: Suggested Questions Feature (archived)

**Affected Epics**:
- Epic 1.14: Chat Component Reorganization (modifications)
- Epic 1.15: UX/UI Audit (expansion)
- Epic 1.16: User Experience (story cancellation)
- Epic 1.17: Dashboard Enhancements (terminology updates)

---

### D. Template Source Files

**Location**: `D:\ailocal\hhpolicy-ai\docs\HH Data\`

**Available Templates**:
- `HH Policy -Policy Template.docx` (primary template)
- `HH Policy -Policy Template.doc` (legacy format)
- `HH Policy -Policy Template.pdf` (reference)

**Initial Seeding**:
All 9 templates will initially use the same source file. Future updates can provide specialized templates for each type/level combination.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-28 | BMAD PO Agent | Initial creation via Correct Course task |

---

**Document Status**: ✅ APPROVED - Ready for Implementation
**Next Review Date**: End of Week 1 (Quick Wins completion)
**Maintained By**: Product Owner
**Last Updated**: 2025-11-28
