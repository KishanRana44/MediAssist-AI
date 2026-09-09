const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema(
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
    // REPORT INFORMATION
    // ==========================================

    reportType: {
      type: String,
      enum: [
        "Blood Test",
        "Lab Report",
        "Prescription",
        "Discharge Summary",
        "ECG Report",
        "Radiology",
        "Other",
      ],
      default: "Other",
    },

    fileUrl: {
      type: String,
      required: true,
    },

    originalFileName: {
      type: String,
      default: "",
    },

    // ==========================================
    // OCR + TEXT EXTRACTION
    // ==========================================

    extractedText: {
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
    // RAG OUTPUT
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
    // REPORT STATUS
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
  mongoose.models.MedicalReport ||
  mongoose.model(
    "MedicalReport",
    medicalReportSchema
  );