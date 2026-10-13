import { addDays, format, parseISO, isValid } from "date-fns";
export function shiftDate(date: string, days: number) {
  return format(addDays(parseISO(date), days), "yyyy-MM-dd");
}
export function lagosDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function validDate(date: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    isValid(parseISO(date)) &&
    format(parseISO(date), "yyyy-MM-dd") === date
  );
}
export function schedule<T extends { estimatedMinutes: number }>(
  lessons: T[],
  startDate: string,
  duration: number,
) {
  const total = lessons.reduce(
    (sum, lesson) => sum + lesson.estimatedMinutes,
    0,
  );
  let cumulative = 0;
  return lessons.map((lesson, order) => {
    cumulative += lesson.estimatedMinutes;
    return {
      ...lesson,
      order,
      dueDate: shiftDate(
        startDate,
        Math.max(0, Math.ceil((cumulative / total) * duration) - 1),
      ),
    };
  });
}
export function progress(
  plan: {
    startDate: string;
    milestones: {
      estimatedMinutes: number;
      dueDate: string;
      completedAt: string | null;
    }[];
  },
  today: string,
) {
  const total = plan.milestones.reduce((s, m) => s + m.estimatedMinutes, 0);
  const completed = plan.milestones.reduce(
    (s, m) => s + (m.completedAt ? m.estimatedMinutes : 0),
    0,
  );
  const overdue = plan.milestones.filter(
    (m) => !m.completedAt && m.dueDate < today,
  ).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const status =
    total && completed === total
      ? "Completed"
      : today < plan.startDate
        ? "Not started"
        : overdue
          ? "Behind"
          : "On track";
  return { total, completed, overdue, percent, status };
}
