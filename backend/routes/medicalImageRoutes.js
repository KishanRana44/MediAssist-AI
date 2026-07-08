const express = require('express');
const router = express.Router();
const { uploadImage, getImages, saveImageResult } = require('../controllers/medicalImageController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', protect, upload.single('imageFile'), uploadImage);
router.get('/records', protect, getImages);
router.post('/result', saveImageResult);

module.exports = router;