const router = require('express').Router();
const {
  getProducts,
  getFeatured,
  getBestsellers,
  getTodaysSpecial,
  getCombos,
  getRelated,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  bulkUpdate,
  bulkDelete,
  exportCSV
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/bestsellers', getBestsellers);
router.get('/todays-special', getTodaysSpecial);
router.get('/todays-specials', getTodaysSpecial);
router.get('/combos', getCombos);
router.get('/related/:id', getRelated);
router.get('/export/csv', protect, admin, exportCSV);
router.get('/export', protect, admin, exportCSV);
router.get('/:id', getProduct);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/duplicate', protect, admin, duplicateProduct);
router.post('/bulk-update', protect, admin, bulkUpdate);
router.post('/bulk-update-status', protect, admin, bulkUpdate);
router.post('/bulk-delete', protect, admin, bulkDelete);

module.exports = router;
