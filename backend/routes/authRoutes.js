// Mounted at "/api/auth" in app.js

const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const protect = require("../middleware/auth");

const router = express.Router();

router.post("/register", register); // POST /api/auth/register
router.post("/login", login); //       POST /api/auth/login
router.get("/me", protect, getMe); //  GET  /api/auth/me (requires a valid token)

module.exports = router;
