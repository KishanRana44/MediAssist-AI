const express = require("express");
const router = express.Router();

// 1. 🔥 UPDATED: Imported uploadAndProcessECG and the new getHistory controller name
const { uploadAndProcessECG, getHistory } = require("../controllers/ecgController");

// 2. Authentication and File Multi-part Form Buffer Handlers
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

/**
 * @route   POST /api/ecg/upload
 * @desc    Upload, validate and analyze ECG tracing via Python RAG engine
 * @access  Private (Requires JWT Bearer Token validation)
 */
router.post(
  "/upload",
  protect,                     // Pipeline Phase A: User Passport Trace Gate
  upload.single("ecg"),        // Pipeline Phase B: Multi-part Disk File Streamer
  uploadAndProcessECG          // Pipeline Phase C: Dynamic AI Context Aggregator Logic
);

/**
 * @route   GET /api/ecg/history
 * @desc    🔥 STEP 8: Fetch chronological database history entries using getHistory
 * @access  Private (Requires JWT Bearer Token validation)
 */
router.get(
  "/history",
  protect,                     // Pipeline Phase A: User Passport Trace Gate
  getHistory                   // Pipeline Phase B: Directly invokes the updated history logic
);

module.exports = router;