import "./join.css";
import { useState, useRef, useEffect } from "react";
import type { User } from "../../types/types";
import { logout } from "../../services/user_service";
import logoutIcon from "../../assets/logout.svg";
import shield from "../../assets/shield.svg";
import castle from "../../assets/castle.svg";
import gamepad from "../../assets/gamepad.svg";
import Modal from "../../components/Modal";
import { useModal } from "../../hooks/useModal";
import { classRoute } from "../../config/config";


// ─────────────────────────────────────────────
// PLACEHOLDER APIS — TODO: replace with real endpoints
// ─────────────────────────────────────────────

/**
 * TODO: connect to database
 * POST /api/class/create
 * Body: { section, year, program, createdBy: user.id }
 * Returns: { status: number, message: string, classCode?: string }
 */
async function createClass(payload: {
  section: string;
  year: string;
  program: string;
}): Promise<{ status: number; message: string; classCode?: string }> {
  // TODO: replace with actual API call
  const res = await fetch(`${classRoute}/create`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

/**
 * TODO: connect to database
 * POST /api/class/join
 * Body: { code: string, userId: user.id }
 * Returns: { status: number, message: string }
 */
async function joinClass(payload: {
  code: string;
}): Promise<{ status: number; message: string }> {
  // TODO: replace with actual API call
  const res = await fetch(`${classRoute}/join`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "class_code": payload.code
    })
  });
  const data = await res.json();
  console.log(data)
  return data
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const LEVEL = "LVL 1 • ROOKIE";

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const PROGRAMS = [
  "Bachelor of Science in Information Technology",
  "Bachelor of Science in Computer Science",
  "Bachelor of Science in Information Systems",
  "Bachelor of Science in Computer Engineering",
  "Bachelor of Science in Electronics Engineering",
  "Bachelor of Science in Electrical Engineering",
  "Bachelor of Science in Civil Engineering",
  "Bachelor of Science in Mechanical Engineering",
  "Bachelor of Science in Nursing",
  "Bachelor of Science in Education",
  "Bachelor of Arts in Communication",
  "Bachelor of Science in Business Administration",
  "Bachelor of Science in Accountancy",
  "Bachelor of Science in Tourism Management",
  "Bachelor of Science in Hospitality Management",
];

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type JoinProp = {
  user: User;
  authUser: () => Promise<void>
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

// ─────────────────────────────────────────────
// CREATE CLASS MODAL
// ─────────────────────────────────────────────

interface CreateClassModalProps {
  user: User;
  onClose: () => void;
  onResult: (variant: "success" | "error", title: string, message: string) => void;
}

function CreateClassModal({ onClose, onResult }: CreateClassModalProps) {
  const [section, setSection] = useState("");
  const [year, setYear] = useState("");
  const [program, setProgram] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ section?: string; year?: string; program?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!section.trim()) e.section = "Section is required.";
    if (!year) e.year = "Year level is required.";
    if (!program) e.program = "Program is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCreate() {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await createClass({
        section: section.trim(),
        year,
        program
      });
      onClose();
      if (result.status === 200) {
        onResult(
          "success",
          "Class Created!",
          result.classCode
            ? `${result.message} Your class code is: ${result.classCode}`
            : result.message
        );
      } else {
        onResult("error", "Failed to Create", result.message);
      }
    } catch {
      onClose();
      onResult("error", "Network Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cmodal-overlay">
      <div className="cmodal-box">
        {/* Header */}
        <div className="cmodal-header">
          <div className="cmodal-header-icon">
            <img src={castle} alt="Create Class" className="cmodal-header-img" />
          </div>
          <div>
            <h2 className="cmodal-title">Create Class</h2>
            <p className="cmodal-subtitle">Set up your classroom </p>
          </div>
          <button className="cmodal-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="cmodal-body">
          {/* Section */}
          <div className="cmodal-field">
            <label className="cmodal-label">Section</label>
            <input
              className={`cmodal-input ${errors.section ? "cmodal-input--error" : ""}`}
              type="text"
              placeholder="e.g. BSIT-1A"
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
                setErrors((prev) => ({ ...prev, section: undefined }));
              }}
            />
            {errors.section && <p className="cmodal-error-msg">{errors.section}</p>}
          </div>

          {/* Year Level */}
          <div className="cmodal-field">
            <label className="cmodal-label">Year Level</label>
            <select
              className={`cmodal-select ${errors.year ? "cmodal-input--error" : ""}`}
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setErrors((prev) => ({ ...prev, year: undefined }));
              }}
            >
              <option value="">Select year level...</option>
              {YEAR_LEVELS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {errors.year && <p className="cmodal-error-msg">{errors.year}</p>}
          </div>

          {/* Program */}
          <div className="cmodal-field">
            <label className="cmodal-label">Program</label>
            <select
              className={`cmodal-select ${errors.program ? "cmodal-input--error" : ""}`}
              value={program}
              onChange={(e) => {
                setProgram(e.target.value);
                setErrors((prev) => ({ ...prev, program: undefined }));
              }}
            >
              <option value="">Select program...</option>
              {PROGRAMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.program && <p className="cmodal-error-msg">{errors.program}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="cmodal-footer">
          <button className="cmodal-btn cmodal-btn--cancel" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="cmodal-btn cmodal-btn--create"
            type="button"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="cmodal-spinner" />
                Creating...
              </>
            ) : (
              <>Create Class ✦</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function Join({ user, authUser }: JoinProp) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [guildCode, setGuildCode] = useState("");
  const [joining, setJoining] = useState(false);

  const tooltipRef = useRef(null);
  const avatarRef = useRef(null);
  const modal = useModal();

  // ── Logout ──
  const handleLogout = () => {
    setTooltipOpen(false);
    modal.show({
      variant: "decision",
      title: "Logout",
      description: "Are you sure you want to logout?",
      confirmLabel: "Logout!",
      cancelLabel: "Cancel",
      onCancel: () => modal.close(),
      onConfirm: async () => {
        modal.close();
        await logout();
        authUser();
      },
    });
  };

  // ── Join class ──
  const handleJoinClass = async () => {
    if (!guildCode.trim()) {
      modal.show({
        variant: "warning",
        title: "Missing Code",
        description: "Please enter a guild code before joining.",
        onOk: () => modal.close(),
      });
      return;
    }

    setJoining(true);
    try {
      const result = await joinClass({
        code: guildCode.trim(),
      });

      if (result.status === 200) {
        modal.show({
          variant: "success",
          title: "Class Joined!",
          description: result.message,
          onOk: () => {modal.close();authUser(); },
        });
        setGuildCode("");
      } else {
        modal.show({
          variant: "error",
          title: "Failed to Join",
          description: result.message,
          onOk: () => {modal.close(); setGuildCode("")},
        });
      }
    } catch {
      modal.show({
        variant: "error",
        title: "Network Error",
        description: "Something went wrong. Please try again.",
        onOk: () => modal.close(),
      });
    } finally {
      setJoining(false);
    }
  };

  // ── Callback from CreateClassModal after API responds ──
  function handleCreateResult(variant: "success" | "error", title: string, message: string) {
    modal.show({
      variant,
      title,
      description: message,
      onOk: () => modal.close(),
    });
  }

  // ── Close tooltip on outside click ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        tooltipRef.current &&
        !(tooltipRef.current as any).contains(e.target) &&
        avatarRef.current &&
        !(avatarRef.current as any).contains(e.target)
      ) {
        setTooltipOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="action-page">
      {/* ── Universal Modal ── */}
      <Modal
        open={modal.state.open}
        variant={modal.state.variant}
        title={modal.state.title}
        description={modal.state.description}
        confirmLabel={modal.state.confirmLabel}
        cancelLabel={modal.state.cancelLabel}
        onConfirm={modal.state.onConfirm}
        onCancel={modal.state.onCancel}
        okLabel={modal.state.okLabel}
        onOk={modal.state.onOk}
      />

      {/* ── Create Class Modal ── */}
      {showCreateModal && (
        <CreateClassModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onResult={handleCreateResult}
        />
      )}

      {/* ── HEADER ── */}
      <header className="action-header">
        <div className="header-brand">
          <img src={gamepad} className="header-brand-icon" />
          <span className="header-brand-name">ClassQuest</span>
        </div>

        <div className="header-user">
          <div className="header-user-info">
            <span className="header-user-name">{user.username}</span>
            <span className="header-user-level">{LEVEL}</span>
          </div>

          <div className="profile-wrapper">
            <div
              ref={avatarRef}
              className="avatar"
              onClick={() => setTooltipOpen((prev) => !prev)}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              {getInitial(user.username)}
            </div>

            {tooltipOpen && (
              <div ref={tooltipRef} className="profile-tooltip">
                <div className="tooltip-header">
                  <p className="tooltip-username">{user.username}</p>
                  <p className="tooltip-level">{LEVEL}</p>
                </div>
                <button type="button" className="tooltip-logout-btn" onClick={handleLogout}>
                  <img src={logoutIcon} className="tooltip-logout-icon" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="action-main">
        <div className="action-hero">
          <h1 className="action-hero-title">
            Choose Your <span className="action-hero-title-accent">Path</span>
          </h1>
          <p className="action-hero-desc">
            Are you joining an existing class or creating a new class?
          </p>
        </div>

        <div className="action-cards">
          {/* ── JOIN A GUILD ── */}
          <div className="action-card">
            <div className="card-img-ring card-img-ring--primary">
              <img src={shield} alt="Join a Class" className="card-img" />
            </div>
            <h2 className="card-title">Join a Class</h2>
            <p className="card-desc">
              Enter a class code provided by your class president to join your
              classmates and start quests.
            </p>
            <div className="card-actions">
              <input
                type="text"
                className="card-input"
                placeholder="ENTER CLASS CODE"
                value={guildCode}
                onChange={(e) => setGuildCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinClass()}
                maxLength={20}
              />
              <button
                type="button"
                className="card-btn card-btn--primary"
                onClick={handleJoinClass}
                disabled={joining}
              >
                {joining ? "Joining..." : "Join a Class"}
              </button>
            </div>
          </div>

          {/* ── Create Class ── */}
          <div className="action-card">
            <div className="card-img-ring card-img-ring--accent">
              <img src={castle} alt="Create Class" className="card-img" />
            </div>
            <h2 className="card-title">Create Class</h2>
            <p className="card-desc">
              Create a new classroom space, manage assignments, and lead your
              students to victory.
            </p>
            <div className="card-bottom">
              <button
                type="button"
                className="card-btn card-btn--accent"
                onClick={() => setShowCreateModal(true)}
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}