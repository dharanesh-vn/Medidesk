const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const medicalRecordController = require('../controllers/medicalRecordController');

// @route   GET api/records
// @desc    Get medical records for the logged-in patient
// @access  Private
router.get('/', auth, medicalRecordController.getMedicalRecords);

// @route   GET api/records/:patientId
// @desc    Get medical records for a specific patient (for doctors)
// @access  Private
router.get('/:patientId', auth, medicalRecordController.getMedicalRecords);

// @route   POST api/records
// @desc    Create a medical record
// @access  Private (Doctor only)
router.post(
  '/',
  [
    auth,
    [
      check('patientId', 'Patient ID is required').not().isEmpty(),
      check('appointmentId', 'Appointment ID is required').not().isEmpty(),
      check('diagnosis', 'Diagnosis is required').not().isEmpty(),
    ],
  ],
  medicalRecordController.createMedicalRecord
);

module.exports = router;