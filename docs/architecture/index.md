# PolicyAi Fullstack Architecture Document

---

## ⚠️ ASPIRATIONAL ARCHITECTURE - FUTURE VISION

**Status**: FUTURE VISION - Not Currently Implemented
**Date**: Originally created 2025-09-17, Updated 2025-10-16
**Accuracy**: ~40% implemented (Epic 1 complete, Epics 1.5, 2, 3, 4 planned)

**Important Notes**:
- This directory contains **planned future architecture**, not current implementation
- Many features described here are NOT implemented (AG-UI/CopilotKit, 5-role hierarchy, token tracking)
- For **current architecture**, see: [docs/current/current-architecture.md](../current/current-architecture.md)
- For **implementation roadmap**, see: [docs/current/roadmap.md](../current/roadmap.md)

**Use These Documents For**:
- ✅ Understanding long-term architectural vision
- ✅ Planning future feature implementations
- ✅ Reference for target architecture

**Do NOT Use These Documents For**:
- ❌ Understanding current system behavior
- ❌ Troubleshooting production issues
- ❌ Writing current system documentation
- ❌ Describing implemented features

**Key Differences from Current State**:
| Feature | This Architecture | Current Reality |
|---------|-------------------|-----------------|
| **Chat System** | AG-UI + CopilotKit (in-app) | N8N webhooks (external) |
| **Roles** | 5 roles (Board, Admin, Exec, Company Op, System Owner) | 3 roles (Board, Admin, Exec) |
| **Token Tracking** | Comprehensive usage tracking | Not implemented |
| **API Keys** | User-configured, encrypted | N8N-managed only |
| **PDF Features** | Search, thumbnails, citation highlighting | Basic viewer only |
| **Settings UI** | Comprehensive settings hub | Not implemented |

See [docs/current/roadmap.md](../current/roadmap.md) for implementation timeline (~247 hours / 33 days).

---

# PolicyAi Fullstack Architecture Document (Future Vision)

This document outlines the **planned** fullstack architecture for PolicyAi, including backend systems, frontend implementation, and their integration. This represents the target state after completing Epics 1.5, 1.7, 2, 3, and 4.

* **Project Origin:** PolicyAi was built upon the "InsightsLM" codebase (2024) as a foundational template. Audio/podcast features were removed and policy-specific features added.

## Sections

- [High Level Architecture](./high-level-architecture.md)
- [Tech Stack](./tech-stack.md)
- [Data Models & Database Schema](./data-models-database-schema.md)
- [API Specification](./api-specification.md)
- [Unified Project Structure](./unified-project-structure.md)
- [Security](./security.md)
- [Testing Strategy](./testing-strategy.md)
- [Development Workflow](./development-workflow.md)
