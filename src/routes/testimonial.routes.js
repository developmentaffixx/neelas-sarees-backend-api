const { Router } = require('express');
const { serializeError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const { cuid } = require('../lib/cuid');

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM testimonials WHERE isActive = 1 ORDER BY sortOrder ASC, createdAt DESC');
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.get('/admin', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY sortOrder ASC, createdAt DESC');
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const id = cuid();
    const { name, body, rating, avatar, designation, isActive, sortOrder } = req.body;
    await pool.query(`INSERT INTO testimonials (id, name, body, rating, avatar, designation, isActive, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id, name, body, rating || 5, avatar || null, designation || 'Happy Customer', isActive !== false ? 1 : 0, sortOrder || 0]);
    const [rows] = await pool.query('SELECT * FROM testimonials WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, body, rating, avatar, designation, isActive, sortOrder } = req.body;
    await pool.query(`UPDATE testimonials SET name = ?, body = ?, rating = ?, avatar = ?, designation = ?, isActive = ?, sortOrder = ? WHERE id = ?`, [name, body, rating || 5, avatar || null, designation || 'Happy Customer', isActive ? 1 : 0, sortOrder || 0, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) }); }
});

module.exports = router;
