# Story Task Breakdown - PolicyAi Project

## Overview
This document provides detailed task breakdowns for all user stories in the PolicyAi project, including task descriptions, acceptance criteria, and estimated time.

## Epic 1: Core Application & Administrator Experience (HHR-76)

### Story 1.1: Project Foundation & Rebranding (HHR-78)
**Priority**: Critical (Must be done first)

#### Tasks:
- **HHR-93**: Frontend Development - Update Application Branding
  - Update application title in package.json and HTML title tags
  - Replace all "InsightsLM" references with "PolicyAi" in UI components
  - Update favicon and any logo assets
  - Update README.md with new project name and description
  - **Estimated Time**: 4-6 hours

- **HHR-94**: Backend Development - Database Schema Updates
  - Rename `notebooks` table to `policy_documents`
  - Update all foreign key references
  - Remove audio-related tables and columns
  - Update database migration scripts
  - **Estimated Time**: 3-4 hours

- **HHR-95**: Testing - Story 1.1 Validation
  - Unit tests updated to reflect new naming
  - Integration tests verify database schema changes work correctly
  - E2E tests ensure all UI flows work with new branding
  - Manual testing confirms audio features are completely removed
  - **Estimated Time**: 2-3 hours

**Total Estimated Time**: 9-13 hours

---

### Story 1.2: Initial Database Schema & Role Setup (HHR-79)
**Priority**: High
**Dependencies**: HHR-78 (Story 1.1)

#### Tasks:
- **HHR-96**: Frontend Development - Database Schema & Role Setup
  - Create user role management UI components
  - Add role assignment interface for super-admins
  - Create database schema visualization components
  - Update authentication components to handle roles
  - **Estimated Time**: 4-5 hours

- **HHR-97**: Backend Development - Database Migration & RLS Policies
  - Create migration script for user_roles table
  - Create migration script for policy_documents table (renamed from notebooks)
  - Implement RLS policies for role-based access
  - Create role assignment functions/scripts
  - Update TypeScript types for new schema
  - **Estimated Time**: 5-6 hours

- **HHR-98**: Testing - Database Schema & Role Setup Validation
  - Unit tests for role assignment functions
  - Integration tests for RLS policies
  - Database migration tests
  - E2E tests for role management UI
  - Security tests for role-based access
  - **Estimated Time**: 3-4 hours

**Total Estimated Time**: 12-15 hours

---

### Story 1.3: Administrator Document Upload (HHR-80)
**Priority**: High
**Dependencies**: HHR-79 (Story 1.2)

#### Tasks:
- **HHR-99**: Frontend Development - Document Upload Interface
  - Create FileUpload component with drag-and-drop support
  - Add file type validation (PDF, TXT)
  - Implement upload progress indicator
  - Add file size limits and validation
  - Create error handling and user feedback
  - **Estimated Time**: 5-6 hours

- **HHR-100**: Backend Development - File Storage & Database Integration
  - Set up Supabase Storage bucket for policy documents
  - Create storage upload function with error handling
  - Implement file naming convention and organization
  - Create function to insert policy_document record
  - Link document to current user ID and set processing status
  - **Estimated Time**: 4-5 hours

- **HHR-101**: Testing - Document Upload Flow Validation
  - Unit tests for FileUpload component
  - Integration tests for file upload to Supabase Storage
  - Database tests for document record creation
  - E2E tests for complete upload flow
  - Error handling tests for various failure scenarios
  - **Estimated Time**: 3-4 hours

**Total Estimated Time**: 12-15 hours

---

### Story 1.4: Basic RAG Ingestion for Administrator Policies (HHR-81)
**Priority**: High
**Dependencies**: HHR-80 (Story 1.3)

#### Tasks:
- **HHR-102**: N8N Workflow Development - Document Ingestion Pipeline
  - Create N8N workflow triggered by document upload
  - Implement text extraction from PDF and TXT files
  - Add text chunking and preprocessing
  - Create vector embedding generation
  - Implement Supabase vector store upsert
  - **Estimated Time**: 6-8 hours

- **HHR-103**: Backend Development - Status Update & Error Handling
  - Create status update function for document processing
  - Implement error handling for processing failures
  - Add retry mechanism for failed processing
  - Create notification system for processing completion
  - Update document status from 'processing' to 'completed'
  - **Estimated Time**: 3-4 hours

- **HHR-104**: Testing - RAG Ingestion Pipeline Validation
  - Test N8N workflow with sample documents
  - Validate text extraction accuracy
  - Test vector embedding generation
  - Verify vector store upsert functionality
  - Test error handling and retry mechanisms
  - **Estimated Time**: 4-5 hours

**Total Estimated Time**: 13-17 hours

---

### Story 1.5: Role-Aware Chat for Administrators (HHR-82)
**Priority**: High
**Dependencies**: HHR-81 (Story 1.4)

#### Tasks:
- **HHR-105**: Frontend Development - Chat Interface
  - Create Chat component with message history
  - Implement query input with user context
  - Add message display with citations
  - Create loading states and error handling
  - Implement empty state for no results
  - **Estimated Time**: 5-6 hours

- **HHR-106**: N8N Workflow Development - Role-Aware Chat Pipeline
  - Create N8N chat workflow with user context
  - Implement role-based document filtering
  - Add vector store search with user document filtering
  - Generate answers with source citations
  - Handle empty results with clear messaging
  - **Estimated Time**: 6-7 hours

- **HHR-107**: Testing - Chat Interface & RAG Pipeline Validation
  - Test chat interface with various queries
  - Validate role-based document filtering
  - Test answer generation with citations
  - Verify empty result handling
  - Test error scenarios and edge cases
  - **Estimated Time**: 4-5 hours

**Total Estimated Time**: 15-18 hours

---

## Epic 2: Executive Experience & Advanced RAG Intelligence (HHR-77)

### Story 2.1: Administrator Assignment of Executive Policies (HHR-83)
**Priority**: Medium
**Dependencies**: HHR-82 (Story 1.5)

#### Tasks:
- **HHR-108**: Frontend Development - Role Assignment Interface
  - Add role selection dropdown in document upload/edit forms
  - Create role assignment interface for existing documents
  - Implement role change validation and confirmation
  - Add visual indicators for document role assignments
  - Create role management dashboard for Administrators
  - **Estimated Time**: 4-5 hours

- **HHR-109**: Backend Development - Role Assignment Logic & RLS Updates
  - Create role assignment API endpoints
  - Update RLS policies for role-based document visibility
  - Implement role change validation logic
  - Create document segregation verification
  - Add audit logging for role assignments
  - **Estimated Time**: 5-6 hours

- **HHR-110**: Testing - Role Assignment & Document Segregation Validation
  - Test role assignment UI functionality
  - Validate RLS policies for document segregation
  - Test role change permissions and validation
  - Verify document visibility changes after role assignment
  - Test security and access control
  - **Estimated Time**: 4-5 hours

**Total Estimated Time**: 13-16 hours

---

### Story 2.2: Executive Document Access & Chat (HHR-84)
**Priority**: Medium
**Dependencies**: HHR-83 (Story 2.1)

#### Tasks:
- **HHR-111**: Frontend Development - Executive Dashboard & Chat
  - Create Executive dashboard with filtered document list
  - Implement Executive-specific chat interface
  - Add role-based document filtering in UI
  - Create Executive user experience components
  - Implement role-based navigation and access control
  - **Estimated Time**: 5-6 hours

- **HHR-112**: Backend Development - Executive Role Authentication & Access Control
  - Implement Executive role authentication
  - Create Executive document access APIs
  - Update RLS policies for Executive document access
  - Implement role-based chat filtering
  - Add Executive-specific security validation
  - **Estimated Time**: 4-5 hours

- **HHR-113**: Testing - Executive Access & Document Segregation Validation
  - Test Executive role authentication
  - Validate Executive document access restrictions
  - Test Executive chat with role-based filtering
  - Verify complete segregation from Administrator documents
  - Test security and access control for Executive role
  - **Estimated Time**: 4-5 hours

**Total Estimated Time**: 13-16 hours

---

### Story 2.3: Advanced RAG - Date Metadata Extraction (HHR-85)
**Priority**: Medium
**Dependencies**: HHR-84 (Story 2.2)

#### Tasks:
- **HHR-114**: N8N Workflow Development - Date Metadata Extraction
  - Add LLM-based date extraction step to ingestion workflow
  - Implement date parsing for various formats
  - Create date validation and standardization logic
  - Add date extraction error handling
  - Update workflow to save extracted dates to database
  - **Estimated Time**: 6-7 hours

- **HHR-115**: Backend Development - Date Storage & Database Schema Update
  - Add effective_date field to policy_documents table
  - Create date storage and retrieval functions
  - Implement date validation and error handling
  - Update TypeScript types for date fields
  - Create date management APIs
  - **Estimated Time**: 3-4 hours

- **HHR-116**: Testing - Date Extraction & Metadata Validation
  - Test date extraction with various document formats
  - Validate date parsing accuracy for different formats
  - Test date storage and retrieval functionality
  - Verify error handling for documents without dates
  - Test date extraction performance and reliability
  - **Estimated Time**: 4-5 hours

**Total Estimated Time**: 13-16 hours

---

### Story 2.4: Outdated Policy Flagging (HHR-86)
**Priority**: Medium
**Dependencies**: HHR-85 (Story 2.3)

#### Tasks:
- **HHR-117**: Frontend Development - Outdated Policy Indicators
  - Create warning icons and badges for outdated documents
  - Add outdated policy indicators to document lists
  - Implement age calculation and display logic
  - Create visual warning components
  - Add outdated policy filtering and sorting options
  - **Estimated Time**: 4-5 hours

- **HHR-118**: N8N Workflow Development - Chat Disclaimer System
  - Add age checking logic to chat workflow
  - Implement disclaimer generation for outdated sources
  - Create age-based response modification
  - Add disclaimer formatting and display
  - Handle edge cases for documents without dates
  - **Estimated Time**: 4-5 hours

- **HHR-119**: Testing - Outdated Policy Flagging & Disclaimer Validation
  - Test outdated policy indicators in document lists
  - Validate age calculation accuracy (18-month threshold)
  - Test chat disclaimers for outdated policy sources
  - Verify disclaimer formatting and display
  - Test edge cases for documents without dates
  - **Estimated Time**: 3-4 hours

**Total Estimated Time**: 11-14 hours

---

## Summary

### Epic 1 Total Estimated Time: 61-78 hours
### Epic 2 Total Estimated Time: 50-62 hours
### **Project Total Estimated Time: 111-140 hours**

## Task Distribution by Type
- **Frontend Development**: 18 tasks (54-66 hours)
- **Backend Development**: 18 tasks (54-66 hours)
- **N8N Workflow Development**: 6 tasks (24-30 hours)
- **Testing**: 18 tasks (54-66 hours)

## Development Recommendations
1. **Start with Epic 1** - Foundation must be solid before Epic 2
2. **Parallel Development** - Frontend and Backend tasks can be done in parallel
3. **Testing Strategy** - Test each story thoroughly before moving to the next
4. **Resource Planning** - Allocate appropriate time for N8N workflow development
5. **Quality Assurance** - Ensure comprehensive testing for security and compliance features

## Last Updated
2025-01-17 - Complete task breakdown created
