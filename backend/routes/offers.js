const router = require('express').Router();
const {
  getAllOffers,
  getOffer,
  getActiveOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleStatus
} = require('../controllers/offerController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getAllOffers);
router.get('/active', getActiveOffers);
router.get('/:id', getOffer);
router.post('/', protect, admin, createOffer);
router.put('/:id', protect, admin, updateOffer);
router.delete('/:id', protect, admin, deleteOffer);
router.patch('/:id/toggle-status', protect, admin, toggleStatus);

module.exports = router;
