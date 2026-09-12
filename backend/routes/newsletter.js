const router = require('express').Router();
const {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
  toggleStatus,
  bulkDelete
} = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/auth');

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/', protect, admin, getAllSubscribers);
router.put('/:id/toggle', protect, admin, toggleStatus);
router.delete('/:id', protect, admin, deleteSubscriber);
router.post('/bulk-delete', protect, admin, bulkDelete);

module.exports = router;
