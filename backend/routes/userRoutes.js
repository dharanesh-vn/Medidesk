const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const { check } = require('express-validator');

// @route   GET api/users
router.get('/', auth, userController.getAllUsers);

// @route   GET api/users/doctors
router.get('/doctors', auth, userController.getAllDoctors);

// @route   PUT api/users/profile
// @desc    Update user's own profile
// @access  Private
router.put('/profile', auth, [check('name', 'Name is required').not().isEmpty()], userController.updateUserProfile);

// @route   PUT api/users/change-password
// @desc    Change user's own password
// @access  Private
router.put('/change-password', auth, [
    check('oldPassword', 'Old password is required').exists(),
    check('newPassword', 'Please enter a new password with 6 or more characters').isLength({ min: 6 })
], userController.changePassword);

// @route   GET api/users/:id
router.get('/:id', auth, userController.getUserById);

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;