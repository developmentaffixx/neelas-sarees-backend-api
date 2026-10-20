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

// Soft-delete column: hides category from all lists while keeping the row for history
pool.query(`ALTER TABLE categories ADD COLUMN deletedAt DATETIME NULL DEFAULT NULL AFTER isActive`)
  .catch(() => {});

// Non-blocking drop of products sku unique indexes so sarees under same category can share common design SKU
pool.query('ALTER TABLE products DROP INDEX products_sku_key').catch(() => {});
pool.query('ALTER TABLE products DROP INDEX sku').catch(() => {});

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
      LEFT JOIN products p ON p.categoryId = c.id AND p.isActive = 1 AND p.deletedAt IS NULL
      WHERE c.isActive = 1 AND c.deletedAt IS NULL
      GROUP BY c.id 
      ORDER BY c.sortOrder ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    try {
      const [rows] = await pool.query('SELECT * FROM categories WHERE isActive = 1 AND deletedAt IS NULL ORDER BY sortOrder ASC');
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
      LEFT JOIN products p ON p.categoryId = c.id AND p.isActive = 1 AND p.deletedAt IS NULL
      WHERE c.deletedAt IS NULL
      GROUP BY c.id 
      ORDER BY 
        COALESCE(CAST(c.parentId AS UNSIGNED), CAST(c.id AS UNSIGNED)) ASC,
        CASE WHEN c.parentId IS NULL THEN 0 ELSE 1 END ASC,
        CAST(c.id AS UNSIGNED) ASC
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

// Sync all categories' SKUs, descriptions & care instructions to linked products
router.post('/sync-all-to-products', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [cats] = await pool.query(
      `SELECT id, name, sku, description, careInstructions, parentId FROM categories 
       WHERE (sku IS NOT NULL AND sku != "") 
          OR (description IS NOT NULL AND description != "") 
          OR (careInstructions IS NOT NULL AND careInstructions != "")`
    );

    let totalUpdated = 0;
    const subCats = cats.filter(c => c.parentId);
    const parentCats = cats.filter(c => !c.parentId);
    const ordered = [...subCats, ...parentCats];

    for (const cat of ordered) {
      const updates = [];
      const params = [];
      if (cat.sku && String(cat.sku).trim()) {
        updates.push('sku = ?');
        params.push(String(cat.sku).trim());
      }
      if (cat.description && String(cat.description).trim()) {
        updates.push('description = ?');
        params.push(String(cat.description).trim());
      }
      if (cat.careInstructions && String(cat.careInstructions).trim()) {
        updates.push('careInstructions = ?');
        params.push(String(cat.careInstructions).trim());
      }

      if (updates.length > 0) {
        const [children] = await pool.query('SELECT id, sku FROM categories WHERE parentId = ?', [cat.id]);
        const childIdsWithoutSku = children.filter(c => !c.sku || String(c.sku).trim() === '').map(c => c.id);
        const targetIds = [cat.id, ...childIdsWithoutSku];

        const [r] = await pool.query(
          `UPDATE products SET ${updates.join(', ')}, updatedAt = NOW() WHERE categoryId IN (?)`,
          [...params, targetIds]
        );
        totalUpdated += r.affectedRows || 0;
      }
    }

    res.json({ success: true, message: `Successfully synced ${totalUpdated} saree(s) across categories.`, totalUpdated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

// Sync a single category to its linked products
router.post('/:id/sync-products', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [cats] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (cats.length === 0) return res.status(404).json({ success: false, message: 'Category not found' });
    const cat = cats[0];

    const [children] = await pool.query('SELECT id, sku FROM categories WHERE parentId = ?', [cat.id]);
    const childIds = children.map(c => c.id);
    const childIdsWithoutSku = children.filter(c => !c.sku || String(c.sku).trim() === '').map(c => c.id);
    const targetIds = req.body.cascadeToAllChildren ? [cat.id, ...childIds] : (childIds.length === 0 ? [cat.id] : [cat.id, ...childIdsWithoutSku]);

    const updates = [];
    const params = [];
    if (cat.sku && String(cat.sku).trim()) {
      updates.push('sku = ?');
      params.push(String(cat.sku).trim());
    }
    if (cat.description && String(cat.description).trim()) {
      updates.push('description = ?');
      params.push(String(cat.description).trim());
    }
    if (cat.careInstructions && String(cat.careInstructions).trim()) {
      updates.push('careInstructions = ?');
      params.push(String(cat.careInstructions).trim());
    }

    if (updates.length === 0) {
      return res.json({ success: true, message: 'No SKU or design details set on this category to sync.', updatedCount: 0 });
    }

    const [r] = await pool.query(
      `UPDATE products SET ${updates.join(', ')}, updatedAt = NOW() WHERE categoryId IN (?)`,
      [...params, targetIds]
    );

    res.json({
      success: true,
      message: `Successfully synced category design details to ${r.affectedRows || 0} saree(s).`,
      updatedCount: r.affectedRows || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
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

    // Find all child sub-categories if this is a parent category
    const [childRows] = await pool.query('SELECT id, sku FROM categories WHERE parentId = ?', [req.params.id]);
    const childIds = childRows.map(r => r.id);
    const allTargetCatIds = [req.params.id, ...childIds];

    // Cascade isActive changes to child sub-categories and all related products
    if (updateObj.isActive !== undefined) {
      const activeVal = updateObj.isActive ? 1 : 0;
      if (childIds.length > 0) {
        await pool.query('UPDATE categories SET isActive = ? WHERE parentId = ?', [activeVal, req.params.id]);
      }
      if (allTargetCatIds.length > 0) {
        await pool.query('UPDATE products SET isActive = ? WHERE categoryId IN (?)', [activeVal, allTargetCatIds]);
      }
    }

    // If cascadeToAllChildren is explicitly requested or child categories don't have their own SKU, update child categories too
    if (req.body.cascadeToAllChildren && childIds.length > 0) {
      const childUpdates = [];
      const childParams = [];
      if (updateObj.sku !== undefined) { childUpdates.push('sku = ?'); childParams.push(updateObj.sku); }
      if (updateObj.description !== undefined) { childUpdates.push('description = ?'); childParams.push(updateObj.description); }
      if (updateObj.careInstructions !== undefined) { childUpdates.push('careInstructions = ?'); childParams.push(updateObj.careInstructions); }
      if (childUpdates.length > 0) {
        await pool.query(`UPDATE categories SET ${childUpdates.join(', ')} WHERE parentId = ?`, [...childParams, req.params.id]);
      }
    }

    // Automatically sync SKU, description, careInstructions to all linked products
    const prodSet = [];
    const prodVals = [];
    if (updateObj.sku !== undefined && updateObj.sku !== null && String(updateObj.sku).trim() !== '') {
      prodSet.push('sku = ?');
      prodVals.push(String(updateObj.sku).trim());
    }
    if (updateObj.description !== undefined && updateObj.description !== null && String(updateObj.description).trim() !== '') {
      prodSet.push('description = ?');
      prodVals.push(String(updateObj.description).trim());
    }
    if (updateObj.careInstructions !== undefined && updateObj.careInstructions !== null && String(updateObj.careInstructions).trim() !== '') {
      prodSet.push('careInstructions = ?');
      prodVals.push(String(updateObj.careInstructions).trim());
    }

    let updatedProductCount = 0;
    if (prodSet.length > 0) {
      const childIdsWithoutSku = childRows.filter(r => !r.sku || String(r.sku).trim() === '').map(r => r.id);
      const productTargetCats = req.body.cascadeToAllChildren
        ? allTargetCatIds
        : (childIds.length === 0 ? [req.params.id] : [req.params.id, ...childIdsWithoutSku]);

      if (productTargetCats.length > 0) {
        const [resUpdate] = await pool.query(
          `UPDATE products SET ${prodSet.join(', ')}, updatedAt = NOW() WHERE categoryId IN (?)`,
          [...prodVals, productTargetCats]
        );
        updatedProductCount = resUpdate.affectedRows || 0;
      }
    }

    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0], updatedProductCount });
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
    if (!ids || !ids.length) return res.status(400).json({ success: false, message: 'No category IDs provided' });
    const activeVal = isActive ? 1 : 0;

    // Find any child sub-categories of these selected IDs
    const [childRows] = await pool.query('SELECT id FROM categories WHERE parentId IN (?)', [ids]);
    const childIds = childRows.map(r => r.id);
    const allCatIds = Array.from(new Set([...ids, ...childIds]));

    // Update categories (parents + any child sub-categories)
    await pool.query('UPDATE categories SET isActive = ? WHERE id IN (?)', [activeVal, allCatIds]);

    // Update all products under these categories/sub-categories
    await pool.query('UPDATE products SET isActive = ? WHERE categoryId IN (?)', [activeVal, allCatIds]);

    res.json({ success: true, message: `${allCatIds.length} categories/sub-categories and their products updated` });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    // Find all child subcategories
    const [childRows] = await pool.query('SELECT id FROM categories WHERE parentId = ?', [id]);
    const childIds = childRows.map(r => r.id);
    const allCatIds = [id, ...childIds];

    // Soft delete parent & all child subcategories (disappear from all lists, kept for history)
    await pool.query('UPDATE categories SET deletedAt = NOW() WHERE id IN (?)', [allCatIds]);

    // Soft delete all products under them
    await pool.query('UPDATE products SET deletedAt = NOW() WHERE categoryId IN (?)', [allCatIds]);

    res.json({ success: true, message: 'Category, sub-categories, and related products deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

module.exports = router;
