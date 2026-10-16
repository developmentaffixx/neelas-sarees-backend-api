const Razorpay = require('razorpay');

let instance = null;

function getRazorpayInstance() {
  const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!key_id || !key_secret || key_id.includes('your_razorpay') || key_secret.includes('your_razorpay')) {
    return null;
  }

  if (!instance) {
    instance = new Razorpay({ key_id, key_secret });
  }
  return instance;
}

/**
 * Automatically refund a Razorpay payment if an order cannot be completed.
 * @param {string} paymentId - The razorpay_payment_id
 * @param {string} reason - The reason for the refund
 * @returns {Promise<{ success: boolean, refundId?: string, error?: string }>}
 */
async function autoRefundPayment(paymentId, reason = 'Out of stock') {
  if (!paymentId) return { success: false, error: 'No payment ID provided' };

  const rzp = getRazorpayInstance();
  if (!rzp) {
    console.error('[AutoRefund] Razorpay instance not configured');
    return { success: false, error: 'Razorpay keys not configured' };
  }

  try {
    const refund = await rzp.payments.refund(paymentId, {
      notes: {
        reason: reason.slice(0, 100),
        source: 'Neelas Sarees System Auto-Refund',
      },
    });
    console.log(`[AutoRefund] Successfully refunded payment ${paymentId}. Refund ID: ${refund.id}`);
    return { success: true, refundId: refund.id };
  } catch (err) {
    console.error(`[AutoRefund] Failed to refund payment ${paymentId}:`, err);
    return { success: false, error: err?.message || 'Refund failed' };
  }
}

module.exports = {
  getRazorpayInstance,
  autoRefundPayment,
};
