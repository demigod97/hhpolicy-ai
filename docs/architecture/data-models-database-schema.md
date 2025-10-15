# Data Models & Database Schema

The database schema is designed to be version-aware and support RBAC, with tables for `profiles`, `user_roles`, `policy_documents`, `sources`, `notes`, and `documents` for vector embeddings.

## Core Tables

### User Management

#### profiles
- **Purpose**: User profile information linked to Supabase Auth
- **Key Fields**: `id` (UUID), `email`, `full_name`, `avatar_url`
- **Relationships**: Links to `auth.users`

#### user_roles
- **Purpose**: Role-based access control assignments
- **Key Fields**: `user_id`, `role` ('administrator' | 'executive' | 'board')
- **Role Hierarchy**: Board > Administrator > Executive
- **Constraints**: Single role per user, CHECK constraint on role values

### Document Management

#### policy_documents (notebooks)
- **Purpose**: Container for policy document collections
- **Key Fields**: `id`, `user_id`, `title`, `description`, `role_assignment`
- **Role Assignment**: Determines which user roles can access the document collection

#### sources
- **Purpose**: Individual source documents with global accessibility and role-based filtering
- **Key Fields**: 
  - Basic: `id`, `notebook_id`, `title`, `type`, `processing_status`
  - Content: `content`, `summary`, `url`, `file_path`, `file_size`
  - Role-Based Access: `target_role`, `visibility_scope`
  - Policy Metadata: `policyDate`, `policyType`, `policyName` (planned)
- **Visibility Scopes**:
  - `global`: All sources are globally accessible (default)
  - `notebook`: Legacy scope for backward compatibility
- **Global Access Model**: Sources are accessible across all policy documents, filtered by user role and document target_role

#### documents
- **Purpose**: Vector embeddings for RAG (Retrieval Augmented Generation)
- **Key Fields**: `content`, `metadata`, `embedding`, `source_id`
- **Integration**: Links to sources table for document traceability

## Role-Based Access Control (RBAC)

### Role Definitions

| Role | Database Value | Permissions | UI Access |
|------|----------------|-------------|-----------|
| **Board** | `board` | Full system access, user management | All features, admin panel |
| **Administrator** | `administrator` | Policy management, document upload, role assignment | Policy management, document upload |
| **Executive** | `executive` | Document access, chat with policies | Document viewing, chat interface |

### Document Visibility Rules (Global Access Model)

1. **Board Role**: Can view all documents regardless of `target_role` - full system visibility
2. **Executive Role**: Can view Executive + Administrator documents only 
3. **Administrator Role**: Can only view Administrator documents
4. **Unassigned Documents**: Visible to all roles (legacy compatibility)

### Global Source Access Implementation

- **Database Level**: RLS policies enforce role-based filtering at query time
- **Frontend Hook**: `useSources.tsx` queries all sources globally with role-based server filtering
- **UI Components**: Sources grouped by ownership (myUploads/sharedSources) across all notebooks
- **Migration**: Implemented via `20250921000001_implement_global_sources_with_role_filtering.sql`
- **Bug Fix**: Role hierarchy corrected via `20250921000002_fix_role_based_source_access.sql`

### Implementation Details

- **Global Query Pattern**: Sources fetched globally instead of per-notebook
- **Database Filtering**: RLS policies apply role-based filtering server-side
- **UI Grouping**: Sources displayed as "My Uploads" vs "Shared Sources" globally
- **Role Hierarchy**: Strict enforcement prevents administrators seeing executive documents
- **Type Safety**: TypeScript `UserRole` type ensures consistent role handling

## Planned Enhancements

### Policy Metadata Fields (In Progress)
- `policyDate`: Policy effective date (format: "Month-Year" e.g., "August-2024")
- `policyType`: Category of policy document
- `policyName`: Standardized policy name

### Database Migration Status
- ✅ Role-based source sharing columns added
- 🔄 Policy metadata columns (pending migration)
- 🔄 Enhanced RLS policies for role-based access

## Current Limitations

1. **Type System**: Supabase generated types not yet updated for new columns
2. **RLS Policies**: Temporary in-memory filtering due to circular dependencies
3. **Migration**: Policy metadata columns not yet deployed
