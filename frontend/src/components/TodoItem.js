import { useState } from "react";
import { Button, Checkbox, Flex, Input, Tooltip, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

/**
 * TodoItem - renders a single todo row.
 *
 * Props (passed down from TodoPage.js):
 *   todo     - the todo object: { id, text, completed, createdAt }
 *   onToggle - called with the todo when the checkbox is clicked
 *   onDelete - called with the todo id when the delete button is clicked
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

  // Escape = cancel editing (Enter is handled by onPressEnter below)
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setDraft(todo.text); // discard changes
      setIsEditing(false);
    }
  };

  return (
    <li className="todo-item">
      <Flex align="center" gap={12}>
        {/* Checkbox to mark the todo as done / not done */}
        <Checkbox
          checked={todo.completed}
          onChange={() => onToggle(todo)}
          aria-label={`Mark "${todo.text}" as ${todo.completed ? "incomplete" : "complete"}`}
        />

        {/* Show a text input while editing, otherwise show the todo text */}
        {isEditing ? (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onPressEnter={saveEdit}
            onBlur={saveEdit} // clicking outside the input also saves
            onKeyDown={handleKeyDown}
            autoFocus // put the cursor in the input immediately
          />
        ) : (
          // Double-clicking the text switches to edit mode.
          // "delete" draws a strike-through; "secondary" makes it grey.
          <Text
            className="todo-text"
            delete={todo.completed}
            type={todo.completed ? "secondary" : undefined}
            onDoubleClick={() => setIsEditing(true)}
            title="Double-click to edit"
          >
            {todo.text}
          </Text>
        )}

        {/* Delete button */}
        <Tooltip title="Delete">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete "${todo.text}"`}
          />
        </Tooltip>
      </Flex>
    </li>
  );
}
