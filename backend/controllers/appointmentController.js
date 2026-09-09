const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

const createAppointment = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const { doctorId, date, time, remarks } = req.body;

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      date,
      time,
      remarks
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate('doctorId', 'name email');

    res.status(200).json(appointments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({
      message: 'Appointment updated successfully',
      appointment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAppointment, getAppointments, updateAppointment, deleteAppointment };