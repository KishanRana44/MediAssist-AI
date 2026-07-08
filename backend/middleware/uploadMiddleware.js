const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure nested directories exist securely before writing streams
const uploadDir = path.join(__dirname, "../uploads/ecg");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); 
  // { recursive: true } lagane se poorie nested chain (uploads/ aur uploads/ecg/) ek sath ban jaati hai
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
module.exports = upload;