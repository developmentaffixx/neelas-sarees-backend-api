const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = Router();

function safeParseJSON(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

router.get('/dashboard', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [
      [totalOrdersRow],
      [revenueRow],
      [totalProductsRow],
      [totalUsersRow],
      recentOrdersRows,
      [abandonedSummaryRow],
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM orders'),
      pool.query("SELECT SUM(total) as revenue FROM orders WHERE paymentStatus = 'PAID' AND status NOT IN ('CANCELLED', 'RETURNED')"),
      pool.query('SELECT COUNT(*) as count FROM products WHERE isActive = 1'),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER'"),
      pool.query(`SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.userId = u.id ORDER BY o.createdAt DESC LIMIT 5`),
      pool.query(`
        SELECT COUNT(DISTINCT ci.userId) as cartCount, COALESCE(SUM(p.price * ci.quantity), 0) as cartValue
        FROM cart_items ci
        JOIN products p ON ci.productId = p.id
      `),
    ]);

    const recentOrders = recentOrdersRows[0];
    const orderIds = recentOrders.map(o => o.id);
    let recentItems = [];
    if (orderIds.length > 0) {
      const [itemRows] = await pool.query(`SELECT * FROM order_items WHERE orderId IN (${orderIds.map(() => '?').join(',')})`, orderIds);
      recentItems = itemRows;
    }

    const ordersWithItems = recentOrders.map(o => ({ ...o, user: { name: o.user_name, email: o.user_email }, items: recentItems.filter(i => i.orderId === o.id) }));

    res.json({
      success: true,
      data: {
        totalOrders: totalOrdersRow[0].count,
        totalRevenue: revenueRow[0].revenue || 0,
        totalProducts: totalProductsRow[0].count,
        totalUsers: totalUsersRow[0].count,
        abandonedCartsCount: abandonedSummaryRow[0].cartCount || 0,
        abandonedCartsValue: abandonedSummaryRow[0].cartValue || 0,
        recentOrders: ordersWithItems,
      },
    });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.get('/abandoned-carts', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.createdAt as item_added_at,
        ci.variantId,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        p.price as product_price,
        p.images as product_images,
        p.stock as product_stock
      FROM cart_items ci
      JOIN users u ON ci.userId = u.id
      JOIN products p ON ci.productId = p.id
      ORDER BY ci.createdAt DESC
    `);

    const userCartsMap = new Map();

    for (const row of rows) {
      if (!userCartsMap.has(row.user_id)) {
        userCartsMap.set(row.user_id, {
          userId: row.user_id,
          customerName: row.user_name,
          customerEmail: row.user_email,
          customerPhone: row.user_phone,
          lastActive: row.item_added_at,
          totalAmount: 0,
          totalItems: 0,
          items: [],
        });
      }

      const userCart = userCartsMap.get(row.user_id);
      const images = safeParseJSON(row.product_images);
      const itemTotal = Number(row.product_price) * Number(row.quantity);

      userCart.totalAmount += itemTotal;
      userCart.totalItems += Number(row.quantity);

      if (new Date(row.item_added_at) > new Date(userCart.lastActive)) {
        userCart.lastActive = row.item_added_at;
      }

      userCart.items.push({
        id: row.cart_item_id,
        productId: row.product_id,
        name: row.product_name,
        slug: row.product_slug,
        price: Number(row.product_price),
        quantity: Number(row.quantity),
        image: Array.isArray(images) && images.length > 0 ? images[0] : '',
        stock: Number(row.product_stock),
        variantId: row.variantId,
      });
    }

    const carts = Array.from(userCartsMap.values()).sort(
      (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );

    res.json({ success: true, data: carts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

router.delete('/abandoned-carts/:userId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE userId = ?', [req.params.userId]);
    res.json({ success: true, message: 'Cart items cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

router.get('/users', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, phone, role, createdAt FROM users ORDER BY createdAt DESC');
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

module.exports = router;
