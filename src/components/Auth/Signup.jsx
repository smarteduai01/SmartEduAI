import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Signup({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const { username, password, confirmPassword } = formData;

    // Validation
    if (!isLogin) {
      if (password !== confirmPassword)
        return setMessage("⚠️ Passwords do not match");
      if (password.length < 6)
        return setMessage("⚠️ Password must be at least 6 characters");
    }

    const endpoint = isLogin ? "/login" : "/signup";

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("username", username);
        setMessage(
          isLogin
            ? "✅ Logged in — redirecting..."
            : "✅ Account created — redirecting..."
        );
        onAuthSuccess?.(); // Update parent state
        setTimeout(() => navigate("/aimcq"), 1200);
      } else {
        setMessage(`❌ ${data.error || "Server error"}`);
      }
    } catch (err) {
      setMessage("⚠️ Connection error");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Left panel with branding */}
        <div className="left-panel">
          <div className="left-inner">
            <h1>EduX</h1>
            <h2>AI-powered learning</h2>
            <p>
              Personalized learning paths, interactive quizzes & smart progress
              tracking.
            </p>
          </div>

          {/* Decorative shapes */}
          <div className="shapes">
            <span className="dot dot-1" />
            <span className="dot dot-2" />
            <span className="hex hex-1" />
            <span className="hex hex-2" />
          </div>
        </div>

        {/* Right panel with form */}
        <div className="right-panel">
          <div className="card">
            <div className="card-head">
              <h3>{isLogin ? "Welcome back" : "Create your account"}</h3>
              <p>
                {isLogin
                  ? "Login to continue learning."
                  : "Start your personalized learning journey."}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <input
                name="username"
                placeholder="Username"
                onChange={handleChange}
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
              {!isLogin && (
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  required
                />
              )}

              <button className="primary-btn" type="submit">
                {isLogin ? "Login" : "Sign Up"}
              </button>
            </form>

            {message && <div className="message">{message}</div>}

            <div className="toggle-line">
              <span>
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>
              <button
                className="link-btn"
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage("");
                }}
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </div>
          </div>

          {/* Illustration on right */}
          <div className="illustration" aria-hidden>
            <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stopColor="#00c6ff" />
                  <stop offset="1" stopColor="#0072ff" />
                </linearGradient>
              </defs>

              <rect
                x="20"
                y="40"
                width="60"
                height="90"
                rx="6"
                fill="url(#g1)"
                className="book book-1"
              />
              <rect
                x="100"
                y="30"
                width="60"
                height="100"
                rx="6"
                fill="#ffd166"
                className="book book-2"
              />
              <rect
                x="180"
                y="50"
                width="60"
                height="80"
                rx="6"
                fill="#7bd389"
                className="book book-3"
              />

              <g className="sparkles">
                <circle cx="250" cy="20" r="4" fill="#fff" />
                <circle cx="20" cy="10" r="3" fill="#fff" />
                <circle cx="260" cy="80" r="2.5" fill="#fff" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
