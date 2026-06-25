const { pool } = require('../config/db');

/**
 * GET /api/admin/stats
 * Trả về số liệu tổng quan cho Admin Dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    // 1. Tổng số sản phẩm (tất cả, kể cả inactive)
    const [[{ totalProducts }]] = await pool.execute(
      `SELECT COUNT(*) AS totalProducts FROM products`
    );

    // 2. Sản phẩm đang bán (is_active = true)
    const [[{ activeProducts }]] = await pool.execute(
      `SELECT COUNT(*) AS activeProducts FROM products WHERE is_active = TRUE`
    );

    // 3. Sản phẩm hết hàng (stock = 0)
    const [[{ outOfStock }]] = await pool.execute(
      `SELECT COUNT(*) AS outOfStock FROM products WHERE stock = 0`
    );

    // 4. Tổng số người dùng (role = 'user')
    const [[{ totalUsers }]] = await pool.execute(
      `SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'user'`
    );

    // 5. Tổng số danh mục
    const [[{ totalCategories }]] = await pool.execute(
      `SELECT COUNT(*) AS totalCategories FROM categories`
    );

    // 6. Tổng giá trị hàng hóa trong kho (price * stock)
    const [[{ inventoryValue }]] = await pool.execute(
      `SELECT COALESCE(SUM(price * stock), 0) AS inventoryValue FROM products WHERE is_active = TRUE`
    );

    // 7. Sản phẩm mới nhất (5 sản phẩm gần đây nhất)
    const [recentProducts] = await pool.execute(
      `SELECT p.id, p.name, p.price, p.stock, p.image_url, p.is_active, p.created_at,
              c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC
       LIMIT 5`
    );

    // 8. Danh mục kèm số lượng sản phẩm
    const [categoriesWithCount] = await pool.execute(
      `SELECT c.id, c.name, c.slug, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
       GROUP BY c.id
       ORDER BY product_count DESC`
    );

    // 9. Người dùng đăng ký gần đây (5 người)
    const [recentUsers] = await pool.execute(
      `SELECT id, name, email, created_at
       FROM users
       WHERE role = 'user'
       ORDER BY created_at DESC
       LIMIT 5`
    );

    // 10. Sản phẩm sắp hết hàng (stock <= 5 và > 0)
    const [lowStockProducts] = await pool.execute(
      `SELECT p.id, p.name, p.stock, p.image_url, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.stock <= 5 AND p.stock > 0 AND p.is_active = TRUE
       ORDER BY p.stock ASC
       LIMIT 5`
    );

    // 11. Tổng số đơn hàng
    const [[{ totalOrders }]] = await pool.execute(
      `SELECT COUNT(*) AS totalOrders FROM orders`
    );

    // 12. Đơn hàng theo trạng thái
    const [ordersByStatus] = await pool.execute(
      `SELECT status, COUNT(*) AS count FROM orders GROUP BY status`
    );

    // 13. Doanh thu từ đơn hàng đã giao
    const [[{ revenue }]] = await pool.execute(
      `SELECT COALESCE(SUM(total_price), 0) AS revenue FROM orders WHERE status = 'delivered'`
    );

    // 14. Đơn hàng mới nhất (5 đơn)
    const [recentOrders] = await pool.execute(
      `SELECT o.id, o.total_price, o.status, o.created_at,
              u.name AS user_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          outOfStock,
          totalUsers,
          totalCategories,
          inventoryValue: parseFloat(inventoryValue),
          totalOrders,
          revenue: parseFloat(revenue),
          ordersByStatus,
        },
        recentProducts,
        categoriesWithCount,
        recentUsers,
        lowStockProducts,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê.' });
  }
};

/**
 * GET /api/admin/products
 * Lấy TẤT CẢ sản phẩm (kể cả inactive) — chỉ Admin
 */
const getAllProductsAdmin = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const { search, category } = req.query;

  try {
    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where += ' AND c.slug = ?';
      params.push(category);
    }

    const [products] = await pool.execute(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}`,
      params
    );

    res.json({
      success: true,
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('getAllProductsAdmin error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * GET /api/admin/users
 * Lấy danh sách tất cả users — chỉ Admin
 */
const getAllUsers = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const { search } = req.query;

  try {
    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [users] = await pool.execute(
      `SELECT id, name, email, role, created_at, updated_at
       FROM users
       ${where}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM users ${where}`,
      params
    );

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Thay đổi role của user — chỉ Admin
 */
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Role không hợp lệ. Chỉ chấp nhận: user, admin.' });
  }

  // Không cho phép tự thay đổi role của chính mình
  if (parseInt(id) === req.user.id) {
    return res.status(403).json({ success: false, message: 'Không thể thay đổi role của chính mình.' });
  }

  try {
    const [existing] = await pool.execute('SELECT id, name FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    res.json({
      success: true,
      message: `Đã cập nhật role của "${existing[0].name}" thành "${role}".`,
    });
  } catch (error) {
    console.error('updateUserRole error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Xóa user — chỉ Admin
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(403).json({ success: false, message: 'Không thể xóa tài khoản của chính mình.' });
  }

  try {
    const [existing] = await pool.execute('SELECT id, name, role FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    // Xóa cart_items trước (foreign key)
    await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [id]);
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({ success: true, message: `Đã xóa người dùng "${existing[0].name}".` });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * POST /api/admin/upload
 * Tải lên một tệp hình ảnh đơn lẻ
 */
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp hình ảnh.' });
    }

    // Đường dẫn tương đối phục vụ cho web
    const fileUrl = `/api/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Tải ảnh lên thành công.',
      url: fileUrl,
    });
  } catch (error) {
    console.error('UploadSingleImage error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải ảnh lên.' });
  }
};

/**
 * POST /api/admin/upload-multiple
 * Tải lên nhiều tệp hình ảnh (tối đa 5)
 */
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ít nhất một hình ảnh.' });
    }

    const urls = req.files.map(file => `/api/uploads/${file.filename}`);

    res.status(200).json({
      success: true,
      message: 'Tải danh sách ảnh lên thành công.',
      urls,
    });
  } catch (error) {
    console.error('UploadMultipleImages error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải danh sách ảnh.' });
  }
};

module.exports = {
  getDashboardStats,
  getAllProductsAdmin,
  getAllUsers,
  updateUserRole,
  deleteUser,
  uploadSingleImage,
  uploadMultipleImages,
};
