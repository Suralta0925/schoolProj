import { useState } from "react";
import { Icon } from "@iconify/react";
import type { User } from "../../types/types";
import "./styles/profile.css";

// TODO: PATCH /api/user/profile  Body: { username }  Returns: { status, message }
async function apiUpdateUsername(newUsername: string): Promise<{ status: number; message: string }> {
  console.log("PATCH /api/user/profile", { username: newUsername });
  return { status: 200, message: "Username updated successfully." };
}

// TODO: DELETE /api/user/profile  Returns: { status, message }
async function apiDeleteProfile(): Promise<{ status: number; message: string }> {
  console.log("DELETE /api/user/profile");
  return { status: 200, message: "Account deleted." };
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

interface ProfilePageProps {
  user: User;
  onBack?: () => void;
  /** Called after delete success — parent logs user out */
  onDeleteSuccess?: () => void;
  /** Pass the parent's modal helpers so we use the shared modal */
  showModal: (opts: any) => void;
  closeModal: () => void;
}

export default function ProfilePage({ user, onBack, onDeleteSuccess, showModal, closeModal }: ProfilePageProps) {
  const [username, setUsername]         = useState(user.username);
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [saving, setSaving]             = useState(false);
  const [saveMsg, setSaveMsg]           = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSave() {
    if (!usernameInput.trim() || usernameInput.trim() === username) return;
    setSaving(true); setSaveMsg(null);
    try {
      const res = await apiUpdateUsername(usernameInput.trim());
      if (res.status === 200) {
        setUsername(usernameInput.trim());
        setSaveMsg({ ok: true, text: res.message });
      } else {
        setSaveMsg({ ok: false, text: res.message });
      }
    } catch {
      setSaveMsg({ ok: false, text: "Something went wrong. Please try again." });
    } finally { setSaving(false); }
  }

  function handleDelete() {
    showModal({
      variant: "decision",
      title: "Delete Account",
      description: "Permanently delete your account and all associated data? You will be logged out immediately.",
      confirmLabel: "Delete Account",
      cancelLabel: "Cancel",
      onCancel: () => closeModal(),
      onConfirm: async () => {
        const res = await apiDeleteProfile();
        closeModal();
        if (res.status === 200) onDeleteSuccess?.();
      },
    });
  }

  return (
    <div className="profile-page">
      <div className="subpage-topbar">
        {onBack && <button className="subpage-back-btn" onClick={onBack}>←</button>}
        <div>
          <h2 className="subpage-title">My <span className="subpage-title-accent">Profile</span></h2>
          <p className="subpage-sub">Manage your account details</p>
        </div>
      </div>

      {/* Avatar preview */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-big">{getInitial(username)}</div>
        <div>
          <p className="profile-avatar-name">{username}</p>
          {/* TODO: email from GET /api/user/profile */}
          <p className="profile-avatar-email">{(user as any).email ?? "email@school.edu"}</p>
        </div>
      </div>

      {/* Update username */}
      <section className="profile-section">
        <div className="profile-section-header">
          <Icon icon="solar:user-bold" className="profile-section-icon" />
          <h3 className="profile-section-title">Update Profile</h3>
        </div>
        <div className="profile-card">
          <div className="profile-field">
            <label className="profile-label">Username</label>
            {/* TODO: PATCH /api/user/profile on save */}
            <input
              className="profile-input"
              value={usernameInput}
              onChange={(e) => { setUsernameInput(e.target.value); setSaveMsg(null); }}
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
            {saving ? <><span className="profile-spinner" />Saving...</> : <><Icon icon="solar:check-circle-bold" style={{ fontSize: "1rem" }} />Save Changes</>}
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="profile-section">
        <div className="profile-section-header">
          <Icon icon="solar:danger-bold" className="profile-section-icon profile-section-icon--danger" />
          <h3 className="profile-section-title profile-section-title--danger">Danger Zone</h3>
        </div>
        <div className="profile-danger-card">
          <div>
            <p className="profile-danger-title">Delete Account</p>
            <p className="profile-danger-desc">
              Permanently delete your account and all associated data. You will be logged out.
              {/* TODO: DELETE /api/user/profile */}
            </p>
          </div>
          <button className="profile-delete-btn" onClick={handleDelete}>
            <Icon icon="solar:trash-bin-trash-bold" style={{ fontSize: "1rem" }} />
            Delete Account
          </button>
        </div>
      </section>
    </div>
  );
}