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
      `SELECT ci.*, 
              p.id as prod_id, p.name as prod_name, p.slug as prod_slug, p.price, p.comparePrice, p.images, p.stock as prod_stock, p.isActive,
              pcv.colorName as variantColor, pcv.images as variantImages, pcv.stock as variantStock
       FROM cart_items ci 
       JOIN products p ON ci.productId = p.id 
       LEFT JOIN product_color_variants pcv ON ci.variantId = pcv.id
       WHERE ci.userId = ?`,
      [req.user.id]
    );

    const items = rows.map((r) => {
      const prodImages = safeParseJSON(r.images);
      const varImages = safeParseJSON(r.variantImages);
      const displayImage = (Array.isArray(varImages) && varImages[0]) || (Array.isArray(prodImages) && prodImages[0]) || '';
      const effectiveStock = r.variantId && r.variantStock !== null && r.variantStock !== undefined 
        ? Number(r.variantStock) 
        : Number(r.prod_stock);

      return {
        id: r.id,
        userId: r.userId,
        productId: r.productId,
        variantId: r.variantId || null,
        color: r.variantColor || null,
        quantity: Number(r.quantity),
        createdAt: r.createdAt,
        product: {
          id: r.prod_id,
          name: r.prod_name,
          slug: r.prod_slug,
          price: Number(r.price),
          comparePrice: r.comparePrice ? Number(r.comparePrice) : null,
          images: prodImages,
          image: displayImage,
          stock: effectiveStock,
          isActive: Boolean(r.isActive),
        },
      };
    });

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

// ─── Bulk sync: replace entire server cart in one atomic transaction ──────────
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
      // 1. Deduplicate items by (productId, variantId) to ensure no duplicate key errors
      const dedupedMap = new Map();
      for (const item of items) {
        if (!item || !item.productId || !item.quantity || Number(item.quantity) <= 0) continue;
        const vId = item.variantId ? String(item.variantId) : null;
        const key = `${item.productId}:::${vId || ''}`;
        if (dedupedMap.has(key)) {
          dedupedMap.get(key).quantity += Number(item.quantity);
        } else {
          dedupedMap.set(key, {
            productId: String(item.productId),
            variantId: vId,
            quantity: Number(item.quantity),
          });
        }
      }

      const cleanItems = Array.from(dedupedMap.values());

      if (cleanItems.length > 0) {
        // 2. Fetch products in one batch
        const productIds = [...new Set(cleanItems.map((i) => i.productId))];
        const [products] = await conn.query(
          `SELECT id, stock FROM products WHERE id IN (${productIds.map(() => '?').join(',')}) AND isActive = 1`,
          productIds
        );
        const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

        // 3. Fetch variants in one batch if needed
        const variantIds = cleanItems.map((i) => i.variantId).filter(Boolean);
        let variantMap = {};
        if (variantIds.length > 0) {
          const [variants] = await conn.query(
            `SELECT id, productId, stock FROM product_color_variants WHERE id IN (${variantIds.map(() => '?').join(',')})`,
            variantIds
          );
          variantMap = Object.fromEntries(variants.map((v) => [v.id, v.stock]));
        }

        // 4. Construct insert rows
        const rows = [];
        for (const item of cleanItems) {
          const prod = productMap[item.productId];
          if (!prod) continue; // Inactive or deleted product

          let availableStock = prod.stock;
          if (item.variantId && variantMap[item.variantId] !== undefined) {
            availableStock = variantMap[item.variantId];
          }

          // Ensure positive quantity, capped if stock > 0
          const safeQty = availableStock > 0 ? Math.min(item.quantity, availableStock) : item.quantity;
          if (safeQty > 0) {
            rows.push([
              cuid('cart_'),
              req.user.id,
              item.productId,
              item.variantId || null,
              safeQty,
            ]);
          }
        }

        if (rows.length > 0) {
          await conn.query(
            'INSERT INTO cart_items (id, userId, productId, variantId, quantity) VALUES ?',
            [rows]
          );
        }
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
