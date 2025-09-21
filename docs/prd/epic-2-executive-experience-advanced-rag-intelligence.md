# Epic 2: Executive Experience & Advanced RAG Intelligence

**Expanded Epic Goal:** The objective of this epic is to extend the PolicyAi application to serve the Executive persona and to introduce the advanced, policy-specific intelligence that forms the product's core value proposition. By the end of this epic, Executives will be able to get answers from their segregated document set, and all users will benefit from the system's ability to identify and flag potentially outdated policies.

---

**Story 2.1: Administrator Assignment of Executive Sources**
* **As an** Administrator,
* **I want** to assign uploaded sources to the 'Executive' target role within the global access system,
* **so that** they can be made available to Executive users while maintaining role-based access control.

    **Acceptance Criteria:**
    1.  The document management UI allows an Administrator to select the 'Executive' target role when uploading or editing a source document.
    2.  The source's record in the database is correctly associated with the 'Executive' target_role while maintaining global visibility_scope.
    3.  Once assigned to the 'Executive' target_role, the source is no longer visible to Administrator users but remains accessible to Executive and Board users, confirming the three-tier RLS policy is working.

---

**Story 2.2: Executive Source Access & Chat**
* **As an** Executive,
* **I want** to log in and interact with sources available to my role in the global access system,
* **so that** I can get answers from both executive and administrator level content.

    **Acceptance Criteria:**
    1.  A user with the 'Executive' role can successfully log in.
    2.  Their dashboard displays sources assigned to both 'Executive' and 'Administrator' target roles (but not Board-only sources).
    3.  Their chat queries return answers derived from executive and administrator sources within the global source pool.
    4.  An Executive cannot see or query any sources assigned exclusively to the 'Board' target role.

---

**Story 2.3: Advanced RAG - Date Metadata Extraction**
* **As a** System,
* **I want** to enhance the ingestion workflow to identify and extract date metadata from policy documents,
* **so that** the document's age can be tracked for compliance purposes.

    **Acceptance Criteria:**
    1.  The N8N ingestion workflow is updated to include a step that uses an LLM to find and parse date-related information (e.g., "Effective Date", "Last Updated").
    2.  The extracted date, if found, is saved in a dedicated field in the `policy_documents` table.
    3.  If no date can be reliably determined, the date field for that document remains null.
    4.  The process handles common date formats.

---

**Story 2.4: Outdated Policy Flagging** ✅ **PARTIALLY COMPLETE**
* **As a** User (Admin or Executive),
* **I want** the system to clearly flag when a policy document is older than 18 months,
* **so that** I am immediately aware of its potential obsolescence.

    **Acceptance Criteria:**
    1.  ✅ In the dashboard/document list, a clear visual indicator (color-coded badges) is displayed next to any document whose extracted date is more than 18 months in the past.
    2.  ⏳ When the chat AI provides an answer sourced from a document older than 18 months, its response **must** include a disclaimer (e.g., "Note: This information is from a policy that is over 18 months old.").
    3.  ✅ Documents with no extracted date are not flagged (shown with yellow "Not Provided" badges).
