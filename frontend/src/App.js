import { useCallback, useEffect, useState } from "react";
import "./App.css";
import * as api from "./api";
import AuthForm from "./components/AuthForm";
import TodoPage from "./components/TodoPage";

/**
 * App - decides what to show based on whether someone is logged in:
 *   - checking the saved token -> "Loading..."
 *   - not logged in            -> login / signup form
 *   - logged in                -> header with logout + the todo page
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

  useEffect(() => {
    // If the server ever rejects our token (e.g. expired), api.js calls this
    api.setUnauthorizedHandler(logout);

    // On page load, if a token was saved, ask the server who it belongs to.
    // This keeps the user logged in across refreshes.
    if (!api.getToken()) return;
    api
      .getMe()
      .then(({ user }) => setUser(user))
      .catch(logout) // token invalid/expired or server down -> show login
      .finally(() => setCheckingAuth(false));
  }, [logout]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo App</h1>
        {/* Greeting + logout button, only when logged in */}
        {user && (
          <div className="user-info">
            <span>Hi, {user.name}</span>
            <button className="link-btn" onClick={logout}>
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
        <AuthForm onAuthSuccess={setUser} />
      )}
    </div>
  );
}

export default App;
