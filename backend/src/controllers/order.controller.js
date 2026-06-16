const { pool } = require('../config/db');

/**
 * POST /api/orders
 * Tạo đơn hàng từ giỏ hàng hiện tại
 */
const createOrder = async (req, res) => {
  const { shipping_address, note } = req.body;
  const userId = req.user.id;

  if (!shipping_address || !shipping_address.full_name || !shipping_address.phone || !shipping_address.address) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng điền đầy đủ thông tin giao hàng: họ tên, số điện thoại và địa chỉ.',
    });
  }

  try {
    // 1. Lấy giỏ hàng hiện tại
    const [cartItems] = await pool.execute(
      `SELECT ci.id AS cart_item_id, ci.quantity,
              p.id AS product_id, p.name, p.price, p.stock, p.is_active
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.' });
    }

    // 2. Kiểm tra tồn kho & trạng thái sản phẩm
    for (const item of cartItems) {
      if (!item.is_active) {
        return res.status(400).json({ success: false, message: `Sản phẩm "${item.name}" hiện không còn bán. Vui lòng xóa khỏi giỏ hàng.` });
      }
      if (item.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Sản phẩm "${item.name}" chỉ còn ${item.stock} cái trong kho, bạn đang đặt ${item.quantity}.` });
      }
    }

    // 3. Tính tổng tiền
    const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    // 4. Build shipping_address & note thành JSON string
    const shippingStr = JSON.stringify({ ...shipping_address, note: note || '' });

    // 5. Bắt đầu transaction
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // 5a. Tạo order
      const [orderResult] = await conn.execute(
        `INSERT INTO orders (user_id, total_price, status, shipping_address)
         VALUES (?, ?, 'pending', ?)`,
        [userId, totalPrice.toFixed(2), shippingStr]
      );
      const orderId = orderResult.insertId;

      // 5b. Tạo order_items và giảm tồn kho
      for (const item of cartItems) {
        await conn.execute(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price]
        );

        // Giảm stock
        await conn.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      // 5c. Xóa giỏ hàng
      await conn.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);

      await conn.commit();
      conn.release();

      res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công!',
        data: { orderId, totalPrice: parseFloat(totalPrice.toFixed(2)) },
      });
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  } catch (error) {
    console.error('CreateOrder error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo đơn hàng.' });
  }
};

/**
 * GET /api/orders
 * Lấy lịch sử đơn hàng của user hiện tại
 */
const getMyOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    // Lấy danh sách đơn hàng
    const [orders] = await pool.execute(
      `SELECT id, total_price, status, shipping_address, created_at, updated_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    // Lấy items cho từng đơn hàng
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.execute(
          `SELECT oi.quantity, oi.unit_price,
                  p.id AS product_id, p.name, p.slug, p.image_url
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        );

        let shippingAddress = {};
        try { shippingAddress = JSON.parse(order.shipping_address || '{}'); } catch {}

        return {
          ...order,
          total_price: parseFloat(order.total_price),
          shipping_address: shippingAddress,
          items,
        };
      })
    );

    res.json({ success: true, data: ordersWithItems });
  } catch (error) {
    console.error('GetMyOrders error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * GET /api/orders/:id
 * Xem chi tiết một đơn hàng (chỉ của chính mình)
 */
const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [orders] = await pool.execute(
      `SELECT id, total_price, status, shipping_address, created_at
       FROM orders WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }

    const [items] = await pool.execute(
      `SELECT oi.quantity, oi.unit_price,
              p.id AS product_id, p.name, p.slug, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    let shippingAddress = {};
    try { shippingAddress = JSON.parse(orders[0].shipping_address || '{}'); } catch {}

    res.json({
      success: true,
      data: {
        ...orders[0],
        total_price: parseFloat(orders[0].total_price),
        shipping_address: shippingAddress,
        items,
      },
    });
  } catch (error) {
    console.error('GetOrderById error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * POST /api/orders/:id/cancel
 * User tự hủy đơn (chỉ được hủy khi đang ở trạng thái 'pending')
 */
const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [orders] = await pool.execute(
      'SELECT id, status FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }

    if (orders[0].status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý.' });
    }

    // Hoàn lại stock
    const [items] = await pool.execute(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]
    );
    for (const item of items) {
      await pool.execute(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', id]);

    res.json({ success: true, message: 'Đã hủy đơn hàng thành công.' });
  } catch (error) {
    console.error('CancelOrder error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/* =====================================
   ADMIN-ONLY HANDLERS
   ===================================== */

/**
 * GET /api/admin/orders
 * Admin: xem tất cả đơn hàng
 */
const getAllOrdersAdmin = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const { status } = req.query;

  try {
    let where = 'WHERE 1=1';
    const params = [];
    if (status) { where += ' AND o.status = ?'; params.push(status); }

    const [orders] = await pool.execute(
      `SELECT o.id, o.total_price, o.status, o.shipping_address, o.created_at,
              u.name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM orders o ${where}`, params
    );

    const ordersWithAddr = orders.map(o => {
      let addr = {};
      try { addr = JSON.parse(o.shipping_address || '{}'); } catch {}
      return { ...o, total_price: parseFloat(o.total_price), shipping_address: addr };
    });

    res.json({
      success: true,
      data: ordersWithAddr,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GetAllOrdersAdmin error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * PUT /api/admin/orders/:id/status
 * Admin: cập nhật trạng thái đơn hàng
 */
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
  }

  try {
    const [orders] = await pool.execute('SELECT id, status FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }

    // Nếu chuyển sang cancelled, hoàn lại stock
    if (status === 'cancelled' && orders[0].status !== 'cancelled') {
      const [items] = await pool.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]
      );
      for (const item of items) {
        await pool.execute(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    res.json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng.' });
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrdersAdmin,
  updateOrderStatus,
};
