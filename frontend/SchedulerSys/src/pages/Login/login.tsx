import { useState } from "react";
import "./login.css";
import { Icon } from "@iconify/react";
import { register, login } from "../../services/user_service";
import loginBG from "../../assets/loginBG.svg";
import gamepad from "../../assets/gamepad.svg";
import { useModal } from "../../hooks/useModal";
import Modal from "../../components/Modal";

export default function LoginForm({ onLoginSuccess }) {
  const [tab, setTab] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const modal = useModal();

  const handleLogin = async () => {
    if (!username || !password) {
      modal.show({
        variant: "warning",
        title: "Missing Fields",
        description: "Please fill in all fields before continuing!",
        onOk: () => { modal.close(); },
      });
      return;
    }

    const result = await login({ username, password });

    if (result.status == 401) {
      modal.show({
        variant: "error",
        title: "User Error",
        description: result.message,
        onOk: () => { modal.close(); },
      });
      return;
    }

    if (result.status == 200) {
      modal.show({
        variant: "success",
        title: "Success",
        description: result.message,
        onOk: () => {
          modal.close();
          onLoginSuccess();
        },
      });
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !email || !confirmPassword) {
      modal.show({
        variant: "warning",
        title: "Missing Fields",
        description: "Please fill in all fields before continuing!",
        onOk: () => { modal.close(); },
      });
      return;
    }

    if (password !== confirmPassword) {
      modal.show({
        variant: "warning",
        title: "Password Mismatch",
        description: "Password does not match with confirm password!",
        onOk: () => { modal.close(); },
      });
      return;
    }

    const result = await register({ username, email, password });

    if (result.status == 409) {
      modal.show({
        variant: "error",
        title: "User Error",
        description: result.message,
        onOk: () => { modal.close(); },
      });
      return;
    }

    modal.show({
      variant: "success",
      title: "Success",
      description: result.message,
      onOk: () => {
        modal.close();
        setTab("login");
      },
    });
  };

  return (
    <div className="login-page">
      {/* ── Modal rendered at root level — never clipped by any parent ── */}
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

      {/* Dot pattern background */}
      <div className="dot-pattern" />

      <div className="login-grid">
        {/* ── LEFT: Hero Panel ── */}
        <div className="hero-panel">
          <div className="brand-badge">
            <img src={gamepad} className="brand-icon" />
            <span className="brand-name">ClassQuest</span>
          </div>

          <h1 className="hero-title">
            Level Up Your{" "}
            <br className="lg-break" />
            <span className="hero-title-accent">
              Learning
              <svg
                viewBox="0 0 100 20"
                className="hero-title-underline"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,10 Q50,20 100,10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="hero-description">
            Join your classes, track assignments, and earn XP to climb the
            school leaderboard!
          </p>

          <div className="hero-image-wrapper">
            <img
              alt="Gamified Education Hero"
              src={loginBG}
              className="hero-image"
            />
          </div>
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div className="form-panel">
          <div className="form-card">
            <Icon icon="solar:star-fall-bold" className="star-icon" />

            {/* Tab switcher */}
            <div className="tab-switcher">
              <button
                type="button"
                className={`tab-btn ${tab === "login" ? "tab-btn--active" : ""}`}
                onClick={() => {
                  setUsername("");
                  setPassword("");
                  setShowPassword(false);
                  setTab("login");
                }}
              >
                <Icon icon="solar:login-bold" className="tab-btn-icon" />
                Login
              </button>
              <button
                type="button"
                className={`tab-btn ${tab === "register" ? "tab-btn--active" : ""}`}
                onClick={() => {
                  setUsername("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                  setTab("register");
                }}
              >
                <Icon icon="solar:user-plus-bold" className="tab-btn-icon" />
                Sign Up
              </button>
            </div>

            {/* ── LOGIN TAB ── */}
            {tab === "login" && (
              <>
                <div className="form-header">
                  <h2 className="form-title">Player Login</h2>
                  <p className="form-subtitle">Ready to enter the arena?</p>
                </div>

                <div className="form-fields">
                  <div className="field-group">
                    <label className="field-label">Email or Username</label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <Icon icon="solar:user-bold" />
                      </div>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="player1@school.edu"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <div className="field-label-row">
                      <label className="field-label">Password</label>
                      <a href="#" className="forgot-link">Forgot?</a>
                    </div>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <Icon icon="solar:lock-keyhole-minimalistic-bold" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="text-input password-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword((p) => !p)}
                        tabIndex={-1}
                      >
                        <Icon
                          icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"}
                        />
                      </button>
                    </div>
                  </div>

                  <button type="button" className="submit-btn" onClick={handleLogin}>
                    <span>Start Game</span>
                    <Icon icon="solar:round-alt-arrow-right-bold" className="submit-btn-arrow" />
                  </button>
                </div>

                <div className="form-footer">
                  <p className="footer-text">
                    New Player?{" "}
                    <button
                      type="button"
                      className="footer-tab-link"
                      onClick={() => setTab("register")}
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* ── REGISTER TAB ── */}
            {tab === "register" && (
              <>
                <div className="form-header">
                  <h2 className="form-title">Join the Quest</h2>
                  <p className="form-subtitle">Create your player profile!</p>
                </div>

                <div className="form-fields">
                  <div className="field-group">
                    <label className="field-label">Username</label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <Icon icon="solar:gamepad-bold" />
                      </div>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="CoolStudent99"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Email</label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <Icon icon="solar:letter-bold" />
                      </div>
                      <input
                        type="email"
                        className="text-input"
                        placeholder="student1@lnu.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Password</label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <Icon icon="solar:lock-keyhole-minimalistic-bold" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="text-input password-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword((p) => !p)}
                        tabIndex={-1}
                      >
                        <Icon
                          icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Confirm Password</label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <Icon icon="solar:shield-check-bold" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="text-input password-input"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        tabIndex={-1}
                      >
                        <Icon
                          icon={showConfirmPassword ? "solar:eye-bold" : "solar:eye-closed-bold"}
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="submit-btn submit-btn--register"
                    onClick={handleRegister}
                  >
                    <span>Create Account</span>
                    <Icon icon="solar:cup-star-bold" className="submit-btn-arrow" />
                  </button>
                </div>

                <div className="form-footer">
                  <p className="footer-text">
                    Already a Player?{" "}
                    <button
                      type="button"
                      className="footer-tab-link"
                      onClick={() => setTab("login")}
                    >
                      Log In
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}