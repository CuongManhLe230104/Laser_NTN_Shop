const { pool } = require('../config/db');

// Helper to generate slug from name
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
 * GET /api/categories
 */
const getAllCategories = async (req, res) => {
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
    console.error('getAllCategories error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * GET /api/categories/:id
 */
const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const [categories] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục.' });
    }
    res.json({ success: true, data: categories[0] });
  } catch (error) {
    console.error('getCategoryById error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * POST /api/categories
 * Admin only
 */
const createCategory = async (req, res) => {
  const { name, slug, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Tên danh mục là bắt buộc.' });
  }

  const categorySlug = slug || slugify(name);

  try {
    // Check if slug exists
    const [existing] = await pool.execute('SELECT id FROM categories WHERE slug = ?', [categorySlug]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Slug hoặc tên danh mục này đã tồn tại.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [name, categorySlug, description || '']
    );

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công.',
      data: {
        id: result.insertId,
        name,
        slug: categorySlug,
        description
      }
    });
  } catch (error) {
    console.error('createCategory error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * PUT /api/categories/:id
 * Admin only
 */
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Tên danh mục là bắt buộc.' });
  }

  const categorySlug = slug || slugify(name);

  try {
    // Check if category exists
    const [existingCat] = await pool.execute('SELECT id FROM categories WHERE id = ?', [id]);
    if (existingCat.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục.' });
    }

    // Check if slug is taken by another category
    const [dupSlug] = await pool.execute(
      'SELECT id FROM categories WHERE slug = ? AND id != ?',
      [categorySlug, id]
    );
    if (dupSlug.length > 0) {
      return res.status(409).json({ success: false, message: 'Slug hoặc tên danh mục này đã bị trùng lặp.' });
    }

    await pool.execute(
      'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?',
      [name, categorySlug, description || '', id]
    );

    res.json({
      success: true,
      message: 'Cập nhật danh mục thành công.',
      data: {
        id: parseInt(id),
        name,
        slug: categorySlug,
        description
      }
    });
  } catch (error) {
    console.error('updateCategory error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

/**
 * DELETE /api/categories/:id
 * Admin only
 */
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const [category] = await pool.execute('SELECT id FROM categories WHERE id = ?', [id]);
    if (category.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục.' });
    }

    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa danh mục thành công.'
    });
  } catch (error) {
    console.error('deleteCategory error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
