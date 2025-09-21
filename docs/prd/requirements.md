# Requirements

## Functional Requirements

### Core Authentication & RBAC
1.  FR1: The system shall provide a secure user authentication system (sign-in). ✅ **IMPLEMENTED**
2.  FR2: The system shall support three distinct user roles: 'Board', 'Administrator', and 'Executive' in a hierarchical structure. ✅ **IMPLEMENTED**
3.  FR3: A super-admin user shall be able to assign and change a user's role. ✅ **IMPLEMENTED**

### Document Management
4.  FR4: Administrators shall be able to upload policy documents (e.g., PDF, text). ✅ **IMPLEMENTED** (Available through admin interface)
5.  FR5: Administrators shall be able to assign an uploaded document to either the 'Administrator' or 'Executive' role. ✅ **IMPLEMENTED**
6.  FR6: Administrators shall be able to re-assign a document's role after it has been uploaded. ✅ **IMPLEMENTED**
7.  FR7: The system shall automatically process uploaded documents to extract metadata, including dates, and flag documents older than 18 months. ✅ **IMPLEMENTED**

### Chat Interface & AI Functionality  
8.  FR8: All authenticated users shall be able to ask natural language questions via a chat interface. ✅ **IMPLEMENTED** (Primary interface focus)
9.  FR9: The system shall ensure that AI-generated answers are derived *only* from documents accessible to the user's specific role via database-level filtering. ✅ **IMPLEMENTED**
10. FR10: All AI-generated answers shall include verifiable citations pointing to the source document. ✅ **IMPLEMENTED**

### Interface & Access Control
11. FR11: All features and UI elements related to audio/podcast generation shall be removed from the application. ✅ **IMPLEMENTED**
12. FR12: The system shall provide global document access across all notebooks with role-based filtering enforced at the database level. ✅ **IMPLEMENTED**
13. FR13: Board users shall have access to all documents regardless of target role, Executives shall access Executive and Administrator documents, and Administrators shall access Administrator documents only. ✅ **IMPLEMENTED**

### Chat-First UI Implementation
14. FR14: The primary user interface shall prioritize conversational interactions with a chat-focused dashboard and streamlined notebook/chat management. ✅ **IMPLEMENTED**
15. FR15: Users shall be able to create and manage chat notebooks through dialog-based interfaces with proper title and description management. ✅ **IMPLEMENTED**
16. FR16: The dashboard shall present a clean, conversation-focused interface with "Create New Chat" functionality as the primary call-to-action. ✅ **IMPLEMENTED**

## Non-Functional
1.  NFR1: The system shall be built using the existing InsightsLM technical stack (React, Supabase, N8N).
2.  NFR2: All data access must be governed by Supabase Row Level Security (RLS) policies to enforce the RBAC model.
3.  NFR3: AI-generated answers for well-formed queries shall be returned to the user in under 30 seconds.
4.  NFR4: The system must provide clear feedback to Administrators for file upload failures (e.g., for corrupted or password-protected files).
5.  NFR5: The system shall be self-hostable, leveraging Supabase for the backend and a standard provider (e.g., Vercel, Netlify) for the frontend.
