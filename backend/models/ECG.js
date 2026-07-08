const mongoose = require("mongoose");

const ecgSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      trim: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    prediction: {
      type: String,
      required: true, // e.g., "Atrial Fibrillation (AFib)"
    },

    confidence: {
      type: Number,
      required: true, // e.g., 94.8
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical", "Unknown"],
      default: "Medium",
    },

    // ==========================================
    // STEP 3.7: RAG & GENAI ENRICHMENT FIELDS
    // ==========================================
    findings: {
      type: String,
      required: true,
      trim: true,
      default: "No clinical findings compiled.",
    },

    recommendations: {
      type: [String], // Array of strings to cleanly parse bullet elements on frontend
      default: [],
    },

    followUp: {
      type: String,
      trim: true,
      default: "Schedule standard clinical review within baseline configurations.",
    },

    aiExplanation: {
      type: String,
      trim: true,
      default: "Physiological background mapping currently unavailable.",
    },
  },
  {
    timestamps: true, // Automatically provides createdAt and updatedAt properties
  }
);

module.exports = mongoose.model("ECG", ecgSchema);