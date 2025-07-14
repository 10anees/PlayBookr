const express = require('express');
const router = express.Router();

const {
  getMyChats,
  getChatById,
  createChat,
  sendMessage,
  editMessage,
  deleteMessage,
  joinChat,
  leaveChat,
  addMember,
  removeMember,
  getDirectChat
} = require('../controllers/chatController');

const auth = require('../middleware/authMiddleware');
const { requireChatAccess } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(auth);

// Chat management routes (specific routes first)
router.get('/', getMyChats);
router.get('/direct/:userId', getDirectChat);
router.post('/', createChat);

// Parameterized routes (after specific routes)
router.get('/:id', getChatById);

// Message routes
router.post('/:id/messages', sendMessage);
router.put('/:id/messages/:messageId', editMessage);
router.delete('/:id/messages/:messageId', deleteMessage);

// Group chat management routes
router.post('/:id/join', joinChat);
router.post('/:id/leave', leaveChat);
router.post('/:id/add-member', addMember);
router.post('/:id/remove-member', removeMember);

module.exports = router; 