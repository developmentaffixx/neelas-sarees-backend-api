const { Router } = require('express');
const pool = require('../lib/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = Router();

router.get('/dashboard', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [[totalOrdersRow], [revenueRow], [totalProductsRow], [totalUsersRow], recentOrdersRows] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM orders'),
      pool.query("SELECT SUM(total) as revenue FROM orders WHERE paymentStatus = 'PAID'"),
      pool.query('SELECT COUNT(*) as count FROM products WHERE isActive = 1'),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER'"),
      pool.query(`SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.userId = u.id ORDER BY o.createdAt DESC LIMIT 5`),
    ]);

    const recentOrders = recentOrdersRows[0];
    const orderIds = recentOrders.map(o => o.id);
    let recentItems = [];
    if (orderIds.length > 0) {
      const [itemRows] = await pool.query(`SELECT * FROM order_items WHERE orderId IN (${orderIds.map(() => '?').join(',')})`, orderIds);
      recentItems = itemRows;
    }

    const ordersWithItems = recentOrders.map(o => ({ ...o, user: { name: o.user_name, email: o.user_email }, items: recentItems.filter(i => i.orderId === o.id) }));

    res.json({ success: true, data: { totalOrders: totalOrdersRow[0].count, totalRevenue: revenueRow[0].revenue || 0, totalProducts: totalProductsRow[0].count, totalUsers: totalUsersRow[0].count, recentOrders: ordersWithItems } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error }); }
});

router.get('/users', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, phone, role, createdAt FROM users ORDER BY createdAt DESC');
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error }); }
});

module.exports = router;
