# PolicyAi Documentation

Welcome to the PolicyAi documentation! This guide will help you navigate the documentation structure.

**Last Updated**: 2025-10-20

---

## 📁 Documentation Structure

### Core Documentation
- **[current/](current/)** - Current project state, features, and known issues
- **[architecture/](architecture/)** - Technical architecture documentation
- **[prd.md](prd.md)** - Product Requirements Document (future vision)
- **[project_brief.md](project_brief.md)** - Original project brief

### Development Documentation
- **[stories/](stories/)** - User stories organized by status
- **[qa/](qa/)** - QA assessments and test plans
- **[design/](design/)** - Design specifications and mockups
- **[project-management/](project-management/)** - Sprint plans, status updates, archives

### Reference & Guides
- **[reference/](reference/)** - Historical documentation and archived versions
- **[guides/](guides/)** - Setup, deployment, and troubleshooting guides

---

## 🚀 Quick Start

**New to PolicyAi?** Start here:
1. Read [current/features-implemented.md](current/features-implemented.md) - What actually works
2. Read [current/known-issues.md](current/known-issues.md) - Current bugs and limitations
3. Read [guides/setup-guide.md](guides/setup-guide.md) - How to set up the project
4. Read [architecture/index.md](architecture/index.md) - Technical architecture

**Looking for Project Status?**
- [project-management/current-status.md](project-management/current-status.md) - Overall project status
- [current/features-implemented.md](current/features-implemented.md) - Feature completion status

**Need Help?**
- [guides/troubleshooting-guide.md](guides/troubleshooting-guide.md) - Common issues and solutions
- [current/known-issues.md](current/known-issues.md) - Known bugs and workarounds

---

## 📊 Understanding Documentation Status

### Current State (What Exists Now)
Location: `docs/current/`

These documents reflect the **actual current state** of the project:
- `features-implemented.md` - What features actually work
- `known-issues.md` - Bugs and limitations
- `documentation-discrepancy-report.md` - Gaps between docs and reality

**Use these for**: Understanding what the app can do right now

---

### Future Vision (What's Planned)
Location: `docs/prd.md`, `docs/stories/planned/`

These documents describe **future features** not yet implemented:
- Epic 1.7: SaaS Infrastructure (API keys, token tracking)
- Epic 2: AG-UI + CopilotKit integration
- Epic 4: Settings Hub

**Use these for**: Understanding the product roadmap

---

### Historical Reference (Past Context)
Location: `docs/reference/`, `docs/project-management/archived/`

These documents provide **historical context**:
- Original project brief
- Deployment logs
- Implementation summaries

**Use these for**: Understanding project evolution

---

## 📚 Documentation by Audience

### For Developers
1. [architecture/index.md](architecture/index.md) - System architecture
2. [current/features-implemented.md](current/features-implemented.md) - Current features
3. [guides/setup-guide.md](guides/setup-guide.md) - Development setup
4. [stories/](stories/) - User stories and requirements

### For QA Engineers
1. [qa/](qa/) - Test plans and assessments
2. [current/known-issues.md](current/known-issues.md) - Bug tracking
3. [guides/troubleshooting-guide.md](guides/troubleshooting-guide.md) - Testing guides

### For Project Managers
1. [project-management/current-status.md](project-management/current-status.md) - Project status
2. [current/features-implemented.md](current/features-implemented.md) - Feature completion
3. [stories/](stories/) - Story status and backlog
4. [prd.md](prd.md) - Product requirements

### For Stakeholders
1. [current/features-implemented.md](current/features-implemented.md) - What's working
2. [project-management/current-status.md](project-management/current-status.md) - Overall status
3. [project_brief.md](project_brief.md) - Project vision

---

## 🗂️ Directory Organization

```
docs/
├── README.md                           # This file - navigation guide
│
├── current/                            # Current project state
│   ├── features-implemented.md         # What actually works
│   ├── known-issues.md                 # Active bugs
│   └── documentation-discrepancy-report.md
│
├── architecture/                       # Technical architecture
│   ├── index.md                        # Main architecture doc
│   ├── high-level-architecture.md
│   ├── frontend-architecture.md
│   ├── data-models-database-schema.md
│   └── [more architecture docs]
│
├── stories/                            # User stories
│   ├── README.md                       # Story navigation
│   ├── completed/                      # Finished stories
│   ├── in-progress/                    # Active work
│   └── planned/                        # Future stories
│
├── project-management/                 # Project tracking
│   ├── README.md
│   ├── current-status.md               # Overall project status
│   ├── development-status.md
│   └── archived/                       # Historical logs
│       ├── deployments/                # Deployment logs
│       ├── testing/                    # Testing guides
│       └── implementations/            # Implementation summaries
│
├── qa/                                 # QA documentation
│   └── assessments/                    # Test plans
│
├── design/                             # Design specs
│
├── guides/                             # User guides
│   ├── setup-guide.md                  # Development setup
│   ├── deployment-guide.md             # Production deployment
│   └── troubleshooting-guide.md        # Common issues
│
├── reference/                          # Historical docs
│   ├── prd-original-v2.0.md            # Original PRD
│   ├── project-brief-original.md       # Original brief
│   └── architecture-v1-original.md     # Old architecture
│
├── prd.md                              # Product Requirements (future vision)
├── project_brief.md                    # Original project brief
└── PolicyAi UI-UX Specifications.md    # UI/UX specs
```

---

## 🔄 Documentation Maintenance

### When to Update Documentation

**Weekly**:
- Update [project-management/current-status.md](project-management/current-status.md) with progress
- Review and update [current/known-issues.md](current/known-issues.md)

**Per Story Completion**:
- Move story from `in-progress/` to `completed/`
- Update [current/features-implemented.md](current/features-implemented.md)
- Update [project-management/current-status.md](project-management/current-status.md)

**Per Deployment**:
- Create dated summary in `project-management/archived/deployments/`
- Update deployment guide if process changed

**Monthly**:
- Review and prune archived files
- Update roadmap based on completed work
- Verify documentation accuracy

---

## 📝 Contributing to Documentation

### Documentation Standards

**File Naming**:
- Use lowercase with hyphens: `feature-name.md`
- Date-prefix archives: `YYYY-MM-DD-description.md`
- Clear, descriptive names

**Frontmatter**:
```markdown
# Document Title

**Last Updated**: YYYY-MM-DD
**Status**: Draft/Active/Archived
**Author**: Name

---

[Content here]
```

**Cross-References**:
- Use relative links: `[link](../other-doc.md)`
- Always check links work
- Reference by section: `[section](doc.md#section-name)`

---

## 🆘 Getting Help

**Can't find what you need?**
1. Check [current/features-implemented.md](current/features-implemented.md) for feature status
2. Search [current/known-issues.md](current/known-issues.md) for known bugs
3. Review [guides/troubleshooting-guide.md](guides/troubleshooting-guide.md) for solutions

**Documentation unclear or outdated?**
- File an issue or update the doc directly
- All documentation should reflect current reality

---

## 📍 Key Documents Quick Reference

| Document | Purpose | Audience |
|----------|---------|----------|
| [current/features-implemented.md](current/features-implemented.md) | What works now | All |
| [current/known-issues.md](current/known-issues.md) | Active bugs | Dev, QA |
| [project-management/current-status.md](project-management/current-status.md) | Project status | PM, Stakeholders |
| [architecture/index.md](architecture/index.md) | System architecture | Developers |
| [guides/setup-guide.md](guides/setup-guide.md) | Development setup | Developers |
| [prd.md](prd.md) | Product requirements | PM, Dev |
| [stories/](stories/) | User stories | Dev, PM, QA |

---

**Documentation Version**: 2.0 (Post-Cleanup)
**Structure Last Updated**: 2025-10-20
**Maintained By**: Dev Team
