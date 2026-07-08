const mongoose = require('mongoose');

const ecgRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  ecgFile: {
    type: String,
    required: true
  },
  prediction: {
    type: String,
  },
  confidence: {
    type: Number,
  },
  findings: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('EcgRecord', ecgRecordSchema);