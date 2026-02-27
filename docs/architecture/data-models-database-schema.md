# Data Models & Database Schema

The database schema is designed to be version-aware and support enhanced 5-role RBAC, with tables for `profiles`, `user_roles`, `policy_documents`, `sources`, `notes`, `documents` for vector embeddings, plus new tables for `api_keys`, `token_usage_tracking`, `user_limits`, and `native_chat_sessions` to support the enhanced SaaS functionality with AG-UI + CopilotKit integration.

## Core Tables

### User Management

#### profiles
- **Purpose**: User profile information linked to Supabase Auth
- **Key Fields**: `id` (UUID), `email`, `full_name`, `avatar_url`
- **Relationships**: Links to `auth.users`

#### user_roles (Enhanced)
- **Purpose**: Enhanced role-based access control assignments with 5-role hierarchy
- **Key Fields**: `user_id`, `role` ('system_owner' | 'company_operator' | 'board' | 'administrator' | 'executive')
- **Role Hierarchy**: System Owner > Company Operator > Board > Administrator > Executive
- **Constraints**: Single role per user, CHECK constraint on role values
- **Enhanced Permissions**: System Owner and Company Operator have user management capabilities

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

### Enhanced SaaS Tables (New)

#### api_keys
- **Purpose**: API key management for external integrations
- **Key Fields**: 
  - `id` (UUID), `user_id`, `name`, `description`
  - `key_hash` (encrypted), `key_prefix` (for display)
  - `created_at`, `last_used_at`, `is_active`
- **Security**: Keys are hashed and encrypted, only prefix shown in UI
- **Access Control**: Users can only manage their own keys (except System Owner/Company Operator)

#### token_usage_tracking
- **Purpose**: Real-time token consumption monitoring and cost tracking
- **Key Fields**:
  - `id` (UUID), `user_id`, `session_id`
  - `tokens_used`, `cost`, `model_used`
  - `request_type` ('chat', 'document_processing', 'api_call')
  - `timestamp`, `metadata`
- **Analytics**: Supports usage trends, cost projections, and per-user monitoring
- **Integration**: Links to user_limits for quota enforcement

#### user_limits
- **Purpose**: Per-user quota and limit management
- **Key Fields**:
  - `user_id`, `monthly_token_limit`, `monthly_request_limit`
  - `current_month_tokens`, `current_month_requests`
  - `cost_limit`, `alert_thresholds`
  - `created_at`, `updated_at`
- **Enforcement**: Real-time quota checking and automatic alerts
- **Management**: System Owner and Company Operator can modify limits

#### native_chat_sessions
- **Purpose**: Enhanced chat session management with AG-UI protocol support
- **Key Fields**:
  - `id` (UUID), `user_id`, `title`, `description`
  - `agent_config` (JSON), `context_documents` (JSON array)
  - `streaming_enabled`, `model_used`
  - `created_at`, `updated_at`, `last_message_at`
- **AG-UI Integration**: Supports agent configuration and context management
- **Enhanced Features**: Streaming support, model selection, document context

## Role-Based Access Control (RBAC)

### Enhanced Role Definitions (5-Role System)

| Role | Database Value | Permissions | UI Access | Special Features |
|------|----------------|-------------|-----------|------------------|
| **System Owner** | `system_owner` | Full system control, user limit management | All features + system config | Unlimited tokens, system settings |
| **Company Operator** | `company_operator` | User role management, API key configuration, token monitoring | User management, settings, dashboards | User management, API key admin |
| **Board** | `board` | Full document access | All documents, standard features | Full document visibility |
| **Administrator** | `administrator` | Policy management, document upload, admin document management | Upload, chat with admin docs | Admin document access |
| **Executive** | `executive` | Document access, chat with policies | Document viewing, chat interface | Role-filtered documents only |

### Enhanced Document Visibility Rules (5-Role System)

1. **System Owner**: Can view all documents regardless of `target_role` - full system visibility
2. **Company Operator**: Can view all documents regardless of `target_role` - full system visibility  
3. **Board Role**: Can view all documents regardless of `target_role` - full system visibility
4. **Administrator Role**: Can only view Administrator documents
5. **Executive Role**: Can view Executive + Administrator documents only 
6. **Unassigned Documents**: Visible to all roles (legacy compatibility)

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

## Enhanced Database Features

### New Database Migrations (Day 1 Deployment)
- ✅ **5-Role System**: Extended user_roles with system_owner and company_operator
- ✅ **API Key Management**: api_keys table with encryption and access control
- ✅ **Token Usage Tracking**: Real-time monitoring with cost analytics
- ✅ **User Limits**: Quota management and enforcement system
- ✅ **Native Chat Sessions**: Enhanced chat with AG-UI protocol support
- ✅ **Enhanced Sources**: PDF storage and metadata for policy documents

### Policy Metadata Fields (Implemented)
- `policyDate`: Policy effective date (format: "Month-Year" e.g., "August-2024")
- `policyType`: Category of policy document
- `policyName`: Standardized policy name
- `file_size`: Document size in bytes
- `page_count`: Number of pages in PDF
- `metadata`: JSON field for additional document information

### Database Migration Status
- ✅ Role-based source sharing columns added
- ✅ Policy metadata columns implemented
- ✅ Enhanced RLS policies for 5-role system
- ✅ API key encryption and security
- ✅ Token usage tracking and analytics
- ✅ User quota management system

## Current Limitations

1. **Type System**: Supabase generated types not yet updated for new columns
2. **RLS Policies**: Temporary in-memory filtering due to circular dependencies
3. **Migration**: Policy metadata columns not yet deployed
