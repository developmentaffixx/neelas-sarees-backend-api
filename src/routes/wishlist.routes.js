const { Router } = require('express');
const pool = require('../lib/db');
const { authenticate } = require('../middleware/auth.middleware');
const { cuid } = require('../lib/cuid');

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT w.*, p.id as prod_id, p.name as prod_name, p.slug as prod_slug, p.price, p.comparePrice, p.images, p.stock, p.isActive FROM wishlists w JOIN products p ON w.productId = p.id WHERE w.userId = ?`, [req.user.id]);
    const items = rows.map(r => ({ id: r.id, userId: r.userId, productId: r.productId, createdAt: r.createdAt, product: { id: r.prod_id, name: r.prod_name, slug: r.prod_slug, price: r.price, comparePrice: r.comparePrice, images: r.images ? JSON.parse(r.images) : [], stock: r.stock, isActive: Boolean(r.isActive) } }));
    res.json({ success: true, data: items });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error }); }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;
    const [existing] = await pool.query('SELECT id FROM wishlists WHERE userId = ? AND productId = ?', [userId, productId]);
    if (existing.length > 0) {
      await pool.query('DELETE FROM wishlists WHERE id = ?', [existing[0].id]);
      return res.json({ success: true, message: 'Removed from wishlist', added: false });
    }
    await pool.query('INSERT INTO wishlists (id, userId, productId) VALUES (?, ?, ?)', [cuid(), userId, productId]);
    res.json({ success: true, message: 'Added to wishlist', added: true });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error }); }
});

router.delete('/:productId', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM wishlists WHERE userId = ? AND productId = ?', [req.user.id, req.params.productId]);
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error', error }); }
});

module.exports = router;
