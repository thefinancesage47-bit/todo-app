import { useEffect, useState } from "react";
import * as api from "../api"; // all backend calls (getTodos, createTodo, ...)
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

// Each filter is a function that decides whether a todo should be shown.
// Used with Array.filter() below, e.g. todos.filter(FILTERS.active)
const FILTERS = {
  all: () => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
};

/**
 * TodoPage - everything you see after logging in. It owns the todo state
 * (the list, the current filter, loading and error) and passes data +
 * functions down to the child components as props.
 */
export default function TodoPage() {
  // ---------- State ----------
  const [todos, setTodos] = useState([]); // the logged-in user's todos
  const [filter, setFilter] = useState("all"); // "all" | "active" | "completed"
  const [loading, setLoading] = useState(true); // true until the first fetch finishes
  const [error, setError] = useState(""); // error message shown to the user

  // ---------- Load todos once when the page appears ----------
  // The empty dependency array [] means "run only once, after the first render"
  useEffect(() => {
    api
      .getTodos()
      .then(setTodos) // store the todos in state
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false)); // stop showing "Loading..." either way
  }, []);

  // ---------- Helper ----------
  // Runs an async action and catches any error, so every handler below
  // doesn't need its own try/catch.
  const run = async (action) => {
    try {
      setError(""); // clear any old error
      await action();
    } catch (err) {
      setError(err.message);
    }
  };

  // ---------- Handlers (passed to child components) ----------
  // Pattern: call the backend first, then update local state with the result.
  // We use the "updater" form setTodos((prev) => ...) so we always work with
  // the latest state.

  // Create a new todo and append it to the list
  const addTodo = (text) =>
    run(async () => {
      const todo = await api.createTodo(text);
      setTodos((prev) => [...prev, todo]);
    });

  // Flip completed true <-> false, then replace that todo in the list
  const toggleTodo = (todo) =>
    run(async () => {
      const updated = await api.updateTodo(todo.id, { completed: !todo.completed });
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    });

  // Change a todo's text, then replace that todo in the list
  const editTodo = (id, text) =>
    run(async () => {
      const updated = await api.updateTodo(id, { text });
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    });

  // Delete a todo, then remove it from the list
  const removeTodo = (id) =>
    run(async () => {
      await api.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    });

  // Delete all completed todos at once (requests are sent in parallel)
  const clearCompleted = () =>
    run(async () => {
      const completed = todos.filter((t) => t.completed);
      await Promise.all(completed.map((t) => api.deleteTodo(t.id)));
      setTodos((prev) => prev.filter((t) => !t.completed));
    });

  // ---------- Derived values ----------
  // Calculated from state on every render (no need to store them in state)
  const visibleTodos = todos.filter(FILTERS[filter]); // todos matching the selected filter
  const activeCount = todos.filter((t) => !t.completed).length; // how many are not done

  // ---------- UI ----------
  return (
    <>
      {/* Input to add new todos */}
      <TodoForm onAdd={addTodo} />

      {/* Show the error message only if there is one */}
      {error && <p className="error">{error}</p>}

      {/* Show one of three things: loading text, empty message, or the list */}
      {loading ? (
        <p className="empty">Loading...</p>
      ) : visibleTodos.length === 0 ? (
        <p className="empty">No todos here.</p>
      ) : (
        <ul className="todo-list">
          {/* "key" helps React track which item is which when the list changes */}
          {visibleTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={removeTodo} onEdit={editTodo} />
          ))}
        </ul>
      )}

      {/* Footer only appears when at least one todo exists */}
      {todos.length > 0 && (
        <footer className="footer">
          {/* "1 item left" vs "2 items left" */}
          <span>
            {activeCount} item{activeCount !== 1 && "s"} left
          </span>

          {/* One button per filter; the selected one gets the "active" class */}
          <div className="filters">
            {Object.keys(FILTERS).map((name) => (
              <button key={name} className={filter === name ? "active" : ""} onClick={() => setFilter(name)}>
                {name[0].toUpperCase() + name.slice(1)} {/* "all" -> "All" */}
              </button>
            ))}
          </div>

          {/* Disabled when nothing is completed (all todos are still active) */}
          <button className="clear-btn" onClick={clearCompleted} disabled={activeCount === todos.length}>
            Clear completed
          </button>
        </footer>
      )}
    </>
  );
}
