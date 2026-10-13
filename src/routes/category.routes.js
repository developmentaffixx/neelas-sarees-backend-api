const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const { cuid } = require('../lib/cuid');
const { getNextNumericId } = require('../lib/nextId');

const router = Router();

// Auto-migrate parentId column if not exists
pool.query(`ALTER TABLE categories ADD COLUMN parentId VARCHAR(36) NULL DEFAULT NULL AFTER id`)
  .catch(() => {});

// Auto-migrate sku and careInstructions for design templates
pool.query(`ALTER TABLE categories ADD COLUMN sku VARCHAR(100) NULL DEFAULT NULL AFTER name`)
  .catch(() => {});
pool.query(`ALTER TABLE categories ADD COLUMN careInstructions TEXT NULL DEFAULT NULL AFTER description`)
  .catch(() => {});

// Make type column nullable and optional
pool.query(`ALTER TABLE categories MODIFY COLUMN type VARCHAR(50) NULL DEFAULT NULL`)
  .catch(() => {});

// Get all distinct category types (for dynamic dropdown)
router.get('/types', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT type FROM categories WHERE type IS NOT NULL AND type != "" ORDER BY type ASC');
    const types = rows.map(r => r.type);
    res.json({ success: true, data: types });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, p_cat.name as parentName, p_cat.slug as parentSlug, COUNT(p.id) as productCount 
      FROM categories c 
      LEFT JOIN categories p_cat ON c.parentId = p_cat.id
      LEFT JOIN products p ON p.categoryId = c.id AND p.isActive = 1 
      WHERE c.isActive = 1 
      GROUP BY c.id 
      ORDER BY c.sortOrder ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    try {
      const [rows] = await pool.query('SELECT * FROM categories WHERE isActive = 1 ORDER BY sortOrder ASC');
      res.json({ success: true, data: rows });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
    }
  }
});

router.get('/admin/all', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, p_cat.name as parentName, COUNT(p.id) as productCount 
      FROM categories c 
      LEFT JOIN categories p_cat ON c.parentId = p_cat.id
      LEFT JOIN products p ON p.categoryId = c.id AND p.isActive = 1 
      GROUP BY c.id 
      ORDER BY c.type ASC, c.sortOrder ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const id = await getNextNumericId('categories');
    const { name, sku, type, image, description, careInstructions, isActive = true, parentId = null } = req.body;
    const cleanType = type && String(type).trim() !== '' ? String(type).trim() : null;
    const cleanSku = sku && String(sku).trim() !== '' ? String(sku).trim() : null;
    const cleanCare = careInstructions && String(careInstructions).trim() !== '' ? String(careInstructions).trim() : null;
    const cleanDesc = description && String(description).trim() !== '' ? String(description).trim() : null;

    // Auto-generate slug, append suffix on conflict
    const baseSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const [existing] = await pool.query('SELECT id FROM categories WHERE slug = ?', [slug]);
      if (existing.length === 0) break;
      slug = `${baseSlug}-${suffix++}`;
    }

    try {
      await pool.query(
        'INSERT INTO categories (id, parentId, name, sku, slug, type, image, description, careInstructions, isActive, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, parentId || null, name, cleanSku, slug, cleanType, image || null, cleanDesc, cleanCare, isActive ? 1 : 0, 0]
      );
    } catch (err) {
      // Fallback in case columns are still being added
      await pool.query(
        'INSERT INTO categories (id, name, slug, type, image, description, isActive, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name, slug, cleanType, image || null, cleanDesc, isActive ? 1 : 0, 0]
      );
    }

    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const allowed = ['name', 'sku', 'parentId', 'type', 'image', 'description', 'careInstructions', 'isActive', 'sortOrder'];
    const updateObj = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (['parentId', 'type', 'sku', 'careInstructions', 'description'].includes(key) && (req.body[key] === '' || req.body[key] === null)) {
          updateObj[key] = null;
        } else {
          updateObj[key] = req.body[key];
        }
      }
    }
    const keys = Object.keys(updateObj);
    if (keys.length > 0) {
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE categories SET ${setClause} WHERE id = ?`, [...Object.values(updateObj), req.params.id]);
    }
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.patch('/reorder', authenticate, authorizeAdmin, async (req, res) => {
  try {
    for (const item of req.body.items) {
      await pool.query('UPDATE categories SET sortOrder = ? WHERE id = ?', [item.sortOrder, item.id]);
    }
    res.json({ success: true, message: 'Order updated' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.patch('/bulk-status', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { ids, isActive } = req.body;
    await pool.query(`UPDATE categories SET isActive = ? WHERE id IN (?)`, [isActive ? 1 : 0, ids]);
    res.json({ success: true, message: `${ids.length} categories updated` });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE categories SET isActive = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

module.exports = router;
