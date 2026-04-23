import "./join.css";
import { useState, useRef, useEffect } from "react";
import type { User } from "../../types/types";
import { logout } from "../../services/user_service";
import logoutIcon from "../../assets/logout.svg"
import shield from "../../assets/shield.svg"
import castle from "../../assets/castle.svg"
import gamepad from "../../assets/gamepad.svg"


const LEVEL = "LVL 12 • ROOKIE";

type JoinProp = {
  user: User,
  onLogoutSuccess: () => Promise<void>
}

function getInitial(name) {
  return name.trim().charAt(0).toUpperCase();
}

export default function Join({user, onLogoutSuccess}: JoinProp) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef(null);
  const avatarRef = useRef(null);
  

  const handleLogout = async () => {
     const result = await logout()
     if (result){
      onLogoutSuccess()
     }
  }


  useEffect(() => {
    function handleClickOutside(e) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target)
      ) {
        setTooltipOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="action-page">
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
                  <img
                    src={logoutIcon}
                    className="tooltip-logout-icon"
                  />
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
            Are you joining an existing class guild or founding a new academy?
          </p>
        </div>

        <div className="action-cards">
          {/* ── JOIN A GUILD ── */}
          <div className="action-card">
            <div className="card-img-ring card-img-ring--primary">
              <img
                src="https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/MccbqcpaqHL/components/v9JdBpTZ8Wd.png"
                alt="Join a Guild"
                className="card-img"
              />
            </div>
            <h2 className="card-title">Join a Guild</h2>
            <p className="card-desc">
              Enter a class code provided by your instructor to join your
              teammates and start quests.
            </p>
            <div className="card-actions">
              <input
                type="text"
                className="card-input"
                placeholder="ENTER GUILD CODE"
              />
              <button type="button" className="card-btn card-btn--primary">
                Join Class
              </button>
            </div>
          </div>

          {/* ── FOUND ACADEMY ── */}
          <div className="action-card">
            <div className="card-img-ring card-img-ring--accent">
              <img
                src="https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/MccbqcpaqHL/components/FQRYoj1TIor.png"
                alt="Found Academy"
                className="card-img"
              />
            </div>
            <h2 className="card-title">Found Academy</h2>
            <p className="card-desc">
              Create a new classroom space, manage assignments, and lead your
              students to victory.
            </p>
            <div className="card-bottom">
              <button type="button" className="card-btn card-btn--accent">
                Create Class
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}