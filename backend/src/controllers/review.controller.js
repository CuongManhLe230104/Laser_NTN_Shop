const { pool } = require('../config/db');
const { analyzeReviews } = require('../services/gemini.service');

/**
 * GET /api/products/:id/reviews
 * Lấy danh sách đánh giá của sản phẩm và thống kê điểm sao trung bình
 */
const getProductReviews = async (req, res) => {
  const { id } = req.params; // Product ID

  try {
    // 1. Kiểm tra sản phẩm tồn tại
    const [products] = await pool.execute(`SELECT id FROM products WHERE id = ?`, [id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    }

    // 2. Thống kê sao trung bình và số lượng đánh giá
    const [[stats]] = await pool.execute(
      `SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS total_reviews
       FROM product_reviews
       WHERE product_id = ?`,
      [id]
    );

    // 3. Lấy chi tiết danh sách đánh giá kèm thông tin người dùng
    const [reviews] = await pool.execute(
      `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at,
              u.name AS user_name, u.avatar AS user_avatar
       FROM product_reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        reviews,
        average_rating: parseFloat(parseFloat(stats.average_rating).toFixed(1)),
        total_reviews: stats.total_reviews,
      }
    });
  } catch (error) {
    console.error('getProductReviews error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách đánh giá sản phẩm.' });
  }
};

/**
 * POST /api/products/:id/reviews
 * Người dùng đăng đánh giá cho một sản phẩm (yêu cầu đăng nhập, tối đa 1 bài/sản phẩm)
 */
const createReview = async (req, res) => {
  const { id } = req.params; // Product ID
  const userId = req.user.id;
  const { rating, comment } = req.body;

  // Validate sao đánh giá
  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ success: false, message: 'Đánh giá phải từ 1 đến 5 sao.' });
  }

  try {
    // 1. Kiểm tra sản phẩm tồn tại
    const [products] = await pool.execute(`SELECT id FROM products WHERE id = ?`, [id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    }

    // 2. Thêm đánh giá mới vào DB
    await pool.execute(
      `INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
      [id, userId, ratingNum, comment ? comment.trim() : null]
    );

    res.status(201).json({
      success: true,
      message: 'Đăng đánh giá thành công! Cảm ơn phản hồi của bạn.',
    });
  } catch (error) {
    // Trùng khóa UNIQUE (user_id, product_id)
    if (error.errno === 1062 || error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi.' });
    }
    console.error('createReview error:', error);
    res.status(500).json({ success: false, message: 'Lỗi gửi đánh giá sản phẩm.' });
  }
};

/**
 * GET /api/admin/reviews/ai-analysis
 * Admin gọi AI phân tích xu hướng đánh giá sản phẩm
 */
const getReviewsAIAnalysis = async (req, res) => {
  try {
    const analysisReport = await analyzeReviews();
    res.json({
      success: true,
      data: analysisReport,
    });
  } catch (error) {
    console.error('getReviewsAIAnalysis error:', error);
    res.status(500).json({ success: false, message: 'Lỗi phân tích đánh giá bằng AI.' });
  }
};

module.exports = {
  getProductReviews,
  createReview,
  getReviewsAIAnalysis,
};
