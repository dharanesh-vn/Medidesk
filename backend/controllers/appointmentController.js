const Appointment = require('../models/Appointment');
const { validationResult } = require('express-validator');

// @desc    Get all appointments based on user role
exports.getAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'doctor') {
      query = { doctorId: req.user.id };
    } else if (req.user.role === 'patient') {
      query = { patientId: req.user.id };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create a new appointment (for patients)
exports.createAppointment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { doctorId, date, reason } = req.body;
  
    if (req.user.role !== 'patient') {
      return res.status(403).json({ msg: 'Only patients can book appointments.' });
    }
  
    try {
      const newAppointment = new Appointment({
        patientId: req.user.id,
        doctorId,
        date,
        reason,
      });
  
      const appointment = await newAppointment.save();
      const populatedAppointment = await Appointment.findById(appointment._id)
          .populate('patientId', 'name email')
          .populate('doctorId', 'name email');
          
      res.json(populatedAppointment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};


// @desc    Update an appointment status (e.g., Completed, Canceled)
exports.updateAppointment = async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ msg: 'Status is required' });
  }

  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

    const isPatient = appointment.patientId.toString() === req.user.id;
    const isDoctor = appointment.doctorId.toString() === req.user.id;

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    )
    .populate('patientId', 'name email')
    .populate('doctorId', 'name email');

    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete an appointment
exports.deleteAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

    if (appointment.patientId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Appointment.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Appointment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};