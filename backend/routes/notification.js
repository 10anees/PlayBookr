const express = require('express');
const router = express.Router();

const {
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  updateNotificationSettings,
  getNotificationSettings,
  sendTestNotification
} = require('../controllers/notificationController');

const auth = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(auth);

// Notification management routes
router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/settings', getNotificationSettings);
router.get('/:id', getNotificationById);

// Notification actions
router.put('/:id/read', markAsRead);
router.put('/:id/unread', markAsUnread);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/delete-all', deleteAllNotifications);

// Settings
router.post('/settings', updateNotificationSettings);

// Admin routes
router.post('/test', requireAdmin, sendTestNotification);

module.exports = router; 