const Chat = require('../models/Chat');
const User = require('../models/User');
const Arena = require('../models/Arena');
const Tournament = require('../models/Tournament');
const Notification = require('../models/Notification');

// GET /api/chats - Get user's chats
exports.getMyChats = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    const filter = {
      $or: [
        { participants: req.user._id },
        { members: req.user._id }
      ],
      isActive: true
    };

    if (type) {
      filter.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const chats = await Chat.find(filter)
      .populate('participants', 'name profileImage')
      .populate('members', 'name profileImage')
      .populate('admins', 'name profileImage')
      .populate('arena', 'name')
      .populate('tournament', 'name')
      .populate('lastMessage.sender', 'name profileImage')
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Chat.countDocuments(filter);

    res.json({
      chats,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + chats.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/chats/:id - Get single chat with messages
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name profileImage')
      .populate('members', 'name profileImage')
      .populate('admins', 'name profileImage')
      .populate('arena', 'name location')
      .populate('tournament', 'name')
      .populate('messages.sender', 'name profileImage')
      .populate('messages.readBy', 'name profileImage');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is part of this chat
    const isParticipant = 
      chat.participants.some(p => p._id.toString() === req.user._id.toString()) ||
      chat.members.some(m => m._id.toString() === req.user._id.toString());

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    // Mark messages as read by current user
    const unreadMessages = chat.messages.filter(
      message => !message.readBy.some(reader => reader._id.toString() === req.user._id.toString())
    );

    if (unreadMessages.length > 0) {
      for (const message of unreadMessages) {
        if (!message.readBy.some(reader => reader._id.toString() === req.user._id.toString())) {
          message.readBy.push(req.user._id);
        }
      }
      chat.unreadCount = 0;
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/chats - Create new chat
exports.createChat = async (req, res) => {
  try {
    const {
      type,
      participants,
      name,
      description,
      arenaId,
      city,
      sport,
      tournamentId,
      isPrivate
    } = req.body;

    let chatData = {
      type,
      name,
      description,
      isPrivate: isPrivate || false
    };

    if (type === 'direct') {
      // Direct message between two users
      if (!participants || participants.length !== 2) {
        return res.status(400).json({ message: 'Direct chat must have exactly 2 participants' });
      }

      // Check if both participants exist
      const users = await User.find({ _id: { $in: participants } });
      if (users.length !== 2) {
        return res.status(400).json({ message: 'Invalid participants' });
      }

      // Check if direct chat already exists
      const existingChat = await Chat.findOne({
        type: 'direct',
        participants: { $all: participants }
      });

      if (existingChat) {
        return res.status(400).json({ message: 'Direct chat already exists' });
      }

      chatData.participants = participants;
    } else {
      // Group chat
      chatData.members = participants || [req.user._id];
      chatData.admins = [req.user._id];

      if (type === 'arena' && arenaId) {
        const arena = await Arena.findById(arenaId);
        if (!arena) {
          return res.status(404).json({ message: 'Arena not found' });
        }
        chatData.arena = arenaId;
      } else if (type === 'city' && city) {
        chatData.city = city;
      } else if (type === 'sport' && sport) {
        chatData.sport = sport;
      } else if (type === 'tournament' && tournamentId) {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          return res.status(404).json({ message: 'Tournament not found' });
        }
        chatData.tournament = tournamentId;
      }
    }

    const chat = new Chat(chatData);
    await chat.save();

    // Populate the created chat
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name profileImage')
      .populate('members', 'name profileImage')
      .populate('admins', 'name profileImage')
      .populate('arena', 'name')
      .populate('tournament', 'name');

    res.status(201).json(populatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/chats/:id/messages - Send message
exports.sendMessage = async (req, res) => {
  try {
    const { content, messageType = 'text', attachments } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is part of this chat
    const isParticipant = 
      chat.participants.some(p => p.toString() === req.user._id.toString()) ||
      chat.members.some(m => m.toString() === req.user._id.toString());

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    const message = {
      sender: req.user._id,
      content,
      messageType,
      attachments: attachments || [],
      readBy: [req.user._id] // sender has read the message
    };

    chat.messages.push(message);
    chat.lastMessage = {
      content,
      sender: req.user._id,
      timestamp: new Date()
    };
    chat.totalMessages += 1;

    // Increment unread count for other members
    const otherMembers = chat.members.filter(m => m.toString() !== req.user._id.toString());
    chat.unreadCount = otherMembers.length;

    await chat.save();

    // Populate the message
    const populatedChat = await Chat.findById(chat._id)
      .populate('messages.sender', 'name profileImage')
      .populate('messages.readBy', 'name profileImage')
      .populate('lastMessage.sender', 'name profileImage');

    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];

    // Create notifications for other members
    const notificationPromises = otherMembers.map(async (memberId) => {
      await Notification.create({
        recipient: memberId,
        sender: req.user._id,
        type: 'new_message',
        title: 'New Message',
        message: `New message in ${chat.name || 'chat'}`,
        chat: chat._id,
        data: { messageId: newMessage._id }
      });
    });

    await Promise.all(notificationPromises);

    res.json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/chats/:id/messages/:messageId - Edit message
exports.editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the message sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();

    await chat.save();

    res.json({ message: 'Message updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/chats/:id/messages/:messageId - Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the message sender or admin
    const isAdmin = chat.admins.some(a => a.toString() === req.user._id.toString());
    if (message.sender.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    message.remove();
    chat.totalMessages -= 1;
    await chat.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/chats/:id/join - Join group chat
exports.joinChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.type === 'direct') {
      return res.status(400).json({ message: 'Cannot join direct chat' });
    }

    if (chat.isPrivate) {
      return res.status(403).json({ message: 'This is a private chat' });
    }

    // Check if user is already a member
    if (chat.members.some(m => m.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already a member of this chat' });
    }

    chat.members.push(req.user._id);
    await chat.save();

    res.json({ message: 'Joined chat successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/chats/:id/leave - Leave group chat
exports.leaveChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.type === 'direct') {
      return res.status(400).json({ message: 'Cannot leave direct chat' });
    }

    // Remove user from members
    chat.members = chat.members.filter(m => m.toString() !== req.user._id.toString());
    
    // Remove from admins if admin
    chat.admins = chat.admins.filter(a => a.toString() !== req.user._id.toString());

    // If no members left, deactivate chat
    if (chat.members.length === 0) {
      chat.isActive = false;
    }

    await chat.save();

    res.json({ message: 'Left chat successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/chats/:id/add-member - Add member to group chat (admin only)
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.type === 'direct') {
      return res.status(400).json({ message: 'Cannot add members to direct chat' });
    }

    // Check if user is admin
    if (!chat.admins.some(a => a.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    if (chat.members.some(m => m.toString() === userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    chat.members.push(userId);
    await chat.save();

    res.json({ message: 'Member added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/chats/:id/remove-member - Remove member from group chat (admin only)
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.type === 'direct') {
      return res.status(400).json({ message: 'Cannot remove members from direct chat' });
    }

    // Check if user is admin
    if (!chat.admins.some(a => a.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Cannot remove admin
    if (chat.admins.some(a => a.toString() === userId)) {
      return res.status(400).json({ message: 'Cannot remove admin' });
    }

    chat.members = chat.members.filter(m => m.toString() !== userId);
    await chat.save();

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/chats/direct/:userId - Get or create direct chat with user
exports.getDirectChat = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if direct chat already exists
    let chat = await Chat.findOne({
      type: 'direct',
      participants: { $all: [req.user._id, userId] }
    }).populate('participants', 'name profileImage');

    if (!chat) {
      // Create new direct chat
      chat = new Chat({
        type: 'direct',
        participants: [req.user._id, userId]
      });
      await chat.save();

      chat = await Chat.findById(chat._id)
        .populate('participants', 'name profileImage');
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 