const ECG = require("../models/ECG");
const HeartSound = require("../models/HeartSoundResult");
const MedicalReport = require("../models/MedicalReport");

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const ecg = await ECG.find({
      uploadedBy: userId,
    });

    const heart = await HeartSound.find({
      uploadedBy: userId,
    });

    const reports = await MedicalReport.find({
      uploadedBy: userId,
    });

    res.json({
      ecg,
      heart,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};