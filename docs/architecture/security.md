# Security

A multi-layered security architecture is defined with Supabase Auth for authentication and PostgreSQL's Row Level Security (RLS) for fine-grained authorization, ensuring data is protected at the database level.

## Authentication & Authorization

### Authentication Layer
- **Provider**: Supabase Auth
- **Methods**: Email/password authentication
- **Session Management**: JWT tokens with automatic refresh
- **Storage**: Secure token storage in React context

### Role-Based Access Control (RBAC)

#### Role Hierarchy
```
Board (board) > Administrator (administrator) > Executive (executive)
```

#### Permission Matrix

| Resource | Board | Administrator | Executive |
|----------|-------|---------------|-----------|
| **User Management** | ✅ Full | ❌ None | ❌ None |
| **Document Upload** | ✅ All Roles | ✅ Admin Only | ❌ None |
| **Role Assignment** | ✅ All Roles | ✅ Admin/Exec | ❌ None |
| **View All Documents** | ✅ All | ❌ Admin Only | ❌ Exec+Admin |
| **Chat Interface** | ✅ All | ✅ Assigned | ✅ Assigned |
| **Admin Panel** | ✅ Full | ❌ None | ❌ None |

### Document-Level Security (Global Access Model)

#### Visibility Scopes
- **global**: All documents available across notebooks (primary model)
- **role-filtered**: Database-level filtering based on user role and `target_role`
- **legacy**: Backward compatibility for existing notebook-scoped documents

#### Access Rules (Database-Enforced via RLS)
1. **Board Users**: Can access all documents regardless of `target_role` - full system visibility
2. **Executive Users**: Can access documents with `target_role` of 'executive' OR 'administrator' only
3. **Administrator Users**: Can only access documents with `target_role` of 'administrator'
4. **Unassigned Documents**: Accessible to all authenticated users (legacy support)

#### Implementation Details
- **Database-Level Filtering**: RLS policies enforce role-based access at query time
- **Global Source Pattern**: Sources fetched globally with server-side role filtering
- **Migration Implementation**: Applied via `20250921000001` and corrected via `20250921000002`

### Implementation Layers

#### Frontend Security
- **Route Protection**: `AuthGuard` component protects authenticated routes
- **Component-Level**: Role-based conditional rendering
- **Data Filtering**: Client-side filtering based on user role (temporary implementation)
- **Input Validation**: Form validation and sanitization

#### Database Security
- **Row Level Security (RLS)**: Database-level access control policies implemented
- **Role-Based Queries**: Server-side filtering based on user roles via RLS policies
- **Global Source Access**: Database-enforced role filtering for global document access
- **Migration-Based Deployment**: Schema updates via SQL migrations
- **Audit Logging**: Track document access and modifications (planned)
- **Data Encryption**: Sensitive data encrypted at rest (planned)

### Current Security Status

#### ✅ Implemented
- Basic authentication via Supabase Auth
- Role assignment and management
- Frontend role-based access control
- Component-level authorization
- **Database-level RLS policies for global source access**
- **Server-side role-based query filtering**
- **Global document access with role-based restrictions**

#### 🔄 In Progress  
- Bug fix deployment for role hierarchy (migration `20250921000002`)
- Comprehensive audit logging for document access

#### 📋 Planned
- Multi-factor authentication (MFA)
- Session timeout policies
- Advanced audit logging and monitoring
- Data encryption for sensitive policy content
- API rate limiting and DDoS protection

### Security Best Practices

1. **Principle of Least Privilege**: Users only access resources necessary for their role
2. **Defense in Depth**: Multiple security layers (frontend + backend + database)
3. **Zero Trust**: Verify every request regardless of source
4. **Audit Trail**: Log all security-relevant events
5. **Regular Reviews**: Periodic access reviews and role validation
