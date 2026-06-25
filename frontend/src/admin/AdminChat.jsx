import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiSend, FiInbox, FiCheckCircle, FiUser } from 'react-icons/fi';
import { chatAPI } from '../services/api';

export default function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);

  const listPollRef = useRef(null);
  const msgPollRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeId) {
      scrollToBottom();
    }
  }, [messages, activeId]);

  // Fetch list of conversations
  const fetchConversations = async () => {
    try {
      const response = await chatAPI.getConversationsAdmin();
      if (response.data.success) {
        setConversations(response.data.data || []);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách hội thoại admin:', error);
    }
  };

  // Fetch messages of active conversation
  const fetchMessages = async (id = activeId) => {
    if (!id) return;
    try {
      const response = await chatAPI.getMessagesAdmin(id);
      if (response.data.success) {
        setMessages(response.data.messages || []);
        setActiveConversation(response.data.conversation);
      }
    } catch (error) {
      console.error('Lỗi lấy tin nhắn hội thoại admin:', error);
    }
  };

  // Setup polling for conversation list (every 4s)
  useEffect(() => {
    fetchConversations();
    listPollRef.current = setInterval(fetchConversations, 4000);

    return () => {
      if (listPollRef.current) clearInterval(listPollRef.current);
    };
  }, []);

  // Setup polling for active conversation messages (every 3s)
  useEffect(() => {
    if (activeId) {
      fetchMessages(activeId);

      if (msgPollRef.current) clearInterval(msgPollRef.current);
      msgPollRef.current = setInterval(() => fetchMessages(activeId), 3000);
    } else {
      setMessages([]);
      setActiveConversation(null);
      if (msgPollRef.current) clearInterval(msgPollRef.current);
    }

    return () => {
      if (msgPollRef.current) clearInterval(msgPollRef.current);
    };
  }, [activeId]);

  // Handle switching conversations
  const handleSelectConversation = (id) => {
    setActiveId(id);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || isSending || !activeId) return;

    setIsSending(true);
    try {
      const response = await chatAPI.sendMessageAdmin(activeId, text);
      if (response.data.success) {
        const newMsg = response.data.data;
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        // Cập nhật lại danh sách hội thoại để cập nhật last message
        fetchConversations();
        // Tự động tắt bot cục bộ vì backend đã tắt bot khi Admin chat
        setActiveConversation(prev => prev ? { ...prev, is_bot_active: 0 } : null);
      }
    } catch (error) {
      console.error('Lỗi gửi tin nhắn admin:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Close conversation
  const handleCloseConversation = async () => {
    if (!activeId) return;
    if (!window.confirm('Bạn có chắc chắn muốn đóng cuộc hội thoại này?')) return;

    try {
      const response = await chatAPI.closeConversationAdmin(activeId);
      if (response.data.success) {
        // Refresh
        fetchMessages(activeId);
        fetchConversations();
      }
    } catch (error) {
      console.error('Lỗi đóng hội thoại:', error);
    }
  };

  // Bật/tắt trạng thái AI Bot
  const handleToggleBot = async () => {
    if (!activeId || !activeConversation) return;
    const nextState = activeConversation.is_bot_active ? 0 : 1;

    try {
      const response = await chatAPI.toggleBotAdmin(activeId, nextState === 1);
      if (response.data.success) {
        setActiveConversation(prev => prev ? { ...prev, is_bot_active: nextState } : null);
        setConversations(prev => prev.map(c => 
          c.id === activeId ? { ...c, is_bot_active: nextState } : c
        ));
      }
    } catch (error) {
      console.error('Lỗi bật/tắt AI chatbot:', error);
    }
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter(c => 
    c.user_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-chat-page">
      <div className="admin-chat-header">
        <h2 className="admin-page-title">Hỗ Trợ Khách Hàng Trực Tuyến</h2>
        <p className="admin-page-subtitle">Tư vấn khách hàng đặt hàng thiết kế riêng và đặt hàng số lượng lớn.</p>
      </div>

      <div className="admin-chat-container glass-card">
        {/* Left column: Conversations list */}
        <div className="admin-chat-sidebar">
          <div className="admin-chat-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-chat-list">
            {filteredConversations.length === 0 ? (
              <div className="admin-chat-list-empty">
                <FiInbox size={32} />
                <p>Không tìm thấy cuộc hội thoại nào.</p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.id === activeId;
                const isUnread = c.last_message_sender === 'user' && c.status === 'open';
                const formattedTime = c.last_message_time 
                  ? new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div
                    key={c.id}
                    className={`admin-chat-item ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                    onClick={() => handleSelectConversation(c.id)}
                  >
                    <div className="chat-avatar">
                      {c.user_name[0].toUpperCase()}
                    </div>
                    
                    <div className="chat-info">
                      <div className="chat-info-top">
                        <span className="user-name">{c.user_name}</span>
                        <span className="message-time">{formattedTime}</span>
                      </div>
                      <div className="chat-info-bottom">
                        <span className="last-message">
                          {c.last_message_sender === 'admin' ? 'Bạn: ' : ''}
                          {c.last_message_content || 'Bắt đầu cuộc trò chuyện'}
                        </span>
                        {c.status === 'closed' ? (
                          <span className="status-badge closed">Đã đóng</span>
                        ) : isUnread ? (
                          <span className="status-badge unread-dot"></span>
                        ) : (
                          <span className="status-badge open">Đang tư vấn</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Chat details */}
        <div className="admin-chat-content">
          {activeId && activeConversation ? (
            <>
              {/* Chat Content Header */}
              <div className="admin-chat-content-header">
                <div className="active-user-info">
                  <div className="active-avatar">
                    <FiUser />
                  </div>
                  <div>
                    <h3>{activeConversation.user_name}</h3>
                    <p>{activeConversation.user_email}</p>
                  </div>
                </div>

                <div className="chat-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {activeConversation.status === 'open' && (
                    <label className="ai-bot-toggle-label" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      cursor: 'pointer', 
                      userSelect: 'none', 
                      background: 'rgba(255, 255, 255, 0.08)', 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      border: '1px solid rgba(255, 255, 255, 0.15)', 
                      fontSize: '0.85rem' 
                    }}>
                      <input 
                        type="checkbox" 
                        checked={activeConversation.is_bot_active === 1 || activeConversation.is_bot_active === true} 
                        onChange={handleToggleBot}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ 
                        color: (activeConversation.is_bot_active === 1 || activeConversation.is_bot_active === true) ? '#4ade80' : '#94a3b8', 
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                      }}>
                        🤖 AI Bot: {(activeConversation.is_bot_active === 1 || activeConversation.is_bot_active === true) ? 'BẬT' : 'TẮT'}
                      </span>
                    </label>
                  )}

                  {activeConversation.status === 'open' ? (
                    <button 
                      onClick={handleCloseConversation} 
                      className="btn-close-chat"
                      title="Hoàn thành và lưu trữ cuộc hội thoại"
                    >
                      <FiCheckCircle /> Đóng hội thoại
                    </button>
                  ) : (
                    <span className="chat-closed-indicator">✓ Hội thoại đã đóng</span>
                  )}
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="admin-chat-messages">
                <div className="admin-system-notice">
                  Hệ thống kết nối trực tuyến với {activeConversation.user_name}. 
                  Cuộc hội thoại được bắt đầu từ ngày {new Date(activeConversation.created_at).toLocaleDateString()}.
                </div>

                {messages.map((msg) => {
                  const isMe = msg.sender_role === 'admin';
                  const msgTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div
                      key={msg.id}
                      className={`admin-msg-row ${isMe ? 'msg-me' : 'msg-user'}`}
                    >
                      <div className="msg-bubble-wrapper">
                        <div className="msg-bubble">
                          {msg.content}
                        </div>
                        <span className="msg-time">{msgTime}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Footer */}
              <div className="admin-chat-footer">
                {activeConversation.status === 'closed' && (
                  <div className="closed-chat-warning">
                    Hội thoại này đã được đóng. Gửi tin nhắn mới sẽ tự động mở lại cuộc hội thoại.
                  </div>
                )}
                <div className="admin-input-row">
                  <input
                    type="text"
                    placeholder="Nhập nội dung tin nhắn tư vấn..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isSending}
                    className="admin-send-btn"
                  >
                    <FiSend /> Gửi
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="admin-chat-placeholder">
              <div className="placeholder-icon">💬</div>
              <h3>Khung Chat Hỗ Trợ Khách Hàng</h3>
              <p>Chọn một khách hàng trong danh sách bên trái để bắt đầu tư vấn trực tiếp và nhận yêu cầu thiết kế.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
