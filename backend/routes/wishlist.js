const router = require('express').Router();
const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  checkInWishlist
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWishlist);
router.post('/toggle', protect, toggleWishlist);
router.get('/check/:productId', protect, checkInWishlist);
router.delete('/:productId', protect, removeFromWishlist);

module.exports = router;
