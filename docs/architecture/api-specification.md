# API Specification

The API uses an asynchronous, polling-based pattern for long-running tasks like chat and document ingestion to ensure a responsive UI. It includes endpoints for managing policies, revisions, chat, and user roles with comprehensive role-based access control.

## Authentication & Authorization

All API endpoints require authentication through Supabase Auth. The system uses JWT tokens for stateless authentication with role-based access control.

### Authentication Layer
- **JWT Tokens**: Stateless authentication via Supabase Auth
- **Session Management**: Automatic token refresh and validation
- **User Context**: Automatically available in authenticated requests

### Role-Based Authorization

#### User Roles
- **board**: Full system access, can view all documents and manage users
- **administrator**: Limited admin access, can upload and manage admin documents  
- **executive**: Standard user access, can view executive and admin documents

#### Authorization Matrix

| Endpoint Category | Board | Administrator | Executive |
|------------------|-------|---------------|-----------|
| **User Management** | ✅ Full | ❌ None | ❌ None |
| **Document Access** | ✅ All | 🔒 Role-filtered | 🔒 Role-filtered |
| **Document Upload** | ✅ All Types | ✅ Admin Only | ❌ None |
| **Role Assignment** | ✅ All Roles | ✅ Admin/Exec | ❌ None |
| **Chat Interface** | ✅ All Documents | ✅ Assigned Docs | ✅ Assigned Docs |

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

### Chat Interface

#### POST /api/chat
**Description**: Send message to AI with role-based document context

**Authorization**: All authenticated users (context filtered by role)

**Request**:
```typescript
{
  message: string;
  notebook_id?: string;
  context_documents?: string[]; // Filtered by user role
}
```

**Response**:
```typescript
{
  id: string;
  response: string;
  sources: Source[]; // Only sources user has access to
  timestamp: string;
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

## Rate Limiting

- **Standard Users**: 100 requests per minute
- **Admin Users**: 300 requests per minute  
- **Board Users**: 500 requests per minute

## Security Considerations

1. **Input Validation**: All inputs validated and sanitized
2. **SQL Injection Prevention**: Parameterized queries and ORM usage
3. **XSS Protection**: Content sanitization for user-generated content
4. **CORS Configuration**: Restricted to allowed origins
5. **Rate Limiting**: Per-user and per-endpoint limits
6. **Audit Logging**: All role-sensitive operations logged
