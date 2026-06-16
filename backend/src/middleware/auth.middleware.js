const jwt = require('jsonwebtoken');

/**
 * Middleware: Verify JWT token
 * Adds `req.user` if valid
 */
const verifyToken = (req, res, next) => {
  console.log(`[DEBUG verifyToken] ${req.method} ${req.originalUrl}`);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy token. Vui lòng đăng nhập.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn.',
    });
  }
};

/**
 * Middleware: Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ admin mới có quyền truy cập.',
    });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };
