const express = require('express');
const router = express.Router();
const {
  getMessagesUser,
  sendMessageUser,
  getConversationsAdmin,
  getMessagesAdmin,
  sendMessageAdmin,
  closeConversationAdmin,
  toggleBotAdmin,
} = require('../controllers/chat.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// --- USER ROUTES ---
// Lấy tin nhắn của user
router.get('/messages', verifyToken, getMessagesUser);
// User gửi tin nhắn
router.post('/messages', verifyToken, sendMessageUser);

// --- ADMIN ROUTES ---
// Lấy toàn bộ các cuộc hội thoại
router.get('/admin/conversations', verifyToken, requireAdmin, getConversationsAdmin);
// Chi tiết một cuộc hội thoại
router.get('/admin/conversations/:id/messages', verifyToken, requireAdmin, getMessagesAdmin);
// Admin trả lời tin nhắn
router.post('/admin/conversations/:id/messages', verifyToken, requireAdmin, sendMessageAdmin);
// Admin đóng cuộc hội thoại
router.put('/admin/conversations/:id/close', verifyToken, requireAdmin, closeConversationAdmin);
// Admin bật/tắt chatbot AI
router.put('/admin/conversations/:id/toggle-bot', verifyToken, requireAdmin, toggleBotAdmin);

module.exports = router;
