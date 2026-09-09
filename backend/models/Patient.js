const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    age: Number,

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    bloodGroup: String,

    medicalHistory: String,
  },
  { timestamps: true }
);

// Auto Generate Patient ID
patientSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const currentYear = new Date().getFullYear();

    const lastPatient = await this.constructor
      .findOne({
        patientId: new RegExp(`^PAT${currentYear}`),
      })
      .sort({ createdAt: -1 });

    let counter = 1;

    if (lastPatient && lastPatient.patientId) {
      const lastCounter = parseInt(
        lastPatient.patientId.slice(-4)
      );
      counter = lastCounter + 1;
    }

    this.patientId = `PAT${currentYear}${String(counter).padStart(4, "0")}`;

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Patient", patientSchema);