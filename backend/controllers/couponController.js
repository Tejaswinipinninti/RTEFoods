const Coupon = require('../models/Coupon');

exports.createCoupon = async (req, res) => {
  try {
    const existing = await Coupon.findOne({ code: req.body.code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon with this code already exists' });
    }
    const coupon = await Coupon.create({ ...req.body, code: req.body.code.toUpperCase() });
    res.status(201).json({ success: true, data: coupon, message: 'Coupon created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const { search, status, type, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (type) query.type = type;
    const total = await Coupon.countDocuments(query);
    const coupons = await Coupon.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: coupons,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
      const existing = await Coupon.findOne({ code: req.body.code, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Coupon with this code already exists' });
      }
    }
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.status(200).json({ success: true, data: coupon, message: 'Coupon updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    coupon.status = coupon.status === 'active' ? 'inactive' : 'active';
    coupon.isActive = coupon.status === 'active';
    await coupon.save();
    res.status(200).json({ success: true, data: coupon, message: `Coupon ${coupon.status === 'active' ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true, status: 'active' });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }
    const now = new Date();
    if (now < coupon.startDate || now > coupon.expiryDate) {
      return res.status(400).json({ success: false, message: 'Coupon is expired or not yet valid' });
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    if (coupon.minOrderAmount > 0 && cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount of ₹${coupon.minOrderAmount} required` });
    }
    if (coupon.maxOrderAmount > 0 && cartTotal > coupon.maxOrderAmount) {
      return res.status(400).json({ success: false, message: `Maximum order amount of ₹${coupon.maxOrderAmount} exceeded` });
    }
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === 'flat') {
      discount = coupon.value;
    }
    res.status(200).json({
      success: true, data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        maxDiscount: coupon.maxDiscount,
        discount: Math.min(discount, cartTotal)
      }, message: 'Coupon is valid'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal, userId } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true, status: 'active' });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }
    const now = new Date();
    if (now < coupon.startDate || now > coupon.expiryDate) {
      return res.status(400).json({ success: false, message: 'Coupon is expired or not yet valid' });
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    if (coupon.minOrderAmount > 0 && cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount of ₹${coupon.minOrderAmount} required` });
    }
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === 'flat') {
      discount = coupon.value;
    }
    discount = Math.min(discount, cartTotal);
    coupon.usedCount += 1;
    await coupon.save();
    res.status(200).json({
      success: true, data: {
        couponId: coupon._id,
        code: coupon.code,
        type: coupon.type,
        discount,
        finalAmount: cartTotal - discount
      }, message: 'Coupon applied successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCoupons = exports.getCoupons;
exports.getCoupon = exports.getCouponById;
exports.toggleStatus = exports.toggleCouponStatus;
