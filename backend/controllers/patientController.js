const Patient = require('../models/Patient');

const createProfile = async (req, res) => {
  try {
    const { age, gender, bloodGroup, medicalHistory } = req.body;

    const patientExists = await Patient.findOne({ userId: req.user._id });
    if (patientExists) {
      return res.status(400).json({ message: 'Patient profile already exists' });
    }

    const patient = await Patient.create({
      userId: req.user._id,
      age,
      gender,
      bloodGroup,
      medicalHistory
    });

    res.status(201).json({
      message: 'Patient profile created successfully',
      patient
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.status(200).json({
      message: 'Patient profile updated successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProfile, getProfile, updateProfile };