# High Level Architecture

* **Technical Summary:** PolicyAi is a comprehensive SaaS application with advanced AI capabilities, built on a serverless architecture leveraging Supabase and integrated AI frameworks. The system features a 5-role hierarchy with in-app AI chat powered by AG-UI Protocol and CopilotKit, comprehensive token usage tracking, API key management, and enhanced document viewing with PDF support. The architecture maintains n8n for file processing while migrating chat functionality to native in-app implementation.
* **Platform:** Supabase (backend) & Vercel/Netlify (frontend).
* **Repository Structure:** Monorepo, to simplify dependency management and ensure consistency.
* **AI Integration:** AG-UI Protocol + CopilotKit for real-time streaming chat with role-based document access.

## High Level Architecture Diagram
```mermaid
graph TD
    subgraph "User's Browser"
        A[React SPA with AG-UI + CopilotKit]
        A1[PDF Viewer - react-pdf]
        A2[Admin Dashboards - Recharts]
        A3[Settings Hub - API Key Management]
    end

    subgraph "Supabase Platform"
        B[Edge Functions API]
        C[Authentication - 5 Roles]
        D[Storage - PDF Files]
        E[Postgres DB with Enhanced RLS]
        F[Vector Store]
        G[Token Usage Tracking]
        H[API Key Management]
        I[Native Chat Sessions]
    end

    subgraph "N8N Cloud (File Processing Only)"
        J[Extract Text Workflow]
        K[Upsert to Vector Store]
        L[Generate Notebook Details]
    end

    subgraph "AI Integration Layer"
        M[AG-UI Protocol Events]
        N[CopilotKit Runtime]
        O[Streaming Chat Interface]
    end

    A -- "Signs In" --> C
    A -- "Uploads PDF" --> D
    A -- "Chat via AG-UI" --> M
    A1 -- "Views PDF" --> D
    A2 -- "Monitors Usage" --> G
    A3 -- "Manages Keys" --> H
    
    D -- "On Upload Trigger" --> J
    M -- "Streams Events" --> N
    N -- "Processes Chat" --> B

    J -- "Extracts Text" --> E
    K -- "Creates Embeddings" --> F
    L -- "Generates Metadata" --> E

    B -- "Queries with Role Filtering" --> F
    B -- "Tracks Token Usage" --> G
    B -- "Validates API Keys" --> H
    B -- "Stores Chat Messages" --> I
    B -- "Streams Response" --> O
    O -- "Real-time Updates" --> A
```

## AI Integration Architecture

### AG-UI + CopilotKit Stack

```mermaid
graph TD
    A[React Frontend] --> B[CopilotKit Provider]
    B --> C[AG-UI Protocol Layer]
    C --> D[Supabase Edge Functions]
    D --> E[Vector Store with RLS]
    D --> F[Chat Sessions Table]
    D --> G[Token Usage Tracking]
    
    H[Token Limit Check] --> D
    I[API Key Management] --> D
```

### Chat Flow (Native Implementation)

Previously handled by n8n webhooks, now integrated in-app:

1. User sends message via CopilotKit UI
2. AG-UI protocol packages message with role context
3. Supabase Edge Function receives request
4. Check user limits (token_usage + user_limits)
5. Query vector store with RLS-filtered access
6. Stream response back through AG-UI
7. Track tokens and update limits
8. Store in chat_sessions/chat_messages

### File Processing (Remains in n8n for v2)

- Extract Text workflow (Mistral OCR)
- Upsert to Vector Store workflow
- Generate Notebook Details workflow
