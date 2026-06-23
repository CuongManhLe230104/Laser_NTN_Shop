const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { pool } = require('../config/db');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu phải ít nhất 6 ký tự.' });
  }

  try {
    // Check email exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email đã được sử dụng.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: result.insertId, email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      token,
      user: { id: result.insertId, name, email, role: 'user' },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server. Vui lòng thử lại.' });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
  }

  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }

    const user = users[0];

    // User đăng ký qua Google sẽ không có password
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản này đăng nhập bằng Google. Vui lòng dùng nút "Đăng nhập với Google".',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server. Vui lòng thử lại.' });
  }
};

/**
 * POST /api/auth/google
 * Xác minh Google ID Token và đăng nhập / tạo tài khoản
 */
const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, message: 'Thiếu Google credential.' });
  }

  try {
    // Xác minh token với Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: avatar } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Không lấy được email từ Google.' });
    }

    // Tìm user theo google_id trước
    const [existingByGoogleId] = await pool.execute(
      'SELECT * FROM users WHERE google_id = ?',
      [googleId]
    );

    let user;

    if (existingByGoogleId.length > 0) {
      // User đã có, cập nhật avatar nếu thay đổi
      user = existingByGoogleId[0];
      await pool.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatar, user.id]);
      user.avatar = avatar;
    } else {
      // Kiểm tra email trùng (đã đăng ký thường trước đó)
      const [existingByEmail] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingByEmail.length > 0) {
        // Liên kết tài khoản cũ với Google
        user = existingByEmail[0];
        await pool.execute(
          'UPDATE users SET google_id = ?, avatar = ? WHERE id = ?',
          [googleId, avatar, user.id]
        );
        user.google_id = googleId;
        user.avatar = avatar;
      } else {
        // Tạo user mới từ Google
        const [result] = await pool.execute(
          'INSERT INTO users (name, email, google_id, avatar, password) VALUES (?, ?, ?, ?, NULL)',
          [name, email, googleId, avatar]
        );
        user = {
          id: result.insertId,
          name,
          email,
          google_id: googleId,
          avatar,
          role: 'user',
        };
      }
    }

    // Tạo JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập Google thành công!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    if (error.message?.includes('Invalid token')) {
      return res.status(401).json({ success: false, message: 'Google token không hợp lệ.' });
    }
    res.status(500).json({ success: false, message: 'Lỗi server. Vui lòng thử lại.' });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user.' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { register, login, googleLogin, getMe };
