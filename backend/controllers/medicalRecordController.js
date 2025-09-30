const MedicalRecord = require('../models/MedicalRecord');
const { validationResult } = require('express-validator');

// @desc    Get all medical records for a patient
exports.getMedicalRecords = async (req, res) => {
  try {
    // A doctor could get records for a specific patient, or patient gets their own.
    const patientId = req.user.role === 'patient' ? req.user.id : req.params.patientId;
    if (!patientId) {
        return res.status(400).json({ msg: 'Patient ID is required' });
    }

    const records = await MedicalRecord.find({ patientId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create a new medical record (doctor only)
exports.createMedicalRecord = async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(401).json({ msg: 'Not authorized' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { patientId, appointmentId, diagnosis, prescription, notes } = req.body;

  try {
    const newRecord = new MedicalRecord({
      patientId,
      doctorId: req.user.id,
      appointmentId,
      diagnosis,
      prescription,
      notes,
    });

    const record = await newRecord.save();
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
