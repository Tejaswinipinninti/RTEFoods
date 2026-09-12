const router = require('express').Router();
const {
  getAllCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  verifyCoupon,
  applyCoupon
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, getAllCoupons);
router.get('/:id', protect, admin, getCoupon);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);
router.post('/verify', protect, verifyCoupon);
router.post('/apply', protect, applyCoupon);

module.exports = router;
