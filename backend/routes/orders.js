const router = require('express').Router();
const {
  createOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  processRefund,
  getOrderStats,
  bulkUpdateOrderStatus
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getUserOrders);
router.get('/stats', protect, admin, getOrderStats);
router.get('/stats/overview', protect, admin, getOrderStats);
router.get('/', protect, admin, getAllOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.post('/bulk-update-status', protect, admin, bulkUpdateOrderStatus);
router.post('/:id/cancel', protect, cancelOrder);
router.post('/:id/refund', protect, admin, processRefund);

module.exports = router;
