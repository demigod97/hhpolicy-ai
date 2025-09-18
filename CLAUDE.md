Us# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PolicyAi** is an AI-powered policy management and compliance Q&A system being developed from the existing InsightsLM codebase. It transforms organizational policy documents into an intelligent, searchable system with role-based access control and RAG (Retrieval-Augmented Generation) capabilities.

### Key Project Context
- **Transformation Goal**: Convert InsightsLM into PolicyAi with strict role-based access control
- **Primary Users**: Administrators (HR/Legal/Compliance) and Executives (C-Level/VPs)
- **Core Value**: Mitigate compliance risk through verifiable, role-appropriate policy answers
- **Security Model**: Role-Based Access Control (RBAC) enforced at database level via Supabase RLS

## Common Development Commands

### Development
- `npm run dev` - Start development server with Vite
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Lint code with ESLint
- `npm run preview` - Preview production build locally

### BMAD Integration
- `npm run bmad:refresh` - Refresh BMAD method installation
- `npm run bmad:list` - List available BMAD agents
- `npm run bmad:validate` - Validate BMAD configuration

## Architecture Overview

### Technical Stack
- **Frontend**: React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions) + N8N workflows
- **Database**: PostgreSQL with Row Level Security (RLS)
- **AI Integration**: OpenAI/Gemini via N8N workflows
- **State Management**: React Query (@tanstack/react-query)

### Critical Architectural Changes (InsightsLM → PolicyAi)

#### Database Schema Evolution
- `notebooks` table renamed to `policy_documents`
- Added role-based access control with `user_roles` table
- Enhanced metadata extraction for policy dates and compliance tracking
- Strict RLS policies to enforce Administrator vs Executive data segregation

#### Removed Features (From InsightsLM)
- **Audio/Podcast Generation**: All audio-related features, components, and workflows removed
- **Public Sharing**: No external sharing capabilities
- **Multi-tenant Architecture**: Simplified to single-org, role-based model

#### Key Data Models
- **policy_documents**: Main policy entities (formerly notebooks)
- **user_roles**: Role assignments (Administrator/Executive)
- **sources**: Document sources with role assignments
- **documents**: Vector embeddings for RAG
- **n8n_chat_histories**: Role-aware chat history

### Component Architecture

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── chat/              # Chat interface and message rendering
│   ├── dashboard/         # Main dashboard and policy document grid
│   ├── notebook/          # Policy document management (legacy naming)
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks for data fetching
├── contexts/              # React contexts (AuthContext)
├── integrations/supabase/ # Supabase client and types
└── pages/                 # Main application pages
```

## Key Development Patterns

### Role-Based Data Access
All database queries MUST respect role-based access:
```typescript
// Example pattern - always filter by user role
const { data } = useQuery({
  queryKey: ['policy-documents', userRole],
  queryFn: async () => {
    return supabase
      .from('policy_documents')
      .select('*')
      .eq('assigned_role', userRole); // Critical: role-based filtering
  }
});
```

### Security Requirements
- **RLS Enforcement**: All data access controlled by Supabase Row Level Security
- **Role Verification**: Backend workflows must verify user roles before processing
- **Citation Integrity**: All AI responses must include verifiable source citations
- **Data Segregation**: Zero cross-role data leakage between Administrator and Executive users

## Critical Implementation Details

### Terminology Migration
**Legacy (InsightsLM) → New (PolicyAi)**:
- "Notebook" → "Policy Document"
- "Audio Overview" → Removed entirely
- "Sources" → "Policy Sources" (with role assignment)
- Generic document management → Compliance-focused policy management

### Required RAG Enhancements
1. **Metadata Extraction**: Extract policy effective dates, last updated dates
2. **Age Flagging**: Flag documents older than 18 months
3. **Role-Aware Search**: Vector searches filtered by user role
4. **Citation Tracking**: Maintain source document traceability

### N8N Workflow Integration
Key workflows in `n8n/` directory:
- Document processing with metadata extraction
- Role-aware chat functionality
- Callback handling for asynchronous operations
- Policy date extraction and flagging

## Development Guidelines

### Authentication Flow
- Uses Supabase Auth with custom AuthContext
- Protected routes enforce authentication
- Role assignment managed by super-admin users

### Error Handling
- Toast notifications (Sonner) for user feedback
- Graceful handling of role permission errors
- Clear messaging for cross-role access attempts

### Testing Requirements
Per architecture document:
- **Unit Tests**: Business logic and role-based access
- **Integration Tests**: Database RLS policies and N8N workflows
- **E2E Tests**: Critical user flows (upload, role assignment, chat)
- **AI Quality Tests**: Golden dataset for RAG accuracy

## Important Notes

### BMAD Integration
Project uses BMAD methodology with specialized agents:
- Developer, Architect, QA, Product Manager, UX Expert agents
- Agent rules defined in `.cursor/rules/bmad/`

### Environment Dependencies
- Supabase project with proper RLS policies
- N8N instance with PolicyAi-specific workflows
- OpenAI/Gemini API keys for AI functionality
- Proper role-based database setup

### Documentation References
- **Project Brief**: `docs/project brief.md` - Overall vision and requirements
- **PRD**: `docs/prd.md` - Detailed product requirements and user stories
- **Architecture**: `docs/architecure.md` - Technical architecture and patterns
- **UI/UX Spec**: `docs/PolicyAi UI-UX Specifications.md` - Design specifications