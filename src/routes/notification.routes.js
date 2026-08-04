const { Router } = require('express');
const pool = require('../lib/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const { cuid } = require('../lib/cuid');

const router = Router();

router.get('/templates', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const conditions = [];
    const params = [];
    if (req.query.type) { conditions.push('type = ?'); params.push(req.query.type); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT * FROM notification_templates ${where} ORDER BY event ASC, type ASC`, params);
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error }); }
});

router.get('/templates/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notification_templates WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error }); }
});

router.post('/templates', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, type, event, subject, body, variables, isActive } = req.body;
    if (!name || !type || !event || !body) return res.status(400).json({ success: false, message: 'name, type, event, and body are required' });
    const id = cuid();
    await pool.query(`INSERT INTO notification_templates (id, name, type, event, subject, body, variables, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id, name, type, event, subject || null, body, variables ? JSON.stringify(variables) : null, isActive !== false ? 1 : 0]);
    const [rows] = await pool.query('SELECT * FROM notification_templates WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error }); }
});

router.put('/templates/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, type, event, subject, body, variables, isActive } = req.body;
    await pool.query(`UPDATE notification_templates SET name = ?, type = ?, event = ?, subject = ?, body = ?, variables = ?, isActive = ?, updatedAt = NOW() WHERE id = ?`, [name, type, event, subject || null, body, variables ? JSON.stringify(variables) : null, isActive ? 1 : 0, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM notification_templates WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error }); }
});

router.delete('/templates/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM notification_templates WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error }); }
});

router.post('/templates/:id/preview', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notification_templates WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Template not found' });
    let previewBody = rows[0].body;
    let previewSubject = rows[0].subject;
    if (req.body.variables && typeof req.body.variables === 'object') {
      for (const [key, value] of Object.entries(req.body.variables)) {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        previewBody = previewBody.replace(regex, value);
        if (previewSubject) previewSubject = previewSubject.replace(regex, value);
      }
    }
    res.json({ success: true, data: { subject: previewSubject, body: previewBody } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error }); }
});

module.exports = router;
