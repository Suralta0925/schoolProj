import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import logoutIcon from "../../assets/logout.svg";
import gamepad from "../../assets/gamepad.svg";
import type { User } from "../../types/types";
import "./Appheader.css";

const LEVEL = "LVL 12 • ROOKIE";

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

export interface NavItem {
  label: string;
  key: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
}

interface AppHeaderProps {
  user: User;
  navItems?: NavItem[];
  onLogout: () => void;
  onProfileClick?: () => void;
  /** Minimal mode (join page): brand card + user info, no nav or notif */
  minimal?: boolean;
  isAdmin?: boolean;
  adminMode?: boolean;
  onToggleAdminMode?: () => void;
}

export default function AppHeader({
  user,
  navItems = [],
  onLogout,
  onProfileClick,
  minimal = false,
  isAdmin = false,
  adminMode = false,
  onToggleAdminMode,
}: AppHeaderProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target as Node)
      ) setTooltipOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={`app-header ${minimal ? "app-header--minimal" : ""}`}>
      <div className="app-header-inner">

        {/* Left: Brand + Desktop Nav */}
        <div className="app-header-left">
          <div className={`app-brand ${minimal ? "app-brand--card" : ""}`}>
            <img src={gamepad} className="app-brand-icon" alt="" />
            <span className="app-brand-name">ClassQuest</span>
          </div>

          {/* Desktop-only nav — mobile uses bottom nav bar */}
          {!minimal && navItems.length > 0 && (
            <nav className="app-nav">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href ?? "#"}
                  className={`app-nav-link ${item.active ? "app-nav-link--active" : ""}`}
                  onClick={(e) => { if (item.onClick) { e.preventDefault(); item.onClick(); } }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Notif + extras + Avatar */}
        <div className="app-header-right">
          {!minimal && (
            <button className="app-notif-btn" aria-label="Notifications">
              <Icon icon="solar:bell-bold" />
              <span className="app-notif-dot" />
            </button>
          )}

          {adminMode && !minimal && (
            <div className="app-admin-badge">
              <Icon icon="solar:shield-bold" style={{ fontSize: "0.65rem" }} />
              ADMIN
            </div>
          )}

          {/* User info — only shown in minimal (join) mode */}
          {minimal && (
            <div className="app-user-info-minimal">
              <span className="app-user-name">{user.username}</span>
              <span className="app-user-level">{LEVEL}</span>
            </div>
          )}

          {/* Avatar + Tooltip */}
          <div className="app-profile-wrapper">
            <div
              ref={avatarRef}
              className="app-avatar"
              onClick={() => setTooltipOpen((p) => !p)}
            >
              {getInitial(user.username)}
            </div>

            {tooltipOpen && (
              <div ref={tooltipRef} className="app-tooltip">
                <div className="app-tooltip-header">
                  <div className="app-tooltip-avatar">{getInitial(user.username)}</div>
                  <div>
                    <p className="app-tooltip-username">{user.username}</p>
                    <p className="app-tooltip-level">{LEVEL}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="app-tooltip-btn"
                  onClick={() => { setTooltipOpen(false); onProfileClick?.(); }}
                >
                  <Icon icon="solar:user-bold" className="app-tooltip-btn-icon" />
                  Profile
                </button>

                {/* Admin mode toggle — only visible when API confirms admin */}
                {isAdmin && (
                  <button
                    type="button"
                    className={`app-tooltip-btn ${adminMode ? "app-tooltip-btn--admin-on" : "app-tooltip-btn--admin"}`}
                    onClick={() => { setTooltipOpen(false); onToggleAdminMode?.(); }}
                  >
                    <Icon
                      icon={adminMode ? "solar:shield-check-bold" : "solar:shield-bold"}
                      className="app-tooltip-btn-icon"
                    />
                    {adminMode ? "Exit Admin Mode" : "Admin Mode"}
                  </button>
                )}

                <button
                  type="button"
                  className="app-tooltip-btn app-tooltip-btn--logout"
                  onClick={() => { setTooltipOpen(false); onLogout(); }}
                >
                  <img src={logoutIcon} className="app-tooltip-btn-icon" alt="" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}