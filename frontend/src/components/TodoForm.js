import { useState } from "react";

/**
 * TodoForm - the input box + "Add" button at the top of the app.
 *
 * Props:
 *   onAdd - function from App.js that creates the todo on the backend.
 *           It receives the (trimmed) text the user typed.
 */
export default function TodoForm({ onAdd }) {
  // "Controlled input": React state holds the current value of the text box
  const [text, setText] = useState("");

  // Runs when the form is submitted (clicking "Add" or pressing Enter)
  const handleSubmit = async (e) => {
    // Stop the browser from reloading the page, which is the default form behavior
    e.preventDefault();

    // Ignore input that is empty or only spaces
    const trimmed = text.trim();
    if (!trimmed) return;

    // Ask the parent (TodoPage.js) to create the todo. Only clear the input if it
    // worked, so the user doesn't lose what they typed when there's an error.
    const added = await onAdd(trimmed);
    if (added) setText("");
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text} // value comes from state...
        onChange={(e) => setText(e.target.value)} // ...and every keystroke updates state
        placeholder="What needs to be done?"
        aria-label="New todo"
      />

      {/* Button is disabled until the user types something */}
      <button type="submit" disabled={!text.trim()}>
        Add
      </button>
    </form>
  );
}
