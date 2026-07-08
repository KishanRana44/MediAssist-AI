const DoctorNote = require('../models/DoctorNote');
const Patient = require('../models/Patient');

const createNote = async (req, res) => {
  try {
    const { patientId, diagnosis, prescription, notes } = req.body;

    const doctorNote = await DoctorNote.create({
      doctorId: req.user._id,
      patientId,
      diagnosis,
      prescription,
      notes
    });

    res.status(201).json({
      message: 'Doctor note created successfully',
      doctorNote
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotes = async (req, res) => {
  try {
    const notes = await DoctorNote.find({ doctorId: req.user._id })
      .populate('patientId');

    res.status(200).json(notes);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientNotes = async (req, res) => {
  try {
    const notes = await DoctorNote.find({ patientId: req.params.patientId })
      .populate('doctorId', 'name email');

    res.status(200).json(notes);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createNote, getNotes, getPatientNotes };