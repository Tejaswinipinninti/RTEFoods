const router = require('express').Router();
const {
  createReview,
  getReviews,
  getAllReviews,
  deleteReview,
  replyToReview,
  approveReview,
  rejectReview,
  getRatingStats
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, getAllReviews);
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const Review = require('../models/Review');
    const total = await Review.countDocuments();
    const pending = await Review.countDocuments({ status: 'pending' });
    const approved = await Review.countDocuments({ status: 'approved' });
    const rejected = await Review.countDocuments({ status: 'rejected' });
    const avgResult = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const avgRating = avgResult.length > 0 ? Math.round(avgResult[0].avg * 10) / 10 : 0;
    const distribution = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.status(200).json({
      success: true, data: { total, pending, approved, rejected, avgRating, distribution }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post('/', protect, createReview);
router.get('/product/:productId', getReviews);
router.get('/stats/:productId', getRatingStats);
router.delete('/:id', protect, deleteReview);
router.post('/:id/reply', protect, admin, replyToReview);
router.patch('/:id/approve', protect, admin, approveReview);
router.patch('/:id/reject', protect, admin, rejectReview);
router.put('/:id/approve', protect, admin, approveReview);
router.put('/:id/reject', protect, admin, rejectReview);

module.exports = router;
