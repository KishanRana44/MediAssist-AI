const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createAppointment);
router.get('/list', protect, getAppointments);
router.put('/update/:id', protect, updateAppointment);
router.delete('/delete/:id', protect, deleteAppointment);

module.exports = router;