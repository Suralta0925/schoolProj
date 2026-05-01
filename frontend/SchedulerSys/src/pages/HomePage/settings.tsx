import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import "./styles/settings.css";
import { getClassInfo, leaveClass } from "../../services/class_service";

export interface ClassProfile {
  classCode: string;
  section: string;
  year: string;
  program: string;
  createdAt: string;
  memberCount: number;
}

// TODO: GET /api/class/:classId/profile
// Returns: { status: number; data: ClassProfile }
// const PLACEHOLDER_CLASS: ClassProfile = {
//   classCode: "BSIT1A-2024",
//   section: "BSIT-1A",
//   year: "1st Year",
//   program: "Bachelor of Science in Information Technology",
//   createdAt: "2024-08-01",
//   memberCount: 32,
// };



function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

interface SettingsPageProps {
  onBack?: () => void;
  /** True when API confirms this user is the class admin/creator */  
  isAdmin?: boolean;
  /** useModal().show — pass from parent so we use the shared modal */
  showModal: (opts: unknown) => void;
  closeModal: () => void;
  /** Called after leave/delete succeeds — redirect to join page */
  onLeaveSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export default function SettingsPage({
  onBack,
  isAdmin = false,
  showModal,
  closeModal,
  onLeaveSuccess,
  onDeleteSuccess,
}: SettingsPageProps) {
  const [copied, setCopied] = useState(false);
  const [classProfile, setClassProfile] = useState<ClassProfile | null>(null)
  

  // TODO: GET /api/class/:classId/profile on mount
  useEffect(() => {
    async function loadClass(){
      try{
        const data = await getClassInfo();
        setClassProfile(data)
      }catch(err){
        console.log(err)
      }
    }
    loadClass()
  }, [])

  if (!classProfile){
    return <div>Loading...</div>;
  }

  function handleCopy() {
  if (!classProfile) return;

  navigator.clipboard.writeText(classProfile.classCode).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  });
}

  function handleLeaveClass() {
    showModal({
      variant: "decision",
      title: "Leave Class",
      description: `Are you sure you want to leave "${classProfile.section}"? You will need a new class code to rejoin.`,
      confirmLabel: "Leave Class",
      cancelLabel: "Stay",
      onCancel: () => closeModal(),
      onConfirm: async () => {
        await leaveClass()
        closeModal();
        onLeaveSuccess?.();
      },
    });
  }

  function handleDeleteClass() {
    showModal({
      variant: "decision",
      title: "Delete Class",
      description: `Permanently delete "${classProfile.section}" and all its data? This cannot be undone and all members will lose access immediately.`,
      confirmLabel: "Delete Class",
      cancelLabel: "Cancel",
      onCancel: () => closeModal(),
      onConfirm: async () => {
        // TODO: DELETE /api/class/:classId
        // Returns: { status: number; message: string }
        closeModal();
        onDeleteSuccess?.();
      },
    });
  }

  return (
    <div className="settings-page">
      <div className="subpage-topbar">
        {onBack && <button className="subpage-back-btn" onClick={onBack}>←</button>}
        <div>
          <h2 className="subpage-title">Class <span className="subpage-title-accent">Settings</span></h2>
          <p className="subpage-sub">Manage your class configuration</p>
        </div>
      </div>

      {/* ── CLASS PROFILE ── */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Icon icon="solar:buildings-bold" className="settings-section-icon" />
          <h3 className="settings-section-title">Class Profile</h3>
        </div>

        <div className="settings-card">
          {/* Class code row with functional copy */}
          <div className="settings-code-row">
            <span className="settings-code-label">Class Code</span>
            <span className="settings-code-value">{classProfile.classCode}</span>
            <button
              className={`settings-copy-btn ${copied ? "settings-copy-btn--copied" : ""}`}
              onClick={handleCopy}
              disabled={!classProfile}
              title="Copy class code"
            >
              <Icon icon={copied ? "solar:check-circle-bold" : "solar:copy-bold"} style={{ fontSize: "1rem" }} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="settings-info-grid">
            {/* TODO: all values from GET /api/class/:id/profile */}
            <div className="settings-info-item">
              <span className="settings-info-label">Section</span>
              <span className="settings-info-value">{classProfile.section}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Year Level</span>
              <span className="settings-info-value">{classProfile.year}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Members</span>
              <span className="settings-info-value">{classProfile.memberCount}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Created</span>
              <span className="settings-info-value">{formatDate(classProfile.createdAt)}</span>
            </div>
          </div>

          <div className="settings-info-item settings-info-item--full">
            <span className="settings-info-label">Program</span>
            <span className="settings-info-value">{classProfile.program}</span>
          </div>
        </div>
      </section>

      {/* ── DANGER ZONE ── */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Icon icon="solar:danger-bold" className="settings-section-icon settings-section-icon--danger" />
          <h3 className="settings-section-title settings-section-title--danger">Danger Zone</h3>
        </div>

        {/* Leave class — always visible to all members */}
        <div className="settings-danger-card">
          <div className="settings-danger-info">
            <p className="settings-danger-title">Leave Class</p>
            <p className="settings-danger-desc">
              Remove yourself from this class. You'll need a class code to rejoin.
              {/* TODO: POST /api/class/:classId/leave */}
            </p>
          </div>
          <button className="settings-action-btn settings-action-btn--leave" onClick={handleLeaveClass}>
            <Icon icon="solar:logout-2-bold" style={{ fontSize: "1rem" }} />
            Leave Class
          </button>
        </div>

        {/* Delete class — only rendered for admin users (API must confirm) */}
        {isAdmin && (
          <div className="settings-danger-card settings-danger-card--delete">
            <div className="settings-danger-info">
              <p className="settings-danger-title">Delete Class</p>
              <p className="settings-danger-desc">
                Permanently delete this class and all its data. All members lose access immediately.
                {/* TODO: DELETE /api/class/:classId */}
              </p>
            </div>
            <button className="settings-action-btn settings-action-btn--delete" onClick={handleDeleteClass}>
              <Icon icon="solar:trash-bin-trash-bold" style={{ fontSize: "1rem" }} />
              Delete Class
            </button>
          </div>
        )}
      </section>
    </div>
  );
}