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

---
### Requirements

#### Functional
1.  FR1: The system shall provide a secure user authentication system (sign-in).
2.  FR2: The system shall support two distinct user roles: 'Administrator' and 'Executive'.
3.  FR3: A super-admin user shall be able to assign and change a user's role.
4.  FR4: Administrators shall be able to upload policy documents (e.g., PDF, text).
5.  FR5: Administrators shall be able to assign an uploaded document to either the 'Administrator' or 'Executive' role.
6.  FR6: Administrators shall be able to re-assign a document's role after it has been uploaded.
7.  FR7: The system shall automatically process uploaded documents to extract metadata, including dates, and flag documents older than 18 months.
8.  FR8: All authenticated users shall be able to ask natural language questions via a chat interface.
9.  FR9: The system shall ensure that AI-generated answers are derived *only* from documents accessible to the user's specific role.
10. FR10: All AI-generated answers shall include verifiable citations pointing to the source document.
11. FR11: All features and UI elements related to audio/podcast generation shall be removed from the application.

#### Non-Functional
1.  NFR1: The system shall be built using the existing InsightsLM technical stack (React, Supabase, N8N).
2.  NFR2: All data access must be governed by Supabase Row Level Security (RLS) policies to enforce the RBAC model.
3.  NFR3: AI-generated answers for well-formed queries shall be returned to the user in under 30 seconds.
4.  NFR4: The system must provide clear feedback to Administrators for file upload failures (e.g., for corrupted or password-protected files).
5.  NFR5: The system shall be self-hostable, leveraging Supabase for the backend and a standard provider (e.g., Vercel, Netlify) for the frontend.

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
* An **LLM provider** (e.g., OpenAI, Gemini) is required for the RAG pipeline and will be integrated via N8N.

---
### Epic List

1.  **Epic 1: Core Application & Administrator Experience**
    * **Goal:** Establish the "PolicyAi" application and deliver the complete end-to-end workflow for the **Administrator** role.
2.  **Epic 2: Executive Experience & Advanced RAG Intelligence**
    * **Goal:** Extend the application to the **Executive** role and enhance the RAG pipeline with the advanced metadata extraction features.

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