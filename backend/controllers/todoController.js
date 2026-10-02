// Controllers contain the actual logic for each endpoint.
// Each function receives (req, res) from Express and sends back a response.
// They are "async" because database calls return Promises; Express 5 automatically
// forwards any thrown error to the error handler (middleware/errorHandler.js).

const Todo = require("../models/Todo");

// GET /api/todos -> return all todos, oldest first
async function getTodos(req, res) {
  const todos = await Todo.find().sort({ createdAt: 1 });
  res.json(todos);
}

// POST /api/todos -> create a new todo. Expects body: { text: "..." }
async function createTodo(req, res) {
  const text = (req.body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Text is required" }); // 400 = Bad Request

  // MongoDB generates the id; "completed" defaults to false (see the schema)
  const todo = await Todo.create({ text });
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

  // { new: true } returns the document AFTER the update (default is before)
  // { runValidators: true } applies the schema rules to updates as well
  const todo = await Todo.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!todo) return res.status(404).json({ error: "Todo not found" }); // 404 = Not Found

  res.json(todo);
}

// DELETE /api/todos/:id -> delete a todo
async function deleteTodo(req, res) {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) return res.status(404).json({ error: "Todo not found" });

  res.status(204).end(); // 204 = success, no content to return
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
