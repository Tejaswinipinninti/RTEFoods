const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['percentage', 'flat', 'free_shipping'], required: true },
  value: { type: Number, required: true, min: 0 },
  maxDiscount: { type: Number, default: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxOrderAmount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  startDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

couponSchema.index({ code: 1 });
couponSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
