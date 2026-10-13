# Staywise demo specification

## Purpose and boundaries

Local learner-centered LMS prototype for “Learning That Stays With You”. Demonstrates Access & Discovery and Engagement & Staying in the Learning Journey. One fixed learner (Alex), nine original resources, three text lessons per resource, and four sample reviews per resource. Topics: web development, data analysis, digital marketing. Sectors: technology, business, creative.

## Flows

1. Mock entry sets a same-site HTTP-only demo session.
2. Discover filters a seeded catalog by exact topic and optional sector. AI ranks only the candidates and explains relevance. Unsupported topics return supported topics and no invented results.
3. Resource detail shows learning outcomes, lesson outline, average rating, individual sample reviews, and balanced AI review summaries. Learner can create/edit one review per resource.
4. Plan creation collects goal, resources in selection order, calendar start date, and duration (1–365 days). Show total estimated minutes, lesson count, and average daily effort before submission.
5. Reader preserves the original text, accepts a highlighted substring up to 2,000 characters, and provides keyboard-accessible paragraph selection. Summarize/rephrase/explain appear beside the selection.
6. Explicit milestone completion updates persisted, effort-weighted progress. Reopening is supported.
7. Overview shows overdue reminders and resumes the first unfinished lesson. Demo controls advance date by three days, restore date, toggle prepared mode, and reset after confirmation.

## Deterministic rules

- Dates stored as YYYY-MM-DD. Real today comes from Africa/Lagos; every calculation uses today plus the persisted demo offset.
- Finish = start + duration - 1. Due-date offset = max(0, ceil(cumulative minutes / total minutes \* duration) - 1).
- Lesson order follows selected resources, then their lesson order. Short plans may have multiple milestones on one date.
- Progress = round(completed estimated minutes / total estimated minutes \* 100). It is not measured time.
- Completed takes precedence, then future-start Not started, then Behind when unfinished due date < today, otherwise On track.
- A milestone due today is not overdue. Repeated completed=true retains the original completion date.
- Reminder identity is (plan, effective date). Dismissals survive reload. Only reminders for the current effective date are visible. Resolved reminders for that date are removed.

## Data and interfaces

Prisma models: DemoUser, Resource, Lesson, Review, LearningPlan, Milestone, Reminder, AIResult, DemoState. Relations and unique constraints are in prisma/schema.prisma.

All endpoints use /api prefix; mutation input is JSON. Error shape: {error:string}. Missing mock session: 401. Invalid input: 400. Missing resource: 404. Unsupported AI input during outage: 503. Nonmatching mutation origins: 403.

| Method and path                    | Input / output                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| POST /demo/session                 | Sets fixed session; returns demo learner                                             |
| GET /demo/state                    | Effective today, offset, prepared-mode flag                                          |
| GET /resources                     | Catalog, ordered lessons, reviews                                                    |
| GET /resources/:id                 | One resource or 404                                                                  |
| POST /recommendations              | {topic,sector?}; {recommendations:[{resourceId,reason}],provenance,supportedTopics?} |
| POST /resources/:id/review-summary | {strengths,limitations,audience,provenance}                                          |
| PUT /resources/:id/review          | {rating:1..5,text:10..1000 chars}; stored learner review                             |
| GET /plans                         | Learner plans with milestones and derived progress                                   |
| POST /plans                        | {title,resourceIds,startDate,duration}; created plan                                 |
| GET /plans/:id                     | Plan with derived progress                                                           |
| PATCH /plans/:id/milestones/:id    | {completed:boolean}; stored milestone                                                |
| POST /assist                       | {resourceId,lessonId,selected,action}; {answer,provenance}                           |
| GET /reminders                     | Recomputed visible reminders with plan data                                          |
| PATCH /reminders/:id               | Dismiss reminder                                                                     |
| POST /demo/clock                   | {action?:advance or restore,forcedFallback?:boolean}; clock                          |
| POST /demo/reset                   | {confirm:true}; restores baseline, removes learner progress/reviews/cache            |

## AI reliability

OpenAI Responses API with Zod structured outputs. Model is configurable; initial default gpt-4.1-mini. Server-only API key, 12-second timeout, no automatic retries. Recommendation IDs must belong to filtered candidates and be unique. Cache validated live outputs by task and input hash. Editing reviews invalidates review caches.

Prepared mode bypasses live cache and provider. Fixtures cover supported catalog/topic/sector queries, unchanged seeded reviews, and the exact first paragraph of web-foundations-1, data-foundations-1, marketing-foundations-1 for all three assistance actions. These are explicitly labeled prepared. No fallback exists for changed reviews or arbitrary passages. No reviews returns “No reviews yet.”

## Acceptance

Unit tests cover schedule boundaries, dates, progress weighting, due-today rule, grounding and exact fixtures. E2E tests cover all topics, summary, plan creation, all three assistance modes, completion and reload, simulation, reminder deduplication/dismissal, restore date, reset, idempotency, and rejected input. Type checking, lint, unit/E2E checks, and production build must pass. Live AI requires a separate key-enabled smoke check.
