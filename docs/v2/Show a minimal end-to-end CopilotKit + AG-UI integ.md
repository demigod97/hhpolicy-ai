<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Show a minimal end-to-end CopilotKit + AG-UI integration example (using with supabase, and n8n document processing - via supabase edge functions )

Here is a minimal, end-to-end example of integrating CopilotKit (with AG-UI protocol) alongside Supabase for storage/auth and Supabase Edge Functions as a bridge to an n8n document processing workflow. This gives you a solid blueprint for an agentic app with real-time UI, secure user management, and automated document flows.

***

### Prerequisites

- Next.js + TypeScript app
- Packages: `@copilotkit/react-core`, `@copilotkit/react-ui`, `@supabase/supabase-js`
- A deployed n8n instance for document processing
- Supabase instance with Edge Functions enabled

***

### 1. Set Up CopilotKit with AG-UI

Install:

```bash
npm install @copilotkit/react-core @copilotkit/react-ui @supabase/supabase-js
```

Add CopilotKit to your Next.js app:

```tsx
// app/copilot-provider.tsx
import { CopilotProvider } from "@copilotkit/react-core";

export default function CopilotRoot({ children }) {
  return <CopilotProvider>{children}</CopilotProvider>;
}
```

Insert `<CopilotRoot>` high in your component tree.

***

### 2. Integrate Supabase Auth \& Storage

```tsx
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

Authentication and file upload in your UI:

```tsx
// components/FileUploader.tsx
import { supabase } from "../lib/supabase";
function FileUploader() {
  const handleUpload = async (event) => {
    let file = event.target.files[^0];
    await supabase.storage.from("documents").upload(`public/${file.name}`, file);
    // Now trigger the workflow (below)
  };
  return <input type="file" onChange={handleUpload} />;
}
```


***

### 3. Supabase Edge Function as n8n Proxy

Write an Edge Function that relays file info to n8n:

```ts
// supabase/functions/handle-document.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { filePath, userId } = await req.json();

  // Call your n8n webhook (document processor)
  const resp = await fetch("https://your-n8n/webhook/process-document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filePath, userId }),
  });
  const n8nResult = await resp.json();
  return new Response(JSON.stringify(n8nResult), { headers: { "Content-Type": "application/json" } });
});
```

Invoke it in your frontend:

```js
await supabase.functions.invoke("handle-document", {
  body: { filePath: `public/${file.name}`, userId: session.user.id },
});
```


***

### 4. Agent-UI Integration

Use CopilotKit’s React hooks to represent the process and update UI as the document is processed:

```tsx
import { useCopilot } from "@copilotkit/react-core";
function DocumentProcessingAgent() {
  const { sendMessage, messages } = useCopilot({
    endpoint: "/api/copilot-agent", // Your backend implements AG-UI event bridge
  });

  const handleFileProcess = (filePath) => {
    sendMessage({
      type: "DOC_PROCESS",
      payload: { filePath },
    });
  };

  return (
    <div>
      <FileUploader onUpload={handleFileProcess} />
      <ul>
        {messages.map((msg) => <li key={msg.id}>{msg.content}</li>)}
      </ul>
    </div>
  );
}
```


***

### High-Level Flow

1. **User authenticates and uploads a document.**
2. **Supabase Edge Function** fires, relaying the upload to n8n for processing.
3. **n8n processes** (OCR, summarization, etc) and returns results via Edge Function.
4. **CopilotKit/AG-UI** reflects document state and updates to the user in real time (progress, errors, completion).

***

This stack gives you:

- Secure handling/authentication (Supabase)
- Scalable document automation (n8n via Edge Functions)
- Real-time, context-rich agent UX (CopilotKit + AG-UI)

Resources for deeper reference:

- CopilotKit agents with Next.js \& Supabase:[^1]
- Supabase Edge Function usage:[^2][^3]
- n8n as a serverless task/AI pipeline engine:[^4][^5]
- AG-UI + CopilotKit architecture:[^6]

This arrangement is fully modular – swap in your agent logic or doc pipeline, and let CopilotKit manage agent-UIs and workflow display without boilerplate.
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^20][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://dev.to/copilotkit/im-building-an-ai-powered-blog-nextjs-langchain-supabase-5145

[^2]: https://dev.to/po8rewq/supabase-edge-functions-a-quick-start-a3p

[^3]: https://supabase.com/docs/guides/functions

[^4]: https://n8n.io/integrations/docupilot/and/flow/

[^5]: https://zediot.com/blog/n8n-workflows-ag-ui-integration/

[^6]: https://dev.to/zediot/-ag-ui-copilotkit-a-quick-start-for-developers-4mj

[^7]: https://www.copilotkit.ai/blog/ag-ui-protocol-bridging-agents-to-any-front-end

[^8]: https://www.copilotkit.ai/blog/introducing-ag-ui-the-protocol-where-agents-meet-users

[^9]: https://supabase.com/blog/supabase-ui-platform-kit

[^10]: https://joshuaberkowitz.us/blog/news-1/supabase-ui-platform-kit-accelerates-platform-development-with-ready-made-components-535

[^11]: https://www.linkedin.com/posts/abdusk_n8n-agenticai-githubcopilot-activity-7339799138978435072-xnt7

[^12]: https://www.linkedin.com/posts/svpino_a-massive-repository-with-end-to-end-examples-activity-7374461750299004930-mv8P

[^13]: https://github.com/jrhicks/minimal-copilotkit-langgraph

[^14]: https://www.youtube.com/watch?v=Tkk1UXXR3xw

[^15]: https://dev.to/zediot/integrating-ag-ui-with-n8n-smarter-visual-workflows-for-developers-3ci8

[^16]: https://www.copilotkit.ai/ag-ui

[^17]: https://supabase.com/docs/guides/getting-started/ai-prompts/edge-functions

[^18]: https://www.youtube.com/watch?v=AtBKlZ1ApVw

[^19]: https://duggan.ie/posts/hacking-together-a-job-runner-using-supabase-edge-functions

[^20]: https://www.youtube.com/watch?v=kpaz404HH0Q

