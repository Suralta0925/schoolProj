import { useState } from "react";
import { Icon } from "@iconify/react";
import type { User } from "../../types/types";
import "./styles/profile.css";

// ─────────────────────────────────────────────
// TODO: Replace stubs with real API calls
//
// PATCH /api/user/profile
// Body: { username: string }
// Returns: { status: number; message: string }
//
// DELETE /api/user/profile
// Returns: { status: number; message: string }
// On success → logout + redirect to login
// ─────────────────────────────────────────────

async function updateUsername(newUsername: string): Promise<{ status: number; message: string }> {
  // TODO: connect to PATCH /api/user/profile
  console.log("PATCH /api/user/profile", { username: newUsername });
  // Placeholder — always resolves OK
  return { status: 200, message: "Username updated successfully." };
}

async function deleteProfile(): Promise<{ status: number; message: string }> {
  // TODO: connect to DELETE /api/user/profile
  console.log("DELETE /api/user/profile");
  return { status: 200, message: "Account deleted." };
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

interface ProfilePageProps {
  user: User;
  onBack?: () => void;
  /** Called after successful delete so the app can log out */
  onDeleteSuccess?: () => void;
}

export default function ProfilePage({ user, onBack, onDeleteSuccess }: ProfilePageProps) {
  const [username, setUsername] = useState(user.username);
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    if (!usernameInput.trim() || usernameInput.trim() === username) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await updateUsername(usernameInput.trim());
      if (res.status === 200) {
        setUsername(usernameInput.trim());
        setSaveMsg({ ok: true, text: res.message });
      } else {
        setSaveMsg({ ok: false, text: res.message });
      }
    } catch {
      setSaveMsg({ ok: false, text: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await deleteProfile();
      if (res.status === 200) {
        onDeleteSuccess?.();
      } else {
        alert(res.message);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="profile-page">
      {/* Top bar */}
      <div className="profile-page-topbar">
        {onBack && (
          <button className="profile-page-back-btn" onClick={onBack}>
            <Icon icon="solar:arrow-left-bold" style={{ fontSize: "1.25rem" }} />
          </button>
        )}
        <div>
          <h2 className="profile-page-title">
            My <span className="profile-page-title-accent">Profile</span>
          </h2>
          <p className="profile-page-sub">Manage your account details</p>
        </div>
      </div>

      {/* ── AVATAR PREVIEW ── */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-big">{getInitial(username)}</div>
        <div>
          <p className="profile-avatar-name">{username}</p>
          {/* TODO: show email from API — GET /api/user/profile */}
          <p className="profile-avatar-email">{user.email ?? "email@school.edu"}</p>
        </div>
      </div>

      {/* ── UPDATE USERNAME ── */}
      <section className="profile-section">
        <div className="profile-section-header">
          <Icon icon="solar:user-bold" className="profile-section-icon" />
          <h3 className="profile-section-title">Update Profile</h3>
        </div>

        <div className="profile-card">
          <div className="profile-field">
            <label className="profile-label">Username</label>
            {/* TODO: connect to PATCH /api/user/profile on save */}
            <input
              className="profile-input"
              type="text"
              value={usernameInput}
              onChange={(e) => {
                setUsernameInput(e.target.value);
                setSaveMsg(null);
              }}
              placeholder="Enter new username"
              maxLength={50}
            />
          </div>

          {saveMsg && (
            <p className={`profile-save-msg ${saveMsg.ok ? "profile-save-msg--ok" : "profile-save-msg--err"}`}>
              {saveMsg.text}
            </p>
          )}

          <button
            className="profile-save-btn"
            onClick={handleSave}
            disabled={saving || !usernameInput.trim() || usernameInput.trim() === username}
          >
            {saving ? (
              <>
                <span className="profile-spinner" />
                Saving...
              </>
            ) : (
              <>
                <Icon icon="solar:check-circle-bold" style={{ fontSize: "1rem" }} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </section>

      {/* ── DANGER ZONE ── */}
      <section className="profile-section profile-section--danger">
        <div className="profile-section-header">
          <Icon icon="solar:danger-bold" className="profile-section-icon profile-section-icon--danger" />
          <h3 className="profile-section-title profile-section-title--danger">Danger Zone</h3>
        </div>

        <div className="profile-danger-card">
          <div className="profile-danger-info">
            <p className="profile-danger-title">Delete Account</p>
            <p className="profile-danger-desc">
              Permanently delete your account and all associated data. You will be logged out immediately.
              {/* TODO: connect to DELETE /api/user/profile */}
            </p>
          </div>
          <button className="profile-delete-btn" onClick={handleDelete} disabled={deleting}>
            <Icon icon="solar:trash-bin-trash-bold" style={{ fontSize: "1rem" }} />
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </section>
    </div>
  );
}