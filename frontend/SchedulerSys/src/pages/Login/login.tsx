import { useState } from "react";
import "./login.css";
import { Icon } from "@iconify/react";
import {register, login} from "../../services/user_service";
import loginBG from "../../assets/loginBG.svg"
import gamepad from "../../assets/gamepad.svg"
import { useModal } from "../../hooks/useModal";
import Modal from "../../components/Modal";

export default function LoginForm({onLoginSuccess}) {
    const [tab, setTab] = useState("login");
    const [username,setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const modal = useModal()


    const handleLogin = async () => {
      
        if (!username || !password){
            modal.show({
              variant: "warning",
              title: "Missing Fields",
              description: "Please fill in all fiellds before continuing!"
            })
            return
        }
        const result = await login({
          username: username,
          password: password
        })
        if (result.status == 401){
          modal.show({
              variant: "error",
              title: "User Error",
              description: result.message,
              onOk: () => {modal.close()}
            })
            return
        }
        if (result.status == 200){
          modal.show({
              variant: "success",
              title: "Success",
              description: result.message,
              onOk: () => {onLoginSuccess()},
              
            })
          
          
        }
    }

    const handleRegister = async () => {

        if (!username || !password || !email || !confirmPassword){
          modal.show({
              variant: "warning",
              title: "Missing Fields",
              description: "Please fill in all fiellds before continuing!"
            })
            return
        }
        if (password !== confirmPassword){
          modal.show({
              variant: "warning",
              title: "Password",
              description: "Password does not macth with confirm password!"
            })
            return
        }
        const result = await register({
            username: username,
            email: email,
            password: password
        })
        if (result.status == 409){
          modal.show({
              variant: "error",
              title: "User Error",
              description: result.message
            })
            return
        }
          modal.show({
              variant: "success",
              title: "Success",
              description: result.message
            })
        return
        
    }
  

  return (
    <div className="login-page">
      {/* Dot pattern background */}
      <div className="dot-pattern" />

      <div className="login-grid">
        {/* ── LEFT: Hero Panel ── */}
        <div className="hero-panel">
          {/* Brand badge */}
          <div className="brand-badge">
            <Modal
            {...modal.state} onOk={modal.state.onOk} onCancel={modal.close}/>
            <img
              src={gamepad}
              className="brand-icon"
            />
            <span className="brand-name">ClassQuest</span>
          </div>

          {/* Headline */}
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

          {/* Tagline */}
          <p className="hero-description">
            Join your classes, track assignments, and earn XP to climb the
            school leaderboard!
          </p>

          {/* Hero image */}
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
            {/* Decorative star */}
            <Icon
              icon="solar:star-fall-bold"
              className="star-icon"
            />

            {/* Tab switcher */}
            <div className="tab-switcher">
              <button
                type="button"
                className={`tab-btn ${tab === "login" ? "tab-btn--active" : ""}`}
                onClick={() =>{
                  setUsername(null)
                  setPassword(null)
                  setTab("login")
                } }
              >
                <Icon icon="solar:login-bold" className="tab-btn-icon" />
                Login
              </button>
              <button
                type="button"
                className={`tab-btn ${tab === "register" ? "tab-btn--active" : ""}`}
                onClick={() =>{
                  setUsername(null)
                  setEmail(null)
                  setPassword(null)
                  setConfirmPassword(null)
                  setTab("register")
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
                        type="email"
                        className="text-input"
                        placeholder="player1@school.edu"
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
                        type="password"
                        className="text-input password-input"
                        placeholder="••••••••"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="button" className="submit-btn" onClick={handleLogin}>
                    <span >Start Game</span>
                    <Icon
                      icon="solar:round-alt-arrow-right-bold"
                      className="submit-btn-arrow"
                    />
                  </button>
                </div>

                <div className="form-footer">
                  <p className="footer-text">
                    New Player?{" "}
                    <button type="button" className="footer-tab-link" onClick={() => setTab("register")}>
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
                        type="password"
                        className="text-input password-input"
                        placeholder="••••••••"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Confirm Password</label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <Icon icon="solar:shield-check-bold" />
                      </div>
                      <input
                        type="password"
                        className="text-input password-input"
                        placeholder="••••••••"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="button" className="submit-btn submit-btn--register" onClick={handleRegister}>
                    <span>Create Account</span>
                    <Icon
                      icon="solar:cup-star-bold"
                      className="submit-btn-arrow"
                    />
                  </button>
                </div>

                <div className="form-footer">
                  <p className="footer-text">
                    Already a Player?{" "}
                    <button type="button" className="footer-tab-link" onClick={() => setTab("login")}>
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