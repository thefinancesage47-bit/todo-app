import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";
import * as api from "./api";
import AuthForm from "./components/AuthForm";
import TodoPage from "./components/TodoPage";

/**
 * App - decides what to show based on whether someone is logged in:
 *   - checking the saved token -> "Loading..."
 *   - not logged in            -> login / signup form
 *   - logged in                -> header with logout + the todo page
 *
 * It also renders <Toaster />, the container where all toast notifications
 * appear. Any component can show one by calling toast.success() / toast.error().
 */
function App() {
  const [user, setUser] = useState(null); // the logged-in user, or null
  // Start in "checking" mode only if a token was saved from a previous visit
  const [checkingAuth, setCheckingAuth] = useState(() => Boolean(api.getToken()));

  // Log out: forget the token and the user. Nothing to tell the server, because
  // a JWT isn't stored on the server - deleting it on our side is enough.
  // useCallback keeps the same function between renders (it's used in useEffect below).
  const logout = useCallback(() => {
    api.clearToken();
    setUser(null);
  }, []);

  // Clicking "Log out"
  const handleLogout = () => {
    logout();
    toast.success("Logged out");
  };

  // Called by AuthForm after a successful login or signup
  const handleAuthSuccess = (loggedInUser, isNewAccount) => {
    setUser(loggedInUser);
    toast.success(isNewAccount ? `Welcome, ${loggedInUser.name}!` : `Welcome back, ${loggedInUser.name}!`);
  };

  useEffect(() => {
    // If the server ever rejects our token (e.g. expired), api.js calls this.
    // The fixed "id" stops the same toast from showing twice.
    api.setUnauthorizedHandler(() => {
      logout();
      toast.error("Your session has expired. Please log in again.", { id: "session-expired" });
    });

    // On page load, if a token was saved, ask the server who it belongs to.
    // This keeps the user logged in across refreshes.
    if (!api.getToken()) return;
    api
      .getMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        // If the token is still saved, the 401 handler above didn't run, so the
        // problem is the server itself (e.g. backend not running)
        if (api.getToken()) {
          toast.error("Could not connect to the server. Is the backend running?", { id: "server-down" });
        }
        logout();
      })
      .finally(() => setCheckingAuth(false));
  }, [logout]);

  return (
    <div className="app">
      {/* Where toasts appear. Success toasts close after 2s, errors after 4s. */}
      <Toaster
        position="top-center"
        toastOptions={{
          success: { duration: 2000 },
          error: { duration: 4000 },
        }}
      />

      <header className="app-header">
        <h1>Todo App</h1>
        {/* Greeting + logout button, only when logged in */}
        {user && (
          <div className="user-info">
            <span>Hi, {user.name}</span>
            <button className="link-btn" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </header>

      {checkingAuth ? (
        <p className="empty">Loading...</p>
      ) : user ? (
        // "key" makes React create a fresh TodoPage (with fresh state) for each user
        <TodoPage key={user.id} />
      ) : (
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default App;
