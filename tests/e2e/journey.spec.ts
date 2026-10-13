import { test, expect } from "@playwright/test";
test("complete learning journey, persistence, review invalidation and reminder recovery", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Enter as demo learner" }).click();
  await expect(
    page.getByRole("heading", { name: "A little wiser, every day." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Demo controls" }).click();
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset demo", exact: true })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByLabel("Prepared AI mode").check();
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  for (const topic of [
    "Web development",
    "Data analysis",
    "Digital marketing",
  ]) {
    await page.getByLabel("What are you curious about?").selectOption(topic);
    await page.getByRole("button", { name: "Find my resources" }).click();
    await expect(page.locator(".resource-card")).toHaveCount(3);
    await expect(
      page.getByText("Prepared demo", { exact: true }),
    ).toBeVisible();
  }
  await page
    .getByLabel("What are you curious about?")
    .selectOption("Web development");
  await page
    .getByRole("button", { name: "Your first page, from scratch", exact: true })
    .click();
  await page.getByRole("button", { name: "Summarize reviews" }).click();
  await expect(
    page.getByRole("heading", { name: "What learners appreciate" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Add to learning plan", exact: true })
    .click();
  await page
    .getByLabel("What would you like to achieve?")
    .fill("Build my first webpage");
  await page.getByLabel("Duration in days").fill("3");
  await page.getByRole("button", { name: "Create my learning plan" }).click();
  await expect(
    page.getByRole("heading", { name: "Build my first webpage" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open lesson", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Use paragraph 1", exact: true })
    .click();
  for (const action of ["Summarize", "Rephrase", "Explain"]) {
    await page.getByRole("button", { name: action, exact: true }).click();
    await expect(page.locator(".assist-answer p")).toBeVisible();
  }
  await page
    .getByRole("button", { name: "Mark complete", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Completed · Reopen" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".stats").getByText("1 milestones")).toBeVisible();
  await page.getByRole("button", { name: "Demo controls" }).click();
  await page.getByRole("button", { name: "+3 days", exact: true }).click();
  await expect(page.getByText("A gentle nudge", { exact: true })).toBeVisible();
  await expect(page.locator(".status.behind")).toBeVisible();
  await page
    .getByRole("button", { name: "Resume learning", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mark complete", exact: true })
    .click();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.getByRole("button", { name: "Restore date", exact: true }).click();
  await expect(
    page.getByText("A gentle nudge", { exact: true }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  await page
    .getByRole("button", { name: "Your first page, from scratch", exact: true })
    .click();
  await page
    .getByLabel("Your perspective")
    .fill("More worked examples would help me practice what I learned.");
  await page.getByRole("button", { name: "Save review", exact: true }).click();
  await expect(page.getByText("Your review", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Summarize reviews", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "AI is unavailable" }),
  ).toBeVisible();
});
test("API validation, reminders deduplicate and completion is idempotent", async ({
  request,
}) => {
  await request.post("/api/demo/session");
  expect(
    (
      await request.post("/api/demo/clock", {
        headers: { origin: "https://unrelated.example" },
        data: { action: "restore" },
      })
    ).status(),
  ).toBe(403);
  await request.post("/api/demo/reset", { data: { confirm: true } });
  expect(
    (
      await request.post("/api/plans", {
        data: {
          title: "Bad",
          resourceIds: ["web-foundations"],
          startDate: "2026-02-30",
          duration: 0,
        },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/assist", {
        data: {
          resourceId: "web-foundations",
          lessonId: "web-foundations-1",
          selected: "invented",
          action: "explain",
        },
      })
    ).status(),
  ).toBe(400);
  const noMatch = await request.post("/api/recommendations", {
    data: { topic: "Unknown" },
  });
  expect((await noMatch.json()).recommendations).toEqual([]);
  const state = await (await request.get("/api/demo/state")).json();
  const response = await request.post("/api/plans", {
    data: {
      title: "Idempotent journey",
      resourceIds: ["web-foundations"],
      startDate: state.today,
      duration: 1,
    },
  });
  expect(response.status()).toBe(201);
  const plan = await response.json();
  const url = `/api/plans/${plan.id}/milestones/${plan.milestones[0].id}`;
  await request.patch(url, { data: { completed: true } });
  await request.patch(url, { data: { completed: true } });
  const after = await (await request.get(`/api/plans/${plan.id}`)).json();
  expect(after.progress.completed).toBe(15);
  await request.post("/api/demo/clock", { data: { action: "advance" } });
  const first = await (await request.get("/api/reminders")).json();
  const second = await (await request.get("/api/reminders")).json();
  expect(first).toHaveLength(1);
  expect(second[0].id).toBe(first[0].id);
  await request.patch(`/api/reminders/${first[0].id}`, { data: {} });
  expect(await (await request.get("/api/reminders")).json()).toHaveLength(0);
  await request.post("/api/demo/clock", { data: { action: "restore" } });
  expect(await (await request.get("/api/reminders")).json()).toHaveLength(0);
  await request.post("/api/demo/reset", { data: { confirm: true } });
});

test("mobile discovery and plan form fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Enter as demo learner" }).click();
  await expect(
    page.getByRole("heading", { name: "A little wiser, every day." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  await expect(page.locator(".resource-card")).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Add to plan", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Build my plan", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your learning rhythm" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
