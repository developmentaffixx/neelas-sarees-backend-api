const pool = require('../lib/db');
const { cuid } = require('../lib/cuid');
const { serializeError } = require('../lib/errorHandler');

function safeParseJSON(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function parseProduct(row) {
  return {
    id: row.id, name: row.name, slug: row.slug, description: row.description,
    price: row.price, comparePrice: row.comparePrice, sku: row.sku, stock: row.stock,
    images: safeParseJSON(row.images),
    fabric: row.fabric, occasion: row.occasion, color: row.color,
    blouseIncluded: Boolean(row.blouseIncluded), careInstructions: row.careInstructions,
    isFeatured: Boolean(row.isFeatured), isActive: Boolean(row.isActive),
    categoryId: row.categoryId, createdAt: row.createdAt, updatedAt: row.updatedAt,
    category: row.cat_id ? { id: row.cat_id, name: row.cat_name, slug: row.cat_slug, type: row.cat_type } : null,
  };
}

const getProducts = async (req, res) => {
  try {
    const { page = '1', limit = '12', category, fabric, occasion, minPrice, maxPrice,
      sort = 'createdAt', order = 'desc', search, featured, includeInactive } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [];
    const params = [];

    if (includeInactive !== 'true') conditions.push('p.isActive = 1');
    if (category) { conditions.push('c.slug = ?'); params.push(category); }
    if (fabric) { conditions.push('p.fabric LIKE ?'); params.push(`%${fabric}%`); }
    if (occasion) { conditions.push('p.occasion LIKE ?'); params.push(`%${occasion}%`); }
    if (featured === 'true') conditions.push('p.isFeatured = 1');
    if (minPrice) { conditions.push('p.price >= ?'); params.push(Number(minPrice)); }
    if (maxPrice) { conditions.push('p.price <= ?'); params.push(Number(maxPrice)); }
    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const allowedSort = { createdAt: 'p.createdAt', price: 'p.price', name: 'p.name', stock: 'p.stock' };
    const sortCol = allowedSort[sort] || 'p.createdAt';
    const sortDir = order === 'asc' ? 'ASC' : 'DESC';
    const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '1=1';

    const [rows] = await pool.query(
      `SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.type as cat_type
       FROM products p LEFT JOIN categories c ON p.categoryId = c.id
       WHERE ${whereClause} ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: rows.map(parseProduct),
      pagination: { total: countRows[0].total, page: Number(page), limit: Number(limit), pages: Math.ceil(countRows[0].total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.type as cat_type
       FROM products p LEFT JOIN categories c ON p.categoryId = c.id
       WHERE p.slug = ? AND p.isActive = 1`, [req.params.slug]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });

    const product = parseProduct(rows[0]);
    const [reviewRows] = await pool.query(
      `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.userId = u.id
       WHERE r.productId = ? AND r.isApproved = 1 ORDER BY r.createdAt DESC LIMIT 10`, [product.id]
    );
    const reviews = reviewRows.map(r => ({
      id: r.id, userId: r.userId, productId: r.productId, rating: r.rating,
      title: r.title, body: r.body, isApproved: r.isApproved, createdAt: r.createdAt,
      images: r.images ? safeParseJSON(r.images, null) : null, user: { name: r.user_name },
    }));
    const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({ success: true, data: { ...product, reviews, avgRating } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const getFeaturedProducts = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.type as cat_type
       FROM products p LEFT JOIN categories c ON p.categoryId = c.id
       WHERE p.isFeatured = 1 AND p.isActive = 1 ORDER BY p.createdAt DESC LIMIT 8`
    );
    res.json({ success: true, data: rows.map(parseProduct) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.type as cat_type
       FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: parseProduct(rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, slug, description, price, comparePrice, sku, stock, images,
      fabric, occasion, color, blouseIncluded, careInstructions, isFeatured, isActive, categoryId } = req.body;

    if (!name || !slug || !description || !price || !sku || !fabric || !occasion || !color || !categoryId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const [existingSlug] = await pool.query('SELECT id FROM products WHERE slug = ?', [slug]);
    if (existingSlug.length > 0) return res.status(400).json({ success: false, message: 'Slug already exists' });
    const [existingSku] = await pool.query('SELECT id FROM products WHERE sku = ?', [sku]);
    if (existingSku.length > 0) return res.status(400).json({ success: false, message: 'SKU already exists' });

    const id = cuid();
    await pool.query(
      `INSERT INTO products (id, name, slug, description, price, comparePrice, sku, stock, images,
        fabric, occasion, color, blouseIncluded, careInstructions, isFeatured, isActive, categoryId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, slug, description, price, comparePrice ?? null, sku, stock ?? 0,
        JSON.stringify(images ?? []), fabric, occasion, color,
        blouseIncluded ? 1 : 0, careInstructions ?? null, isFeatured ? 1 : 0, isActive !== false ? 1 : 0, categoryId]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: parseProduct(rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const updateProduct = async (req, res) => {
  try {
    const allowedFields = ['name', 'slug', 'description', 'price', 'comparePrice', 'sku', 'stock',
      'images', 'fabric', 'occasion', 'color', 'blouseIncluded', 'careInstructions', 'isFeatured', 'isActive', 'categoryId'];

    const fields = {};
    for (const key of allowedFields) { if (key in req.body) fields[key] = req.body[key]; }
    if (Object.keys(fields).length === 0) return res.status(400).json({ success: false, message: 'No valid fields to update' });

    if (fields.images) fields.images = JSON.stringify(fields.images);
    if ('blouseIncluded' in fields) fields.blouseIncluded = fields.blouseIncluded ? 1 : 0;
    if ('isFeatured' in fields) fields.isFeatured = fields.isFeatured ? 1 : 0;
    if ('isActive' in fields) fields.isActive = fields.isActive ? 1 : 0;

    const keys = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE products SET ${keys}, updatedAt = NOW() WHERE id = ?`, [...Object.values(fields), req.params.id]);

    const [rows] = await pool.query(
      `SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.type as cat_type
       FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.id = ?`, [req.params.id]
    );
    res.json({ success: true, data: parseProduct(rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await pool.query('UPDATE products SET isActive = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const bulkUpdateProducts = async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, message: 'No product IDs provided' });
    const placeholders = ids.map(() => '?').join(',');
    const actionMap = {
      activate: `UPDATE products SET isActive = 1, updatedAt = NOW() WHERE id IN (${placeholders})`,
      deactivate: `UPDATE products SET isActive = 0, updatedAt = NOW() WHERE id IN (${placeholders})`,
      feature: `UPDATE products SET isFeatured = 1, updatedAt = NOW() WHERE id IN (${placeholders})`,
      unfeature: `UPDATE products SET isFeatured = 0, updatedAt = NOW() WHERE id IN (${placeholders})`,
      delete: `UPDATE products SET isActive = 0, updatedAt = NOW() WHERE id IN (${placeholders})`,
    };
    if (!actionMap[action]) return res.status(400).json({ success: false, message: 'Invalid action' });
    await pool.query(actionMap[action], ids);
    res.json({ success: true, message: `${ids.length} products updated` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const checkProductUniqueness = async (req, res) => {
  try {
    const { field, value, excludeId } = req.query;
    if (!field || !value || !['sku', 'slug'].includes(field)) return res.status(400).json({ success: false, message: 'Invalid field' });
    let query = `SELECT id FROM products WHERE ${field} = ?`;
    const params = [value];
    if (excludeId) { query += ' AND id != ?'; params.push(excludeId); }
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: { exists: rows.length > 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

module.exports = { getProducts, getProductBySlug, getFeaturedProducts, getProductById, createProduct, updateProduct, deleteProduct, bulkUpdateProducts, checkProductUniqueness };
