# 1) High-level migration plan (phased)

## TL;DR (what you’ll change)

* **Frontend:** Replace custom chat with **CopilotKit React UI** (already AG-UI–compatible). Add a tiny AG-UI connector and pass user/role context from Supabase Auth. ([copilotkit.ai][1])
* **Protocol:** Standardize your app↔agent communication on **AG-UI events** (streaming chat, tool calls, UI intents). ([docs.ag-ui.com][2])
* **Backend:** Keep Supabase Edge Functions + n8n. Wrap them as **AG-UI tools**; emit AG-UI events (SSE/HTTP) back to the UI; enforce **RLS** for role-scoped RAG. ([docs.ag-ui.com][2])

### Phase A — Foundations (1–2 hrs)

1. Add CopilotKit to your React+Vite app and swap your chat window to their UI. ([GitHub][3])
2. Create an **AG-UI gateway** route (can be a Supabase Edge Function) to accept chat turns, call your LLM/tools, and stream AG-UI events back. ([GitHub][4])
3. Pass **Supabase user + role** to the Copilot context for authorization-aware prompts/tools.

### Phase B — Tools & RAG (half day)
/
4. Wrap your **n8n ingestion** and **RAG search** as AG-UI “tools” (simple HTTP actions).
5. Add **RLS policies** so embeddings & chunks are row-scoped to roles (Board/Exec/Admin or your three roles).
6. Add **role-based webhooks** (your existing 3) as tools the agent can call.

### Phase C — UX polish (1–2 hrs)

7. Stream document-ingestion progress as **AG-UI events** (status updates).
8. Add slash-commands or UI intents (e.g., `/upload`, `/summarize`, `/cite`) using CopilotKit actions.

---

# 2) Target architecture (quick map)

```
[React + Vite] --(AG-UI events)--> [Supabase Edge Function: /agui]
     |                                          |
 [CopilotKit UI]                          Tools: call n8n, RAG query,
     |                                          role webhooks
 [Supabase Auth role ctx]                       |
     |                                          v
 [RLS-scoped Supabase (docs, chunks, perms)] <---> [n8n pipelines]
```

AG-UI standardizes the event stream and tool calls; CopilotKit gives you the production chat/components; your edge functions remain your execution layer. ([docs.ag-ui.com][2])

---

# 3) Detailed steps

## A. Frontend (React + Vite)

### 1) Install deps

```bash
pnpm add @copilotkit/react-ui @copilotkit/react-core
# or: npm i ...
```

CopilotKit ships React components + headless hooks and integrates with AG-UI. ([npm][5])

### 2) Wrap your app

In `main.tsx` (or top-level), inject provider + your endpoint:

```tsx
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar, CopilotChat } from "@copilotkit/react-ui";

<CopilotKit
  runtimeUrl="/api/agui"   // we’ll implement this via Edge Function proxy
  headers={() => ({
    Authorization: `Bearer ${supabaseAuthToken}`, // from Supabase client
  })}
  context={{
    userId,
    role,       // "board" | "exec" | "admin" (or your 3 roles)
  }}
>
  <CopilotSidebar>
    <CopilotChat
      title="Policy Copilot"
      placeholder="Ask about any doc you have access to…"
    />
  </CopilotSidebar>
</CopilotKit>
```

> `runtimeUrl` is the AG-UI endpoint that streams events. CopilotKit handles UI + streaming. ([GitHub][3])

### 3) Pass Supabase auth/role context

* Use `@supabase/supabase-js` to fetch the session; map your claims (e.g., `app_role`) into `context`.
* The backend will read this to enforce RAG filters & choose the correct webhook.

### 4) Define in-app actions (optional but powerful)

Actions expose safe UI intents (e.g., select doc, open modal) that the agent can trigger:

```tsx
import { useCopilotAction } from "@copilotkit/react-core";

useCopilotAction({
  name: "openDoc",
  description: "Open a document by id in the viewer",
  parameters: { type: "object", properties: { docId: { type: "string" }}, required: ["docId"] },
  handler: async ({ docId }) => openDocumentViewer(docId),
});
```

These are surfaced to the model as “frontend tools” with guardrails. ([GitHub][3])

---

## B. Backend (Supabase Edge Functions as AG-UI gateway)

You’ll build **one** AG-UI endpoint that:

* Accepts user messages + context
* Calls your LLM and “tools” (RAG search, role webhooks, n8n ingestion)
* Streams **AG-UI events** (tokens, tool-invocations, tool-results)

### 5) Create `/agui` Edge Function (Deno)

**Routing:** expose `POST /agui/session` (create) and `POST /agui/events` (continue), or a single route that handles chat turns and streams SSE.

Minimal sketch (pseudo-Deno for Edge Functions):

```ts
// supabase/functions/agui/index.ts
import { serve } from "std/http/server.ts";
import { stream } from "./agui/stream.ts"; // your SSE helper
import { handleTool } from "./agui/tools.ts"; // dispatch to RAG/n8n/webhooks
import { openai } from "./llm.ts"; // or provider of choice

serve(async (req) => {
  const { messages, context } = await req.json(); // AG-UI compatible input
  const role = context?.role;

  const encoder = new TextEncoder();
  const streamBody = new ReadableStream({
    async start(controller) {
      // Emit AG-UI "start" event
      controller.enqueue(encoder.encode(`event: agui:event\ndata: ${JSON.stringify({ type:"session.start" })}\n\n`));

      // Stream model tokens as AG-UI events
      for await (const chunk of openai.stream(messages, { role })) {
        controller.enqueue(encoder.encode(`event: agui:event\ndata: ${JSON.stringify({ type:"llm.delta", delta: chunk })}\n\n`));
      }

      // Example tool call (RAG)
      const ragResult = await handleTool("rag.search", { role, messages });
      controller.enqueue(encoder.encode(`event: agui:event\ndata: ${JSON.stringify({ type:"tool.result", name:"rag.search", result: ragResult })}\n\n`));

      controller.enqueue(encoder.encode(`event: agui:event\ndata: ${JSON.stringify({ type:"session.end" })}\n\n`));
      controller.close();
    }
  });

  return new Response(streamBody, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
});
```

> AG-UI defines a small set of event types (e.g., `session.start`, `llm.delta`, `tool.invoke`, `tool.result`) and is transport-agnostic (HTTP/SSE/WebSockets). Edge Functions are great for the HTTP/SSE reference flow. ([docs.ag-ui.com][2])

### 6) Implement tools (your 3 webhooks + n8n + RAG)

**Tool dispatcher** (`tools.ts`):

```ts
export async function handleTool(name: string, args: any) {
  switch (name) {
    case "rag.search":
      return await ragSearch(args);
    case "ingest.fromUpload":
      return await callN8NIngest(args);        // triggers your existing n8n workflow
    case "role.webhook":
      return await callRoleWebhook(args);       // picks 1 of 3 urls by role
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```

**Role webhooks**:

```ts
const WEBHOOKS = {
  board: Deno.env.get("WEBHOOK_BOARD"),
  exec:  Deno.env.get("WEBHOOK_EXEC"),
  admin: Deno.env.get("WEBHOOK_ADMIN"),
};

async function callRoleWebhook({ role, payload }) {
  const url = WEBHOOKS[role];
  if (!url) throw new Error(`No webhook for role ${role}`);
  const res = await fetch(url, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(payload) });
  return await res.json();
}
```

**RAG search** (row-scoped):

```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE")!);

async function ragSearch({ role, query }) {
  // Example: query a `chunks` view that is already filtered by RLS
  const { data, error } = await supabase.rpc("search_chunks", { q: query }); // or SQL/embedding match
  if (error) throw error;
  return data;
}
```

> Keep business logic in tools; the **agent** decides *when* to call them. With CopilotKit + AG-UI, these tools are automatically exposed to the model with signatures/docstrings. ([GitHub][3])

### 7) Document ingestion (n8n) as a tool + status events

* Keep your upload → Supabase bucket → Edge Function trigger → n8n pipeline.
* While n8n runs, **emit AG-UI status events** back to the chat so users see progress:

```ts
// during ingestion
emit({ type: "status.update", message: "Extracting text…" });
emit({ type: "status.update", message: "Embedding 14 pages…" });
emit({ type: "status.update", message: "Applying role ACLs…" });
```

AG-UI supports arbitrary custom events; your UI will render them as system messages or toasts. ([docs.ag-ui.com][2])

---

## C. Data security — keep & tighten RLS

### 8) Tables (example)

* `documents(id, owner_id, role_access text[])`
* `chunks(id, doc_id, embedding vector, …)`
* `profiles(id, role)`
* `role_access` is an array like `{board,exec}`

### 9) RLS policies (sketch)

```sql
-- Enable RLS
alter table documents enable row level security;
alter table chunks enable row level security;

-- Who can see a doc?
create policy "doc role read"
on documents for select
to authenticated
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and p.role = any(documents.role_access)
  )
);

-- Chunks inherit doc visibility
create policy "chunk role read"
on chunks for select
to authenticated
using (
  exists (
    select 1 from documents d
    where d.id = chunks.doc_id
      and exists (
        select 1 from profiles p
        where p.id = auth.uid()
          and p.role = any(d.role_access)
      )
  )
);
```

Because RLS enforces access at the DB, **the same system prompt** can be used across roles; the data boundary is guaranteed by Supabase. (This mirrors your current intent; we’re making it explicit & central.)

---

# 4) Prompts & AG-UI tool definitions

Keep a single **system prompt** but give the model tool schemas and the **user role** from context. In CopilotKit you typically describe tools using TS/JS objects or decorators; CopilotKit exposes them to the LLM and wires invocations to `handleTool`. ([GitHub][3])

Example tool schema (conceptual):

```ts
registerTool({
  name: "rag.search",
  description: "Search role-scoped knowledge base and return citations",
  parameters: {
    type: "object",
    properties: { query: { type: "string" } },
    required: ["query"]
  }
});
```

---

# 5) Routing your three role webhooks

In your **assistant policy** / tool docs, describe the decision logic plainly:

> “When the user intent is *policy decision*, call `role.webhook` with the session’s `role` and the structured payload. For file questions, prefer `rag.search` first; escalate with `role.webhook` only when a decision is required.”

This yields deterministic behavior without forking prompts per role.

---

# 6) Frontend replacements (component by component)

| Old piece                        | New piece                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Custom chat input + message list | `<CopilotChat />` (CopilotKit UI) with streaming                                                                   |
| Upload button logic              | Keep your upload → bucket; add an action `/upload` that sends a status event and triggers `ingest.fromUpload` tool |
| Typing indicator / tool results  | AG-UI streaming events → render as assistant messages + tool result bubbles                                        |
| Role switches                    | Hide in UI; role comes from Supabase session and is attached as `context.role`                                     |

CopilotKit gives you a production-ready chat + sidebar; if you want full control, you can build your own headless UI while still speaking AG-UI. ([GitHub][3])

---

# 7) DevOps & wiring

* **Env**: keep `WEBHOOK_BOARD/EXEC/ADMIN`, `SUPABASE_SERVICE_ROLE` (functions-only), LLM keys.
* **Transport**: Use **SSE** for now; AG-UI supports others if you later swap (WebSockets, etc.). ([docs.ag-ui.com][2])
* **Local**: Vite dev server proxies `/api/agui` → local Edge Function emulator.
* **Prod**: Deploy Edge Functions; point `runtimeUrl` accordingly.

---

# 8) Migration checklist

* [ ] Install CopilotKit; wrap provider; mount `<CopilotChat/>`. ([npm][5])
* [ ] Implement `/agui` Edge Function that streams AG-UI events. ([GitHub][4])
* [ ] Register tools: `rag.search`, `ingest.fromUpload`, `role.webhook`.
* [ ] Pass `userId` + `role` context from Supabase to backend.
* [ ] Harden RLS policies for `documents` & `chunks`.
* [ ] Emit ingestion status updates as AG-UI events.
* [ ] Test each role end-to-end (upload → ingest → ask → webhook).
* [ ] Log and observe (Edge Function logs + n8n run history).

---

# 9) Gotchas & tips

* **Auth propagation:** forward the Supabase JWT to Edge Functions (Authorization header) so RLS applies.
* **Tool determinism:** keep tools **narrow** and **pure**; return structured JSON; let the UI format.
* **Backpressure:** SSE is fine for ≤ few concurrent streams; if you expect many, plan WebSocket transport later (AG-UI is transport-agnostic). ([docs.ag-ui.com][2])
* **Fallbacks:** if a tool errors, emit an AG-UI `status.update` and a friendly assistant reply; don’t break the stream.

---

## References (for your team)

* **CopilotKit** (React UI + agentic framework; supports AG-UI) – quickstart & UI docs. ([GitHub][3])
* **AG-UI Protocol** (event types, transports, quickstarts; OSS) – docs & GitHub. ([docs.ag-ui.com][2])
* (Optional background) Other ecosystems acknowledging AG-UI integration. ([ai.pydantic.dev][6])

---


[1]: https://www.copilotkit.ai/?utm_source=chatgpt.com "CopilotKit | The Agentic Framework for In-App AI Copilots"
[2]: https://docs.ag-ui.com/introduction?utm_source=chatgpt.com "AG-UI Overview - Agent User Interaction Protocol"
[3]: https://github.com/CopilotKit/CopilotKit?utm_source=chatgpt.com "GitHub - CopilotKit/CopilotKit: React UI + elegant infrastructure for ..."
[4]: https://github.com/ag-ui-protocol/ag-ui/?utm_source=chatgpt.com "AG-UI: The Agent-User Interaction Protocol - GitHub"
[5]: https://www.npmjs.com/package/%40copilotkit/react-ui?utm_source=chatgpt.com "@copilotkit/react-ui - npm"
[6]: https://ai.pydantic.dev/ag-ui/?utm_source=chatgpt.com "Agent-User Interaction (AG-UI) - Pydantic AI"
