const ECG = require("../models/ECG");
const HeartSound = require("../models/HeartSoundResult");
const MedicalReport = require("../models/MedicalReport");
const User = require("../models/User");
const Patient = require("../models/Patient");

exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch User and Patient details
    const [user, patient] = await Promise.all([
      User.findById(userId),
      Patient.findOne({ userId }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get analysis counts
    const [ecgCount, heartCount, reportCount] = await Promise.all([
      ECG.countDocuments({ uploadedBy: userId }),
      HeartSound.countDocuments({ uploadedBy: userId }),
      MedicalReport.countDocuments({ uploadedBy: userId }),
    ]);

    res.status(200).json({
      success: true,

      user: {
        name: user.name,

        // ✅ Read patientId from User collection
        patientId: user.patientId || "PAT-NOT-FOUND",

        // Medical profile from Patient collection
        age: patient?.age ?? null,
        gender: patient?.gender ?? null,
        bloodGroup: patient?.bloodGroup ?? null,
      },

      ecgCount,
      heartCount,
      reportCount,

      imageCount: 0,

      riskLevel: "Low",

      heartHealthScore: 92,

      recentAnalyses: [],

      aiDirectives: [],
    });

  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};