import { Icon } from "@iconify/react";
import ScheduleCard, { type ScheduleItem } from "./cards/ScheduleCard";
import "./styles/Schedule.css";
import { getSched } from "../../services/class_service";
import { useEffect, useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


//FORTMAT
//{SECTION: {DATE: [{}]}}

// export const schedule: Record<string, ScheduleItem[]> = {
//   "Monday": [
//     { id: 1, subject: "Introduction to Computing", room: "COMLAB6A", startTime: "07:30", endTime: "09:00" },
//     { id: 2, subject: "Computer Programming I - Java Lab", room: "COMLAB2A", startTime: "09:00", endTime: "10:30" },
//     { id: 3, subject: "Readings in Philippine History", room: "CON305A", startTime: "10:30", endTime: "12:00" },
//     { id: 4, subject: "Understanding the Self", room: "CON202A", startTime: "13:00", endTime: "14:30" },
//     { id: 5, subject: "IT101L(Information Technology Laboratory)", room: "COMLAB4A", startTime: "14:30", endTime: "16:00" }
//   ],
//   Tuesday: [
//     { id: 6, subject: "IT101(Informat ion Technology)", room: "COMLAB5A", startTime: "08:00", endTime: "09:00" },
//     { id: 7, subject: "PATHFIT-1", room: "TBA", startTime: "09:00", endTime: "10:00" },
//     { id: 8, subject: "Accounting Principle", room: "COMLAB1A", startTime: "17:30", endTime: "19:00" }
//   ],
//   Wednesday: [
//     { id: 9, subject: "Computer Programming I - Java", room: "COMLAB2A", startTime: "10:00", endTime: "00:00" } // Note: "12:00 AM" converted to "00:00"
//   ],
//   Thursday: [
//     { id: 10, subject: "Introduction to Computing", room: "COMLAB6A", startTime: "07:30", endTime: "09:00" },
//     { id: 11, subject: "Computer Programming I - Java Lab", room: "COMLAB2A", startTime: "09:00", endTime: "10:30" },
//     { id: 12, subject: "Readings in Philippine History", room: "CON305A", startTime: "10:30", endTime: "12:00" },
//     { id: 13, subject: "Understanding the Self", room: "CON202A", startTime: "13:00", endTime: "14:30" },
//     { id: 14, subject: "IT101L(Information Technology Laboratory)", room: "COMLAB4A", startTime: "14:30", endTime: "16:00" }
//   ],
//   Friday: [
//     { id: 15, subject: "IT101(Information Technology)", room: "COMLAB5A", startTime: "08:00", endTime: "09:00" },
//     { id: 16, subject: "PATHFIT-1", room: "TBA", startTime: "09:00", endTime: "10:00" },
//     { id: 17, subject: "Accounting Principle", room: "COMLAB1A", startTime: "17:30", endTime: "19:00" }
//   ],
//   Saturday: [
//     { id: 18, subject: "NSTP - CWTS", room: "HUM12A", startTime: "08:00", endTime: "17:00" }
//   ],
//   Sunday: [
//     { id: 19, subject: "NSTP - CWTS", room: "HUM12A", startTime: "08:00", endTime: "17:00" }
//   ]
// };


let globalSchedule: Record<string, ScheduleItem[]> = {}
let listeners: Function[] = []
let isLoaded = false


// eslint-disable-next-line react-refresh/only-export-components
export const useWeeklySchedule = () => {
  const [schedule, setSchedule] = useState(globalSchedule)
  const [loading, setLoading] = useState(!isLoaded)

  useEffect(() => {
    const listener = (data: typeof globalSchedule) => {
      setSchedule(data)
    }

    listeners.push(listener)

    if (!isLoaded) {
      const load = async () => {
        try {
          const data = await getSched()
          globalSchedule = data
          isLoaded = true

          listeners.forEach(l => l(globalSchedule))
        } catch (err) {
          console.error(err)
        } finally {
          setLoading(false)
        }
      }

      load()
    } else {
      setLoading(false)
    }

    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  return { schedule, loading }
}

export const updateSchedule = (newData: typeof globalSchedule) => {
  globalSchedule = newData
  listeners.forEach(l => l(globalSchedule))
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

function getTodayKey(): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

interface SchedulePageProps {
  onBack?: () => void;
  /**
   * When true, hides the SchedulePage's own sticky header.
   * Used when embedded inside the Dashboard where AppHeader is already rendered.
   * This also prevents the sched-header from competing with AppHeader's z-index
   * and causing the tooltip to render behind it.
   */
  hideHeader?: boolean;
}

export default function SchedulePage({ onBack, hideHeader = false }: SchedulePageProps) {
  const  {schedule, loading} = useWeeklySchedule()
  if (loading) return (<p>Loading...</p>)
  const todayKey = getTodayKey();
  
  return (
    <div className="sched-page">
      {/* Own header — hidden when embedded in Dashboard (AppHeader handles navigation) */}
      {!hideHeader && (
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
              Full <span className="sched-page-title-accent">Schedule</span>
            </h1>
          </div>
        </header>
      )}

      <main className="sched-main">
        {/* Today highlight */}
        <section className="sched-today-section">
          <div className="sched-today-header">
            <span className="sched-today-badge">TODAY</span>
            <h2 className="sched-today-day">{todayKey}</h2>
          </div>

          {schedule[todayKey] ? (
            <div className="sched-today-list">
              {schedule[todayKey].map((item) => (
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
                  {schedule[day]?.length ? (
                    schedule[day].map((item) => (
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