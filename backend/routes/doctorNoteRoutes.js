const express = require('express');
const router = express.Router();
const { createNote, getNotes, getPatientNotes } = require('../controllers/doctorNoteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createNote);
router.get('/list', protect, getNotes);
router.get('/patient/:patientId', protect, getPatientNotes);

module.exports = router;