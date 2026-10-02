// Signup, login and "who am I" endpoints.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Creates a signed JWT (JSON Web Token) for a user.
 * The token contains the user's id ("sub" = subject). It is signed with
 * JWT_SECRET, so the server can later verify it wasn't tampered with.
 * Anyone can decode a JWT, so never put secrets (like passwords) inside it.
 */
function createToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// True only for non-empty strings. Rejecting objects like { "$ne": null } also
// blocks "NoSQL injection" tricks against MongoDB queries.
const isNonEmptyString = (value) => typeof value === "string" && value.trim() !== "";

// POST /api/auth/register -> create an account. Body: { name, email, password }
async function register(req, res) {
  const { name, email, password } = req.body;
  if (![name, email, password].every(isNonEmptyString)) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  // The password is hashed automatically by the "pre save" hook in models/User.js.
  // A duplicate email is rejected by MongoDB and handled in errorHandler.js (409).
  const user = await User.create({ name, email, password });

  // Log the user in straight away by returning a token
  res.status(201).json({ token: createToken(user.id), user });
}

// POST /api/auth/login -> log in. Body: { email, password }
async function login(req, res) {
  const { email, password } = req.body;
  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // The password field is hidden by default (select: false), so ask for it explicitly
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

  // Use the same message for "no such user" and "wrong password", so attackers
  // can't use this endpoint to find out which emails are registered.
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: "Invalid email or password" }); // 401 = Unauthorized
  }

  res.json({ token: createToken(user.id), user });
}

// GET /api/auth/me -> return the logged-in user (req.user is set by the protect middleware)
async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, getMe };
