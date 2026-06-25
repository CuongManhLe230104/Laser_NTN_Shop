const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllProductsAdmin,
  getAllUsers,
  updateUserRole,
  deleteUser,
  uploadSingleImage,
  uploadMultipleImages,
} = require('../controllers/admin.controller');
const { getAllOrdersAdmin, updateOrderStatus } = require('../controllers/order.controller');
const { getReviewsAIAnalysis } = require('../controllers/review.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Tất cả route admin đều yêu cầu xác thực + quyền admin
router.use(verifyToken, requireAdmin);

router.use((req, res, next) => {
  console.log(`[DEBUG adminRouter] ${req.method} ${req.originalUrl}`);
  next();
});

// Dashboard stats
router.get('/stats', getDashboardStats);

// AI Reviews Analysis
router.get('/reviews/ai-analysis', getReviewsAIAnalysis);

// Products (admin view — all products including inactive)
router.get('/products', getAllProductsAdmin);

// Users management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Orders management (admin)
router.get('/orders', getAllOrdersAdmin);
router.put('/orders/:id/status', updateOrderStatus);

// Image uploads (admin)
router.post('/upload', upload.single('image'), uploadSingleImage);
router.post('/upload-multiple', upload.array('images', 5), uploadMultipleImages);

module.exports = router;
