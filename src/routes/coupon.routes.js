const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const { cuid } = require('../lib/cuid');

const router = Router();

router.post('/smart', authenticate, async (req, res) => {
  try {
    const { orderTotal } = req.body;
    const userId = req.user.id;
    const [userRows] = await pool.query('SELECT orderCount FROM users WHERE id = ?', [userId]);
    const orderCount = userRows[0]?.orderCount || 0;
    const [usedRows] = await pool.query('SELECT couponId FROM coupon_usage WHERE userId = ?', [userId]);
    const usedCouponIds = usedRows.map(r => r.couponId);
    const [couponRows] = await pool.query('SELECT * FROM coupons WHERE isActive = 1 ORDER BY priority DESC');
    const eligible = [];
    const almostThere = [];
    let autoApplyCoupon = null;

    for (const coupon of couponRows) {
      if (usedCouponIds.includes(coupon.id)) continue;
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) continue;
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) continue;
      const minOrder = coupon.minOrderValue;
      const trigger = coupon.trigger;
      if (trigger === 'FIRST_ORDER' && orderCount === 0 && coupon.autoApply) { autoApplyCoupon = coupon; continue; }
      if (trigger === 'LOYALTY' && orderCount < coupon.loyaltyOrderCount) continue;
      if (trigger === 'FESTIVE' && coupon.autoApply) { if (orderTotal >= (coupon.thresholdMin || 0)) autoApplyCoupon = autoApplyCoupon || coupon; continue; }
      if (orderTotal >= minOrder) { eligible.push(coupon); }
      else if (minOrder - orderTotal <= 2000) { almostThere.push({ ...coupon, amountNeeded: minOrder - orderTotal }); }
    }

    let autoDiscount = 0;
    if (autoApplyCoupon) autoDiscount = autoApplyCoupon.type === 'PERCENTAGE' ? Math.round(orderTotal * autoApplyCoupon.value / 100) : autoApplyCoupon.value;
    const eligibleWithDiscount = eligible.map(c => ({ ...c, calculatedDiscount: c.type === 'PERCENTAGE' ? Math.round(orderTotal * c.value / 100) : c.value })).sort((a, b) => b.calculatedDiscount - a.calculatedDiscount);

    res.json({ success: true, data: { autoApply: autoApplyCoupon ? { ...autoApplyCoupon, calculatedDiscount: autoDiscount } : null, eligible: eligibleWithDiscount, almostThere, orderCount } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.post('/validate', authenticate, async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM coupons WHERE code = ? AND isActive = 1', [code]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    const coupon = rows[0];
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return res.status(400).json({ success: false, message: 'Coupon has expired' });
    if (orderTotal < coupon.minOrderValue) return res.status(400).json({ success: false, message: `Minimum order value is ₹${coupon.minOrderValue}` });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    const [usedRows] = await pool.query('SELECT id FROM coupon_usage WHERE userId = ? AND couponId = ?', [userId, coupon.id]);
    if (usedRows.length > 0) return res.status(400).json({ success: false, message: 'You have already used this coupon' });
    const discount = coupon.type === 'PERCENTAGE' ? Math.round(orderTotal * coupon.value / 100) : coupon.value;
    res.json({ success: true, data: { coupon, discount } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.get('/', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coupons ORDER BY priority DESC, createdAt DESC');
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const id = cuid();
    const { code, description, displayTitle, type, value, minOrderValue = 0, maxUses, isActive = true, autoApply = false, trigger = 'MANUAL', thresholdMin, thresholdMax, loyaltyOrderCount, priority = 0, expiresAt } = req.body;
    await pool.query(`INSERT INTO coupons (id, code, description, displayTitle, type, value, minOrderValue, maxUses, isActive, autoApply, \`trigger\`, thresholdMin, thresholdMax, loyaltyOrderCount, priority, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, code, description || null, displayTitle || null, type, value, minOrderValue, maxUses || null, isActive ? 1 : 0, autoApply ? 1 : 0, trigger, thresholdMin || null, thresholdMax || null, loyaltyOrderCount || null, priority, expiresAt || null]);
    const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const fields = Object.keys(req.body).map(k => `\`${k}\` = ?`).join(', ');
    await pool.query(`UPDATE coupons SET ${fields} WHERE id = ?`, [...Object.values(req.body), req.params.id]);
    const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

module.exports = router;
