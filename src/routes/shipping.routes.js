const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const { cuid } = require('../lib/cuid');

const router = Router();

router.get('/partners', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(`SELECT sp.*, (SELECT COUNT(*) FROM orders WHERE shippingPartnerId = sp.id) as totalShipments FROM shipping_partners sp ORDER BY sp.name ASC`);
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.post('/partners', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, code, trackingUrl, contactPhone, contactEmail, isActive } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'name and code are required' });
    const id = cuid();
    await pool.query('INSERT INTO shipping_partners (id, name, code, trackingUrl, contactPhone, contactEmail, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, name, code.toUpperCase(), trackingUrl || null, contactPhone || null, contactEmail || null, isActive !== false ? 1 : 0]);
    const [rows] = await pool.query('SELECT * FROM shipping_partners WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.put('/partners/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, code, trackingUrl, contactPhone, contactEmail, isActive } = req.body;
    await pool.query('UPDATE shipping_partners SET name = ?, code = ?, trackingUrl = ?, contactPhone = ?, contactEmail = ?, isActive = ? WHERE id = ?', [name, code?.toUpperCase(), trackingUrl || null, contactPhone || null, contactEmail || null, isActive ? 1 : 0, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM shipping_partners WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.delete('/partners/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM shipping_partners WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Shipping partner deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.post('/assign', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { orderId, shippingPartnerId, trackingNumber, estimatedDelivery } = req.body;
    if (!orderId || !shippingPartnerId || !trackingNumber) return res.status(400).json({ success: false, message: 'orderId, shippingPartnerId, and trackingNumber are required' });
    await pool.query(`UPDATE orders SET shippingPartnerId = ?, trackingNumber = ?, estimatedDelivery = ?, status = 'SHIPPED', shippedAt = NOW(), updatedAt = NOW() WHERE id = ?`, [shippingPartnerId, trackingNumber, estimatedDelivery || null, orderId]);
    const [rows] = await pool.query(`SELECT o.*, sp.name as shippingPartnerName, sp.trackingUrl as shippingTrackingUrl FROM orders o LEFT JOIN shipping_partners sp ON o.shippingPartnerId = sp.id WHERE o.id = ?`, [orderId]);
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.get('/tracking/:orderId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT o.id, o.status, o.trackingNumber, o.estimatedDelivery, o.shippedAt, o.deliveredAt, sp.name as partnerName, sp.code as partnerCode, sp.trackingUrl FROM orders o LEFT JOIN shipping_partners sp ON o.shippingPartnerId = sp.id WHERE o.id = ?`, [req.params.orderId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    const order = rows[0];
    const trackingLink = order.trackingUrl && order.trackingNumber ? order.trackingUrl.replace('{tracking}', order.trackingNumber) : null;
    res.json({ success: true, data: { ...order, trackingLink } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

module.exports = router;
