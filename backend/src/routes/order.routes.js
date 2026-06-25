const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All order routes require auth
router.use(verifyToken);

// POST   /api/orders         — Đặt hàng từ giỏ hàng
router.post('/', createOrder);

// GET    /api/orders         — Lịch sử đơn hàng của tôi
router.get('/', getMyOrders);

// GET    /api/orders/:id     — Chi tiết một đơn hàng
router.get('/:id', getOrderById);

// POST   /api/orders/:id/cancel — Hủy đơn
router.post('/:id/cancel', cancelOrder);

module.exports = router;
