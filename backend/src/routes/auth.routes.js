const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Đăng ký thành công! }
 *                 token: { type: string, example: eyJhbGciOiJIUzI1NiIs... }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Thiếu thông tin hoặc mật khẩu quá ngắn
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: Email đã được sử dụng
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@laserntn.vn
 *               password:
 *                 type: string
 *                 example: "password"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công — trả về JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 token: { type: string, example: eyJhbGciOiJIUzI1NiIs... }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Sai email hoặc mật khẩu
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Đăng nhập bằng Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [credential]
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Google ID Token từ @react-oauth/google
 *     responses:
 *       200:
 *         description: Đăng nhập thành công — trả về JWT token
 */
router.post('/google', googleLogin);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin tài khoản hiện tại
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Chưa đăng nhập hoặc token hết hạn
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/me', verifyToken, getMe);

module.exports = router;
