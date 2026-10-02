const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // MongoDB creates an index that rejects duplicate emails
      lowercase: true, // "Me@Mail.com" and "me@mail.com" count as the same email
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // Never return the password from queries unless we explicitly ask for it
      // with .select("+password") (only done during login)
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password; // extra safety: never send the password hash to the client
        return ret;
      },
    },
  }
);

// "pre save" hook: runs automatically before a user is saved.
// We store a bcrypt HASH instead of the real password, so even if the database
// leaks, nobody can read the original passwords.
userSchema.pre("save", async function () {
  // Only hash when the password is new or was changed (not on every save)
  if (!this.isModified("password")) return;
  // 10 = "salt rounds": higher is slower to compute and harder to crack
  this.password = await bcrypt.hash(this.password, 10);
});

// Instance method: user.comparePassword("typed password") -> true / false
// bcrypt hashes the typed password the same way and compares the results.
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
