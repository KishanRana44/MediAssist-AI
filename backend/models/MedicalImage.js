const mongoose = require("mongoose");

const medicalImageSchema = new mongoose.Schema(
  {
    // ==========================================
    // PATIENT INFORMATION
    // ==========================================

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

    // ==========================================
    // IMAGE INFORMATION
    // ==========================================

    imageType: {
      type: String,
      enum: [
        "X-ray",
        "CT",
        "MRI",
        "Ultrasound",
        "ECG",
        "Fundus",
        "Skin",
        "Other",
      ],
      default: "Other",
    },

    bodyPart: {
      type: String,
      default: "",
    },

    imageUrl: {
      type: String,
      required: true,
    },

    originalFileName: {
      type: String,
      default: "",
    },

    // ==========================================
    // AI ANALYSIS
    // ==========================================

    prediction: {
      type: String,
      default: "",
    },

    confidence: {
      type: Number,
      default: 0,
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

    findings: {
      type: String,
      default: "",
    },

    recommendations: {
      type: [String],
      default: [],
    },

    aiSummary: {
      type: String,
      default: "",
    },

    followUp: {
      type: String,
      default: "",
    },

    aiExplanation: {
      type: String,
      default: "",
    },

    // ==========================================
    // RAG CONTEXT
    // ==========================================

    retrievedContext: {
      type: String,
      default: "",
    },

    medicalEntities: [
      {
        entity: String,
        category: String,
      },
    ],

    // ==========================================
    // IMAGE STATUS
    // ==========================================

    processingStatus: {
      type: String,
      enum: [
        "Uploaded",
        "Processing",
        "Completed",
        "Failed",
      ],
      default: "Completed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.MedicalImage ||
  mongoose.model(
    "MedicalImage",
    medicalImageSchema
  );