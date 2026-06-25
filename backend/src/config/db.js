const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'laser_ntn_shop',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword123',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Initialize Chat Tables if they do not exist
 */
const initChatTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        status ENUM('open', 'closed') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NOT NULL,
        sender_id INT NOT NULL,
        sender_role ENUM('user', 'admin') NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
        INDEX idx_conversation_id (conversation_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Chat tables verified/created successfully!');

    // Thêm cột extra_images vào bảng products (bỏ qua nếu đã tồn tại)
    try {
      await pool.query(`ALTER TABLE products ADD COLUMN extra_images TEXT DEFAULT NULL`);
      console.log('✅ Added extra_images column to products table.');
    } catch (alterError) {
      if (alterError.errno !== 1060) {
        console.error('⚠️ Lỗi thay đổi bảng products:', alterError);
      }
    }

    // Thêm cột google_id vào bảng users (cho Google OAuth)
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL`);
      console.log('✅ Added google_id column to users table.');
    } catch (alterError) {
      if (alterError.errno !== 1060) {
        console.error('⚠️ Lỗi thêm cột google_id:', alterError);
      }
    }

    // Thêm cột avatar vào bảng users
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL`);
      console.log('✅ Added avatar column to users table.');
    } catch (alterError) {
      if (alterError.errno !== 1060) {
        console.error('⚠️ Lỗi thêm cột avatar:', alterError);
      }
    }

    // Cho phép password NULL (user Google không cần mật khẩu)
    try {
      await pool.query(`ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL`);
      console.log('✅ Modified password column to allow NULL.');
    } catch (alterError) {
      console.error('⚠️ Lỗi modify cột password:', alterError);
    }

  } catch (err) {
    console.error('❌ Failed to initialize chat tables:', err);
  }
};

/**
 * Test DB connection with retry logic
 * (needed because MySQL container may not be ready immediately)
 */
const connectWithRetry = async (retries = 10, delay = 3000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ MySQL connected successfully!');
      connection.release();
      
      // Khởi tạo các bảng chat
      await initChatTables();
      return;
    } catch (error) {
      console.log(`⏳ DB connection attempt ${i}/${retries} failed: ${error.message}`);
      if (i === retries) {
        console.error('❌ Could not connect to MySQL after multiple attempts.');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = { pool, connectWithRetry };

