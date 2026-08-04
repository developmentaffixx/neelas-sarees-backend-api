const { Router } = require('express');
const { getProducts, getProductBySlug, getProductById, getFeaturedProducts, createProduct, updateProduct, deleteProduct, bulkUpdateProducts, checkProductUniqueness } = require('../controllers/product.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = Router();
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/check-unique', authenticate, authorizeAdmin, checkProductUniqueness);
router.get('/by-id/:id', authenticate, authorizeAdmin, getProductById);
router.get('/:slug', getProductBySlug);
router.post('/', authenticate, authorizeAdmin, createProduct);
router.post('/bulk-update', authenticate, authorizeAdmin, bulkUpdateProducts);
router.put('/:id', authenticate, authorizeAdmin, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

module.exports = router;
