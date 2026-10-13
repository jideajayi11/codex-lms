# Staywise repository instructions

## Approved scope

Implement the local hackathon LMS demo described in specs.md. Support resource discovery, review summaries, deterministic study plans, explicit completion, passage assistance, and in-app reminders. Mock authentication is intentional. No crawling, uploads, external notifications, real authentication, or deployment unless requested.

## Architecture

- Next.js App Router and TypeScript, Tailwind, shadcn-style UI primitives, Lucide.
- Keep components separate from server services and Prisma database access.
- API routes validate inputs with Zod and resolve the fixed learner from the server-side mock session.
- Use SQLite locally. Never commit databases, secrets, node_modules, or build artifacts.
- Keep OpenAI calls and keys on the server. Never use NEXT_PUBLIC for secrets.
- Schedule and progress are deterministic. AI cannot mutate plans or completion.
- All date rules use the single server demo clock and Africa/Lagos calendar dates.
- Label sample reviews and live, cached, or prepared AI provenance. Prepared results must match inputs; edited reviews cannot receive stale summaries.
- Preserve resource selection order. Completion is idempotent.

## Verification

After relevant changes run npm run typecheck, npm run lint, npm test, npm run test:e2e, and npm run build. E2E tests reset the local demo database; do not run them against a valued presentation state. Document live AI verification limitations honestly.

## Development

Run npm install, copy .env.example to .env, npm run db:setup, and npm run dev. Keep packages pinned and the lockfile current. Prefer small behavior-focused service tests. Do not add unrelated integrations or custom skills.
