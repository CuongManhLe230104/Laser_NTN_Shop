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
 * Test DB connection with retry logic
 * (needed because MySQL container may not be ready immediately)
 */
const connectWithRetry = async (retries = 10, delay = 3000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ MySQL connected successfully!');
      connection.release();
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
