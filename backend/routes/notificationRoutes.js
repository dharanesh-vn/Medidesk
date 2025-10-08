const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getMyNotifications, markNotificationsAsRead } = require('../controllers/notificationController');

// @route   GET api/notifications
router.get('/', auth, getMyNotifications);

// @route   PUT api/notifications/read
router.put('/read', auth, markNotificationsAsRead);


module.exports = router;