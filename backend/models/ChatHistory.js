const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, default: "default_user" }, // Schema update: String kar diya taaki bina Auth ke bhi test ho sake
    question: { type: String, required: true },
    answer: { type: String, required: true },
    sourceDocs: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatHistory", chatHistorySchema);