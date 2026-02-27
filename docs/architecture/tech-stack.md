# Tech Stack (Future Vision)

**⚠️ Note**: This document describes **planned** tech stack. See [Current Implementation](#current-implementation-v10-beta) section below for actually installed dependencies.

---

## Planned Tech Stack (Target State)

### Core Stack
| Category | Technology | Version | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| Frontend Language | TypeScript | `~5.5.3` | Type Safety | ✅ Current |
| Frontend Framework| React | `~18.3.1` | UI Framework | ✅ Current |
| UI Component Lib| shadcn/ui | `N/A` | Component Library | ✅ Current |
| State Management| TanStack Query | `~5.56.2` | Server State | ✅ Current |
| Backend Language| TypeScript | `Deno` | Edge Functions | ✅ Current |
| Backend Framework| N8N / Deno | `Cloud` / `~1.4` | File Processing / API | ✅ Current |
| API Style | REST-like | `v1` | API Design | ✅ Current |
| Database | PostgreSQL | `15` | Data Storage | ✅ Current |
| File Storage | Supabase Storage| `Cloud` | File Management | ✅ Current |
| Authentication | Supabase Auth | `Cloud` | User Auth | ✅ Current |
| Frontend Testing| Vitest / RTL | `latest` | Unit Testing | 📋 Planned |
| Backend Testing | Deno Test | `Deno` | API Testing | 📋 Planned |
| E2E Testing | Playwright | `latest` | End-to-End | 📋 Planned |
| Build Tool | Vite | `~5.4.1` | Development & Build | ✅ Current |
| CI/CD | GitHub Actions | `v4` | Deployment | 📋 Planned |
| CSS Framework | Tailwind CSS | `~3.4.11`| Styling | ✅ Current |

---

## AI Framework Stack (Epic 2 - PLANNED)

**Status**: 📋 **NOT IMPLEMENTED** - See Epic 2 in roadmap

These dependencies will replace the current N8N webhook-based chat:

| Category | Technology | Version | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| AI Framework - Protocol | AG-UI Core | `latest` | Event-based agent-UI protocol | 📋 Planned |
| AI Framework - React SDK | @ag-ui/react | `latest` | React bindings for AG-UI | 📋 Planned |
| AI Framework - Runtime | CopilotKit React Core | `^1.10.6` | Core runtime and hooks | 📋 Planned |
| AI Framework - UI | CopilotKit React UI | `^1.10.6` | Pre-built chat components | 📋 Planned |
| AI Framework - Backend | CopilotKit Runtime | `^1.10.6` | Backend runtime for Edge Functions | 📋 Planned |
| AI Framework - Shared | CopilotKit Shared | `^1.10.6` | Shared types and utilities | 📋 Planned |

**Current Alternative**: N8N Cloud workflows for chat (webhook-based)

---

## Enhanced UI & Components

| Category | Technology | Version | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| UI Enhancement | @supabase/ui | `latest` | Supabase Platform Kit components | 📋 Planned |
| PDF Rendering | react-pdf | `^7.7.0` | PDF document viewer | ✅ Current |
| PDF Worker | pdfjs-dist | `^3.11.174` | PDF.js worker for react-pdf | ✅ Current |
| Data Visualization | Recharts | `^2.12.7` | Charts for token usage | 📋 Planned |
| Encryption | crypto-js | `^4.2.0` | AES-256 encryption for API keys | 📋 Planned |
| Type Definitions | @types/crypto-js | `^4.2.1` | TypeScript types for crypto-js | 📋 Planned |

---

## Optional for v2 (Canvas - Multi-Agent Visualization)

**Status**: 📋 **FUTURE CONSIDERATION** - Not in current roadmap

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| Canvas UI | CopilotKit Canvas | `latest` | Multi-agent workflow visualization |
| Flow Diagram | React Flow | `^11.11.0` | Node-based UI for Canvas |

---

## Current Implementation (v1.0-beta)

### Actually Installed Dependencies

**Frontend Core**:
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.5.3",
  "@vitejs/plugin-react-swc": "^3.7.0",
  "vite": "^5.4.1"
}
```

**Supabase Integration**:
```json
{
  "@supabase/supabase-js": "^2.45.0",
  "@supabase/auth-helpers-react": "^0.5.0"
}
```

**State Management**:
```json
{
  "@tanstack/react-query": "^5.56.2",
  "@tanstack/react-query-devtools": "^5.58.0"
}
```

**UI Components**:
```json
{
  "tailwindcss": "^3.4.11",
  "@radix-ui/react-*": "various", // shadcn/ui components
  "lucide-react": "^0.441.0", // Icons
  "sonner": "^1.5.0" // Toast notifications
}
```

**PDF Viewer**:
```json
{
  "react-pdf": "^7.7.0",
  "pdfjs-dist": "^3.11.174"
}
```

**Not Currently Installed** (Planned):
- ❌ `@ag-ui/react`
- ❌ `@copilotkit/react-core`
- ❌ `@copilotkit/react-ui`
- ❌ `recharts`
- ❌ `crypto-js`
- ❌ `vitest`
- ❌ `@testing-library/react`
- ❌ `playwright`

---

## Backend Stack (Current)

### Supabase Services
- **Auth**: Email/password authentication
- **Database**: PostgreSQL 15 with pgvector extension
- **Storage**: File storage for PDFs
- **Edge Functions**: Deno-based serverless functions
- **Realtime**: WebSocket subscriptions

### N8N Cloud
- **Document Processing**: Text extraction, metadata extraction, embeddings
- **Chat Workflow**: Vector search, LLM integration, citation extraction
- **Callbacks**: Database updates after processing

### AI Providers (via N8N)
- **OpenAI**: GPT-4 for chat, embeddings (text-embedding-ada-002)
- **Gemini**: Alternative LLM option (configured in N8N)

---

## Migration Path

### Phase 1: Current (v1.0-beta) ✅
- React + TypeScript + Vite
- Supabase (Auth, DB, Storage, Edge Functions)
- N8N workflows for AI
- Basic PDF viewer (react-pdf)
- 3-role RBAC

### Phase 2: Epic 1.5 (Role Hierarchy) 📋
- No new dependencies
- Database schema changes only
- 5-role RBAC implementation

### Phase 3: Epic 1.7 (SaaS Infrastructure) 📋
**New Dependencies**:
- `crypto-js` (API key encryption)
- `recharts` (token usage visualization)

### Phase 4: Epic 2 (AI-Powered Chat) 📋
**New Dependencies**:
- `@ag-ui/react`
- `@copilotkit/react-core`
- `@copilotkit/react-ui`

**Removed Dependencies**:
- None (N8N remains for file processing)

### Phase 5: Epic 3 (Enhanced PDF) 📋
- Leverage existing `react-pdf`
- No new major dependencies

### Phase 6: Epic 4 (Settings & Admin) 📋
- Leverage existing UI components
- No new major dependencies

---

## Dependency Management

### Adding New Dependencies
1. Check if similar functionality exists in current stack
2. Verify license compatibility (MIT/Apache 2.0 preferred)
3. Review bundle size impact
4. Update this document
5. Update `package.json`
6. Document in architecture files

### Removing Dependencies
1. Verify no code depends on it
2. Update this document
3. Remove from `package.json`
4. Update architecture files

---

## Version Pinning Strategy

- **Exact versions** (`1.2.3`): Critical infrastructure (rare)
- **Caret ranges** (`^1.2.3`): Most dependencies (allows minor/patch updates)
- **Tilde ranges** (`~1.2.3`): Unstable dependencies (patch updates only)
- **`latest`**: Documentation only, not in actual package.json

---

## 🔗 Related Documentation

- **Current Architecture**: [docs/current/current-architecture.md](../current/current-architecture.md)
- **Roadmap**: [docs/current/roadmap.md](../current/roadmap.md)
- **Package.json**: Check root `package.json` for actual installed versions

---

**Document Status**: Updated 2025-10-20 to distinguish planned vs current dependencies
