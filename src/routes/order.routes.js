const { Router } = require('express');
const { createOrder, getUserOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus } = require('../controllers/order.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = Router();
router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getUserOrders);
router.get('/my/:id', authenticate, getOrderById);
router.patch('/my/:id/cancel', authenticate, cancelOrder);
router.get('/', authenticate, authorizeAdmin, getAllOrders);
router.patch('/:id/status', authenticate, authorizeAdmin, updateOrderStatus);

module.exports = router;
