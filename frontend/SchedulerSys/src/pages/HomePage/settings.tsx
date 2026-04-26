import { Icon } from "@iconify/react";
import "./styles/settings.css";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ClassProfile {
  id: string;
  classCode: string;
  section: string;
  year: string;
  program: string;
  /** ISO date string */
  createdAt: string;
  memberCount: number;
}

// ─────────────────────────────────────────────
// TODO: Replace placeholder with API call
// GET /api/class/:classId/profile
// Returns: { status: number; data: ClassProfile }
// Example shape:
// {
//   id: "cls-abc123",
//   classCode: "BSIT1A-2024",
//   section: "BSIT-1A",
//   year: "1st Year",
//   program: "Bachelor of Science in Information Technology",
//   createdAt: "2024-08-01T00:00:00.000Z",
//   memberCount: 32
// }
// ─────────────────────────────────────────────

const PLACEHOLDER_CLASS: ClassProfile = {
  id: "cls-placeholder",
  classCode: "BSIT1A-2024",
  section: "BSIT-1A",
  year: "1st Year",
  program: "Bachelor of Science in Information Technology",
  createdAt: "2024-08-01T00:00:00.000Z",
  memberCount: 32,
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

interface SettingsPageProps {
  onBack?: () => void;
  /** Called when delete is confirmed — hook up to your API + logout/redirect */
  onDeleteClass?: () => void;
}

export default function SettingsPage({ onBack, onDeleteClass }: SettingsPageProps) {
  // TODO: fetch class profile from API on mount
  // useEffect(() => {
  //   fetch(`/api/class/${classId}/profile`, { credentials: "include" })
  //     .then(r => r.json())
  //     .then(data => setClassProfile(data.data));
  // }, [classId]);

  const classProfile = PLACEHOLDER_CLASS;

  function handleDeleteClass() {
    // TODO: wire up to confirmation modal + DELETE /api/class/:classId
    // On success call onDeleteClass?.() to redirect the user
    if (window.confirm(`Are you sure you want to delete class "${classProfile.section}"? This cannot be undone.`)) {
      onDeleteClass?.();
    }
  }

  return (
    <div className="settings-page">
      {/* Top bar */}
      <div className="settings-topbar">
        {onBack && (
          <button className="settings-back-btn" onClick={onBack}>
            <Icon icon="solar:arrow-left-bold" style={{ fontSize: "1.25rem" }} />
          </button>
        )}
        <div>
          <h2 className="settings-page-title">
            Class <span className="settings-page-title-accent">Settings</span>
          </h2>
          <p className="settings-page-sub">Manage your class configuration</p>
        </div>
      </div>

      {/* ── CLASS PROFILE CARD ── */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Icon icon="solar:buildings-bold" className="settings-section-icon" />
          <h3 className="settings-section-title">Class Profile</h3>
        </div>

        <div className="settings-class-card">
          {/* Class code badge */}
          <div className="settings-code-row">
            <span className="settings-code-label">Class Code</span>
            <span className="settings-code-value">{classProfile.classCode}</span>
            <button
              className="settings-copy-btn"
              onClick={() => navigator.clipboard.writeText(classProfile.classCode)}
              title="Copy class code"
            >
              <Icon icon="solar:copy-bold" style={{ fontSize: "1rem" }} />
            </button>
          </div>

          {/* Info grid */}
          <div className="settings-info-grid">
            <div className="settings-info-item">
              <span className="settings-info-label">Section</span>
              {/* TODO: connect to API — section from GET /api/class/:id/profile */}
              <span className="settings-info-value">{classProfile.section}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Year Level</span>
              {/* TODO: connect to API */}
              <span className="settings-info-value">{classProfile.year}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Members</span>
              {/* TODO: connect to API */}
              <span className="settings-info-value">{classProfile.memberCount}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Created</span>
              {/* TODO: connect to API */}
              <span className="settings-info-value">{formatDate(classProfile.createdAt)}</span>
            </div>
          </div>

          {/* Program */}
          <div className="settings-info-item settings-info-item--full">
            <span className="settings-info-label">Program</span>
            {/* TODO: connect to API */}
            <span className="settings-info-value">{classProfile.program}</span>
          </div>
        </div>
      </section>

      {/* ── DANGER ZONE ── */}
      <section className="settings-section settings-section--danger">
        <div className="settings-section-header">
          <Icon icon="solar:danger-bold" className="settings-section-icon settings-section-icon--danger" />
          <h3 className="settings-section-title settings-section-title--danger">Danger Zone</h3>
        </div>

        <div className="settings-danger-card">
          <div className="settings-danger-info">
            <p className="settings-danger-title">Delete Class</p>
            <p className="settings-danger-desc">
              Permanently delete this class and all its data. This action cannot be undone.
              All members will lose access immediately.
              {/* TODO: connect to DELETE /api/class/:classId */}
            </p>
          </div>
          <button className="settings-delete-btn" onClick={handleDeleteClass}>
            <Icon icon="solar:trash-bin-trash-bold" style={{ fontSize: "1rem" }} />
            Delete Class
          </button>
        </div>
      </section>
    </div>
  );
}