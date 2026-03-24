const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { protect } = require('../middleware/auth');
const { sendNotification } = require('../utils/socket');

// Get all notifications for current user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false }
    });
    
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { id: req.params.id, userId: req.user.id } }
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create notification (internal use)
router.post('/', protect, async (req, res) => {
  try {
    const { userId, title, message, type, link, data } = req.body;
    
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      link,
      data
    });
    
    // Send real-time notification
    const io = req.app.get('io');
    sendNotification(io, userId, notification);
    
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete notification
router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
