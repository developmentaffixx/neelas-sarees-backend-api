const { Router } = require('express');
const {
  getProducts, getProductBySlug, getProductById, getFeaturedProducts,
  createProduct, updateProduct, deleteProduct, bulkUpdateProducts, checkProductUniqueness,
  getVariants, addVariant, updateVariant, deleteVariant,
} = require('../controllers/product.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = Router();

// Public
router.get('/',         getProducts);
router.get('/featured', getFeaturedProducts);
// Admin — product CRUD (must precede parameterized /:slug)
router.get('/check-unique',          authenticate, authorizeAdmin, checkProductUniqueness);
router.get('/by-id/:id',             authenticate, authorizeAdmin, getProductById);
router.post('/',                      authenticate, authorizeAdmin, createProduct);
router.post('/bulk-update',           authenticate, authorizeAdmin, bulkUpdateProducts);
router.put('/:id',                    authenticate, authorizeAdmin, updateProduct);
router.delete('/:id',                 authenticate, authorizeAdmin, deleteProduct);

// Admin — color variant CRUD (nested under product)
router.get('/:id/variants',                        authenticate, authorizeAdmin, getVariants);
router.post('/:id/variants',                       authenticate, authorizeAdmin, addVariant);
router.put('/:id/variants/:variantId',             authenticate, authorizeAdmin, updateVariant);
router.delete('/:id/variants/:variantId',          authenticate, authorizeAdmin, deleteVariant);

// Public — product by slug (at end of GET routes so literal sub-paths are not intercepted)
router.get('/:slug',    getProductBySlug);

module.exports = router;
