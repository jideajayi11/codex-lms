import { describe, it, expect } from "vitest";
import {
  schedule,
  progress,
  shiftDate,
  validDate,
  lagosDate,
} from "../src/lib/learning";
import {
  preparedPassage,
  preparedReview,
  recommendationSchema,
  validRecommendations,
} from "../src/lib/ai";
import { catalog, sampleReviews } from "../src/lib/catalog";
describe("calendar and weighted scheduling", () => {
  it("includes the start date and stays within duration", () => {
    const result = schedule(
      [
        { estimatedMinutes: 10 },
        { estimatedMinutes: 20 },
        { estimatedMinutes: 30 },
      ],
      "2026-10-13",
      6,
    );
    expect(result.map((m) => m.dueDate)).toEqual([
      "2026-10-13",
      "2026-10-15",
      "2026-10-18",
    ]);
    expect(shiftDate("2026-12-31", 1)).toBe("2027-01-01");
  });
  it("puts all lessons on the start date for a one-day plan", () => {
    expect(
      schedule(
        [{ estimatedMinutes: 15 }, { estimatedMinutes: 20 }],
        "2026-10-13",
        1,
      ).map((m) => m.dueDate),
    ).toEqual(["2026-10-13", "2026-10-13"]);
  });
  it("validates leap days and uses Lagos at a UTC boundary", () => {
    expect(validDate("2026-02-30")).toBe(false);
    expect(validDate("2028-02-29")).toBe(true);
    expect(lagosDate(new Date("2026-10-12T23:30:00Z"))).toBe("2026-10-13");
  });
});
describe("progress", () => {
  const plan = {
    startDate: "2026-10-13",
    milestones: [
      { estimatedMinutes: 10, dueDate: "2026-10-13", completedAt: null },
      { estimatedMinutes: 30, dueDate: "2026-10-15", completedAt: null },
    ],
  };
  it("does not mark a lesson due today as overdue", () => {
    expect(progress(plan, "2026-10-13").status).toBe("On track");
    expect(progress(plan, "2026-10-12").status).toBe("Not started");
    expect(progress(plan, "2026-10-14").overdue).toBe(1);
  });
  it("weights completion by effort and resolves overdue work", () => {
    const completed = {
      ...plan,
      milestones: plan.milestones.map((m, i) => ({
        ...m,
        completedAt: i === 0 ? "2026-10-14" : null,
      })),
    };
    expect(progress(completed, "2026-10-14")).toMatchObject({
      percent: 25,
      overdue: 0,
      status: "On track",
    });
    expect(
      progress(
        {
          ...completed,
          milestones: completed.milestones.map((m) => ({
            ...m,
            completedAt: "2026-10-14",
          })),
        },
        "2026-10-20",
      ).status,
    ).toBe("Completed");
  });
});
describe("AI grounding and fixture boundaries", () => {
  it("rejects malformed, invented, or duplicate recommendations", () => {
    expect(
      recommendationSchema.safeParse({ recommendations: [{ reason: "x" }] })
        .success,
    ).toBe(false);
    expect(
      validRecommendations(
        { recommendations: [{ resourceId: "invented", reason: "x" }] },
        ["known"],
      ),
    ).toBe(false);
    expect(
      validRecommendations(
        {
          recommendations: [
            { resourceId: "known", reason: "x" },
            { resourceId: "known", reason: "y" },
          ],
        },
        ["known"],
      ),
    ).toBe(false);
  });
  it("has three distinct fixture actions for each foundations passage", () => {
    for (const id of [
      "web-foundations",
      "data-foundations",
      "marketing-foundations",
    ]) {
      const lesson = catalog.find((r) => r.id === id)!.lessons[0];
      const selected = lesson.text.split("\n\n")[0];
      const answers = ["summarize", "rephrase", "explain"].map(
        (a) => preparedPassage(lesson.id, selected, a)?.answer,
      );
      expect(new Set(answers).size).toBe(3);
      expect(answers.every(Boolean)).toBe(true);
      expect(
        preparedPassage(lesson.id, "invented passage", "explain"),
      ).toBeNull();
    }
  });
  it("does not use a prepared summary after reviews change", () => {
    const reviews = sampleReviews.map((r) => ({ ...r, sample: true }));
    expect(preparedReview(reviews)).not.toBeNull();
    expect(
      preparedReview([
        ...reviews,
        { author: "Alex", rating: 1, text: "Changed reviews", sample: false },
      ]),
    ).toBeNull();
    expect(
      preparedReview(
        reviews.map((r, i) => (i === 0 ? { ...r, text: "edited" } : r)),
      ),
    ).toBeNull();
  });
  it("seeds complete, consistent resource estimates", () => {
    expect(catalog).toHaveLength(9);
    for (const r of catalog) {
      expect(r.lessons).toHaveLength(3);
      expect(r.lessons.reduce((s, l) => s + l.estimatedMinutes, 0)).toBe(
        r.estimatedMinutes,
      );
    }
  });
});
