import { useEffect, useState } from "react";
import "./styles/classmates.css";
import { classRoute } from "../../config/config";

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
   const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClassmates() {
      try {
        const response = await fetch(`${classRoute}/getStudents`, {
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch classmates");
        }

        const data = await response.json();

        setClassmates(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchClassmates();
  }, []);

   if (loading) {
    return <p>Loading classmates...</p>;
  }



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