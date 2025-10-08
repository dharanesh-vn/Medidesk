const Appointment = require('../models/Appointment');
const User = require('../models/User'); // Required for search functionality
const { validationResult } = require('express-validator');
const { createNotification } = require('./notificationController');

/**
 * @desc    Get all appointments based on user role (WITH SEARCH)
 * @route   GET /api/appointments
 * @access  Private
 */
exports.getAppointments = async (req, res) => {
  try {
    const { search } = req.query; // Get search term from query params
    let query = {};

    // Build the base query based on user role
    if (req.user.role === 'doctor') {
      query.doctorId = req.user.id;
    } else if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    }

    // If there is a search term, we need to find patient IDs that match the name
    if (search) {
        // Find users (patients) whose name matches the search term
        const matchingPatients = await User.find({ 
            name: { $regex: search, $options: 'i' }, // Case-insensitive search
            role: 'patient'
        }).select('_id');

        // Get an array of just the IDs
        const patientIds = matchingPatients.map(p => p._id);
        
        // Add the search condition to our main query
        // This will override any specific patientId query for a doctor, which is the desired behavior for search
        query.patientId = { $in: patientIds };
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

/**
 * @desc    Create a new appointment (for patients)
 * @route   POST /api/appointments
 * @access  Private (Patient only)
 */
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
      const newAppointment = new Appointment({ patientId: req.user.id, doctorId, date, reason });
      const appointment = await newAppointment.save();
      const populatedAppointment = await Appointment.findById(appointment._id).populate('patientId', 'name email').populate('doctorId', 'name email');
      
      // Notify the doctor that a new appointment has been booked
      await createNotification(
        doctorId,
        `New appointment booked by ${populatedAppointment.patientId.name} on ${new Date(date).toLocaleDateString()}.`,
        '/dashboard'
      );
          
      res.json(populatedAppointment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};

/**
 * @desc    Update an appointment status (e.g., Completed, Canceled)
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
exports.updateAppointment = async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ msg: 'Status is required' });
  }

  try {
    let appointment = await Appointment.findById(req.params.id).populate('doctorId', 'name');
    if (!appointment) {
        return res.status(404).json({ msg: 'Appointment not found' });
    }

    const isPatient = appointment.patientId.toString() === req.user.id;
    const isDoctor = appointment.doctorId._id.toString() === req.user.id;

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    const originalStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id).populate('patientId', 'name email').populate('doctorId', 'name email');

    // Notify the patient that their appointment status was changed by the doctor or admin
    if (originalStatus !== status && (isDoctor || req.user.role === 'admin')) {
      await createNotification(
        appointment.patientId,
        `Your appointment with Dr. ${appointment.doctorId.name} was updated to "${status}".`,
        '/dashboard'
      );
    }

    res.json(updatedAppointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Delete an appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private (Patient or Admin)
 */
exports.deleteAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
        return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Only the patient who booked it or an admin can delete it entirely
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