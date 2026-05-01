import "./styles/classmates.css";

export interface Classmate {
  id: string;
  username: string;
  email: string;
  role?: string;
  xp?: number;
  level?: number;
}

// TODO: Replace with API call
// GET /api/class/:classId/members
// Returns: { status: number; data: Classmate[] }
const PLACEHOLDER_CLASSMATES: Classmate[] = [
  { id: "u-1", username: "Vince Ian Suralta",  email: "vince@school.edu",  role: "Class President", xp: 850, level: 12 },
  { id: "u-2", username: "Maria Santos",        email: "maria@school.edu",  role: "Member",           xp: 420, level: 7  },
  { id: "u-3", username: "James Dela Cruz",     email: "james@school.edu",  role: "Member",           xp: 670, level: 10 },
  { id: "u-4", username: "Ana Reyes",           email: "ana@school.edu",    role: "Member",           xp: 310, level: 5  },
  { id: "u-5", username: "Kevin Lim",           email: "kevin@school.edu",  role: "Member",           xp: 540, level: 9  },
  { id: "u-6", username: "Sofia Garcia",        email: "sofia@school.edu",  role: "Member",           xp: 190, level: 3  },
];

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

const AVATAR_COLORS = [
  "#06b6d4","#22c55e","#eab308","#d946ef","#ef4444","#a855f7","#fb923c","#14b8a6",
];

function avatarColor(username: string) {
  let h = 0;
  for (let i = 0; i < username.length; i++) h = (h * 31 + username.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function ClassmateCard({ c }: { c: Classmate }) {
  return (
    <div className="classmate-card">
      <div className="classmate-card-avatar" style={{ background: avatarColor(c.username) }}>
        {getInitial(c.username)}
      </div>
      <div className="classmate-card-info">
        <p className="classmate-card-name">{c.username}</p>
        {/* TODO: email from GET /api/class/:id/members */}
        <p className="classmate-card-email">{c.email}</p>
        <div className="classmate-card-meta">
          {c.role    && <span className="classmate-badge classmate-badge--role">{c.role}</span>}
          {c.level   !== undefined && <span className="classmate-badge classmate-badge--level">LVL {c.level}</span>}
          {c.xp      !== undefined && <span className="classmate-badge classmate-badge--xp">{c.xp} XP</span>}
        </div>
      </div>
    </div>
  );
}

export default function ClassmatesPage({ onBack }: { onBack?: () => void }) {
  // TODO: fetch classmates from API
  const classmates = PLACEHOLDER_CLASSMATES;
  return (
    <div className="classmates-page">
      <div className="subpage-topbar">
        {onBack && (
          <button className="subpage-back-btn" onClick={onBack}>←</button>
        )}
        <div>
          <h2 className="subpage-title">Class<span className="subpage-title-accent">mates</span></h2>
          <p className="subpage-sub">{classmates.length} members in your guild</p>
        </div>
      </div>
      <div className="classmates-grid">
        {classmates.map((c) => <ClassmateCard key={c.id} c={c} />)}
      </div>
    </div>
  );
}