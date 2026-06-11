const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Tên của danh mục
 *           example: Đèn ngủ 3D
 *         slug:
 *           type: string
 *           description: Slug danh mục (tự động tạo từ name nếu để trống)
 *           example: den-ngu-3d
 *         description:
 *           type: string
 *           description: Mô tả chi tiết về danh mục
 *           example: Các mẫu đèn ngủ bằng gỗ khắc hình nghệ thuật
 *     CategoryResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Đèn ngủ 3D
 *         slug:
 *           type: string
 *           example: den-ngu-3d
 *         description:
 *           type: string
 *           example: Các mẫu đèn ngủ bằng gỗ khắc hình nghệ thuật
 *         product_count:
 *           type: integer
 *           example: 5
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy toàn bộ danh sách danh mục (kèm số lượng sản phẩm)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Trả về danh sách danh mục thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryResponse'
 */
router.get('/', getAllCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Lấy chi tiết một danh mục theo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của danh mục
 *     responses:
 *       200:
 *         description: Chi tiết danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/CategoryResponse'
 *       404:
 *         description: Không tìm thấy danh mục
 */
router.get('/:id', getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Tạo danh mục mới (Chỉ dành cho Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       409:
 *         description: Slug/tên danh mục đã tồn tại
 *       401:
 *         description: Không có quyền truy cập (thiếu token)
 *       403:
 *         description: Không có quyền admin
 */
router.post('/', verifyToken, requireAdmin, createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Cập nhật thông tin danh mục (Chỉ dành cho Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID danh mục cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       404:
 *         description: Không tìm thấy danh mục
 *       409:
 *         description: Trùng lặp slug
 *       401:
 *         description: Thiếu token
 *       403:
 *         description: Không có quyền admin
 */
router.put('/:id', verifyToken, requireAdmin, updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Xóa một danh mục (Chỉ dành cho Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID danh mục cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy danh mục
 *       401:
 *         description: Thiếu token
 *       403:
 *         description: Không có quyền admin
 */
router.delete('/:id', verifyToken, requireAdmin, deleteCategory);

module.exports = router;
