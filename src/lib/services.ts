import { db } from "./db";
import { lagosDate, shiftDate, progress, schedule } from "./learning";
export const planInclude = {
  milestones: {
    orderBy: { order: "asc" as const },
    include: { lesson: { include: { resource: true } } },
  },
};
export async function clock() {
  const state = await db.demoState.findUniqueOrThrow({
    where: { id: "default" },
  });
  return { ...state, today: shiftDate(lagosDate(), state.dateOffset) };
}
export async function getPlans() {
  const { today } = await clock();
  const plans = await db.learningPlan.findMany({
    where: { userId: "demo-learner" },
    include: planInclude,
    orderBy: { createdAt: "desc" },
  });
  return plans.map((p) => ({ ...p, progress: progress(p, today) }));
}
export async function createPlan(input: {
  resourceIds: string[];
  title: string;
  startDate: string;
  duration: number;
}) {
  const resources = await db.resource.findMany({
    where: { id: { in: input.resourceIds } },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
  if (resources.length !== input.resourceIds.length)
    throw new Error("Choose resources from the catalog.");
  const lessons = input.resourceIds.flatMap(
    (id) => resources.find((r) => r.id === id)!.lessons,
  );
  return db.learningPlan.create({
    data: {
      title: input.title,
      userId: "demo-learner",
      startDate: input.startDate,
      duration: input.duration,
      finishDate: shiftDate(input.startDate, input.duration - 1),
      milestones: {
        create: schedule(lessons, input.startDate, input.duration).map((m) => ({
          lessonId: m.id,
          order: m.order,
          dueDate: m.dueDate,
          estimatedMinutes: m.estimatedMinutes,
        })),
      },
    },
    include: planInclude,
  });
}
export async function refreshReminders() {
  const plans = await getPlans();
  const { today } = await clock();
  for (const plan of plans) {
    if (plan.progress.overdue)
      await db.reminder.upsert({
        where: {
          planId_effectiveDate: { planId: plan.id, effectiveDate: today },
        },
        create: {
          planId: plan.id,
          effectiveDate: today,
          message: `${plan.title}: ${plan.progress.overdue} overdue milestone${plan.progress.overdue === 1 ? "" : "s"}. A small next step can get you moving again.`,
        },
        update: {
          message: `${plan.title}: ${plan.progress.overdue} overdue milestone${plan.progress.overdue === 1 ? "" : "s"}. A small next step can get you moving again.`,
        },
      });
    else
      await db.reminder.deleteMany({
        where: { planId: plan.id, effectiveDate: today },
      });
  }
  return db.reminder.findMany({
    where: {
      effectiveDate: today,
      dismissed: false,
      plan: { userId: "demo-learner" },
    },
    include: { plan: { include: planInclude } },
  });
}
