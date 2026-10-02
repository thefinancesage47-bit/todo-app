import { useState } from "react";
import * as api from "../api";

/**
 * AuthForm - one form that switches between "Log in" and "Sign up".
 *
 * Props:
 *   onAuthSuccess - called with (user, isNewAccount) after a successful login/signup
 */
export default function AuthForm({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false); // disables the button while waiting

  const isSignup = mode === "signup";

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the page from reloading
    setError("");
    setSubmitting(true);

    try {
      // Both endpoints return { token, user }
      const { token, user } = isSignup
        ? await api.register(name, email, password)
        : await api.login(email, password);

      api.setToken(token); // save the token so future requests are authenticated
      onAuthSuccess(user, isSignup); // tell App.js who is logged in (and if they just signed up)
    } catch (err) {
      setError(err.message); // e.g. "Invalid email or password"
      setSubmitting(false);
    }
  };

  // Switch between login and signup, clearing any old error
  const toggleMode = () => {
    setMode(isSignup ? "login" : "signup");
    setError("");
  };

  return (
    <div className="auth">
      <h2>{isSignup ? "Create an account" : "Welcome back"}</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        {/* The name field only appears when signing up */}
        {isSignup && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder={isSignup ? "Password (min 6 characters)" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={isSignup ? 6 : undefined}
          // Lets password managers know whether to suggest a new or saved password
          autoComplete={isSignup ? "new-password" : "current-password"}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      <p className="auth-switch">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button type="button" className="link-btn" onClick={toggleMode}>
          {isSignup ? "Log in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}
