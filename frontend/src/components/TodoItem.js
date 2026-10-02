import { useState } from "react";

/**
 * TodoItem - renders a single todo row.
 *
 * Props (passed down from App.js):
 *   todo     - the todo object: { id, text, completed, createdAt }
 *   onToggle - called with the todo when the checkbox is clicked
 *   onDelete - called with the todo id when the ✕ button is clicked
 *   onEdit   - called with (id, newText) when an edit is saved
 */
export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  // Whether this row is currently in "edit mode" (shows a text input instead of plain text)
  const [isEditing, setIsEditing] = useState(false);

  // The text being typed while editing. Kept separate from todo.text so that
  // the user can cancel and go back to the original value.
  const [draft, setDraft] = useState(todo.text);

  // Save the edited text (runs on Enter key or when the input loses focus)
  const saveEdit = async () => {
    const trimmed = draft.trim();

    if (trimmed && trimmed !== todo.text) {
      // Text is non-empty and actually changed -> send update to the backend
      await onEdit(todo.id, trimmed);
    } else {
      // Empty or unchanged -> throw away the draft and restore the original text
      setDraft(todo.text);
    }

    // Leave edit mode either way
    setIsEditing(false);
  };

  // Keyboard shortcuts while editing: Enter = save, Escape = cancel
  const handleKeyDown = (e) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") {
      setDraft(todo.text); // discard changes
      setIsEditing(false);
    }
  };

  return (
    // The "completed" class adds a strike-through style (see App.css)
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      {/* Checkbox to mark the todo as done / not done */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        aria-label={`Mark "${todo.text}" as ${todo.completed ? "incomplete" : "complete"}`}
      />

      {/* Show a text input while editing, otherwise show the todo text */}
      {isEditing ? (
        <input
          className="edit-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={saveEdit} // clicking outside the input also saves
          onKeyDown={handleKeyDown}
          autoFocus // put the cursor in the input immediately
        />
      ) : (
        // Double-clicking the text switches to edit mode
        <span className="todo-text" onDoubleClick={() => setIsEditing(true)} title="Double-click to edit">
          {todo.text}
        </span>
      )}

      {/* Delete button */}
      <button className="delete-btn" onClick={() => onDelete(todo.id)} aria-label={`Delete "${todo.text}"`}>
        ✕
      </button>
    </li>
  );
}
