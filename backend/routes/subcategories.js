const router = require('express').Router();
const {
  getAllSubcategories,
  getSubcategory,
  getSubcategoriesByCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  toggleStatus,
  bulkDelete
} = require('../controllers/subcategoryController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getAllSubcategories);
router.get('/category/:categoryId', getSubcategoriesByCategory);
router.get('/:id', getSubcategory);
router.post('/', protect, admin, createSubcategory);
router.put('/:id', protect, admin, updateSubcategory);
router.delete('/:id', protect, admin, deleteSubcategory);
router.patch('/:id/toggle-status', protect, admin, toggleStatus);
router.post('/bulk-delete', protect, admin, bulkDelete);

module.exports = router;
