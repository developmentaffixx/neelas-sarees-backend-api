const { Router } = require('express');
const {
  createManualInvoice,
  getManualInvoices,
  getManualInvoiceById,
  sendManualInvoiceEmail,
  deleteManualInvoice,
} = require('../controllers/manual-invoice.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = Router();

// All manual invoice actions are for administrators
router.get('/', authenticate, authorizeAdmin, getManualInvoices);
router.get('/:id', authenticate, authorizeAdmin, getManualInvoiceById);
router.post('/', authenticate, authorizeAdmin, createManualInvoice);
router.post('/send-email', authenticate, authorizeAdmin, sendManualInvoiceEmail);
router.delete('/:id', authenticate, authorizeAdmin, deleteManualInvoice);

module.exports = router;
