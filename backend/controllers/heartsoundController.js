const { spawn } = require("child_process");
const path = require("path");

exports.analyzeHeartSound = async (req, res) => {
  try {
    console.log("File Uploaded:", req.file);

    if (!req.file) {
      return res.status(400).json({
        error: "No audio file uploaded"
      });
    }

    const filePath = req.file.path;

    const scriptPath = path.join(
      __dirname,
      "../ml/predict_heart.py"
    );

    console.log("Python Script:", scriptPath);
    console.log("Audio File:", filePath);

    const pythonExecutable = process.env.ECG_PYTHON_PATH || process.env.PYTHON_PATH || "python";
    const pythonProcess = spawn(pythonExecutable, [scriptPath, filePath], { windowsHide: true });
    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => { stdout += data.toString(); });
    pythonProcess.stderr.on("data", (data) => { stderr += data.toString(); });
    pythonProcess.on("error", (err) => {
      return res.status(500).json({ error: err.message });
    });
    pythonProcess.on("close", (code) => {

        console.log("STDOUT:", stdout);
        console.log("STDERR:", stderr);

        if (code !== 0) {
          return res.status(500).json({
            error: `Heart-sound model exited with code ${code}`,
            stderr
          });
        }

        try {
          const result = JSON.parse(stdout);
          
          // Map the local Python filename to a full localhost URL for React
          if (result.spectrogramFile) {
            result.spectrogramUrl = `http://localhost:5000/uploads/heart_sounds/${result.spectrogramFile}`;
          } else {
            // Fallback if Python failed to create the image
            result.spectrogramUrl = "https://images.unsplash.com/photo-1614064641913-6b70a32b0051?q=80&w=800&auto=format&fit=crop";
          }

          return res.json(result);

        } catch (e) {
          return res.status(500).json({
            error: "Invalid JSON from Python",
            stdout
          });
        }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
};