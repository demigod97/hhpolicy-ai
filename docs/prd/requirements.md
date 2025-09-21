# Requirements

## Functional Requirements

### Core Authentication & RBAC

1. FR1: The system shall provide a secure user authentication system (sign-in). ✅ **IMPLEMENTED**
2. FR2: The system shall support three distinct user roles: 'Board', 'Administrator', and 'Executive' in a hierarchical structure. ✅ **IMPLEMENTED**
3. FR3: A super-admin user shall be able to assign and change a user's role. ✅ **IMPLEMENTED**

### Document Management

1. FR4: Administrators shall be able to upload policy documents (e.g., PDF, text). ✅ **IMPLEMENTED** (Available through admin interface)
2. FR5: Administrators shall be able to assign an uploaded document to either the 'Administrator' or 'Executive' role. ✅ **IMPLEMENTED**
3. FR6: Administrators shall be able to re-assign a document's role after it has been uploaded. ✅ **IMPLEMENTED**
4. FR7: The system shall automatically process uploaded documents to extract metadata, including dates, and flag documents older than 18 months. ✅ **IMPLEMENTED** (Visual indicators complete, chat disclaimers pending)

### Chat Interface & AI Functionality

1. FR8: All authenticated users shall be able to ask natural language questions via a chat interface. ✅ **IMPLEMENTED** (Primary interface focus)
2. FR9: The system shall ensure that AI-generated answers are derived *only* from documents accessible to the user's specific role via database-level filtering. ✅ **IMPLEMENTED**
3. FR10: All AI-generated answers shall include verifiable citations pointing to the source document. ✅ **IMPLEMENTED**
4. FR11: Citation links shall provide meaningful feedback to users, including fallback content and explanatory messages when source content is not available due to data changes. ✅ **IMPLEMENTED**

### Interface & Access Control

1. FR12: All features and UI elements related to audio/podcast generation shall be removed from the application. ✅ **IMPLEMENTED**
2. FR13: The system shall provide global document access across all notebooks with role-based filtering enforced at the database level. ✅ **IMPLEMENTED**
3. FR14: Board users shall have access to all documents regardless of target role, Executives shall access Executive and Administrator documents, and Administrators shall access Administrator documents only. ✅ **IMPLEMENTED**

### Chat-First UI Implementation

1. FR15: The primary user interface shall prioritize conversational interactions with a chat-focused dashboard and streamlined notebook/chat management. ✅ **IMPLEMENTED**
2. FR16: Users shall be able to create and manage chat notebooks through dialog-based interfaces with proper title and description management. ✅ **IMPLEMENTED**
3. FR17: The dashboard shall present a clean, conversation-focused interface with "Create New Chat" functionality as the primary call-to-action. ✅ **IMPLEMENTED**
4. FR18: Users shall be able to perform bulk deletion operations on multiple chat notebooks with confirmation dialogs for safe management. ✅ **IMPLEMENTED**
5. FR19: The system shall display global sources count and role-appropriate information to users across the interface. ✅ **IMPLEMENTED**

## Non-Functional

1. NFR1: The system shall be built using the existing InsightsLM technical stack (React, Supabase, N8N).
2. NFR2: All data access must be governed by Supabase Row Level Security (RLS) policies to enforce the RBAC model.
3. NFR3: AI-generated answers for well-formed queries shall be returned to the user in under 30 seconds.
4. NFR4: The system must provide clear feedback to Administrators for file upload failures (e.g., for corrupted or password-protected files).
5. NFR5: The system shall be self-hostable, leveraging Supabase for the backend and a standard provider (e.g., Vercel, Netlify) for the frontend.
