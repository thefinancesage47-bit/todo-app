// All communication with the backend lives in this file, so components
// never call fetch() directly.

// Relative URLs: in development, CRA's "proxy" setting in package.json
// forwards /api/... requests to the backend at http://localhost:5000
const TODOS_URL = "/api/todos";
const AUTH_URL = "/api/auth";

// ---------- Token storage ----------
// The JWT is kept in localStorage so the user stays logged in after a page refresh.
// (localStorage is simple and fine for learning; production apps often use
// httpOnly cookies instead, which JavaScript on the page can't read.)
const TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// App.js registers a function here that logs the user out. It's called when the
// server rejects our token (e.g. it expired), so the user is sent back to login.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

/**
 * Shared wrapper around fetch().
 * - Always sends/expects JSON
 * - Adds "Authorization: Bearer <token>" when the user is logged in
 * - Throws an Error if the server responds with an error status (4xx/5xx),
 *   using the server's error message when available
 * - Returns the parsed JSON body (or null for "204 No Content")
 */
async function request(url, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  // A 401 while we HAD a token means the token is invalid or expired -> log out.
  // (A 401 without a token, e.g. a wrong password on login, is just a normal error.)
  if (res.status === 401 && token) {
    clearToken();
    onUnauthorized();
  }

  // fetch() does NOT throw on HTTP errors, so we check res.ok ourselves
  if (!res.ok) {
    const body = await res.json().catch(() => ({})); // body may not be JSON
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  // DELETE returns 204 with no body, so there is nothing to parse
  return res.status === 204 ? null : res.json();
}

// ---------- Auth ----------

// POST /api/auth/register -> { token, user }
export const register = (name, email, password) =>
  request(`${AUTH_URL}/register`, { method: "POST", body: JSON.stringify({ name, email, password }) });

// POST /api/auth/login -> { token, user }
export const login = (email, password) =>
  request(`${AUTH_URL}/login`, { method: "POST", body: JSON.stringify({ email, password }) });

// GET /api/auth/me -> { user } (checks that the saved token is still valid)
export const getMe = () => request(`${AUTH_URL}/me`);

// ---------- Todos (all require a logged-in user) ----------

// GET /api/todos -> array of the user's todos
export const getTodos = () => request(TODOS_URL);

// POST /api/todos -> the newly created todo
export const createTodo = (text) =>
  request(TODOS_URL, { method: "POST", body: JSON.stringify({ text }) });

// PUT /api/todos/:id -> the updated todo. `updates` can contain text and/or completed
export const updateTodo = (id, updates) =>
  request(`${TODOS_URL}/${id}`, { method: "PUT", body: JSON.stringify(updates) });

// DELETE /api/todos/:id -> nothing (null)
export const deleteTodo = (id) => request(`${TODOS_URL}/${id}`, { method: "DELETE" });
