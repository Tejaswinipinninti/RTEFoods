const Wishlist = require('../models/Wishlist');

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const existing = await Wishlist.findOne({ user: req.user._id, product: productId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }
    const wishlist = await Wishlist.create({ user: req.user._id, product: productId });
    res.status(201).json({ success: true, data: wishlist, message: 'Added to wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndDelete({ user: req.user._id, product: req.params.productId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const existing = await Wishlist.findOne({ user: req.user._id, product: productId });
    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });
      res.status(200).json({ success: true, data: { inWishlist: false }, message: 'Removed from wishlist' });
    } else {
      const wishlist = await Wishlist.create({ user: req.user._id, product: productId });
      res.status(201).json({ success: true, data: { inWishlist: true, id: wishlist._id }, message: 'Added to wishlist' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkInWishlist = async (req, res) => {
  try {
    const exists = await Wishlist.findOne({ user: req.user._id, product: req.params.productId });
    res.status(200).json({ success: true, data: { inWishlist: !!exists } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id })
      .populate('product', 'name slug coverImage price mrp averageRating isVeg stockQuantity status');
    res.status(200).json({ success: true, data: wishlist, total: wishlist.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWishlist = exports.getUserWishlist;
