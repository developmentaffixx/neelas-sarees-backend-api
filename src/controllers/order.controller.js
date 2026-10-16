const crypto = require('crypto');
const pool = require('../lib/db');
const { serializeError } = require('../lib/errorHandler');
const { cuid } = require('../lib/cuid');
const { autoRefundPayment } = require('../lib/razorpay');

function parseImages(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {}
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

// Ensure sku column exists in order_items
pool.query("ALTER TABLE `order_items` ADD COLUMN `sku` VARCHAR(100) NULL DEFAULT NULL").catch(() => {});

const orderItemsSelect = `
  SELECT oi.*,
         COALESCE(NULLIF(p.sku, ''), NULLIF(c.sku, ''), NULLIF(parent_c.sku, '')) AS sku,
         COALESCE(NULLIF(p.sku, ''), NULLIF(c.sku, ''), NULLIF(parent_c.sku, '')) AS code,
         p.sku AS product_sku,
         c.sku AS category_sku,
         parent_c.sku AS parent_category_sku,
         c.name AS category_name
  FROM order_items oi
  LEFT JOIN products p ON oi.productId = p.id
  LEFT JOIN categories c ON p.categoryId = c.id
  LEFT JOIN categories parent_c ON c.parentId = parent_c.id
`;

const createOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { addressId: providedAddressId, shippingAddress, items, couponCode, paymentMethod, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    let userId = req.user ? req.user.id : null;
    let addressId = providedAddressId;

    if (paymentMethod === 'COD') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Cash on Delivery is no longer accepted. Please pay online via UPI, Card, or Net Banking.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    // Handle Guest Checkout or create address if shippingAddress is provided
    if (!userId) {
      if (!shippingAddress || !shippingAddress.email || !shippingAddress.firstName || !shippingAddress.address || !shippingAddress.pincode) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: 'Complete shipping address and contact email are required for checkout' });
      }

      const guestEmail = shippingAddress.email.trim().toLowerCase();
      const guestName = `${shippingAddress.firstName} ${shippingAddress.lastName || ''}`.trim();
      const guestPhone = shippingAddress.phone || '';

      const [existingUsers] = await conn.query('SELECT id FROM users WHERE email = ?', [guestEmail]);
      if (existingUsers.length > 0) {
        userId = existingUsers[0].id;
      } else {
        userId = cuid('usr_');
        await conn.query(
          'INSERT INTO users (id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, "CUSTOMER")',
          [userId, guestName, guestEmail, '', guestPhone]
        );
      }

      const [existing] = await conn.query(
        'SELECT id FROM addresses WHERE userId = ? AND LOWER(TRIM(line1)) = LOWER(TRIM(?)) AND LOWER(TRIM(city)) = LOWER(TRIM(?)) AND TRIM(pincode) = TRIM(?)',
        [userId, shippingAddress.address, shippingAddress.city, shippingAddress.pincode]
      );
      if (existing.length > 0) {
        addressId = existing[0].id;
      } else {
        addressId = cuid('addr_');
        await conn.query(
          'INSERT INTO addresses (id, userId, name, phone, line1, line2, city, state, pincode, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
          [addressId, userId, guestName, guestPhone, shippingAddress.address, shippingAddress.apartment || null, shippingAddress.city, shippingAddress.state, shippingAddress.pincode]
        );
      }
    } else if (!addressId && shippingAddress) {
      // User is logged in but passed a new shipping address
      const guestName = `${shippingAddress.firstName} ${shippingAddress.lastName || ''}`.trim();
      const [existing] = await conn.query(
        'SELECT id FROM addresses WHERE userId = ? AND LOWER(TRIM(line1)) = LOWER(TRIM(?)) AND LOWER(TRIM(city)) = LOWER(TRIM(?)) AND TRIM(pincode) = TRIM(?)',
        [userId, shippingAddress.address, shippingAddress.city, shippingAddress.pincode]
      );
      if (existing.length > 0) {
        addressId = existing[0].id;
      } else {
        addressId = cuid('addr_');
        await conn.query(
          'INSERT INTO addresses (id, userId, name, phone, line1, line2, city, state, pincode, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
          [addressId, userId, guestName, shippingAddress.phone || '', shippingAddress.address, shippingAddress.apartment || null, shippingAddress.city, shippingAddress.state, shippingAddress.pincode]
        );
      }
    }

    if (!addressId) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Valid delivery address is required' });
    }

    const [addrRows] = await conn.query('SELECT id FROM addresses WHERE id = ? AND userId = ?', [addressId, userId]);
    if (addrRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Invalid address for user' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const [rows] = await conn.query(
        `SELECT p.*, c.sku as category_sku, parent_c.sku as parent_category_sku
         FROM products p
         LEFT JOIN categories c ON p.categoryId = c.id
         LEFT JOIN categories parent_c ON c.parentId = parent_c.id
         WHERE p.id = ? FOR UPDATE`,
        [item.productId]
      );
      if (rows.length === 0 || !rows[0].isActive) {
        await conn.rollback();
        if (razorpayPaymentId) {
          await autoRefundPayment(razorpayPaymentId, `Product not available: ${item.productId}`);
        }
        return res.status(400).json({
          success: false,
          refunded: Boolean(razorpayPaymentId),
          message: `This saree is no longer available. ${razorpayPaymentId ? 'Your payment has been automatically refunded to your original payment method.' : ''}`,
        });
      }
      const product = rows[0];
      let availableStock = product.stock;
      if (item.variantId) {
        const [varRows] = await conn.query('SELECT stock FROM product_color_variants WHERE id = ? FOR UPDATE', [item.variantId]);
        if (varRows.length > 0 && varRows[0].stock !== null && varRows[0].stock !== undefined) {
          availableStock = varRows[0].stock;
        }
      }
      if (availableStock < item.quantity) {
        await conn.rollback();
        let refundInfo = null;
        if (razorpayPaymentId) {
          refundInfo = await autoRefundPayment(razorpayPaymentId, `Out of stock for ${product.name}`);
        }
        return res.status(400).json({
          success: false,
          refunded: Boolean(refundInfo?.success),
          message: `Sorry, another customer just completed the purchase for "${product.name}". ${refundInfo?.success ? 'Your payment has been automatically refunded to your original payment method.' : (razorpayPaymentId ? 'Our team will process your refund shortly.' : '')}`,
        });
      }
      subtotal += product.price * item.quantity;
      const images = parseImages(product.images);
      const itemImage = (images[0] || '').slice(0, 191);
      const itemSku = product.sku || product.category_sku || product.parent_category_sku || null;
      orderItems.push({ id: cuid('oi_'), productId: product.id, quantity: item.quantity, price: product.price, name: product.name, image: itemImage, sku: itemSku });
    }

    let discount = 0;
    let couponId = null;
    if (couponCode) {
      const [cRows] = await conn.query('SELECT * FROM coupons WHERE code = ? AND isActive = 1', [couponCode]);
      if (cRows.length > 0) {
        const coupon = cRows[0];
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
        const meetsMin = subtotal >= coupon.minOrderValue;
        const withinLimit = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
        if (notExpired && meetsMin && withinLimit) {
          discount = coupon.type === 'PERCENTAGE' ? (subtotal * coupon.value) / 100 : coupon.value;
          couponId = coupon.id;
        }
      }
    }

    const shippingCharge = subtotal - discount >= 999 ? 0 : 99;
    const total = Math.max(0, subtotal - discount + shippingCharge);

    // Generate sequential numeric Database Order ID (1, 2, 3...)
    const [maxRow] = await conn.query('SELECT MAX(CAST(id AS UNSIGNED)) as maxId FROM orders WHERE id REGEXP "^[0-9]+$"');
    let nextNum = 1;
    if (maxRow && maxRow[0] && maxRow[0].maxId) {
      nextNum = Number(maxRow[0].maxId) + 1;
    } else {
      const [countRow] = await conn.query('SELECT COUNT(*) as total FROM orders');
      nextNum = (countRow[0]?.total || 0) + 1;
    }
    const orderId = String(nextNum);

    let isPaidOnline = false;
    if (paymentMethod === 'ONLINE' || paymentMethod === 'RAZORPAY') {
      if (razorpayPaymentId && razorpayOrderId && razorpaySignature && process.env.RAZORPAY_KEY_SECRET) {
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');
        if (expectedSignature === razorpaySignature) {
          isPaidOnline = true;
        } else {
          await conn.rollback();
          return res.status(400).json({ success: false, message: 'Payment verification failed: invalid signature' });
        }
      } else if (razorpayPaymentId) {
        isPaidOnline = true;
      }
    }

    const orderStatus = isPaidOnline ? 'CONFIRMED' : 'PENDING';
    const paymentStatus = isPaidOnline ? 'PAID' : 'PENDING';

    await conn.query(
      `INSERT INTO orders (id, userId, addressId, paymentMethod, razorpayOrderId, razorpayPaymentId, couponCode, subtotal, discount, shippingCharge, total, status, paymentStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, userId, addressId, paymentMethod || null, razorpayOrderId || null, razorpayPaymentId || null, couponCode || null, subtotal, discount, shippingCharge, total, orderStatus, paymentStatus]
    );

    for (const oi of orderItems) {
      try {
        await conn.query(
          'INSERT INTO order_items (id, orderId, productId, quantity, price, name, image, sku) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [oi.id, orderId, oi.productId, oi.quantity, oi.price, oi.name, oi.image, oi.sku || null]
        );
      } catch {
        await conn.query(
          'INSERT INTO order_items (id, orderId, productId, quantity, price, name, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [oi.id, orderId, oi.productId, oi.quantity, oi.price, oi.name, oi.image]
        );
      }
    }

    for (const item of items) {
      if (item.variantId) {
        await conn.query('UPDATE product_color_variants SET stock = GREATEST(0, stock - ?) WHERE id = ?', [item.quantity, item.variantId]);
      }
      await conn.query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [item.quantity, item.productId]);
    }

    if (couponId) {
      await conn.query('UPDATE coupons SET usedCount = usedCount + 1 WHERE id = ?', [couponId]);
      await conn.query('INSERT INTO coupon_usage (id, userId, couponId, orderId) VALUES (?, ?, ?, ?)', [cuid('cu_'), userId, couponId, orderId]);
    }

    await conn.query('UPDATE users SET orderCount = COALESCE(orderCount, 0) + 1 WHERE id = ?', [userId]);
    await conn.query('DELETE FROM cart_items WHERE userId = ?', [userId]);
    await conn.commit();

    const [orderRows] = await pool.query(
      `SELECT o.*, a.name as addr_name, a.phone as addr_phone, a.line1, a.line2, a.city, a.state, a.pincode
       FROM orders o JOIN addresses a ON o.addressId = a.id WHERE o.id = ?`, [orderId]
    );
    const [itemRows] = await pool.query(`${orderItemsSelect} WHERE oi.orderId = ?`, [orderId]);
    const order = orderRows[0];
    res.status(201).json({ success: true, data: { ...order, items: itemRows, address: { name: order.addr_name, phone: order.addr_phone, line1: order.line1, line2: order.line2, city: order.city, state: order.state, pincode: order.pincode } } });
  } catch (error) {
    await conn.rollback();
    if (req.body?.razorpayPaymentId) {
      await autoRefundPayment(req.body.razorpayPaymentId, 'System error during order creation');
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create order. If your payment was deducted, an automatic refund has been initiated.',
      error: serializeError(error),
    });
  } finally {
    conn.release();
  }
};

const getUserOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, a.name as addr_name, a.phone as addr_phone, a.line1, a.line2, a.city, a.state, a.pincode
       FROM orders o JOIN addresses a ON o.addressId = a.id WHERE o.userId = ? ORDER BY o.createdAt DESC`, [req.user.id]
    );
    const [allItems] = await pool.query(
      `${orderItemsSelect} WHERE oi.orderId IN (SELECT id FROM orders WHERE userId = ?)`, [req.user.id]
    );
    const result = orders.map(o => ({ ...o, items: allItems.filter(i => i.orderId === o.id) }));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const getOrderById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.*, a.name as addr_name, a.phone as addr_phone, a.line1, a.line2, a.city, a.state, a.pincode
       FROM orders o JOIN addresses a ON o.addressId = a.id WHERE o.id = ? AND o.userId = ?`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    const [itemRows] = await pool.query(`${orderItemsSelect} WHERE oi.orderId = ?`, [rows[0].id]);
    res.json({ success: true, data: { ...rows[0], items: itemRows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    const order = rows[0];
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });

    const [orderItems] = await pool.query('SELECT productId, quantity FROM order_items WHERE orderId = ?', [order.id]);
    for (const item of orderItems) {
      await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.productId]);
    }
    await pool.query('UPDATE users SET orderCount = GREATEST(COALESCE(orderCount, 0) - 1, 0) WHERE id = ?', [req.user.id]);
    if (order.couponCode) {
      await pool.query('UPDATE coupons SET usedCount = GREATEST(usedCount - 1, 0) WHERE code = ?', [order.couponCode]);
      await pool.query('DELETE FROM coupon_usage WHERE orderId = ?', [order.id]);
    }
    await pool.query("UPDATE orders SET status = 'CANCELLED', updatedAt = NOW() WHERE id = ?", [order.id]);
    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { page = '1', limit = '20', status, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [];
    const params = [];
    if (status) { conditions.push('o.status = ?'); params.push(status); }
    if (search) { conditions.push('(u.name LIKE ? OR u.email LIKE ? OR o.id LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [orders] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email,
              a.name as addr_name, a.phone as addr_phone, a.line1, a.line2, a.city, a.state, a.pincode
       FROM orders o
       JOIN users u ON o.userId = u.id
       LEFT JOIN addresses a ON o.addressId = a.id
       ${where}
       ORDER BY o.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM orders o JOIN users u ON o.userId = u.id ${where}`, params);
    const orderIds = orders.map(o => o.id);
    let items = [];
    if (orderIds.length > 0) {
      const [itemRows] = await pool.query(`${orderItemsSelect} WHERE oi.orderId IN (${orderIds.map(() => '?').join(',')})`, orderIds);
      items = itemRows;
    }
    const result = orders.map(o => ({ ...o, items: items.filter(i => i.orderId === o.id) }));
    res.json({ success: true, data: result, pagination: { total: countRows[0].total, page: Number(page), limit: Number(limit), pages: Math.ceil(countRows[0].total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const getAdminOrderById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email,
              a.name as addr_name, a.phone as addr_phone, a.line1, a.line2, a.city, a.state, a.pincode
       FROM orders o
       JOIN users u ON o.userId = u.id
       LEFT JOIN addresses a ON o.addressId = a.id
       WHERE o.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    const [itemRows] = await pool.query(`${orderItemsSelect} WHERE oi.orderId = ?`, [rows[0].id]);
    res.json({ success: true, data: { ...rows[0], items: itemRows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
    if (!status || !validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const fields = ['status = ?'];
    const values = [status];
    if (trackingNumber) { fields.push('trackingNumber = ?'); values.push(trackingNumber); }

    if (status === 'CANCELLED') {
      const [orderRows] = await pool.query('SELECT status FROM orders WHERE id = ?', [req.params.id]);
      if (orderRows[0] && orderRows[0].status !== 'CANCELLED') {
        const [orderItems] = await pool.query('SELECT productId, quantity FROM order_items WHERE orderId = ?', [req.params.id]);
        for (const item of orderItems) {
          await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.productId]);
        }
      }
    }

    await pool.query(`UPDATE orders SET ${fields.join(', ')}, updatedAt = NOW() WHERE id = ?`, [...values, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, cancelOrder, getAllOrders, getAdminOrderById, updateOrderStatus };
