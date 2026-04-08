const express = require('express');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// GET /notifications - Get all notifications for the current user
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('itemId', 'title type category')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// GET /notifications/unread - Get unread notification count
router.get('/unread', async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// PUT /notifications/:id/read - Mark a notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// PUT /notifications/read-all - Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error', error);
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
});

module.exports = router;
