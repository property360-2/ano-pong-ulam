1. I am a dynamic, multi-stack developer — adapt to whatever stack is active in the current task. Do not assume a single tech stack.
2. Add a clear, descriptive comment above every function or component explaining what it does, what it accepts, and what it returns or renders — as long as needed to fully describe it, never cut it short just to keep it brief.
3. Every file must open with a descriptive comment block stating its purpose, what it contains, and how it fits into the broader system.
4. Use TODO:, FIXME:, and NOTE: tags consistently — never leave unexplained dead code.
5. Before creating anything new, check if a similar function, component, or utility already exists in the codebase.
6. Extract any logic used 2 or more times into a shared utility, helper, or component.
7. Every UI element must be built as a reusable atomic component — no inline one-off elements. Base HTML-level elements (eg headings, paragraphs, buttons, divs, links) must be wrapped as atoms. Composed elements (cards, form fields, nav items) are molecules. Page-level sections (navbars, sidebars, footers) are organisms. Only the top-level page/layout component should assemble and arrange these — never rebuild the same element in two places. Files should stay under necessary number of lines; if exceeded, it has more than one responsibility and must be split.
8. Follow naming conventions of the active stack — never impose one stack's conventions onto another.
9. Never hardcode secrets, tokens, URLs, or magic values — use constants files or environment variables.
10. Every async operation must have explicit error handling — no bare awaits or unhandled promise rejections.
11. Never expose raw errors, stack traces, or internal paths to the user or client — log server-side, return clean messages.
12. Separate concerns — UI, business logic, and data access must never be mixed in the same file or function.
13. All user inputs must be validated and sanitized before use — in every stack, no exceptions.
14. Never remind or suggest to commit — the developer handles all commits personally.
15. Before adding a dependency, check if the need is already covered by the current stack or can be solved in under 10 lines.
16. When a refactor is needed, flag it explicitly — don't silently restructure code mid-feature.
17. If a task is ambiguous, ask before generating large amounts of code.
18. Proactively suggest splitting or refactoring when a file mixes concerns, repeats patterns, or exceeds size limits.
19. Do not run or execute test suites automatically on the user's system unless explicitly asked, but proactively write clean unit/integration tests alongside complex business logic, helpers, and API endpoints to prevent regressions.
20. STRICT: always respond and output in english, even the user has speak tagalog or taglish 
21. be brutally honest 
22. **State & Optimistic UI Lifecycle**: Implement Optimistic UI updates for high-frequency interactions (e.g. likes, saves, follows). Always define a local state rollback mechanism to gracefully revert changes if the server-side API request fails.
23. **Race Condition & Concurrency Safeguards**: Proactively prevent race conditions in asynchronous actions (e.g. search queries, button clicks). Cancel obsolete in-flight requests using AbortController and ignore stale out-of-order API responses.
24. **Idempotent Mutations**: Design all mutation endpoints (POST/PUT/PATCH) to support idempotency (e.g. deduplication keys) to prevent duplicate resource creation in case of automatic client-side retries.
25. **Strict Schema & Contract Validation**: Use robust schema validation libraries (e.g. Zod) to strictly validate and cast request inputs and response payloads at the system boundaries.
26. **Structured Observability**: Implement structured JSON logging (with trace/correlation IDs) and track key latency metrics (p50/p95/p99) on critical endpoints rather than generic print statements or raw error dumps.
27. **Resiliency & Fault Tolerance**: Apply timeouts to all external network requests, use exponential backoff with jitter on retries for transient failures, and implement circuit breakers or clean fallback UI states.
28. **Cache Revalidation & Reconciliation**: Prefer cache-first or Stale-While-Revalidate (SWR) fetching patterns to minimize round-trips. Keep UI state reconciled with background server syncs.
29. **Zero-Downtime Database Schema Evolution**: Follow the dual-phase Expand-Contract pattern for all database migrations. Never introduce breaking schema changes or table-locking operations on live databases.
30. **Strict Authorization checks (AuthZ)**: Always verify resource ownership and access permissions on the server side before executing database mutations or exposing sensitive data. Never rely solely on client-supplied identifiers or assume authentication implies authorization.
31. **Context-Aware Pragmatism**: Apply rules 22-29 and 30 strictly to core production features, database schemas, and shared APIs. For temporary local scripts, layout mocks, or experimental prototypes, favor development speed and ignore complex architecture overhead unless requested.