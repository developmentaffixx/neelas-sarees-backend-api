const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const { serializeError } = require('../lib/errorHandler');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = Router();

router.get('/sales', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const days = Number(req.query.period || 30);
    const [revenueTimeline] = await pool.query(`SELECT DATE(createdAt) as date, SUM(total) as revenue, COUNT(*) as orders FROM orders WHERE paymentStatus = 'PAID' AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY) GROUP BY DATE(createdAt) ORDER BY date ASC`, [days]);
    const [revenueByCategory] = await pool.query(`SELECT c.name as category, c.type, SUM(oi.price * oi.quantity) as revenue, COUNT(DISTINCT o.id) as orders FROM order_items oi JOIN orders o ON oi.orderId = o.id JOIN products p ON oi.productId = p.id JOIN categories c ON p.categoryId = c.id WHERE o.paymentStatus = 'PAID' GROUP BY c.id, c.name, c.type ORDER BY revenue DESC`);
    const [aovRows] = await pool.query(`SELECT AVG(total) as aov, COUNT(*) as totalOrders, SUM(total) as totalRevenue FROM orders WHERE paymentStatus = 'PAID'`);
    const [monthlyComparison] = await pool.query(`SELECT SUM(CASE WHEN MONTH(createdAt) = MONTH(NOW()) AND YEAR(createdAt) = YEAR(NOW()) THEN total ELSE 0 END) as thisMonth, SUM(CASE WHEN MONTH(createdAt) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) AND YEAR(createdAt) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH)) THEN total ELSE 0 END) as lastMonth FROM orders WHERE paymentStatus = 'PAID'`);
    res.json({ success: true, data: { revenueTimeline, revenueByCategory, aov: aovRows[0], monthlyComparison: monthlyComparison[0] } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.get('/products', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [fastMoving] = await pool.query(`SELECT p.id, p.name, p.slug, p.price, p.stock, p.images, SUM(oi.quantity) as totalSold, COUNT(DISTINCT o.id) as orderCount, SUM(oi.price * oi.quantity) as revenue FROM order_items oi JOIN orders o ON oi.orderId = o.id JOIN products p ON oi.productId = p.id WHERE o.paymentStatus = 'PAID' AND o.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY p.id ORDER BY totalSold DESC LIMIT 10`);
    const [lowStock] = await pool.query(`SELECT p.id, p.name, p.slug, p.price, p.stock, p.images, c.name as category FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.isActive = 1 AND p.stock <= 5 ORDER BY p.stock ASC LIMIT 10`);
    const [mostWishlisted] = await pool.query(`SELECT p.id, p.name, p.slug, p.price, p.images, COUNT(w.id) as wishlistCount FROM wishlists w JOIN products p ON w.productId = p.id WHERE p.isActive = 1 GROUP BY p.id ORDER BY wishlistCount DESC LIMIT 10`);
    res.json({ success: true, data: { fastMoving, lowStock, mostWishlisted } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.get('/customers', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [newVsReturning] = await pool.query(`SELECT COUNT(CASE WHEN u.orderCount <= 1 THEN 1 END) as newCustomers, COUNT(CASE WHEN u.orderCount > 1 THEN 1 END) as returningCustomers FROM users u WHERE u.role = 'CUSTOMER'`);
    const [topSpenders] = await pool.query(`SELECT u.id, u.name, u.email, u.orderCount, SUM(o.total) as totalSpent, COUNT(o.id) as ordersMade FROM users u JOIN orders o ON u.id = o.userId WHERE o.paymentStatus = 'PAID' AND u.role = 'CUSTOMER' GROUP BY u.id ORDER BY totalSpent DESC LIMIT 10`);
    const [geographic] = await pool.query(`SELECT a.city, a.state, COUNT(DISTINCT o.id) as orders, SUM(o.total) as revenue FROM orders o JOIN addresses a ON o.addressId = a.id WHERE o.paymentStatus = 'PAID' GROUP BY a.city, a.state ORDER BY orders DESC LIMIT 10`);
    res.json({ success: true, data: { newVsReturning: newVsReturning[0], topSpenders, geographic } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.get('/coupons', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [couponStats] = await pool.query(`SELECT c.id, c.code, c.displayTitle, c.type, c.value, c.trigger, c.usedCount, c.maxUses, COALESCE(SUM(o.discount), 0) as totalDiscountGiven, COALESCE(SUM(o.total), 0) as revenueGenerated, COUNT(o.id) as ordersWithCoupon FROM coupons c LEFT JOIN orders o ON o.couponCode = c.code AND o.paymentStatus = 'PAID' GROUP BY c.id ORDER BY c.usedCount DESC`);
    res.json({ success: true, data: { couponStats } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.get('/operations', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [statusDistribution] = await pool.query(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`);
    const [pendingActions] = await pool.query(`SELECT (SELECT COUNT(*) FROM orders WHERE status = 'PENDING') as pendingOrders, (SELECT COUNT(*) FROM orders WHERE status = 'CONFIRMED') as confirmedOrders, (SELECT COUNT(*) FROM reviews WHERE isApproved = 0) as pendingReviews, (SELECT COUNT(*) FROM products WHERE stock <= 5 AND isActive = 1) as lowStockProducts`);
    res.json({ success: true, data: { statusDistribution, pendingActions: pendingActions[0] } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

module.exports = router;
