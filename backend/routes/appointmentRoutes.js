const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

// @route   GET api/appointments
router.get('/', auth, appointmentController.getAppointments);

// @route   POST api/appointments
router.post(
  '/',
  [
    auth,
    [
      check('doctorId', 'Doctor is required').not().isEmpty(),
      check('date', 'Date is required').isISO8601().toDate(),
      check('reason', 'Reason for appointment is required').not().isEmpty(),
    ],
  ],
  appointmentController.createAppointment
);

// @route   PUT api/appointments/:id
router.put('/:id', auth, appointmentController.updateAppointment);

// @route   DELETE api/appointments/:id
router.delete('/:id', auth, appointmentController.deleteAppointment);

module.exports = router;