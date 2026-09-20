import { useState } from "react";
import Modal from "./Modal.jsx";
import { CheckIcon } from "./icons.jsx";

const CRAFT_OPTIONS = [
  { id: "baker", label: "Home Baker & Confectionery" },
  { id: "nails", label: "Nail Artist & Esthetics" },
  { id: "resin", label: "Resin & Epoxy Crafts" },
  { id: "painter", label: "Painter & Fine Arts" },
  { id: "tailor", label: "Tailor, Stitching & Boutique" },
  { id: "tiffin", label: "Tiffin Service & Meal Prep" },
  { id: "craft", label: "Handmade Crafts & Gifts" },
];

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = "login",
  canClose = true,
}) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("baker");
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  // Password strength calculation
  const passwordStrength = (() => {
    if (!password) return "";
    if (password.length < 6) return "Weak (at least 6 characters required)";
    if (password.length >= 8 && /[0-9]/.test(password) && /[A-Z]/.test(password)) return "Strong";
    return "Medium";
  })();

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed. Please check credentials.");
      }

      if (rememberMe && data.token) {
        localStorage.setItem("startup_iq_token", data.token);
      }
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    if (e) e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          businessName: businessName.trim() || `${name}'s Studio`,
          businessType,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Signup failed. Please try again.");
      }

      if (data.token) {
        localStorage.setItem("startup_iq_token", data.token);
      }
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickDemoLogin() {
    setEmail("founder@startapiq.com");
    setPassword("password123");
    setTimeout(() => {
      handleLogin();
    }, 100);
  }

  return (
    <Modal
  title={mode === "login" ? "Log In to Startup IQ" : "Create Startup IQ Workspace"}
  onClose={onClose}
  canClose={canClose}
>
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={`auth-tab ${mode === "login" ? "is-active" : ""}`}
          onClick={() => {
            setMode("login");
            setError(null);
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          role="tab"
          className={`auth-tab ${mode === "signup" ? "is-active" : ""}`}
          onClick={() => {
            setMode("signup");
            setError(null);
          }}
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="auth-error-banner" role="alert">
          {error}
        </div>
      )}

      {mode === "login" ? (
        <form onSubmit={handleLogin} style={{ marginTop: 16 }}>
          <div className="field">
            <label className="field-label" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field" style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="field-label" htmlFor="login-pass" style={{ margin: 0 }}>
                Password
              </label>
              <button
                type="button"
                className="text-btn"
                onClick={() => setShowPassword((p) => !p)}
                style={{ fontSize: "0.75rem" }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="login-pass"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="checkbox-row" style={{ marginTop: 12, justifyContent: "space-between" }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember this session</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: 20 }}
          >
            {loading ? "Signing In..." : "Sign In to Workspace"}
          </button>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button
              type="button"
              className="btn btn-secondary btn-block btn-sm"
              onClick={handleQuickDemoLogin}
              title="Sign in immediately using pre-seeded founder account"
            >
              🚀 Instant Demo Founder Login
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignup} style={{ marginTop: 16 }}>
          <div className="field">
            <label className="field-label" htmlFor="signup-name">
              Your Full Name
            </label>
            <input
              id="signup-name"
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label" htmlFor="signup-email">
              Work or Personal Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@brand.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-2" style={{ marginTop: 12 }}>
            <div className="field" style={{ margin: 0 }}>
              <label className="field-label" htmlFor="signup-biz-name">
                Business / Studio Name
              </label>
              <input
                id="signup-biz-name"
                placeholder="e.g. Flour & Bloom"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label className="field-label">Craft Domain</label>
              <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                {CRAFT_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2" style={{ marginTop: 12 }}>
            <div className="field" style={{ margin: 0 }}>
              <label className="field-label" htmlFor="signup-pass">
                Password
              </label>
              <input
                id="signup-pass"
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label className="field-label" htmlFor="signup-confirm-pass">
                Confirm Password
              </label>
              <input
                id="signup-confirm-pass"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {password && (
            <p className="helper-text" style={{ marginTop: 6, fontSize: "0.78rem" }}>
              Strength: <strong>{passwordStrength}</strong>
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: 22 }}
          >
            {loading ? "Creating Workspace..." : "Create Workspace & Get Started"}
          </button>
        </form>
      )}
    </Modal>
  );
}
