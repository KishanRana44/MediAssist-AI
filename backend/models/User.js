const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Patient", "Doctor", "Admin"],
      default: "Patient",
    },

    // Professional Patient ID
    patientId: {
      type: String,
      unique: true,
      sparse: true, // Allows Doctors/Admins to have no patientId
    },
  },
  {
    timestamps: true,
  }
);

// Prevent OverwriteModelError
module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);