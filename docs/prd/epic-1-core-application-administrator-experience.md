# Epic 1: Core Application & Administrator Experience

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
* **I want** the initial database schema with support for user roles and global source access,
* **so that** I can create and manage user accounts with appropriate role-based permissions.

    **Acceptance Criteria:**
    1.  A database migration script updates the schema to include tables for `user_roles` and `policy_documents` (renamed from `notebooks`) with global visibility scope.
    2.  The three-tier role system is implemented: Board (sees all sources), Executive (sees executive and administrator sources), Administrator (sees administrator sources only).
    3.  A mechanism exists (e.g., a script or manual Supabase command) to assign users to Board, Executive, or Administrator roles.
    4.  The RLS policy for sources is updated to support global access with role-based filtering at the database level.

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
* **so that** I receive an answer based *only* on the sources I am authorized to see according to the three-tier role system.

    **Acceptance Criteria:**
    1.  The chat interface successfully sends the user's query and their identity to the backend.
    2.  The N8N chat workflow uses database-level role filtering to only include administrator-level sources in vector store searches.
    3.  A correct, cited answer is returned to the UI from globally available sources filtered by administrator role permissions.
    4.  If no answer is found within their accessible sources, a clear message is displayed.
