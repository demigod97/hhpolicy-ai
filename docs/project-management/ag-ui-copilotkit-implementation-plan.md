# AG-UI + CopilotKit Implementation Plan

**Date:** January 17, 2025  
**Sprint Duration:** 2 weeks (10 working days)  
**Project:** PolicyAi - Compliance Management System  
**Status:** Planning Phase  

---

## Executive Summary

This document outlines the comprehensive implementation plan for transforming PolicyAi from a basic 3-role document management system into a full-featured SaaS application with advanced AI capabilities using AG-UI Protocol and CopilotKit integration.

### Key Transformations

1. **Role Hierarchy Expansion**: 3 → 5 roles (Company Operator, System Owner)
2. **AI Framework Integration**: AG-UI Protocol + CopilotKit for in-app AI chat
3. **n8n Migration**: Move chat workflows from external n8n to in-app implementation
4. **Token Usage System**: Comprehensive tracking and monitoring dashboard
5. **API Key Management**: Secure storage and user-configurable keys
6. **PDF Document Viewer**: Replace markdown viewer with full PDF rendering
7. **Enhanced UI/UX**: Dual navigation, settings hub, user management, token dashboard

---

## Implementation Strategy

### Phase 1: Foundation (Days 1-5)
- Database schema updates and migrations
- API key management backend
- Token usage tracking system
- User management backend
- Settings UI and API key management

### Phase 2: AI Integration (Days 6-10)
- AG-UI + CopilotKit integration
- Native chat interface with streaming
- PDF viewer implementation
- Admin dashboards
- Navigation and polish

---

## Story Mapping Strategy

### Current Stories Analysis

**Existing Stories to Update/Remove:**
1. **1.1 Project Foundation** - ✅ Complete, needs rebranding updates
2. **1.2 Database Schema** - 🔄 Needs extension for 5 roles
3. **1.3 Administrator Upload** - 🔄 Needs PDF viewer integration
4. **1.4 Basic RAG Ingestion** - 🔄 Needs AG-UI integration
5. **1.5 Role-Aware Chat** - 🔄 Complete rewrite for AG-UI + CopilotKit
6. **2.1 Administrator Assignment** - 🔄 Update for new roles
7. **2.2 Executive Document Access** - 🔄 Update for new roles
8. **2.3 Advanced RAG** - 🔄 Integrate with AG-UI
9. **2.4 Outdated Policy Flagging** - 🔄 Update for new system

### New Stories Required

**Epic 1.5: Role Hierarchy & Access Control**
- 1.5.1: Add Company Operator & System Owner roles
- 1.5.2: Update RLS policies for 5-tier system
- 1.5.3: Role assignment UI
- 1.5.4: Permission management

**Epic 1.7: SaaS Infrastructure**
- 1.7.1: API Key Management System
- 1.7.2: Token Usage Tracking System
- 1.7.3: User Limits & Quota Management
- 1.7.4: Token Usage Dashboard & Monitoring

**Epic 2: AI-Powered Chat Experience (Modified)**
- 2.1: AG-UI + CopilotKit Integration Foundation
- 2.2: Native Chat Interface with Streaming
- 2.3: Chat Session Management
- 2.4: Role-Based Vector Store Filtering
- 2.5: Advanced Chat Features & Citations

**Epic 3: Enhanced Document Experience**
- 3.1: PDF Document Viewer Implementation
- 3.2: PDF Navigation & Search
- 3.3: Citation Highlighting Integration
- 3.4: Dual Navigation System & Document Metadata

**Epic 4: Settings & Administration**
- 4.1: Settings Hub & Navigation
- 4.2: API Key Configuration Interface
- 4.3: User Management Dashboard
- 4.4: Token Usage Monitoring Dashboard

---

## Implementation Timeline

### Week 1: Foundation (Days 1-5)

**Day 1: Database Schema & Migrations**
- Run all 6 migration files
- Verify RLS policies
- Test helper functions
- Seed test data
- **Deliverable:** All schema changes deployed

**Day 2: API Key Management Backend**
- Install crypto-js
- Create encryption utilities
- Build Supabase Edge Functions
- Test encryption cycle
- **Deliverable:** API key backend operational

**Day 3: Token Usage Tracking System**
- Create useTokenUsage hook
- Build tracking functions
- Implement limit enforcement
- Test accuracy
- **Deliverable:** Token tracking live

**Day 4: User Management Backend**
- Role assignment functions
- Bulk operation endpoints
- Limits management API
- Authorization checks
- **Deliverable:** User mgmt backend complete

**Day 5: Settings UI & API Key Management**
- SettingsHub component
- ApiKeyManager UI
- Test interface
- End-to-end key flow
- **Deliverable:** Settings functional

### Week 2: Features (Days 6-10)

**Day 6: AG-UI + CopilotKit Integration**
- Install frameworks
- Configure providers
- Basic chat interface
- Streaming responses
- **Deliverable:** Basic AI chat working

**Day 7: Chat Interface & Migration**
- StreamingChatInterface
- Message components
- Chat history sidebar
- Role-based filtering
- **Deliverable:** Full chat functional

**Day 8: PDF Viewer & Documents**
- react-pdf integration
- PDF navigation
- Citation highlighting
- Document metadata
- **Deliverable:** PDF viewer complete

**Day 9: Admin Dashboards**
- UserManagementDashboard
- TokenUsageDashboard
- Recharts integration
- Bulk operations
- **Deliverable:** Admin UI complete

**Day 10: Navigation & Polish**
- Dual navigation bars
- Breadcrumbs
- Testing & debugging
- Deploy to staging
- **Deliverable:** System ready

---

## Success Criteria

### Week 1 Complete When
- ✅ All 5 roles active in database
- ✅ API keys can be stored/retrieved encrypted
- ✅ Token usage tracking capturing all requests
- ✅ User limits enforced automatically
- ✅ Settings UI allows key configuration
- ✅ No critical security vulnerabilities

### Week 2 Complete When
- ✅ Chat works in-app with AG-UI + CopilotKit
- ✅ Streaming responses functional
- ✅ PDF viewer displays actual documents
- ✅ Citations link to PDF highlights
- ✅ User management dashboard operational
- ✅ Token usage dashboard shows real data
- ✅ Dual navigation implemented
- ✅ All role permissions enforced

### Sprint Complete When
- ✅ All requirements from original request implemented
- ✅ All 40+ components created and tested
- ✅ All 6 migrations deployed successfully
- ✅ No critical bugs blocking usage
- ✅ Documentation updated
- ✅ Deployed to staging environment
- ✅ n8n chat workflows can be deprecated
- ✅ Performance meets requirements (<30s response time)

---

## Risk Mitigation

### High-Risk Items

1. **AG-UI + CopilotKit Integration Complexity**
   - Start with basic implementation Day 6
   - Incremental feature addition
   - Keep n8n as backup Week 1
   - Extensive testing before cutover

2. **Token Tracking Accuracy**
   - Test thoroughly on Day 3
   - Validate against known token counts
   - Cross-reference with provider APIs
   - Manual verification first week

3. **PDF Viewer Performance**
   - Implement lazy loading
   - Page-by-page rendering
   - Optimize bundle size
   - Test with large PDFs (100+ pages)

4. **Solo Developer Velocity**
   - Realistic daily goals (6-8h)
   - Clear priorities
   - Contingency features identified
   - Daily progress tracking

### Contingency Plan (If Falling Behind)
- **Skip:** Token dashboard charts (use tables)
- **Defer:** PDF thumbnail sidebar (basic nav)
- **Simplify:** Bulk operations (one-by-one)

---

## Story Creation Status

### ✅ COMPLETED: All Stories Created

**Epic 1.5: Role Hierarchy & Access Control**
- ✅ 1.5.1: Database Schema - Add Company Operator & System Owner Roles
- ✅ 1.5.2: Update RLS Policies for 5-Tier System
- ✅ 1.5.3: Role Assignment UI for Company Operators
- ✅ 1.5.4: Role-Based Navigation & Permission Management

**Epic 1.6: Enhanced Document Management**
- ✅ 1.6.1: Advanced Document Upload System
- ✅ 1.6.2: Document Version Control & History
- ✅ 1.6.3: Document Collaboration Features
- ✅ 1.6.4: Document Search & Filtering

**Epic 1.7: SaaS Infrastructure**
- ✅ 1.7.1: API Key Management System
- ✅ 1.7.2: Token Usage Tracking System
- ✅ 1.7.3: User Limits Configuration System

**Epic 1.8: AG-UI Protocol Integration**
- ✅ 1.8.1: AG-UI Protocol Implementation
- ✅ 1.8.2: CopilotKit Integration
- ✅ 1.8.3: n8n Workflow Migration to In-App Implementation

**Epic 1.9: Advanced AI Features**
- ✅ 1.9.1: Multi-Provider AI Support
- ✅ 1.9.2: Advanced AI Features

**Epic 1.10: System Optimization**
- ✅ 1.10.1: Performance Optimization
- ✅ 1.10.2: Security Enhancements

**Epic 1.11: User Experience**
- ✅ 1.11.1: Responsive Design & Mobile Optimization
- ✅ 1.11.2: User Experience Enhancements

**Epic 1.12: Documentation & Training**
- ✅ 1.12.1: Comprehensive Documentation System
- ✅ 1.12.2: User Training System

**Epic 1.13: Final Integration & Testing**
- ✅ 1.13.1: System Integration Testing
- ✅ 1.13.2: Production Deployment

## Next Steps

1. **Review and Approve Stories** - Stakeholder approval of all 24 stories
2. **Set Up Development Environment** - Install dependencies
3. **Begin Implementation** - Start with Epic 1.5 (Role Hierarchy)
4. **Daily Progress Tracking** - Monitor against timeline
5. **Weekly Reviews** - Demo functional features
6. **Final Deployment** - Deploy to staging environment

---

**Document Status:** ✅ **STORIES COMPLETE - READY FOR IMPLEMENTATION**  
**Next Action:** Begin implementation with Epic 1.5 stories
