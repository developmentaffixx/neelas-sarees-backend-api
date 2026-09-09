const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const { authenticate } = require('../middleware/auth.middleware');
const { cuid } = require('../lib/cuid');
const bcrypt = require('bcryptjs');

const router = Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, role, googleId, orderCount, createdAt, (password IS NOT NULL AND password != '') AS hasPassword FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { ...rows[0], hasPassword: Boolean(rows[0].hasPassword) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await pool.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone || null, req.user.id]);
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, role, googleId, orderCount, createdAt, (password IS NOT NULL AND password != '') AS hasPassword FROM users WHERE id = ?",
      [req.user.id]
    );
    res.json({ success: true, data: { ...rows[0], hasPassword: Boolean(rows[0].hasPassword) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.put('/me/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    const user = rows[0];
    const hasExistingPassword = user.password && user.password !== '';

    if (hasExistingPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: hasExistingPassword ? 'Password updated successfully' : 'Password set successfully' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.get('/me/addresses', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM addresses WHERE userId = ? ORDER BY isDefault DESC, createdAt DESC', [req.user.id]);
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.post('/me/addresses', authenticate, async (req, res) => {
  try {
    const { name, phone, line1, line2, city, state, pincode, isDefault = false } = req.body;
    if (!name || !phone || !line1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'All required address fields must be provided' });
    }
    if (isDefault) await pool.query('UPDATE addresses SET isDefault = 0 WHERE userId = ?', [req.user.id]);
    const id = cuid();
    await pool.query(
      'INSERT INTO addresses (id, userId, name, phone, line1, line2, city, state, pincode, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, name, phone, line1, line2 || null, city, state, pincode, isDefault ? 1 : 0]
    );
    const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.put('/me/addresses/:id', authenticate, async (req, res) => {
  try {
    const { name, phone, line1, line2, city, state, pincode, isDefault } = req.body;
    if (isDefault) await pool.query('UPDATE addresses SET isDefault = 0 WHERE userId = ?', [req.user.id]);
    await pool.query(
      'UPDATE addresses SET name = ?, phone = ?, line1 = ?, line2 = ?, city = ?, state = ?, pincode = ?, isDefault = ? WHERE id = ? AND userId = ?',
      [name, phone, line1, line2 || null, city, state, pincode, isDefault ? 1 : 0, req.params.id, req.user.id]
    );
    const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.delete('/me/addresses/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM addresses WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

module.exports = router;
