import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import QuestCard, { type Quest, type QuestStatus } from "./cards/QuestCard";
import ScheduleCard, {type ScheduleItem } from "./cards/ScheduleCard";
import SchedulePage, { WEEKLY_SCHEDULE } from "./Schedule";
import "./dashboard.css";

const USERNAME = "Vince Ian Suralta";
const LEVEL = "LVL 12 • ROOKIE";
const AVATAR_URL =
  "https://lh3.googleusercontent.com/a/ACg8ocLLVmJlLo1pOrU1fRWA21haB0rFDzB2RrZRKZAJeI175hJumcCt=s96-c";

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

// ── QUEST DATA ──
const INITIAL_QUESTS: Quest[] = [
  {
    id: 1,
    title: "Research: Fundamentals of Computing",
    subject: "IT-101",
    instructor: "Sir Debby Turco",
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    status: "finished",
  },
  {
    id: 2,
    title: "Java Lab Exercise: Arrays",
    subject: "CS-202",
    instructor: "Sir Jeffrey Cinco",
    deadline: new Date(Date.now() + 1000 * 60 * 110), // ~2 hours from now
    status: "ongoing",
  },
  {
    id: 3,
    title: "Readings: Philippine History",
    subject: "HIS-103",
    instructor: "Mr. M. Lelina",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 72), // 3 days from now
    status: "ongoing",
  },
  {
    id: 4,
    title: "Essay: Understanding the Self",
    subject: "NSTP-101",
    instructor: "Ms. Reyes",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours from now
    status: "ongoing",
  },
  {
    id: 5,
    title: "Math Problem Set #3",
    subject: "MATH-201",
    instructor: "Ms. Santos",
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    status: "finished",
  },
  {
    id: 6,
    title: "Group Project: Database Design",
    subject: "IT-201",
    instructor: "Sir Reyes",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 120), // 5 days from now
    status: "ongoing",
  },
  {
    id: 7,
    title: "Quiz Review: Networking Basics",
    subject: "NET-101",
    instructor: "Sir Bautista",
    deadline: new Date(Date.now() + 1000 * 60 * 25), // 25 min from now
    status: "ongoing",
  },
];

// Sort quests: ongoing by deadline asc, finished go last
function sortQuests(quests: Quest[]): Quest[] {
  const ongoing = quests
    .filter((q) => q.status === "ongoing")
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  const finished = quests.filter((q) => q.status === "finished");
  return [...ongoing, ...finished];
}

// ── TODAY'S SCHEDULE ──
function getTodayKey(): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function isItemActive(item: ScheduleItem): boolean {
  const now = getCurrentMinutes();
  return timeToMinutes(item.startTime) <= now && now < timeToMinutes(item.endTime);
}

function isItemPast(item: ScheduleItem): boolean {
  return getCurrentMinutes() >= timeToMinutes(item.endTime);
}

// Get previous, current, and next schedule items for sidebar
function getSidebarSchedule(items: ScheduleItem[]): ScheduleItem[] {
  if (!items?.length) return [];
  const now = getCurrentMinutes();
  const sorted = [...items].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  const activeIdx = sorted.findIndex((i) => isItemActive(i));
  if (activeIdx !== -1) {
    const start = Math.max(0, activeIdx - 1);
    const end = Math.min(sorted.length, activeIdx + 3);
    return sorted.slice(start, end);
  }
  const nextIdx = sorted.findIndex((i) => timeToMinutes(i.startTime) > now);
  if (nextIdx !== -1) {
    const start = Math.max(0, nextIdx - 1);
    const end = Math.min(sorted.length, nextIdx + 3);
    return sorted.slice(start, end);
  }
  return sorted.slice(-3);
}

type FilterTab = "all" | "ongoing" | "finished";

export default function Dashboard() {
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);

  // Close tooltip on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
        avatarRef.current && !avatarRef.current.contains(e.target as Node)
      ) {
        setTooltipOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle quest status
  function handleToggleStatus(id: number) {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, status: q.status === "finished" ? "ongoing" : "finished" as QuestStatus }
          : q
      )
    );
  }

  // Progress bar logic
  const totalQuests = quests.length;
  const finishedQuests = quests.filter((q) => q.status === "finished").length;
  const progressPct = totalQuests > 0 ? Math.round((finishedQuests / totalQuests) * 100) : 0;
  const remaining = totalQuests - finishedQuests;

  // Filtered + sorted quests
  const sorted = sortQuests(quests);
  const displayed = sorted.filter((q) => {
    if (filter === "ongoing") return q.status === "ongoing";
    if (filter === "finished") return q.status === "finished";
    return true;
  });

  // Today's schedule
  const todayKey = getTodayKey();
  const todaySchedule = WEEKLY_SCHEDULE[todayKey] ?? [];
  const sidebarItems = getSidebarSchedule(todaySchedule);

  if (showSchedule) {
    return <SchedulePage onBack={() => setShowSchedule(false)} />;
  }

  return (
    <div className="dash-page">
      {/* ── HEADER ── */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <div className="dash-header-left">
            <div className="dash-brand">
              <Icon icon="solar:gamepad-bold" className="dash-brand-icon" />
              <span className="dash-brand-name">ClassQuest</span>
            </div>
            <nav className="dash-nav">
              <a href="#" className="dash-nav-link dash-nav-link--active">Quests</a>
              <a onClick={() => setShowSchedule(true)} className="dash-nav-link">Schedule</a>
              <a href="#" className="dash-nav-link">Guilds</a>
              <a href="#" className="dash-nav-link">Leaderboard</a>
            </nav>
          </div>

          <div className="dash-header-right">
            <button className="dash-notif-btn">
              <Icon icon="solar:bell-bold" />
              <span className="dash-notif-dot" />
            </button>

            {/* Profile with tooltip */}
            <div className="profile-wrapper">
              <img
                ref={avatarRef}
                src={AVATAR_URL}
                alt={USERNAME}
                className="profile-avatar"
                onClick={() => setTooltipOpen((p) => !p)}
              />
              {tooltipOpen && (
                <div ref={tooltipRef} className="profile-tooltip">
                  <div className="tooltip-header">
                    <p className="tooltip-username">{USERNAME}</p>
                    <p className="tooltip-level">{LEVEL}</p>
                  </div>
                  <button type="button" className="tooltip-logout-btn">
                    <Icon icon="solar:logout-2-bold" className="tooltip-logout-icon" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="dash-main">

        {/* ── PROFILE CARD ── */}
        <div className="profile-card">
          <div className="profile-card-user">
            <div className="profile-card-avatar-wrap">
              <div className="profile-card-avatar">
                <Icon icon="solar:shield-user-bold" />
              </div>
              <div className="profile-card-level-badge">LVL 12</div>
            </div>
            <div>
              <h2 className="profile-card-name">{USERNAME}</h2>
              <p className="profile-card-subtitle">IT-101 Student Guild Member</p>
              <div className="profile-card-badges">
                <span className="badge badge--secondary">MVP RANK #4</span>
                <span className="badge badge--primary">850 XP</span>
              </div>
            </div>
          </div>

          <div className="profile-card-progress">
            <div className="progress-label-row">
              <span className="progress-label">Quest Progress (Assignments)</span>
              <span className="progress-count">
                {finishedQuests}/{totalQuests}{" "}
                <span className="progress-count-sub">FINISHED</span>
              </span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}>
                <div className="progress-bar-shine" />
              </div>
            </div>
            <p className="progress-hint">
              {remaining > 0
                ? `${remaining} more quest${remaining !== 1 ? "s" : ""} to unlock next rank!`
                : "All quests completed! Next rank unlocked!"}
            </p>
          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        <div className="dash-content-grid">

          {/* ── QUESTS COLUMN ── */}
          <div className="dash-quests-col">
            <div className="filter-row">
              <h3 className="section-title">Active Quests</h3>
              <div className="filter-tabs">
                {(["all", "ongoing", "finished"] as FilterTab[]).map((tab) => (
                  <button
                    key={tab}
                    className={`filter-tab ${filter === tab ? "filter-tab--active" : ""}`}
                    onClick={() => setFilter(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="quest-list">
              {displayed.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted-foreground)", fontWeight: 700 }}>
                  No quests in this category.
                </div>
              ) : (
                displayed.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} onToggleStatus={handleToggleStatus} />
                ))
              )}
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="dash-sidebar-col">
            <h3 className="section-title section-title--sm">Today's Schedule</h3>

            <div className="schedule-sidebar-card">
              <div className="schedule-items-list">
                {sidebarItems.length > 0 ? (
                  sidebarItems.map((item) => (
                    <ScheduleCard
                      key={item.id}
                      item={item}
                      variant="sidebar"
                      isActive={isItemActive(item)}
                      isPast={isItemPast(item)}
                    />
                  ))
                ) : (
                  <div style={{ fontWeight: 700, color: "var(--muted-foreground)", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>
                    No more classes today!
                  </div>
                )}
              </div>
              <button className="view-map-btn" onClick={() => setShowSchedule(true)}>
                View Full Map
              </button>
            </div>

            {/* Daily Reward */}
            <div className="daily-reward-card">
              <div className="daily-reward-header">
                <h4 className="daily-reward-title">Daily Reward</h4>
                <Icon icon="solar:gift-bold" style={{ fontSize: "1.5rem" }} />
              </div>
              <p className="daily-reward-desc">
                Complete one more task today to earn a Rare Mystery Box!
              </p>
              <div className="daily-reward-track">
                <div className="daily-reward-fill" style={{ width: `${Math.min(100, progressPct)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── MOBILE NAV ── */}
      <div className="mobile-nav">
        <button className="mobile-nav-btn mobile-nav-btn--active">
          <Icon icon="solar:home-2-bold" style={{ fontSize: "1.5rem" }} />
          <span>Quests</span>
        </button>
        <button className="mobile-nav-btn" onClick={() => setShowSchedule(true)}>
          <Icon icon="solar:calendar-bold" style={{ fontSize: "1.5rem" }} />
          <span>Map</span>
        </button>
        <div className="mobile-nav-fab">
          <Icon icon="solar:add-circle-bold" style={{ fontSize: "1.875rem" }} />
        </div>
        <button className="mobile-nav-btn">
          <Icon icon="solar:ranking-bold" style={{ fontSize: "1.5rem" }} />
          <span>Arena</span>
        </button>
        <button className="mobile-nav-btn">
          <Icon icon="solar:user-bold" style={{ fontSize: "1.5rem" }} />
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
}