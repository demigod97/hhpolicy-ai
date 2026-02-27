/mc# CopilotKit Implementation Plan for PolicyAi

**Date:** October 18, 2025
**Goal:** Implement proper CopilotKit Runtime API with OpenAI integration

---

## 🎯 Current Status

### What's Working
- ✅ Legacy chat mode works perfectly
- ✅ Role-based access control (5-tier hierarchy)
- ✅ n8n workflows for document processing
- ✅ Desktop view fixed (no white screen)

### What's Broken
- ❌ CopilotKit mode fails with GraphQL error
- ❌ `copilotkit-adapter` is a simple HTTP proxy (not a proper Runtime API)
- ❌ Missing GraphQL endpoint for `availableAgents` query
- ❌ Missing Server-Sent Events (SSE) streaming

### The Error
```
POST https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/copilotkit-adapter
{"operationName":"availableAgents","query":"query availableAgents {\n  availableAgents {\n    agents {\n      name\n      id\n      description\n      __typename\n    }\n    __typename\n  }\n}","variables":{}}
```

CopilotKit client expects a **GraphQL endpoint** but gets a simple JSON POST endpoint.

---

## 📋 Architecture Design

### Option 1: Custom CopilotKit-Compatible Runtime (RECOMMENDED)
Build a Deno-based runtime that implements CopilotKit's protocol:

```
┌─────────────────────────────────────────────────────────┐
│ Browser (CopilotKit React Client)                       │
│ - useCopilotChat()                                      │
│ - useCopilotAction()                                    │
└────────────┬────────────────────────────────────────────┘
             │ GraphQL + SSE
             ▼
┌─────────────────────────────────────────────────────────┐
│ Supabase Edge Function: copilotkit-runtime              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ GraphQL Layer                                       │ │
│ │ - query availableAgents                             │ │
│ │ - query executeChat (with SSE streaming)            │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Authentication & Role Management                    │ │
│ │ - Verify JWT token                                  │ │
│ │ - Get user role from Supabase                       │ │
│ │ - Apply role-based instructions                     │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ RAG Context Builder                                 │ │
│ │ - Query documents table (role-filtered)             │ │
│ │ - Retrieve relevant chunks via vector search        │ │
│ │ - Build context with citations                      │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ OpenAI Integration                                  │ │
│ │ - Stream chat completions                           │ │
│ │ - Format responses with citations                   │ │
│ │ - Handle tool/action calls                          │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
             │ (Optional fallback)
             ▼
┌─────────────────────────────────────────────────────────┐
│ n8n Workflows (for complex processing)                  │
│ - Document ingestion                                    │
│ - Metadata extraction                                   │
│ - Vector embedding generation                           │
└─────────────────────────────────────────────────────────┘
```

### Option 2: Hybrid Approach
- Use CopilotKit Cloud for basic chat
- Proxy specific actions to n8n
- Less control, simpler implementation

**Decision: Go with Option 1** for full control and better integration with existing Supabase setup.

---

## 🔧 Implementation Tasks

### Phase 1: GraphQL Endpoint (Day 1 - Morning)
**Goal:** Make CopilotKit client stop throwing GraphQL errors

1. **Create GraphQL schema**
   ```graphql
   type Agent {
     id: ID!
     name: String!
     description: String!
   }

   type AvailableAgentsResponse {
     agents: [Agent!]!
   }

   type Query {
     availableAgents: AvailableAgentsResponse!
   }
   ```

2. **Implement GraphQL resolver**
   - Parse GraphQL queries from request body
   - Return PolicyAi agents based on user role:
     - `policy-search`: Search across policy documents
     - `citation-lookup`: Find specific policy citations
     - `compliance-check`: Check policy compliance
     - `policy-summary`: Summarize policy documents

3. **Handle POST requests**
   - Check if it's a GraphQL query (`operationName`, `query` fields)
   - Route to appropriate handler

### Phase 2: SSE Streaming (Day 1 - Afternoon)
**Goal:** Enable real-time streaming of AI responses

1. **Implement SSE response format**
   ```typescript
   // SSE format
   data: {"type":"message","content":"chunk of text"}\n\n
   data: {"type":"citation","citation":{"document":"...","page":1}}\n\n
   data: {"type":"done"}\n\n
   ```

2. **Connect to OpenAI Streaming API**
   - Use `openai.chat.completions.create({ stream: true })`
   - Transform OpenAI chunks to CopilotKit format
   - Maintain SSE connection

3. **Handle connection lifecycle**
   - Keep-alive pings
   - Error handling
   - Graceful termination

### Phase 3: OpenAI Integration (Day 1 - Evening)
**Goal:** Use OpenAI for actual LLM responses

1. **Initialize OpenAI client**
   ```typescript
   import OpenAI from "npm:openai@4.71.1";
   const openai = new OpenAI({
     apiKey: Deno.env.get('OPENAI_API_KEY')
   });
   ```

2. **Build RAG context**
   - Query Supabase documents table (role-filtered)
   - Use vector similarity search for relevant chunks
   - Format as context for OpenAI

3. **Create chat completion**
   - System prompt with role instructions
   - User messages from conversation
   - RAG context as additional context
   - Stream response back via SSE

### Phase 4: Role-Based RAG (Day 2 - Morning)
**Goal:** Integrate with existing Supabase schema for role-based document access

1. **Query documents table**
   ```sql
   SELECT * FROM documents
   WHERE assigned_role IN (user_allowed_roles)
   AND embedding <-> query_embedding < threshold
   ORDER BY embedding <-> query_embedding
   LIMIT 5
   ```

2. **Build citation metadata**
   - Track which chunks came from which documents
   - Include page numbers, line numbers
   - Format for display in UI

3. **Apply role-based filtering**
   - Board: all documents
   - Executive: executive + administrative
   - Administrator: administrative only

### Phase 5: CopilotKit Actions (Day 2 - Afternoon)
**Goal:** Implement PolicyAi-specific actions

1. **Define actions in Edge Function**
   ```typescript
   const actions = [
     {
       name: "searchPolicies",
       description: "Search across policy documents",
       parameters: { query: "string", filters: "object" }
     },
     {
       name: "getCitation",
       description: "Retrieve full text of a citation",
       parameters: { documentId: "string", page: "number" }
     }
   ];
   ```

2. **Implement action handlers**
   - Execute Supabase queries
   - Call n8n workflows if needed
   - Return results to OpenAI

3. **Connect to frontend actions**
   - Match with `useCopilotKitActions` hook definitions
   - Ensure proper parameter passing

### Phase 6: Testing & Deployment (Day 2 - Evening)
**Goal:** Verify everything works end-to-end

1. **Local testing**
   - Test GraphQL endpoint
   - Test SSE streaming
   - Test role-based access
   - Test citations

2. **Deploy to Supabase**
   ```bash
   supabase functions deploy copilotkit-runtime
   ```

3. **Update frontend**
   - Change `VITE_COPILOTKIT_RUNTIME_URL` to new endpoint
   - Test in browser
   - Verify no errors

---

## 📁 File Structure

```
supabase/functions/
├── copilotkit-runtime/          # NEW: Proper CopilotKit Runtime API
│   ├── index.ts                 # Main entry point
│   ├── graphql-schema.ts        # GraphQL schema definitions
│   ├── graphql-resolvers.ts     # GraphQL query resolvers
│   ├── sse-handler.ts           # SSE streaming logic
│   ├── openai-client.ts         # OpenAI integration
│   ├── rag-builder.ts           # RAG context builder
│   ├── role-manager.ts          # Role-based access control
│   └── actions.ts               # CopilotKit actions
│
├── copilotkit-adapter/          # OLD: Keep as fallback
│   └── index.ts                 # Simple n8n proxy (legacy)
│
└── send-chat-message/           # Keep for legacy mode
    └── index.ts                 # Legacy chat endpoint
```

---

## 🔑 Environment Variables

Add to Supabase secrets:
```bash
# Already set
OPENAI_API_KEY=sk-proj-...

# New (optional)
COPILOTKIT_MODEL=gpt-4-turbo-preview
COPILOTKIT_TEMPERATURE=0.7
COPILOTKIT_MAX_TOKENS=2000
```

---

## 🎯 Success Criteria

1. ✅ CopilotKit client stops throwing GraphQL errors
2. ✅ Chat messages stream in real-time (SSE)
3. ✅ Responses include citations from policy documents
4. ✅ Role-based access control works (Board sees all, Executive sees subset)
5. ✅ Actions (search, citation lookup) work from frontend
6. ✅ No white screen on desktop
7. ✅ Toggle between Legacy and CopilotKit modes works

---

## 🚀 Rollout Strategy

### Phase 1: Development (Day 1-2)
- Build copilotkit-runtime locally
- Test with `supabase functions serve`
- Iterate until GraphQL + SSE works

### Phase 2: Staging (Day 3)
- Deploy to Supabase
- Test with `VITE_ENABLE_AG_UI=true`
- Keep legacy mode as fallback

### Phase 3: Production (Day 4)
- Enable AG-UI for power users
- Monitor for errors
- Gather feedback

---

## 📝 Next Steps

1. **Confirm approach** - User approval for Option 1
2. **Start Phase 1** - GraphQL endpoint
3. **Test incrementally** - Each phase before moving to next
4. **Deploy carefully** - Keep legacy mode working

---

**Estimated Time:** 2-3 days (16-24 hours of work)
**Complexity:** Medium-High
**Risk:** Low (legacy mode as fallback)
