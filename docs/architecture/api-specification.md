# API Specification

The API uses an asynchronous, polling-based pattern for long-running tasks like chat and document ingestion to ensure a responsive UI. It includes endpoints for managing policies, revisions, chat, and user roles with comprehensive role-based access control.

## Authentication & Authorization

All API endpoints require authentication through Supabase Auth. The system uses JWT tokens for stateless authentication with role-based access control.

### Authentication Layer
- **JWT Tokens**: Stateless authentication via Supabase Auth
- **Session Management**: Automatic token refresh and validation
- **User Context**: Automatically available in authenticated requests

### Enhanced Role-Based Authorization (5-Role System)

#### User Roles & Hierarchy
- **system_owner**: Full system control, user limit management, all features
- **company_operator**: User role management, API key configuration, token monitoring
- **board**: Full document access, standard features
- **administrator**: Policy management, document upload, admin document management
- **executive**: Document access, chat interface (role-filtered documents)

#### Enhanced Authorization Matrix

| Endpoint Category | System Owner | Company Operator | Board | Administrator | Executive |
|------------------|--------------|------------------|-------|---------------|-----------|
| **System Configuration** | ✅ Full | ✅ Limited | ❌ None | ❌ None | ❌ None |
| **User Management** | ✅ Full | ✅ User Roles | ❌ None | ❌ None | ❌ None |
| **API Key Management** | ✅ Full | ✅ Full | ❌ None | ❌ None | ❌ None |
| **Token Monitoring** | ✅ Full | ✅ Full | ❌ None | ❌ None | ❌ None |
| **Document Access** | ✅ All | ✅ All | ✅ All | 🔒 Role-filtered | 🔒 Role-filtered |
| **Document Upload** | ✅ All Types | ✅ All Types | ✅ All Types | ✅ Admin Only | ❌ None |
| **Role Assignment** | ✅ All Roles | ✅ All Roles | ❌ None | ✅ Admin/Exec | ❌ None |
| **Chat Interface** | ✅ All Documents | ✅ All Documents | ✅ All Documents | ✅ Assigned Docs | ✅ Assigned Docs |
| **Settings & Limits** | ✅ Full | ✅ User Limits | ❌ None | ❌ None | ❌ None |

### Protected Routes
- All `/api/*` endpoints require valid authentication
- Role-based authorization enforced at application and database levels
- Document access filtered by user role and document `target_role`

## Core Endpoints

### Documents & Sources

#### GET /api/sources
**Description**: Retrieve documents with role-based filtering

**Authorization**: All authenticated users (filtered by role)

**Response**:
```typescript
interface Source {
  id: string;
  title: string;
  file_url: string;
  user_id: string;
  created_at: string;
  target_role?: 'administrator' | 'executive' | 'board';
  policy_date?: string; // Format: "Month-Year" (e.g., "August-2024")
  policy_type?: string; // Document category
  policy_name?: string; // Policy title
}
```

**Filtering Logic**:
- **Board**: Returns all documents
- **Administrator**: Returns documents with `target_role` = 'administrator' or null
- **Executive**: Returns documents with `target_role` in ['executive', 'administrator'] or null

#### POST /api/sources/upload
**Description**: Upload new policy documents

**Authorization**: 
- **Board**: Can upload documents for any role
- **Administrator**: Can upload documents for 'administrator' role only
- **Executive**: Access denied

**Request**:
```typescript
{
  file: File;
  target_role: 'administrator' | 'executive' | 'board';
  policy_date?: string;
  policy_type?: string;
  policy_name?: string;
}
```

### User Management

#### GET /api/users
**Description**: List all users with their roles

**Authorization**: Board users only

#### POST /api/users/{userId}/role
**Description**: Assign role to user

**Authorization**: 
- **Board**: Can assign any role
- **Administrator**: Can assign 'administrator' or 'executive' roles only

**Request**:
```typescript
{
  role: 'administrator' | 'executive' | 'board';
}
```

### Enhanced Chat Interface (AG-UI + CopilotKit)

#### POST /api/chat/stream
**Description**: Send message to AI with streaming response and AG-UI protocol support

**Authorization**: All authenticated users (context filtered by role)

**Request**:
```typescript
{
  message: string;
  notebook_id?: string;
  context_documents?: string[]; // Filtered by user role
  stream: boolean;
  agent_config?: {
    model: string;
    temperature: number;
    max_tokens: number;
  };
}
```

**Response (Streaming)**:
```typescript
// WebSocket or Server-Sent Events
{
  type: "AGENT_MESSAGE" | "TOOL_CALL" | "CITATION" | "FORM_SUBMIT" | "ACTION_CALL";
  content: string;
  sources?: Source[];
  timestamp: string;
}
```

#### POST /api/chat/actions
**Description**: Define available actions for the AI agent

**Authorization**: All authenticated users

**Request**:
```typescript
{
  actions: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
}
```

### User Management (New)

#### GET /api/users
**Description**: List all users with enhanced role management

**Authorization**: System Owner, Company Operator only

**Query Parameters**:
- `role`: Filter by user role
- `limit`: Number of users per page (default: 20)
- `offset`: Pagination offset (default: 0)

**Response**:
```typescript
{
  users: Array<{
    id: string;
    email: string;
    role: string;
    created_at: string;
    last_active: string;
    token_usage: {
      current_month: number;
      limit: number;
    };
  }>;
  total: number;
  pagination: {
    limit: number;
    offset: number;
    has_more: boolean;
  };
}
```

#### PUT /api/users/{id}/role
**Description**: Update user role with enhanced permissions

**Authorization**: 
- **System Owner**: Can assign any role
- **Company Operator**: Can assign all roles except system_owner

**Request**:
```typescript
{
  role: 'system_owner' | 'company_operator' | 'board' | 'administrator' | 'executive';
  reason?: string;
}
```

#### GET /api/users/{id}/usage
**Description**: Get detailed user token usage statistics

**Authorization**: System Owner, Company Operator only

**Response**:
```typescript
{
  user_id: string;
  current_month: {
    tokens_used: number;
    requests_made: number;
    cost: number;
  };
  limits: {
    monthly_tokens: number;
    monthly_requests: number;
  };
  trends: {
    daily_usage: number[];
    weekly_usage: number[];
  };
}
```

### API Key Management (New)

#### GET /api/api-keys
**Description**: Retrieve API keys for the user

**Authorization**: All authenticated users (own keys only)

**Response**:
```typescript
{
  api_keys: Array<{
    id: string;
    name: string;
    key_prefix: string;
    created_at: string;
    last_used?: string;
    is_active: boolean;
  }>;
}
```

#### POST /api/api-keys
**Description**: Create a new API key

**Authorization**: All authenticated users

**Request**:
```typescript
{
  name: string;
  description?: string;
}
```

**Response**:
```typescript
{
  api_key: {
    id: string;
    name: string;
    key: string; // Full key only returned on creation
    created_at: string;
  };
}
```

#### DELETE /api/api-keys/{id}
**Description**: Revoke an API key

**Authorization**: Key owner, System Owner, Company Operator

### System Monitoring (New)

#### GET /api/monitoring/usage
**Description**: Get system-wide token usage statistics

**Authorization**: System Owner, Company Operator only

**Response**:
```typescript
{
  overview: {
    total_tokens_used: number;
    total_cost: number;
    active_users: number;
    requests_today: number;
  };
  by_role: Record<string, {
    tokens: number;
    cost: number;
  }>;
  trends: {
    daily_usage: number[];
    cost_projection: number;
  };
}
```

#### GET /api/monitoring/alerts
**Description**: Get system alerts and warnings

**Authorization**: System Owner, Company Operator only

**Response**:
```typescript
{
  alerts: Array<{
    id: string;
    type: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    created_at: string;
  }>;
}
```

### Settings Management (New)

#### GET /api/settings
**Description**: Retrieve system and user settings

**Authorization**: All authenticated users (filtered by role)

**Response**:
```typescript
{
  system?: {
    max_users: number;
    default_token_limit: number;
    ai_model: string;
    streaming_enabled: boolean;
  };
  user_limits: {
    monthly_tokens: number;
    monthly_requests: number;
  };
}
```

#### PUT /api/settings
**Description**: Update system settings

**Authorization**: System Owner only

**Request**:
```typescript
{
  max_users?: number;
  default_token_limit?: number;
  ai_model?: string;
  streaming_enabled?: boolean;
}
```

## Response Formats

### Success Response
```typescript
{
  success: true;
  data: T;
  message?: string;
}
```

### Error Response
```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Authorization Errors
```typescript
{
  success: false;
  error: {
    code: "UNAUTHORIZED" | "FORBIDDEN" | "ROLE_REQUIRED";
    message: string;
    required_role?: string;
  };
}
```

## Enhanced Rate Limiting (5-Role System)

| Role | Requests/Hour | Token Limit/Month | Special Limits |
|------|---------------|-------------------|----------------|
| **System Owner** | 5,000 | Unlimited | Full system access |
| **Company Operator** | 2,000 | 100,000 | User management access |
| **Board** | 1,000 | 50,000 | Full document access |
| **Administrator** | 500 | 25,000 | Policy management |
| **Executive** | 100 | 10,000 | Document viewing only |

### Token Usage Tracking
- Real-time token consumption monitoring
- Automatic alerts when approaching limits
- Cost projection and budgeting tools
- Per-user and system-wide analytics

## Security Considerations

1. **Input Validation**: All inputs validated and sanitized
2. **SQL Injection Prevention**: Parameterized queries and ORM usage
3. **XSS Protection**: Content sanitization for user-generated content
4. **CORS Configuration**: Restricted to allowed origins
5. **Rate Limiting**: Per-user and per-endpoint limits
6. **Audit Logging**: All role-sensitive operations logged
