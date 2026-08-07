const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const { cuid } = require('../lib/cuid');

const router = Router();

// ── List customers ──────────────────────────────────────────────────────────
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { page = '1', limit = '20', search, sort = 'createdAt', order = 'desc', group } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = ["u.role = 'CUSTOMER'"];
    const params = [];
    if (search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (group) {
      conditions.push('EXISTS (SELECT 1 FROM customer_group_members cgm WHERE cgm.userId = u.id AND cgm.groupId = ?)');
      params.push(group);
    }
    const allowedSort = { createdAt: 'u.createdAt', name: 'u.name', orderCount: 'u.orderCount', totalSpent: 'totalSpent' };
    const sortCol = allowedSort[sort] || 'u.createdAt';
    const sortDir = order === 'asc' ? 'ASC' : 'DESC';
    const where = conditions.join(' AND ');
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.orderCount, u.createdAt,
              COALESCE(SUM(o.total), 0) as totalSpent,
              COUNT(DISTINCT o.id) as completedOrders,
              MAX(o.createdAt) as lastOrderDate
       FROM users u
       LEFT JOIN orders o ON u.id = o.userId AND o.paymentStatus = 'PAID'
       WHERE ${where}
       GROUP BY u.id
       ORDER BY ${sortCol} ${sortDir}
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(DISTINCT u.id) as total FROM users u WHERE ${where}`,
      params
    );
    res.json({
      success: true, data: rows,
      pagination: { total: countRows[0].total, page: Number(page), limit: Number(limit), pages: Math.ceil(countRows[0].total / Number(limit)) }
    });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

// ── List all groups ─────────────────────────────────────────────────────────
router.get('/groups/all', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cg.*, (SELECT COUNT(*) FROM customer_group_members WHERE groupId = cg.id) as memberCount
       FROM customer_groups cg ORDER BY cg.name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

// ── Create group ────────────────────────────────────────────────────────────
router.post('/groups', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, description, color, isAutomatic, rules } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Group name is required' });
    const id = cuid();
    await pool.query(
      'INSERT INTO customer_groups (id, name, description, color, isAutomatic, rules) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, description || null, color || '#6b7280', isAutomatic ? 1 : 0, rules ? JSON.stringify(rules) : null]
    );
    const [rows] = await pool.query('SELECT * FROM customer_groups WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

// ── Add members to group ────────────────────────────────────────────────────
router.post('/groups/:groupId/members', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0)
      return res.status(400).json({ success: false, message: 'userIds array is required' });
    const [groupRows] = await pool.query('SELECT id FROM customer_groups WHERE id = ?', [groupId]);
    if (groupRows.length === 0) return res.status(404).json({ success: false, message: 'Group not found' });
    for (const userId of userIds) {
      const [existing] = await pool.query(
        'SELECT id FROM customer_group_members WHERE groupId = ? AND userId = ?', [groupId, userId]
      );
      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO customer_group_members (id, groupId, userId) VALUES (?, ?, ?)',
          [cuid(), groupId, userId]
        );
      }
    }
    res.json({ success: true, message: `${userIds.length} member(s) added` });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

// ── Remove member from group ────────────────────────────────────────────────
router.delete('/groups/:groupId/members/:userId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    await pool.query('DELETE FROM customer_group_members WHERE groupId = ? AND userId = ?', [groupId, userId]);
    res.json({ success: true, message: 'Member removed' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

// ── Delete group ────────────────────────────────────────────────────────────
router.delete('/groups/:groupId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    await pool.query('DELETE FROM customer_group_members WHERE groupId = ?', [groupId]);
    await pool.query('DELETE FROM customer_groups WHERE id = ?', [groupId]);
    res.json({ success: true, message: 'Group deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

// ── Get customer detail ─────────────────────────────────────────────────────
router.get('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [userRows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.orderCount, u.createdAt,
              COALESCE(SUM(o.total), 0) as totalSpent,
              COUNT(DISTINCT o.id) as completedOrders
       FROM users u
       LEFT JOIN orders o ON u.id = o.userId AND o.paymentStatus = 'PAID'
       WHERE u.id = ? GROUP BY u.id`,
      [req.params.id]
    );
    if (userRows.length === 0) return res.status(404).json({ success: false, message: 'Customer not found' });
    const [orders] = await pool.query(
      `SELECT id, status, paymentStatus, total, createdAt FROM orders WHERE userId = ? ORDER BY createdAt DESC LIMIT 10`,
      [req.params.id]
    );
    const [addresses] = await pool.query(
      'SELECT * FROM addresses WHERE userId = ? ORDER BY isDefault DESC', [req.params.id]
    );
    const [groups] = await pool.query(
      `SELECT cg.id, cg.name, cg.color
       FROM customer_groups cg
       JOIN customer_group_members cgm ON cg.id = cgm.groupId
       WHERE cgm.userId = ?`,
      [req.params.id]
    );
    res.json({ success: true, data: { ...userRows[0], orders, addresses, groups } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

module.exports = router;
