const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const { authenticate } = require('../middleware/auth.middleware');
const { cuid } = require('../lib/cuid');

function safeParseJSON(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ci.*, p.id as prod_id, p.name as prod_name, p.slug as prod_slug, p.price, p.comparePrice, p.images, p.stock, p.isActive
       FROM cart_items ci JOIN products p ON ci.productId = p.id WHERE ci.userId = ?`,
      [req.user.id]
    );
    const items = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      productId: r.productId,
      variantId: r.variantId || null,
      quantity: r.quantity,
      createdAt: r.createdAt,
      product: {
        id: r.prod_id,
        name: r.prod_name,
        slug: r.prod_slug,
        price: r.price,
        comparePrice: r.comparePrice,
        images: safeParseJSON(r.images),
        stock: r.stock,
        isActive: Boolean(r.isActive),
      },
    }));
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1, variantId = null } = req.body;
    const userId = req.user.id;
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE userId = ? AND productId = ? AND (variantId <=> ?)',
      [userId, productId, variantId]
    );
    if (existing.length > 0) {
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE userId = ? AND productId = ? AND (variantId <=> ?)',
        [quantity, userId, productId, variantId]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (id, userId, productId, variantId, quantity) VALUES (?, ?, ?, ?, ?)',
        [cuid('cart_'), userId, productId, variantId, quantity]
      );
    }
    const [rows] = await pool.query(
      `SELECT ci.*, p.id as prod_id, p.name as prod_name, p.price, p.images, p.stock
       FROM cart_items ci JOIN products p ON ci.productId = p.id WHERE ci.userId = ? AND ci.productId = ? AND (ci.variantId <=> ?)`,
      [userId, productId, variantId]
    );
    const r = rows[0];
    res.json({
      success: true,
      data: {
        ...r,
        product: {
          id: r.prod_id,
          name: r.prod_name,
          price: r.price,
          images: safeParseJSON(r.images),
          stock: r.stock,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

router.patch('/:productId', authenticate, async (req, res) => {
  try {
    const { quantity, variantId = null } = req.body;
    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE userId = ? AND productId = ? AND (variantId <=> ?)',
      [quantity, req.user.id, req.params.productId, variantId]
    );
    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

router.delete('/:productId', authenticate, async (req, res) => {
  try {
    const { variantId = null } = req.body;
    await pool.query(
      'DELETE FROM cart_items WHERE userId = ? AND productId = ? AND (variantId <=> ?)',
      [req.user.id, req.params.productId, variantId]
    );
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

router.delete('/', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE userId = ?', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

// ─── Bulk sync: replace entire server cart in one request (#2/#10) ────────────
// Body: { items: [{ productId, variantId?, quantity }] }
router.post('/sync', authenticate, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'items must be an array' });
    }

    await conn.beginTransaction();
    await conn.query('DELETE FROM cart_items WHERE userId = ?', [req.user.id]);

    if (items.length > 0) {
      // Validate products exist and are active in one query
      const productIds = [...new Set(items.map((i) => i.productId))];
      const [products] = await conn.query(
        `SELECT id, stock FROM products WHERE id IN (${productIds.map(() => '?').join(',')}) AND isActive = 1`,
        productIds
      );
      const stockMap = Object.fromEntries(products.map((p) => [p.id, p.stock]));

      const rows = items
        .filter((i) => stockMap[i.productId] !== undefined && i.quantity > 0)
        .map((i) => [
          cuid('cart_'),
          req.user.id,
          i.productId,
          i.variantId || null,
          Math.min(i.quantity, stockMap[i.productId]),
        ]);

      if (rows.length > 0) {
        await conn.query(
          'INSERT INTO cart_items (id, userId, productId, variantId, quantity) VALUES ?',
          [rows]
        );
      }
    }

    await conn.commit();
    res.json({ success: true, message: 'Cart synced' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  } finally {
    conn.release();
  }
});

module.exports = router;
