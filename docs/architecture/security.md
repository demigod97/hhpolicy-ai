# Security

A multi-layered security architecture is defined with Supabase Auth for authentication and PostgreSQL's Row Level Security (RLS) for fine-grained authorization, ensuring data is protected at the database level.

## Authentication & Authorization

### Authentication Layer
- **Provider**: Supabase Auth
- **Methods**: Email/password authentication
- **Session Management**: JWT tokens with automatic refresh
- **Storage**: Secure token storage in React context

### Enhanced Role-Based Access Control (5-Role System)

#### Role Hierarchy
```
System Owner (system_owner) > Company Operator (company_operator) > Board (board) > Administrator (administrator) > Executive (executive)
```

#### Enhanced Permission Matrix

| Resource | System Owner | Company Operator | Board | Administrator | Executive |
|----------|--------------|------------------|-------|---------------|-----------|
| **System Configuration** | ✅ Full | ✅ Limited | ❌ None | ❌ None | ❌ None |
| **User Management** | ✅ Full | ✅ User Roles | ❌ None | ❌ None | ❌ None |
| **API Key Management** | ✅ Full | ✅ Full | ❌ None | ❌ None | ❌ None |
| **Token Monitoring** | ✅ Full | ✅ Full | ❌ None | ❌ None | ❌ None |
| **Document Upload** | ✅ All Roles | ✅ All Roles | ✅ All Roles | ✅ Admin Only | ❌ None |
| **Role Assignment** | ✅ All Roles | ✅ All Roles | ❌ None | ✅ Admin/Exec | ❌ None |
| **View All Documents** | ✅ All | ✅ All | ✅ All | ❌ Admin Only | ❌ Exec+Admin |
| **Chat Interface** | ✅ All | ✅ All | ✅ All | ✅ Assigned | ✅ Assigned |
| **Settings & Limits** | ✅ Full | ✅ User Limits | ❌ None | ❌ None | ❌ None |

### Document-Level Security (Global Access Model)

#### Visibility Scopes
- **global**: All documents available across notebooks (primary model)
- **role-filtered**: Database-level filtering based on user role and `target_role`
- **legacy**: Backward compatibility for existing notebook-scoped documents

#### Enhanced Access Rules (Database-Enforced via RLS)
1. **System Owner**: Can access all documents regardless of `target_role` - full system visibility
2. **Company Operator**: Can access all documents regardless of `target_role` - full system visibility
3. **Board Users**: Can access all documents regardless of `target_role` - full system visibility
4. **Administrator Users**: Can only access documents with `target_role` of 'administrator'
5. **Executive Users**: Can access documents with `target_role` of 'executive' OR 'administrator' only
6. **Unassigned Documents**: Accessible to all authenticated users (legacy support)

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

### Enhanced Security Features (New)

#### API Key Security
- **Encryption**: API keys are hashed and encrypted at rest
- **Access Control**: Users can only manage their own keys (except System Owner/Company Operator)
- **Display Security**: Only key prefixes shown in UI, full keys only on creation
- **Revocation**: Immediate key revocation with audit trail

#### Token Usage Security
- **Real-time Monitoring**: Token consumption tracked and monitored
- **Quota Enforcement**: Automatic limits based on user role and subscription
- **Cost Controls**: Budget limits and alert thresholds
- **Usage Analytics**: Detailed reporting for security and compliance

#### Enhanced User Management Security
- **Role Hierarchy**: Strict 5-role system with clear permission boundaries
- **User Limits**: Per-user quotas and resource restrictions
- **Audit Trail**: All role changes and user management actions logged
- **Access Review**: Regular review of user permissions and access

### Current Security Status

#### ✅ Implemented
- Basic authentication via Supabase Auth
- Enhanced 5-role assignment and management
- Frontend role-based access control with new roles
- Component-level authorization for 40+ new components
- **Database-level RLS policies for global source access**
- **Server-side role-based query filtering**
- **Global document access with role-based restrictions**
- **API key encryption and access control**
- **Token usage tracking and monitoring**
- **User quota management and enforcement**

#### 🔄 In Progress  
- Enhanced audit logging for new features
- API key rotation and management
- Token usage analytics and reporting

#### 📋 Planned
- Multi-factor authentication (MFA)
- Session timeout policies
- Advanced audit logging and monitoring
- Data encryption for sensitive policy content
- API rate limiting and DDoS protection
- **API key rotation policies**
- **Advanced threat detection**
- **Compliance reporting and auditing**

### Security Best Practices

1. **Principle of Least Privilege**: Users only access resources necessary for their role
2. **Defense in Depth**: Multiple security layers (frontend + backend + database)
3. **Zero Trust**: Verify every request regardless of source
4. **Audit Trail**: Log all security-relevant events
5. **Regular Reviews**: Periodic access reviews and role validation
