const Review = require('../models/Review');
const Product = require('../models/Product');

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: true
    });
    const allReviews = await Review.find({ product: productId, status: 'approved' });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, { averageRating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length });
    res.status(201).json({ success: true, data: review, message: 'Review submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { product: req.params.productId };
    if (status) query.status = status;
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query).populate('user', 'firstName lastName avatar').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: reviews,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }
    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);
    const allReviews = await Review.find({ product: productId, status: 'approved' });
    const avgRating = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;
    await Product.findByIdAndUpdate(productId, { averageRating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length });
    res.status(200).json({ success: true, data: {}, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.replyToReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    review.reply = {
      text: req.body.text,
      repliedBy: req.user._id,
      repliedAt: new Date()
    };
    await review.save();
    res.status(200).json({ success: true, data: review, message: 'Reply added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    const allReviews = await Review.find({ product: review.product, status: 'approved' });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(review.product, { averageRating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length });
    res.status(200).json({ success: true, data: review, message: 'Review approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    const allReviews = await Review.find({ product: review.product, status: 'approved' });
    const avgRating = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;
    await Product.findByIdAndUpdate(review.product, { averageRating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length });
    res.status(200).json({ success: true, data: review, message: 'Review rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReviewAnalytics = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ product: productId, status: 'approved' });
    const total = reviews.length;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    for (const review of reviews) {
      distribution[review.rating] += 1;
      sum += review.rating;
    }
    const averageRating = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
    const percentageDistribution = {};
    for (let i = 1; i <= 5; i++) {
      percentageDistribution[i] = total > 0 ? Math.round((distribution[i] / total) * 100) : 0;
    }
    res.status(200).json({
      success: true, data: { total, averageRating, distribution, percentageDistribution }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, rating } = req.query;
    const query = {};
    if (status) query.status = status;
    if (rating) query.rating = Number(rating);
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query).populate('user', 'firstName lastName avatar').populate('product', 'name slug').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: reviews,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReviews = exports.getProductReviews;
exports.getRatingStats = exports.getReviewAnalytics;
