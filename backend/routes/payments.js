const router = require('express').Router();
const {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  refundPayment,
  getUpiApps
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// UPI / Razorpay routes
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/status/:paymentId', protect, getPaymentStatus);
router.post('/refund', protect, refundPayment);
router.get('/upi-apps', getUpiApps);

module.exports = router;
