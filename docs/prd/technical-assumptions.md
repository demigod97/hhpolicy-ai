# Technical Assumptions

## Repository Structure
* **Monorepo**
    * **Rationale:** The "PolicyAi" features, especially the shared security model and data types between the frontend and backend, are tightly coupled. A monorepo simplifies dependency management, ensures consistency, and streamlines the development workflow for the team.

## Service Architecture
* **Serverless Functions & Workflow Automation**
    * **Rationale:** This approach continues the effective pattern from the original codebase. It leverages the strengths of our chosen stack: Supabase Edge Functions for scalable API endpoints and N8N for the complex RAG and data processing workflows. This reduces the need to build and maintain custom backend server infrastructure.

## Testing Requirements
* **Full Testing Pyramid (Unit, Integration, and End-to-End)**
    * **Rationale:** Given the critical nature of security and compliance for this tool, a robust testing strategy is non-negotiable. This will include unit tests for business logic (e.g., metadata extraction), integration tests for service interactions (e.g., database RLS policies), and end-to-end (E2E) tests for critical user flows.

## Additional Technical Assumptions and Requests
* The application will continue to use **Supabase** for its core backend services: Authentication, Postgres Database (with RLS), and Storage.
* The frontend will be a **Single Page Application (SPA)** built with React and Vite.
* An **LLM provider** (e.g., OpenAI, Gemini) is required for the RAG pipeline and will be integrated via N8N.
