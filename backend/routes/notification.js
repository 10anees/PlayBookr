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

// Notification management routes (specific routes first)
router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/settings', getNotificationSettings);
router.put('/read-all', markAllAsRead);
router.delete('/delete-all', deleteAllNotifications);
router.post('/settings', updateNotificationSettings);

// Admin routes (specific routes first)
router.post('/test', requireAdmin, sendTestNotification);

// Parameterized routes (after specific routes)
router.get('/:id', getNotificationById);
router.put('/:id/read', markAsRead);
router.put('/:id/unread', markAsUnread);
router.delete('/:id', deleteNotification);

module.exports = router; 