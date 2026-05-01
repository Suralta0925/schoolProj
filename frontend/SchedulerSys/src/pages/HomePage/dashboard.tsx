import { useState} from "react";
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
import { getColorForSubject } from "./cards/ScheduleCard";
import { addSched } from "../../services/class_service";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

const DAYS_OF_WEEK = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export interface DaySlot {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
  room: string;
}

export interface AdminSchedule {
  id: string;
  subject: string;
  teacher: string;
  slots: DaySlot[];
}

// ─────────────────────────────────────────────
// QUEST DATA
// ─────────────────────────────────────────────

const INITIAL_QUESTS: Quest[] = [
  { id: 1, title: "Research: Fundamentals of Computing", subject: "IT-101",   instructor: "Sir Debby Turco",   deadline: new Date(Date.now() - 1000*60*60*48), status: "finished" },
  { id: 2, title: "Java Lab Exercise: Arrays",           subject: "CS-202",   instructor: "Sir Jeffrey Cinco", deadline: new Date(Date.now() + 1000*60*110),    status: "ongoing"  },
  { id: 3, title: "Readings: Philippine History",        subject: "HIS-103",  instructor: "Mr. M. Lelina",     deadline: new Date(Date.now() + 1000*60*60*72),  status: "ongoing"  },
  { id: 4, title: "Essay: Understanding the Self",       subject: "NSTP-101", instructor: "Ms. Reyes",         deadline: new Date(Date.now() + 1000*60*60*5),   status: "ongoing"  },
  { id: 5, title: "Math Problem Set #3",                 subject: "MATH-201", instructor: "Ms. Santos",        deadline: new Date(Date.now() - 1000*60*60*12),  status: "finished" },
  { id: 6, title: "Group Project: Database Design",      subject: "IT-201",   instructor: "Sir Reyes",         deadline: new Date(Date.now() + 1000*60*60*120), status: "ongoing"  },
  { id: 7, title: "Quiz Review: Networking Basics",      subject: "NET-101",  instructor: "Sir Bautista",      deadline: new Date(Date.now() + 1000*60*25),     status: "ongoing"  },
];

// ─────────────────────────────────────────────
// PLACEHOLDER ADMIN SCHEDULES
// TODO: GET /api/class/:classId/schedules → AdminSchedule[]
// Shape: [{ id, subject, teacher, slots:[{id,days,startTime,endTime,room}] }]
// ─────────────────────────────────────────────
const INITIAL_SCHEDULES: AdminSchedule[] = [
  { id: "s1", subject: "Introduction to Computing", teacher: "Sir Debby Turco",   slots: [{ id: "s1a", days: ["Monday","Wednesday","Friday"], startTime: "07:30", endTime: "09:00", room: "COMLAB6A" }] },
  { id: "s2", subject: "Java Programming Lab",       teacher: "Sir Jeffrey Cinco", slots: [{ id: "s2a", days: ["Monday","Wednesday"],          startTime: "09:00", endTime: "10:30", room: "COMLAB2A" }] },
  { id: "s3", subject: "Understanding the Self",     teacher: "Ms. Reyes",         slots: [{ id: "s3a", days: ["Monday","Thursday"],           startTime: "13:00", endTime: "14:30", room: "CON202A"  }] },
  { id: "s4", subject: "Philippine History",         teacher: "Mr. M. Lelina",     slots: [{ id: "s4a", days: ["Tuesday","Thursday"],          startTime: "08:00", endTime: "09:30", room: "HUM101A"  }] },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2,10); }
function formatTime(t: string) {
  const [h,m] = t.split(":").map(Number);
  return `${h%12||12}:${m.toString().padStart(2,"0")} ${h>=12?"PM":"AM"}`;
}
function sortQuests(quests: Quest[]): Quest[] {
  const ongoing  = quests.filter(q=>q.status==="ongoing").sort((a,b)=>a.deadline.getTime()-b.deadline.getTime());
  const finished = quests.filter(q=>q.status==="finished");
  return [...ongoing,...finished];
}
function getTodayKey() {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
}
function timeToMinutes(t: string) { const [h,m]=t.split(":").map(Number); return h*60+m; }
function getCurrentMinutes() { const n=new Date(); return n.getHours()*60+n.getMinutes(); }
function isItemActive(item: ScheduleItem) { const now=getCurrentMinutes(); return timeToMinutes(item.startTime)<=now && now<timeToMinutes(item.endTime); }
function isItemPast(item: ScheduleItem)   { return getCurrentMinutes()>=timeToMinutes(item.endTime); }
function getSidebarSchedule(items: ScheduleItem[]) {
  if (!items?.length) return [];
  const now = getCurrentMinutes();
  const sorted = [...items].sort((a,b)=>timeToMinutes(a.startTime)-timeToMinutes(b.startTime));
  const activeIdx = sorted.findIndex(i=>isItemActive(i));
  if (activeIdx!==-1) return sorted.slice(Math.max(0,activeIdx-1), Math.min(sorted.length,activeIdx+3));
  const nextIdx = sorted.findIndex(i=>timeToMinutes(i.startTime)>now);
  if (nextIdx!==-1) return sorted.slice(Math.max(0,nextIdx-1), Math.min(sorted.length,nextIdx+3));
  return sorted.slice(-3);
}
function emptySlot(): DaySlot { return { id: uid(), days: [], startTime: "07:30", endTime: "09:00", room: "" }; }

// ─────────────────────────────────────────────
// ADMIN FAB MODALS (schedule + quest)
// ─────────────────────────────────────────────

function ScheduleModal({ initial, onSave, onClose }: { initial?: AdminSchedule|null; onSave:(s:AdminSchedule)=>void; onClose:()=>void }) {
  const [subject, setSubject] = useState(initial?.subject??"");
  const [teacher,  setTeacher]  = useState(initial?.teacher??"");
  const [slots,    setSlots]    = useState<DaySlot[]>(initial?.slots?.length ? initial.slots : [emptySlot()]);

  function addSlot() { setSlots(p=>[...p,emptySlot()]); }
  function removeSlot(id:string) { setSlots(p=>p.filter(s=>s.id!==id)); }
  function updateSlot(id:string, patch:Partial<DaySlot>) { setSlots(p=>p.map(s=>s.id===id?{...s,...patch}:s)); }
  function toggleDay(slotId:string, day:string) {
    setSlots(p=>p.map(s=>{
      if(s.id!==slotId) return s;
      const days = s.days.includes(day)?s.days.filter(d=>d!==day):[...s.days,day];
      return {...s,days};
    }));
  }
  function handleSave() {
    if(!subject.trim()||!teacher.trim()) return;
    const validSlots = slots.filter(s=>s.days.length>0&&s.room.trim());
    if(!validSlots.length) return;
    onSave({ id: initial?.id??uid(), subject:subject.trim(), teacher:teacher.trim(), slots:validSlots });
  }

  return (
    <div className="fab-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="fab-modal-box">
        <div className="fab-modal-header">
          <h2 className="fab-modal-title">{initial?"Edit Schedule":"Add Schedule"}</h2>
          <button className="fab-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="fab-modal-body">
          <div className="fab-form-row">
            <div className="fab-form-group">
              <label className="fab-form-label">Subject Name</label>
              <input className="fab-form-input" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. Java Programming Lab" />
            </div>
            <div className="fab-form-group">
              <label className="fab-form-label">Teacher</label>
              <input className="fab-form-input" value={teacher} onChange={e=>setTeacher(e.target.value)} placeholder="e.g. Sir Jeffrey Cinco" />
            </div>
          </div>

          <div className="fab-slots-section">
            <div className="fab-slots-label-row">
              <span className="fab-form-label">Day & Time Slots</span>
              <button className="fab-slot-add-btn" onClick={addSlot}>
                <Icon icon="solar:add-circle-bold" style={{fontSize:"0.875rem"}} /> Add Slot
              </button>
            </div>
            {slots.map((slot,idx)=>(
              <div key={slot.id} className="fab-slot-item">
                <div className="fab-slot-header">
                  <span className="fab-slot-num">Slot {idx+1}</span>
                  {slots.length>1 && <button className="fab-slot-remove-btn" onClick={()=>removeSlot(slot.id)}>Remove</button>}
                </div>
                <div className="fab-form-group">
                  <label className="fab-form-label">Days</label>
                  <div className="fab-day-chips">
                    {DAYS_OF_WEEK.map(day=>(
                      <button key={day} type="button" className={`fab-day-chip${slot.days.includes(day)?" fab-day-chip--on":""}`} onClick={()=>toggleDay(slot.id,day)}>
                        {day.slice(0,3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="fab-form-row">
                  <div className="fab-form-group">
                    <label className="fab-form-label">Room</label>
                    <input className="fab-form-input" value={slot.room} onChange={e=>updateSlot(slot.id,{room:e.target.value})} placeholder="e.g. COMLAB2A" />
                  </div>
                  <div className="fab-form-group">
                    <label className="fab-form-label">Start</label>
                    <input type="time" className="fab-form-input" value={slot.startTime} onChange={e=>updateSlot(slot.id,{startTime:e.target.value})} />
                  </div>
                  <div className="fab-form-group">
                    <label className="fab-form-label">End</label>
                    <input type="time" className="fab-form-input" value={slot.endTime} onChange={e=>updateSlot(slot.id,{endTime:e.target.value})} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="fab-modal-footer">
          <button className="fab-modal-btn fab-modal-btn--cancel" onClick={onClose}>Cancel</button>
          <button className="fab-modal-btn fab-modal-btn--save" onClick={handleSave}>{initial?"Save Changes":"Add Schedule"}</button>
        </div>
      </div>
    </div>
  );
}

function QuestModal({ initial, onSave, onClose }: { initial?: Quest|null; onSave:(q:Quest)=>void; onClose:()=>void }) {
  const [title,      setTitle]      = useState(initial?.title??"");
  const [subject,    setSubject]    = useState(initial?.subject??"");
  const [instructor, setInstructor] = useState(initial?.instructor??"");
  const [deadline,   setDeadline]   = useState(
    initial ? new Date(initial.deadline.getTime() - initial.deadline.getTimezoneOffset()*60000).toISOString().slice(0,16) : ""
  );

  function handleSave() {
    if(!title.trim()||!subject.trim()||!instructor.trim()||!deadline) return;
    onSave({
      id: initial?.id ?? Date.now(),
      title: title.trim(),
      subject: subject.trim(),
      instructor: instructor.trim(),
      deadline: new Date(deadline),
      status: initial?.status ?? "ongoing",
    });
  }

  return (
    <div className="fab-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="fab-modal-box">
        <div className="fab-modal-header">
          <h2 className="fab-modal-title">{initial?"Edit Quest":"Add Quest"}</h2>
          <button className="fab-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="fab-modal-body">
          <div className="fab-form-group">
            <label className="fab-form-label">Assignment Title</label>
            <input className="fab-form-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Java Lab Exercise: Arrays" />
          </div>
          <div className="fab-form-row">
            <div className="fab-form-group">
              <label className="fab-form-label">Subject Code</label>
              <input className="fab-form-input" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. CS-202" />
            </div>
            <div className="fab-form-group">
              <label className="fab-form-label">Instructor</label>
              <input className="fab-form-input" value={instructor} onChange={e=>setInstructor(e.target.value)} placeholder="e.g. Sir Jeffrey Cinco" />
            </div>
          </div>
          <div className="fab-form-group">
            <label className="fab-form-label">Deadline (Date & Time)</label>
            <input type="datetime-local" className="fab-form-input" value={deadline} onChange={e=>setDeadline(e.target.value)} />
          </div>
        </div>
        <div className="fab-modal-footer">
          <button className="fab-modal-btn fab-modal-btn--cancel" onClick={onClose}>Cancel</button>
          <button className="fab-modal-btn fab-modal-btn--accent" onClick={handleSave}>{initial?"Save Changes":"Add Quest"}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FAB COMPONENT
// ─────────────────────────────────────────────

type FabAction = "add"|"edit"|"delete";

interface FabProps {
  /** "quest" or "schedule" depending on active page */
  context: "quest"|"schedule";
  onAction: (action: FabAction) => void;
}

function AdminFab({ context, onAction }: FabProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-fab-wrap">
      {open && (
        <div className="admin-fab-menu">
          <button className="admin-fab-menu-btn admin-fab-menu-btn--add"    onClick={()=>{setOpen(false);onAction("add");}}>
            <Icon icon="solar:add-circle-bold" style={{fontSize:"1rem"}} /> Add
          </button>
          <button className="admin-fab-menu-btn admin-fab-menu-btn--edit"   onClick={()=>{setOpen(false);onAction("edit");}}>
            <Icon icon="solar:pen-bold" style={{fontSize:"1rem"}} /> Edit
          </button>
          <button className="admin-fab-menu-btn admin-fab-menu-btn--delete" onClick={()=>{setOpen(false);onAction("delete");}}>
            <Icon icon="solar:trash-bin-trash-bold" style={{fontSize:"1rem"}} /> Delete
          </button>
        </div>
      )}
      <button className={`admin-fab ${open?"admin-fab--open":""}`} onClick={()=>setOpen(p=>!p)} aria-label="Admin actions">
        <Icon icon={open?"solar:close-circle-bold":"solar:shield-bold"} style={{fontSize:"1.75rem"}} />
      </button>
    </div>
  );
}

// Inline edit overlay — user clicks a card to select it
function CardSelector({ label, children, onSelect }: { label:string; children:React.ReactNode; onSelect:()=>void }) {
  return (
    <div className="card-selector-wrap" onClick={onSelect} title={`Select to ${label}`}>
      <div className="card-selector-overlay">
        <span className="card-selector-label">{label}</span>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type FilterTab = "all"|"ongoing"|"finished";
type ActivePage = "home"|"schedule"|"classmates"|"settings"|"profile";
type AdminModal =
  | { type:"none" }
  | { type:"addQuest" }
  | { type:"editQuest";     quest:Quest }
  | { type:"addSchedule" }
  | { type:"editSchedule";  sched:AdminSchedule }
  | { type:"pickEditQuest" }
  | { type:"pickDeleteQuest" }
  | { type:"pickEditSched" }
  | { type:"pickDeleteSched" };

type DashboardProp = {
  user: User;
  onLogoutSuccess: () => Promise<void>;
  /**
   * Pass true when API confirms this user is an admin.
   * TODO: derive from API response — e.g. user.role === "admin"
   */
  isAdmin?: boolean;
};

// ─────────────────────────────────────────────
// MAIN COMPONENT 
// ─────────────────────────────────────────────

export default function Dashboard({ user, onLogoutSuccess, isAdmin = true }: DashboardProp) {
  const [quests,    setQuests]    = useState<Quest[]>(INITIAL_QUESTS);
  const [schedules, setSchedules] = useState<AdminSchedule[]>(INITIAL_SCHEDULES);
  const [filter,    setFilter]    = useState<FilterTab>("all");
  const [activePage, setActivePage] = useState<ActivePage>("home");
  const [adminMode,  setAdminMode]  = useState(false);
  const [adminModal, setAdminModal] = useState<AdminModal>({ type:"none" });

  const modal = useModal();

  // ── derived ──
  const effectiveAdmin = isAdmin && adminMode; // only admin mode users see CRUD
  const todayKey = getTodayKey();
  const todaySchedule = WEEKLY_SCHEDULE[todayKey] ?? [];
  const sidebarItems  = getSidebarSchedule(todaySchedule);

  const sorted    = sortQuests(quests);
  const displayed = sorted.filter(q => filter==="ongoing" ? q.status==="ongoing" : filter==="finished" ? q.status==="finished" : true);
  const totalQuests    = quests.length;
  const finishedQuests = quests.filter(q=>q.status==="finished").length;
  const progressPct    = totalQuests>0 ? Math.round((finishedQuests/totalQuests)*100) : 0;
  const remaining      = totalQuests - finishedQuests;

  // ─────────────────────────────────────────────
  // AUTH HANDLERS
  // ─────────────────────────────────────────────

  function handleLogout() {
    modal.show({
      variant: "decision",
      title: "Logout",
      description: "Are you sure you want to logout?",
      confirmLabel: "Logout!",
      cancelLabel: "Cancel",
      onCancel: () => modal.close(),
      onConfirm: async () => { modal.close(); await logout(); onLogoutSuccess(); },
    });
  }

  // ─────────────────────────────────────────────
  // QUEST API HANDLERS
  // ─────────────────────────────────────────────

  /** POST /api/quest — create a new quest */
  async function addQuest(q: Quest): Promise<void> {
    // TODO: const res = await fetch("/api/quest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(q) });
    // TODO: const created: Quest = await res.json();
    // TODO: setQuests(prev => [...prev, created]);   // swap `q` for `created` once API is wired
    setQuests(prev => [...prev, q]);
  }

  /** PATCH /api/quest/:id — update an existing quest */
  async function editQuest(q: Quest): Promise<void> {
    // TODO: await fetch(`/api/quest/${q.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(q) });
    setQuests(prev => prev.map(x => x.id === q.id ? q : x));
  }

  /** DELETE /api/quest/:id — delete a quest by id */
  async function deleteQuest(id: number): Promise<void> {
    // TODO: await fetch(`/api/quest/${id}`, { method: "DELETE" });
    setQuests(prev => prev.filter(q => q.id !== id));
  }

  /** PATCH /api/quest/:id/status — toggle finished ↔ ongoing */
  async function handleToggleStatus(id: number): Promise<void> {
    const quest = quests.find(q => q.id === id);
    if (!quest) return;
    const nextStatus: QuestStatus = quest.status === "finished" ? "ongoing" : "finished";
    // TODO: await fetch(`/api/quest/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: nextStatus } : q));
  }

  /** Dispatched by QuestModal onSave — routes to addQuest or editQuest */
  async function handleSaveQuest(q: Quest): Promise<void> {
    const isExisting = quests.some(x => x.id === q.id);
    if (isExisting) {
      await editQuest(q);
    } else {
      await addQuest(q);
    }
    setAdminModal({ type: "none" });
  }

  /** Prompts confirmation then calls deleteQuest */
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

  // ─────────────────────────────────────────────
  // SCHEDULE API HANDLERS
  // ─────────────────────────────────────────────

  /** POST /api/schedule — create a new schedule */
  async function addSchedule(s: AdminSchedule): Promise<void> {
    // TODO: const res = await fetch("/api/schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    // TODO: const created: AdminSchedule = await res.json();
    // TODO: setSchedules(prev => [...prev, created]);   // swap `s` for `created` once API is wired
    const data = await addSched(s.id, s.subject, s.slots)
    setSchedules(prev => [...prev, s]);
  }

  /** PATCH /api/schedule/:id — update an existing schedule */
  async function editSchedule(s: AdminSchedule): Promise<void> {
    // TODO: await fetch(`/api/schedule/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    setSchedules(prev => prev.map(x => x.id === s.id ? s : x));
  }

  /** DELETE /api/schedule/:id — delete a schedule by id */
  async function deleteSchedule(id: string): Promise<void> {
    // TODO: await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    setSchedules(prev => prev.filter(s => s.id !== id));
  }

  /** Dispatched by ScheduleModal onSave — routes to addSchedule or editSchedule */
  async function handleSaveSchedule(s: AdminSchedule): Promise<void> {
    const isExisting = schedules.some(x => x.id === s.id);
    if (isExisting) {
      await editSchedule(s);
    } else {
      await addSchedule(s);
    }
    setAdminModal({ type: "none" });
  }

  /** Prompts confirmation then calls deleteSchedule */
  function handleDeleteSchedule(id: string): void {
    modal.show({
      variant: "decision",
      title: "Delete Schedule",
      description: "Are you sure you want to delete this schedule? This cannot be undone.",
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

  // ── FAB action handler ──
  function handleFabAction(action:FabAction, context:"quest"|"schedule") {
    if(context==="quest") {
      if(action==="add")    setAdminModal({type:"addQuest"});
      if(action==="edit")   setAdminModal({type:"pickEditQuest"});
      if(action==="delete") setAdminModal({type:"pickDeleteQuest"});
    } else {
      if(action==="add")    setAdminModal({type:"addSchedule"});
      if(action==="edit")   setAdminModal({type:"pickEditSched"});
      if(action==="delete") setAdminModal({type:"pickDeleteSched"});
    }
  }

  // ── nav items ──
  const navItems = [
    { label:"Quests",     key:"home",       onClick:()=>setActivePage("home"),       active:activePage==="home"       },
    { label:"Schedule",   key:"schedule",   onClick:()=>setActivePage("schedule"),   active:activePage==="schedule"   },
    { label:"Classmates", key:"classmates", onClick:()=>setActivePage("classmates"), active:activePage==="classmates" },
    { label:"Settings",   key:"settings",   onClick:()=>setActivePage("settings"),   active:activePage==="settings"   },
  ];

  const sharedHeader = (
    <AppHeader
      user={user}
      navItems={navItems}
      onLogout={handleLogout}
      onProfileClick={()=>setActivePage("profile")}
      isAdmin={isAdmin}
      adminMode={adminMode}
      onToggleAdminMode={()=>setAdminMode(p=>!p)}
    />
  );

  // ── Sub-pages ──
  if (activePage==="schedule") return (
    <div className="dash-page">
      {sharedHeader}
      <main className="dash-main">
        <SchedulePage hideHeader />
        {effectiveAdmin && (
          <AdminFab context="schedule" onAction={a=>handleFabAction(a,"schedule")} />
        )}
      </main>
      {renderMobileNav()}
      {renderAdminModals()}
      {renderSharedModal()}
    </div>
  );

  if (activePage==="classmates") return (
    <div className="dash-page">
      {sharedHeader}
      <main className="dash-main"><ClassmatesPage /></main>
      {renderMobileNav()}
      {renderSharedModal()}
    </div>
  );

  if (activePage==="settings") return (
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

  if (activePage==="profile") return (
    <div className="dash-page">
      {sharedHeader}
      <main className="dash-main">
        <ProfilePage
          user={user}
          onBack={()=>setActivePage("home")}
          onDeleteSuccess={onLogoutSuccess}
          showModal={modal.show}
          closeModal={modal.close}
        />
      </main>
      {renderMobileNav()}
      {renderSharedModal()}
    </div>
  );

  // ── HOME ──
  return (
    <div className="dash-page">
      {sharedHeader}

      <main className="dash-main">
        {/* Profile card */}
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
              <span className="progress-count">{finishedQuests}/{totalQuests} <span className="progress-count-sub">FINISHED</span></span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{width:`${progressPct}%`}}>
                <div className="progress-bar-shine" />
              </div>
            </div>
            <p className="progress-hint">
              {remaining>0 ? `${remaining} more quest${remaining!==1?"s":""} to unlock next rank!` : "All quests completed! Next rank unlocked!"}
            </p>
          </div>
        </div>

        {/* Content grid */}
        <div className="dash-content-grid">
          {/* Quests column */}
          <div className="dash-quests-col">
            <div className="filter-row">
              <h3 className="section-title">Active Quests</h3>
              <div className="filter-tabs">
                {(["all","ongoing","finished"] as FilterTab[]).map(tab=>(
                  <button key={tab} className={`filter-tab${filter===tab?" filter-tab--active":""}`} onClick={()=>setFilter(tab)}>{tab}</button>
                ))}
              </div>
            </div>

            <div className="quest-list">
              {displayed.length===0 ? (
                <div style={{padding:"2rem",textAlign:"center",color:"var(--muted-foreground)",fontWeight:700}}>No quests in this category.</div>
              ) : displayed.map(quest=>{
                if(effectiveAdmin && adminModal.type==="pickEditQuest") return (
                  <CardSelector key={quest.id} label="Click to edit" onSelect={()=>setAdminModal({type:"editQuest",quest})}>
                    <QuestCard quest={quest} onToggleStatus={handleToggleStatus} />
                  </CardSelector>
                );
                if(effectiveAdmin && adminModal.type==="pickDeleteQuest") return (
                  <CardSelector key={quest.id} label="Click to delete" onSelect={()=>handleDeleteQuest(quest.id)}>
                    <QuestCard quest={quest} onToggleStatus={handleToggleStatus} />
                  </CardSelector>
                );
                return <QuestCard key={quest.id} quest={quest} onToggleStatus={handleToggleStatus} />;
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="dash-sidebar-col">
            <h3 className="section-title section-title--sm">Today's Schedule</h3>
            <div className="schedule-sidebar-card">
              <div className="schedule-items-list">
                {sidebarItems.length>0 ? sidebarItems.map(item=>(
                  <ScheduleCard key={item.id} item={item} variant="sidebar" isActive={isItemActive(item)} isPast={isItemPast(item)} />
                )) : (
                  <div style={{fontWeight:700,color:"var(--muted-foreground)",fontSize:"0.875rem",textAlign:"center",padding:"1rem 0"}}>No more classes today!</div>
                )}
              </div>
              <button className="view-map-btn" onClick={()=>setActivePage("schedule")}>View Full Schedule</button>
            </div>

            {/* Admin schedule manager (only in admin mode on home) */}
            {effectiveAdmin && (
              <div className="admin-sched-panel">
                <h3 className="section-title section-title--sm">Manage Schedules</h3>
                <div className="admin-schedule-grid">
                  {schedules.map(sched=>{
                    const color = getColorForSubject(sched.subject);
                    return (
                      <div key={sched.id} className="admin-schedule-card">
                        <div className="admin-sched-color-strip" style={{background:color.border}} />
                        <div className="admin-sched-body">
                          <p className="admin-sched-subject">{sched.subject}</p>
                          <p className="admin-sched-teacher">{sched.teacher}</p>
                          {sched.slots.map(slot=>(
                            <div key={slot.id} className="admin-sched-slot">
                              <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:"2px"}}>
                                {slot.days.map(d=><span key={d} className="admin-sched-slot-day">{d.slice(0,3)}</span>)}
                              </div>
                              <span className="admin-sched-slot-time">{formatTime(slot.startTime)} – {formatTime(slot.endTime)} · {slot.room}</span>
                            </div>
                          ))}
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
                <Icon icon="solar:gift-bold" style={{fontSize:"1.5rem"}} />
              </div>
              <p className="daily-reward-desc">Complete one more task today to earn a Rare Mystery Box!</p>
              <div className="daily-reward-track">
                <div className="daily-reward-fill" style={{width:`${Math.min(100,progressPct)}%`}} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Admin FAB — only on home page in admin mode */}
      {effectiveAdmin && (
        <AdminFab context="quest" onAction={a=>handleFabAction(a,"quest")} />
      )}

      {renderMobileNav()}
      {renderAdminModals()}
      {renderSharedModal()}
    </div>
  );

  // ────── RENDER HELPERS ──────

  function renderMobileNav() {
    return (
      <div className="mobile-nav">
        <button className={`mobile-nav-btn${activePage==="home"?" mobile-nav-btn--active":""}`} onClick={()=>setActivePage("home")}>
          <Icon icon="solar:home-2-bold" style={{fontSize:"1.5rem"}} /><span>Quests</span>
        </button>
        <button className={`mobile-nav-btn${activePage==="schedule"?" mobile-nav-btn--active":""}`} onClick={()=>setActivePage("schedule")}>
          <Icon icon="solar:calendar-bold" style={{fontSize:"1.5rem"}} /><span>Schedule</span>
        </button>
        <button className={`mobile-nav-btn${activePage==="classmates"?" mobile-nav-btn--active":""}`} onClick={()=>setActivePage("classmates")}>
          <Icon icon="solar:users-group-rounded-bold" style={{fontSize:"1.5rem"}} /><span>Class</span>
        </button>
        <button className={`mobile-nav-btn${activePage==="settings"?" mobile-nav-btn--active":""}`} onClick={()=>setActivePage("settings")}>
          <Icon icon="solar:settings-bold" style={{fontSize:"1.5rem"}} /><span>Settings</span>
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
    if(!effectiveAdmin) return null;
    return (
      <>
        {/* Quest modals */}
        {adminModal.type==="addQuest"   && <QuestModal onSave={handleSaveQuest} onClose={()=>setAdminModal({type:"none"})} />}
        {adminModal.type==="editQuest"  && <QuestModal initial={adminModal.quest} onSave={handleSaveQuest} onClose={()=>setAdminModal({type:"none"})} />}
        {/* Pick states show overlays on cards — handled inline above */}
        {(adminModal.type==="pickEditQuest"||adminModal.type==="pickDeleteQuest") && (
          <div className="pick-banner">
            <span>{adminModal.type==="pickEditQuest"?"Click a quest card to edit it":"Click a quest card to delete it"}</span>
            <button className="pick-banner-cancel" onClick={()=>setAdminModal({type:"none"})}>Cancel</button>
          </div>
        )}
        {/* Schedule modals */}
        {adminModal.type==="addSchedule"  && <ScheduleModal onSave={handleSaveSchedule} onClose={()=>setAdminModal({type:"none"})} />}
        {adminModal.type==="editSchedule" && <ScheduleModal initial={adminModal.sched} onSave={handleSaveSchedule} onClose={()=>setAdminModal({type:"none"})} />}
        {adminModal.type==="pickEditSched" && (
          <div className="fab-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setAdminModal({type:"none"});}}>
            <div className="fab-modal-box">
              <div className="fab-modal-header">
                <h2 className="fab-modal-title">Select Schedule to Edit</h2>
                <button className="fab-modal-close" onClick={()=>setAdminModal({type:"none"})}>✕</button>
              </div>
              <div className="fab-modal-body" style={{gap:"0.75rem"}}>
                {schedules.map(s=>(
                  <button key={s.id} className="sched-pick-btn" onClick={()=>setAdminModal({type:"editSchedule",sched:s})}>
                    <span className="sched-pick-dot" style={{background:getColorForSubject(s.subject).border}} />
                    <div><p style={{margin:0,fontWeight:900}}>{s.subject}</p><p style={{margin:0,fontSize:"0.75rem",color:"var(--muted-foreground)"}}>{s.teacher}</p></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {adminModal.type==="pickDeleteSched" && (
          <div className="fab-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setAdminModal({type:"none"});}}>
            <div className="fab-modal-box">
              <div className="fab-modal-header">
                <h2 className="fab-modal-title">Select Schedule to Delete</h2>
                <button className="fab-modal-close" onClick={()=>setAdminModal({type:"none"})}>✕</button>
              </div>
              <div className="fab-modal-body" style={{gap:"0.75rem"}}>
                {schedules.map(s=>(
                  <button key={s.id} className="sched-pick-btn sched-pick-btn--delete" onClick={()=>handleDeleteSchedule(s.id)}>
                    <span className="sched-pick-dot" style={{background:"var(--destructive)"}} />
                    <div><p style={{margin:0,fontWeight:900}}>{s.subject}</p><p style={{margin:0,fontSize:"0.75rem",color:"var(--muted-foreground)"}}>{s.teacher}</p></div>
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