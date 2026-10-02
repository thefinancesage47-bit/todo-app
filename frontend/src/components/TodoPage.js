import { useCallback, useEffect, useState } from "react";
import { App as AntApp, Button, Empty, Flex, Segmented, Spin, Typography } from "antd";
import * as api from "../api"; // all backend calls (getTodos, createTodo, ...)
import ProgressBar from "./ProgressBar";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

const { Text } = Typography;

// Each filter is a function that decides whether a todo should be shown.
// Used with Array.filter() below, e.g. todos.filter(FILTERS.active)
const FILTERS = {
  all: () => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
};

// Options for the <Segmented> filter control: { label shown, value stored }
const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

/**
 * TodoPage - everything you see after logging in. It owns the todo state
 * (the list, the current filter and loading) and passes data + functions
 * down to the child components as props. Results and errors are shown as
 * Ant Design messages (small pop-ups at the top of the screen).
 */
export default function TodoPage() {
  const { message } = AntApp.useApp(); // message.success(...) / message.error(...)

  // ---------- State ----------
  const [todos, setTodos] = useState([]); // the logged-in user's todos
  const [filter, setFilter] = useState("all"); // "all" | "active" | "completed"
  const [loading, setLoading] = useState(true); // true until the first fetch finishes

  // Show an error message, unless the error was an expired login: in that case
  // App.js has already logged the user out and shown its own message.
  // useCallback keeps the same function between renders (it's used in useEffect below).
  const showError = useCallback(
    (err) => {
      if (!api.getToken()) return;
      // Using the text as the "key" stops the exact same error from stacking up
      message.error({ content: err.message, key: err.message });
    },
    [message]
  );

  // ---------- Load todos once when the page appears ----------
  useEffect(() => {
    api
      .getTodos()
      .then(setTodos) // store the todos in state
      .catch(showError)
      .finally(() => setLoading(false)); // stop showing the spinner either way
  }, [showError]);

  // ---------- Helper ----------
  // Runs an async action and catches any error, so every handler below
  // doesn't need its own try/catch. Returns true on success, false on failure.
  const run = async (action) => {
    try {
      await action();
      return true;
    } catch (err) {
      showError(err);
      return false;
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
      message.success("Todo added");
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
      message.success("Todo updated");
    });

  // Delete a todo, then remove it from the list
  const removeTodo = (id) =>
    run(async () => {
      await api.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      message.success("Todo deleted");
    });

  // Delete all completed todos at once (requests are sent in parallel)
  const clearCompleted = () =>
    run(async () => {
      const completed = todos.filter((t) => t.completed);
      await Promise.all(completed.map((t) => api.deleteTodo(t.id)));
      setTodos((prev) => prev.filter((t) => !t.completed));
      message.success(`Cleared ${completed.length} completed todo${completed.length !== 1 ? "s" : ""}`);
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

      {/* Progress across ALL todos (not just the current filter) */}
      {todos.length > 0 && <ProgressBar done={todos.length - activeCount} total={todos.length} />}

      {/* Show one of three things: spinner, empty message, or the list */}
      {loading ? (
        <Flex justify="center" style={{ padding: 32 }}>
          <Spin />
        </Flex>
      ) : visibleTodos.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No todos here." />
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
        <Flex className="footer" align="center" justify="space-between" wrap gap={8}>
          {/* "1 item left" vs "2 items left" */}
          <Text type="secondary">
            {activeCount} item{activeCount !== 1 && "s"} left
          </Text>

          {/* A row of connected buttons where exactly one is selected */}
          <Segmented size="small" options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

          {/* Disabled when nothing is completed (all todos are still active) */}
          <Button type="text" size="small" onClick={clearCompleted} disabled={activeCount === todos.length}>
            Clear completed
          </Button>
        </Flex>
      )}
    </>
  );
}
