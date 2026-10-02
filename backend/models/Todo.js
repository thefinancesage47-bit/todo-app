const mongoose = require("mongoose");

// A schema describes the shape of each document in the "todos" collection
const todoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Text is required"], // custom error message if missing
      trim: true, // automatically removes spaces at the start/end
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically adds and maintains "createdAt" and "updatedAt" fields
    timestamps: true,

    // Controls how a document looks when sent as JSON (res.json(todo)).
    // MongoDB uses "_id" (an ObjectId), but the frontend expects "id" (a string),
    // so we rename it here and hide the internal "__v" version field.
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// A model is the class we use to query the collection: Todo.find(), Todo.create(), ...
// Mongoose turns the name "Todo" into the collection name "todos".
module.exports = mongoose.model("Todo", todoSchema);
