const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const FASTAPI_HEART_URL = process.env.FASTAPI_HEART_URL || 'http://localhost:8000/api/heart/analyze';

router.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No heart audio file provided' });
    }

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(FASTAPI_HEART_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    const errorMsg = error.response ? error.response.data : error.message;
    return res.status(500).json({
      error: 'FastAPI Heart module inference failed',
      details: errorMsg,
    });
  }
});

module.exports = router;