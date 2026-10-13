# Five-minute judge walkthrough

## Prepare

1. Install dependencies, set up the database, build, and run `npm run start`.
2. Open http://127.0.0.1:3000. Enter as Alex.
3. Open Demo controls, Reset demo, confirm, and enable Prepared AI mode for an offline rehearsal. For a live presentation, keep a configured API key and disable prepared mode; failures still fall back for supported demo inputs.
4. Keep a second browser window only if you need a narrow-layout demonstration. State is shared because the demo has one learner.

## Present

**0:00 — Problem.** “Having resources is not the same as continuing to learn. Staywise helps a learner find a useful starting point, make time for it, and work through difficult material.”

**0:30 — Discover.** Choose Web development, all sectors, Find my resources. Explain that recommendations come from a curated catalog, not unverified web results. Briefly switch to Data analysis and Digital marketing to show the breadth; return to Web development.

**1:15 — Decide.** Open Your first page, from scratch. Summarize reviews. Show strengths, limitations, audience fit, and the sample-review labels. Do not submit a review during the prepared-mode walkthrough: a changed review set requires live AI for a fresh summary.

**2:00 — Plan.** Add to learning plan. Name it Build my first webpage. Use the displayed current date and a three-day duration. Point to 45 minutes total, 15 minutes per day, three milestones. Save.

**2:45 — Understand.** Open the first lesson. Use paragraph 1. Summarize, Rephrase, Explain. Point out that the original passage stays visible and the AI badge accurately shows live, cached, or prepared output.

**3:30 — Progress.** Mark complete. Return to the plan or overview. Show 33% progress and explain that completion is explicit. Reload to show persistence.

**4:00 — Stay engaged.** Advance the date by three days. Show Simulated date, Behind status, and the gentle reminder. Resume learning opens the next unfinished lesson. Restore the date to return to the real schedule.

**4:45 — Theme.** “Find a starting point. Make a manageable plan. Get unstuck. Keep going. That is our approach to learning that stays with you.”

## Recovery

- API/network unavailable: enable Prepared AI mode and use the first paragraph of the first foundations lesson in any topic.
- Edited reviews: reset the demo before attempting the prepared review summary.
- Unscripted passage: show the honest retry message or switch to a supported first paragraph; do not imply a fixture is live AI.
- State from a previous run: Reset demo with confirmation, then repeat the setup.
