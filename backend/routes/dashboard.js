const router = require('express').Router();
const {
  getStats,
  getRevenue,
  getTopProducts,
  getRecentOrders,
  getRecentUsers,
  getMonthlySales
} = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/auth');

router.get('/stats', protect, admin, getStats);
router.get('/revenue', protect, admin, getRevenue);
router.get('/top-products', protect, admin, getTopProducts);
router.get('/recent-orders', protect, admin, getRecentOrders);
router.get('/recent-users', protect, admin, getRecentUsers);
router.get('/monthly-sales', protect, admin, getMonthlySales);

module.exports = router;
