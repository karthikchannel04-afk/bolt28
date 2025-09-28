const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead
} = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

// @route   POST /api/chat/send
router.post('/send', auth, sendMessage);

// @route   GET /api/chat/conversation/:userId
router.get('/conversation/:userId', auth, getConversation);

// @route   GET /api/chat/conversations
router.get('/conversations', auth, getConversations);

// @route   PUT /api/chat/read/:conversationId
router.put('/read/:conversationId', auth, markAsRead);

module.exports = router;