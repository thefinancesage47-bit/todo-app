const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the MONGODB_URI from .env.
 * If the connection fails, the app can't work, so we stop the process.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/todo-app";

  try {
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    console.error("Is MongoDB running? Try: brew services start mongodb-community");
    process.exit(1); // stop the app with an error code
  }
}

module.exports = connectDB;
