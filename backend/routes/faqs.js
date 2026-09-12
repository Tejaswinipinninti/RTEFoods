const router = require('express').Router();
const {
  getAllFaqs,
  getFaq,
  getPublicFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  toggleStatus
} = require('../controllers/faqController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getAllFaqs);
router.get('/public', getPublicFaqs);
router.get('/:id', getFaq);
router.post('/', protect, admin, createFaq);
router.put('/:id', protect, admin, updateFaq);
router.delete('/:id', protect, admin, deleteFaq);
router.patch('/:id/toggle-status', protect, admin, toggleStatus);

module.exports = router;
