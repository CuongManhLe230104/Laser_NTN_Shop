const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductBySlug,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { getProductReviews, createReview } = require('../controllers/review.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Lấy danh sách tất cả danh mục
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Danh sách danh mục kèm số lượng sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Category' }
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm (có phân trang, tìm kiếm, lọc danh mục)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *         description: Số sản phẩm mỗi trang
 *       - in: query
 *         name: category
 *         schema: { type: string, example: may-laser }
 *         description: Slug danh mục để lọc
 *       - in: query
 *         name: search
 *         schema: { type: string, example: co2 }
 *         description: Từ khóa tìm kiếm (tên hoặc mô tả)
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/products/{slug}:
 *   get:
 *     summary: Lấy chi tiết một sản phẩm theo slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string, example: may-laser-co2-60w }
 *         description: Slug của sản phẩm
 *     responses:
 *       200:
 *         description: Chi tiết sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       404:
 *         description: Không tìm thấy sản phẩm
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/:slug', getProductBySlug);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Thêm sản phẩm mới (Chỉ dành cho Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               category_id: { type: integer, example: 1 }
 *               name: { type: string, example: Hộp rượu gỗ cao cấp }
 *               slug: { type: string, example: hop-ruou-go-cao-cap }
 *               description: { type: string, example: Hộp gỗ đựng rượu vang cao cấp... }
 *               price: { type: number, example: 350000 }
 *               stock: { type: integer, example: 50 }
 *               image_url: { type: string, example: /hop-ruou.png }
 *               is_active: { type: boolean, example: true }
 *     responses:
 *       201:
 *         description: Thêm thành công
 *       400:
 *         description: Thiếu thông tin hoặc lỗi danh mục không tồn tại
 *       409:
 *         description: Trùng lặp slug
 *       401:
 *         description: Thiếu token
 *       403:
 *         description: Không có quyền admin
 */
router.post('/', verifyToken, requireAdmin, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Cập nhật thông tin sản phẩm (Chỉ dành cho Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID sản phẩm cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               category_id: { type: integer, example: 1 }
 *               name: { type: string, example: Hộp rượu gỗ cao cấp }
 *               slug: { type: string, example: hop-ruou-go-cao-cap }
 *               description: { type: string, example: Hộp gỗ đựng rượu... }
 *               price: { type: number, example: 350000 }
 *               stock: { type: integer, example: 45 }
 *               image_url: { type: string, example: /hop-ruou.png }
 *               is_active: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Thiếu thông tin hoặc lỗi danh mục
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       409:
 *         description: Trùng lặp slug
 *       401:
 *         description: Thiếu token
 *       403:
 *         description: Không có quyền admin
 */
router.put('/:id', verifyToken, requireAdmin, updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm (Chỉ dành cho Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID sản phẩm cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       401:
 *         description: Thiếu token
 *       403:
 *         description: Không có quyền admin
 */
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

// --- REVIEWS ROUTES ---
// Lấy danh sách đánh giá của sản phẩm (công khai)
router.get('/:id/reviews', getProductReviews);
// Gửi đánh giá mới cho sản phẩm (yêu cầu đăng nhập)
router.post('/:id/reviews', verifyToken, createReview);

module.exports = router;
