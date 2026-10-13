import { db } from "./db";
import { catalog, sampleReviews } from "./catalog";
export async function seed(reset = false) {
  return db.$transaction(async (tx) => {
    if (reset) {
      await tx.reminder.deleteMany();
      await tx.milestone.deleteMany();
      await tx.learningPlan.deleteMany();
      await tx.aIResult.deleteMany();
      await tx.review.deleteMany();
    }
    await tx.demoUser.upsert({
      where: { id: "demo-learner" },
      create: {
        id: "demo-learner",
        name: "Alex",
        interests: "Web development, Data analysis, Digital marketing",
      },
      update: {},
    });
    await tx.demoState.upsert({
      where: { id: "default" },
      create: { id: "default" },
      update: reset ? { dateOffset: 0, forcedFallback: false } : {},
    });
    for (const resource of catalog) {
      const { lessons, outcomes, ...data } = resource;
      await tx.resource.upsert({
        where: { id: data.id },
        create: { ...data, outcomes: JSON.stringify(outcomes) },
        update: { ...data, outcomes: JSON.stringify(outcomes) },
      });
      for (const lesson of lessons)
        await tx.lesson.upsert({
          where: { id: lesson.id },
          create: { ...lesson, resourceId: data.id },
          update: lesson,
        });
      for (const review of sampleReviews)
        await tx.review.upsert({
          where: {
            resourceId_author: { resourceId: data.id, author: review.author },
          },
          create: { ...review, resourceId: data.id, sample: true },
          update: {},
        });
    }
  });
}
