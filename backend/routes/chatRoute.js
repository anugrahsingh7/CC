const express = require('express');
const router = express.Router();
const {
  createChat,
  createGroup,
  getChats,
  getConversationSummaries,
  getGroupMessages,
  createChatWithFile,
  updateMessageStatus,
  uploadFile,
  deleteMessage,
} = require('../controllers/chatController');

router.get('/conversations/:userId', getConversationSummaries);
router.get('/chats/:id', getChats);
router.get('/groups/:groupId/messages', getGroupMessages);
router.post('/chats', createChat);
router.post('/groups', createGroup);
router.post('/chats/file', uploadFile, createChatWithFile);
router.patch('/chats/:messageId/status', updateMessageStatus);
router.delete('/chats/:messageId', deleteMessage);

module.exports = router;