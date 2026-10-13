"use client";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Compass,
  LayoutDashboard,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Sparkles,
  Bell,
  X,
  ChevronLeft,
  SlidersHorizontal,
  RotateCcw,
  Leaf,
  Play,
  Target,
  Star,
} from "lucide-react";
import { Button } from "./ui/button";
import { topics, sectors } from "@/lib/catalog";
import type {
  Resource,
  Plan,
  Milestone,
  Reminder,
  Clock,
  Summary,
  Recommendations,
  Provenance,
} from "@/lib/types";
async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}
function dateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
function Badge({ value }: { value: Provenance }) {
  return (
    <span className={`ai-badge ${value}`}>
      <Sparkles size={12} />
      {value === "prepared"
        ? "Prepared demo"
        : value === "cached"
          ? "Cached AI"
          : "Live AI"}
    </span>
  );
}
export default function LearningApp() {
  const [entered, setEntered] = useState(false),
    [checking, setChecking] = useState(true),
    [tab, setTab] = useState("dashboard");
  const [resources, setResources] = useState<Resource[]>([]),
    [plans, setPlans] = useState<Plan[]>([]),
    [reminders, setReminders] = useState<Reminder[]>([]),
    [clock, setClock] = useState<Clock | null>(null);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [demo, setDemo] = useState(false),
    [notice, setNotice] = useState("");
  const [topic, setTopic] = useState(topics[0]),
    [sector, setSector] = useState(""),
    [recommendationResult, setRecommendations] = useState<
      (Recommendations & { topic: string; sector: string }) | null
    >(null);
  const [resource, setResource] = useState<Resource | null>(null),
    [summaryResult, setSummary] = useState<
      (Summary & { resourceId: string }) | null
    >(null),
    [reviewText, setReviewText] = useState(""),
    [rating, setRating] = useState(5);
  const [selectedIds, setSelectedIds] = useState<string[]>([]),
    [title, setTitle] = useState("My first learning journey"),
    [start, setStart] = useState(""),
    [duration, setDuration] = useState(7);
  const [activePlan, setActivePlan] = useState<Plan | null>(null),
    [milestone, setMilestone] = useState<Milestone | null>(null),
    [passage, setPassage] = useState(""),
    [answerResult, setAnswer] = useState<{
      lessonId: string;
      selected: string;
      answer: string;
      provenance: Provenance;
    } | null>(null);
  const recommendations =
    recommendationResult?.topic === topic &&
    recommendationResult?.sector === sector
      ? recommendationResult
      : null;
  const summary =
    summaryResult?.resourceId === resource?.id ? summaryResult : null;
  const answer =
    answerResult?.lessonId === milestone?.lessonId &&
    answerResult?.selected === passage
      ? answerResult
      : null;
  const [resetConfirm, setResetConfirm] = useState(false);
  useEffect(() => {
    if (!resetConfirm) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>("[role=dialog]");
    const buttons = dialog?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[0]?.focus();
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setResetConfirm(false);
      if (e.key === "Tab" && buttons?.length) {
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, [resetConfirm]);
  const reload = useCallback(async () => {
    const [rs, ps, cs, ns] = await Promise.all([
      api<Resource[]>("resources"),
      api<Plan[]>("plans"),
      api<Clock>("demo/state"),
      api<Reminder[]>("reminders"),
    ]);
    setResources(rs);
    setPlans(ps);
    setClock(cs);
    setReminders(ns);
    setActivePlan((previous) =>
      previous ? ps.find((p) => p.id === previous.id) || null : null,
    );
    setStart((s) => s || cs.today);
    return { rs, ps };
  }, []);
  useEffect(() => {
    reload()
      .then(() => setEntered(true))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [reload]);
  async function work(key: string, fn: () => Promise<void>) {
    setBusy(key);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy("");
    }
  }
  async function enter() {
    await work("enter", async () => {
      await api("demo/session", "POST", {});
      await reload();
      setEntered(true);
    });
  }
  function navigate(next: string) {
    setTab(next);
    setResource(null);
    setMilestone(null);
    setActivePlan(null);
    setError("");
    setNotice("");
  }
  function toggle(id: string) {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }
  function openResource(r: Resource) {
    setResource(r);
    setSummary(null);
    setReviewText(r.reviews.find((x) => x.author === "Alex")?.text || "");
    setRating(r.reviews.find((x) => x.author === "Alex")?.rating || 5);
    setError("");
  }
  function openLesson(plan: Plan, m: Milestone) {
    setTab("reader");
    setResource(null);
    setActivePlan(plan);
    setMilestone(m);
    setPassage("");
    setAnswer(null);
    setError("");
  }
  async function complete() {
    if (!activePlan || !milestone) return;
    await work("complete", async () => {
      await api(`plans/${activePlan.id}/milestones/${milestone.id}`, "PATCH", {
        completed: !milestone.completedAt,
      });
      const { ps } = await reload();
      const updated = ps.find((p) => p.id === activePlan.id)!;
      setActivePlan(updated);
      setMilestone(updated.milestones.find((m) => m.id === milestone.id)!);
      setNotice(
        milestone.completedAt
          ? "Milestone reopened."
          : "One step closer. Your progress is saved.",
      );
    });
  }
  function capture() {
    const selection = window.getSelection();
    if (
      selection &&
      selection.anchorNode?.parentElement?.closest("[data-lesson-text]") &&
      selection.focusNode?.parentElement?.closest("[data-lesson-text]")
    ) {
      const text = selection.toString().trim();
      if (text) {
        setPassage(text);
        setAnswer(null);
      }
    }
  }
  const filtered = resources.filter(
    (r) => r.topic === topic && (!sector || r.sector === sector),
  );
  const picks = recommendations
    ? recommendations.recommendations
        .map((p) => ({
          resource: resources.find((r) => r.id === p.resourceId)!,
          reason: p.reason,
        }))
        .filter((p) => p.resource)
    : filtered.map((r) => ({ resource: r, reason: "" }));
  const selected = selectedIds
      .map((id) => resources.find((r) => r.id === id)!)
      .filter(Boolean),
    total = selected.reduce((s, r) => s + r.estimatedMinutes, 0);
  const active = plans.filter((p) => p.progress.status !== "Completed"),
    minutes = plans.reduce((s, p) => s + p.progress.completed, 0),
    done = plans.reduce(
      (s, p) => s + p.milestones.filter((m) => m.completedAt).length,
      0,
    );
  if (checking)
    return (
      <div className="loading-screen">
        <Leaf />
        <p>Opening your learning space…</p>
      </div>
    );
  if (!entered)
    return (
      <main className="welcome">
        <div className="welcome-art">
          <div className="brand">
            <span className="brand-icon">
              <Leaf />
            </span>
            staywise<span className="brand-dot">.</span>
          </div>
          <p className="eyebrow">A LITTLE PROGRESS, EVERY DAY</p>
          <h1>
            Learning that
            <br />
            stays with <em>you.</em>
          </h1>
          <p className="welcome-copy">
            Find your starting point. Make a little time.
            <br />
            Build something that lasts.
          </p>
          <div className="journey-art">
            <span>
              <Compass /> Discover
            </span>
            <i />
            <span>
              <CalendarDays /> Plan
            </span>
            <i />
            <span>
              <Leaf /> Grow
            </span>
          </div>
          <small>
            Hackathon demo · Access & discovery + sustained engagement
          </small>
        </div>
        <section className="welcome-form">
          <span className="pill">YOUR LEARNING COMPANION</span>
          <h2>Let’s find your next step.</h2>
          <p>
            A thoughtful space for curious people.
            <br />
            Your goals, your pace, a little help along the way.
          </p>
          <div className="demo-person">
            <span className="avatar">A</span>
            <div>
              <strong>Alex’s learning space</strong>
              <small>Demo learner · no account needed</small>
            </div>
          </div>
          <Button onClick={enter} disabled={!!busy}>
            Enter as demo learner <ArrowRight size={17} />
          </Button>
          <p className="small-muted">
            Mock sign-in. All sample reviews and prepared AI responses are
            labeled.
          </p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </section>
      </main>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand brand-button"
          onClick={() => navigate("dashboard")}
        >
          <span className="brand-icon">
            <Leaf size={23} />
          </span>
          staywise<span className="brand-dot">.</span>
        </button>
        <p className="nav-label">YOUR LEARNING SPACE</p>
        <nav>
          {[
            ["dashboard", "Overview", LayoutDashboard],
            ["discover", "Discover", Compass],
            ["plans", "My learning", BookOpen],
          ].map(([key, label, Icon]) => (
            <button
              key={String(key)}
              aria-label={String(label)}
              className={`nav-item ${tab === key ? "active" : ""}`}
              onClick={() => navigate(String(key))}
            >
              {typeof Icon !== "string" && <Icon size={19} />}
              <span>{String(label)}</span>
              {key === "plans" && <small>{plans.length}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-icon">
            <Leaf size={23} />
          </span>
          <h3>
            Small steps.
            <br />
            Lasting knowledge.
          </h3>
          <p>You don’t have to learn it all today. Just keep showing up.</p>
        </div>
        <button className="demo-toggle" onClick={() => setDemo(!demo)}>
          <SlidersHorizontal size={16} /> Demo controls{" "}
          <span>{demo ? "−" : "+"}</span>
        </button>
        <div className="profile">
          <span className="avatar">A</span>
          <div>
            <strong>Alex</strong>
            <small>Curious by nature</small>
          </div>
          <span className="online-dot" />
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>
            {tab === "dashboard"
              ? "Your overview"
              : tab === "discover"
                ? "Resource discovery"
                : tab === "reader"
                  ? "Your learning session"
                  : "Your learning journey"}
          </span>
          <div>
            <span className="date-top">
              <CalendarDays size={15} />
              {clock && dateLabel(clock.today)}
              {clock?.dateOffset !== 0 && " · Simulated date"}
            </span>
            <button
              className="bell-button"
              aria-label="Show reminders"
              onClick={() => navigate("dashboard")}
            >
              <Bell size={19} />
              {reminders.length > 0 && <i />}
            </button>
            <span className="avatar small">A</span>
          </div>
        </header>
        {demo && (
          <section className="demo-panel">
            <div>
              <strong>Presentation controls</strong>
              <small>
                {clock?.dateOffset ? "Simulated date" : "Real date"}:{" "}
                {clock?.today} · Africa/Lagos
              </small>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!!busy}
              onClick={() =>
                work("clock", async () => {
                  await api("demo/clock", "POST", { action: "advance" });
                  await reload();
                })
              }
            >
              +3 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!!busy}
              onClick={() =>
                work("clock", async () => {
                  await api("demo/clock", "POST", { action: "restore" });
                  await reload();
                })
              }
            >
              Restore date
            </Button>
            <label className="check-label">
              <input
                type="checkbox"
                checked={clock?.forcedFallback || false}
                disabled={!!busy}
                onChange={(e) => {
                  const forcedFallback = e.target.checked;
                  const previous = clock;
                  setClock((state) =>
                    state ? { ...state, forcedFallback } : state,
                  );
                  work("mode", async () => {
                    try {
                      await api("demo/clock", "POST", { forcedFallback });
                      await reload();
                    } catch (error) {
                      setClock(previous);
                      throw error;
                    }
                  });
                }}
              />{" "}
              Prepared AI mode
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResetConfirm(true)}
            >
              <RotateCcw size={14} /> Reset demo
            </Button>
          </section>
        )}
        <main className="content">
          {error && (
            <div className="error" role="alert">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div className="success" role="status">
              {notice}
            </div>
          )}
          {resource ? (
            <>
              <button className="back-link" onClick={() => setResource(null)}>
                <ChevronLeft size={16} /> Back to resources
              </button>
              <section className="resource-detail">
                <div
                  className={`resource-banner tone-${topics.indexOf(resource.topic)}`}
                >
                  <BookOpen size={44} />
                  <span>{resource.topic}</span>
                </div>
                <div>
                  <span className="eyebrow">
                    {resource.sector} · {resource.level}
                  </span>
                  <h1>{resource.title}</h1>
                  <p className="lede">{resource.description}</p>
                  <div className="meta">
                    <Clock3 size={16} />
                    {resource.estimatedMinutes} min <span>·</span>{" "}
                    {resource.lessons.length} lessons <span>·</span>
                    {resource.source}
                  </div>
                  <Button
                    onClick={() => {
                      if (!selectedIds.includes(resource.id))
                        toggle(resource.id);
                      setResource(null);
                      setTab("create");
                    }}
                  >
                    Add to learning plan <ArrowRight size={16} />
                  </Button>
                </div>
              </section>
              <div className="detail-grid">
                <section className="panel">
                  <h2>What you’ll take away</h2>
                  {(JSON.parse(resource.outcomes) as string[]).map((o) => (
                    <p className="outcome" key={o}>
                      <CheckCircle2 size={17} />
                      {o}
                    </p>
                  ))}
                  <h3 className="section-subtitle">Inside this resource</h3>
                  {resource.lessons.map((l, i) => (
                    <div className="lesson-preview" key={l.id}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{l.title}</strong>
                        <small>
                          {l.estimatedMinutes} minutes · practice included
                        </small>
                      </div>
                    </div>
                  ))}
                </section>
                <section className="panel">
                  <div className="section-heading">
                    <h2>A clearer picture</h2>
                    <Sparkles size={19} />
                  </div>
                  <p className="muted">
                    A balanced summary of learner reviews.
                  </p>
                  <Button
                    variant="outline"
                    disabled={!!busy}
                    onClick={() =>
                      work("summary", async () =>
                        setSummary({
                          ...(await api<Summary>(
                            `resources/${resource.id}/review-summary`,
                            "POST",
                            {},
                          )),
                          resourceId: resource.id,
                        }),
                      )
                    }
                  >
                    {busy === "summary"
                      ? "Reading reviews…"
                      : "Summarize reviews"}
                    <Sparkles size={15} />
                  </Button>
                  {summary && (
                    <div className="summary">
                      <Badge value={summary.provenance} />
                      <h4>What learners appreciate</h4>
                      {summary.strengths.map((s) => (
                        <p key={s}>+ {s}</p>
                      ))}
                      <h4>Things to consider</h4>
                      {summary.limitations.map((s) => (
                        <p key={s}>• {s}</p>
                      ))}
                      <h4>A good fit for</h4>
                      <p>{summary.audience}</p>
                    </div>
                  )}
                </section>
              </div>
              <section className="panel reviews">
                <div className="section-heading">
                  <h2>Learner perspectives</h2>
                  <span>
                    <Star size={15} />{" "}
                    {resource.reviews.length
                      ? (
                          resource.reviews.reduce((s, r) => s + r.rating, 0) /
                          resource.reviews.length
                        ).toFixed(1)
                      : "—"}{" "}
                    · {resource.reviews.length} reviews
                  </span>
                </div>
                <div className="review-grid">
                  {resource.reviews.map((r) => (
                    <article key={r.id}>
                      <div>
                        <strong>{r.author}</strong>
                        <small>
                          {r.sample ? "Sample review" : "Your review"}
                        </small>
                      </div>
                      <p className="stars">
                        {"★".repeat(r.rating)}
                        {"☆".repeat(5 - r.rating)}
                      </p>
                      <p>{r.text}</p>
                    </article>
                  ))}
                </div>
                <form
                  className="review-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    work("review", async () => {
                      await api(`resources/${resource.id}/review`, "PUT", {
                        rating,
                        text: reviewText,
                      });
                      const { rs } = await reload();
                      setResource(rs.find((r) => r.id === resource.id)!);
                      setSummary(null);
                      setNotice(
                        "Your review is saved. Generate a fresh summary to include it.",
                      );
                    });
                  }}
                >
                  <label>
                    Your rating
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} stars
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Your perspective
                    <textarea
                      minLength={10}
                      maxLength={1000}
                      required
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="What helped you? What could be better?"
                    />
                  </label>
                  <Button disabled={!!busy}>Save review</Button>
                </form>
              </section>
            </>
          ) : tab === "dashboard" ? (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">MAKE SPACE FOR WHAT’S NEXT</p>
                  <h1>
                    A little wiser, every day<span className="sage-dot">.</span>
                  </h1>
                  <p>
                    Your next chapter starts with a small step. Welcome back,
                    Alex.
                  </p>
                </div>
                <Button onClick={() => navigate("discover")}>
                  Explore resources <ArrowUpRight size={17} />
                </Button>
              </div>
              <section className="hero-card">
                <div>
                  <span className="pill">LEARNING THAT STAYS WITH YOU</span>
                  <h2>
                    Your ambition.
                    <br />A plan to match it.
                  </h2>
                  <p>
                    Good resources, a manageable rhythm, and help
                    <br className="desktop-break" /> when you need it. Let’s
                    keep you moving.
                  </p>
                  <Button
                    onClick={() => {
                      setTab("create");
                      setResource(null);
                    }}
                  >
                    Create a learning plan <ArrowRight size={16} />
                  </Button>
                </div>
                <div className="growth-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="art-label art-label-one">
                    <CheckCircle2 size={16} /> One step at a time
                  </div>
                  <div className="art-label art-label-two">
                    <Sparkles size={15} /> Make it make sense
                  </div>
                  <div className="plant">
                    <div className="stem" />
                    <div className="leaf leaf-one" />
                    <div className="leaf leaf-two" />
                    <div className="leaf leaf-three" />
                    <div className="leaf leaf-four" />
                    <div className="pot" />
                  </div>
                </div>
              </section>
              <div className="stats">
                <article>
                  <span className="stat-icon">
                    <BookOpen size={19} />
                  </span>
                  <div>
                    <strong>{active.length}</strong>
                    <p>Active learning plans</p>
                  </div>
                </article>
                <article>
                  <span className="stat-icon">
                    <CheckCircle2 size={19} />
                  </span>
                  <div>
                    <strong>
                      {done}
                      <small> milestones</small>
                    </strong>
                    <p>Small steps completed</p>
                  </div>
                </article>
                <article>
                  <span className="stat-icon">
                    <Clock3 size={19} />
                  </span>
                  <div>
                    <strong>
                      {minutes}
                      <small> minutes</small>
                    </strong>
                    <p>Estimated learning completed</p>
                  </div>
                </article>
              </div>
              {reminders.map((r) => (
                <div className="reminder" key={r.id}>
                  <Bell size={21} />
                  <div>
                    <strong>A gentle nudge</strong>
                    <p>{r.message}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const p = plans.find((p) => p.id === r.planId);
                      if (p) {
                        const m = p.milestones.find((m) => !m.completedAt);
                        if (m) openLesson(p, m);
                      }
                    }}
                  >
                    Resume learning <ArrowRight size={14} />
                  </Button>
                  <button
                    aria-label="Dismiss reminder"
                    onClick={() =>
                      work("dismiss", async () => {
                        await api(`reminders/${r.id}`, "PATCH", {});
                        await reload();
                      })
                    }
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div className="section-heading">
                <div>
                  <h2>Keep your momentum</h2>
                  <p className="muted">A clear next step for every goal.</p>
                </div>
                <button className="text-link" onClick={() => navigate("plans")}>
                  All learning plans <ArrowRight size={15} />
                </button>
              </div>
              {plans.length ? (
                <div className="plan-grid">
                  {plans.slice(0, 2).map((p) => (
                    <PlanCard
                      key={p.id}
                      plan={p}
                      onOpen={() => {
                        setActivePlan(p);
                        setTab("plans");
                      }}
                      onResume={() => {
                        const m =
                          p.milestones.find((m) => !m.completedAt) ||
                          p.milestones[0];
                        openLesson(p, m);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-panel">
                  <span className="stat-icon">
                    <Target size={25} />
                  </span>
                  <div>
                    <h3>A goal becomes real when you give it a plan.</h3>
                    <p>
                      Choose something you’re curious about. We’ll help you
                      break it down.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setTab("create")}>
                    Set your first goal <ArrowRight size={16} />
                  </Button>
                </div>
              )}
              <div className="section-heading lower-heading">
                <div>
                  <h2>Follow your curiosity</h2>
                  <p className="muted">
                    Three starting points. Plenty of possibilities.
                  </p>
                </div>
                <span className="small-muted">CURATED FOR BEGINNERS</span>
              </div>
              <div className="topic-grid">
                {topics.map((t, i) => (
                  <button
                    className={`topic-card tone-${i}`}
                    key={t}
                    onClick={() => {
                      setTopic(t);
                      setRecommendations(null);
                      navigate("discover");
                    }}
                  >
                    <span className="topic-number">0{i + 1}</span>
                    <div>
                      <h3>{t}</h3>
                      <p>
                        {
                          [
                            "Build ideas for the web",
                            "Make sense of the numbers",
                            "Connect with your audience",
                          ][i]
                        }
                      </p>
                    </div>
                    <ArrowUpRight size={21} />
                  </button>
                ))}
              </div>
            </>
          ) : tab === "discover" ? (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">LESS SEARCHING. MORE LEARNING.</p>
                  <h1>Find your starting point.</h1>
                  <p>
                    A small, thoughtful catalog. Resources that meet you where
                    you are.
                  </p>
                </div>
                <span className="catalog-count">9 resources · 3 pathways</span>
              </div>
              <section className="discovery-bar">
                <label>
                  What are you curious about?
                  <select
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      setRecommendations(null);
                    }}
                  >
                    {topics.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Your sector
                  <select
                    value={sector}
                    onChange={(e) => {
                      setSector(e.target.value);
                      setRecommendations(null);
                    }}
                  >
                    <option value="">All sectors</option>
                    {sectors.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <Button
                  disabled={!!busy}
                  onClick={() =>
                    work("recommend", async () =>
                      setRecommendations({
                        ...(await api<Recommendations>(
                          "recommendations",
                          "POST",
                          {
                            topic,
                            sector,
                          },
                        )),
                        topic,
                        sector,
                      }),
                    )
                  }
                >
                  <Sparkles size={16} />
                  {busy === "recommend"
                    ? "Finding your fit…"
                    : "Find my resources"}
                </Button>
              </section>
              {recommendations && (
                <div className="recommend-heading">
                  <span>Selected for your interests</span>
                  <Badge value={recommendations.provenance} />
                </div>
              )}
              <div className="resource-grid">
                {picks.map(({ resource: r, reason }) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    reason={reason}
                    selected={selectedIds.includes(r.id)}
                    onSelect={() => toggle(r.id)}
                    onOpen={() => openResource(r)}
                  />
                ))}
              </div>
              {!picks.length && (
                <div className="empty-panel">
                  <p>
                    No matches. Try one of our supported topics:{" "}
                    {topics.join(", ")}.
                  </p>
                </div>
              )}
              {selectedIds.length > 0 && (
                <div className="selection-bar">
                  <span>
                    <CheckCircle2 size={18} />
                    {selectedIds.length} resources selected · {total} minutes
                  </span>
                  <Button onClick={() => setTab("create")}>
                    Build my plan <ArrowRight size={16} />
                  </Button>
                </div>
              )}
              <p className="catalog-footnote">
                Original text lessons for this demonstration. Recommendations
                are limited to this curated catalog.
              </p>
            </>
          ) : tab === "create" ? (
            <>
              <button
                className="back-link"
                onClick={() => navigate("discover")}
              >
                <ChevronLeft size={16} /> Discover resources
              </button>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">YOUR GOAL, YOUR RHYTHM</p>
                  <h1>Make room for learning.</h1>
                  <p>Turn your curiosity into small, achievable milestones.</p>
                </div>
              </div>
              <form
                className="create-grid"
                onSubmit={(e) => {
                  e.preventDefault();
                  work("create", async () => {
                    const result = await api<Plan>("plans", "POST", {
                      title,
                      resourceIds: selectedIds,
                      startDate: start,
                      duration,
                    });
                    const { ps } = await reload();
                    setActivePlan(ps.find((p) => p.id === result.id)!);
                    setTab("plans");
                    setSelectedIds([]);
                    setNotice(
                      "Your learning plan is ready. Start with one small step.",
                    );
                  });
                }}
              >
                <section className="panel form-panel">
                  <h2>A plan that fits your life</h2>
                  <label>
                    What would you like to achieve?
                    <input
                      required
                      minLength={3}
                      maxLength={100}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </label>
                  <div className="two-fields">
                    <label>
                      Start date
                      <input
                        type="date"
                        required
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                      />
                    </label>
                    <label>
                      Duration in days
                      <input
                        type="number"
                        required
                        min={1}
                        max={365}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                      />
                    </label>
                  </div>
                  <h3>Choose your resources</h3>
                  <p className="small-muted">
                    Milestones follow the selection order shown on the right.
                  </p>
                  {resources.map((r) => (
                    <label className="resource-check" key={r.id}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggle(r.id)}
                      />
                      <span>
                        <strong>{r.title}</strong>
                        <small>
                          {r.topic} · {r.estimatedMinutes} min
                        </small>
                      </span>
                    </label>
                  ))}
                </section>
                <aside className="panel plan-preview">
                  <span className="stat-icon">
                    <CalendarDays size={24} />
                  </span>
                  <h2>Your learning rhythm</h2>
                  <div className="effort">
                    <strong>
                      {duration > 0 ? Math.ceil(total / duration) : 0}
                    </strong>
                    <span>minutes a day, on average</span>
                  </div>
                  <p>
                    {total} minutes across {selected.length * 3} milestones.
                    Each milestone is one short lesson with a practice task.
                  </p>
                  <div className="selected-list">
                    {selected.map((r, i) => (
                      <div key={r.id}>
                        <span>{i + 1}</span>
                        <strong>{r.title}</strong>
                      </div>
                    ))}
                  </div>
                  <p className="small-muted">
                    Estimated effort, not a tracked timer. Multiple lessons can
                    fall on the same day.
                  </p>
                  <Button disabled={!selected.length || !!busy} type="submit">
                    {busy === "create"
                      ? "Building your plan…"
                      : "Create my learning plan"}
                    <ArrowRight size={16} />
                  </Button>
                </aside>
              </form>
            </>
          ) : tab === "reader" && milestone && activePlan ? (
            <>
              <button
                className="back-link"
                onClick={() => {
                  setTab("plans");
                  setPassage("");
                }}
              >
                <ChevronLeft size={16} /> Back to your plan
              </button>
              <div className="reader-heading">
                <span className="eyebrow">
                  {milestone.lesson.resource.topic} ·{" "}
                  {milestone.estimatedMinutes} MIN
                </span>
                <h1>{milestone.lesson.title}</h1>
                <p>
                  {activePlan.title} · Due {dateLabel(milestone.dueDate)}
                </p>
              </div>
              <div className="reader-grid">
                <article
                  className="panel lesson-text"
                  onMouseUp={capture}
                  onKeyUp={capture}
                  data-lesson-text
                >
                  <div className="reading-note">
                    <Leaf size={17} /> Take your time. Understanding is
                    progress.
                  </div>
                  {milestone.lesson.text.split("\n\n").map((p, i) => (
                    <div className="paragraph" key={i}>
                      <p>{p}</p>
                      <button
                        onClick={() => {
                          setPassage(p);
                          setAnswer(null);
                        }}
                        className="paragraph-action"
                        aria-label={`Use paragraph ${i + 1}`}
                      >
                        Use this paragraph <Sparkles size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="completion-footer">
                    <p>Finished reading and trying the practice task?</p>
                    <Button onClick={complete} disabled={!!busy}>
                      {milestone.completedAt ? (
                        <>
                          <CheckCircle2 size={16} />
                          Completed · Reopen
                        </>
                      ) : (
                        <>
                          Mark complete <Check size={16} />
                        </>
                      )}
                    </Button>
                  </div>
                </article>
                <aside className="panel assistant-panel">
                  <span className="assistant-icon">
                    <Sparkles size={24} />
                  </span>
                  <h2>Make it make sense.</h2>
                  <p className="muted">
                    Highlight a passage, or choose a paragraph. Let’s work
                    through it together.
                  </p>
                  {passage ? (
                    <>
                      <blockquote>{passage}</blockquote>
                      <div className="assist-actions">
                        {["summarize", "rephrase", "explain"].map((action) => (
                          <Button
                            key={action}
                            size="sm"
                            variant="outline"
                            disabled={!!busy}
                            onClick={() =>
                              work("assist", async () => {
                                setAnswer(null);
                                setAnswer({
                                  ...(await api<{
                                    answer: string;
                                    provenance: Provenance;
                                  }>("assist", "POST", {
                                    resourceId: milestone.lesson.resourceId,
                                    lessonId: milestone.lessonId,
                                    selected: passage,
                                    action,
                                  })),
                                  lessonId: milestone.lessonId,
                                  selected: passage,
                                });
                              })
                            }
                          >
                            {action[0].toUpperCase() + action.slice(1)}
                          </Button>
                        ))}
                      </div>
                      {busy === "assist" && (
                        <p role="status">Thinking it through…</p>
                      )}
                      {answer && (
                        <div className="assist-answer">
                          <Badge value={answer.provenance} />
                          <p>{answer.answer}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="assistant-empty">
                      <BookOpen size={25} />
                      <p>Your selected passage will appear here.</p>
                    </div>
                  )}
                  <small className="small-muted">
                    Prepared mode covers the first paragraph of the first
                    foundations lesson in each topic. Other passages require
                    live AI.
                  </small>
                </aside>
              </div>
            </>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">ONE STEP AT A TIME</p>
                  <h1>
                    {activePlan ? activePlan.title : "Your learning journeys."}
                  </h1>
                  <p>
                    {activePlan
                      ? "A little structure. A lot of possibility."
                      : "Your goals, broken into a rhythm you can follow."}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setTab("create");
                    setActivePlan(null);
                  }}
                >
                  New learning plan <ArrowRight size={16} />
                </Button>
              </div>
              {activePlan ? (
                <>
                  <button
                    className="back-link"
                    onClick={() => setActivePlan(null)}
                  >
                    <ChevronLeft size={16} /> All plans
                  </button>
                  <section className="panel plan-overview">
                    <div>
                      <span
                        className={`status ${activePlan.progress.status.toLowerCase().replace(" ", "-")}`}
                      >
                        {activePlan.progress.status}
                      </span>
                      <p>
                        {dateLabel(activePlan.startDate)} –{" "}
                        {dateLabel(activePlan.finishDate)} ·{" "}
                        {activePlan.duration} days · {activePlan.progress.total}{" "}
                        minutes
                      </p>
                    </div>
                    <div>
                      <strong>{activePlan.progress.percent}% complete</strong>
                      <div className="progress-track">
                        <span
                          style={{ width: `${activePlan.progress.percent}%` }}
                        />
                      </div>
                    </div>
                  </section>
                  <section className="panel milestone-list">
                    {activePlan.milestones.map((m, i) => (
                      <div
                        key={m.id}
                        className={`milestone-row ${m.completedAt ? "is-complete" : ""}`}
                      >
                        <span className="milestone-number">
                          {m.completedAt ? (
                            <Check size={17} />
                          ) : (
                            String(i + 1).padStart(2, "0")
                          )}
                        </span>
                        <div>
                          <strong>{m.lesson.title}</strong>
                          <small>
                            {m.lesson.resource.title} · {m.estimatedMinutes} min
                          </small>
                        </div>
                        <span
                          className={
                            clock && m.dueDate < clock.today && !m.completedAt
                              ? "overdue"
                              : "muted"
                          }
                        >
                          {m.completedAt
                            ? "Completed"
                            : `Due ${dateLabel(m.dueDate)}`}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openLesson(activePlan, m)}
                        >
                          {m.completedAt ? "Review" : "Open lesson"}
                          <ArrowRight size={14} />
                        </Button>
                      </div>
                    ))}
                  </section>
                </>
              ) : plans.length ? (
                <div className="plan-grid">
                  {plans.map((p) => (
                    <PlanCard
                      key={p.id}
                      plan={p}
                      onOpen={() => setActivePlan(p)}
                      onResume={() =>
                        openLesson(
                          p,
                          p.milestones.find((m) => !m.completedAt) ||
                            p.milestones[0],
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-panel">
                  <p>Your next chapter is waiting. Create your first plan.</p>
                  <Button onClick={() => setTab("create")}>
                    Create a plan
                  </Button>
                </div>
              )}
            </>
          )}
          <footer className="page-footer">
            <span>
              <Leaf size={13} /> Built for learning that lasts.
            </span>
            <span>Staywise · Hackathon prototype</span>
          </footer>
        </main>
      </div>
      {resetConfirm && (
        <div className="modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            className="panel reset-modal"
          >
            <h2 id="reset-title">Start the demo fresh?</h2>
            <p>
              This removes learning plans, your reviews, and AI caches, and
              restores the original sample catalog and real date.
            </p>
            <div>
              <Button variant="outline" onClick={() => setResetConfirm(false)}>
                Cancel
              </Button>
              <Button
                disabled={!!busy}
                onClick={() =>
                  work("reset", async () => {
                    await api("demo/reset", "POST", { confirm: true });
                    await reload();
                    setResource(null);
                    setActivePlan(null);
                    setMilestone(null);
                    setSelectedIds([]);
                    setRecommendations(null);
                    setSummary(null);
                    setAnswer(null);
                    setTab("dashboard");
                    setResetConfirm(false);
                    setNotice("Demo reset. Ready for a fresh journey.");
                  })
                }
              >
                Reset demo
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
function ResourceCard({
  resource: r,
  reason,
  selected,
  onSelect,
  onOpen,
}: {
  resource: Resource;
  reason: string;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="resource-card">
      <div className={`resource-art tone-${topics.indexOf(r.topic)}`}>
        <span className="pill">{r.level}</span>
        <div className="abstract-pages">
          <i />
          <i />
          <i />
          <BookOpen size={35} />
        </div>
        <span className="art-topic">{r.sector}</span>
      </div>
      <div className="resource-body">
        <p className="eyebrow">{r.topic}</p>
        <button className="resource-title" onClick={onOpen}>
          <h3>{r.title}</h3>
        </button>
        <p>{r.description}</p>
        <div className="resource-meta">
          <span>
            <Clock3 size={14} />
            {r.estimatedMinutes} min
          </span>
          <span>3 lessons</span>
          <span>
            <Star size={13} />{" "}
            {r.reviews.length
              ? (
                  r.reviews.reduce((s, x) => s + x.rating, 0) / r.reviews.length
                ).toFixed(1)
              : "—"}
          </span>
        </div>
        {reason && (
          <p className="recommend-reason">
            <Sparkles size={14} />
            {reason}
          </p>
        )}
        <div className="card-actions">
          <button className="text-link" onClick={onOpen}>
            View resource <ArrowUpRight size={15} />
          </button>
          <Button
            variant={selected ? "default" : "outline"}
            size="sm"
            onClick={onSelect}
          >
            {selected ? (
              <>
                <Check size={14} />
                Selected
              </>
            ) : (
              "Add to plan"
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
function PlanCard({
  plan: p,
  onOpen,
  onResume,
}: {
  plan: Plan;
  onOpen: () => void;
  onResume: () => void;
}) {
  return (
    <article className="panel plan-card">
      <div className="section-heading">
        <span className="plan-symbol">
          <BookOpen size={21} />
        </span>
        <span
          className={`status ${p.progress.status.toLowerCase().replace(" ", "-")}`}
        >
          {p.progress.status}
        </span>
      </div>
      <button className="resource-title" onClick={onOpen}>
        <h3>{p.title}</h3>
      </button>
      <p>
        {p.milestones.length} milestones · {dateLabel(p.startDate)} –{" "}
        {dateLabel(p.finishDate)}
      </p>
      <div className="progress-label">
        <span>Your progress</span>
        <strong>{p.progress.percent}%</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${p.progress.percent}%` }} />
      </div>
      <div className="card-actions">
        <button className="text-link" onClick={onOpen}>
          View plan <ArrowRight size={14} />
        </button>
        <Button size="sm" variant="outline" onClick={onResume}>
          {p.progress.status === "Completed"
            ? "Revisit learning"
            : "Continue learning"}
          <Play size={12} />
        </Button>
      </div>
    </article>
  );
}
