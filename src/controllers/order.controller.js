const pool = require('../lib/db');
const { serializeError } = require('../lib/errorHandler');
const { cuid } = require('../lib/cuid');

const createOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { addressId: providedAddressId, shippingAddress, items, couponCode, paymentMethod, razorpayOrderId, razorpayPaymentId } = req.body;
    let userId = req.user ? req.user.id : null;
    let addressId = providedAddressId;

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
        userId = cuid();
        await conn.query(
          'INSERT INTO users (id, name, email, phone, role) VALUES (?, ?, ?, ?, "CUSTOMER")',
          [userId, guestName, guestEmail, guestPhone]
        );
      }

      addressId = cuid();
      await conn.query(
        'INSERT INTO addresses (id, userId, name, phone, line1, line2, city, state, pincode, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
        [addressId, userId, guestName, guestPhone, shippingAddress.address, shippingAddress.apartment || null, shippingAddress.city, shippingAddress.state, shippingAddress.pincode]
      );
    } else if (!addressId && shippingAddress) {
      // User is logged in but passed a new shipping address
      const guestName = `${shippingAddress.firstName} ${shippingAddress.lastName || ''}`.trim();
      addressId = cuid();
      await conn.query(
        'INSERT INTO addresses (id, userId, name, phone, line1, line2, city, state, pincode, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
        [addressId, userId, guestName, shippingAddress.phone || '', shippingAddress.address, shippingAddress.apartment || null, shippingAddress.city, shippingAddress.state, shippingAddress.pincode]
      );
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
      const [rows] = await conn.query('SELECT * FROM products WHERE id = ?', [item.productId]);
      if (rows.length === 0 || !rows[0].isActive) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: `Product not available: ${item.productId}` });
      }
      const product = rows[0];
      if (product.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: `Insufficient stock for: ${product.name}` });
      }
      subtotal += product.price * item.quantity;
      const images = product.images ? JSON.parse(product.images) : [];
      orderItems.push({ id: cuid(), productId: product.id, quantity: item.quantity, price: product.price, name: product.name, image: images[0] || '' });
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
    const total = subtotal - discount + shippingCharge;
    const orderId = cuid();

    const isPaidOnline = (paymentMethod === 'ONLINE' || paymentMethod === 'RAZORPAY') && Boolean(razorpayPaymentId);
    const orderStatus = isPaidOnline ? 'CONFIRMED' : 'PENDING';
    const paymentStatus = isPaidOnline ? 'PAID' : 'PENDING';

    await conn.query(
      `INSERT INTO orders (id, userId, addressId, paymentMethod, razorpayOrderId, razorpayPaymentId, couponCode, subtotal, discount, shippingCharge, total, status, paymentStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, userId, addressId, paymentMethod || null, razorpayOrderId || null, razorpayPaymentId || null, couponCode || null, subtotal, discount, shippingCharge, total, orderStatus, paymentStatus]
    );

    for (const oi of orderItems) {
      await conn.query(
        'INSERT INTO order_items (id, orderId, productId, quantity, price, name, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [oi.id, orderId, oi.productId, oi.quantity, oi.price, oi.name, oi.image]
      );
    }

    for (const item of items) {
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
    }

    if (couponId) {
      await conn.query('UPDATE coupons SET usedCount = usedCount + 1 WHERE id = ?', [couponId]);
      await conn.query('INSERT INTO coupon_usage (id, userId, couponId, orderId) VALUES (?, ?, ?, ?)', [cuid(), userId, couponId, orderId]);
    }

    await conn.query('UPDATE users SET orderCount = COALESCE(orderCount, 0) + 1 WHERE id = ?', [userId]);
    await conn.query('DELETE FROM cart_items WHERE userId = ?', [userId]);
    await conn.commit();

    const [orderRows] = await pool.query(
      `SELECT o.*, a.name as addr_name, a.phone as addr_phone, a.line1, a.line2, a.city, a.state, a.pincode
       FROM orders o JOIN addresses a ON o.addressId = a.id WHERE o.id = ?`, [orderId]
    );
    const [itemRows] = await pool.query('SELECT * FROM order_items WHERE orderId = ?', [orderId]);
    const order = orderRows[0];
    res.status(201).json({ success: true, data: { ...order, items: itemRows, address: { name: order.addr_name, phone: order.addr_phone, line1: order.line1, line2: order.line2, city: order.city, state: order.state, pincode: order.pincode } } });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
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
      'SELECT * FROM order_items WHERE orderId IN (SELECT id FROM orders WHERE userId = ?)', [req.user.id]
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
    const [itemRows] = await pool.query('SELECT * FROM order_items WHERE orderId = ?', [rows[0].id]);
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
    if (search) { conditions.push('(u.name LIKE ? OR u.email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [orders] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.userId = u.id ${where} ORDER BY o.createdAt DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM orders o JOIN users u ON o.userId = u.id ${where}`, params);
    const orderIds = orders.map(o => o.id);
    let items = [];
    if (orderIds.length > 0) {
      const [itemRows] = await pool.query(`SELECT * FROM order_items WHERE orderId IN (${orderIds.map(() => '?').join(',')})`, orderIds);
      items = itemRows;
    }
    const result = orders.map(o => ({ ...o, items: items.filter(i => i.orderId === o.id) }));
    res.json({ success: true, data: result, pagination: { total: countRows[0].total, page: Number(page), limit: Number(limit), pages: Math.ceil(countRows[0].total / Number(limit)) } });
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

module.exports = { createOrder, getUserOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus };
