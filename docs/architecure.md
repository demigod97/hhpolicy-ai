# PolicyAi Fullstack Architecture Document

### Introduction

This document outlines the complete fullstack architecture for PolicyAi, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

* **Starter Template:** The project will be built upon the existing "InsightsLM" codebase, treating it as a foundational starter template.

### High Level Architecture

* **Technical Summary:** The architecture for PolicyAi is a serverless, full-stack application leveraging Supabase and N8N. The frontend is a React SPA communicating via Supabase Edge Functions with backend N8N workflows that handle the specialized RAG pipeline. This reuses the "InsightsLM" foundation while extending it with a robust, role-based security model enforced by Postgres Row Level Security.
* **Platform:** Supabase (backend) & Vercel/Netlify (frontend).
* **Repository Structure:** Monorepo, to simplify dependency management and ensure consistency.

#### High Level Architecture Diagram
```mermaid
graph TD
    subgraph "User's Browser"
        A[React SPA on Vercel/Netlify]
    end

    subgraph "Supabase Platform"
        B[Edge Functions API]
        C[Authentication]
        D[Storage]
        E[Postgres DB with RLS]
        F[Vector Store]
    end

    subgraph "N8N Cloud"
        G[RAG Ingestion Workflow]
        H[Chat Workflow]
    end

    A -- "Signs In" --> C
    A -- "Uploads Policy" --> D
    A -- "Asks Question" --> B
    
    D -- "On Upload Trigger" --> G
    B -- "Invokes Chat" --> H

    G -- "Extracts Metadata & Chunks" --> E
    G -- "Creates Embeddings" --> F

    H -- "Queries with User Role" --> F
    H -- "Retrieves Chat History" --> E
    H -- "Returns Cited Answer" --> A
````

### Tech Stack

| Category | Technology | Version |
| :--- | :--- | :--- |
| Frontend Language | TypeScript | `~5.5.3` |
| Frontend Framework| React | `~18.3.1` |
| UI Component Lib| shadcn/ui | `N/A` |
| State Management| TanStack Query | `~5.56.2` |
| Backend Language| TypeScript | `Deno` |
| Backend Framework| N8N / Deno | `Cloud` / `~1.4` |
| API Style | REST-like | `v1` |
| Database | PostgreSQL | `15` |
| File Storage | Supabase Storage| `Cloud` |
| Authentication | Supabase Auth | `Cloud` |
| Frontend Testing| Vitest / RTL | `latest` |
| Backend Testing | Deno Test | `Deno` |
| E2E Testing | Playwright | `latest` |
| Build Tool | Vite | `~5.4.1` |
| CI/CD | GitHub Actions | `v4` |
| CSS Framework | Tailwind CSS | `~3.4.11`|

### Data Models & Database Schema

The database schema is designed to be version-aware and support RBAC, with tables for `profiles`, `user_roles`, `policies`, `policy_revisions`, `sources`, `saved_policies`, and `documents` for vector embeddings. The full SQL DDL is detailed in the previous sections.

### API Specification

The API uses an asynchronous, polling-based pattern for long-running tasks like chat and document ingestion to ensure a responsive UI. It includes endpoints for managing policies, revisions, chat, and user roles.

### Unified Project Structure

The project will use a pragmatic monorepo structure that evolves the existing codebase by adding a `shared` directory for common code like TypeScript types.

```plaintext
policy-ai-app/
├── src/                  # The React SPA frontend (existing)
├── supabase/             # Supabase-specific code (existing)
├── n8n/                  # N8N workflows (existing)
├── shared/               # NEW: For shared code
│   └── src/
│       └── types.ts
├── docs/
└── package.json
```

### Security

A multi-layered security architecture is defined with Supabase Auth for authentication and PostgreSQL's Row Level Security (RLS) for fine-grained authorization, ensuring data is protected at the database level.

### Testing Strategy

A comprehensive, three-layered testing strategy will be implemented:

1.  **Foundational Testing Pyramid:** For all deterministic code.
2.  **Real-Time E2E and AI Behavior Testing:** Using Playwright and AG-UI to test the AI's reasoning process.
3.  **AI Quality Evaluation:** Using a "golden dataset" derived from the sample policy documents to test for regressions.

### Development Workflow

The development workflow is standardized with `npm` as the package manager and clear commands for setup, development, and testing.

-----
