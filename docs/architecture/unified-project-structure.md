# Unified Project Structure

This document defines the comprehensive project structure for PolicyAi, incorporating the enhanced 5-role system, AG-UI + CopilotKit integration, and 40+ new components for the SaaS platform.

## Project Overview

PolicyAi is a comprehensive SaaS application with advanced AI capabilities, built on a serverless architecture leveraging Supabase and integrated AI frameworks. The system features a 5-role hierarchy with in-app AI chat powered by AG-UI Protocol and CopilotKit, replacing external n8n workflows.

## Root Directory Structure

```
hhpolicy-ai/
├── .bmad-core/                    # BMad Method configuration
│   ├── agents/                    # Agent definitions
│   ├── tasks/                     # Task definitions
│   ├── templates/                 # Document templates
│   ├── checklists/                # Quality checklists
│   └── core-config.yaml           # Project configuration
├── docs/                          # Documentation
│   ├── architecture/              # Architecture documents
│   ├── prd/                       # Product requirements
│   ├── stories/                   # User stories
│   ├── qa/                        # Quality assurance
│   └── project-management/        # Project management docs
├── src/                           # Source code
│   ├── components/                # React components (40+ new)
│   ├── hooks/                     # Custom React hooks (14 new)
│   ├── pages/                     # Page components
│   ├── contexts/                  # React contexts
│   ├── services/                  # API services
│   ├── integrations/              # External integrations
│   ├── lib/                       # Utility libraries
│   ├── types/                     # TypeScript type definitions
│   └── utils/                     # Utility functions
├── supabase/                      # Backend configuration
│   ├── functions/                 # Edge functions
│   ├── migrations/                # Database migrations
│   └── config.toml                # Supabase configuration
├── tests/                         # Test files
│   ├── hooks/                     # Hook tests
│   ├── integration/               # Integration tests
│   └── *.test.ts                  # Unit tests
├── public/                        # Static assets
├── dist/                          # Build output
└── package.json                   # Dependencies and scripts
```

## Enhanced Source Code Structure

### Components Directory (40+ New Components)

```
src/components/
├── auth/                          # Authentication components
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── AuthGuard.tsx
├── dashboard/                     # Dashboard components
│   ├── EmptyDashboard.tsx
│   ├── NotebookCard.tsx
│   ├── NotebookGrid.tsx
│   └── NotebookTitleEditor.tsx
├── chat/                          # AG-UI + CopilotKit chat interface
│   ├── AgUiChatProvider.tsx           # AG-UI protocol context
│   ├── CopilotKitProvider.tsx         # CopilotKit runtime wrapper
│   ├── StreamingChatInterface.tsx     # Main chat UI with streaming
│   ├── MessageBubble.tsx              # Individual message display
│   ├── CitationInline.tsx             # In-message citations
│   ├── ChatInputBar.tsx               # Enhanced input with CopilotTextarea
│   ├── TypingIndicator.tsx            # Real-time streaming indicator
│   ├── ChatHistorySidebar.tsx         # Previous chat sessions
│   ├── ContextDocumentsList.tsx       # Active documents in context
│   ├── CopilotSidebarWrapper.tsx      # CopilotKit sidebar component
│   ├── CopilotActionsPanel.tsx        # Available actions display
│   ├── AgentStateIndicator.tsx        # Current agent state visualization
│   ├── ToolCallDisplay.tsx            # Show tool execution (TOOL_CALL events)
│   ├── FormSubmitHandler.tsx          # Handle FORM_SUBMIT events
│   ├── ActionCallButton.tsx           # Trigger ACTION_CALL events
│   └── StreamingProgressBar.tsx       # Visual progress during streaming
├── admin/                         # Administration & User Management
│   ├── UserManagementDashboard.tsx    # Main admin interface
│   ├── UserTable.tsx                  # Sortable user list
│   ├── RoleAssignmentDialog.tsx       # Role management
│   ├── UserLimitEditor.tsx            # Quota configuration
│   └── BulkActionBar.tsx              # Multi-select operations
├── settings/                      # Settings & Configuration
│   ├── SettingsHub.tsx                # Main settings interface
│   ├── ApiKeyManager.tsx              # Key CRUD operations
│   ├── ApiKeyDialog.tsx               # Add/edit modal
│   ├── KeyTestInterface.tsx           # Test API keys
│   └── EncryptionIndicator.tsx        # Security status display
├── monitoring/                    # Token Usage & Analytics
│   ├── TokenUsageDashboard.tsx        # Main monitoring interface
│   ├── UsageOverviewCard.tsx          # Statistics cards
│   ├── UserUsageTable.tsx             # Per-user breakdown
│   ├── TokenTrendChart.tsx            # Recharts visualization
│   ├── UsageAlertBanner.tsx           # Limit warnings
│   └── CostProjectionWidget.tsx       # Cost estimates
├── document/                      # PDF Document Viewing
│   ├── PdfViewer.tsx                  # react-pdf wrapper
│   ├── PdfNavigationBar.tsx           # Page controls
│   ├── PdfThumbnailSidebar.tsx        # Thumbnail navigation
│   ├── PdfSearchBar.tsx               # Search within PDF
│   ├── CitationHighlighter.tsx        # Highlight cited text
│   └── DocumentMetadataPanel.tsx      # Policy information
├── navigation/                    # Enhanced Navigation
│   ├── PrimaryNavigationBar.tsx       # Top navigation bar
│   ├── SecondaryNavigationBar.tsx     # Context navigation
│   ├── NavigationBreadcrumb.tsx       # Location breadcrumbs
│   ├── QuickAccessMenu.tsx            # Shortcut menu
│   └── NotificationBadge.tsx          # Alert indicators
├── notebook/                      # Chat notebook management
│   ├── NotebookList.tsx
│   ├── NotebookViewer.tsx
│   ├── SourcesSidebar.tsx
│   └── SourceItem.tsx
└── ui/                            # Reusable UI components
    ├── Button.tsx
    ├── Input.tsx
    ├── Card.tsx
    ├── Dialog.tsx
    └── UserGreetingCard.tsx
```

### Hooks Directory (14 New Hooks)

```
src/hooks/
├── useTokenUsage.tsx                        # Token tracking
├── useApiKeys.tsx                           # Key management
├── useUserLimits.tsx                        # Quota checks
├── useAgUiChat.tsx                          # AG-UI protocol integration
├── useCopilotKit.tsx                        # CopilotKit integration
├── useCopilotAction.tsx                     # Define agent actions
├── useCopilotReadable.tsx                   # Expose context to AI
├── useUserManagement.tsx                    # User operations
├── usePdfViewer.tsx                         # PDF operations
├── useRolePermissions.tsx                   # Permission checks
├── useTokenMonitoring.tsx                   # Real-time monitoring
├── useAgUiEvents.tsx                        # Subscribe to AG-UI events
├── useCopilotContext.tsx                    # Access CopilotKit context
└── useStreamingResponse.tsx                 # Handle streaming messages
```

### Pages Directory

```
src/pages/
├── Dashboard.tsx                 # Main dashboard
├── Chat.tsx                      # Chat interface
├── Admin.tsx                     # Admin dashboard
├── Settings.tsx                  # Settings page
└── Documents.tsx                 # Document management
```

### Services Directory

```
src/services/
├── api.ts                        # API client
├── auth.ts                       # Authentication service
├── chat.ts                       # Chat service
├── documents.ts                  # Document service
├── users.ts                      # User management service
├── monitoring.ts                 # Token usage service
└── settings.ts                   # Settings service
```

### Integrations Directory

```
src/integrations/
├── supabase/                     # Supabase integration
│   ├── client.ts
│   └── types.ts
├── ag-ui/                        # AG-UI protocol integration
│   ├── protocol.ts
│   └── events.ts
└── copilotkit/                   # CopilotKit integration
    ├── runtime.ts
    └── actions.ts
```

## Database Structure

### Core Tables

```
supabase/migrations/
├── 20250921000001_implement_global_sources_with_role_filtering.sql
├── 20250921000002_fix_role_based_source_access.sql
├── 20251016145126_extend_user_roles_for_operators.sql
├── 20251016145127_create_api_keys_table.sql
├── 20251016145128_create_token_usage_tracking.sql
├── 20251016145129_create_user_limits_table.sql
├── 20251016145130_create_native_chat_sessions.sql
└── 20251016145131_enhance_sources_for_pdf_storage.sql
```

### New Tables

- **api_keys**: API key management with encryption
- **token_usage_tracking**: Real-time token monitoring
- **user_limits**: Per-user quota management
- **native_chat_sessions**: Enhanced chat with AG-UI support

## Configuration Files

### Package Dependencies

```json
{
  "dependencies": {
    "@ag-ui/protocol": "^1.0.0",
    "@copilotkit/react": "^1.0.0",
    "@copilotkit/react-ui": "^1.0.0",
    "react-pdf": "^7.0.0",
    "recharts": "^2.8.0",
    "react-hook-form": "^7.45.0",
    "zod": "^3.22.0"
  }
}
```

### TypeScript Configuration

```
tsconfig.json                    # Main TypeScript config
tsconfig.app.json                # App-specific config
tsconfig.node.json               # Node.js config
```

### Build Configuration

```
vite.config.ts                   # Vite build configuration
tailwind.config.ts               # Tailwind CSS configuration
postcss.config.js                # PostCSS configuration
eslint.config.js                 # ESLint configuration
vitest.config.ts                 # Vitest test configuration
```

## Testing Structure

```
tests/
├── hooks/                        # Hook tests
│   ├── useTokenUsage.test.ts
│   └── useApiKeys.test.ts
├── integration/                  # Integration tests
│   └── role-assignment-integration.test.ts
├── role-assignment.test.ts       # Role assignment tests
├── role-based-chat-security.test.ts # Chat security tests
└── role-security-unit.test.ts   # Security unit tests
```

## Documentation Structure

```
docs/
├── architecture/                 # Architecture documents
│   ├── high-level-architecture.md
│   ├── tech-stack.md
│   ├── frontend-architecture.md
│   ├── api-specification.md
│   ├── data-models-database-schema.md
│   ├── security.md
│   ├── unified-project-structure.md
│   └── testing-strategy.md
├── prd/                         # Product requirements
│   ├── epic-1-core-application-administrator-experience.md
│   ├── epic-2-executive-experience-advanced-rag-intelligence.md
│   └── index.md
├── stories/                     # User stories
│   └── [epic].[story].story.md
├── qa/                          # Quality assurance
│   ├── assessments/
│   └── gates/
└── project-management/          # Project management
    ├── sprint-change-proposal.md
    ├── sprint-phasing-plan.md
    └── ag-ui-copilotkit-integration-summary.md
```

## Development Workflow

### Component Development

1. **Create Component**: Add to appropriate directory in `src/components/`
2. **Add Hook**: Create corresponding hook in `src/hooks/`
3. **Write Tests**: Add tests in `tests/` directory
4. **Update Types**: Add TypeScript types in `src/types/`
5. **Document**: Update relevant documentation

### Database Changes

1. **Create Migration**: Add new migration file in `supabase/migrations/`
2. **Update Types**: Regenerate Supabase types
3. **Update RLS**: Modify Row Level Security policies
4. **Test**: Verify changes in development environment

### API Development

1. **Create Edge Function**: Add to `supabase/functions/`
2. **Update API Spec**: Document in `docs/architecture/api-specification.md`
3. **Add Tests**: Create integration tests
4. **Update Frontend**: Add corresponding service in `src/services/`

## Key Principles

1. **Modular Architecture**: Clear separation of concerns with focused components
2. **Type Safety**: Comprehensive TypeScript coverage
3. **Role-Based Access**: 5-role system with proper permission boundaries
4. **AI Integration**: AG-UI + CopilotKit for enhanced chat experience
5. **Scalability**: Designed for growth with proper abstraction layers
6. **Security**: Multi-layered security with encryption and access controls
7. **Testing**: Comprehensive test coverage for all critical paths
8. **Documentation**: Clear documentation for all components and systems

## Migration Strategy

### Phase 1: Core Infrastructure
- Update existing components for 5-role system
- Implement new database tables and migrations
- Add basic AG-UI + CopilotKit integration

### Phase 2: Enhanced Features
- Add 40+ new components for admin and monitoring
- Implement token usage tracking and analytics
- Add API key management system

### Phase 3: Advanced Integration
- Full AG-UI protocol implementation
- Advanced CopilotKit features
- Complete monitoring and analytics dashboard

This unified project structure provides a comprehensive foundation for the enhanced PolicyAi SaaS platform with proper organization, scalability, and maintainability.