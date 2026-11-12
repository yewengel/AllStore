const express = require('express');
const {
  getPaymentConfig,
  getAllPayments,
  initializeChapaPayment,
  verifyChapaPayment,
  handleChapaCallback,
  uploadBankTransferReceipt,
  getBankTransferReceipt,
  reviewBankTransfer,
} = require('../controllers/paymentController');
const { uploadPaymentReceipt } = require('../middleware/paymentReceiptUpload');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/config', getPaymentConfig);
router.get('/chapa/callback', handleChapaCallback);
router.post('/chapa/initialize/:id', protect, initializeChapaPayment);
router.post('/chapa/verify/:id', protect, verifyChapaPayment);
router.post('/bank-transfer/:id/receipt', protect, uploadPaymentReceipt, uploadBankTransferReceipt);
router.get('/admin', protect, admin, getAllPayments);
router.get('/admin/:id/receipt', protect, admin, getBankTransferReceipt);
router.patch('/admin/:id/review', protect, admin, reviewBankTransfer);

module.exports = router;
