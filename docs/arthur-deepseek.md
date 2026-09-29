# Arthur and DeepSeek

Arthur is a server-mediated tutoring system. The browser sends a student question and page identifiers to `/api/arthur`; the route authenticates the session, verifies plan and assessment restrictions, resolves canonical course context from the Excelora catalogue, loads user-scoped learning evidence and conversation history, then streams a DeepSeek response as newline-delimited JSON.

## Configuration

Copy the names in `.env.example` into the deployment environment. `DEEPSEEK_API_KEY` is mandatory and must remain server-only. `DEEPSEEK_MODEL` defaults to `deepseek-flash`. Timeout and output limits have bounded environment overrides. Arthur does not retry paid provider requests automatically.

Arthur also retains the existing database allowance in `arthur_usage_settings`. Provider calls remain disabled until the owner explicitly enables that allowance and sets monthly and per-student daily request limits. This protects against accidental usage even when an API key is present.

## Provider boundary

`src/lib/ai/provider.ts` defines the small provider contract. `src/lib/ai/deepseek.ts` is the only DeepSeek transport implementation. API keys and provider errors never enter browser code. Chat uses genuine provider SSE; structured diagnostic feedback uses JSON mode and validates the result before returning it.

## Context and memory

Course context is resolved against `A_LEVEL_MATHS_SUBJECTS` and the structured lesson catalogue. Arbitrary client `pageContent` and `workspaceContext` are not trusted as canonical source material. Practice and submitted-assessment context is queried server-side and scoped to the authenticated student.

`arthur_conversations` and `arthur_messages` persist recent user-scoped conversations. The API sends only the recent message window, verified lesson context and concise learning evidence to the provider. `arthur_request_logs` records request metadata, latency, token counts and tool names—not student message content or prompts.

## Tools and personalisation

The tool registry contains bounded functions for progress, recent assessment results, weak-topic evidence and current-topic information. Tool execution always receives the authenticated user ID from the server. The model cannot provide a user ID or arbitrary SQL. Weak-topic suggestions require repeated real question evidence and are explicitly not presented as permanent mastery labels.

To add a tool, add a narrowly scoped entry to `ARTHUR_TOOLS`, validate any arguments, query only through an authenticated server context, cap result size and add a unit test. Do not expose a general-purpose query tool.

Practice-question support follows an approved-bank-first boundary in `questions.server.ts`. Approved questions can be retrieved with bounded filters. Temporary DeepSeek-generated questions use validated JSON, are labelled `temporary-ai`, omit answers from the student payload and are never inserted into the official bank automatically.

## Marking boundary

Existing deterministic marking remains authoritative. `generateDiagnosticFeedback` is an isolated, validated foundation for qualitative feedback when deterministic comparison cannot explain a free response. It does not update marks or assessment records. Connecting this fallback to production marking should happen only after a reviewed evaluation set establishes accuracy and escalation rules.

## Database setup

Apply `20261001000000_arthur_conversations.sql` after the earlier Excelora migrations. The new tables use RLS, revoke browser roles and grant access only to the service role. Deleting an auth user cascades their conversations and messages.

## Local verification

Run `npm run test:arthur`, `npm run lint`, and `npm run build`. Unit tests mock the provider and never call DeepSeek.
