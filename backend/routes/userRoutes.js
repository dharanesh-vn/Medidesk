const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// @route   GET api/users
// @desc    Get all users (for admins)
router.get('/', auth, userController.getAllUsers);

// @route   GET api/users/doctors
// @desc    Get all doctors
router.get('/doctors', auth, userController.getAllDoctors);

module.exports = router;