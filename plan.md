# Implementation checklist

- [x] Scaffold Next.js, TypeScript, Tailwind, UI primitives, pinned packages.
- [x] Add Prisma schema, transactional seed/reset and original lesson catalog.
- [x] Build mock session and validated JSON APIs.
- [x] Add deterministic planning, progress, date clock and reminders.
- [x] Implement catalog, review detail, study plans, reader and dashboard.
- [x] Add OpenAI adapter, structured output validation, caching and exact fixtures.
- [x] Add review writing, completion persistence, date simulation and reset confirmation.
- [x] Write unit and browser acceptance tests.
- [x] Complete type checking, lint, unit tests, browser tests and production build.
- [x] Visually inspect desktop and narrow layouts.
- [ ] Smoke-test live OpenAI with an available API key — deferred: no key configured.

Do not mark live AI verified based on prepared fixtures. E2E tests reset demo state.

Verified 13 October 2026: 14 unit tests; 3 browser scenarios passed against both development and production servers. Database setup, type checking, lint, formatting, and production build passed. Dependency audit: zero vulnerabilities.
