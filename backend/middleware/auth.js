const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * "protect" middleware: only lets the request through if it has a valid token.
 *
 * The frontend sends the token in a header like:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *
 * If the token is valid, the logged-in user is attached as req.user so the
 * controllers know who is making the request.
 */
async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  let payload;
  try {
    // Throws if the token was tampered with, signed with another secret, or expired
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message = err.name === "TokenExpiredError" ? "Session expired, please log in again" : "Invalid token";
    return res.status(401).json({ error: message });
  }

  // The token may still be valid for a user that has since been deleted
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ error: "User no longer exists" });

  req.user = user;
  next(); // continue to the route handler
}

module.exports = protect;
