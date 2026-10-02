// Entry point: loads config, connects to the database, then starts the server.

// Load variables from the .env file into process.env (must run before anything reads them)
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Tokens can't be signed or verified without a secret, so refuse to start without one
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Add it to backend/.env (see .env.example).");
  process.exit(1);
}

// Only start accepting requests once the database connection is ready
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
