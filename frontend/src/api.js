// All communication with the backend lives in this file, so components
// never call fetch() directly.

// Relative URL: in development, CRA's "proxy" setting in package.json
// forwards /api/... requests to the backend at http://localhost:5000
const BASE_URL = "/api/todos";

/**
 * Shared wrapper around fetch().
 * - Always sends/expects JSON
 * - Throws an Error if the server responds with an error status (4xx/5xx),
 *   using the server's error message when available
 * - Returns the parsed JSON body (or null for "204 No Content")
 */
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options, // method, body, etc.
  });

  // fetch() does NOT throw on HTTP errors, so we check res.ok ourselves
  if (!res.ok) {
    const body = await res.json().catch(() => ({})); // body may not be JSON
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  // DELETE returns 204 with no body, so there is nothing to parse
  return res.status === 204 ? null : res.json();
}

// GET /api/todos -> array of all todos
export const getTodos = () => request(BASE_URL);

// POST /api/todos -> the newly created todo
export const createTodo = (text) =>
  request(BASE_URL, { method: "POST", body: JSON.stringify({ text }) });

// PUT /api/todos/:id -> the updated todo. `updates` can contain text and/or completed
export const updateTodo = (id, updates) =>
  request(`${BASE_URL}/${id}`, { method: "PUT", body: JSON.stringify(updates) });

// DELETE /api/todos/:id -> nothing (null)
export const deleteTodo = (id) => request(`${BASE_URL}/${id}`, { method: "DELETE" });
