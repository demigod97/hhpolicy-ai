# User Stories

This directory contains user stories organized by implementation status.

**Last Updated**: 2025-10-20

---

## 📁 Directory Structure

```
stories/
├── README.md           # This file
├── completed/          # Stories that have been implemented and verified
├── in-progress/        # Stories currently being worked on
└── planned/            # Stories in the backlog for future implementation
```

---

## 📂 Story Organization

### completed/
**Status**: ✅ Implemented and verified

Stories that have been fully implemented, tested, and are working in production or development environment.

**Examples**:
- `1.1.project-foundation-rebranding.md`
- `1.2.database-schema-role-setup.md`
- `1.3.administrator-document-upload.md`
- `1.4.basic-rag-ingestion-administrator.md`
- `1.14.1.fix-document-upload-webhook-integration.md`

**Metadata Required**:
- Completion date
- Implementation summary
- Related PRs/commits
- Test results

---

### in-progress/
**Status**: 🔨 Active development

Stories currently being worked on by the development team.

**Limit**: Try to keep this to 1-3 stories max for focus

**Metadata Required**:
- Start date
- Assigned developer/agent
- Blockers (if any)
- Progress percentage

---

### planned/
**Status**: 📋 Future work

Stories in the backlog that are planned for future implementation.

**Examples**:
- Epic 1.7 stories (SaaS Infrastructure)
- Epic 2 stories (AG-UI + CopilotKit)
- Epic 4 stories (Settings Hub)

**Metadata Optional**:
- Priority level
- Dependencies
- Estimated effort

---

## 📝 Story File Format

### File Naming Convention
```
X.Y[.Z].short-description.md
```

**Examples**:
- `1.1.project-foundation-rebranding.md`
- `1.14.1.fix-document-upload-webhook-integration.md`
- `2.1.administrator-executive-policy-assignment.md`

**Where**:
- `X` = Epic number
- `Y` = Story number within epic
- `Z` = Sub-story or bug fix (optional)
- `short-description` = Brief kebab-case description

---

### Story Template

```markdown
# Story X.Y: [Title]

**Epic**: X.Y - [Epic Name]
**Status**: [Draft/In Progress/Complete/Blocked]
**Priority**: [Critical/High/Medium/Low]
**Estimate**: [Hours]
**Assigned**: [Developer/Agent]

---

## Story

As a **[user type]**,
I want **[action]**,
so that **[benefit]**.

## Acceptance Criteria

1. [Testable criterion 1]
2. [Testable criterion 2]
3. [Testable criterion 3]

## Implementation Notes

[Technical details, approach, decisions]

## Testing

[Test plan, scenarios, verification steps]

## Completion Checklist

- [ ] Code implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Deployed to dev/prod
- [ ] Acceptance criteria verified

---

**Completion Date**: [If complete]
**Related PRs**: [Links]
**Related Issues**: [Links]
```

---

## 🔍 Finding Stories

### By Epic
Stories are prefixed with epic numbers:
- `1.X` = Epic 1: Core Application
- `1.5.X` = Epic 1.5: Role Hierarchy
- `1.7.X` = Epic 1.7: SaaS Infrastructure
- `2.X` = Epic 2: AI-Powered Chat
- `3.X` = Epic 3: Enhanced Document Experience
- `4.X` = Epic 4: Settings & Administration

### By Status
Use directory structure:
- Need to see what's done? → `completed/`
- Want to see active work? → `in-progress/`
- Planning next sprint? → `planned/`

### By Search
Use file search in your IDE:
- Search for feature name in story titles
- Search for specific acceptance criteria
- Grep for keywords in story content

---

## 📊 Story Status Overview

### Completed Stories (Epic 1)
- ✅ 1.1: Project Foundation & Rebranding
- ✅ 1.2: Database Schema & Role Setup
- ✅ 1.3: Administrator Document Upload
- ✅ 1.4: Basic RAG Ingestion
- ✅ 1.5: Role-Aware Chat

### In Progress
- 🔨 [Currently active stories listed in in-progress/]

### Planned (Not Started)
- 📋 Epic 1.5: Role Hierarchy (partial - 3 roles not 5)
- 📋 Epic 1.7: SaaS Infrastructure (not started)
- 📋 Epic 2: AG-UI + CopilotKit (not started)
- 📋 Epic 3: Enhanced Document (partial - PDF viewer done)
- 📋 Epic 4: Settings Hub (not started)

**For detailed status**, see [../current/features-implemented.md](../current/features-implemented.md)

---

## 🔄 Story Lifecycle

### 1. Creation (planned/)
- Story written based on PRD requirements
- Acceptance criteria defined
- Estimate provided
- Priority assigned

### 2. Planning (planned/ → in-progress/)
- Story refined and broken down
- Technical approach decided
- Dependencies identified
- Story moved to `in-progress/`

### 3. Development (in-progress/)
- Code implementation
- Tests written
- Documentation updates
- Regular status updates

### 4. Completion (in-progress/ → completed/)
- All acceptance criteria met
- Tests passing
- Code reviewed and merged
- Story moved to `completed/`
- Completion metadata added

---

## ✅ Definition of Done

A story is considered "complete" when:

**Code**:
- [ ] Implementation complete
- [ ] Code reviewed
- [ ] Merged to main branch

**Testing**:
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Manual testing complete
- [ ] All acceptance criteria verified

**Documentation**:
- [ ] Code comments added
- [ ] README updated (if needed)
- [ ] Architecture docs updated (if needed)
- [ ] User guide updated (if needed)

**Deployment**:
- [ ] Deployed to dev environment
- [ ] Deployed to prod (if applicable)
- [ ] Verified in production

**Story Admin**:
- [ ] Completion date added
- [ ] Related PRs/commits linked
- [ ] Story moved to `completed/`
- [ ] Features list updated

---

## 📋 Story Maintenance

### Weekly
- Review `in-progress/` stories for progress
- Update story statuses
- Move completed stories to `completed/`

### Per Sprint
- Move selected stories from `planned/` to `in-progress/`
- Re-prioritize backlog in `planned/`
- Archive very old completed stories (optional)

### Monthly
- Review completed stories for documentation quality
- Update story estimates based on actuals
- Refine planned stories for clarity

---

## 🔗 Related Documentation

- [../current/features-implemented.md](../current/features-implemented.md) - Current feature status
- [../project-management/current-status.md](../project-management/current-status.md) - Overall project status
- [../prd.md](../prd.md) - Product requirements (epic definitions)
- [../qa/assessments/](../qa/assessments/) - QA test plans for stories

---

## 📞 Questions?

**Story unclear?**
- Check related QA assessment in `../qa/assessments/`
- Review PRD for epic context in `../prd.md`
- Check implementation reference in `completed/` for similar stories

**Story blocked?**
- Update story status to "Blocked"
- Document blocker in story file
- Escalate if blocker can't be resolved

---

**Story Structure**: Based on PRD v2.0
**Organization System**: Implemented 2025-10-20 (Project Cleanup Plan Phase 6)
**Maintained By**: Dev Team
