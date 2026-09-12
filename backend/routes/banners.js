const router = require('express').Router();
const {
  getAllBanners,
  getBanner,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleStatus
} = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getAllBanners);
router.get('/active', getActiveBanners);
router.get('/:id', getBanner);
router.post('/', protect, admin, createBanner);
router.put('/:id', protect, admin, updateBanner);
router.delete('/:id', protect, admin, deleteBanner);
router.patch('/:id/toggle-status', protect, admin, toggleStatus);

module.exports = router;
