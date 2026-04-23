import "./ScheduleCard.css";

export interface ScheduleItem {
  id: number;
  subject: string;
  room: string;
  startTime: string; // "HH:MM" 24h
  endTime: string;   // "HH:MM" 24h
}

interface ScheduleCardProps {
  item: ScheduleItem;
  variant?: "sidebar" | "full";
  isActive?: boolean;
  isPast?: boolean;
}

// Deterministic color assignment based on subject name hash
const COLOR_PALETTE = [
  { bg: "rgba(6,182,212,0.2)",   border: "rgba(6,182,212,1)",   label: "rgba(6,182,212,1)"   }, // cyan / primary
  { bg: "rgba(217,70,239,0.2)",  border: "rgba(217,70,239,1)",  label: "rgba(217,70,239,1)"  }, // accent purple
  { bg: "rgba(234,179,8,0.2)",   border: "rgba(234,179,8,1)",   label: "rgba(161,120,0,1)"   }, // yellow/chart-3
  { bg: "rgba(34,197,94,0.2)",   border: "rgba(34,197,94,1)",   label: "rgba(21,128,61,1)"   }, // green/chart-2
  { bg: "rgba(239,68,68,0.2)",   border: "rgba(239,68,68,1)",   label: "rgba(239,68,68,1)"   }, // red
  { bg: "rgba(168,85,247,0.2)",  border: "rgba(168,85,247,1)",  label: "rgba(168,85,247,1)"  }, // violet
  { bg: "rgba(251,146,60,0.2)",  border: "rgba(251,146,60,1)",  label: "rgba(194,65,12,1)"   }, // orange
  { bg: "rgba(20,184,166,0.2)",  border: "rgba(20,184,166,1)",  label: "rgba(17,94,89,1)"    }, // teal
];

// Simple string hash so same subject always gets same color
function hashSubject(subject: string): number {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = (hash * 31 + subject.charCodeAt(i)) % COLOR_PALETTE.length;
  }
  return hash;
}

export function getColorForSubject(subject: string) {
  return COLOR_PALETTE[hashSubject(subject)];
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export default function ScheduleCard({ item, variant = "sidebar", isActive = false, isPast = false }: ScheduleCardProps) {
  const color = getColorForSubject(item.subject);

  if (variant === "sidebar") {
    return (
      <div className={`sched-sidebar-item ${isPast ? "sched-sidebar-item--past" : ""} ${isActive ? "sched-sidebar-item--active" : ""}`}>
        <div className="sched-sidebar-time">
          <p className="sched-time-start">{formatTime(item.startTime)}</p>
          <p className="sched-time-end">{formatTime(item.endTime)}</p>
        </div>
        <div
          className="sched-sidebar-block"
          style={{ background: color.bg, borderColor: isActive ? color.border : "var(--border)" }}
        >
          {isActive && <span className="sched-active-dot" style={{ background: color.border }} />}
          <p className="sched-block-title">{item.subject}</p>
          <p className="sched-block-room">{item.room}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`sched-full-card ${isPast ? "sched-full-card--past" : ""} ${isActive ? "sched-full-card--active" : ""}`}
      style={{ borderLeftColor: color.border }}
    >
      <div className="sched-full-card-color-bar" style={{ background: color.bg, borderColor: color.border }}>
        <span className="sched-full-card-subject" style={{ color: color.label }}>{item.subject}</span>
      </div>
      <div className="sched-full-card-details">
        <p className="sched-full-card-room">{item.room}</p>
        <p className="sched-full-card-time">{formatTime(item.startTime)} – {formatTime(item.endTime)}</p>
      </div>
      {isActive && (
        <div className="sched-full-card-active-badge">NOW</div>
      )}
    </div>
  );
}