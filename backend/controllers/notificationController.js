const Notification = require('../models/Notification');

// Helper function to create a new notification (used internally)
const createNotification = async (userId, message, link) => {
  try {
    const notification = new Notification({ userId, message, link });
    await notification.save();
    console.log(`Notification created for user ${userId}: "${message}"`);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Get all notifications for the logged-in user
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Mark notifications as read
const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { $set: { isRead: true } });
    res.json({ msg: 'Notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
    createNotification,
    getMyNotifications,
    markNotificationsAsRead,
};