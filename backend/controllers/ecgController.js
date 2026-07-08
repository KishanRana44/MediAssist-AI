const ECG = require("../models/ECG");
const Patient = require("../models/Patient");
const path = require("path");
const { spawn } = require("child_process");

exports.uploadAndProcessECG = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No ECG file uploaded." });
    }

    // 1. Validate Target Patient Exists
    const targetPatient = await Patient.findOne({ userId: req.user._id });
    if (!targetPatient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found. Please instantiate a core profile setup first."
      });
    }

    // ==========================================
    // 🔥 FIXED CRITICAL PATH RESOLUTION LOGIC
    // ==========================================
    const absoluteFilePath = path.resolve(req.file.path); 
    const absoluteScriptPath = path.join(__dirname, "../ai/ecg_predict.py");

    console.log("Executing Script Absolute Path:", absoluteScriptPath);
    console.log("Analyzing File Absolute Path:", absoluteFilePath);

    // ====================================================================
    // 🔥 ABSOLUTE RUNTIME COORDINATE PATH INTEGRATION
    // ====================================================================
    // Anaconda path explicitly configured to trigger our Python workspace env
    const pythonExecutable = "C:\\Users\\User\\anaconda3\\python.exe";

    // Spawn process using explicit Anaconda environment reference where TensorFlow lives
    const pythonProcess = spawn(pythonExecutable, [absoluteScriptPath, absoluteFilePath]);
pythonProcess.stderr.on("data", (data) => {
      errorLogOutput += data.toString();
      // 🔥 ADD THIS LINE SO WE CAN SEE WHAT PYTHON IS THINKING:
      console.log("PYTHON LOG:", data.toString()); 
    });
    
    let rawDataOutput = "";
    let errorLogOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      rawDataOutput += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorLogOutput += data.toString();
    });

    pythonProcess.on("close", async (code) => {
      if (code !== 0) {
        console.error("AI Script Pipeline Internal Crash Trace:", errorLogOutput);
        return res.status(500).json({
          success: false,
          message: `AI Core failed. Script exited with code ${code}. Error: ${errorLogOutput.trim()}`
        });
      }

      try {
        // ==========================================
        // 🛠️ STEP 3.8: DYNAMIC PARSING & ATOMIC DATA STORAGE
        // ==========================================
        const aiResult = JSON.parse(rawDataOutput.trim());

        if (!aiResult.success) {
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

      } catch (parseError) {
        console.error("JSON Parsing Error. Raw output from Python script was:", rawDataOutput);
        return res.status(500).json({
          success: false,
          message: "AI Engine returned invalid JSON output structural format.",
          error: parseError.message
        });
      }
    });

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