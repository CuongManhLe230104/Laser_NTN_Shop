const { pool } = require('../config/db');

/**
 * GET /api/cart
 * Get current user's cart
 */
const getCart = async (req, res) => {
  try {
    const [items] = await pool.execute(
      `SELECT ci.id, ci.quantity, ci.updated_at,
              p.id AS product_id, p.name, p.slug, p.price, p.image_url, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?
       ORDER BY ci.updated_at DESC`,
      [req.user.id]
    );

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.json({
      success: true,
      data: { items, total: parseFloat(total.toFixed(2)), itemCount: items.length },
    });
  } catch (error) {
    console.error('GetCart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * POST /api/cart
 * Add item to cart (or increase qty if exists)
 */
const addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({ success: false, message: 'Thiếu product_id.' });
  }

  try {
    // Check product exists and has stock
    const [products] = await pool.execute(
      'SELECT id, stock FROM products WHERE id = ? AND is_active = TRUE',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });
    }

    if (products[0].stock < quantity) {
      return res.status(400).json({ success: false, message: 'Sản phẩm không đủ hàng.' });
    }

    // Upsert cart item
    await pool.execute(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, product_id, quantity]
    );

    res.json({ success: true, message: 'Đã thêm vào giỏ hàng.' });
  } catch (error) {
    console.error('AddToCart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * PUT /api/cart/:id
 * Update quantity of a cart item
 */
const updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ.' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ.' });
    }

    res.json({ success: true, message: 'Đã cập nhật giỏ hàng.' });
  } catch (error) {
    console.error('UpdateCart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * DELETE /api/cart/:id
 * Remove an item from cart
 */
const removeFromCart = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ.' });
    }

    res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng.' });
  } catch (error) {
    console.error('RemoveFromCart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * DELETE /api/cart
 * Clear entire cart
 */
const clearCart = async (req, res) => {
  try {
    await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Đã xóa toàn bộ giỏ hàng.' });
  } catch (error) {
    console.error('ClearCart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
