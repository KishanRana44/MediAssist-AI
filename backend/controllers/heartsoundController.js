const { exec } = require("child_process");
const path = require("path");

const HeartSound = require("../models/HeartSoundResult");
const Patient = require("../models/Patient");

exports.analyzeHeartSound = async (req, res) => {
  try {
    console.log("File Uploaded:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No audio file uploaded",
      });
    }

    const patient = await Patient.findOne({
      userId: req.user._id,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: "Patient profile not found",
      });
    }

    const filePath = req.file.path;

    const scriptPath = path.join(
      __dirname,
      "../ml/predict_heart.py"
    );

    console.log("Python Script:", scriptPath);
    console.log("Audio File:", filePath);

    exec(
      `python "${scriptPath}" "${filePath}"`,
      async (err, stdout, stderr) => {
        console.log("STDOUT:", stdout);
        console.log("STDERR:", stderr);

        if (err) {
          return res.status(500).json({
            success: false,
            error: err.message,
            stderr,
          });
        }

        try {
          const result = JSON.parse(stdout.trim());

          let spectrogramUrl = "";

          if (result.spectrogramFile) {
            spectrogramUrl =
              `http://localhost:5000/uploads/heart_sounds/${result.spectrogramFile}`;
          }

          const heartSound =
            await HeartSound.create({
              patientId: patient.patientId,

              patientName:
                req.user.name || "Unknown Patient",

              uploadedBy: req.user._id,

              fileUrl: req.file.path,

              duration: result.duration || 0,

              prediction:
                result.prediction || "Unknown",

              confidence:
                result.confidence || 0,

              riskLevel:
                result.riskLevel || "Unknown",

              findings:
                result.findings || "",

              recommendations:
                Array.isArray(result.recommendations)
                  ? result.recommendations
                  : [],

              followUp:
                result.followUp || "",

              aiSummary:
                result.aiSummary || "",

              aiExplanation:
                result.aiExplanation || "",
            });

          return res.status(200).json({
            success: true,

            ...result,

            spectrogramUrl,

            heartSoundId:
              heartSound._id,
          });
        } catch (error) {
          console.error(
            "Heart Sound Save Error:",
            error
          );

          return res.status(500).json({
            success: false,
            error:
              "Failed to save heart sound result",
            details: error.message,
            stdout,
          });
        }
      }
    );
  } catch (error) {
    console.error(
      "Heart Sound Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};