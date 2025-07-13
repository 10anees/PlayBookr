const Notification = require('../models/Notification');
const User = require('../models/User');

// GET /api/notifications - Get user's notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const {
      type,
      isRead,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { recipient: req.user._id };

    if (type) {
      filter.type = type;
    }

    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(filter)
      .populate('sender', 'name profileImage')
      .populate('arena', 'name')
      .populate('booking', 'date startTime')
      .populate('match', 'homeTeam awayTeam')
      .populate('tournament', 'name')
      .populate('team', 'name')
      .populate('chat', 'name')
      .populate('review', 'rating comment')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + notifications.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/notifications/:id - Get single notification
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('sender', 'name profileImage')
      .populate('arena', 'name location')
      .populate('booking', 'date startTime endTime')
      .populate('match', 'homeTeam awayTeam date')
      .populate('tournament', 'name startDate')
      .populate('team', 'name logo')
      .populate('chat', 'name type')
      .populate('review', 'rating comment');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this notification' });
    }

    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/notifications/:id/read - Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/notifications/:id/unread - Mark notification as unread
exports.markAsUnread = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }

    notification.isRead = false;
    notification.readAt = null;
    await notification.save();

    res.json({ message: 'Notification marked as unread' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/notifications/read-all - Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = {
      recipient: req.user._id,
      isRead: false
    };

    if (type) {
      filter.type = type;
    }

    await Notification.updateMany(filter, {
      isRead: true,
      readAt: new Date()
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/notifications/:id - Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/notifications/delete-all - Delete all notifications
exports.deleteAllNotifications = async (req, res) => {
  try {
    const { type, isRead } = req.query;

    const filter = { recipient: req.user._id };

    if (type) {
      filter.type = type;
    }

    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    await Notification.deleteMany(filter);

    res.json({ message: 'Notifications deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/notifications/unread-count - Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = {
      recipient: req.user._id,
      isRead: false
    };

    if (type) {
      filter.type = type;
    }

    const count = await Notification.countDocuments(filter);

    res.json({ unreadCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/notifications/settings - Update notification settings
exports.updateNotificationSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    // This would typically update user preferences
    // For now, we'll just return success
    // You might want to create a separate UserSettings model

    res.json({ message: 'Notification settings updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/notifications/settings - Get notification settings
exports.getNotificationSettings = async (req, res) => {
  try {
    // This would typically return user preferences
    // For now, we'll return default settings
    const defaultSettings = {
      match_request: true,
      match_accepted: true,
      match_rejected: true,
      booking_reminder: true,
      booking_confirmed: true,
      booking_cancelled: true,
      tournament_invite: true,
      tournament_application: true,
      tournament_accepted: true,
      tournament_rejected: true,
      new_message: true,
      review_received: true,
      team_invite: true,
      team_joined: true,
      admin_approval: true,
      admin_rejection: true
    };

    res.json(defaultSettings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/notifications/test - Send test notification (for testing purposes)
exports.sendTestNotification = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can send test notifications' });
    }

    const { recipientId, type, title, message } = req.body;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: req.user._id,
      type: type || 'admin_approval',
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      priority: 'medium'
    });

    await notification.save();

    res.json({ message: 'Test notification sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 