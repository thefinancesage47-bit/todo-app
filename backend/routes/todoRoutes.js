// Routes map a URL + HTTP method to a controller function.
// This router is mounted at "/api/todos" in app.js, so "/" here means "/api/todos"
// and "/:id" means "/api/todos/:id".

const express = require("express");
const { getTodos, createTodo, updateTodo, deleteTodo } = require("../controllers/todoController");
const protect = require("../middleware/auth");

const router = express.Router();

// Every todo route below requires a logged-in user
router.use(protect);

router.get("/", getTodos); //         GET    /api/todos
router.post("/", createTodo); //      POST   /api/todos
router.put("/:id", updateTodo); //    PUT    /api/todos/:id
router.delete("/:id", deleteTodo); // DELETE /api/todos/:id

module.exports = router;
