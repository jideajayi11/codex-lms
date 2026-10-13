# Staywise · Learning That Stays With You

A local hackathon LMS demo that helps learners discover resources, plan achievable study milestones, understand passages, and keep moving. Built with Next.js, TypeScript, Tailwind, SQLite/Prisma, and the OpenAI Responses API.

## Start locally

Requires Node.js 22 LTS and npm.

```sh
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Open http://127.0.0.1:3000 and choose **Enter as demo learner**. SQLite persists progress in ignored `prisma/demo.db`. No external database or authentication account is required.

## AI configuration

Add `OPENAI_API_KEY` to `.env` for live AI. `OPENAI_MODEL` defaults to `gpt-4.1-mini`; use a model supporting structured Responses output available to your account. Never put the key in a NEXT_PUBLIC variable. Restart the server after environment changes.

Without a key, prepared demo responses automatically support catalog recommendations, unchanged sample-review summaries, and the first paragraph of the first foundations lesson in each topic. Other passages and edited reviews need live AI and show a retry message when unavailable. Every response displays its provenance. **Prepared AI mode** forces fixtures for rehearsal even when a key exists.

## Demo and reset

See [demo-script.md](demo-script.md). The sidebar demo controls advance the effective date by three days, restore the date, switch prepared mode, and reset data after confirmation. Dates use Africa/Lagos. The demo does not send email/push notifications; reminders are recalculated when the app is used.

`npm run db:seed` safely restores missing seed content without deleting plans. The in-app confirmed reset removes learner plans/reviews and AI caches, restores seed reviews, and resets the clock.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run start
```

The committed `.npmrc` uses the legacy peer resolver for consistent installs with npm 10; required dependencies are explicitly pinned. Compatible PostCSS and Sharp overrides are pinned to patched versions. Lint uses direct TypeScript and React Hooks rules.

Browser tests reset the demo database. Close a presentation session first. For release verification, the browser suite can also use a running production server on port 3000. Live AI is a separate manual check: unset prepared mode, open a foundations paragraph, request an explanation and confirm **Live AI**; repeat to confirm **Cached AI**. Never equate prepared tests with provider access verification.

## Project map

- `src/components`: browser interface and reusable button primitive.
- `src/app/api/[...path]`: validated server endpoints and mock session checks.
- `src/lib`: catalog, Prisma client, seed, deterministic learning rules, services, AI adapter.
- `prisma`: schema and seed entry point.
- `tests`: unit and browser scenarios.
- `specs.md`, `plan.md`, `AGENTS.md`: behavior, work checklist, and contributor instructions.

This is a local demo: one fixed learner; original text lessons; sample reviews labeled; no crawling, uploads, certificates, real authentication, or background notification delivery. Learning progress measures completed estimated effort, not time spent or proven retention outcomes. Do not expose the mock-auth server publicly.

## Verification record

Verified locally on 13 October 2026: 14 unit tests and 3 browser scenarios passed, including the full walkthrough against both development and production servers. Database setup, type checking, lint, formatting, and production build passed. The final dependency audit reported zero vulnerabilities. Desktop and mobile layouts were visually inspected. Live OpenAI access was not tested because no API key was configured.
