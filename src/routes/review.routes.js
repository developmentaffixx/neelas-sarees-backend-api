const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const { serializeError } = require('../lib/errorHandler');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const { cuid } = require('../lib/cuid');

const router = Router();

router.get('/product/:productId', async (req, res) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const [rows] = await pool.query(`SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.userId = u.id WHERE r.productId = ? AND r.isApproved = 1 ORDER BY r.createdAt DESC LIMIT ? OFFSET ?`, [req.params.productId, Number(limit), offset]);
    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM reviews WHERE productId = ? AND isApproved = 1', [req.params.productId]);
    const total = countRows[0].total;
    const [breakdownRows] = await pool.query(`SELECT rating, COUNT(*) as count FROM reviews WHERE productId = ? AND isApproved = 1 GROUP BY rating ORDER BY rating DESC`, [req.params.productId]);
    const reviews = rows.map(r => ({ id: r.id, userId: r.userId, productId: r.productId, rating: r.rating, title: r.title, body: r.body, images: r.images ? JSON.parse(r.images) : null, isApproved: r.isApproved, helpfulCount: r.helpfulCount, notHelpfulCount: r.notHelpfulCount, createdAt: r.createdAt, user: { name: r.user_name } }));
    res.json({ success: true, data: { reviews, breakdown: breakdownRows, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, rating, title, body, images } = req.body;
    const userId = req.user.id;
    const [orderCheck] = await pool.query(`SELECT oi.id FROM order_items oi JOIN orders o ON oi.orderId = o.id WHERE o.userId = ? AND oi.productId = ? AND o.status IN ('DELIVERED', 'CONFIRMED', 'SHIPPED') LIMIT 1`, [userId, productId]);
    if (orderCheck.length === 0) return res.status(403).json({ success: false, message: 'You can only review products you have purchased' });
    const [existingReview] = await pool.query('SELECT id FROM reviews WHERE userId = ? AND productId = ?', [userId, productId]);
    if (existingReview.length > 0) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    const id = cuid();
    await pool.query('INSERT INTO reviews (id, userId, productId, rating, title, body, images, isApproved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, userId, productId, rating, title || null, body, images ? JSON.stringify(images) : null, 0]);
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: rows[0], message: 'Review submitted! It will appear after approval.' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.get('/admin/all', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { page = '1', limit = '20', status, productId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [];
    const params = [];
    if (status === 'pending') conditions.push('r.isApproved = 0');
    if (status === 'approved') conditions.push('r.isApproved = 1');
    if (productId) { conditions.push('r.productId = ?'); params.push(productId); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT r.*, u.name as user_name, u.email as user_email, p.name as product_name, p.slug as product_slug FROM reviews r JOIN users u ON r.userId = u.id JOIN products p ON r.productId = p.id ${where} ORDER BY r.createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM reviews r ${where}`, params);
    res.json({ success: true, data: rows, pagination: { total: countRows[0].total, page: Number(page), limit: Number(limit), pages: Math.ceil(countRows[0].total / Number(limit)) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.patch('/:id/approve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE reviews SET isApproved = 1 WHERE id = ?', [req.params.id]);
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.patch('/:id/reject', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE reviews SET isApproved = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Review rejected' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM review_votes WHERE reviewId = ?', [req.params.id]);
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

module.exports = router;
