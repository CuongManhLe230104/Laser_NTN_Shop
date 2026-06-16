import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiSend, FiX, FiPhone, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { chatAPI } from '../services/api';
import './ChatWidget.css';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showStack, setShowStack] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [conversation, setConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!token && user.role !== 'admin'; // Chỉ hiện chat cho user thường, admin có Dashboard riêng

  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Shop configurations
  const shopZaloNumber = '0986814523'; // Có thể thay bằng SĐT thực tế của Shop
  const shopPhone = '0986814523';

  // Tự động scroll xuống dưới cùng
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0); // Reset unread count when chat is opened
    }
  }, [messages, isOpen]);

  // Fetch tin nhắn từ API
  const fetchMessages = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await chatAPI.getMessages();
      if (response.data.success) {
        const newMessages = response.data.messages || [];
        setConversation(response.data.conversation);

        // Tính toán số lượng tin nhắn chưa đọc từ admin khi đóng chat
        if (!isOpen && newMessages.length > 0) {
          const oldLength = messages.length;
          if (newMessages.length > oldLength) {
            // Đếm số tin nhắn mới từ phía admin
            const newAdminMessages = newMessages.slice(oldLength).filter(m => m.sender_role === 'admin');
            if (newAdminMessages.length > 0) {
              setUnreadCount(prev => prev + newAdminMessages.length);
            }
          }
        }

        setMessages(newMessages);
      }
    } catch (error) {
      console.error('Lỗi khi fetch tin nhắn chat widget:', error);
    }
  };

  // Thiết lập vòng lặp Polling
  useEffect(() => {
    if (isLoggedIn) {
      // Fetch lần đầu tiên
      fetchMessages();

      // Thiết lập Polling
      const intervalTime = isOpen ? 3000 : 10000; // 3s khi mở, 10s khi đóng
      pollIntervalRef.current = setInterval(fetchMessages, intervalTime);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isLoggedIn, isOpen, messages.length]);

  // Gửi tin nhắn
  const handleSendMessage = async (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text || isSending || !isLoggedIn) return;

    setIsSending(true);
    try {
      const response = await chatAPI.sendMessage(text);
      if (response.data.success) {
        const newMsg = response.data.data;
        setMessages(prev => [...prev, newMsg]);
        if (textToSend === inputText) {
          setInputText('');
        }
        // Force refresh conversation info
        fetchMessages();
      }
    } catch (error) {
      console.error('Lỗi gửi tin nhắn chat widget:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Xử lý gửi bằng phím Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Gửi tin nhắn nhanh từ mẫu gợi ý
  const handleQuickSend = (template) => {
    handleSendMessage(template);
  };

  // Không hiển thị widget cho Admin
  if (user && user.role === 'admin') {
    return null;
  }

  return (
    <div className="chat-widget-wrapper">
      {/* Floating Action Buttons Stack */}
      <div className={`contact-buttons-stack ${showStack ? 'visible' : 'hidden'}`}>
        {/* Zalo Button */}
        <a
          href={`https://zalo.me/${shopZaloNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-btn contact-btn--zalo"
          title="Chat Zalo ngay"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" />
          <span className="contact-tooltip">Zalo Shop</span>
        </a>

        {/* Hotline Button */}
        <a
          href={`tel:${shopPhone}`}
          className="contact-btn contact-btn--hotline"
          title="Gọi Hotline tư vấn"
        >
          <FiPhone size={22} />
          <span className="contact-tooltip">Hotline</span>
        </a>

        {/* Website Live Chat Toggle Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setUnreadCount(0); // Reset khi mở
          }}
          className={`contact-btn contact-btn--chat ${isOpen ? 'active' : ''}`}
          title="Chat trực tuyến trên website"
        >
          {isOpen ? <FiX size={22} /> : <FiMessageSquare size={22} />}
          {unreadCount > 0 && <span className="chat-notification-badge">{unreadCount}</span>}
          <span className="contact-tooltip">Chat trực tiếp</span>
        </button>
      </div>

      {/* Toggle stack visibility button */}
      <button
        className="toggle-stack-btn"
        onClick={() => setShowStack(!showStack)}
        title={showStack ? "Thu gọn liên hệ" : "Mở rộng liên hệ"}
      >
        {showStack ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
      </button>

      {/* Chatbox Window */}
      {isOpen && (
        <div className="chatbox-window glass-card">
          {/* Chat Header */}
          <div className="chatbox-header">
            <div className="chatbox-header__info">
              <div className="chatbox-header__avatar">N</div>
              <div>
                <h4>Hỗ trợ trực tuyến Laser NTN</h4>
                <span className="status-indicator">Đang hoạt động</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="chatbox-header__close">
              <FiX size={18} />
            </button>
          </div>

          {/* Chat Content */}
          <div className="chatbox-body">
            {!isLoggedIn ? (
              <div className="chatbox-auth-prompt">
                <div className="auth-prompt-icon">💬</div>
                <h3>Nhắn tin trực tiếp với Shop</h3>
                <p>Vui lòng đăng nhập tài khoản của bạn để bắt đầu gửi tin nhắn trực tiếp đến hỗ trợ viên của chúng tôi.</p>
                <Link to="/login" className="btn-primary auth-prompt-btn" onClick={() => setIsOpen(false)}>
                  Đăng Nhập Ngay
                </Link>
                <div className="auth-prompt-or">hoặc liên hệ nhanh qua:</div>
                <a
                  href={`https://zalo.me/${shopZaloNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zalo-direct-link"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" />
                  Nhắn tin qua Zalo
                </a>
              </div>
            ) : (
              <>
                {/* Lời chào hệ thống */}
                <div className="chat-message chat-message--system">
                  <div className="chat-message__bubble">
                    Chào <strong>{user.name}</strong>! Cảm ơn bạn đã liên hệ Laser NTN.
                    Bạn cần tư vấn về đặt hàng thiết kế riêng hay mua sỉ số lượng lớn? Hãy gửi tin nhắn dưới đây để được hỗ trợ nhanh nhất nhé!
                  </div>
                </div>

                {messages.length === 0 && (
                  <div className="chatbox-empty-hint">
                    Chưa có tin nhắn nào. Hãy chọn câu hỏi gợi ý hoặc nhập tin nhắn bên dưới.
                  </div>
                )}

                {/* Danh sách tin nhắn */}
                {messages.map((msg) => {
                  const isMe = msg.sender_role === 'user';
                  const msgTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div
                      key={msg.id}
                      className={`chat-message ${isMe ? 'chat-message--me' : 'chat-message--admin'}`}
                    >
                      {!isMe && <div className="chat-message__avatar">Ad</div>}
                      <div className="chat-message__bubble-wrapper">
                        <div className="chat-message__bubble">
                          {msg.content}
                        </div>
                        <span className="chat-message__time">{msgTime}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick replies templates (Chỉ hiển thị khi đã đăng nhập) */}
          {isLoggedIn && (
            <div className="chatbox-quick-replies">
              <button onClick={() => handleQuickSend('Tôi muốn đặt hàng theo thiết kế riêng 🎨')}>
                Thiết kế riêng 🎨
              </button>
              <button onClick={() => handleQuickSend('Tôi muốn đặt hàng số lượng lớn (cho sự kiện/doanh nghiệp) 📦')}>
                Đặt số lượng lớn 📦
              </button>
              <button onClick={() => handleQuickSend('Vui lòng tư vấn báo giá sản phẩm khắc laser 💵')}>
                Báo giá 💵
              </button>
            </div>
          )}

          {/* Chat Input */}
          {isLoggedIn && (
            <div className="chatbox-footer">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isSending}
                className="chatbox-send-btn"
                title="Gửi tin nhắn"
              >
                <FiSend size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
