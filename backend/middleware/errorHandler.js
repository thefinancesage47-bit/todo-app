const mongoose = require("mongoose");

// Runs when no route matched the request (e.g. GET /api/unknown)
function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler. Express recognizes it by its 4 parameters (err, req, res, next).
// Any error thrown in a controller ends up here.
function errorHandler(err, req, res, next) {
  // An id that isn't a valid MongoDB ObjectId (e.g. "/api/todos/abc") -> treat as not found
  if (err instanceof mongoose.Error.CastError) {
    return res.status(404).json({ error: "Todo not found" });
  }
  // Schema validation failed (e.g. missing text)
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  // Request body is not valid JSON (thrown by express.json())
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }

  console.error(err);
  res.status(500).json({ error: "Something went wrong" }); // 500 = Internal Server Error
}

module.exports = { notFound, errorHandler };
