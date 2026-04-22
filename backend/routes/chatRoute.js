const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { createChat, getChats, createChatWithFile, uploadFile, deleteMessage } = require('../controllers/chatController');

router.get('/chats/:id', getChats);
router.post('/chats', createChat);
router.post('/chats/file', uploadFile, createChatWithFile);
router.delete('/chats/:messageId', deleteMessage);

module.exports = router;