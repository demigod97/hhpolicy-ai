# PolicyAi Project Cleanup and Documentation Reorganization Plan

**Date**: 2025-10-20
**Status**: Planning Phase
**Priority**: HIGH - Technical Debt Cleanup

---

## Executive Summary

The PolicyAi project has accumulated significant organizational debt during rapid development:
- **55+ markdown files** in root directory (should be ~3)
- **14 SQL files** in root directory (should be 0)
- **Outdated core documentation** (README, PRD, Architecture)
- **Fragmented architecture docs** (architecure.md vs docs/architecture/)
- **Unclear project state** vs original specifications

**Estimated Cleanup Time**: 3-4 hours
**Risk Level**: Low (documentation only, no code changes)
**Impact**: High (improved maintainability, onboarding, clarity)

---

## Current State Analysis

### Root Directory Issues

**Critical Files (KEEP)**:
- ✅ `AGENTS.md` - AI agent configuration
- ✅ `CLAUDE.md` - Claude Code project instructions
- ✅ `README.md` - Project overview (needs updating)
- ✅ `package.json`, `tsconfig.json`, etc. - Project config

**Files to Archive (52 files)**:

**Category 1: Deployment Logs (17 files)**
- `DEPLOY-DAY1-QUICKSTART.md`
- `DAY1-READY.md`
- `DAY1-FINAL-STATUS.md`
- `DEPLOY-DAY1-FIX-SUMMARY.md`
- `FIX-MIGRATION-ISSUES.md`
- `MIGRATION-FIXES-SUMMARY.md`
- `DAY1-DEPLOYMENT-CHECKLIST.md`
- `VERIFICATION-GUIDE.md`
- `VERIFY-INSTRUCTIONS.md`
- `ENABLE-CRON.md`
- `REPAIR-INSTRUCTIONS.md`
- `DEPLOY-COPILOTKIT.md`
- `DEPLOYMENT-READY.md`
- `DEPLOY-MIGRATION-20251019.md`
- `MANUAL-MIGRATION-STEPS.md`
- `DEPLOYMENT-STATUS.md`

**Category 2: Testing Guides (8 files)**
- `TROUBLESHOOTING.md`
- `QUICK-FIX-SUMMARY.md`
- `STEP-BY-STEP-TESTING.md`
- `READY-TO-TEST.md`
- `PHASE-1-TESTING.md`
- `PHASE-2-TESTING-GUIDE.md`
- `TESTING-INSTRUCTIONS.md`

**Category 3: Implementation Summaries (21 files)**
- `COPILOTKIT-IMPLEMENTATION-PLAN.md`
- `CHATAREA-COPILOTKIT-FIX.md`
- `PHASE-2-COMPLETE.md`
- `COPILOTKIT-DEBUGGING-SUMMARY.md`
- `COPILOTKIT-FINAL-STATUS.md`
- `COPILOTKIT-ACTIONS-IMPLEMENTED.md`
- `EPIC-1.14-STORIES-1-3-COMPLETE.md`
- `EPIC-1.14-TESTING-COMPLETE.md`
- `EPIC-1.14-STORY-4-COMPLETE.md`
- `EPIC-1.14-STORIES-1-4-COMPLETE.md`
- `EPIC-1.14-FINAL-IMPLEMENTATION-PLAN.md`
- `EPIC-1.14-COMPLETE.md`
- `PDF-UPLOAD-AND-PROCESSING-IMPLEMENTATION.md`
- `BUGFIX-UPLOAD-AND-PDF-VIEWER.md`
- `IMPLEMENTATION-PLAN-DASHBOARD-ENHANCEMENTS.md`
- `PDF-ACCESS-ISSUE-ANALYSIS.md`
- `COMPLETED-WORK-SUMMARY.md`
- `FINAL-FIX-PLAN.md`
- `SESSION-SUMMARY.md`
- `PDF-ACCESS-ISSUE-RESOLVED.md`
- `PDF-ACCESS-FINAL-FIX.md`
- `PDF-ACCESS-SOLUTION-PUBLIC-BUCKETS.md`
- `CHAT-FIX-AND-NEXT-STEPS.md`
- `CHAT-REORGANIZATION-IMPLEMENTATION.md`
- `FINAL-IMPLEMENTATION-SUMMARY.md`
- `QUICK-TESTING-GUIDE.md`
- `CRITICAL-FIXES-REQUIRED.md`
- `CRITICAL-FIXES-IMPLEMENTED.md`
- `REAL-TIME-FIXES-IMPLEMENTED.md`

**Category 4: Credentials/Config (1 file)**
- `copilot-credentials.md` → Should be in `.gitignore` or deleted

**Category 5: Status Updates (2 files)**
- `WHITE-SCREEN-FIX.md`

**SQL Files in Root (14 files - ALL SHOULD MOVE)**:
- `fix-rls-migration.sql`
- `fix-rls-policy.sql`
- `fix-user-role.sql`
- `day1-migrations-consolidated.sql`
- `DEPLOY-DAY1.sql`
- `DEPLOY-DAY1-FIXED.sql`
- `VERIFY-DAY1-DEPLOYMENT.sql`
- `QUICK-VERIFY.sql`
- `REPAIR-DAY1.sql`
- `ADD-MISSING-FUNCTION.sql`
- `APPLY-MIGRATION-NOW.sql`
- `apply_role_based_sharing.sql`
- `INVESTIGATE-SOURCES-DATA.sql`
- `DIAGNOSE-STORAGE-ISSUE.sql`

---

## Documentation Issues

### 1. Outdated README.md
**Current State**: Still references "InsightsLM" and outdated architecture
**Issues**:
- References removed features (audio/podcast generation)
- Setup instructions for n8n workflows outdated
- No mention of current feature set (PDF viewer, chat sessions, document processing)
- Architecture diagram shows external n8n chat (now in-app)

**Required Updates**:
- Update project description to PolicyAi
- Remove audio/podcast references
- Update architecture diagram
- Add new features: PDF viewer, chat sessions, document upload pipeline
- Update setup instructions for current state

---

### 2. Outdated docs/prd.md
**Current State**: Version 2.0 from 2025-10-16
**Issues**:
- Epic 2 still describes "migrating from n8n to AG-UI+CopilotKit" (THIS WAS NEVER IMPLEMENTED)
- Epic 3 describes "PDF viewer implementation" (ALREADY IMPLEMENTED)
- Epic 4 describes "Settings Hub" (NOT IMPLEMENTED)
- Many stories reference features not yet built
- No reflection of actual current state

**Required Updates**:
- Mark completed epics/stories as DONE
- Update status of in-progress work
- Remove or mark as "future work" unimplemented epics
- Add "Current State" section showing what's actually working

---

### 3. Fragmented Architecture Documentation
**Current State**: Two versions exist
**Issues**:
- `docs/architecure.md` (typo in filename!) - outdated, single file
- `docs/architecture/` - sharded, more current
- Conflicting information between versions

**Required Action**:
- Delete or archive `docs/architecure.md` (typo file)
- Update `docs/architecture/index.md` as canonical source
- Ensure sharded docs reflect current state

---

### 4. Outdated docs/project_brief.md
**Current State**: Original vision from project start
**Issues**:
- Describes MVP that's been exceeded
- Doesn't reflect current 5-role hierarchy
- No mention of implemented features

**Required Updates**:
- Add "Project Evolution" section
- Update "Current State" vs "Original Vision"
- Mark as historical reference

---

## Proposed Directory Structure

```
hhpolicy-ai/
├── AGENTS.md                    # KEEP - AI agent config
├── CLAUDE.md                    # KEEP - Claude Code instructions
├── README.md                    # UPDATE - Modern project overview
├── package.json                 # KEEP
├── tsconfig.json                # KEEP
│
├── docs/
│   ├── README.md                # NEW - Docs navigation guide
│   │
│   ├── project-management/
│   │   ├── README.md
│   │   ├── current-status.md    # NEW - Single source of truth for project state
│   │   ├── development-status.md
│   │   ├── sprint-phasing-plan.md
│   │   └── archived/            # NEW - Old deployment/testing logs
│   │       ├── deployments/
│   │       │   ├── 2025-10-16-day1-deployment.md
│   │       │   ├── 2025-10-17-copilotkit-deployment.md
│   │       │   └── ...
│   │       ├── testing/
│   │       │   ├── phase-1-testing.md
│   │       │   ├── phase-2-testing.md
│   │       │   └── ...
│   │       └── implementations/
│   │           ├── epic-1.14-complete.md
│   │           ├── pdf-upload-implementation.md
│   │           └── ...
│   │
│   ├── architecture/            # KEEP - Current architecture docs
│   │   ├── index.md             # UPDATE - Main architecture overview
│   │   ├── high-level-architecture.md
│   │   ├── frontend-architecture.md
│   │   ├── data-models-database-schema.md
│   │   ├── api-specification.md
│   │   ├── unified-project-structure.md
│   │   ├── testing-strategy.md
│   │   ├── security.md
│   │   └── tech-stack.md
│   │
│   ├── reference/               # NEW - Historical/reference docs
│   │   ├── prd-original.md      # RENAMED from prd.md
│   │   ├── project-brief-original.md
│   │   └── architecure-v1.md    # RENAMED typo file
│   │
│   ├── current/                 # NEW - Current project state
│   │   ├── features-implemented.md  # NEW - What actually works
│   │   ├── known-issues.md          # NEW - Current bugs/limitations
│   │   └── roadmap.md               # NEW - Future work
│   │
│   ├── stories/                 # KEEP - User stories
│   │   ├── README.md
│   │   ├── completed/           # NEW - Move completed stories here
│   │   ├── in-progress/         # NEW - Active stories
│   │   └── planned/             # NEW - Future stories
│   │
│   ├── qa/                      # KEEP - QA assessments
│   ├── design/                  # KEEP - Design docs
│   ├── testing/                 # KEEP - Test documentation
│   │
│   └── guides/                  # NEW - User/dev guides
│       ├── setup-guide.md
│       ├── deployment-guide.md
│       ├── troubleshooting-guide.md
│       └── user-guide.md
│
├── supabase/
│   ├── migrations/              # KEEP - All migrations here
│   └── scripts/                 # NEW - Utility SQL scripts
│       ├── verify/
│       │   ├── VERIFY-DAY1-DEPLOYMENT.sql
│       │   └── QUICK-VERIFY.sql
│       ├── repair/
│       │   ├── fix-rls-migration.sql
│       │   ├── REPAIR-DAY1.sql
│       │   └── ...
│       └── diagnostics/
│           ├── INVESTIGATE-SOURCES-DATA.sql
│           └── DIAGNOSE-STORAGE-ISSUE.sql
│
└── [rest of project structure]
```

---

## Implementation Plan

### Phase 1: Documentation Audit (30 minutes)
**Goal**: Understand current state vs documented state

**Tasks**:
1. ✅ Inventory all root .md files (DONE - 55 files found)
2. ✅ Inventory all root .sql files (DONE - 14 files found)
3. Read current README, PRD, Architecture docs
4. Identify discrepancies between docs and implementation
5. Create "Current State" summary document

**Deliverables**:
- `docs/current/features-implemented.md` - What actually works
- `docs/current/known-issues.md` - Current bugs
- Discrepancy report

---

### Phase 2: Create New Directory Structure (15 minutes)
**Goal**: Set up organized directory structure

**Tasks**:
1. Create new directories:
   ```bash
   mkdir docs/reference
   mkdir docs/current
   mkdir docs/guides
   mkdir docs/project-management/archived
   mkdir docs/project-management/archived/deployments
   mkdir docs/project-management/archived/testing
   mkdir docs/project-management/archived/implementations
   mkdir docs/stories/completed
   mkdir docs/stories/in-progress
   mkdir docs/stories/planned
   mkdir supabase/scripts
   mkdir supabase/scripts/verify
   mkdir supabase/scripts/repair
   mkdir supabase/scripts/diagnostics
   ```

2. Create placeholder README files for navigation

**Deliverables**:
- Organized directory structure
- Navigation README files

---

### Phase 3: Archive Historical Files (45 minutes)
**Goal**: Move deployment logs and implementation summaries to archives

**Tasks**:

**3.1: Archive Deployment Logs**
- Move all `DEPLOY-*.md`, `DAY1-*.md` files to `docs/project-management/archived/deployments/`
- Rename with dates for chronological sorting
- Create index file: `docs/project-management/archived/deployments/README.md`

**3.2: Archive Testing Guides**
- Move all testing-related .md files to `docs/project-management/archived/testing/`
- Create index: `docs/project-management/archived/testing/README.md`

**3.3: Archive Implementation Summaries**
- Move all `EPIC-*.md`, `*-COMPLETE.md`, `*-IMPLEMENTATION.md` to `docs/project-management/archived/implementations/`
- Create index: `docs/project-management/archived/implementations/README.md`

**3.4: Move SQL Files**
- Move verification SQL to `supabase/scripts/verify/`
- Move repair SQL to `supabase/scripts/repair/`
- Move diagnostic SQL to `supabase/scripts/diagnostics/`
- Create README in each folder explaining purpose

**Deliverables**:
- Clean root directory (only 3 .md files: AGENTS, CLAUDE, README)
- Organized archives with indexes

---

### Phase 4: Update Core Documentation (60 minutes)
**Goal**: Make docs reflect current reality

**4.1: Update README.md (20 minutes)**
- Remove InsightsLM references
- Update to PolicyAi branding
- Remove audio/podcast features
- Add current feature list:
  - ✅ Document upload with real-time processing
  - ✅ PDF viewer with citation navigation
  - ✅ Chat interface with streaming
  - ✅ Real-time status updates
  - ✅ Role-based access control
- Update architecture diagram
- Update setup instructions
- Add troubleshooting section

**4.2: Create Current State Documentation (20 minutes)**

File: `docs/current/features-implemented.md`
```markdown
# PolicyAi - Features Implemented

## Core Features (Working)
- Document upload pipeline (PDF)
- N8N processing integration
- Real-time status updates
- PDF viewer
- Chat interface (n8n-based, not CopilotKit)
- Citation display
- Document management

## Features In Progress
- Chat session management improvements
- Document loading optimization

## Features Planned (from PRD but not implemented)
- AG-UI + CopilotKit migration (Epic 2)
- Settings Hub (Epic 4)
- Token usage tracking
- API key management
```

File: `docs/current/known-issues.md`
```markdown
# Known Issues

## Minor Bugs
1. File size displays as "NaN MB" during upload
2. Document list slow to load with 10+ documents
3. Previously uploaded files not visible immediately after upload

## Performance
- Document viewer lag with multiple documents

## Future Enhancements
- Optimize document loading
- Add pagination for document list
```

**4.3: Archive and Update PRD (20 minutes)**
- Copy `docs/prd.md` → `docs/reference/prd-original-v2.0.md`
- Create `docs/current/roadmap.md` extracting unimplemented features
- Add note to original PRD: "ARCHIVED - See docs/current/ for actual state"

**Deliverables**:
- Updated README.md
- Current state documentation
- Archived original PRD

---

### Phase 5: Fix Architecture Documentation (30 minutes)
**Goal**: Single source of truth for architecture

**Tasks**:
1. Delete `docs/architecure.md` (typo file)
2. Update `docs/architecture/index.md`:
   - Add "Last Updated" date
   - Add "Current State" vs "Planned State" sections
   - Update to reflect actual implementation
3. Update `docs/architecture/high-level-architecture.md`:
   - Remove AG-UI/CopilotKit references (not implemented)
   - Show current n8n-based chat architecture
4. Create `docs/reference/architecture-v1-original.md` with original vision

**Deliverables**:
- Single architecture source
- Historical reference preserved

---

### Phase 6: Reorganize User Stories (20 minutes)
**Goal**: Organize stories by status

**Tasks**:
1. Move completed stories to `docs/stories/completed/`:
   - 1.1.project-foundation-rebranding.md
   - 1.2.database-schema-role-setup.md
   - 1.3.administrator-document-upload.md
   - 1.4.basic-rag-ingestion-administrator.md
   - 1.14.1.fix-document-upload-webhook-integration.md (just completed!)

2. Move in-progress stories to `docs/stories/in-progress/`:
   - Any stories currently being worked on

3. Move planned stories to `docs/stories/planned/`:
   - Epic 2 stories (AG-UI/CopilotKit)
   - Epic 4 stories (Settings Hub)

4. Create index README in each folder

**Deliverables**:
- Organized story structure
- Clear visibility of project progress

---

### Phase 7: Create User Guides (30 minutes)
**Goal**: Practical guides for users and developers

**7.1: Setup Guide** (`docs/guides/setup-guide.md`)
- Prerequisites
- Supabase configuration
- N8N workflow setup
- Environment variables
- Initial deployment

**7.2: Deployment Guide** (`docs/guides/deployment-guide.md`)
- Production deployment checklist
- Migration process
- Edge function deployment
- Secrets configuration

**7.3: Troubleshooting Guide** (`docs/guides/troubleshooting-guide.md`)
- Common issues and solutions
- Debugging steps
- Log locations
- Support contacts

**Deliverables**:
- Practical user guides
- Reference for onboarding

---

### Phase 8: Create Project Status Dashboard (15 minutes)
**Goal**: Single source of truth for "What's the current state?"

File: `docs/project-management/current-status.md`

```markdown
# PolicyAi - Current Project Status

**Last Updated**: 2025-10-20
**Version**: v1.0-beta
**Environment**: Development

## Overall Status: ✅ Core Features Working

### Epic Completion Status

| Epic | Status | Completion |
|------|--------|-----------|
| Epic 1: Core Application | ✅ Complete | 100% |
| Epic 1.5: Role Hierarchy | ⏸️ Partial | 60% |
| Epic 1.7: SaaS Infrastructure | ❌ Not Started | 0% |
| Epic 2: AI Chat (AG-UI) | ❌ Not Started | 0% |
| Epic 3: PDF Viewer | ✅ Complete | 100% |
| Epic 4: Settings Hub | ❌ Not Started | 0% |

### Working Features
- ✅ Document upload (PDF)
- ✅ N8N processing pipeline
- ✅ Real-time status updates
- ✅ PDF viewer with navigation
- ✅ Chat interface (n8n-based)
- ✅ Citation display
- ✅ Role-based access control

### Known Issues
- ⚠️ NaN file size display during upload
- ⚠️ Slow document list loading (10+ docs)
- ⚠️ Document visibility delay after upload

### Next Priorities
1. Fix upload UI bugs (NaN display)
2. Optimize document loading performance
3. Complete chat session management
4. Begin Epic 1.7 (API Keys, Token Tracking)
```

**Deliverables**:
- Project status dashboard
- Quick reference for stakeholders

---

## Execution Timeline

**Total Estimated Time**: 3-4 hours

```
Phase 1: Documentation Audit           [30 min]  ████░░░░
Phase 2: Directory Structure            [15 min]  ██░░░░░░
Phase 3: Archive Historical Files       [45 min]  ██████░░
Phase 4: Update Core Documentation      [60 min]  ████████
Phase 5: Fix Architecture Docs          [30 min]  ████░░░░
Phase 6: Reorganize User Stories        [20 min]  ███░░░░░
Phase 7: Create User Guides             [30 min]  ████░░░░
Phase 8: Project Status Dashboard       [15 min]  ██░░░░░░
                                         ─────────
                                         245 min = 4 hours
```

---

## Success Criteria

### Clean Root Directory
- [x] Only 3 .md files in root: AGENTS.md, CLAUDE.md, README.md
- [x] Zero .sql files in root
- [x] All deployment logs archived
- [x] All implementation summaries archived

### Accurate Documentation
- [x] README reflects current features
- [x] Architecture docs show actual implementation (not planned)
- [x] Clear separation of "implemented" vs "planned" features
- [x] Current state documentation exists

### Organized Structure
- [x] Logical directory organization
- [x] README files in each major directory
- [x] Clear navigation between docs
- [x] Chronological archives

### Maintainability
- [x] Single source of truth for project status
- [x] Easy to onboard new developers
- [x] Clear troubleshooting guides
- [x] Historical context preserved

---

## Risks and Mitigation

### Risk 1: Accidentally Deleting Important Information
**Mitigation**: Archive, don't delete. Move files to `archived/` folders.

### Risk 2: Breaking Git History
**Mitigation**: Use `git mv` instead of file system moves to preserve history.

### Risk 3: Confusion During Transition
**Mitigation**: Create clear README files explaining new structure.

### Risk 4: Incomplete Migration
**Mitigation**: Use checklist approach, verify each phase before proceeding.

---

## Post-Cleanup Maintenance

### Weekly
- Update `docs/project-management/current-status.md` with progress
- Update `docs/current/known-issues.md` with new bugs/fixes

### Per Story Completion
- Move story from `in-progress/` to `completed/`
- Update feature list in `docs/current/features-implemented.md`

### Per Deployment
- Create dated summary in `docs/project-management/archived/deployments/`
- Update deployment guide if process changed

### Monthly
- Review and prune archived files
- Update roadmap based on completed work
- Verify documentation accuracy

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Get approval** to proceed with cleanup
3. **Execute Phase 1** (Documentation Audit)
4. **Proceed sequentially** through phases
5. **Verify success criteria** after completion

---

**Ready to begin?** Start with Phase 1: Documentation Audit
