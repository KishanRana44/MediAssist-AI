// models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  patientName: { type: String, default: "Unknown Patient" },
  filename: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  prediction: { type: String, required: true },
  confidence: { type: Number, required: true },
  riskLevel: { type: String, required: true },
  findings: { type: String, required: true },
  parameters: [{
    name: String,
    value: String,
    status: String
  }],
  recommendations: [{ type: String }],
  followUp: { type: String },
  rawExtractedText: { type: String } // Stored safely to feed into the RAG engine later
});

module.exports = mongoose.model('Report', ReportSchema);