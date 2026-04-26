import { Icon } from "@iconify/react";
import "./styles/classmates.css";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface Classmate {
  id: string;
  username: string;
  email: string;
  /** optional role tag, e.g. "Class President", "Member" */
  role?: string;
  /** XP points */
  xp?: number;
  /** level number */
  level?: number;
}

// ─────────────────────────────────────────────
// TODO: Replace placeholder data with API call
// GET /api/class/:classId/members
// Returns: { status: number; data: Classmate[] }
// Example shape:
// [
//   { id: "u-1", username: "Vince Ian Suralta", email: "vince@school.edu", role: "Class President", xp: 850, level: 12 },
//   { id: "u-2", username: "Maria Santos",      email: "maria@school.edu", role: "Member",          xp: 420, level: 7  }
// ]
// ─────────────────────────────────────────────

const PLACEHOLDER_CLASSMATES: Classmate[] = [
  { id: "u-1", username: "Vince Ian Suralta",  email: "vince@school.edu",  role: "Class President", xp: 850,  level: 12 },
  { id: "u-2", username: "Maria Santos",        email: "maria@school.edu",  role: "Member",           xp: 420,  level: 7  },
  { id: "u-3", username: "James Dela Cruz",     email: "james@school.edu",  role: "Member",           xp: 670,  level: 10 },
  { id: "u-4", username: "Ana Reyes",           email: "ana@school.edu",    role: "Member",           xp: 310,  level: 5  },
  { id: "u-5", username: "Kevin Lim",           email: "kevin@school.edu",  role: "Member",           xp: 540,  level: 9  },
  { id: "u-6", username: "Sofia Garcia",        email: "sofia@school.edu",  role: "Member",           xp: 190,  level: 3  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

// Deterministic avatar color based on username
const AVATAR_COLORS = [
  "#06b6d4", "#22c55e", "#eab308", "#d946ef", "#ef4444", "#a855f7", "#fb923c", "#14b8a6",
];

function avatarColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = (hash * 31 + username.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

// ─────────────────────────────────────────────
// CLASSMATE CARD
// ─────────────────────────────────────────────

function ClassmateCard({ classmate }: { classmate: Classmate }) {
  const color = avatarColor(classmate.username);

  return (
    <div className="classmate-card">
      {/* Avatar + Initial */}
      <div className="classmate-card-avatar" style={{ background: color }}>
        {getInitial(classmate.username)}
      </div>

      {/* Info */}
      <div className="classmate-card-info">
        <p className="classmate-card-name">{classmate.username}</p>
        {/* TODO: connect to API — email comes from GET /api/class/:id/members */}
        <p className="classmate-card-email">{classmate.email}</p>

        <div className="classmate-card-meta">
          {classmate.role && (
            <span className="classmate-card-role">{classmate.role}</span>
          )}
          {classmate.level !== undefined && (
            <span className="classmate-card-level">LVL {classmate.level}</span>
          )}
          {classmate.xp !== undefined && (
            <span className="classmate-card-xp">{classmate.xp} XP</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

interface ClassmatesPageProps {
  onBack?: () => void;
}

export default function ClassmatesPage({ onBack }: ClassmatesPageProps) {
  // TODO: replace PLACEHOLDER_CLASSMATES with API fetch
  // useEffect(() => {
  //   fetch(`/api/class/${classId}/members`, { credentials: "include" })
  //     .then(r => r.json())
  //     .then(data => setClassmates(data.data));
  // }, [classId]);

  const classmates = PLACEHOLDER_CLASSMATES;

  return (
    <div className="classmates-page">
      {/* Header row */}
      <div className="classmates-page-topbar">
        {onBack && (
          <button className="classmates-back-btn" onClick={onBack}>
            <Icon icon="solar:arrow-left-bold" style={{ fontSize: "1.25rem" }} />
          </button>
        )}
        <div>
          <h2 className="classmates-page-title">
            Class<span className="classmates-page-title-accent">mates</span>
          </h2>
          <p className="classmates-page-sub">{classmates.length} members in your guild</p>
        </div>
      </div>

      {/* Grid */}
      <div className="classmates-grid">
        {classmates.map((c) => (
          <ClassmateCard key={c.id} classmate={c} />
        ))}
      </div>

      {classmates.length === 0 && (
        <div className="classmates-empty">
          <Icon icon="solar:users-group-rounded-bold" style={{ fontSize: "3rem", opacity: 0.3 }} />
          <p>No classmates yet.</p>
        </div>
      )}
    </div>
  );
}