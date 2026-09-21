const ECG = require("../models/ECG");
const Patient = require("../models/Patient");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const runPythonPrediction = (pythonExecutable, scriptPath, filePath) => new Promise((resolve, reject) => {
  const pythonProcess = spawn(pythonExecutable, [scriptPath, filePath], {
    windowsHide: true,
  });
  let rawDataOutput = "";
  let errorLogOutput = "";
  let settled = false;

  const finish = (callback, value) => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    callback(value);
  };

  pythonProcess.stdout.on("data", (data) => {
    rawDataOutput += data.toString();
  });
  pythonProcess.stderr.on("data", (data) => {
    errorLogOutput += data.toString();
  });
  pythonProcess.on("error", (error) => finish(reject, error));
  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      return finish(reject, new Error(`AI script exited with code ${code}: ${errorLogOutput.trim()}`));
    }
    finish(resolve, rawDataOutput.trim());
  });

  const timeout = setTimeout(() => {
    pythonProcess.kill();
    finish(reject, new Error("ECG analysis timed out."));
  }, Number(process.env.ECG_ANALYSIS_TIMEOUT_MS) || 120000);
});

exports.uploadAndProcessECG = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No ECG file uploaded." });
    }

    // 1. Validate Target Patient Exists
    let targetPatient = await Patient.findOne({ userId: req.user._id });
    if (!targetPatient && req.user.role === "Patient") {
      targetPatient = await Patient.create({ userId: req.user._id });
    }
    if (!targetPatient) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      return res.status(404).json({
        success: false,
        message: "Patient profile not found. Please instantiate a core profile setup first."
      });
    }

    const absoluteFilePath = path.resolve(req.file.path); 
    const absoluteScriptPath = path.join(__dirname, "../ai/ecg_predict.py");
    const pythonExecutable = process.env.ECG_PYTHON_PATH || process.env.PYTHON_PATH || "python";

    let rawDataOutput;
    try {
      rawDataOutput = await runPythonPrediction(
        pythonExecutable,
        absoluteScriptPath,
        absoluteFilePath
      );
      const aiResult = JSON.parse(rawDataOutput);

      if (!aiResult.success) {
        await fs.promises.unlink(absoluteFilePath).catch(() => {});
        return res.status(422).json({
          success: false,
          message: aiResult.message || "Model engine execution returned an unsuccessful state indicator."
        });
      }

        // Clean arrays fallback handling for recommendations extraction
        const computedRecommendations = Array.isArray(aiResult.recommendations)
          ? aiResult.recommendations
          : aiResult.recommendation ? [aiResult.recommendation] : [];

        // Save complete response payload back to Database matching Step 3.7 specifications
        const finalEcgRecord = await ECG.create({
          patientId: targetPatient._id,
          uploadedBy: req.user._id,
          filePath: absoluteFilePath, // Standard normalized path registration
          prediction: aiResult.prediction,
          confidence: parseFloat(aiResult.confidence) || 0,
          probabilities: aiResult.probabilities || {},
          tracePredictions: Array.isArray(aiResult.tracePredictions)
            ? aiResult.tracePredictions
            : [],
          analysisScope: aiResult.analysisScope || "",
          inputType: aiResult.inputType || "",
          reliableForThisInput: aiResult.reliableForThisInput !== false,
          analysisWarning: aiResult.warning || "",
          riskLevel: aiResult.riskLevel || "Medium",
          
          // Using dynamic RAG & Gemini generated parameters directly instead of hardcoded maps
          findings: aiResult.findings || "Atypical baseline wave morphology captured.",
          recommendations: computedRecommendations,
          followUp: aiResult.followUp || "Schedule routine clinical tracking setup.",
          
          // Bug Fix Mapping: Maps python response key 'explanation' into Mongoose key 'aiExplanation'
          aiExplanation: aiResult.explanation || aiResult.aiExplanation || "Physiological telemetry tracking processed successfully."
        });

        return res.status(201).json({
          success: true,
          message: "ECG analysis pipeline resolved successfully.",
          data: finalEcgRecord
        });

    } catch (error) {
        try {
          await fs.promises.unlink(absoluteFilePath);
        } catch (cleanupError) {
          console.error("Unable to clean up failed ECG upload:", cleanupError.message);
        }
        console.error("ECG analysis failed:", error);
        return res.status(500).json({
          success: false,
          message: error instanceof SyntaxError
            ? "AI Engine returned invalid JSON output structural format."
            : error.message || "ECG analysis failed.",
          ...(error instanceof SyntaxError ? { error: error.message } : {})
        });
      }

  } catch (error) {
    console.error("Critical System Handler Failure in ECG Processor:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 🛠️ STEP 8: ECG HISTORY API (COMPILED REGISTRY TRACKING)
// ==========================================
exports.getHistory = async (req, res) => {
  try {
    const ecgs = await ECG.find({
      uploadedBy: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(ecgs);
  } catch (error) {
    console.error("Critical Registry compilation failed:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getReviewQueue = async (req, res) => {
  try {
    const records = await ECG.find()
      .populate("uploadedBy", "name email role")
      .populate("reviewedBy", "name role")
      .sort({ reviewStatus: 1, createdAt: -1 });

    return res.json({ success: true, data: records });
  } catch (error) {
    console.error("ECG review queue failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.reviewECG = async (req, res) => {
  try {
    const { reviewStatus, reviewNotes = "" } = req.body;
    const allowedStatuses = ["Approved", "Needs Follow-up", "Rejected"];

    if (!allowedStatuses.includes(reviewStatus)) {
      return res.status(400).json({
        success: false,
        message: "A valid review status is required."
      });
    }

    const record = await ECG.findByIdAndUpdate(
      req.params.id,
      {
        reviewStatus,
        reviewNotes: String(reviewNotes).trim(),
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate("reviewedBy", "name role");

    if (!record) {
      return res.status(404).json({ success: false, message: "ECG record not found." });
    }

    return res.json({ success: true, data: record });
  } catch (error) {
    console.error("ECG review update failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};