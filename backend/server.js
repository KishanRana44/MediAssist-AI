require("dotenv").config();

const express = require("express");
const cors = require("cors");
const dns = require("dns");
const path = require("path"); // <-- ADDED: Path module imported

const connectDB = require("./config/db");

// RAG Service
const {
  initializeMedicalKnowledgeBase,
} = require("./ai/ragService");

// Routes
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const ecgRoutes = require("./routes/ecgRoutes");
const heartSoundRoutes = require("./routes/heartsoundRoutes");
const reportRoutes = require("./routes/reportRoutes");
const medicalImageRoutes = require("./routes/medicalImageRoutes");
const chatRoutes = require("./routes/chatRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorNoteRoutes = require("./routes/doctorNoteRoutes");
const historyRoutes = require("./routes/historyRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Database Connection
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// <-- UPDATED: Fixed static file serving path
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root Route
app.get("/", (req, res) => {
  res.send("MediAssist AI Backend Running");
});

// Routes
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/ecg", ecgRoutes);
app.use("/api/heart-sound", heartSoundRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/images", medicalImageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctor-notes", doctorNoteRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

// Start Server + Initialize RAG
app.listen(PORT, async () => {
  console.log(`🚀 System Core Online on server port ${PORT}`);
  console.log("⏳ Initializing multi-modal RAG knowledge compilation parsing routines...");
  
  // Triggers engine execution block loops
  await initializeMedicalKnowledgeBase();
});