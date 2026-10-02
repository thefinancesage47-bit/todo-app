// app.js builds and configures the Express app, but does NOT start it.
// Keeping it separate from server.js makes it easy to test the app later
// without opening a real network port.

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// ---------- Middleware (runs before every route) ----------
app.use(cors()); // allow cross-origin requests from the frontend
app.use(express.json()); // parse JSON request bodies into req.body

// ---------- Routes ----------
app.use("/api/auth", authRoutes); // signup, login, current user (public except /me)
app.use("/api/todos", todoRoutes); // todos (all require login)

// ---------- Error handling (must come AFTER the routes) ----------
app.use(notFound); // no route matched
app.use(errorHandler); // something threw an error

module.exports = app;
