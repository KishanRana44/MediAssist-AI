const express = require('express');
const router = express.Router();
const { createProfile, getProfile, updateProfile } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createProfile);
router.get('/profile', protect, getProfile);
router.put('/update', protect, updateProfile);

module.exports = router;