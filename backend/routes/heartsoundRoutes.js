const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const {
  analyzeHeartSound
} = require("../controllers/heartsoundController");

// Define the exact path to the upload directory
const uploadDir = path.join(
  __dirname,
  "../uploads/heart_sounds"
);

// Auto-create the folder structure if it doesn't already exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(
      null,
      uploadDir
    );
  },
  
  filename: function(req, file, cb) {
    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  }
});

const upload = multer({
  storage
});

router.post(
  "/analyze",
  upload.single("audio"),
  analyzeHeartSound
);

module.exports = router;