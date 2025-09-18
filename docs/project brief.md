# Project Brief: PolicyAi

### Executive Summary (Expanded Draft)

PolicyAi is a specialized, AI-powered compliance management system designed for targeted departments such as **[e.g., Human Resources and Legal]**. It solves the critical business problem of mitigating compliance risk by ensuring staff can only access the most current and relevant policies for their specific role ("Administrator" or "Executive").

Currently, these teams waste significant time searching for information and run the risk of acting on outdated documents. PolicyAi's key value proposition is its secure, self-hosted platform that provides instant, verifiable answers from internal policy documents. Its most impactful feature is the specialized RAG pipeline that automatically extracts key metadata, such as a policy's effective date, and flags documents older than 18 months. This directly addresses the core business goal of **[e.g., dramatically reducing compliance errors and improving operational efficiency]**.

### Problem Statement

Organizations, particularly those in regulated industries, manage a large and constantly evolving library of internal policies. Employees, from executives to administrators, struggle to efficiently find the correct, up-to-date policy document relevant to their specific role and query. This manual search process is slow, frustrating, and carries a high risk of non-compliance.

The tangible impacts of this problem are:
* **Operational Inefficiency:** Significant employee time is wasted searching for information or verifying the currency of a policy, detracting from core responsibilities.
* **Compliance & Legal Risk:** Acting on outdated, incorrect, or role-inappropriate policy information can lead to severe financial penalties, legal liabilities, and reputational damage. This risk is magnified when there's no clear, enforceable separation between policies intended for different roles (e.g., executive vs. administrative staff).
* **Failure of Existing Tools:** Generic document management systems like SharePoint or Google Drive lack the specialized, intelligent capabilities required. They cannot perform context-aware searches within documents, proactively flag outdated policies, or enforce the granular, role-based access control needed for a secure compliance environment.

As the volume of policies and the complexity of regulations increase daily, a manual or generic system is no longer scalable or defensible.

### Proposed Solution

PolicyAi will be a self-hosted, AI-driven web application designed for secure compliance management. The core approach is to combine a role-based document repository with a specialized Retrieval-Augmented Generation (RAG) system. Authorized users will upload policy documents, which will be processed and stored according to their designated access level ("Administrator" or "Executive"). Users can then ask natural language questions and receive answers generated exclusively from the documents they are permitted to view, complete with verifiable citations.

Key differentiators from existing solutions include:
* **Strict Role-Based Access Control (RBAC):** A robust security model enforced at the database level to guarantee data segregation between user roles.
* **Intelligent RAG Pipeline:** A backend workflow optimized to extract policy-specific metadata, such as flagging documents older than 18 months, to provide deeper context and automated oversight.
* **Verifiable, Context-Aware Answers:** Unlike generic search, PolicyAi will provide answers grounded in and cited directly from the source documents, ensuring accuracy and trust.

This solution will succeed where generic tools fail because it is purpose-built for the compliance vertical. By integrating intelligence and security directly into the workflow, PolicyAi solves the core problems of discoverability, accuracy, and access control in a single, cohesive platform. The long-term vision is for PolicyAi to become the central, trusted "source of truth" for all internal policies within an organization.

### Target Users

##### Primary User Segment: Administrators (e.g., HR, Legal, Compliance Officers)
* **Profile:** These users are responsible for creating, managing, and disseminating company policies. They are detail-oriented, and their success is measured by the accuracy, currency, and auditability of the policy library.
* **Current Behaviors:** They currently spend a significant amount of time manually answering questions from other employees, searching through shared drives or intranets for specific clauses, and trying to manage version control of critical documents.
* **Needs & Pain Points:** They need a centralized, single source of truth for the entire policy lifecycle. Their main pain points are the lack of version control, the difficulty in ensuring employees are using the latest documents, and the inability to quickly find information across multiple policies.
* **Goals:** Their primary goal is to reduce the time spent on manual policy management and to minimize the company's exposure to compliance risk.

##### Secondary User Segment: Executives (e.g., C-Level, VPs, Directors)
* **Profile:** These users are consumers of policy information, often needing high-level summaries or answers to specific, strategic questions. They are time-poor and require immediate, trustworthy answers to make decisions.
* **Current Behaviors:** They typically ask their administrative staff for policy information, which introduces delays. When they search for documents themselves, they often lack confidence in the results or struggle to find the specific clause they need.
* **Needs & Pain Points:** They need quick, reliable answers to specific policy-related questions without having to read entire documents. Their main pain point is the lack of a trusted, instantaneous source of truth to support high-stakes decisions.
* **Goals:** Their primary goal is to get accurate, policy-grounded answers instantly to support their strategic and operational responsibilities.

### Goals & Success Metrics (Refined Draft)

##### Business Objectives
* Reduce compliance risk by ensuring 100% of policy queries are answered using role-appropriate, up-to-date documents by the end of the first quarter post-launch.
* Increase operational efficiency by reducing the time Administrators spend manually answering policy questions by an estimated 50% within six months of launch.
* Achieve a 20% adoption rate (measured by monthly active users) within the initial target departments (e.g., HR, Legal) within six months.

##### User Success Metrics
* **For Administrators:** Successfully upload, categorize, and manage a new **standard policy document (under 50 pages, in a supported format)** in under five minutes.
* **For Executives:** Receive an accurate, cited answer to a **well-formed, unambiguous query** in under 30 seconds.
* **For All Users:** Users report a high confidence score (average of 4 out of 5) in the accuracy and relevance of the AI-generated answers.
* **(New) For All Users: AI-generated answers receive a user-reported accuracy rating of at least 95% (e.g., via a simple 'Was this helpful?' feedback mechanism on each response).**

##### Key Performance Indicators (KPIs)
* **Monthly Active Users (MAU):** The number of unique users interacting with the platform each month.
* **Query Success Rate:** The percentage of user queries that return a cited answer **and do not receive negative user feedback.**
* **Outdated Policy Flag Rate:** The number of times the system correctly identifies and flags a policy as being older than 18 months during a user interaction.
* **Average Query Time:** The average time in seconds from when a user submits a question to when they receive a complete answer.
* **(New) Total Policy Management Time:** **A composite metric tracking the end-to-end time from policy creation/update to successful user query, aiming for a 25% overall reduction.**

### MVP Scope (Expanded Draft)

##### Core Features (Must Have)
* **User Authentication & Roles:** A secure sign-in system and the ability for an initial super-admin to assign users to either "Administrator" or "Executive" roles.
* **Policy Document Upload & Management (Admin):** An interface for Administrators to upload policy documents (e.g., PDFs) and assign them to the appropriate role (Admin or Executive).
* **Specialized RAG Ingestion:** The backend workflow that processes uploaded documents, extracts key metadata (like dates), and correctly flags documents older than 18 months.
* **Role-Based Conversational Search:** The core chat interface where logged-in users can ask questions and receive AI-generated answers exclusively from the policy documents their role is permitted to access.
* **Verifiable Citations:** All AI-generated answers must include citations that allow the user to reference the specific source document.
* **Role Management Interface (Super-Admin):** A simple interface for the initial super-admin to change a user's role between 'Administrator' and 'Executive'.
* **Document Error Handling & Re-assignment:** The system must gracefully handle upload failures (e.g., corrupted or password-protected files) and notify the Administrator. Administrators must also have the ability to re-assign a document's role after upload.
* **Undefined Date Handling:** The RAG ingestion pipeline must have a defined rule for documents without a clear date, such as using the upload date as a default and flagging it for manual review.
* **Defined Cross-Role Query Behavior:** When a query cannot be answered by the user's accessible documents, the AI must respond with a clear, pre-defined message stating that the answer may exist in documents outside their permission scope, without revealing any sensitive information.

##### Out of Scope for MVP
* **Real-time Collaboration:** Multiple users editing or commenting on a policy document simultaneously.
* **Advanced User/Group Management:** Creating custom roles or assigning policies to specific teams/groups beyond the initial two roles.
* **Automated Policy Review Workflows:** Features for approval chains, scheduled review reminders, or notifications.
* **In-depth Analytics Dashboard:** Detailed reporting on user queries, popular policies, etc.
* **Sharing Policies with External Users:** Any functionality to share documents outside of the organization.

##### MVP Success Criteria
The MVP will be considered successful when Administrators can effectively manage a library of role-specific policies, and all users can get accurate, cited answers from their respective documents, achieving the key performance and adoption metrics we defined in the previous section.

### Post-MVP Vision

##### Phase 2 Features
Following a successful MVP launch, the next logical step would be to introduce more advanced administrative and collaborative capabilities. This includes features like **Advanced User/Group Management** (allowing custom roles and team-based permissions), an **In-depth Analytics Dashboard** for tracking query trends and compliance hotspots, and **Automated Policy Review Workflows** (e.g., approval chains and scheduled review reminders).

##### Long-term Vision (1-2 Years)
In the next 1-2 years, the vision is for PolicyAi to evolve from a reactive query tool into a proactive compliance platform. This could include **real-time collaboration** on policy documents (similar to Google Docs), integrations with external regulatory alert systems, and AI-powered suggestions for policy improvements based on user query patterns and identified knowledge gaps.

##### Expansion Opportunities
Potential long-term expansion opportunities include packaging PolicyAi as a commercial **SaaS product**, developing **multi-language support** for international organizations, and creating secure mechanisms for **sharing specific policies with external auditors** or partners.

### Technical Considerations

##### Platform Requirements
* **Target Platforms:** Web Responsive (Desktop and Mobile browsers).
* **Browser/OS Support:** Latest versions of major browsers (Chrome, Firefox, Safari, Edge).
* **Performance Requirements:** The application must feel fast and responsive, with a key user success metric of delivering AI-powered answers in under 30 seconds.

##### Technology Preferences
We will leverage the modern, robust stack from the existing InsightsLM project to accelerate development.
* **Frontend:** Continue with the existing stack: Vite, React, TypeScript, shadcn-ui, and Tailwind CSS.
* **Backend:** Continue with the existing serverless backend pattern: Supabase (Edge Functions, Auth, Storage) and N8N for workflow automation.
* **Database:** Continue with Supabase's managed Postgres database.
* **Hosting/Infrastructure:** Supabase will host the backend and database. The frontend will be deployed to a modern hosting provider like Vercel or Netlify.

##### Architecture Considerations
* **Repository Structure:** The existing single repository structure is a strong starting point, to be confirmed by the Architect.
* **Service Architecture:** We will continue with the serverless function/workflow automation pattern. The main architectural challenge will be refactoring the N8N workflows and Supabase database schema to be "role-aware" in support of the new security model.
* **Integration Requirements:** The application will continue to integrate deeply with Supabase and will require an LLM provider (e.g., OpenAI, Gemini) for the RAG pipeline.
* **Security/Compliance:** The core security requirement is the strict enforcement of the "Administrator" vs. "Executive" roles. This must be implemented at the database level using Supabase's Row Level Security (RLS) policies.

### Constraints & Assumptions

##### Constraints
* **Budget:** To be determined. Please provide any known budget limitations for the MVP.
* **Timeline:** To be determined. Are there any critical deadlines or a target launch window for the MVP?
* **Resources:** The project will be developed by the BMad AI agent team. Please confirm if any other human resources (e.g., designers, specific stakeholders for review) need to be factored in.
* **Technical:** The project must be built upon the existing InsightsLM codebase, leveraging Supabase and N8N as the core backend technologies.

##### Key Assumptions
* We assume the existing InsightsLM codebase provides a suitable and stable foundation for the "PolicyAi" application.
* We assume a two-role system ("Administrator" and "Executive") is sufficient for the MVP, and more granular, team-based permissions are out of scope for now.
* We assume that the required policy metadata (dates, section headings) can be reliably extracted from the provided documents using an LLM within the N8N workflow.
* We assume that credentials for all required services (Supabase, N8N, an LLM provider) will be available during development.

### Risks & Open Questions

##### Key Risks
* **Technical Risk:** The complexity of overhauling the N8N workflows for the specialized RAG pipeline may be higher than anticipated. *Impact: Potential delays in delivering the core intelligent search feature.*
* **Data Security Risk:** Implementing the Role-Based Access Control (RBAC) via Supabase RLS is critical and complex. An error in these policies could lead to data leakage between user roles. *Impact: Severe security breach and loss of user trust.*
* **Data Quality Risk:** The accuracy of the AI depends heavily on the quality and format of the uploaded policy documents. Poorly structured or ambiguous documents may lead to unreliable metadata extraction and answers. *Impact: Reduced user trust and product viability.*

##### Open Questions
* What is the exact process for creating the initial super-admin and managing their credentials securely?
* What are the specific performance expectations (e.g., documents processed per minute) for the RAG ingestion pipeline?
* Will the MVP need to handle pre-existing documents, or will it start with an empty library?
* What are the user notification requirements for events like upload failures or when a document they rely on is flagged as outdated?

##### Areas Needing Further Research
* Best practices for reliably extracting structured metadata (dates, sections) from unstructured PDF and DOCX files.
* Optimal Supabase RLS policy design for performance and security in a multi-role system.

### Appendices

##### A. Research Summary
This Project Brief was created based on our collaborative analysis sessions and a technical review of the existing InsightsLM codebase provided.

##### B. Stakeholder Input
Your input has been incorporated throughout the interactive creation of this brief.

##### C. References
* `flattened-codebase.xml`
* `README.md`

### Next Steps

##### Immediate Actions
1.  Final review and approval of this completed Project Brief.
2.  Handoff to the Product Manager (PM) to begin creating the detailed Product Requirements Document (PRD) for "PolicyAi".

##### PM Handoff
This Project Brief provides the full context for PolicyAi. Please start in 'PRD Generation Mode', review the brief thoroughly to work with the user to create the PRD section by section as the template indicates, asking for any necessary clarification or suggesting improvements.