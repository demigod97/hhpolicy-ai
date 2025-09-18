# Agent Handoff Notes - PolicyAi Project

## Project Context for AI Agents

### What This Project Is
PolicyAi is a policy management and AI-powered Q&A system that transforms the existing InsightsLM codebase into a specialized tool for organizational compliance. It provides role-based access to policy documents with intelligent search and Q&A capabilities.

### Current State
- **Repository**: D:\ailocal\hhpolicy-ai
- **Jira Project**: HHR (HH Policy AI) at https://coralshades.atlassian.net
- **Status**: Ready for development - all planning complete
- **Next Action**: Begin development with Story 1.1 (HHR-78)

## Key Information for Agents

### Project Structure
```
hhpolicy-ai/
├── docs/
│   ├── prd.md                          # Product Requirements Document
│   ├── project brief.md                # Project brief and context
│   ├── stories/                        # User stories (BMAD format)
│   ├── HH Data/                        # Policy documents for testing
│   └── project-management/             # Project management docs
├── src/                                # React/TypeScript source code
├── supabase/                           # Database and backend config
├── n8n/                                # Workflow automation
└── .bmad-core/                         # BMAD methodology config
```

### Technical Context
- **Brownfield Project**: Based on existing InsightsLM codebase
- **Tech Stack**: React + Vite + TypeScript + Supabase + N8N
- **Architecture**: Serverless functions with workflow automation
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Deployment**: Self-hostable with Vercel/Netlify frontend

### User Roles
1. **Administrator**: Upload and manage policy documents, get AI answers
2. **Executive**: Access assigned policy documents, get AI answers
3. **Super-Admin**: Manage user roles and system configuration

## Development Guidelines

### Story Implementation Order
**CRITICAL**: Stories must be implemented in sequence due to dependencies:
1. HHR-78 (Foundation) → 2. HHR-79 (Database) → 3. HHR-80 (Upload) → 4. HHR-81 (RAG) → 5. HHR-82 (Chat) → 6. HHR-83 (Executive Assignment) → 7. HHR-84 (Executive Access) → 8. HHR-85 (Date Extraction) → 9. HHR-86 (Outdated Flagging)

### Task Breakdown Pattern
Each story follows this pattern:
- **Frontend Development**: UI components and user interface
- **Backend Development**: APIs, database, and server logic
- **Testing**: Unit, integration, and E2E tests

### Key Files to Understand
- `docs/prd.md`: Complete requirements and acceptance criteria
- `docs/stories/*.md`: Detailed story specifications with technical notes
- `docs/project-management/story-task-breakdown.md`: Complete task breakdowns
- `docs/HH Data/`: Sample policy documents for testing

## Agent Continuity Information

### For Product Owner Agents
- All stories are created in Jira with detailed acceptance criteria
- Task breakdowns are complete and ready for development
- Epic structure follows PRD requirements exactly
- Use `docs/project-management/jira-mapping.md` for current status

### For Developer Agents
- Start with HHR-78 (Project Foundation & Rebranding)
- Follow the task breakdown in `docs/project-management/story-task-breakdown.md`
- Each story has detailed technical notes and file references
- Use existing codebase patterns and maintain consistency

### For QA Agents
- Each story has comprehensive acceptance criteria
- Test scenarios are outlined in task breakdowns
- Focus on security testing for role-based access
- Validate RAG pipeline accuracy and performance

### For Scrum Master Agents
- All stories are properly sized and sequenced
- Dependencies are clearly documented
- Task estimates are provided (111-140 hours total)
- Use Jira for tracking and sprint planning

## Important Notes

### Security Considerations
- **Row Level Security (RLS)**: Critical for role-based document access
- **Role Segregation**: Administrators and Executives must have separate document access
- **Authentication**: Supabase auth with role-based permissions

### Technical Debt
- **Audio Features**: Must be completely removed (from original InsightsLM)
- **Notebook Renaming**: All references to "notebook" must become "policy document"
- **Branding**: Complete rebrand from "InsightsLM" to "PolicyAi"

### Testing Strategy
- **Unit Tests**: Business logic and components
- **Integration Tests**: API and database interactions
- **E2E Tests**: Complete user workflows
- **Security Tests**: Role-based access control validation

## Quick Reference

### Jira Issues
- **Epic 1**: HHR-76 (Core Application & Administrator Experience)
- **Epic 2**: HHR-77 (Executive Experience & Advanced RAG Intelligence)
- **Stories**: HHR-78 through HHR-86
- **Tasks**: HHR-93 through HHR-119

### Key Commands
- **Start Development**: Begin with HHR-78 tasks (HHR-93, HHR-94, HHR-95)
- **Check Status**: Review `docs/project-management/development-status.md`
- **Update Progress**: Use Jira for task tracking and status updates

### Emergency Contacts
- **Jira Instance**: https://coralshades.atlassian.net
- **Project Key**: HHR
- **Documentation**: All in `docs/project-management/`

## Last Updated
2025-01-17 - Initial handoff notes created
