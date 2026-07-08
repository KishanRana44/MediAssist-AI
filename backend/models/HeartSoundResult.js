const mongoose = require("mongoose");

const heartSoundSchema = new mongoose.Schema(
  {
    // ===========================
    // Patient Information
    // ===========================

    patientId: {
      type: String,
      required: true,
      trim: true,
    },

    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===========================
    // Uploaded Audio
    // ===========================

    fileUrl: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      default: 0,
    },

    // ===========================
    // AI Prediction
    // ===========================

    prediction: {
      type: String,
      required: true,
    },

    confidence: {
      type: Number,
      required: true,
    },

    riskLevel: {
      type: String,
      enum: [
        "Low",
        "Moderate",
        "High",
        "Critical",
        "Unknown",
      ],
      default: "Unknown",
    },

    // ===========================
    // AI Clinical Findings
    // ===========================

    findings: {
      type: String,
      default: "",
    },

    recommendations: {
      type: [String],
      default: [],
    },

    followUp: {
      type: String,
      default: "",
    },

    aiSummary: {
      type: String,
      default: "",
    },

    aiExplanation: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.HeartSoundResult ||
  mongoose.model(
    "HeartSoundResult",
    heartSoundSchema
  );