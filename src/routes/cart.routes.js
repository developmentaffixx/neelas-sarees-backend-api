const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
function safeParseJSON(value, fallback) { if (fallback === undefined) fallback = []; if (!value) return fallback; if (Array.isArray(value)) return value; try { return JSON.parse(value); } catch (e) { return fallback; } }
const pool = require('../lib/db');
const { authenticate } = require('../middleware/auth.middleware');
const { cuid } = require('../lib/cuid');
function safeParseJSON(value, fallback) { if (fallback === undefined) fallback = []; if (!value) return fallback; if (Array.isArray(value)) return value; try { return JSON.parse(value); } catch (e) { return fallback; } }

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ci.*, p.id as prod_id, p.name as prod_name, p.slug as prod_slug, p.price, p.comparePrice, p.images, p.stock, p.isActive
       FROM cart_items ci JOIN products p ON ci.productId = p.id WHERE ci.userId = ?`, [req.user.id]
    );
    const items = rows.map(r => ({ id: r.id, userId: r.userId, productId: r.productId, quantity: r.quantity, createdAt: r.createdAt, product: { id: r.prod_id, name: r.prod_name, slug: r.prod_slug, price: r.price, comparePrice: r.comparePrice, images: r.images ? safeParseJSON(r.images) : [], stock: r.stock, isActive: Boolean(r.isActive) } }));
    res.json({ success: true, data: items });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;
    const [existing] = await pool.query('SELECT id, quantity FROM cart_items WHERE userId = ? AND productId = ?', [userId, productId]);
    if (existing.length > 0) {
      await pool.query('UPDATE cart_items SET quantity = quantity + ? WHERE userId = ? AND productId = ?', [quantity, userId, productId]);
    } else {
      await pool.query('INSERT INTO cart_items (id, userId, productId, quantity) VALUES (?, ?, ?, ?)', [cuid(), userId, productId, quantity]);
    }
    const [rows] = await pool.query(`SELECT ci.*, p.id as prod_id, p.name as prod_name, p.price, p.images, p.stock FROM cart_items ci JOIN products p ON ci.productId = p.id WHERE ci.userId = ? AND ci.productId = ?`, [userId, productId]);
    const r = rows[0];
    res.json({ success: true, data: { ...r, product: { id: r.prod_id, name: r.prod_name, price: r.price, images: r.images ? safeParseJSON(r.images) : [], stock: r.stock } } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.patch('/:productId', authenticate, async (req, res) => {
  try {
    await pool.query('UPDATE cart_items SET quantity = ? WHERE userId = ? AND productId = ?', [req.body.quantity, req.user.id, req.params.productId]);
    res.json({ success: true, message: 'Cart updated' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.delete('/:productId', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE userId = ? AND productId = ?', [req.user.id, req.params.productId]);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.delete('/', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE userId = ?', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

module.exports = router;
