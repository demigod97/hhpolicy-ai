<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# How CopilotKit integrates AG-Ul protocol end-to-end

CopilotKit provides a full-stack, end-to-end implementation of the AG-UI protocol, making it seamless for developers to connect backend AI agents and front-end UIs with real-time, event-driven interaction. Here’s how the integration works across the stack:

### 1. AG-UI Protocol: The Event-Driven Foundation

AG-UI is an open, lightweight, event-based protocol that enables bi-directional state synchronization between agents and user-facing UIs. It supports a catalog of standardized events—such as conversation start/end, tool calls, state updates, streaming output, and UI interactions—over efficient transports like HTTP, SSE, or WebSockets. This ensures consistent, real-time communication without custom APIs.[^1][^2][^3][^4]

### 2. CopilotKit’s Implementation of AG-UI

#### a) Protocol-Aware UI Components and Hooks

CopilotKit ships with ready-made React components (e.g., `CopilotSidebar`, `CopilotCard`, `CopilotActions`) and hooks (e.g., `useAGUI`, `useCopilot`) that natively speak AG-UI. These components:

- Listen for incoming JSON events from agents.
- Render cards, chat, dynamic forms, buttons, and status updates in real time based on protocol events.
- Send user-generated actions (like form submits or button clicks) back to the agent via AG-UI events.[^2][^3]


#### b) Middleware for Runtime Synchronization

CopilotKit includes a middleware runtime that translates backend agent outputs into AG-UI event sequences and streams them to the frontend. This middleware ensures every agent update (e.g., tool response, new message, agent state change) is mirrored on the UI, while all UI actions propagate to the agent layer.[^5][^6]

#### c) Multi-Agent and Tool Integration

By using the AG-UI protocol, CopilotKit allows seamless integration with frameworks like LangGraph, Mastra, CrewAI, and LlamaIndex. Backend agents only need to emit AG-UI events—CopilotKit handles visualization, state updates, and error handling automatically.[^1][^2][^5]

#### d) Copilot Cloud (Optional Hosted Layer)

For hosted apps, CopilotKit’s “Copilot Cloud” provides governance, analytics, and human-in-the-loop feedback at the protocol boundary. This layer can block forbidden actions, prevent prompt injection, and collect feedback for model fine-tuning and analytics.[^2]

### 3. Example: End-to-End AG-UI Integration Workflow

1. **Agent triggers event:** A backend agent emits an AG-UI `RUN_STARTED` → begins processing a user query.
2. **Frontend receives events:** The CopilotKit UI (using `useAGUI`) listens for `TEXT_MESSAGE_START`, `TEXT_MESSAGE_CONTENT`, and `TEXT_MESSAGE_END` as the agent replies.[^6]
3. **Interactions \& State Sync:** UI elements like buttons (`CopilotActions`) or forms can trigger `ACTION_CALL` or `FORM_SUBMIT` events, sent to the agent for further processing.
4. **Streaming and Tool Calls:** For long-running tasks, streaming updates or tool call statuses appear as cards, progress bars, or checklist items in real time.[^3]
5. **Finalization:** Upon `RUN_FINISHED`, the UI updates to show completion, actions taken, or next steps by streaming a completion event through AG-UI.

### 4. Ease of Use

Developers can scaffold a full AG-UI–ready agent app in minutes:

- Use CLI tools (`npx create-agui-app`)
- Drop in CopilotKit components in a Next.js/React app; just configure the agent backend endpoint and AG-UI handles the rest.[^3][^2]

***

In summary, **CopilotKit fully integrates the AG-UI protocol at all levels**: middleware (communication \& translation), React components (interpret \& render events), hooks (state management), and optional hosted controls (security \& analytics). This end-to-end pipeline creates production-ready, agentic UIs with robust real-time agent-human interaction and minimal manual wiring.[^5][^1][^2][^3]
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://www.youtube.com/watch?v=AtBKlZ1ApVw

[^2]: https://www.copilotkit.ai/ag-ui

[^3]: https://zediot.com/blog/ag-ui-copilotkit-quick-start/

[^4]: https://docs.ag-ui.com

[^5]: https://docs.ag2.ai/latest/docs/blog/2025/05/07/AG2-Copilot-Integration/

[^6]: https://www.copilotkit.ai/blog/how-to-add-a-frontend-to-any-ag2-agent-using-ag-ui-protocol

[^7]: https://www.copilotkit.ai/blog/ag-ui-protocol-bridging-agents-to-any-front-end

[^8]: https://www.copilotkit.ai/blog/introducing-ag-ui-the-protocol-where-agents-meet-users

[^9]: https://www.llamaindex.ai/blog/announcing-easy-agentic-frontends-with-ag-ui-and-copilotkit

[^10]: https://developers.googleblog.com/en/delight-users-by-combining-adk-agents-with-fancy-frontends-using-ag-ui/

[^11]: https://github.com/ag-ui-protocol/ag-ui

[^12]: https://www.copilotkit.ai/blog/build-a-fullstack-stock-portfolio-agent-with-llamaindex-and-ag-ui

[^13]: https://www.youtube.com/watch?v=tcLOncrG_ec

[^14]: https://ai.pydantic.dev/ag-ui/

[^15]: https://ai.plainenglish.io/copilotkit-ag-ui-integrating-langgraph-with-next-js-and-fastapi-435cac2df56b

[^16]: https://dev.to/copilotkit/introducing-ag-ui-the-protocol-where-agents-meet-users-10gp

