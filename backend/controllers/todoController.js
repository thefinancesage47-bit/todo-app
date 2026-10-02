// Controllers contain the actual logic for each endpoint.
// Each function receives (req, res) from Express and sends back a response.
// They are "async" because database calls return Promises; Express 5 automatically
// forwards any thrown error to the error handler (middleware/errorHandler.js).
//
// All routes here run after the "protect" middleware, so req.user is the
// logged-in user. Every query includes { user: req.user._id } so a user can
// only see and change their OWN todos, even if they guess another todo's id.

const Todo = require("../models/Todo");

// GET /api/todos -> return the user's todos, oldest first
async function getTodos(req, res) {
  const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: 1 });
  res.json(todos);
}

// POST /api/todos -> create a new todo. Expects body: { text: "..." }
async function createTodo(req, res) {
  const text = (req.body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Text is required" }); // 400 = Bad Request

  // MongoDB generates the id; "completed" defaults to false (see the schema)
  const todo = await Todo.create({ text, user: req.user._id });
  res.status(201).json(todo); // 201 = Created
}

// PUT /api/todos/:id -> update a todo. Body can include { text } and/or { completed }
async function updateTodo(req, res) {
  // Only copy fields that were actually sent, and only if they have the right type
  const updates = {};
  if (typeof req.body.text === "string") {
    const text = req.body.text.trim();
    if (!text) return res.status(400).json({ error: "Text cannot be empty" });
    updates.text = text;
  }
  if (typeof req.body.completed === "boolean") {
    updates.completed = req.body.completed;
  }

  // Match on BOTH the todo id and the owner, so other users' todos are never found.
  // { new: true } returns the document AFTER the update (default is before)
  // { runValidators: true } applies the schema rules to updates as well
  const todo = await Todo.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, {
    new: true,
    runValidators: true,
  });
  if (!todo) return res.status(404).json({ error: "Todo not found" }); // 404 = Not Found

  res.json(todo);
}

// DELETE /api/todos/:id -> delete a todo
async function deleteTodo(req, res) {
  const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!todo) return res.status(404).json({ error: "Todo not found" });

  res.status(204).end(); // 204 = success, no content to return
}

// POST /api/todos/restore -> bring back a todo that was just deleted ("Undo").
// Body: the deleted todo as the frontend had it: { id, text, completed, createdAt }.
// Re-creating it with the SAME id and createdAt keeps it in its original place.
async function restoreTodo(req, res) {
  const { id, text, completed, createdAt } = req.body;

  // A MongoDB ObjectId is exactly 24 hexadecimal characters
  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
    return res.status(400).json({ error: "Invalid todo id" });
  }
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Text is required" });
  }

  const created = new Date(createdAt);
  const todo = await Todo.create({
    _id: id,
    text,
    completed: completed === true,
    user: req.user._id, // always the logged-in user, never taken from the request body
    // Keep the original date if it's valid; otherwise Mongoose uses "now"
    ...(isNaN(created) ? {} : { createdAt: created }),
  });
  // If a todo with this id still exists (e.g. Undo clicked twice), MongoDB rejects
  // the duplicate id and errorHandler.js responds with 409.

  res.status(201).json(todo);
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo, restoreTodo };
