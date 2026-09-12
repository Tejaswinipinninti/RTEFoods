const router = require('express').Router();
const {
  getAllCategories,
  getAllCategoriesNoAuth,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleStatus,
  bulkDelete
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getAllCategories);
router.get('/all', getAllCategoriesNoAuth);
router.get('/:id', getCategory);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);
router.patch('/:id/toggle-status', protect, admin, toggleStatus);
router.post('/bulk-delete', protect, admin, bulkDelete);

module.exports = router;
