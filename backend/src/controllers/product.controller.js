const { pool } = require('../config/db');

/**
 * GET /api/products
 * Query params: page, limit, category, search
 */
const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  const { category, search } = req.query;

  try {
    let whereClause = 'WHERE p.is_active = TRUE';
    const params = [];

    if (category) {
      whereClause += ' AND c.slug = ?';
      params.push(category);
    }

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [products] = await pool.execute(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GetAllProducts error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * GET /api/products/:slug
 */
const getProductBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const [products] = await pool.execute(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = TRUE`,
      [slug]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    }

    res.json({ success: true, data: products[0] });
  } catch (error) {
    console.error('GetProduct error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * GET /api/products/categories
 */
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      `SELECT c.*, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.name`
    );

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('GetCategories error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * POST /api/products
 * Admin only
 */
const createProduct = async (req, res) => {
  const { category_id, name, slug, description, price, stock, image_url, is_active } = req.body;

  if (!category_id || !name || price === undefined || stock === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đầy đủ thông tin: danh mục, tên, giá bán và số lượng kho.',
    });
  }

  const productSlug = slug || slugify(name);

  try {
    // Check if category exists
    const [category] = await pool.execute('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (category.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh mục sản phẩm không tồn tại.' });
    }

    // Check if slug exists
    const [existing] = await pool.execute('SELECT id FROM products WHERE slug = ?', [productSlug]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Slug hoặc tên sản phẩm này đã tồn tại.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO products (category_id, name, slug, description, price, stock, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name,
        productSlug,
        description || '',
        price,
        stock,
        image_url || '',
        is_active !== undefined ? is_active : true,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm thành công.',
      data: {
        id: result.insertId,
        category_id,
        name,
        slug: productSlug,
        description,
        price,
        stock,
        image_url,
        is_active: is_active !== undefined ? is_active : true,
      },
    });
  } catch (error) {
    console.error('CreateProduct error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * PUT /api/products/:id
 * Admin only
 */
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { category_id, name, slug, description, price, stock, image_url, is_active } = req.body;

  if (!category_id || !name || price === undefined || stock === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đầy đủ thông tin: danh mục, tên, giá bán và số lượng kho.',
    });
  }

  const productSlug = slug || slugify(name);

  try {
    // Check if product exists
    const [existingProduct] = await pool.execute('SELECT id FROM products WHERE id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    }

    // Check if category exists
    const [category] = await pool.execute('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (category.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh mục sản phẩm không tồn tại.' });
    }

    // Check if slug is taken by another product
    const [dupSlug] = await pool.execute('SELECT id FROM products WHERE slug = ? AND id != ?', [
      productSlug,
      id,
    ]);
    if (dupSlug.length > 0) {
      return res.status(409).json({ success: false, message: 'Slug hoặc tên sản phẩm này đã bị trùng lặp.' });
    }

    await pool.execute(
      `UPDATE products 
       SET category_id = ?, name = ?, slug = ?, description = ?, price = ?, stock = ?, image_url = ?, is_active = ?
       WHERE id = ?`,
      [
        category_id,
        name,
        productSlug,
        description || '',
        price,
        stock,
        image_url || '',
        is_active !== undefined ? is_active : true,
        id,
      ]
    );

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công.',
      data: {
        id: parseInt(id),
        category_id,
        name,
        slug: productSlug,
        description,
        price,
        stock,
        image_url,
        is_active: is_active !== undefined ? is_active : true,
      },
    });
  } catch (error) {
    console.error('UpdateProduct error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * DELETE /api/products/:id
 * Admin only
 */
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [product] = await pool.execute('SELECT id FROM products WHERE id = ?', [id]);
    if (product.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    }

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công.',
    });
  } catch (error) {
    console.error('DeleteProduct error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = {
  getAllProducts,
  getProductBySlug,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};
