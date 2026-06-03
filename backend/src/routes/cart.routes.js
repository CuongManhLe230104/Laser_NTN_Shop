const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cart.controller');

// All cart routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Xem giỏ hàng của user hiện tại
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Giỏ hàng hiện tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/CartItem' }
 *                     total: { type: number, example: 50000000 }
 *                     itemCount: { type: integer, example: 2 }
 *       401:
 *         description: Chưa đăng nhập
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/', getCart);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id]
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Thêm vào giỏ hàng thành công
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       400:
 *         description: Thiếu product_id hoặc không đủ hàng
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Chưa đăng nhập
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/', addToCart);

/**
 * @swagger
 * /api/cart/{id}:
 *   put:
 *     summary: Cập nhật số lượng sản phẩm trong giỏ
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *         description: ID của cart_item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       404:
 *         description: Không tìm thấy sản phẩm trong giỏ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put('/:id', updateCartItem);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Xóa toàn bộ giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa giỏ hàng thành công
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 */
router.delete('/', clearCart);

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: Xóa một sản phẩm khỏi giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *         description: ID của cart_item cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       404:
 *         description: Không tìm thấy sản phẩm trong giỏ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete('/:id', removeFromCart);

module.exports = router;
