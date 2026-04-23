import { Icon } from "@iconify/react";
import ScheduleCard, { type ScheduleItem } from "./cards/ScheduleCard";
import "./Schedule.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Full weekly schedule data
export const WEEKLY_SCHEDULE: Record<string, ScheduleItem[]> = {
  Monday: [
    { id: 1,  subject: "Introduction to Computing",   room: "COMLAB6A",  startTime: "07:30", endTime: "09:00" },
    { id: 2,  subject: "Java Programming Lab",         room: "COMLAB2A",  startTime: "09:00", endTime: "10:30" },
    { id: 3,  subject: "Understanding the Self",       room: "CON202A",   startTime: "13:00", endTime: "14:30" },
  ],
  Tuesday: [
    { id: 4,  subject: "Philippine History",           room: "HUM101A",   startTime: "08:00", endTime: "09:30" },
    { id: 5,  subject: "Mathematics in the Modern World", room: "MATH201B", startTime: "10:00", endTime: "11:30" },
  ],
  Wednesday: [
    { id: 6,  subject: "Introduction to Computing",   room: "COMLAB6A",  startTime: "07:30", endTime: "09:00" },
    { id: 7,  subject: "Java Programming Lab",         room: "COMLAB2A",  startTime: "09:00", endTime: "10:30" },
    { id: 8,  subject: "Purposive Communication",      room: "ENG301C",   startTime: "14:00", endTime: "15:30" },
  ],
  Thursday: [
    { id: 9,  subject: "Philippine History",           room: "HUM101A",   startTime: "08:00", endTime: "09:30" },
    { id: 10, subject: "Mathematics in the Modern World", room: "MATH201B", startTime: "10:00", endTime: "11:30" },
    { id: 11, subject: "Understanding the Self",       room: "CON202A",   startTime: "13:00", endTime: "14:30" },
    { id: 9,  subject: "Philippine History",           room: "HUM101A",   startTime: "14:30", endTime: "15:30" },
    { id: 10, subject: "Mathematics in the Modern World", room: "MATH201B", startTime: "15:30", endTime: "16:30" },
    { id: 11, subject: "Understanding the Self",       room: "CON202A",   startTime: "17:00", endTime: "18:30" },
  ],
  Friday: [
    { id: 12, subject: "Introduction to Computing",   room: "COMLAB6A",  startTime: "07:30", endTime: "09:00" },
    { id: 13, subject: "Purposive Communication",      room: "ENG301C",   startTime: "10:00", endTime: "11:30" },
  ],
  Saturday: [
    { id: 14, subject: "Mathematics in the Modern World", room: "MATH201B", startTime: "09:00", endTime: "12:00" },
  ],
};

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

function getTodayKey(): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

interface SchedulePageProps {
  onBack?: () => void;
}

export default function SchedulePage({ onBack }: SchedulePageProps) {
  const todayKey = getTodayKey();

  return (
    <div className="sched-page">
      {/* Header */}
      <header className="sched-header">
        <div className="sched-header-inner">
          <div className="sched-header-left">
            {onBack && (
              <button className="sched-back-btn" onClick={onBack}>
                <Icon icon="solar:arrow-left-bold" style={{ fontSize: "1.25rem" }} />
              </button>
            )}
            <div className="sched-brand">
              <Icon icon="solar:gamepad-bold" style={{ fontSize: "1.875rem", color: "var(--primary)" }} />
              <span className="sched-brand-name">ClassQuest</span>
            </div>
          </div>
          <h1 className="sched-page-title">
            Full <span className="sched-page-title-accent">Map</span>
          </h1>
        </div>
      </header>

      <main className="sched-main">
        {/* Today highlight */}
        <section className="sched-today-section">
          <div className="sched-today-header">
            <span className="sched-today-badge">TODAY</span>
            <h2 className="sched-today-day">{todayKey}</h2>
          </div>

          {WEEKLY_SCHEDULE[todayKey] ? (
            <div className="sched-today-list">
              {WEEKLY_SCHEDULE[todayKey].map((item) => (
                <ScheduleCard
                  key={item.id}
                  item={item}
                  variant="full"
                  isActive={isItemActive(item)}
                  isPast={isItemPast(item)}
                />
              ))}
            </div>
          ) : (
            <div className="sched-empty">
              <Icon icon="solar:sun-bold" style={{ fontSize: "3rem", color: "var(--chart-3)" }} />
              <p>No classes today. Enjoy your day!</p>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="sched-divider" />

        {/* Full week */}
        <section className="sched-week-section">
          <h2 className="sched-week-title">Weekly Schedule</h2>
          <div className="sched-week-grid">
            {DAYS.map((day) => (
              <div key={day} className={`sched-day-col ${day === todayKey ? "sched-day-col--today" : ""}`}>
                <div className="sched-day-label-row">
                  <span className="sched-day-label">{day.slice(0, 3)}</span>
                  {day === todayKey && <span className="sched-day-today-dot" />}
                </div>
                <div className="sched-day-items">
                  {WEEKLY_SCHEDULE[day]?.length ? (
                    WEEKLY_SCHEDULE[day].map((item) => (
                      <ScheduleCard
                        key={item.id}
                        item={item}
                        variant="full"
                        isActive={day === todayKey && isItemActive(item)}
                        isPast={day === todayKey && isItemPast(item)}
                      />
                    ))
                  ) : (
                    <div className="sched-day-empty">No classes</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}