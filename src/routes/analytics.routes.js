const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = Router();

router.get('/sales', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const days = Number(req.query.period || 30);
    const [revenueTimeline] = await pool.query(
      `SELECT DATE(createdAt) as date, SUM(total) as revenue, COUNT(*) as orders FROM orders WHERE paymentStatus = 'PAID' AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY) GROUP BY DATE(createdAt) ORDER BY date ASC`,
      [days]
    );
    const [revenueByCategory] = await pool.query(
      `SELECT c.name as category, c.type, SUM(oi.price * oi.quantity) as revenue, COUNT(DISTINCT o.id) as orders FROM order_items oi JOIN orders o ON oi.orderId = o.id JOIN products p ON oi.productId = p.id JOIN categories c ON p.categoryId = c.id WHERE o.paymentStatus = 'PAID' GROUP BY c.id, c.name, c.type ORDER BY revenue DESC`
    );
    const [aovRows] = await pool.query(
      `SELECT AVG(total) as aov, COUNT(*) as totalOrders, SUM(total) as totalRevenue FROM orders WHERE paymentStatus = 'PAID'`
    );
    const [monthlyComparison] = await pool.query(
      `SELECT SUM(CASE WHEN MONTH(createdAt) = MONTH(NOW()) AND YEAR(createdAt) = YEAR(NOW()) THEN total ELSE 0 END) as thisMonth, SUM(CASE WHEN MONTH(createdAt) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) AND YEAR(createdAt) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH)) THEN total ELSE 0 END) as lastMonth FROM orders WHERE paymentStatus = 'PAID'`
    );
    res.json({
      success: true,
      data: {
        revenueTimeline: revenueTimeline || [],
        revenueByCategory: revenueByCategory || [],
        aov: aovRows[0] || { aov: 0, totalOrders: 0, totalRevenue: 0 },
        monthlyComparison: monthlyComparison[0] || { thisMonth: 0, lastMonth: 0 },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

router.get('/products', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [fastMoving] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.price, p.stock, p.images, SUM(oi.quantity) as totalSold, COUNT(DISTINCT o.id) as orderCount, SUM(oi.price * oi.quantity) as revenue FROM order_items oi JOIN orders o ON oi.orderId = o.id JOIN products p ON oi.productId = p.id WHERE o.paymentStatus = 'PAID' AND o.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY p.id ORDER BY totalSold DESC LIMIT 10`
    );

    let slowMoving = [];
    try {
      const [sm] = await pool.query(
        `SELECT p.id, p.name, p.slug, p.price, p.stock, p.images, p.createdAt FROM products p WHERE p.isActive = 1 AND p.id NOT IN (SELECT DISTINCT oi.productId FROM order_items oi JOIN orders o ON oi.orderId = o.id WHERE o.paymentStatus = 'PAID' AND o.createdAt >= DATE_SUB(NOW(), INTERVAL 60 DAY)) LIMIT 10`
      );
      slowMoving = sm || [];
    } catch {
      slowMoving = [];
    }

    const [lowStock] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.price, p.stock, p.images, c.name as category FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.isActive = 1 AND p.stock <= 5 ORDER BY p.stock ASC LIMIT 10`
    );

    const [mostWishlisted] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.price, p.images, COUNT(w.id) as wishlistCount FROM wishlists w JOIN products p ON w.productId = p.id WHERE p.isActive = 1 GROUP BY p.id ORDER BY wishlistCount DESC LIMIT 10`
    );

    let cartAbandonment = [];
    try {
      const [ca] = await pool.query(
        `SELECT p.id, p.name, p.slug, p.price, p.images, COUNT(ci.id) as cartCount FROM cart_items ci JOIN products p ON ci.productId = p.id GROUP BY p.id ORDER BY cartCount DESC LIMIT 10`
      );
      cartAbandonment = ca || [];
    } catch {
      cartAbandonment = [];
    }

    res.json({
      success: true,
      data: {
        fastMoving: fastMoving || [],
        slowMoving: slowMoving || [],
        lowStock: lowStock || [],
        mostWishlisted: mostWishlisted || [],
        cartAbandonment: cartAbandonment || [],
        bestByCategory: [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

router.get('/customers', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [newVsReturning] = await pool.query(
      `SELECT COUNT(CASE WHEN u.orderCount <= 1 THEN 1 END) as newCustomers, COUNT(CASE WHEN u.orderCount > 1 THEN 1 END) as returningCustomers FROM users u WHERE u.role = 'CUSTOMER'`
    );
    const [topSpenders] = await pool.query(
      `SELECT u.id, u.name, u.email, u.orderCount, SUM(o.total) as totalSpent, COUNT(o.id) as ordersMade FROM users u JOIN orders o ON u.id = o.userId WHERE o.paymentStatus = 'PAID' AND u.role = 'CUSTOMER' GROUP BY u.id ORDER BY totalSpent DESC LIMIT 10`
    );
    const [geographic] = await pool.query(
      `SELECT a.city, a.state, COUNT(DISTINCT o.id) as orders, SUM(o.total) as revenue FROM orders o JOIN addresses a ON o.addressId = a.id WHERE o.paymentStatus = 'PAID' GROUP BY a.city, a.state ORDER BY orders DESC LIMIT 10`
    );

    let clv = { avgCLV: 0, maxCLV: 0 };
    try {
      const [clvRows] = await pool.query(
        `SELECT AVG(customerTotal) as avgCLV, MAX(customerTotal) as maxCLV FROM (SELECT SUM(total) as customerTotal FROM orders WHERE paymentStatus = 'PAID' GROUP BY userId) t`
      );
      if (clvRows && clvRows[0]) {
        clv = { avgCLV: Number(clvRows[0].avgCLV || 0), maxCLV: Number(clvRows[0].maxCLV || 0) };
      }
    } catch {
      clv = { avgCLV: 0, maxCLV: 0 };
    }

    res.json({
      success: true,
      data: {
        newVsReturning: newVsReturning[0] || { newCustomers: 0, returningCustomers: 0 },
        topSpenders: topSpenders || [],
        geographic: geographic || [],
        clv,
        registrations: [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

router.get('/coupons', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [couponStats] = await pool.query(
      `SELECT c.id, c.code, c.displayTitle, c.type, c.value, c.trigger, c.usedCount, c.maxUses, COALESCE(SUM(o.discount), 0) as totalDiscountGiven, COALESCE(SUM(o.total), 0) as revenueGenerated, COUNT(o.id) as ordersWithCoupon FROM coupons c LEFT JOIN orders o ON o.couponCode = c.code AND o.paymentStatus = 'PAID' GROUP BY c.id ORDER BY c.usedCount DESC`
    );

    let discountImpact = {
      avgDiscountPercent: 0,
      ordersWithDiscount: 0,
      ordersWithoutDiscount: 0,
      avgOrderWithDiscount: 0,
      avgOrderWithoutDiscount: 0,
    };
    try {
      const [impactRows] = await pool.query(
        `SELECT 
          AVG(CASE WHEN discount > 0 THEN (discount / (total + discount)) * 100 END) as avgDiscountPercent,
          COUNT(CASE WHEN discount > 0 THEN 1 END) as ordersWithDiscount,
          COUNT(CASE WHEN discount = 0 OR discount IS NULL THEN 1 END) as ordersWithoutDiscount,
          AVG(CASE WHEN discount > 0 THEN total END) as avgOrderWithDiscount,
          AVG(CASE WHEN discount = 0 OR discount IS NULL THEN total END) as avgOrderWithoutDiscount
        FROM orders WHERE paymentStatus = 'PAID'`
      );
      if (impactRows && impactRows[0]) {
        discountImpact = {
          avgDiscountPercent: Number(impactRows[0].avgDiscountPercent || 0),
          ordersWithDiscount: Number(impactRows[0].ordersWithDiscount || 0),
          ordersWithoutDiscount: Number(impactRows[0].ordersWithoutDiscount || 0),
          avgOrderWithDiscount: Number(impactRows[0].avgOrderWithDiscount || 0),
          avgOrderWithoutDiscount: Number(impactRows[0].avgOrderWithoutDiscount || 0),
        };
      }
    } catch {
      // keep fallback
    }

    res.json({
      success: true,
      data: {
        couponStats: couponStats || [],
        discountImpact,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

router.get('/operations', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [statusDistribution] = await pool.query(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`);
    const [pendingActions] = await pool.query(
      `SELECT (SELECT COUNT(*) FROM orders WHERE status = 'PENDING') as pendingOrders, (SELECT COUNT(*) FROM orders WHERE status = 'CONFIRMED') as confirmedOrders, (SELECT COUNT(*) FROM reviews WHERE isApproved = 0) as pendingReviews, (SELECT COUNT(*) FROM products WHERE stock <= 5 AND isActive = 1) as lowStockProducts`
    );

    let fulfillmentSpeed = { avgDays: 0 };
    try {
      const [speedRows] = await pool.query(
        `SELECT AVG(TIMESTAMPDIFF(HOUR, createdAt, updatedAt) / 24) as avgDays FROM orders WHERE status IN ('SHIPPED', 'DELIVERED')`
      );
      if (speedRows && speedRows[0]) fulfillmentSpeed = { avgDays: Number(speedRows[0].avgDays || 0) };
    } catch {
      // keep fallback
    }

    let returnRate = { totalOrders: 0, cancelled: 0, returned: 0, cancelReturnRate: 0 };
    try {
      const [rateRows] = await pool.query(
        `SELECT 
          COUNT(*) as totalOrders,
          COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled,
          COUNT(CASE WHEN status = 'RETURNED' THEN 1 END) as returned
        FROM orders`
      );
      if (rateRows && rateRows[0]) {
        const total = Number(rateRows[0].totalOrders || 0);
        const canc = Number(rateRows[0].cancelled || 0);
        const ret = Number(rateRows[0].returned || 0);
        returnRate = {
          totalOrders: total,
          cancelled: canc,
          returned: ret,
          cancelReturnRate: total > 0 ? Number(((canc + ret) / total * 100).toFixed(1)) : 0,
        };
      }
    } catch {
      // keep fallback
    }

    let paymentFailure = { totalAttempts: 0, failed: 0, failureRate: 0 };
    try {
      const [failRows] = await pool.query(
        `SELECT 
          COUNT(*) as totalAttempts,
          COUNT(CASE WHEN paymentStatus = 'FAILED' THEN 1 END) as failed
        FROM orders`
      );
      if (failRows && failRows[0]) {
        const total = Number(failRows[0].totalAttempts || 0);
        const failed = Number(failRows[0].failed || 0);
        paymentFailure = {
          totalAttempts: total,
          failed,
          failureRate: total > 0 ? Number(((failed / total) * 100).toFixed(1)) : 0,
        };
      }
    } catch {
      // keep fallback
    }

    res.json({
      success: true,
      data: {
        statusDistribution: statusDistribution || [],
        pendingActions: pendingActions[0] || {
          pendingOrders: 0,
          confirmedOrders: 0,
          pendingReviews: 0,
          lowStockProducts: 0,
        },
        fulfillmentSpeed,
        returnRate,
        paymentFailure,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
});

module.exports = router;
