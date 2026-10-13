import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { topics } from "@/lib/catalog";
import { validDate, progress } from "@/lib/learning";
import { seed } from "@/lib/seed";
import {
  clock,
  getPlans,
  createPlan,
  refreshReminders,
  planInclude,
} from "@/lib/services";
import {
  runAI,
  recommendationSchema,
  reviewSchema,
  assistSchema,
  preparedReview,
  preparedPassage,
  validRecommendations,
  AIUnavailable,
} from "@/lib/ai";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const idSchema = z.string().min(1).max(100);
async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const route = path.join("/");
    const method = req.method;
    if (route === "demo/session" && method === "POST") {
      const response = NextResponse.json({ id: "demo-learner", name: "Alex" });
      response.cookies.set("staywise-demo", "demo-learner", {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure:
          process.env.NODE_ENV === "production" &&
          req.nextUrl.protocol === "https:",
      });
      return response;
    }
    if (method !== "GET") {
      const origin = req.headers.get("origin");
      if (
        origin &&
        origin !== `${req.nextUrl.protocol}//${req.headers.get("host")}`
      )
        throw new HttpError(403, "Cross-origin request rejected.");
    }
    if (req.cookies.get("staywise-demo")?.value !== "demo-learner")
      throw new HttpError(401, "Enter as the demo learner to continue.");
    const body = async () => {
      try {
        return await req.json();
      } catch {
        throw new HttpError(400, "Send a valid JSON request.");
      }
    };
    if (route === "demo/state" && method === "GET")
      return NextResponse.json(await clock());
    if (route === "resources" && method === "GET")
      return NextResponse.json(
        await db.resource.findMany({
          include: { lessons: { orderBy: { order: "asc" } }, reviews: true },
        }),
      );
    if (path[0] === "resources" && path.length === 2 && method === "GET") {
      const resource = await db.resource.findUnique({
        where: { id: path[1] },
        include: { lessons: { orderBy: { order: "asc" } }, reviews: true },
      });
      if (!resource) throw new HttpError(404, "Resource not found.");
      return NextResponse.json(resource);
    }
    if (route === "recommendations" && method === "POST") {
      const input = z
        .object({
          topic: z.string().trim().min(1).max(100),
          sector: z.string().max(100).optional(),
        })
        .parse(await body());
      const candidates = await db.resource.findMany({
        where: {
          topic: input.topic,
          ...(input.sector ? { sector: input.sector } : {}),
        },
      });
      if (!candidates.length)
        return NextResponse.json({
          recommendations: [],
          supportedTopics: topics,
          provenance: "prepared",
        });
      const prepared = {
        recommendations: candidates.slice(0, 3).map((r) => ({
          resourceId: r.id,
          reason: `A beginner-friendly ${r.sector.toLowerCase()} resource: ${r.description}`,
        })),
      };
      return NextResponse.json(
        await runAI(
          "recommendations",
          { ...input, candidates },
          recommendationSchema,
          prepared,
          (v) =>
            validRecommendations(
              v,
              candidates.map((r) => r.id),
            ),
        ),
      );
    }
    if (
      path[0] === "resources" &&
      path[2] === "review-summary" &&
      path.length === 3 &&
      method === "POST"
    ) {
      const resource = await db.resource.findUnique({
        where: { id: path[1] },
        include: { reviews: { orderBy: { author: "asc" } } },
      });
      if (!resource) throw new HttpError(404, "Resource not found.");
      if (!resource.reviews.length)
        return NextResponse.json({
          strengths: [],
          limitations: [],
          audience: "No reviews yet.",
          provenance: "prepared",
        });
      return NextResponse.json(
        await runAI(
          "reviews",
          { resourceId: resource.id, reviews: resource.reviews },
          reviewSchema,
          preparedReview(resource.reviews),
        ),
      );
    }
    if (
      path[0] === "resources" &&
      path[2] === "review" &&
      path.length === 3 &&
      method === "PUT"
    ) {
      const input = z
        .object({
          rating: z.number().int().min(1).max(5),
          text: z.string().trim().min(10).max(1000),
        })
        .parse(await body());
      if (!(await db.resource.findUnique({ where: { id: path[1] } })))
        throw new HttpError(404, "Resource not found.");
      const review = await db.$transaction(async (tx) => {
        const r = await tx.review.upsert({
          where: { resourceId_author: { resourceId: path[1], author: "Alex" } },
          create: { resourceId: path[1], author: "Alex", ...input },
          update: input,
        });
        await tx.aIResult.deleteMany({ where: { task: "reviews" } });
        return r;
      });
      return NextResponse.json(review);
    }
    if (route === "plans" && method === "GET")
      return NextResponse.json(await getPlans());
    if (route === "plans" && method === "POST") {
      const input = z
        .object({
          title: z.string().trim().min(3).max(100),
          resourceIds: z
            .array(idSchema)
            .min(1)
            .max(9)
            .refine(
              (ids) => new Set(ids).size === ids.length,
              "Choose each resource once.",
            ),
          startDate: z.string().refine(validDate, "Use a valid start date."),
          duration: z.number().int().min(1).max(365),
        })
        .parse(await body());
      if (
        (await db.resource.count({
          where: { id: { in: input.resourceIds } },
        })) !== input.resourceIds.length
      )
        throw new HttpError(400, "Choose resources from the catalog.");
      return NextResponse.json(await createPlan(input), { status: 201 });
    }
    if (path[0] === "plans" && path.length === 2 && method === "GET") {
      const plan = await db.learningPlan.findFirst({
        where: { id: path[1], userId: "demo-learner" },
        include: planInclude,
      });
      if (!plan) throw new HttpError(404, "Plan not found.");
      const { today } = await clock();
      return NextResponse.json({ ...plan, progress: progress(plan, today) });
    }
    if (
      path[0] === "plans" &&
      path[2] === "milestones" &&
      path.length === 4 &&
      method === "PATCH"
    ) {
      const input = z.object({ completed: z.boolean() }).parse(await body());
      const milestone = await db.milestone.findFirst({
        where: {
          id: path[3],
          planId: path[1],
          plan: { userId: "demo-learner" },
        },
      });
      if (!milestone) throw new HttpError(404, "Milestone not found.");
      const { today } = await clock();
      const result = await db.milestone.update({
        where: { id: milestone.id },
        data: {
          completedAt: input.completed ? milestone.completedAt || today : null,
        },
      });
      await refreshReminders();
      return NextResponse.json(result);
    }
    if (route === "assist" && method === "POST") {
      const input = z
        .object({
          resourceId: idSchema,
          lessonId: idSchema,
          selected: z.string().trim().min(1).max(2000),
          action: z.enum(["summarize", "rephrase", "explain"]),
        })
        .parse(await body());
      const lesson = await db.lesson.findFirst({
        where: { id: input.lessonId, resourceId: input.resourceId },
      });
      if (!lesson) throw new HttpError(404, "Lesson not found.");
      if (!lesson.text.includes(input.selected))
        throw new HttpError(400, "Select a passage from this lesson.");
      return NextResponse.json(
        await runAI(
          input.action,
          { ...input, context: lesson.text },
          assistSchema,
          preparedPassage(input.lessonId, input.selected, input.action),
        ),
      );
    }
    if (route === "reminders" && method === "GET")
      return NextResponse.json(await refreshReminders());
    if (path[0] === "reminders" && path.length === 2 && method === "PATCH") {
      const reminder = await db.reminder.findFirst({
        where: { id: path[1], plan: { userId: "demo-learner" } },
      });
      if (!reminder) throw new HttpError(404, "Reminder not found.");
      return NextResponse.json(
        await db.reminder.update({
          where: { id: reminder.id },
          data: { dismissed: true },
        }),
      );
    }
    if (route === "demo/clock" && method === "POST") {
      const input = z
        .object({
          action: z.enum(["advance", "restore"]).optional(),
          forcedFallback: z.boolean().optional(),
        })
        .refine((v) => v.action !== undefined || v.forcedFallback !== undefined)
        .parse(await body());
      await db.demoState.update({
        where: { id: "default" },
        data: {
          ...(input.action
            ? { dateOffset: input.action === "advance" ? { increment: 3 } : 0 }
            : {}),
          ...(input.forcedFallback !== undefined
            ? { forcedFallback: input.forcedFallback }
            : {}),
        },
      });
      await refreshReminders();
      return NextResponse.json(await clock());
    }
    if (route === "demo/reset" && method === "POST") {
      z.object({ confirm: z.literal(true) }).parse(await body());
      await seed(true);
      return NextResponse.json({ reset: true });
    }
    throw new HttpError(404, "Endpoint not found.");
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input." },
        { status: 400 },
      );
    if (error instanceof HttpError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    if (error instanceof AIUnavailable)
      return NextResponse.json({ error: error.message }, { status: 503 });
    console.error(
      "Request failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      {
        error:
          "Unable to complete this request. Check database setup and retry.",
      },
      { status: 500 },
    );
  }
}
export { handler as GET, handler as POST, handler as PUT, handler as PATCH };
