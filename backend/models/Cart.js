const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    mrp: Number,
    quantity: { type: Number, default: 1, min: 1 },
    variant: String,
    weight: String,
    isVeg: Boolean
  }],
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  couponCode: { type: String, default: '' },
  couponDiscount: { type: Number, default: 0 }
}, { timestamps: true });

cartSchema.index({ user: 1 });

module.exports = mongoose.model('Cart', cartSchema);
