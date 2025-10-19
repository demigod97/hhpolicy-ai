# PolicyAi Product Requirements Document (PRD)

### Goals and Background Context

#### Goals
The primary goals for the PolicyAi MVP are to:
* **Mitigate Compliance Risk:** Ensure all AI-generated answers are based exclusively on role-appropriate and up-to-date policy documents, providing verifiable citations for every response.
* **Improve Operational Efficiency:** Create a centralized, intelligent system that reduces the time Administrators spend on manual policy management and answering repetitive questions.
* **Empower Executive Decision-Making:** Provide a self-service tool for Executives to get instant, trustworthy answers to policy questions, reducing internal friction and delays.

#### Background Context
PolicyAi addresses the significant operational inefficiencies and compliance risks organizations face when managing internal policies with generic tools like shared drives. Existing systems lack the specialized search, role-based access control, and intelligent oversight needed in a regulated environment. This PRD outlines the requirements for a Minimum Viable Product (MVP) that solves this problem by providing a secure, self-hosted platform with a purpose-built Retrieval-Augmented Generation (RAG) pipeline. The initial focus is on delivering a robust solution for our two key user roles: Administrators and Executives.

#### Change Log

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-09-17 | 1.0 | Initial PRD draft based on the approved Project Brief. | John (PM) |
| 2025-10-16 | 2.0 | Major update: Added 5-role hierarchy, AG-UI+CopilotKit integration, SaaS infrastructure (API keys, token tracking), n8n chat migration, PDF viewer, enhanced admin features. Sprint Change Proposal implementation. | John (PM) |

---
### Requirements

#### User Personas

**1. Board Member**
- **Role:** Strategic oversight and governance
- **Access Level:** Full visibility across all policy documents
- **Primary Goals:** Monitor compliance landscape, review policy effectiveness
- **Permissions:** Read-only access to all documents, chat access, dashboard visibility

**2. Administrator (Policy Administrator)**
- **Role:** Policy document management
- **Access Level:** Administrator-tier documents
- **Primary Goals:** Upload and manage policy documents, ensure document quality
- **Permissions:** Upload documents, assign roles to documents, manage own document library, chat access

**3. Executive**
- **Role:** Policy consumer and decision-maker
- **Access Level:** Executive-tier documents
- **Primary Goals:** Get quick answers to policy questions, make informed decisions
- **Permissions:** Read-only access to Executive documents, chat access, save favorite queries

**4. Company Operator** _(NEW)_
- **Role:** Operational management and configuration
- **Access Level:** Company-wide user and system management
- **Primary Goals:** Manage company users, configure API keys, monitor token usage, upload documents
- **Permissions:** 
  - Assign user roles (cannot assign System Owner role)
  - Upload and manage documents for all roles
  - Configure company API keys (OpenAI, Gemini, Mistral, Anthropic)
  - View token usage dashboard (company-wide)
  - Manage user limits (basic)
  - Chat access

**5. System Owner** _(NEW)_
- **Role:** Full system administration
- **Access Level:** Complete system control
- **Primary Goals:** System configuration, user limit management, system health monitoring
- **Permissions:**
  - All Company Operator permissions
  - Assign any role including System Owner
  - Configure advanced system settings
  - Manage user token limits and quotas
  - Access system-wide analytics
  - Direct database access (via Supabase)
  - Suspend/activate users
  - Full audit log access

---

#### Functional

1. FR1: The system shall provide a secure user authentication system (sign-in).
2. FR2: The system shall support five distinct user roles: 'Board Member', 'Administrator', 'Executive', 'Company Operator', and 'System Owner'.
3. FR3: A System Owner shall be able to assign and change any user's role, including other System Owners.
4. FR4: A Company Operator shall be able to assign user roles (excluding System Owner role).
5. FR5: Administrators and Company Operators shall be able to upload policy documents (e.g., PDF, text).
6. FR6: Administrators and Company Operators shall be able to assign an uploaded document to any role.
7. FR7: The system shall automatically process uploaded documents to extract metadata, including dates, and flag documents older than 18 months.
8. FR8: All authenticated users shall be able to ask natural language questions via a chat interface.
9. FR9: The system shall ensure that AI-generated answers are derived *only* from documents accessible to the user's specific role.
10. FR10: All AI-generated answers shall include verifiable citations pointing to the source document.
11. FR11: All features and UI elements related to audio/podcast generation shall be removed from the application.
12. FR12: Company Operators and System Owners shall be able to configure API keys for AI providers (OpenAI, Gemini, Mistral, Anthropic) via a secure UI. _(NEW)_
13. FR13: API keys shall be encrypted using AES-256 encryption before storage in the database. _(NEW)_
14. FR14: Company Operators and System Owners shall be able to test configured API keys before saving. _(NEW)_
15. FR15: The system shall track comprehensive token usage including: request type, tokens used (prompt + completion), model used, timestamps, and estimated cost. _(NEW)_
16. FR16: Company Operators shall be able to view token usage dashboard with charts, trends, and cost projections. _(NEW)_
17. FR17: System Owners shall be able to configure per-user token limits (daily and monthly). _(NEW)_
18. FR18: The system shall enforce token limits and prevent requests when limits are exceeded. _(NEW)_
19. FR19: Token usage counters shall automatically reset at midnight UTC (daily) and on the 1st of each month (monthly). _(NEW)_
20. FR20: Company Operators shall be able to view a list of all company users with their roles and usage statistics. _(NEW)_
21. FR21: Company Operators shall be able to assign roles to users via a user management dashboard. _(NEW)_
22. FR22: System Owners shall be able to suspend or activate user accounts. _(NEW)_
23. FR23: The system shall provide an in-app AI chat interface powered by AG-UI Protocol and CopilotKit, replacing the external n8n chat workflow. _(NEW)_
24. FR24: The chat interface shall support real-time streaming responses with typing indicators. _(NEW)_
25. FR25: All chat sessions and messages shall be stored in the database for history and audit purposes. _(NEW)_
26. FR26: Users shall be able to view chat history and mark sessions as favorites. _(NEW)_
27. FR27: The system shall display policy documents as actual PDFs (using react-pdf) instead of markdown. _(NEW)_
28. FR28: The PDF viewer shall support navigation, search, page thumbnails, and citation highlighting. _(NEW)_
29. FR29: The system shall provide dual navigation bars: primary (main sections) and secondary (contextual breadcrumbs). _(NEW)_
30. FR30: The system shall provide a centralized Settings Hub for configuring API keys, viewing token usage, and managing user preferences. _(NEW)_

#### Non-Functional

1. NFR1: The system shall be built using the existing InsightsLM technical stack (React, Supabase, N8N) enhanced with AG-UI Protocol and CopilotKit for in-app AI chat.
2. NFR2: All data access must be governed by Supabase Row Level Security (RLS) policies to enforce the 5-role RBAC model.
3. NFR3: AI-generated answers for well-formed queries shall be returned to the user in under 30 seconds.
4. NFR4: The system must provide clear feedback to Administrators for file upload failures (e.g., for corrupted or password-protected files).
5. NFR5: The system shall be self-hostable, leveraging Supabase for the backend and a standard provider (e.g., Vercel, Netlify) for the frontend.
6. NFR6: API keys shall be encrypted at rest using AES-256 encryption with keys stored in environment variables. _(NEW)_
7. NFR7: The chat interface shall support streaming responses with latency under 2 seconds for first token. _(NEW)_
8. NFR8: Token usage tracking shall have less than 100ms overhead per request. _(NEW)_
9. NFR9: PDF rendering shall support documents up to 100 pages with page load time under 1 second. _(NEW)_
10. NFR10: The system shall handle concurrent users with token limit checks processed in under 50ms. _(NEW)_

---
### User Interface Design Goals

##### Overall UX Vision
The UX vision for PolicyAi is clean, professional, and authoritative. It should feel like a serious, trustworthy tool for compliance and legal professionals. The interface must prioritize clarity, speed, and user confidence. Every interaction should reinforce that the user is getting the right information quickly and securely.

##### Key Interaction Paradigms
* **Conversational Query:** The primary interaction for all users will be a chat-based interface for asking natural language questions.
* **Direct Manipulation:** For Administrators, a simple and clear document management interface (upload, assign role, view list) is required.
* **Minimalism:** The UI should avoid clutter, presenting only the necessary information and actions for the user's current task.

##### Core Screens and Views
* **Sign-in Screen:** Secure user login.
* **Dashboard:** A view listing all "Policy Documents" accessible to the logged-in user.
* **Policy Document View:** The main workspace, containing the source list, the chat/query interface, and the "Saved Policies" (formerly notes) area.
* **User Management (Super-Admin):** A simple interface for the super-admin to manage user roles.

##### Accessibility
* **WCAG AA**

##### Branding
* The application will be rebranded to "PolicyAi". The UI should adopt a clean, corporate, and trustworthy aesthetic. A specific color palette and logo will need to be defined, but the overall tone should be professional and muted.

##### Target Device and Platforms
* **Web Responsive** (Desktop and Mobile browsers)

---
### Technical Assumptions

##### Repository Structure
* **Monorepo**
    * **Rationale:** The "PolicyAi" features, especially the shared security model and data types between the frontend and backend, are tightly coupled. A monorepo simplifies dependency management, ensures consistency, and streamlines the development workflow for the team.

##### Service Architecture
* **Serverless Functions & Workflow Automation**
    * **Rationale:** This approach continues the effective pattern from the original codebase. It leverages the strengths of our chosen stack: Supabase Edge Functions for scalable API endpoints and N8N for the complex RAG and data processing workflows. This reduces the need to build and maintain custom backend server infrastructure.

##### Testing Requirements
* **Full Testing Pyramid (Unit, Integration, and End-to-End)**
    * **Rationale:** Given the critical nature of security and compliance for this tool, a robust testing strategy is non-negotiable. This will include unit tests for business logic (e.g., metadata extraction), integration tests for service interactions (e.g., database RLS policies), and end-to-end (E2E) tests for critical user flows.

##### Additional Technical Assumptions and Requests
* The application will continue to use **Supabase** for its core backend services: Authentication, Postgres Database (with RLS), and Storage.
* The frontend will be a **Single Page Application (SPA)** built with React and Vite.
* An **LLM provider** (e.g., OpenAI, Gemini, Mistral, Anthropic) is required for the RAG pipeline and will be integrated via user-configured API keys stored securely in the database.
* **AG-UI Protocol** will be used as the communication layer for agent-user interaction, providing standardized event-based synchronization. _(NEW)_
* **CopilotKit** will serve as the framework and runtime layer implementing the AG-UI Protocol with ready-made React components and hooks. _(NEW)_
* **AG-UI Event Types**: The system will handle 16 standard event types including RUN_STARTED, TEXT_MESSAGE_CONTENT, TOOL_CALL, STATE_UPDATE, RUN_FINISHED, etc. _(NEW)_
* **n8n Migration Path**: Chat workflows will migrate from external n8n to in-app AG-UI+CopilotKit implementation, while file processing and embedding workflows remain in n8n. _(NEW)_
* **Additional Dependencies**: _(NEW)_
  * `@ag-ui/react` (latest) - AG-UI Protocol React integration
  * `@copilotkit/react-core` (latest) - CopilotKit core functionality
  * `@copilotkit/react-ui` (latest) - Pre-built CopilotKit UI components
  * `react-pdf` (^7.7.0) - PDF document rendering
  * `recharts` (^2.12.7) - Token usage visualization
  * `crypto-js` (^4.2.0) - API key encryption (AES-256)

---
### Epic List

1. **Epic 1: Core Application & Administrator Experience**
   * **Goal:** Establish the "PolicyAi" application and deliver the complete end-to-end workflow for the **Administrator** role.
2. **Epic 1.5: Role Hierarchy & Access Control** _(NEW)_
   * **Goal:** Extend the system to support 5 user roles (Board, Administrator, Executive, Company Operator, System Owner) with comprehensive RBAC enforcement.
3. **Epic 1.7: SaaS Infrastructure** _(NEW)_
   * **Goal:** Implement API key management, token usage tracking, user limits, and monitoring dashboard for SaaS operational capabilities.
4. **Epic 2: AI-Powered Chat Experience** _(MODIFIED from "Executive Experience & Advanced RAG Intelligence")_
   * **Goal:** Migrate chat functionality from external n8n to in-app AG-UI + CopilotKit implementation with real-time streaming and session management for all roles.
5. **Epic 3: Enhanced Document Experience** _(NEW)_
   * **Goal:** Replace markdown viewer with full PDF rendering, implement citation highlighting, and provide enhanced document navigation.
6. **Epic 4: Settings & Administration** _(NEW)_
   * **Goal:** Provide comprehensive settings hub, user management dashboard, and token monitoring interfaces for Company Operators and System Owners.

---
### Epic 1: Core Application & Administrator Experience

**Expanded Epic Goal:** The objective of this epic is to establish a fully functional baseline for the "PolicyAi" application. By the end of this epic, an Administrator will be able to log in, manage a library of their own policies, and use the core AI chat functionality to get answers from those documents, all within the newly rebranded UI. This delivers the complete end-to-end workflow for our primary persona, providing immediate value and a stable platform for future expansion.

---

**Story 1.1: Project Foundation & Rebranding**
* **As a** Project Admin,
* **I want** the initial "PolicyAi" project scaffolded from the existing codebase, with all user-facing branding updated,
* **so that** development can begin on a clean, correctly-named foundation.

    **Acceptance Criteria:**
    1.  The application's title, logos, and prominent UI text are changed from "InsightsLM" to "PolicyAi".
    2.  The concept of a "Notebook" is renamed to "Policy Document" throughout the UI.
    3.  All code, UI elements, and backend workflows related to the audio/podcast feature are removed.

---

**Story 1.2: Initial Database Schema & Role Setup**
* **As a** Super-Admin,
* **I want** the initial database schema with support for user roles,
* **so that** I can create and manage the first Administrator accounts.

    **Acceptance Criteria:**
    1.  A database migration script updates the schema to include tables for `user_roles` and `policy_documents` (renamed from `notebooks`).
    2.  A mechanism exists (e.g., a script or manual Supabase command) to assign a new user the 'Administrator' role.
    3.  The RLS policy for `policy_documents` is updated to ensure users can only see documents they own for now.

---

**Story 1.3: Administrator Document Upload**
* **As an** Administrator,
* **I want** to upload a policy document,
* **so that** it can be stored and processed by the system.

    **Acceptance Criteria:**
    1.  The UI provides an interface for selecting and uploading a file (e.g., PDF, TXT).
    2.  The uploaded file is successfully stored in Supabase Storage.
    3.  A new record is created in the `policy_documents` table, linked to the Administrator's user ID.
    4.  The document's initial processing status is set to 'processing'.

---

**Story 1.4: Basic RAG Ingestion for Administrator Policies**
* **As an** Administrator,
* **I want** my uploaded document to be automatically processed and indexed,
* **so that** its content becomes searchable.

    **Acceptance Criteria:**
    1.  A successful document upload triggers the N8N ingestion workflow.
    2.  The workflow extracts the text from the document.
    3.  The extracted text is chunked and upserted into the Supabase vector store, along with metadata linking it to the correct `policy_document_id`.
    4.  Upon completion, the document's processing status is updated to 'completed'.

---

**Story 1.5: Role-Aware Chat for Administrators**
* **As an** Administrator,
* **I want** to ask a question in the chat interface,
* **so that** I receive an answer based *only* on the documents I am authorized to see.

    **Acceptance Criteria:**
    1.  The chat interface successfully sends the user's query and their identity to the backend.
    2.  The N8N chat workflow filters the vector store search to only include documents belonging to the requesting Administrator.
    3.  A correct, cited answer is returned to the UI.
    4.  If no answer is found within their accessible documents, a clear message is displayed.

---
### Epic 2: Executive Experience & Advanced RAG Intelligence

**Expanded Epic Goal:** The objective of this epic is to extend the PolicyAi application to serve the Executive persona and to introduce the advanced, policy-specific intelligence that forms the product's core value proposition. By the end of this epic, Executives will be able to get answers from their segregated document set, and all users will benefit from the system's ability to identify and flag potentially outdated policies.

---

**Story 2.1: Administrator Assignment of Executive Policies**
* **As an** Administrator,
* **I want** to assign an uploaded policy document to the 'Executive' role,
* **so that** it can be segregated for their exclusive access.

    **Acceptance Criteria:**
    1.  The document management UI allows an Administrator to select the 'Executive' role when uploading or editing a policy document.
    2.  The document's record in the database is correctly associated with the 'Executive' role.
    3.  Once assigned to the 'Executive' role, the document is no longer visible in the Administrator's own dashboard or searchable via their chat interface, confirming the RLS policy is working.

---

**Story 2.2: Executive Document Access & Chat**
* **As an** Executive,
* **I want** to log in and interact with the policy documents assigned to my role,
* **so that** I can get answers to my specific questions.

    **Acceptance Criteria:**
    1.  A user with the 'Executive' role can successfully log in.
    2.  Their dashboard displays *only* the policy documents that have been assigned to the 'Executive' role.
    3.  Their chat queries return answers derived *only* from the 'Executive' policy set.
    4.  An Executive cannot see or query any documents assigned to the 'Administrator' role.

---

**Story 2.3: Advanced RAG - Date Metadata Extraction**
* **As a** System,
* **I want** to enhance the ingestion workflow to identify and extract date metadata from policy documents,
* **so that** the document's age can be tracked for compliance purposes.

    **Acceptance Criteria:**
    1.  The N8N ingestion workflow is updated to include a step that uses an LLM to find and parse date-related information (e.g., "Effective Date", "Last Updated").
    2.  The extracted date, if found, is saved in a dedicated field in the `policy_documents` table.
    3.  If no date can be reliably determined, the date field for that document remains null.
    4.  The process handles common date formats.

---

**Story 2.4: Outdated Policy Flagging**
* **As a** User (Admin or Executive),
* **I want** the system to clearly flag when a policy document is older than 18 months,
* **so that** I am immediately aware of its potential obsolescence.

    **Acceptance Criteria:**
    1.  In the dashboard/document list, a clear visual indicator (e.g., a warning icon) is displayed next to any document whose extracted date is more than 18 months in the past.
    2.  When the chat AI provides an answer sourced from a document older than 18 months, its response **must** include a disclaimer (e.g., "Note: This information is from a policy that is over 18 months old.").
    3.  Documents with no extracted date are not flagged.

---

### Epic 1.5: Role Hierarchy & Access Control _(NEW)_

**Epic Goal:** Extend the authentication and authorization system from 3 roles to 5 roles, implementing comprehensive Row-Level Security (RLS) policies and role-based access controls. This epic establishes the foundation for operational and administrative roles (Company Operator and System Owner) that enable SaaS management capabilities.

**Priority:** CRITICAL - Foundation for all new features  
**Dependencies:** Must complete after Epic 1 (Core Application)  
**Estimated Duration:** 4 stories, Days 1-2 of sprint

---

**Story 1.5.1: Database Schema - Add Company Operator & System Owner Roles**
* **As a** System Owner,
* **I want** the database to support 5 user roles instead of 3,
* **so that** we can assign Company Operator and System Owner roles to users for operational management.

    **Acceptance Criteria:**
    1. Database migration script extends the user_roles constraint from `('board', 'administrator', 'executive')` to include `'company_operator'` and `'system_owner'`.
    2. Role assignment functionality allows assignment of all 5 roles.
    3. Existing users with 3 original roles remain unaffected by the migration.
    4. RLS policies are updated to recognize and enforce permissions for the 2 new roles.

---

**Story 1.5.2: Update RLS Policies for 5-Tier System**
* **As a** System,
* **I want** all database tables to enforce row-level security for the 5-role hierarchy,
* **so that** users can only access data appropriate to their role level.

    **Acceptance Criteria:**
    1. RLS policies on `policy_documents` table allow Company Operators to see all documents for upload/management.
    2. RLS policies on `user_roles` table allow Company Operators to view and modify roles (excluding System Owner role).
    3. RLS policies on new `api_keys`, `token_usage`, `user_limits` tables enforce role-based visibility.
    4. System Owners have full access to all tables via RLS policies.
    5. Board Members retain read-only access to policy documents.
    6. Comprehensive test suite validates RLS policy enforcement for all 5 roles.

---

**Story 1.5.3: Role Assignment UI for Company Operators**
* **As a** Company Operator,
* **I want** a user management interface to assign roles to company users,
* **so that** I can control access levels without requiring System Owner intervention.

    **Acceptance Criteria:**
    1. User Management Dashboard displays list of all company users with their current roles.
    2. Company Operator can assign roles: Board Member, Administrator, Executive, Company Operator (but NOT System Owner).
    3. Role assignment confirmation dialog shows clear description of role permissions before assignment.
    4. Bulk role assignment capability for multiple users at once.
    5. Audit log records all role changes with timestamp and operator information.
    6. System Owners can assign any role including other System Owners.

---

**Story 1.5.4: Role-Based Navigation & Permission Management**
* **As a** User,
* **I want** the UI to adapt based on my assigned role,
* **so that** I only see features and options available to my permission level.

    **Acceptance Criteria:**
    1. Navigation menu dynamically shows/hides sections based on user role.
    2. Company Operators see: User Management, API Keys, Token Dashboard, Document Upload.
    3. System Owners see: All Company Operator features + User Limits Configuration + System Settings.
    4. Board Members see: Dashboard (read-only), Chat interface, Document viewer.
    5. Administrators see: Document Upload, Document Management, Chat interface.
    6. Executives see: Dashboard (read-only), Chat interface, Document viewer.
    7. Unauthorized access attempts to restricted routes redirect to appropriate error page.

---

### Epic 1.7: SaaS Infrastructure _(NEW)_

**Epic Goal:** Implement the core SaaS operational features including secure API key management, comprehensive token usage tracking, user limit enforcement, and monitoring dashboards. This epic enables Company Operators to configure AI provider keys and System Owners to manage user quotas.

**Priority:** HIGH - Core SaaS capabilities  
**Dependencies:** Requires Epic 1.5 (Role Hierarchy) complete  
**Estimated Duration:** 4 stories, Days 1-5 of sprint (parallel with Epic 1.5)

---

**Story 1.7.1: API Key Management System**
* **As a** Company Operator,
* **I want** to securely store and manage API keys for AI providers,
* **so that** our company can use our own API keys instead of relying on system defaults.

    **Acceptance Criteria:**
    1. API Key Manager UI allows adding keys for OpenAI, Gemini, Mistral, and Anthropic providers.
    2. Keys are encrypted using AES-256 before storage in `api_keys` table.
    3. Only key preview (last 4 characters) is displayed in the UI, never the full key.
    4. "Test Key" functionality validates key with provider API before saving.
    5. Users can set one key per provider as "default" for automatic selection.
    6. Key usage count and last used timestamp are tracked automatically.
    7. Company Operators can activate/deactivate keys without deletion.
    8. System Owners can view all company API keys; Company Operators can only manage keys they created.
    9. Encryption key is stored in environment variables, not in database.

---

**Story 1.7.2: Token Usage Tracking System**
* **As a** System,
* **I want** to track comprehensive token usage metrics for all AI interactions,
* **so that** we can monitor costs, enforce limits, and provide usage visibility.

    **Acceptance Criteria:**
    1. `token_usage` table stores: user_id, session_id, request_type, prompt_tokens, completion_tokens, total_tokens, model_used, provider, timestamps, estimated_cost_usd.
    2. Every AI chat request automatically records token usage after completion.
    3. Token counting uses provider-specific tokenizer libraries for accuracy.
    4. Cost estimation uses current pricing for each model (configurable).
    5. Usage records include metadata: request duration, response status, evaluation scores.
    6. Message count and evaluation count tracked separately for detailed analytics.
    7. Token tracking middleware adds less than 100ms overhead per request (NFR8).

---

**Story 1.7.3: User Limits & Quota Management**
* **As a** System Owner,
* **I want** to configure per-user token limits and enforce quota restrictions,
* **so that** we can control costs and prevent runaway AI usage.

    **Acceptance Criteria:**
    1. `user_limits` table stores: daily_token_limit, monthly_token_limit, daily_request_limit, monthly_request_limit, current usage counters, reset timestamps.
    2. Default limits are applied to all new users upon account creation.
    3. System Owner can customize limits for individual users via User Management Dashboard.
    4. Limit check function executes before each AI request (under 50ms - NFR10).
    5. When user reaches limit, clear error message explains limit exceeded and reset time.
    6. Cron job resets daily counters at midnight UTC (NFR9 implementation).
    7. Monthly counters reset on 1st of each month at midnight UTC.
    8. "Unlimited" flag bypasses all limit checks for premium/admin users.
    9. "Suspended" flag prevents all AI requests regardless of usage.

---

**Story 1.7.4: Token Usage Dashboard & Monitoring**
* **As a** Company Operator,
* **I want** a visual dashboard showing token usage trends and costs,
* **so that** I can monitor AI spending and identify high-usage users.

    **Acceptance Criteria:**
    1. Token Usage Dashboard displays: total tokens (daily/monthly), total cost, usage by user, usage by model, trend charts.
    2. Recharts library renders: Line chart (usage over time), Bar chart (usage by user), Pie chart (usage by provider/model).
    3. Date range selector filters data: Today, Last 7 days, Last 30 days, Custom range.
    4. User table shows: username, role, tokens used, requests made, estimated cost, current limit %.
    5. Export to CSV functionality for usage data.
    6. Real-time usage counter updates every 30 seconds via polling.
    7. Alert banner displays when any user exceeds 80% of their limit.
    8. Cost projection widget estimates monthly cost based on current usage trends.

---

### Epic 2: AI-Powered Chat Experience _(MODIFIED)_

**Epic Goal:** Migrate chat functionality from external n8n workflows to in-app implementation using AG-UI Protocol and CopilotKit. Deliver real-time streaming responses, native chat session management, and role-based vector store filtering. This replaces the current webhook-based n8n chat system with a more responsive and tightly integrated solution.

**Priority:** HIGH - User-facing AI features  
**Dependencies:** Requires Epic 1.5 (Role Hierarchy) complete  
**Estimated Duration:** 5 stories, Days 6-7 of sprint

**Architecture Change:** External n8n → In-app AG-UI + CopilotKit

---

**Story 2.1: AG-UI + CopilotKit Integration Foundation**
* **As a** Developer,
* **I want** to integrate AG-UI Protocol and CopilotKit into the application,
* **so that** we can build native in-app AI chat with streaming support.

    **Acceptance Criteria:**
    1. Install dependencies: `@ag-ui/react`, `@copilotkit/react-core`, `@copilotkit/react-ui`.
    2. Configure `CopilotKit` provider at app root with runtime URL `/api/copilot`.
    3. Configure `AgUiProvider` with SSE transport, Supabase auth integration, auto-reconnect.
    4. Create Supabase Edge Function `/api/copilot` to handle AG-UI event streams.
    5. Implement event handlers for: RUN_STARTED, TEXT_MESSAGE_START, TEXT_MESSAGE_CONTENT, TEXT_MESSAGE_END, TOOL_CALL, STATE_UPDATE, RUN_FINISHED.
    6. Test basic message flow: User input → AG-UI event → Backend processing → Streamed response.
    7. Verify streaming latency meets NFR7 (first token under 2 seconds).

---

**Story 2.2: Native Chat Interface with Streaming**
* **As a** User (all roles),
* **I want** to use an in-app chat interface with real-time streaming responses,
* **so that** I can interact with AI without relying on external n8n webhooks.

    **Acceptance Criteria:**
    1. `StreamingChatInterface` component displays chat messages with typing indicators.
    2. `CopilotTextarea` component provides enhanced input with AI assistance.
    3. Messages stream token-by-token as backend generates response (TEXT_MESSAGE_CONTENT events).
    4. `TypingIndicator` shows animated "..." during response generation.
    5. Citations display inline with source document references.
    6. Chat input supports multiline text and keyboard shortcuts (Shift+Enter for newline, Enter to send).
    7. Error handling shows clear messages for failed requests or timeout.
    8. Mobile-responsive design for chat interface.

---

**Story 2.3: Chat Session Management**
* **As a** User,
* **I want** chat conversations organized into sessions with persistent history,
* **so that** I can return to previous conversations and maintain context.

    **Acceptance Criteria:**
    1. `chat_sessions` table stores: user_id, notebook_id (optional), title, agent_state, context_data, message_count, total_tokens_used, timestamps.
    2. `chat_messages` table stores: session_id, role (user/assistant/system/tool), content, citations, token counts, user_rating.
    3. New chat session created automatically on first message or via "New Chat" button.
    4. Session title auto-generated from first user message (first 50 chars).
    5. Chat History Sidebar lists recent sessions with timestamps and message counts.
    6. Clicking session loads all messages in chronological order.
    7. "Favorite" flag allows pinning important sessions.
    8. Delete session functionality with confirmation dialog.
    9. Session context includes selected policy documents for scope filtering.

---

**Story 2.4: Role-Based Vector Store Filtering**
* **As a** User,
* **I want** AI responses filtered to only my role-accessible documents,
* **so that** I never receive information outside my permission level.

    **Acceptance Criteria:**
    1. Query to vector store includes `user_role` parameter from auth context.
    2. RLS policies on `documents` table automatically filter results based on `accessible_by_role` column.
    3. Board Members can search across all documents.
    4. Administrators search only Administrator + Board documents.
    5. Executives search only Executive + Board documents.
    6. Company Operators search across all documents for support purposes.
    7. System Owners search across all documents.
    8. Chat interface displays "Searching X documents accessible to your role" message.
    9. If no relevant documents found for role, clear message: "No policy documents match your query within your access level."

---

**Story 2.5: Advanced Chat Features & Citations**
* **As a** User,
* **I want** enhanced chat features including citation highlighting, source navigation, and conversation rating,
* **so that** I can evaluate answer quality and trace information to source documents.

    **Acceptance Criteria:**
    1. Citations display as inline chips with document name and page/section number.
    2. Clicking citation navigates to PDF Viewer with highlighted section (Epic 3 integration).
    3. Each message has thumbs up/down rating buttons.
    4. User rating stored in `chat_messages.user_rating` column.
    5. "Copy" button copies message content to clipboard.
    6. "Regenerate" button re-sends same query for alternative response.
    7. Tool call display shows when AI retrieves documents or executes functions.
    8. Token usage counter displays at end of each response (e.g., "200 tokens used").
    9. Source documents panel lists all documents referenced in response.
    10. "Was this helpful?" feedback prompt after each answer.

---

### Epic 3: Enhanced Document Experience _(NEW)_

**Epic Goal:** Replace the markdown document viewer with a full-featured PDF viewer using react-pdf. Implement citation highlighting, page navigation, thumbnails, and search functionality. Provide dual navigation system for improved user orientation.

**Priority:** MEDIUM - Document viewing enhancement  
**Dependencies:** Can run parallel with Epic 2  
**Estimated Duration:** 4 stories, Day 8 of sprint

---

**Story 3.1: PDF Document Viewer Implementation**
* **As a** User,
* **I want** to view policy documents as actual PDFs instead of markdown,
* **so that** I can see documents in their original format with proper layout.

    **Acceptance Criteria:**
    1. Install `react-pdf` (^7.7.0) library.
    2. `PdfViewer` component renders PDF from Supabase Storage URL.
    3. Page-by-page rendering with lazy loading for performance (NFR9: <1s per page).
    4. PDF supports documents up to 100 pages (NFR9).
    5. Loading indicators show progress for multi-page documents.
    6. Error handling for corrupted or password-protected PDFs with clear error messages.
    7. Zoom controls: Fit to width, Fit to page, 50%, 75%, 100%, 125%, 150%, 200%.
    8. Text selection enabled for copying content.
    9. Print functionality opens browser print dialog.

---

**Story 3.2: PDF Navigation & Search**
* **As a** User,
* **I want** navigation controls and search functionality for PDF documents,
* **so that** I can quickly find specific information within long policy documents.

    **Acceptance Criteria:**
    1. `PdfNavigationBar` component displays: page number (X of Y), previous page, next page, go to page input.
    2. Keyboard shortcuts: Arrow keys (prev/next page), Home (first page), End (last page).
    3. `PdfThumbnailSidebar` shows miniature page previews for quick navigation.
    4. Clicking thumbnail navigates to that page instantly.
    5. `PdfSearchBar` allows text search within document.
    6. Search highlights all matches on current page with yellow background.
    7. Search navigation: Next match, Previous match, match count display (e.g., "3 of 15").
    8. Search is case-insensitive by default with "Match case" toggle option.
    9. Thumbnail sidebar collapsible for more reading space.

---

**Story 3.3: Citation Highlighting Integration**
* **As a** User,
* **I want** citations from AI chat to highlight the relevant section in the PDF,
* **so that** I can visually verify the source of information.

    **Acceptance Criteria:**
    1. `CitationHighlighter` component highlights text regions in PDF based on citation metadata.
    2. Clicking citation in chat (Story 2.5) opens PDF viewer and scrolls to cited page.
    3. Cited section highlighted with colored overlay (semi-transparent yellow or blue).
    4. Multiple citations on same page shown with different colored overlays.
    5. Highlight persists for 5 seconds then fades or until user interaction.
    6. PDF metadata extraction stores page numbers and text positions for accurate highlighting.
    7. If exact text match not found, highlights nearest matching section with indicator.
    8. "Jump to citation" button in chat message tooltip.

---

**Story 3.4: Dual Navigation System & Document Metadata**
* **As a** User,
* **I want** clear navigation breadcrumbs and document metadata display,
* **so that** I always know my location in the application and document context.

    **Acceptance Criteria:**
    1. `PrimaryNavigationBar` displays main sections: Dashboard, Documents, Chat, Settings, User Profile.
    2. `SecondaryNavigationBar` displays contextual breadcrumbs: e.g., "Documents > HR Policies > Employee Handbook.pdf > Page 15".
    3. Breadcrumb segments are clickable for navigation back to parent sections.
    4. `DocumentMetadataPanel` displays: title, uploaded by, uploaded date, last modified, document age flag (if >18 months).
    5. Quick actions in metadata panel: Download, Share link, View history, Edit permissions.
    6. Document age warning displays prominently if over 18 months old (red banner).
    7. `QuickAccessMenu` provides shortcuts to recent documents, favorite chats, pinned policies.
    8. Notification badge shows unread system messages or policy updates.
    9. User greeting card displays: name, role, token usage (if applicable), quick settings link.

---

### Epic 4: Settings & Administration _(NEW)_

**Epic Goal:** Provide comprehensive settings hub for user configuration, API key management UI, user management dashboard for Company Operators, and token usage monitoring interfaces for operational oversight.

**Priority:** MEDIUM - Admin and configuration interfaces  
**Dependencies:** Requires Epics 1.5 (Roles) and 1.7 (SaaS Infrastructure) complete  
**Estimated Duration:** 4 stories, Days 5, 9-10 of sprint

---

**Story 4.1: Settings Hub & Navigation**
* **As a** User,
* **I want** a centralized settings interface with tab navigation,
* **so that** I can easily find and configure all application settings.

    **Acceptance Criteria:**
    1. `SettingsHub` component provides tab-based navigation: Profile, API Keys, Token Usage, User Management (if authorized), Preferences.
    2. Tab visibility based on user role (e.g., User Management only for Company Operators and System Owners).
    3. Settings accessible via primary navigation "Settings" link and user profile dropdown.
    4. `SettingsLayout` component provides consistent styling across all settings pages.
    5. Breadcrumb shows: Settings > [Current Tab].
    6. Unsaved changes warning when navigating away from modified settings.
    7. "Save" and "Cancel" buttons at bottom of each settings panel.
    8. Toast notifications confirm successful saves or display error messages.

---

**Story 4.2: API Key Configuration Interface**
* **As a** Company Operator,
* **I want** a user-friendly interface to configure and test API keys,
* **so that** I can securely manage company AI provider keys without technical expertise.

    **Acceptance Criteria:**
    1. API Keys settings tab displays list of configured keys: Provider, Key preview (last 4 chars), Status (active/inactive), Last used, Usage count.
    2. "Add API Key" button opens `ApiKeyDialog` modal.
    3. Dialog fields: Provider selection (OpenAI/Gemini/Mistral/Anthropic), API Key input (obscured), Set as default checkbox.
    4. "Test Key" button validates key with provider API before saving (FR14).
    5. Test results display: Success (green checkmark) or Error (specific error message from provider).
    6. `EncryptionIndicator` shows lock icon confirming key will be encrypted (FR13).
    7. Edit key functionality allows updating key or changing default status.
    8. Delete key requires confirmation dialog: "Are you sure? This cannot be undone."
    9. Deactivate/Activate toggle button for temporary disabling without deletion.
    10. System Owners see all company keys; Company Operators see only keys they created (FR12).

---

**Story 4.3: User Management Dashboard**
* **As a** Company Operator,
* **I want** a dashboard to view all users and manage their roles,
* **so that** I can control access levels across the company.

    **Acceptance Criteria:**
    1. `UserManagementDashboard` displays table: Username, Email, Role, Tokens Used (daily/monthly), Last Active, Status (active/suspended).
    2. Search and filter: by role, by status, by name/email.
    3. Sort columns: by name, by tokens used, by last active date.
    4. "Assign Role" action opens `RoleAssignmentDialog`.
    5. Role dropdown in dialog shows all assignable roles based on operator's permissions (Story 1.5.3 rules).
    6. Role assignment displays confirmation with role permission description.
    7. Bulk actions: Select multiple users, assign role to all, export to CSV.
    8. System Owner actions: Suspend user, Activate user, Delete user (confirmation required).
    9. User detail view shows: full profile, token usage history, chat session count, document access list.
    10. "Invite User" button sends email invitation with role pre-assigned.

---

**Story 4.4: Token Usage Monitoring Dashboard**
* **As a** Company Operator,
* **I want** detailed token usage analytics and monitoring,
* **so that** I can track AI costs and optimize usage across the company.

    **Acceptance Criteria:**
    1. Token Usage Dashboard accessible from Settings > Token Usage tab.
    2. Overview cards display: Total tokens (today), Total tokens (month), Total cost (month), Users approaching limits.
    3. `TokenTrendChart` (line chart) shows daily token usage over last 30 days.
    4. `UserUsageTable` lists: User, Role, Daily tokens, Monthly tokens, Limit %, Estimated cost.
    5. Drill-down: Clicking user navigates to detailed usage view with request history.
    6. Usage by model: Pie chart showing token distribution across OpenAI/Gemini/Mistral/Anthropic.
    7. Usage by request type: Bar chart showing tokens for Chat, Evaluation, Document Processing.
    8. Date range selector: Today, Yesterday, Last 7 days, Last 30 days, Custom range.
    9. Export functionality: CSV export of usage data for selected date range.
    10. Real-time updates: Dashboard auto-refreshes every 30 seconds (FR16).
    11. Alert banner: Highlights users over 80% of limit with "Manage Limits" quick action.
    12. `CostProjectionWidget`: Estimates monthly cost based on current usage trend (FR16).