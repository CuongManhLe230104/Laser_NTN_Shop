const { pool } = require('../config/db');

/**
 * GET /api/chat/messages
 * Lấy lịch sử tin nhắn của user hiện tại
 */
const getMessagesUser = async (req, res) => {
  const userId = req.user.id;

  try {
    // Tìm cuộc hội thoại gần nhất của user này
    const [conversations] = await pool.execute(
      `SELECT * FROM chat_conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );

    if (conversations.length === 0) {
      return res.json({
        success: true,
        conversation: null,
        messages: [],
      });
    }

    const conversation = conversations[0];

    // Lấy tất cả tin nhắn của cuộc hội thoại này
    const [messages] = await pool.execute(
      `SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`,
      [conversation.id]
    );

    res.json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error('getMessagesUser error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy tin nhắn.' });
  }
};

/**
 * POST /api/chat/messages
 * User gửi tin nhắn
 */
const sendMessageUser = async (req, res) => {
  const userId = req.user.id;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống.' });
  }

  try {
    // 1. Kiểm tra xem có cuộc hội thoại nào đang hoạt động (open) hay không
    let [conversations] = await pool.execute(
      `SELECT * FROM chat_conversations WHERE user_id = ? AND status = 'open' LIMIT 1`,
      [userId]
    );

    let conversationId;

    if (conversations.length === 0) {
      // Nếu không có, tạo cuộc hội thoại mới
      const [result] = await pool.execute(
        `INSERT INTO chat_conversations (user_id, status) VALUES (?, 'open')`,
        [userId]
      );
      conversationId = result.insertId;
    } else {
      conversationId = conversations[0].id;
    }

    // 2. Thêm tin nhắn mới
    const [insertResult] = await pool.execute(
      `INSERT INTO chat_messages (conversation_id, sender_id, sender_role, content) VALUES (?, ?, 'user', ?)`,
      [conversationId, userId, content.trim()]
    );

    // Cập nhật trường updated_at của cuộc hội thoại để nổi lên trên đầu danh sách admin
    await pool.execute(
      `UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [conversationId]
    );

    const newMessage = {
      id: insertResult.insertId,
      conversation_id: conversationId,
      sender_id: userId,
      sender_role: 'user',
      content: content.trim(),
      created_at: new Date(),
    };

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error('sendMessageUser error:', error);
    res.status(500).json({ success: false, message: 'Lỗi gửi tin nhắn.' });
  }
};

/**
 * GET /api/chat/admin/conversations
 * Lấy danh sách tất cả các cuộc hội thoại (chỉ dành cho Admin)
 */
const getConversationsAdmin = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id, 
        c.user_id, 
        c.status, 
        c.created_at, 
        c.updated_at,
        u.name AS user_name, 
        u.email AS user_email,
        m.content AS last_message_content, 
        m.sender_role AS last_message_sender, 
        m.created_at AS last_message_time
      FROM chat_conversations c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN (
        SELECT conversation_id, content, sender_role, created_at
        FROM chat_messages
        WHERE id IN (
          SELECT MAX(id) FROM chat_messages GROUP BY conversation_id
        )
      ) m ON c.id = m.conversation_id
      ORDER BY c.updated_at DESC
    `;

    const [conversations] = await pool.execute(query);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('getConversationsAdmin error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách hội thoại.' });
  }
};

/**
 * GET /api/chat/admin/conversations/:id/messages
 * Lấy lịch sử tin nhắn của một cuộc hội thoại cụ thể (Admin)
 */
const getMessagesAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra cuộc hội thoại
    const [conversations] = await pool.execute(
      `SELECT c.*, u.name AS user_name, u.email AS user_email 
       FROM chat_conversations c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = ?`,
      [id]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cuộc hội thoại.' });
    }

    const conversation = conversations[0];

    // Lấy tin nhắn
    const [messages] = await pool.execute(
      `SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error('getMessagesAdmin error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy tin nhắn hội thoại.' });
  }
};

/**
 * POST /api/chat/admin/conversations/:id/messages
 * Admin gửi tin nhắn trả lời
 */
const sendMessageAdmin = async (req, res) => {
  const adminId = req.user.id;
  const { id } = req.params; // Conversation ID
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống.' });
  }

  try {
    // Kiểm tra cuộc hội thoại tồn tại
    const [conversations] = await pool.execute(
      `SELECT * FROM chat_conversations WHERE id = ?`,
      [id]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cuộc hội thoại.' });
    }

    // Gửi tin nhắn từ Admin
    const [insertResult] = await pool.execute(
      `INSERT INTO chat_messages (conversation_id, sender_id, sender_role, content) VALUES (?, ?, 'admin', ?)`,
      [id, adminId, content.trim()]
    );

    // Cập nhật trạng thái cuộc hội thoại thành 'open' (nếu đang closed và admin nhắn tin) và cập nhật thời gian updated_at
    await pool.execute(
      `UPDATE chat_conversations SET status = 'open', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    const newMessage = {
      id: insertResult.insertId,
      conversation_id: parseInt(id),
      sender_id: adminId,
      sender_role: 'admin',
      content: content.trim(),
      created_at: new Date(),
    };

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error('sendMessageAdmin error:', error);
    res.status(500).json({ success: false, message: 'Lỗi gửi tin nhắn của admin.' });
  }
};

/**
 * PUT /api/chat/admin/conversations/:id/close
 * Admin đóng cuộc hội thoại
 */
const closeConversationAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const [conversations] = await pool.execute(
      `SELECT * FROM chat_conversations WHERE id = ?`,
      [id]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cuộc hội thoại.' });
    }

    await pool.execute(
      `UPDATE chat_conversations SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Đã đóng cuộc hội thoại thành công.',
    });
  } catch (error) {
    console.error('closeConversationAdmin error:', error);
    res.status(500).json({ success: false, message: 'Lỗi đóng cuộc hội thoại.' });
  }
};

module.exports = {
  getMessagesUser,
  sendMessageUser,
  getConversationsAdmin,
  getMessagesAdmin,
  sendMessageAdmin,
  closeConversationAdmin,
};
