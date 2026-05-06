import { useState } from "react";
import { Icon } from "@iconify/react";
import QuestCard, { type Quest, type QuestStatus } from "./cards/QuestCard";
import ScheduleCard, { type ScheduleItem } from "./cards/ScheduleCard";
import SchedulePage, { updateSchedule, useWeeklySchedule } from "./Schedule";
import ClassmatesPage from "./classmates";
import SettingsPage from "./settings";
import ProfilePage from "./profile";
import AppHeader from "../PageHeader/Appheader";
import "./styles/dashboard.css";
import { useModal } from "../../hooks/useModal";
import { logout } from "../../services/user_service";
import type { User } from "../../types/types";
import Modal from "../../components/Modal";
import { getColorForSubject } from "./cards/ScheduleCard";
import { addSched } from "../../services/class_service";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday", "Sunday",
];
let globalSchedule: Record<string, ScheduleItem[]> = {}
let listeners: Function[] = []
/**
 * AdminScheduleEntry — one schedule session (one day, one time block).
 *
 * This intentionally mirrors ScheduleItem from ScheduleCard.tsx:
 *   ScheduleItem: { id, subject, room, startTime, endTime }
 *
 * We extend it with two admin-only fields:
 *   teacher — who teaches this class
 *   day     — which day (becomes the Record key in schedule)
 *
 * The schedule_service.ts functions use this exact shape as their
 * request/response payload, so what you send to the API is what
 * Schedule.tsx renders with zero conversion.
 *
 * If a subject runs on both Monday AND Thursday, that is TWO separate
 * AdminScheduleEntry rows — the same way schedule stores them.
 */
export interface AdminScheduleEntry {
  /** ID assigned by the API. Matches ScheduleItem.id. */
  id: number;

  /** e.g. "Introduction to Computing" — matches ScheduleItem.subject */
  subject: string;

  /** e.g. "Sir Debby Turco" — admin display field, not in ScheduleItem */
  teacher: string;

  /** e.g. "COMLAB6A" — matches ScheduleItem.room */
  room: string;

  /** e.g. "Monday" — becomes the key in schedule Record<day, []> */
  day: string;

  /** "HH:MM" 24-hour — e.g. "07:30". Matches ScheduleItem.startTime */
  startTime: string;

  /** "HH:MM" 24-hour — e.g. "09:00". Matches ScheduleItem.endTime */
  endTime: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER DATA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * INITIAL_QUESTS — placeholder until GET /api/class/:classId/assignments is wired.
 *
 * Each field matches the Quest type from QuestCard.tsx:
 * {
 *   id        : number
 *   title     : string
 *   subject   : string
 *   instructor: string
 *   deadline  : Date          ← UI uses Date; API sends/receives ISO string
 *   status    : "ongoing" | "finished"
 * }
 *
 * TODO: replace with getQuests(classId) from quest_service.ts
 */
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
    deadline: new Date(Date.now() + 1000 * 60 * 110),      // ~2 hours from now
    status: "ongoing",
  },
  {
    id: 3,
    title: "Readings: Philippine History",
    subject: "HIS-103",
    instructor: "Mr. M. Lelina",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 72),  // 3 days from now
    status: "ongoing",
  },
  {
    id: 4,
    title: "Essay: Understanding the Self",
    subject: "NSTP-101",
    instructor: "Ms. Reyes",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 5),   // 5 hours from now
    status: "ongoing",
  },
  {
    id: 5,
    title: "Math Problem Set #3",
    subject: "MATH-201",
    instructor: "Ms. Santos",
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 12),  // 12 hours ago
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
    deadline: new Date(Date.now() + 1000 * 60 * 25),        // 25 min from now
    status: "ongoing",
  },
];

/**
 * INITIAL_SCHEDULES — placeholder until GET /api/class/:classId/schedule is wired.
 *
 * Each entry matches AdminScheduleEntry exactly, which in turn mirrors
 * ScheduleItem from ScheduleCard.tsx (+ teacher + day).
 *
 * These are derived from schedule in Schedule.tsx — same subjects,
 * same rooms, same times — so the admin view and the student view show
 * identical data out of the box.
 *
 * One entry = one row in schedule[day].
 * "Introduction to Computing" appears on Monday AND Thursday → two entries.
 *
 * TODO: replace with getSchedules(classId) from schedule_service.ts,
 *       then pass the result through entriesToWeeklySchedule() if you
 *       want to keep schedule in sync dynamically.
 */
const INITIAL_SCHEDULES: AdminScheduleEntry[] = [
  // ── Monday ──────────────────────────────────────────────────────────────
  { id: 1,  subject: "Introduction to Computing",               teacher: "Sir Debby Turco",   room: "COMLAB6A",  day: "Monday",    startTime: "07:30", endTime: "09:00" },
  { id: 2,  subject: "Computer Programming I - Java Lab",       teacher: "Sir Jeffrey Cinco", room: "COMLAB2A",  day: "Monday",    startTime: "09:00", endTime: "10:30" },
  { id: 3,  subject: "Readings in Philippine History",          teacher: "Mr. M. Lelina",     room: "CON305A",   day: "Monday",    startTime: "10:30", endTime: "12:00" },
  { id: 4,  subject: "Understanding the Self",                  teacher: "Ms. Reyes",         room: "CON202A",   day: "Monday",    startTime: "13:00", endTime: "14:30" },
  { id: 5,  subject: "IT101L(Information Technology Lab)",      teacher: "Sir Debby Turco",   room: "COMLAB4A",  day: "Monday",    startTime: "14:30", endTime: "16:00" },

  // ── Tuesday ──────────────────────────────────────────────────────────────
  { id: 6,  subject: "IT101(Information Technology)",           teacher: "Sir Debby Turco",   room: "COMLAB5A",  day: "Tuesday",   startTime: "08:00", endTime: "09:00" },
  { id: 7,  subject: "PATHFIT-1",                               teacher: "Coach TBA",         room: "TBA",       day: "Tuesday",   startTime: "09:00", endTime: "10:00" },
  { id: 8,  subject: "Accounting Principle",                    teacher: "Ms. Santos",        room: "COMLAB1A",  day: "Tuesday",   startTime: "17:30", endTime: "19:00" },

  // ── Wednesday ─────────────────────────────────────────────────────────────
  { id: 9,  subject: "Computer Programming I - Java",           teacher: "Sir Jeffrey Cinco", room: "COMLAB2A",  day: "Wednesday", startTime: "10:00", endTime: "12:00" },

  // ── Thursday ─────────────────────────────────────────────────────────────
  { id: 10, subject: "Introduction to Computing",               teacher: "Sir Debby Turco",   room: "COMLAB6A",  day: "Thursday",  startTime: "07:30", endTime: "09:00" },
  { id: 11, subject: "Computer Programming I - Java Lab",       teacher: "Sir Jeffrey Cinco", room: "COMLAB2A",  day: "Thursday",  startTime: "09:00", endTime: "10:30" },
  { id: 12, subject: "Readings in Philippine History",          teacher: "Mr. M. Lelina",     room: "CON305A",   day: "Thursday",  startTime: "10:30", endTime: "12:00" },
  { id: 13, subject: "Understanding the Self",                  teacher: "Ms. Reyes",         room: "CON202A",   day: "Thursday",  startTime: "13:00", endTime: "14:30" },
  { id: 14, subject: "IT101L(Information Technology Lab)",      teacher: "Sir Debby Turco",   room: "COMLAB4A",  day: "Thursday",  startTime: "14:30", endTime: "16:00" },

  // ── Friday ───────────────────────────────────────────────────────────────
  { id: 15, subject: "IT101(Information Technology)",           teacher: "Sir Debby Turco",   room: "COMLAB5A",  day: "Friday",    startTime: "08:00", endTime: "09:00" },
  { id: 16, subject: "PATHFIT-1",                               teacher: "Coach TBA",         room: "TBA",       day: "Friday",    startTime: "09:00", endTime: "10:00" },
  { id: 17, subject: "Accounting Principle",                    teacher: "Ms. Santos",        room: "COMLAB1A",  day: "Friday",    startTime: "17:30", endTime: "19:00" },

  // ── Saturday ─────────────────────────────────────────────────────────────
  { id: 18, subject: "NSTP - CWTS",                             teacher: "TBA",               room: "HUM12A",    day: "Saturday",  startTime: "08:00", endTime: "17:00" },

  // ── Sunday ───────────────────────────────────────────────────────────────
  { id: 19, subject: "NSTP - CWTS",                             teacher: "TBA",               room: "HUM12A",    day: "Sunday",    startTime: "08:00", endTime: "17:00" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a temporary local id before the API returns a real one */
function tempId(): number {
  return Date.now();
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function sortQuests(quests: Quest[]): Quest[] {
  const ongoing  = quests
    .filter(q => q.status === "ongoing")
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  const finished = quests.filter(q => q.status === "finished");
  return [...ongoing, ...finished];
}

function getTodayKey() {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getCurrentMinutes() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function isItemActive(item: ScheduleItem) {
  const now = getCurrentMinutes();
  return timeToMinutes(item.startTime) <= now && now < timeToMinutes(item.endTime);
}

function isItemPast(item: ScheduleItem) {
  return getCurrentMinutes() >= timeToMinutes(item.endTime);
}

function getSidebarSchedule(items: ScheduleItem[]) {
  if (!items?.length) return [];
  const now    = getCurrentMinutes();
  const sorted = [...items].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const activeIdx = sorted.findIndex(i => isItemActive(i));
  if (activeIdx !== -1) return sorted.slice(Math.max(0, activeIdx - 1), Math.min(sorted.length, activeIdx + 3));

  const nextIdx = sorted.findIndex(i => timeToMinutes(i.startTime) > now);
  if (nextIdx !== -1) return sorted.slice(Math.max(0, nextIdx - 1), Math.min(sorted.length, nextIdx + 3));

  return sorted.slice(-3);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE MODAL
// Fields match AdminScheduleEntry exactly (one day-session per entry)
// ─────────────────────────────────────────────────────────────────────────────

interface ScheduleModalProps {
  /** Pass the entry to pre-fill the form for editing; omit for add */
  initial?: AdminScheduleEntry | null;
  onSave: (entry: AdminScheduleEntry) => void;
  onClose: () => void;
}

function ScheduleModal({ initial, onSave, onClose }: ScheduleModalProps) {
  const [subject,   setSubject]   = useState(initial?.subject   ?? "");
  const [teacher,   setTeacher]   = useState(initial?.teacher   ?? "");
  const [room,      setRoom]      = useState(initial?.room      ?? "");
  const [day,       setDay]       = useState(initial?.day       ?? "");
  const [startTime, setStartTime] = useState(initial?.startTime ?? "07:30");
  const [endTime,   setEndTime]   = useState(initial?.endTime   ?? "09:00");

  /** Validation — every field is required */
  const isValid =
    subject.trim() !== "" &&
    teacher.trim() !== "" &&
    room.trim()    !== "" &&
    day            !== "" &&
    startTime      !== "" &&
    endTime        !== "";

  function handleSave() {
    if (!isValid) return;

    // Build the entry in AdminScheduleEntry shape.
    // This is identical to what schedule_service.ts sends to the API.
    const entry: AdminScheduleEntry = {
      id       : initial?.id ?? tempId(), // tempId replaced by real API id on save
      subject  : subject.trim(),
      teacher  : teacher.trim(),
      room     : room.trim(),
      day,
      startTime,
      endTime,
    };

    onSave(entry);
  }

  return (
    <div className="fab-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fab-modal-box">

        {/* ── Header ── */}
        <div className="fab-modal-header">
          <h2 className="fab-modal-title">{initial ? "Edit Schedule" : "Add Schedule"}</h2>
          <button className="fab-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Body ── */}
        <div className="fab-modal-body">

          {/* Subject */}
          <div className="fab-form-group">
            <label className="fab-form-label">Subject Name</label>
            <input
              className="fab-form-input"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Introduction to Computing"
            />
          </div>

          {/* Teacher */}
          <div className="fab-form-group">
            <label className="fab-form-label">Teacher</label>
            <input
              className="fab-form-input"
              value={teacher}
              onChange={e => setTeacher(e.target.value)}
              placeholder="e.g. Sir Debby Turco"
            />
          </div>

          {/* Room + Day side by side */}
          <div className="fab-form-row">
            <div className="fab-form-group">
              <label className="fab-form-label">Room</label>
              <input
                className="fab-form-input"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. COMLAB6A"
              />
            </div>

            <div className="fab-form-group">
              <label className="fab-form-label">Day</label>
              {/*
                Day is a dropdown so the value is always a valid day string.
                Matches the keys used in schedule (Schedule.tsx).
              */}
              <select
                className="fab-form-input"
                value={day}
                onChange={e => setDay(e.target.value)}
              >
                <option value="">Select day...</option>
                {DAYS_OF_WEEK.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Start time + End time side by side */}
          <div className="fab-form-row">
            <div className="fab-form-group">
              <label className="fab-form-label">Start Time</label>
              <input
                type="time"
                className="fab-form-input"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>

            <div className="fab-form-group">
              <label className="fab-form-label">End Time</label>
              <input
                type="time"
                className="fab-form-input"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="fab-modal-footer">
          <button className="fab-modal-btn fab-modal-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="fab-modal-btn fab-modal-btn--save"
            onClick={handleSave}
            disabled={!isValid}
          >
            {initial ? "Save Changes" : "Add Schedule"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUEST MODAL
// Fields match Quest from QuestCard.tsx exactly
// ─────────────────────────────────────────────────────────────────────────────

interface QuestModalProps {
  /** Pass the quest to pre-fill the form for editing; omit for add */
  initial?: Quest | null;
  onSave: (q: Quest) => void;
  onClose: () => void;
}

function QuestModal({ initial, onSave, onClose }: QuestModalProps) {
  const [title,      setTitle]      = useState(initial?.title      ?? "");
  const [subject,    setSubject]    = useState(initial?.subject    ?? "");
  const [instructor, setInstructor] = useState(initial?.instructor ?? "");

  // Convert Date → datetime-local string for the input (strips timezone offset)
  const [deadline, setDeadline] = useState(
    initial
      ? new Date(initial.deadline.getTime() - initial.deadline.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : ""
  );

  const isValid =
    title.trim()      !== "" &&
    subject.trim()    !== "" &&
    instructor.trim() !== "" &&
    deadline          !== "";

  function handleSave() {
    if (!isValid) return;

    // Build the Quest object.
    // When this is passed to addQuest() / updateQuest() in quest_service.ts,
    // deadline.toISOString() converts it back to the ISO string the API expects.
    const quest: Quest = {
      id        : initial?.id ?? tempId(),    // tempId replaced by API id on save
      title     : title.trim(),
      subject   : subject.trim(),
      instructor: instructor.trim(),
      deadline  : new Date(deadline),         // datetime-local string → Date
      status    : initial?.status ?? "ongoing",
    };

    onSave(quest);
  }

  return (
    <div className="fab-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fab-modal-box">

        {/* ── Header ── */}
        <div className="fab-modal-header">
          <h2 className="fab-modal-title">{initial ? "Edit Quest" : "Add Quest"}</h2>
          <button className="fab-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Body ── */}
        <div className="fab-modal-body">

          {/* Title */}
          <div className="fab-form-group">
            <label className="fab-form-label">Assignment Title</label>
            <input
              className="fab-form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Java Lab Exercise: Arrays"
            />
          </div>

          {/* Subject + Instructor side by side */}
          <div className="fab-form-row">
            <div className="fab-form-group">
              <label className="fab-form-label">Subject Code</label>
              {/*
                Subject here is the subject code (e.g. "CS-202"),
                same as Quest.subject and the value shown on QuestCard.
              */}
              <input
                className="fab-form-input"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. CS-202"
              />
            </div>

            <div className="fab-form-group">
              <label className="fab-form-label">Instructor</label>
              {/*
                Instructor name, same as Quest.instructor shown on QuestCard.
              */}
              <input
                className="fab-form-input"
                value={instructor}
                onChange={e => setInstructor(e.target.value)}
                placeholder="e.g. Sir Jeffrey Cinco"
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="fab-form-group">
            <label className="fab-form-label">Deadline (Date & Time)</label>
            {/*
              The input stores a datetime-local string.
              handleSave() converts it back to a Date object.
              quest_service.ts then converts Date → ISO string before sending to API.
            */}
            <input
              type="datetime-local"
              className="fab-form-input"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="fab-modal-footer">
          <button className="fab-modal-btn fab-modal-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="fab-modal-btn fab-modal-btn--accent"
            onClick={handleSave}
            disabled={!isValid}
          >
            {initial ? "Save Changes" : "Add Quest"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN FAB
// ─────────────────────────────────────────────────────────────────────────────

type FabAction = "add" | "edit" | "delete";

interface FabProps {
  context: "quest" | "schedule";
  onAction: (action: FabAction) => void;
}

function AdminFab({ context, onAction }: FabProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-fab-wrap">
      {open && (
        <div className="admin-fab-menu">
          <button
            className="admin-fab-menu-btn admin-fab-menu-btn--add"
            onClick={() => { setOpen(false); onAction("add"); }}
          >
            <Icon icon="solar:add-circle-bold" style={{ fontSize: "1rem" }} /> Add
          </button>
          <button
            className="admin-fab-menu-btn admin-fab-menu-btn--edit"
            onClick={() => { setOpen(false); onAction("edit"); }}
          >
            <Icon icon="solar:pen-bold" style={{ fontSize: "1rem" }} /> Edit
          </button>
          <button
            className="admin-fab-menu-btn admin-fab-menu-btn--delete"
            onClick={() => { setOpen(false); onAction("delete"); }}
          >
            <Icon icon="solar:trash-bin-trash-bold" style={{ fontSize: "1rem" }} /> Delete
          </button>
        </div>
      )}
      <button
        className={`admin-fab ${open ? "admin-fab--open" : ""}`}
        onClick={() => setOpen(p => !p)}
        aria-label="Admin actions"
      >
        <Icon
          icon={open ? "solar:close-circle-bold" : "solar:shield-bold"}
          style={{ fontSize: "1.75rem" }}
        />
      </button>
    </div>
  );
}

// Click-to-select overlay wrapper for edit/delete picking
function CardSelector({
  label,
  children,
  onSelect,
}: {
  label: string;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <div className="card-selector-wrap" onClick={onSelect} title={`Select to ${label}`}>
      <div className="card-selector-overlay">
        <span className="card-selector-label">{label}</span>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

type FilterTab  = "all" | "ongoing" | "finished";
type ActivePage = "home" | "schedule" | "classmates" | "settings" | "profile";

type AdminModal =
  | { type: "none" }
  | { type: "addQuest" }
  | { type: "editQuest";      quest: Quest }
  | { type: "pickEditQuest" }
  | { type: "pickDeleteQuest" }
  | { type: "addSchedule" }
  | { type: "editSchedule";   entry: AdminScheduleEntry }
  | { type: "pickEditSched" }
  | { type: "pickDeleteSched" };

type DashboardProp = {
  user: User;
  onLogoutSuccess: () => Promise<void>;
  /**
   * Set to true when the API confirms this user is an admin.
   * TODO: derive from API response — e.g. user.role === "admin"
   */
  isAdmin?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard({ user, onLogoutSuccess, isAdmin = true }: DashboardProp) {
  const [quests,     setQuests]     = useState<Quest[]>(INITIAL_QUESTS);
  const [schedules,  setSchedules]  = useState<AdminScheduleEntry[]>(INITIAL_SCHEDULES);
  const [filter,     setFilter]     = useState<FilterTab>("all");
  const [activePage, setActivePage] = useState<ActivePage>("home");
  const [adminMode,  setAdminMode]  = useState(false);
  const [adminModal, setAdminModal] = useState<AdminModal>({ type: "none" });
  

  const modal = useModal();
  const {schedule, loading} = useWeeklySchedule()

  if (loading) return (<p>Loading...</p>)

  // Admin mode is only active when both the API confirms admin AND the user toggled it on
  const effectiveAdmin = isAdmin && adminMode;

  // ── Schedule & sidebar helpers ──
  const todayKey      = getTodayKey();
  const todaySchedule = schedule[todayKey] ?? [];
  const sidebarItems  = getSidebarSchedule(todaySchedule);

  // ── Quest list helpers ──
  const sorted         = sortQuests(quests);
  const displayed      = sorted.filter(q =>
    filter === "ongoing"  ? q.status === "ongoing"  :
    filter === "finished" ? q.status === "finished" : true
  );
  const totalQuests    = quests.length;
  const finishedQuests = quests.filter(q => q.status === "finished").length;
  const progressPct    = totalQuests > 0 ? Math.round((finishedQuests / totalQuests) * 100) : 0;
  const remaining      = totalQuests - finishedQuests;

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  function handleLogout() {
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
  }

  // ─────────────────────────────────────────────────────────────────────────
  // QUEST API HANDLERS
  // Each function calls the matching function in quest_service.ts.
  // The service file holds the actual fetch calls + TODO comments.
  // ─────────────────────────────────────────────────────────────────────────

  /** Create a new quest — calls addQuest() in quest_service.ts */
  async function addQuest(q: Quest): Promise<void> {
    // TODO: const res = await questService.addQuest(classId, q);
    // TODO: if (res.status !== 200) { showErrorModal(res.message); return; }
    // TODO: setQuests(prev => [...prev, res.data as Quest]);  // use API-assigned id
    setQuests(prev => [...prev, q]);
  }

  /** Update an existing quest — calls updateQuest() in quest_service.ts */
  async function editQuest(q: Quest): Promise<void> {
    // TODO: const res = await questService.updateQuest(q.id, q);
    // TODO: if (res.status !== 200) { showErrorModal(res.message); return; }
    setQuests(prev => prev.map(x => x.id === q.id ? q : x));
  }

  /** Delete a quest — calls deleteQuest() in quest_service.ts */
  async function deleteQuest(id: number): Promise<void> {
    // TODO: const res = await questService.deleteQuest(id);
    // TODO: if (res.status !== 200) { showErrorModal(res.message); return; }
    setQuests(prev => prev.filter(q => q.id !== id));
  }

  /** Toggle quest status (student action) — calls toggleQuestStatus() in quest_service.ts */
  async function handleToggleStatus(id: number): Promise<void> {
    const quest = quests.find(q => q.id === id);
    if (!quest) return;
    const nextStatus: QuestStatus = quest.status === "finished" ? "ongoing" : "finished";
    // TODO: const res = await questService.toggleQuestStatus(id, nextStatus);
    // TODO: if (res.status !== 200) { showErrorModal(res.message); return; }
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: nextStatus } : q));
  }

  /** Called by QuestModal onSave — routes to add or edit */
  async function handleSaveQuest(q: Quest): Promise<void> {
    const isExisting = quests.some(x => x.id === q.id);
    if (isExisting) {
      await editQuest(q);
    } else {
      await addQuest(q);
    }
    setAdminModal({ type: "none" });
  }

  /** Shows confirmation modal then deletes */
  function handleDeleteQuest(id: number): void {
    modal.show({
      variant: "decision",
      title: "Delete Quest",
      description: "Are you sure you want to delete this quest? This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onCancel: () => modal.close(),
      onConfirm: async () => {
        await deleteQuest(id);
        modal.close();
        setAdminModal({ type: "none" });
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCHEDULE API HANDLERS
  // Each function calls the matching function in schedule_service.ts.
  // The service file holds the actual fetch calls + TODO comments.
  // ─────────────────────────────────────────────────────────────────────────

  /** Create a new schedule entry — calls addSchedule() in schedule_service.ts */
  async function addSchedule(entry: AdminScheduleEntry): Promise<void> {
    const saved = await addSched(entry);
     const updated = {
    ...schedule,
    [entry.day]: [
      ...(schedule[entry.day] || []),
      entry
    ]
  }

  updateSchedule(updated)
  }

  /** Update an existing schedule entry — calls updateSchedule() in schedule_service.ts */
  async function editSchedule(entry: AdminScheduleEntry): Promise<void> {
    // TODO: const res = await scheduleService.updateSchedule(entry.id, entry);
    // TODO: if (res.status !== 200) { showErrorModal(res.message); return; }
    setSchedules(prev => prev.map(x => x.id === entry.id ? entry : x));
  }

  /** Delete a schedule entry — calls deleteSchedule() in schedule_service.ts */
  async function deleteSchedule(id: number): Promise<void> {
    // TODO: const res = await scheduleService.deleteSchedule(id);
    // TODO: if (res.status !== 200) { showErrorModal(res.message); return; }
    setSchedules(prev => prev.filter(s => s.id !== id));
  }

  /** Called by ScheduleModal onSave — routes to add or edit */
  async function handleSaveSchedule(entry: AdminScheduleEntry): Promise<void> {
    const isExisting = schedules.some(x => x.id === entry.id);
    if (isExisting) {
      await editSchedule(entry);
    } else {
      await addSchedule(entry);
    }
    setAdminModal({ type: "none" });
  }

  /** Shows confirmation modal then deletes */
  function handleDeleteSchedule(id: number): void {
    modal.show({
      variant: "decision",
      title: "Delete Schedule",
      description: "Are you sure you want to delete this schedule entry? This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onCancel: () => modal.close(),
      onConfirm: async () => {
        await deleteSchedule(id);
        modal.close();
        setAdminModal({ type: "none" });
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FAB ACTION ROUTER
  // ─────────────────────────────────────────────────────────────────────────

  function handleFabAction(action: FabAction, context: "quest" | "schedule") {
    if (context === "quest") {
      if (action === "add")    setAdminModal({ type: "addQuest" });
      if (action === "edit")   setAdminModal({ type: "pickEditQuest" });
      if (action === "delete") setAdminModal({ type: "pickDeleteQuest" });
    } else {
      if (action === "add")    setAdminModal({ type: "addSchedule" });
      if (action === "edit")   setAdminModal({ type: "pickEditSched" });
      if (action === "delete") setAdminModal({ type: "pickDeleteSched" });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NAV + SHARED HEADER
  // ─────────────────────────────────────────────────────────────────────────

  const navItems = [
    { label: "Quests",     key: "home",       onClick: () => setActivePage("home"),       active: activePage === "home"       },
    { label: "Schedule",   key: "schedule",   onClick: () => setActivePage("schedule"),   active: activePage === "schedule"   },
    { label: "Classmates", key: "classmates", onClick: () => setActivePage("classmates"), active: activePage === "classmates" },
    { label: "Settings",   key: "settings",   onClick: () => setActivePage("settings"),   active: activePage === "settings"   },
  ];

  const sharedHeader = (
    <AppHeader
      user={user}
      navItems={navItems}
      onLogout={handleLogout}
      onProfileClick={() => setActivePage("profile")}
      isAdmin={isAdmin}
      adminMode={adminMode}
      onToggleAdminMode={() => setAdminMode(p => !p)}
    />
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SUB-PAGES
  // ─────────────────────────────────────────────────────────────────────────

  if (activePage === "schedule") return (
    <div className="dash-page">
      {sharedHeader}
      <main className="dash-main">
        {/* hideHeader — SchedulePage's own sticky header is hidden because
            AppHeader above already handles navigation and the tooltip.
            Rendering two sticky headers would also push the tooltip behind
            the second header's z-index. */}
        <SchedulePage hideHeader />
      </main>
      {effectiveAdmin && (
        <AdminFab context="schedule" onAction={a => handleFabAction(a, "schedule")} />
      )}
      {renderMobileNav()}
      {renderAdminModals()}
      {renderSharedModal()}
    </div>
  );

  if (activePage === "classmates") return (
    <div className="dash-page">
      {sharedHeader}
      <main className="dash-main"><ClassmatesPage /></main>
      {renderMobileNav()}
      {renderSharedModal()}
    </div>
  );

  if (activePage === "settings") return (
    <div className="dash-page">
      {sharedHeader}
      <main className="dash-main">
        <SettingsPage
          isAdmin={effectiveAdmin}
          showModal={modal.show}
          closeModal={modal.close}
          onLeaveSuccess={onLogoutSuccess}
          onDeleteSuccess={onLogoutSuccess}
        />
      </main>
      {renderMobileNav()}
      {renderSharedModal()}
    </div>
  );

  if (activePage === "profile") return (
    <div className="dash-page">
      {sharedHeader}
      <main className="dash-main">
        <ProfilePage
          user={user}
          onBack={() => setActivePage("home")}
          onDeleteSuccess={onLogoutSuccess}
          showModal={modal.show}
          closeModal={modal.close}
        />
      </main>
      {renderMobileNav()}
      {renderSharedModal()}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // HOME PAGE
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="dash-page">
      {sharedHeader}

      <main className="dash-main">

        {/* ── Profile card ── */}
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

        {/* ── Content grid ── */}
        <div className="dash-content-grid">

          {/* ── Quests column ── */}
          <div className="dash-quests-col">
            <div className="filter-row">
              <h3 className="section-title">Active Quests</h3>
              <div className="filter-tabs">
                {(["all", "ongoing", "finished"] as FilterTab[]).map(tab => (
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
              ) : displayed.map(quest => {
                // Admin pick-to-edit mode: wrap each card in a clickable overlay
                if (effectiveAdmin && adminModal.type === "pickEditQuest") return (
                  <CardSelector key={quest.id} label="Click to edit" onSelect={() => setAdminModal({ type: "editQuest", quest })}>
                    <QuestCard quest={quest} onToggleStatus={handleToggleStatus} />
                  </CardSelector>
                );
                // Admin pick-to-delete mode
                if (effectiveAdmin && adminModal.type === "pickDeleteQuest") return (
                  <CardSelector key={quest.id} label="Click to delete" onSelect={() => handleDeleteQuest(quest.id)}>
                    <QuestCard quest={quest} onToggleStatus={handleToggleStatus} />
                  </CardSelector>
                );
                return <QuestCard key={quest.id} quest={quest} onToggleStatus={handleToggleStatus} />;
              })}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="dash-sidebar-col">
            <h3 className="section-title section-title--sm">Today's Schedule</h3>

            <div className="schedule-sidebar-card">
              <div className="schedule-items-list">
                {sidebarItems.length > 0 ? (
                  sidebarItems.map(item => (
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

            {/* Admin schedule panel — visible only in admin mode */}
            {effectiveAdmin && (
              <div className="admin-sched-panel">
                <h3 className="section-title section-title--sm">Manage Schedules</h3>
                <div className="admin-schedule-grid">
                  {schedules.map(entry => {
                    const color = getColorForSubject(entry.subject);
                    return (
                      <div key={entry.id} className="admin-schedule-card">
                        <div className="admin-sched-color-strip" style={{ background: color.border }} />
                        <div className="admin-sched-body">
                          <p className="admin-sched-subject">{entry.subject}</p>
                          <p className="admin-sched-teacher">{entry.teacher}</p>
                          <div className="admin-sched-slot">
                            <span className="admin-sched-slot-day">{entry.day.slice(0, 3)}</span>
                            <span className="admin-sched-slot-time">
                              {formatTime(entry.startTime)} – {formatTime(entry.endTime)} · {entry.room}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily reward */}
            <div className="daily-reward-card">
              <div className="daily-reward-header">
                <h4 className="daily-reward-title">Daily Reward</h4>
                <Icon icon="solar:gift-bold" style={{ fontSize: "1.5rem" }} />
              </div>
              <p className="daily-reward-desc">Complete one more task today to earn a Rare Mystery Box!</p>
              <div className="daily-reward-track">
                <div className="daily-reward-fill" style={{ width: `${Math.min(100, progressPct)}%` }} />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Admin FAB — only on home page in admin mode */}
      {effectiveAdmin && (
        <AdminFab context="quest" onAction={a => handleFabAction(a, "quest")} />
      )}

      {renderMobileNav()}
      {renderAdminModals()}
      {renderSharedModal()}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  function renderMobileNav() {
    return (
      <div className="mobile-nav">
        <button className={`mobile-nav-btn ${activePage === "home"       ? "mobile-nav-btn--active" : ""}`} onClick={() => setActivePage("home")}>
          <Icon icon="solar:home-2-bold" style={{ fontSize: "1.5rem" }} /><span>Quests</span>
        </button>
        <button className={`mobile-nav-btn ${activePage === "schedule"   ? "mobile-nav-btn--active" : ""}`} onClick={() => setActivePage("schedule")}>
          <Icon icon="solar:calendar-bold" style={{ fontSize: "1.5rem" }} /><span>Schedule</span>
        </button>
        <button className={`mobile-nav-btn ${activePage === "classmates" ? "mobile-nav-btn--active" : ""}`} onClick={() => setActivePage("classmates")}>
          <Icon icon="solar:users-group-rounded-bold" style={{ fontSize: "1.5rem" }} /><span>Class</span>
        </button>
        <button className={`mobile-nav-btn ${activePage === "settings"   ? "mobile-nav-btn--active" : ""}`} onClick={() => setActivePage("settings")}>
          <Icon icon="solar:settings-bold" style={{ fontSize: "1.5rem" }} /><span>Settings</span>
        </button>
      </div>
    );
  }

  function renderSharedModal() {
    return (
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
    );
  }

  function renderAdminModals() {
    if (!effectiveAdmin) return null;

    return (
      <>
        {/* ── Quest modals ── */}
        {adminModal.type === "addQuest" && (
          <QuestModal
            onSave={handleSaveQuest}
            onClose={() => setAdminModal({ type: "none" })}
          />
        )}
        {adminModal.type === "editQuest" && (
          <QuestModal
            initial={adminModal.quest}
            onSave={handleSaveQuest}
            onClose={() => setAdminModal({ type: "none" })}
          />
        )}

        {/* Pick-to-edit / pick-to-delete banner shown above quest cards */}
        {(adminModal.type === "pickEditQuest" || adminModal.type === "pickDeleteQuest") && (
          <div className="pick-banner">
            <span>
              {adminModal.type === "pickEditQuest"
                ? "Click a quest card to edit it"
                : "Click a quest card to delete it"}
            </span>
            <button className="pick-banner-cancel" onClick={() => setAdminModal({ type: "none" })}>
              Cancel
            </button>
          </div>
        )}

        {/* ── Schedule modals ── */}
        {adminModal.type === "addSchedule" && (
          <ScheduleModal
            onSave={handleSaveSchedule}
            onClose={() => setAdminModal({ type: "none" })}
          />
        )}
        {adminModal.type === "editSchedule" && (
          <ScheduleModal
            initial={adminModal.entry}
            onSave={handleSaveSchedule}
            onClose={() => setAdminModal({ type: "none" })}
          />
        )}

        {/* Pick schedule to edit — list picker */}
        {adminModal.type === "pickEditSched" && (
          <div className="fab-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setAdminModal({ type: "none" }); }}>
            <div className="fab-modal-box">
              <div className="fab-modal-header">
                <h2 className="fab-modal-title">Select Entry to Edit</h2>
                <button className="fab-modal-close" onClick={() => setAdminModal({ type: "none" })}>✕</button>
              </div>
              <div className="fab-modal-body" style={{ gap: "0.75rem" }}>
                {schedules.map(entry => (
                  <button
                    key={entry.id}
                    className="sched-pick-btn"
                    onClick={() => setAdminModal({ type: "editSchedule", entry })}
                  >
                    <span className="sched-pick-dot" style={{ background: getColorForSubject(entry.subject).border }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 900 }}>{entry.subject}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                        {entry.day} · {formatTime(entry.startTime)} – {formatTime(entry.endTime)} · {entry.room}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pick schedule to delete — list picker */}
        {adminModal.type === "pickDeleteSched" && (
          <div className="fab-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setAdminModal({ type: "none" }); }}>
            <div className="fab-modal-box">
              <div className="fab-modal-header">
                <h2 className="fab-modal-title">Select Entry to Delete</h2>
                <button className="fab-modal-close" onClick={() => setAdminModal({ type: "none" })}>✕</button>
              </div>
              <div className="fab-modal-body" style={{ gap: "0.75rem" }}>
                {schedules.map(entry => (
                  <button
                    key={entry.id}
                    className="sched-pick-btn sched-pick-btn--delete"
                    onClick={() => handleDeleteSchedule(entry.id)}
                  >
                    <span className="sched-pick-dot" style={{ background: "var(--destructive)" }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 900 }}>{entry.subject}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                        {entry.day} · {formatTime(entry.startTime)} – {formatTime(entry.endTime)} · {entry.room}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}