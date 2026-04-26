import { useState } from "react";
import { Icon } from "@iconify/react";
import QuestCard, { type Quest, type QuestStatus } from "./cards/QuestCard";
import ScheduleCard, { type ScheduleItem } from "./cards/ScheduleCard";
import SchedulePage, { WEEKLY_SCHEDULE } from "./Schedule";
import ClassmatesPage from "./classmates";
import SettingsPage from "./settings";
import ProfilePage from "./profile";
import AppHeader from "../PageHeader/Appheader";
import "./styles/dashboard.css";
import { useModal } from "../../hooks/useModal";
import { logout } from "../../services/user_service";
import type { User } from "../../types/types";
import Modal from "../../components/Modal";

const LEVEL = "LVL 12 • ROOKIE";

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

// ── QUEST DATA ──
const INITIAL_QUESTS: Quest[] = [
  {
    id: 1,
    title: "HOPE: Push-ups",
    subject: "pathfit",
    instructor: "Mr. J. Nalam",
    deadline: new Date(2026, 7, 18), // August 18, 2026
    status: "ongoing"
  },
  {
    id: 2,
    title: "Research: Fundamentals of Computing",
    subject: "IT-101",
    instructor: "Sir Ed Tiquen",
    deadline: new Date(2026, 7, 22), // August 22, 2026
    status: "finished"
  },
  {
    id: 3,
    title: "Study: Fundamentals of Accounting",
    subject: "IT-102",
    instructor: "Ms. Aina Mijares",
    deadline: new Date(2026, 7, 25), // August 25, 2026
    status: "ongoing"
  },
  {
    id: 4,
    title: "Research: Fundamentals of Computing",
    subject: "IT-101",
    instructor: "Sir Ed Tiquen",
    deadline: new Date(2026, 7, 22),
    status: "finished"
  },
  {
    id: 5,
    title: "Research: Fundamentals of Computing",
    subject: "IT-101",
    instructor: "Sir Ed Tiquen",
    deadline: new Date(2026, 7, 22),
    status: "finished"
  },
  {
    id: 6,
    title: "Study: Fundamentals of Accounting",
    subject: "IT-102",
    instructor: "Ms. Aina Mijares",
    deadline: new Date(2026, 7, 25),
    status: "notice"
  },
  {
    id: 7,
    title: "Research: Fundamentals of Computing",
    subject: "IT-101",
    instructor: "Sir Ed Tiquen",
    deadline: new Date(2026, 7, 22),
    status: "finished"
  }
]

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
type ActivePage = "home" | "schedule" | "classmates" | "settings" | "profile";

type DashboardProp = {
  user: User;
  onLogoutSuccess: () => Promise<void>;
};

export default function Dashboard({ user, onLogoutSuccess }: DashboardProp) {
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [activePage, setActivePage] = useState<ActivePage>("home");
  const modal = useModal();

  const handleLogout = () => {
    modal.show({
      variant: "decision",
      title: "Logout",
      description: "Are you sure you want to logout?",
      confirmLabel: "Logout!",
      cancelLabel: "Cancel",
      onCancel: () => modal.close(),
      onConfirm: async () => {
        modal.close();
        await logout();
        onLogoutSuccess();
      },
    });
  };

  function handleToggleStatus(id: number) {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, status: q.status === "finished" ? "ongoing" : ("finished" as QuestStatus) }
          : q
      )
    );
  }

  const totalQuests = quests.length;
  const finishedQuests = quests.filter((q) => q.status === "finished").length;
  const progressPct = totalQuests > 0 ? Math.round((finishedQuests / totalQuests) * 100) : 0;
  const remaining = totalQuests - finishedQuests;

  const sorted = sortQuests(quests);
  const displayed = sorted.filter((q) => {
    if (filter === "ongoing") return q.status === "ongoing";
    if (filter === "finished") return q.status === "finished";
    return true;
  });

  const todayKey = getTodayKey();
  const todaySchedule = WEEKLY_SCHEDULE[todayKey] ?? [];
  const sidebarItems = getSidebarSchedule(todaySchedule);

  // ── Nav items for AppHeader ──
  const navItems = [
    { label: "Quests",     key: "home",       onClick: () => setActivePage("home"),       active: activePage === "home" },
    { label: "Schedule",   key: "schedule",   onClick: () => setActivePage("schedule"),   active: activePage === "schedule" },
    { label: "Classmates", key: "classmates", onClick: () => setActivePage("classmates"), active: activePage === "classmates" },
    { label: "Settings",   key: "settings",   onClick: () => setActivePage("settings"),   active: activePage === "settings" },
  ];

  // ── Sub-pages ──
  if (activePage === "schedule") {
    return (
      <div className="dash-page">
        <AppHeader user={user} navItems={navItems} onLogout={handleLogout} onProfileClick={() => setActivePage("profile")} />
        <main className="dash-main">
          <SchedulePage onBack={() => setActivePage("home")} />
        </main>
      </div>
    );
  }

  if (activePage === "classmates") {
    return (
      <div className="dash-page">
        <AppHeader user={user} navItems={navItems} onLogout={handleLogout} onProfileClick={() => setActivePage("profile")} />
        <main className="dash-main">
          <ClassmatesPage onBack={() => setActivePage("home")} />
        </main>
      </div>
    );
  }

  if (activePage === "settings") {
    return (
      <div className="dash-page">
        <AppHeader user={user} navItems={navItems} onLogout={handleLogout} onProfileClick={() => setActivePage("profile")} />
        <main className="dash-main">
          <SettingsPage onBack={() => setActivePage("home")} />
        </main>
      </div>
    );
  }

  if (activePage === "profile") {
    return (
      <div className="dash-page">
        <AppHeader user={user} navItems={navItems} onLogout={handleLogout} onProfileClick={() => setActivePage("profile")} />
        <main className="dash-main">
          <ProfilePage user={user} onBack={() => setActivePage("home")} onDeleteSuccess={onLogoutSuccess} />
        </main>
      </div>
    );
  }

  // ── HOME ──
  return (
    <div className="dash-page">
      <Modal
        open={modal.state.open}
        variant={modal.state.variant}
        title={modal.state.title}
        description={modal.state.description}
        confirmLabel={modal.state.confirmLabel}
        cancelLabel={modal.state.cancelLabel}
        onConfirm={modal.state.onConfirm}
        onCancel={modal.state.onCancel}
        okLabel={modal.state.okLabel}
        onOk={modal.state.onOk}
      />

      <AppHeader
        user={user}
        navItems={navItems}
        onLogout={handleLogout}
        onProfileClick={() => setActivePage("profile")}
      />

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
              <h2 className="profile-card-name">{user.username}</h2>
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

            {/* Quests are read-only on student dashboard */}
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
              <button className="view-map-btn" onClick={() => setActivePage("schedule")}>
                View Full Schedule
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

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="mobile-nav">
        <button
          className={`mobile-nav-btn ${activePage === "home" ? "mobile-nav-btn--active" : ""}`}
          onClick={() => setActivePage("home")}
        >
          <Icon icon="solar:home-2-bold" style={{ fontSize: "1.5rem" }} />
          <span>Quests</span>
        </button>
        <button
          className={`mobile-nav-btn ${activePage === "schedule" ? "mobile-nav-btn--active" : ""}`}
          onClick={() => setActivePage("schedule")}
        >
          <Icon icon="solar:calendar-bold" style={{ fontSize: "1.5rem" }} />
          <span>Schedule</span>
        </button>
        <div className="mobile-nav-fab">
          <Icon icon="solar:add-circle-bold" style={{ fontSize: "1.875rem" }} />
        </div>
        <button
          className={`mobile-nav-btn ${activePage === "classmates" ? "mobile-nav-btn--active" : ""}`}
          onClick={() => setActivePage("classmates")}
        >
          <Icon icon="solar:users-group-rounded-bold" style={{ fontSize: "1.5rem" }} />
          <span>Class</span>
        </button>
        <button
          className={`mobile-nav-btn ${activePage === "settings" ? "mobile-nav-btn--active" : ""}`}
          onClick={() => setActivePage("settings")}
        >
          <Icon icon="solar:settings-bold" style={{ fontSize: "1.5rem" }} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}