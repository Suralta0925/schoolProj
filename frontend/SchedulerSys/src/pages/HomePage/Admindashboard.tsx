import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { getColorForSubject } from "./cards/ScheduleCard";
import "./Admindashboard.css"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export interface DaySlot {
  id: string;          // uuid-like local key
  days: string[];      // e.g. ["Monday", "Wednesday"]
  startTime: string;   // "HH:MM" 24h
  endTime: string;     // "HH:MM" 24h
  room: string;
}

export interface AdminSchedule {
  id: string;
  subject: string;
  teacher: string;
  slots: DaySlot[];
}

export interface AdminAssignment {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  deadline: string; // ISO date string "YYYY-MM-DDTHH:MM"
}

// ─────────────────────────────────────────────
// TODO: connect to database
// Replace these initial values with API calls.
// e.g. const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
// then: useEffect(() => { fetchSchedules().then(setSchedules); }, []);
// ─────────────────────────────────────────────

const INITIAL_SCHEDULES: AdminSchedule[] = [
  {
    id: "sched-1",
    subject: "Introduction to Computing",
    teacher: "Sir Debby Turco",
    slots: [
      { id: "slot-1a", days: ["Monday", "Wednesday", "Friday"], startTime: "07:30", endTime: "09:00", room: "COMLAB6A" },
    ],
  },
  {
    id: "sched-2",
    subject: "Java Programming Lab",
    teacher: "Sir Jeffrey Cinco",
    slots: [
      { id: "slot-2a", days: ["Monday", "Wednesday"], startTime: "09:00", endTime: "10:30", room: "COMLAB2A" },
    ],
  },
  {
    id: "sched-3",
    subject: "Understanding the Self",
    teacher: "Ms. Reyes",
    slots: [
      { id: "slot-3a", days: ["Monday", "Thursday"], startTime: "13:00", endTime: "14:30", room: "CON202A" },
    ],
  },
  {
    id: "sched-4",
    subject: "Philippine History",
    teacher: "Mr. M. Lelina",
    slots: [
      { id: "slot-4a", days: ["Tuesday", "Thursday"], startTime: "08:00", endTime: "09:30", room: "HUM101A" },
    ],
  },
];

const INITIAL_ASSIGNMENTS: AdminAssignment[] = [
  {
    id: "asgn-1",
    title: "Research: Fundamentals of Computing",
    subject: "IT-101",
    teacher: "Sir Debby Turco",
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().slice(0, 16),
  },
  {
    id: "asgn-2",
    title: "Java Lab Exercise: Arrays",
    subject: "CS-202",
    teacher: "Sir Jeffrey Cinco",
    deadline: new Date(Date.now() + 1000 * 60 * 110).toISOString().slice(0, 16),
  },
  {
    id: "asgn-3",
    title: "Readings: Philippine History",
    subject: "HIS-103",
    teacher: "Mr. M. Lelina",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString().slice(0, 16),
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function getDeadlineLabel(isoStr: string): { label: string; urgency: "overdue" | "urgent" | "normal" } {
  const diff = new Date(isoStr).getTime() - Date.now();
  if (diff < 0) return { label: "OVERDUE", urgency: "overdue" };
  if (diff < 1000 * 60 * 60 * 24) return { label: `IN ${Math.ceil(diff / 3600000)}H`, urgency: "urgent" };
  const days = Math.ceil(diff / 86400000);
  return {
    label: new Date(isoStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    urgency: "normal",
  };
}

// ─────────────────────────────────────────────
// EMPTY SLOT FACTORY
// ─────────────────────────────────────────────

function emptySlot(): DaySlot {
  return { id: uid(), days: [], startTime: "07:30", endTime: "09:00", room: "" };
}

// ─────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────

interface ScheduleModalProps {
  initial?: AdminSchedule | null;
  onSave: (s: AdminSchedule) => void;
  onClose: () => void;
}

function ScheduleModal({ initial, onSave, onClose }: ScheduleModalProps) {
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [teacher, setTeacher] = useState(initial?.teacher ?? "");
  const [slots, setSlots] = useState<DaySlot[]>(
    initial?.slots?.length ? initial.slots : [emptySlot()]
  );

  function addSlot() {
    setSlots((prev) => [...prev, emptySlot()]);
  }

  function removeSlot(id: string) {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSlot(id: string, patch: Partial<DaySlot>) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function toggleDay(slotId: string, day: string) {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        const days = s.days.includes(day) ? s.days.filter((d) => d !== day) : [...s.days, day];
        return { ...s, days };
      })
    );
  }

  function handleSave() {
    if (!subject.trim() || !teacher.trim()) return;
    const validSlots = slots.filter((s) => s.days.length > 0 && s.room.trim());
    if (!validSlots.length) return;
    onSave({
      id: initial?.id ?? uid(),
      subject: subject.trim(),
      teacher: teacher.trim(),
      slots: validSlots,
    });
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">{initial ? "Edit Schedule" : "Add Schedule"}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            {/* <Icon icon="solar:close-bold" /> */}
            X
          </button>
        </div>

        <div className="modal-body">
          {/* Subject & Teacher */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject Name</label>
              <input
                className="form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Java Programming Lab"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject Teacher</label>
              <input
                className="form-input"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="e.g. Sir Jeffrey Cinco"
              />
            </div>
          </div>

          {/* Day / Time Slots */}
          <div className="date-slots-section">
            <div className="date-slots-label-row">
              <span className="form-label">Day & Time Slots</span>
              <button className="date-slot-add-btn" onClick={addSlot}>
                <Icon icon="solar:add-circle-bold" style={{ fontSize: "0.875rem" }} />
                Add Slot
              </button>
            </div>

            {slots.map((slot, idx) => (
              <div key={slot.id} className="date-slot-item">
                <div className="date-slot-header">
                  <span className="date-slot-num">Slot {idx + 1}</span>
                  {slots.length > 1 && (
                    <button className="date-slot-remove-btn" onClick={() => removeSlot(slot.id)}>
                      Remove
                    </button>
                  )}
                </div>

                {/* Day picker */}
                <div className="form-group">
                  <label className="form-label">Days</label>
                  <div className="date-slot-days">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`day-chip ${slot.days.includes(day) ? "day-chip--selected" : ""}`}
                        onClick={() => toggleDay(slot.id, day)}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room + time */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Room</label>
                    <input
                      className="form-input"
                      value={slot.room}
                      onChange={(e) => updateSlot(slot.id, { room: e.target.value })}
                      placeholder="e.g. COMLAB2A"
                    />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Start</label>
                      <input
                        type="time"
                        className="form-input"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(slot.id, { startTime: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">End</label>
                      <input
                        type="time"
                        className="form-input"
                        value={slot.endTime}
                        onChange={(e) => updateSlot(slot.id, { endTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn modal-btn--save" onClick={handleSave}>
            {initial ? "Save Changes" : "Add Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────

interface AssignmentModalProps {
  initial?: AdminAssignment | null;
  onSave: (a: AdminAssignment) => void;
  onClose: () => void;
}

function AssignmentModal({ initial, onSave, onClose }: AssignmentModalProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [teacher, setTeacher] = useState(initial?.teacher ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");

  function handleSave() {
    if (!title.trim() || !subject.trim() || !teacher.trim() || !deadline) return;
    onSave({
      id: initial?.id ?? uid(),
      title: title.trim(),
      subject: subject.trim(),
      teacher: teacher.trim(),
      deadline,
    });
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">{initial ? "Edit Assignment" : "Add Assignment"}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <Icon icon="solar:close-bold" />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Assignment Title</label>
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Java Lab Exercise: Arrays"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                className="form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. CS-202"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject Teacher</label>
              <input
                className="form-input"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="e.g. Sir Jeffrey Cinco"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Deadline (Date & Time)</label>
            <input
              type="datetime-local"
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn modal-btn--accent" onClick={handleSave}>
            {initial ? "Save Changes" : "Add Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────

interface ConfirmDeleteProps {
  label: string;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmDeleteModal({ label, onConfirm, onClose }: ConfirmDeleteProps) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="confirm-modal-box">
        <h2 className="confirm-modal-title">Delete?</h2>
        <p className="confirm-modal-desc">
          You are about to permanently delete <strong>"{label}"</strong>. This action cannot be undone.
        </p>
        <div className="confirm-modal-actions">
          <button className="modal-btn modal-btn--cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn modal-btn--delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN ADMIN DASHBOARD
// ─────────────────────────────────────────────

const ADMIN_NAME = "Admin User";

type ModalState =
  | { type: "none" }
  | { type: "addSchedule" }
  | { type: "editSchedule"; data: AdminSchedule }
  | { type: "deleteSchedule"; data: AdminSchedule }
  | { type: "addAssignment" }
  | { type: "editAssignment"; data: AdminAssignment }
  | { type: "deleteAssignment"; data: AdminAssignment };

export default function AdminDashboard() {
  // ── TODO: connect to database ──
  // Replace useState initial values with API-fetched data.
  // Example pattern:
  //   useEffect(() => {
  //     scheduleApi.getAll().then(setSchedules);
  //     assignmentApi.getAll().then(setAssignments);
  //   }, []);
  const [schedules, setSchedules] = useState<AdminSchedule[]>(INITIAL_SCHEDULES);
  const [assignments, setAssignments] = useState<AdminAssignment[]>(INITIAL_ASSIGNMENTS);

  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
        avatarRef.current && !avatarRef.current.contains(e.target as Node)
      ) setTooltipOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── TODO: connect to database ──
  // Replace local setState calls with API mutations.
  // e.g. scheduleApi.create(s).then((saved) => setSchedules(prev => [...prev, saved]));

  function handleSaveSchedule(s: AdminSchedule) {
    setSchedules((prev) => {
      const exists = prev.find((x) => x.id === s.id);
      return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s];
    });
    setModal({ type: "none" });
  }

  function handleDeleteSchedule(id: string) {
    // TODO: connect to database — scheduleApi.delete(id)
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setModal({ type: "none" });
  }

  // ── TODO: connect to database ──
  // e.g. assignmentApi.create(a).then((saved) => setAssignments(prev => [...prev, saved]));

  function handleSaveAssignment(a: AdminAssignment) {
    setAssignments((prev) => {
      const exists = prev.find((x) => x.id === a.id);
      return exists ? prev.map((x) => (x.id === a.id ? a : x)) : [...prev, a];
    });
    setModal({ type: "none" });
  }

  function handleDeleteAssignment(id: string) {
    // TODO: connect to database — assignmentApi.delete(id)
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setModal({ type: "none" });
  }

  return (
    <div className="admin-page">
      {/* ── HEADER ── */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <Icon icon="solar:gamepad-bold" className="admin-brand-icon" />
            <div className="admin-brand-text">
              <span className="admin-brand-name">ClassQuest</span>
              <span className="admin-brand-role">Admin Panel</span>
            </div>
          </div>

          <div className="admin-header-right">
            {/* Profile tooltip */}
            <div className="profile-wrapper">
              <div
                ref={avatarRef}
                className="profile-avatar-sm"
                onClick={() => setTooltipOpen((p) => !p)}
              >
                {ADMIN_NAME.charAt(0)}
              </div>
              {tooltipOpen && (
                <div ref={tooltipRef} className="profile-tooltip">
                  <div className="tooltip-header">
                    <p className="tooltip-username">{ADMIN_NAME}</p>
                    <p className="tooltip-role">Administrator</p>
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
      <main className="admin-main">

        {/* ── WELCOME BANNER ── */}
        <div className="admin-welcome">
          <div className="admin-welcome-text">
            <h2>Welcome back, Admin 👾</h2>
            <p>Manage schedules and assignments for your class guild.</p>
          </div>
          <div className="admin-welcome-stats">
            <div className="admin-stat">
              <div className="admin-stat-value">{schedules.length}</div>
              <div className="admin-stat-label">Subjects</div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat-value">{assignments.length}</div>
              <div className="admin-stat-label">Quests</div>
            </div>
          </div>
        </div>

        {/* ── SCHEDULE SECTION ── */}
        <section className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              <Icon icon="solar:calendar-bold" className="admin-section-title-icon" />
              Schedules
            </h2>
            <button
              className="admin-add-btn"
              onClick={() => setModal({ type: "addSchedule" })}
            >
              <Icon icon="solar:add-circle-bold" style={{ fontSize: "1rem" }} />
              Add Schedule
            </button>
          </div>

          {schedules.length === 0 ? (
            <div className="admin-empty">
              <Icon icon="solar:calendar-add-bold" style={{ fontSize: "2.5rem", opacity: 0.3 }} />
              No schedules yet. Add one to get started.
            </div>
          ) : (
            <div className="admin-schedule-grid">
              {schedules.map((sched) => {
                const color = getColorForSubject(sched.subject);
                return (
                  <div key={sched.id} className="admin-schedule-card">
                    {/* Color strip matching ScheduleCard colors */}
                    <div
                      className="admin-sched-color-strip"
                      style={{ background: color.border }}
                    />
                    <div className="admin-sched-body">
                      <p className="admin-sched-subject">{sched.subject}</p>
                      <p className="admin-sched-teacher">{sched.teacher}</p>
                      <div className="admin-sched-slots">
                        {sched.slots.map((slot) => (
                          <div key={slot.id} className="admin-sched-slot">
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                              {slot.days.map((d) => (
                                <span key={d} className="admin-sched-slot-day">{d.slice(0, 3)}</span>
                              ))}
                            </div>
                            <span className="admin-sched-slot-time">
                              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                            </span>
                            <span style={{ color: "var(--muted-foreground)", fontSize: "0.65rem" }}>
                              {slot.room}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="admin-card-actions">
                      <button
                        className="admin-card-action-btn admin-card-action-btn--edit"
                        onClick={() => setModal({ type: "editSchedule", data: sched })}
                      >
                        <Icon icon="solar:pen-bold" style={{ fontSize: "0.875rem" }} />
                        Edit
                      </button>
                      <button
                        className="admin-card-action-btn admin-card-action-btn--delete"
                        onClick={() => setModal({ type: "deleteSchedule", data: sched })}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" style={{ fontSize: "0.875rem" }} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── ASSIGNMENTS SECTION ── */}
        <section className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              <Icon icon="solar:document-add-bold" className="admin-section-title-icon" />
              Assignments
            </h2>
            <button
              className="admin-add-btn admin-add-btn--accent"
              onClick={() => setModal({ type: "addAssignment" })}
            >
              <Icon icon="solar:add-circle-bold" style={{ fontSize: "1rem" }} />
              Add Assignment
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="admin-empty">
              <Icon icon="solar:document-bold" style={{ fontSize: "2.5rem", opacity: 0.3 }} />
              No assignments yet. Add one to get started.
            </div>
          ) : (
            <div className="admin-assignment-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((asgn) => {
                    const { label, urgency } = getDeadlineLabel(asgn.deadline);
                    return (
                      <tr key={asgn.id}>
                        <td>
                          <div className="admin-table-title">{asgn.title}</div>
                        </td>
                        <td>
                          <div className="admin-table-title">{asgn.subject}</div>
                        </td>
                        <td>
                          <div className="admin-table-sub">{asgn.teacher}</div>
                        </td>
                        <td>
                          <span className={`deadline-badge deadline-badge--${urgency}`}>
                            {label}
                          </span>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <button
                              className="admin-row-btn admin-row-btn--edit"
                              onClick={() => setModal({ type: "editAssignment", data: asgn })}
                            >
                              <Icon icon="solar:pen-bold" style={{ fontSize: "0.75rem" }} />
                              Edit
                            </button>
                            <button
                              className="admin-row-btn admin-row-btn--delete"
                              onClick={() => setModal({ type: "deleteAssignment", data: asgn })}
                            >
                              <Icon icon="solar:trash-bin-trash-bold" style={{ fontSize: "0.75rem" }} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* ── MODALS ── */}

      {modal.type === "addSchedule" && (
        <ScheduleModal
          onSave={handleSaveSchedule}
          onClose={() => setModal({ type: "none" })}
        />
      )}

      {modal.type === "editSchedule" && (
        <ScheduleModal
          initial={modal.data}
          onSave={handleSaveSchedule}
          onClose={() => setModal({ type: "none" })}
        />
      )}

      {modal.type === "deleteSchedule" && (
        <ConfirmDeleteModal
          label={modal.data.subject}
          onConfirm={() => handleDeleteSchedule(modal.data.id)}
          onClose={() => setModal({ type: "none" })}
        />
      )}

      {modal.type === "addAssignment" && (
        <AssignmentModal
          onSave={handleSaveAssignment}
          onClose={() => setModal({ type: "none" })}
        />
      )}

      {modal.type === "editAssignment" && (
        <AssignmentModal
          initial={modal.data}
          onSave={handleSaveAssignment}
          onClose={() => setModal({ type: "none" })}
        />
      )}

      {modal.type === "deleteAssignment" && (
        <ConfirmDeleteModal
          label={modal.data.title}
          onConfirm={() => handleDeleteAssignment(modal.data.id)}
          onClose={() => setModal({ type: "none" })}
        />
      )}
    </div>
  );
}