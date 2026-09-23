const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const MedicalReport = require("../models/MedicalReport");
const Patient = require("../models/Patient");

const uploadReport = async (req, res) => {
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No report file uploaded",
      });
    }

    const absoluteFilePath = path.resolve(req.file.path);

    const pythonInterpreterPath =
      "C:\\Users\\User\\anaconda3\\python.exe";

    const scriptPath = path.join(
      __dirname,
      "..",
      "ai",
      "report_analyzer.py"
    );

    const pythonProcess = spawn(
      pythonInterpreterPath,
      [scriptPath, absoluteFilePath]
    );

    let outputData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (chunk) => {
      outputData += chunk.toString();
    });

    pythonProcess.stderr.on("data", (chunk) => {
      errorData += chunk.toString();
    });

    pythonProcess.on("close", async (code) => {
      if (code !== 0) {
        console.error("Python Error:", errorData);

        if (fs.existsSync(absoluteFilePath)) {
          fs.unlinkSync(absoluteFilePath);
        }

        return res.status(500).json({
          success: false,
          message: "AI pipeline analysis failed",
          error: errorData,
        });
      }

      try {
        const parsedAIResponse = JSON.parse(
          outputData.trim()
        );

        if (!parsedAIResponse.success) {
          if (fs.existsSync(absoluteFilePath)) {
            fs.unlinkSync(absoluteFilePath);
          }

          return res.status(500).json(parsedAIResponse);
        }

        const report = await MedicalReport.create({
          patientId: patient.patientId,
          patientName: req.user.name || "Unknown Patient",
          uploadedBy: req.user._id,

          reportType:
            req.body.reportType ||
            parsedAIResponse.reportType ||
            "Other",

          fileUrl: req.file.path,

          originalFileName:
            req.file.originalname || "",

          extractedText:
            typeof parsedAIResponse.extractedText === "string"
              ? parsedAIResponse.extractedText
              : typeof parsedAIResponse.findings === "string"
              ? parsedAIResponse.findings
              : JSON.stringify(
                  parsedAIResponse.findings || ""
                ),

          prediction:
            parsedAIResponse.prediction || "",

          confidence:
            parsedAIResponse.confidence || 0,

          riskLevel:
            parsedAIResponse.riskLevel || "Unknown",

          findings:
            typeof parsedAIResponse.findings === "string"
              ? parsedAIResponse.findings
              : JSON.stringify(
                  parsedAIResponse.findings || ""
                ),

          recommendations:
            Array.isArray(parsedAIResponse.recommendations)
              ? parsedAIResponse.recommendations
              : [],

          aiSummary:
            parsedAIResponse.aiSummary ||
            parsedAIResponse.followUp ||
            "",

          followUp:
            parsedAIResponse.followUp || "",

          aiExplanation:
            parsedAIResponse.aiExplanation || "",

          retrievedContext:
            parsedAIResponse.retrievedContext || "",

          medicalEntities:
            Array.isArray(parsedAIResponse.medicalEntities)
              ? parsedAIResponse.medicalEntities
              : [],

          processingStatus: "Completed",
        });

        if (fs.existsSync(absoluteFilePath)) {
          fs.unlinkSync(absoluteFilePath);
        }

        return res.status(200).json({
          success: true,
          message: "Report processed successfully",

          reportId: report._id,

          prediction: report.prediction,
          confidence: report.confidence,
          riskLevel: report.riskLevel,
          findings: report.findings,
          recommendations: report.recommendations,
          followUp: report.followUp,
          aiSummary: report.aiSummary,
        });
      } catch (error) {
        console.error("Report Save Error:", error);
        console.error("Python Output:", outputData);

        if (fs.existsSync(absoluteFilePath)) {
          fs.unlinkSync(absoluteFilePath);
        }

        return res.status(500).json({
          success: false,
          message: "Failed to save report",
          error: error.message,
        });
      }
    });
  } catch (error) {
    console.error("Report Controller Error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find({
      uploadedBy: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const saveReportResult = async (req, res) => {
  try {
    const {
      reportId,
      extractedText,
      aiSummary,
      riskLevel,
      findings,
      recommendations,
      followUp,
      aiExplanation,
    } = req.body;

    const report = await MedicalReport.findOneAndUpdate(
      {
        _id: reportId,
        uploadedBy: req.user._id,
      },
      {
        extractedText,
        aiSummary,
        riskLevel,
        findings,
        recommendations,
        followUp,
        aiExplanation,
      },
      {
        new: true,
      }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report results updated successfully",
      report,
    });
  } catch (error) {
    return res.status(500).json({
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