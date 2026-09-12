const router = require('express').Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/update', protect, updateCartItem);
router.delete('/remove/:productId', protect, removeFromCart);
router.post('/apply-coupon', protect, applyCoupon);
router.delete('/remove-coupon', protect, removeCoupon);
router.delete('/clear', protect, clearCart);

module.exports = router;
