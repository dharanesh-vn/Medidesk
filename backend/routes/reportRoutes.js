const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getSystemStats, getDoctorActivityReport } = require('../controllers/reportController');

// @route   GET api/reports/stats
// @desc    Get key system statistics
// @access  Private/Admin
router.get('/stats', auth, getSystemStats);

// @route   GET api/reports/doctor-activity
// @desc    Get a report of the most active doctors
// @access  Private/Admin
router.get('/doctor-activity', auth, getDoctorActivityReport);

module.exports = router;