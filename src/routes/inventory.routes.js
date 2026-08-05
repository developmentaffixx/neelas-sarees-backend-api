const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
function safeParseJSON(value, fallback) { if (fallback === undefined) fallback = []; if (!value) return fallback; if (Array.isArray(value)) return value; try { return JSON.parse(value); } catch (e) { return fallback; } }
const pool = require('../lib/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const { cuid } = require('../lib/cuid');
function safeParseJSON(value, fallback) { if (fallback === undefined) fallback = []; if (!value) return fallback; if (Array.isArray(value)) return value; try { return JSON.parse(value); } catch (e) { return fallback; } }

const router = Router();

router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { page = '1', limit = '20', filter, search, category } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = ['p.isActive = 1'];
    const params = [];
    if (filter === 'low') conditions.push('p.stock > 0 AND p.stock <= 5');
    if (filter === 'out') conditions.push('p.stock = 0');
    if (filter === 'healthy') conditions.push('p.stock > 5');
    if (search) { conditions.push('(p.name LIKE ? OR p.sku LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (category) { conditions.push('c.slug = ?'); params.push(category); }
    const where = conditions.join(' AND ');
    const [rows] = await pool.query(`SELECT p.id, p.name, p.slug, p.sku, p.price, p.stock, p.images, c.name as categoryName, c.slug as categorySlug FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE ${where} ORDER BY p.stock ASC, p.name ASC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE ${where}`, params);
    const [summary] = await pool.query(`SELECT COUNT(*) as totalProducts, SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as outOfStock, SUM(CASE WHEN stock > 0 AND stock <= 5 THEN 1 ELSE 0 END) as lowStock, SUM(CASE WHEN stock > 5 THEN 1 ELSE 0 END) as healthy, SUM(stock) as totalUnits FROM products WHERE isActive = 1`);
    const products = rows.map(r => ({ ...r, images: r.images ? safeParseJSON(r.images) : [] }));
    res.json({ success: true, data: products, summary: summary[0], pagination: { total: countRows[0].total, page: Number(page), limit: Number(limit), pages: Math.ceil(countRows[0].total / Number(limit)) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.post('/adjust', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { productId, type, quantity, reason } = req.body;
    if (!productId || !type || quantity === undefined) return res.status(400).json({ success: false, message: 'productId, type, and quantity are required' });
    const [productRows] = await pool.query('SELECT id, stock FROM products WHERE id = ?', [productId]);
    if (productRows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    const currentStock = productRows[0].stock;
    let newStock;
    if (['ADD', 'RETURN'].includes(type)) newStock = currentStock + Math.abs(quantity);
    else if (['REMOVE', 'DAMAGE'].includes(type)) newStock = Math.max(0, currentStock - Math.abs(quantity));
    else newStock = Math.max(0, quantity);
    await pool.query('UPDATE products SET stock = ?, updatedAt = NOW() WHERE id = ?', [newStock, productId]);
    await pool.query(`INSERT INTO stock_adjustments (id, productId, type, quantity, previousStock, newStock, reason, adjustedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [cuid(), productId, type, Math.abs(quantity), currentStock, newStock, reason || null, req.user.id]);
    res.json({ success: true, data: { productId, previousStock: currentStock, newStock, type, quantity: Math.abs(quantity) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.get('/history', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { page = '1', limit = '30', productId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [];
    const params = [];
    if (productId) { conditions.push('sa.productId = ?'); params.push(productId); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT sa.*, p.name as productName, p.sku as productSku, u.name as adjustedByName FROM stock_adjustments sa JOIN products p ON sa.productId = p.id JOIN users u ON sa.adjustedBy = u.id ${where} ORDER BY sa.createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM stock_adjustments sa ${where}`, params);
    res.json({ success: true, data: rows, pagination: { total: countRows[0].total, page: Number(page), limit: Number(limit), pages: Math.ceil(countRows[0].total / Number(limit)) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

module.exports = router;
