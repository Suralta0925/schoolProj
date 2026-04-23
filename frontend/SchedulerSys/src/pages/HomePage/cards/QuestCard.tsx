import { Icon } from "@iconify/react";
import "./QuestCard.css";

export type QuestStatus = "ongoing" | "finished";

export interface Quest {
  id: number;
  title: string;
  subject: string;
  instructor: string;
  deadline: Date;
  status: QuestStatus;
}

interface QuestCardProps {
  quest: Quest;
  onToggleStatus: (id: number) => void;
}

function getDeadlineInfo(deadline: Date, status: QuestStatus) {
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (status === "finished") {
    return { label: deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), urgency: "finished" as const };
  }

  if (diffMs < 0) {
    return { label: "OVERDUE", urgency: "overdue" as const };
  }
  if (diffMins < 60) {
    return { label: `IN ${diffMins} MIN${diffMins !== 1 ? "S" : ""}!`, urgency: "critical" as const };
  }
  if (diffHours < 24) {
    return { label: `IN ${diffHours} HOUR${diffHours !== 1 ? "S" : ""}!`, urgency: "urgent" as const };
  }
  if (diffDays === 1) {
    return { label: "TOMORROW", urgency: "soon" as const };
  }
  return {
    label: deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    urgency: "normal" as const,
  };
}

function getStatusIcon(urgency: string) {
  switch (urgency) {
    case "finished": return { icon: "solar:check-circle-bold", color: "var(--chart-2)" };
    case "overdue": return { icon: "solar:danger-bold", color: "var(--destructive)" };
    case "critical": return { icon: "solar:fire-bold", color: "var(--destructive)" };
    case "urgent": return { icon: "solar:fire-bold", color: "var(--destructive)" };
    case "soon": return { icon: "solar:clock-circle-bold", color: "var(--chart-3)" };
    default: return { icon: "solar:book-bookmark-bold", color: "var(--primary)" };
  }
}

export default function QuestCard({ quest, onToggleStatus }: QuestCardProps) {
  const { label, urgency } = getDeadlineInfo(quest.deadline, quest.status);
  const { icon, color } = getStatusIcon(urgency);

  return (
    <div className={`quest-card quest-card--${urgency}`}>
      {(urgency === "critical" || urgency === "urgent" || urgency === "overdue") && (
        <div className={`quest-card-urgent-badge quest-card-urgent-badge--${urgency}`}>
          {urgency === "overdue" ? "OVERDUE" : "URGENT"}
        </div>
      )}

      <div className="quest-card-inner">
        <div className="quest-card-icon-wrap" style={{ background: `${color}1A`, borderColor: color }}>
          <Icon icon={icon} style={{ fontSize: "1.875rem", color }} />
        </div>

        <div className="quest-card-body">
          <div className="quest-card-meta-row">
            <span
              className={`quest-card-status-badge quest-card-status-badge--${urgency}`}
              style={{ color, borderColor: color }}
            >
              {quest.status === "finished" ? "COMPLETED" : "TO-DO"}
            </span>
            <span
              className={`quest-card-deadline ${urgency === "critical" || urgency === "urgent" || urgency === "overdue" ? "quest-card-deadline--hot" : ""}`}
              style={urgency === "critical" || urgency === "urgent" || urgency === "overdue" ? { color: "var(--destructive)" } : {}}
            >
              {label}
            </span>
          </div>

          <h4 className="quest-card-title">{quest.title}</h4>
          <p className="quest-card-sub">{quest.subject} • {quest.instructor}</p>
        </div>
      </div>

      <div className="quest-card-footer">
        <button
          className={`quest-toggle-btn quest-toggle-btn--${quest.status === "finished" ? "revert" : "finish"}`}
          onClick={() => onToggleStatus(quest.id)}
        >
          <Icon
            icon={quest.status === "finished" ? "solar:restart-bold" : "solar:check-square-bold"}
            style={{ fontSize: "1rem" }}
          />
          {quest.status === "finished" ? "Mark as Ongoing" : "Mark as Finished"}
        </button>
      </div>
    </div>
  );
}