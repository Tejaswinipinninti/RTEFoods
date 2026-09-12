const router = require('express').Router();
const {
  getAllInventory,
  getInventoryItem,
  updateStock,
  adjustStock,
  adjustStockByProduct,
  getStockHistory,
  getAllStockHistory,
  getLowStockAlerts,
  bulkUpdate
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, getAllInventory);
router.get('/alerts', protect, admin, getLowStockAlerts);
router.get('/logs', protect, admin, getAllStockHistory);
router.get('/:id', protect, admin, getInventoryItem);
router.put('/:id', protect, admin, updateStock);
router.post('/adjust', protect, admin, adjustStockByProduct);
router.post('/:id/adjust', protect, admin, adjustStock);
router.get('/:id/history', protect, admin, getStockHistory);
router.post('/bulk-update', protect, admin, bulkUpdate);

module.exports = router;
