import { useState } from "react";
import { Button, Input, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";

/**
 * TodoForm - the input box + "Add" button at the top of the todo page.
 *
 * Props:
 *   onAdd - function from TodoPage.js that creates the todo on the backend.
 *           It receives the (trimmed) text and returns true if it worked.
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

    // Only clear the input if it worked, so the user doesn't lose what they
    // typed when there's an error.
    const added = await onAdd(trimmed);
    if (added) setText("");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Space.Compact joins the input and button into one connected control */}
      <Space.Compact block size="large">
        <Input
          value={text} // value comes from state...
          onChange={(e) => setText(e.target.value)} // ...and every keystroke updates state
          placeholder="What needs to be done?"
          aria-label="New todo"
          allowClear // small "x" to clear the input
        />
        {/* Button is disabled until the user types something.
            aria-hidden on the icon: screen readers should say "Add", not "plus Add". */}
        <Button type="primary" htmlType="submit" icon={<PlusOutlined aria-hidden />} disabled={!text.trim()}>
          Add
        </Button>
      </Space.Compact>
    </form>
  );
}
