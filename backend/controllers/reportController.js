const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const Report = require("../models/Report");
const Patient = require("../models/Patient");

// Core Logic Handler for Frontend Endpoint: /report/analyze-report
const uploadReport = async (req, res) => {
  try {
    // 1. Validate Patient Profile via session user payload context
    const patient = await Patient.findOne({
      userId: req.user._id,
    });

    if (!patient) {
      // Cleanup uploaded assets from disk storage to prevent memory overflow leakage
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    // 2. Validate Multipart File Buffer
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No report file uploaded",
      });
    }

    const absoluteFilePath = path.resolve(req.file.path);
    const pythonInterpreterPath = "C:\\Users\\User\\anaconda3\\python.exe";
    
    // Path points strictly to our modular AI framework module
    const scriptPath = path.join(__dirname, "..", "ai", "report_analyzer.py");

    // 3. Spawning Python child process pipeline for multi-modal context execution
    const pythonProcess = spawn(pythonInterpreterPath, [scriptPath, absoluteFilePath]);

    let outputData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (chunk) => {
      outputData += chunk.toString();
    });

    pythonProcess.stderr.on("data", (chunk) => {
      errorData += chunk.toString();
    });

    pythonProcess.on("close", async (code) => {
      // Safely delete file from backend/uploads to keep storage footprint minimal
      if (fs.existsSync(absoluteFilePath)) {
        fs.unlinkSync(absoluteFilePath);
      }

      if (code !== 0) {
        console.error("Python Subprocess Crash Output Matrix:\n", errorData);
        return res.status(500).json({
          success: false,
          message: "AI pipeline analysis execution failure parameters.",
        });
      }

      try {
        const parsedAIResponse = JSON.parse(outputData.trim());

        if (!parsedAIResponse.success) {
          return res.status(500).json(parsedAIResponse);
        }

        // 4. Save structured results inside MongoDB collections framework
        const report = await Report.create({
          patientId: patient._id,
          reportType: req.body.reportType || parsedAIResponse.prediction || "General Lab Report",
          fileUrl: req.file.path,
          extractedText: typeof parsedAIResponse.findings === "string" 
            ? parsedAIResponse.findings 
            : JSON.stringify(parsedAIResponse.findings),
          aiSummary: parsedAIResponse.followUp,
          riskLevel: parsedAIResponse.riskLevel || "Low",
          findings: parsedAIResponse.findings
        });

        // 5. Respond directly back syncing up state parameters with react hooks
        return res.status(200).json({
          success: true,
          message: "Report processed and analytical data structured successfully.",
          prediction: parsedAIResponse.prediction,
          confidence: parsedAIResponse.confidence,
          riskLevel: report.riskLevel,
          findings: parsedAIResponse.findings,
          recommendations: parsedAIResponse.recommendations,
          followUp: parsedAIResponse.followUp,
          reportId: report._id
        });

      } catch (jsonErr) {
        console.error("JSON Evaluation Serialization Crash Context:", outputData);
        return res.status(500).json({
          success: false,
          message: "Malformed output serialization stream payload received.",
        });
      }
    });

  } catch (error) {
    // Top level backup guardrail rule to prevent process hanging
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Returns chronological record stack for dashboard list tables metrics
const getReports = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      userId: req.user._id,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const reports = await Report.find({
      patientId: patient._id,
    }).sort({ createdAt: -1 }); // Sort by newest records first

    res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Explicit database mutations handler overrides
const saveReportResult = async (req, res) => {
  try {
    const {
      reportId,
      extractedText,
      aiSummary,
      riskLevel,
      findings,
    } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        extractedText,
        aiSummary,
        riskLevel,
        findings,
      },
      {
        new: true,
      }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report record document targets not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Report results updated successfully in persistent cluster layer.",
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadReport,
  getReports,
  saveReportResult,
};