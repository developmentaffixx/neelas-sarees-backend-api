const pool = require('../lib/db');
const { cuid } = require('../lib/cuid');
const { serializeError } = require('../lib/errorHandler');

function safeParseJSON(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function parseVariant(row) {
  return {
    id: row.id,
    productId: row.productId,
    colorName: row.colorName,
    colorHex: row.colorHex,
    images: safeParseJSON(row.images),
    stock: row.stock,
    sortOrder: row.sortOrder,
  };
}

function parseProduct(row, variants = []) {
  return {
    id: row.id, name: row.name, slug: row.slug, description: row.description,
    price: row.price, comparePrice: row.comparePrice, sku: row.sku, stock: row.stock,
    images: safeParseJSON(row.images),
    fabric: row.fabric, occasion: row.occasion, color: row.color,
    blouseIncluded: Boolean(row.blouseIncluded), careInstructions: row.careInstructions,
    isFeatured: Boolean(row.isFeatured), isActive: Boolean(row.isActive),
    categoryId: row.categoryId, createdAt: row.createdAt, updatedAt: row.updatedAt,
    category: row.cat_id ? { id: row.cat_id, name: row.cat_name, slug: row.cat_slug, type: row.cat_type } : null,
    colorVariants: variants,
  };
}

// Fetch variants for a list of product IDs in one query
async function fetchVariantsForProducts(productIds) {
  if (!productIds.length) return {};
  const placeholders = productIds.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT * FROM product_color_variants WHERE productId IN (${placeholders}) ORDER BY sortOrder ASC`,
    productIds
  );
  const map = {};
  for (const row of rows) {
    if (!map[row.productId]) map[row.productId] = [];
    map[row.productId].push(parseVariant(row));
  }
  return map;
}

// ─── Public: List products ────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { page = '1', limit = '12', category, fabric, occasion, minPrice, maxPrice,
      sort = 'createdAt', order = 'desc', search, featured, includeInactive } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [];
    const params = [];

    if (includeInactive !== 'true') conditions.push('p.isActive = 1');
    if (category) { conditions.push('c.slug = ?'); params.push(category); }
    if (fabric) {
      const fabrics = fabric.split(',').map(s => s.trim()).filter(Boolean);
      if (fabrics.length > 0) {
        conditions.push('(' + fabrics.map(() => 'p.fabric LIKE ?').join(' OR ') + ')');
        params.push(...fabrics.map(f => `%${f}%`));
      }
    }
    if (occasion) {
      const occasions = occasion.split(',').map(s => s.trim()).filter(Boolean);
      if (occasions.length > 0) {
        conditions.push('(' + occasions.map(() => 'p.occasion LIKE ?').join(' OR ') + ')');
        params.push(...occasions.map(o => `%${o}%`));
      }
    }
    if (req.query.color) {
      const colors = String(req.query.color).split(',').map(s => s.trim()).filter(Boolean);
      if (colors.length > 0) {
        // Match against both product.color and any color variant name
        conditions.push(
          '(' +
          colors.map(() => 'p.color LIKE ?').join(' OR ') +
          ' OR EXISTS (SELECT 1 FROM product_color_variants v WHERE v.productId = p.id AND (' +
          colors.map(() => 'v.colorName LIKE ?').join(' OR ') +
          ')))'
        );
        params.push(...colors.map(c => `%${c}%`), ...colors.map(c => `%${c}%`));
      }
    }
    if (req.query.inStock === 'true') {
      conditions.push('(p.stock > 0 OR EXISTS (SELECT 1 FROM product_color_variants v WHERE v.productId = p.id AND v.stock > 0))');
    }
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

    // Fetch variants for all returned products in one batch query
    const productIds = rows.map(r => r.id);
    const variantsMap = await fetchVariantsForProducts(productIds);

    res.json({
      success: true,
      data: rows.map(r => parseProduct(r, variantsMap[r.id] || [])),
      pagination: { total: countRows[0].total, page: Number(page), limit: Number(limit), pages: Math.ceil(countRows[0].total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// ─── Public: Product by slug ──────────────────────────────────────────────────
const getProductBySlug = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.type as cat_type
       FROM products p LEFT JOIN categories c ON p.categoryId = c.id
       WHERE p.slug = ? AND p.isActive = 1`, [req.params.slug]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });

    const variantsMap = await fetchVariantsForProducts([rows[0].id]);
    const product = parseProduct(rows[0], variantsMap[rows[0].id] || []);

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

// ─── Public: Featured products ────────────────────────────────────────────────
const getFeaturedProducts = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.type as cat_type
       FROM products p LEFT JOIN categories c ON p.categoryId = c.id
       WHERE p.isFeatured = 1 AND p.isActive = 1 ORDER BY p.createdAt DESC LIMIT 8`
    );
    const productIds = rows.map(r => r.id);
    const variantsMap = await fetchVariantsForProducts(productIds);
    res.json({ success: true, data: rows.map(r => parseProduct(r, variantsMap[r.id] || [])) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// ─── Admin: Get product by ID ─────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.type as cat_type
       FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    const variantsMap = await fetchVariantsForProducts([rows[0].id]);
    res.json({ success: true, data: parseProduct(rows[0], variantsMap[rows[0].id] || []) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// ─── Admin: Create product ────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { name, description, price, comparePrice, sku, stock, images,
      fabric, occasion, color, blouseIncluded, careInstructions, isFeatured, isActive,
      categoryId, colorVariants } = req.body;

    if (!name || !description || !price || !sku || !fabric || !occasion || !color || !categoryId) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Auto-generate slug
    const baseSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const [existing] = await conn.query('SELECT id FROM products WHERE slug = ?', [slug]);
      if (existing.length === 0) break;
      slug = `${baseSlug}-${suffix++}`;
    }

    const [existingSku] = await conn.query('SELECT id FROM products WHERE sku = ?', [sku]);
    if (existingSku.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }

    const id = cuid();
    await conn.query(
      `INSERT INTO products (id, name, slug, description, price, comparePrice, sku, stock, images,
        fabric, occasion, color, blouseIncluded, careInstructions, isFeatured, isActive, categoryId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, slug, description, price, comparePrice ?? null, sku, stock ?? 0,
        JSON.stringify(images ?? []), fabric, occasion, color,
        blouseIncluded ? 1 : 0, careInstructions ?? null, isFeatured ? 1 : 0, isActive !== false ? 1 : 0, categoryId]
    );

    // Insert color variants if provided
    const variants = Array.isArray(colorVariants) ? colorVariants : [];
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.colorName) continue;
      const vid = cuid();
      await conn.query(
        `INSERT INTO product_color_variants (id, productId, colorName, colorHex, images, stock, sortOrder)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [vid, id, v.colorName, v.colorHex || '#000000', JSON.stringify(v.images ?? []), v.stock ?? 0, v.sortOrder ?? i]
      );
    }

    await conn.commit();
    conn.release();

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const variantsMap = await fetchVariantsForProducts([id]);
    res.status(201).json({ success: true, data: parseProduct(rows[0], variantsMap[id] || []) });
  } catch (error) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// ─── Admin: Update product ────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const allowedFields = ['name', 'slug', 'description', 'price', 'comparePrice', 'sku', 'stock',
      'images', 'fabric', 'occasion', 'color', 'blouseIncluded', 'careInstructions', 'isFeatured', 'isActive', 'categoryId'];

    const fields = {};
    for (const key of allowedFields) { if (key in req.body) fields[key] = req.body[key]; }

    if (Object.keys(fields).length > 0) {
      if (fields.images) fields.images = JSON.stringify(fields.images);
      if ('blouseIncluded' in fields) fields.blouseIncluded = fields.blouseIncluded ? 1 : 0;
      if ('isFeatured' in fields) fields.isFeatured = fields.isFeatured ? 1 : 0;
      if ('isActive' in fields) fields.isActive = fields.isActive ? 1 : 0;

      const keys = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await conn.query(`UPDATE products SET ${keys}, updatedAt = NOW() WHERE id = ?`, [...Object.values(fields), req.params.id]);
    }

    // Sync color variants if provided
    if ('colorVariants' in req.body) {
      const variants = Array.isArray(req.body.colorVariants) ? req.body.colorVariants : [];

      // Determine which existing variant IDs to keep
      const incomingIds = variants.filter(v => v.id).map(v => v.id);

      // Delete variants not in the incoming list
      if (incomingIds.length > 0) {
        const placeholders = incomingIds.map(() => '?').join(',');
        await conn.query(
          `DELETE FROM product_color_variants WHERE productId = ? AND id NOT IN (${placeholders})`,
          [req.params.id, ...incomingIds]
        );
      } else {
        await conn.query('DELETE FROM product_color_variants WHERE productId = ?', [req.params.id]);
      }

      // Upsert each variant
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v.colorName) continue;
        if (v.id) {
          // Update existing
          await conn.query(
            `UPDATE product_color_variants SET colorName = ?, colorHex = ?, images = ?, stock = ?, sortOrder = ?, updatedAt = NOW()
             WHERE id = ? AND productId = ?`,
            [v.colorName, v.colorHex || '#000000', JSON.stringify(v.images ?? []), v.stock ?? 0, v.sortOrder ?? i, v.id, req.params.id]
          );
        } else {
          // Insert new
          const vid = cuid();
          await conn.query(
            `INSERT INTO product_color_variants (id, productId, colorName, colorHex, images, stock, sortOrder)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [vid, req.params.id, v.colorName, v.colorHex || '#000000', JSON.stringify(v.images ?? []), v.stock ?? 0, v.sortOrder ?? i]
          );
        }
      }
    }

    await conn.commit();
    conn.release();

    const [rows] = await pool.query(
      `SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.type as cat_type
       FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.id = ?`, [req.params.id]
    );
    const variantsMap = await fetchVariantsForProducts([req.params.id]);
    res.json({ success: true, data: parseProduct(rows[0], variantsMap[req.params.id] || []) });
  } catch (error) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// ─── Admin: Delete product (soft) ────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    await pool.query('UPDATE products SET isActive = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// ─── Admin: Bulk update ───────────────────────────────────────────────────────
const bulkUpdateProducts = async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, message: 'No product IDs provided' });
    const placeholders = ids.map(() => '?').join(',');
    const actionMap = {
      activate:   `UPDATE products SET isActive = 1, updatedAt = NOW() WHERE id IN (${placeholders})`,
      deactivate: `UPDATE products SET isActive = 0, updatedAt = NOW() WHERE id IN (${placeholders})`,
      feature:    `UPDATE products SET isFeatured = 1, updatedAt = NOW() WHERE id IN (${placeholders})`,
      unfeature:  `UPDATE products SET isFeatured = 0, updatedAt = NOW() WHERE id IN (${placeholders})`,
      delete:     `UPDATE products SET isActive = 0, updatedAt = NOW() WHERE id IN (${placeholders})`,
    };
    if (!actionMap[action]) return res.status(400).json({ success: false, message: 'Invalid action' });
    await pool.query(actionMap[action], ids);
    res.json({ success: true, message: `${ids.length} products updated` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// ─── Admin: Check uniqueness ──────────────────────────────────────────────────
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

// ─── Admin: Variant CRUD ──────────────────────────────────────────────────────

// GET  /products/:id/variants  — list all variants for a product
const getVariants = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM product_color_variants WHERE productId = ? ORDER BY sortOrder ASC',
      [req.params.id]
    );
    res.json({ success: true, data: rows.map(parseVariant) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// POST /products/:id/variants  — add a single variant
const addVariant = async (req, res) => {
  try {
    const { colorName, colorHex, images, stock, sortOrder } = req.body;
    if (!colorName) return res.status(400).json({ success: false, message: 'colorName is required' });

    // Check product exists
    const [prod] = await pool.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (!prod.length) return res.status(404).json({ success: false, message: 'Product not found' });

    const id = cuid();
    await pool.query(
      `INSERT INTO product_color_variants (id, productId, colorName, colorHex, images, stock, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, req.params.id, colorName, colorHex || '#000000', JSON.stringify(images ?? []), stock ?? 0, sortOrder ?? 0]
    );
    const [rows] = await pool.query('SELECT * FROM product_color_variants WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: parseVariant(rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// PUT /products/:id/variants/:variantId  — update a single variant
const updateVariant = async (req, res) => {
  try {
    const { colorName, colorHex, images, stock, sortOrder } = req.body;
    const allowed = {};
    if (colorName !== undefined) allowed.colorName = colorName;
    if (colorHex !== undefined) allowed.colorHex = colorHex;
    if (images !== undefined) allowed.images = JSON.stringify(images);
    if (stock !== undefined) allowed.stock = stock;
    if (sortOrder !== undefined) allowed.sortOrder = sortOrder;

    if (!Object.keys(allowed).length) return res.status(400).json({ success: false, message: 'No fields to update' });

    const setClause = Object.keys(allowed).map(k => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE product_color_variants SET ${setClause}, updatedAt = NOW() WHERE id = ? AND productId = ?`,
      [...Object.values(allowed), req.params.variantId, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM product_color_variants WHERE id = ?', [req.params.variantId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Variant not found' });
    res.json({ success: true, data: parseVariant(rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// DELETE /products/:id/variants/:variantId
const deleteVariant = async (req, res) => {
  try {
    await pool.query('DELETE FROM product_color_variants WHERE id = ? AND productId = ?', [req.params.variantId, req.params.id]);
    res.json({ success: true, message: 'Variant deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

module.exports = {
  getProducts, getProductBySlug, getFeaturedProducts, getProductById,
  createProduct, updateProduct, deleteProduct, bulkUpdateProducts, checkProductUniqueness,
  getVariants, addVariant, updateVariant, deleteVariant,
};
