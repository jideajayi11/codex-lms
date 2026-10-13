export type Lesson = {
  id: string;
  resourceId: string;
  order: number;
  title: string;
  text: string;
  estimatedMinutes: number;
};
export type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  sample: boolean;
};
export type Resource = {
  id: string;
  title: string;
  topic: string;
  sector: string;
  level: string;
  description: string;
  outcomes: string;
  estimatedMinutes: number;
  source: string;
  lessons: Lesson[];
  reviews: Review[];
};
export type Milestone = {
  id: string;
  lessonId: string;
  dueDate: string;
  estimatedMinutes: number;
  completedAt: string | null;
  lesson: Lesson & { resource: Resource };
};
export type Plan = {
  id: string;
  title: string;
  startDate: string;
  finishDate: string;
  duration: number;
  milestones: Milestone[];
  progress: {
    percent: number;
    total: number;
    completed: number;
    overdue: number;
    status: string;
  };
};
export type Reminder = {
  id: string;
  message: string;
  planId: string;
  plan: Plan;
};
export type Clock = {
  today: string;
  dateOffset: number;
  forcedFallback: boolean;
};
export type Provenance = "live" | "cached" | "prepared";
export type Summary = {
  strengths: string[];
  limitations: string[];
  audience: string;
  provenance: Provenance;
};
export type Recommendations = {
  recommendations: { resourceId: string; reason: string }[];
  supportedTopics?: string[];
  provenance: Provenance;
};
