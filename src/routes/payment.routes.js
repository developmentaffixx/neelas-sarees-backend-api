const { Router } = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../lib/db');
const { optionalAuthenticate } = require('../middleware/auth.middleware');

const router = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', optionalAuthenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });
    const userTag = req.user ? req.user.id.slice(-6) : 'guest';
    const receipt = `rcpt_${Date.now()}_${userTag}`.slice(0, 40);
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      notes: { userId: req.user ? req.user.id : 'guest' },
    });
    res.json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID } });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to create payment order' }); }
});

router.post('/verify', optionalAuthenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ success: false, message: 'Missing payment details' });
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (expectedSignature !== razorpay_signature) return res.status(400).json({ success: false, message: 'Payment verification failed' });
    if (orderId) {
      if (req.user) {
        await pool.query("UPDATE orders SET paymentStatus = 'PAID', razorpayPaymentId = ?, razorpayOrderId = ?, status = 'CONFIRMED', updatedAt = NOW() WHERE id = ? AND userId = ?", [razorpay_payment_id, razorpay_order_id, orderId, req.user.id]);
      } else {
        await pool.query("UPDATE orders SET paymentStatus = 'PAID', razorpayPaymentId = ?, razorpayOrderId = ?, status = 'CONFIRMED', updatedAt = NOW() WHERE id = ?", [razorpay_payment_id, razorpay_order_id, orderId]);
      }
    }
    res.json({ success: true, message: 'Payment verified successfully', data: { paymentId: razorpay_payment_id, orderId: razorpay_order_id, verified: true } });
  } catch (error) { res.status(500).json({ success: false, message: 'Payment verification error' }); }
});

router.get('/:paymentId', authenticate, async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json({ success: true, data: payment });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch payment details' }); }
});

module.exports = router;
