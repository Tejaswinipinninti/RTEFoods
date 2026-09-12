const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
  pincode: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zone: { type: String, default: 'local' },
  deliveryCharge: { type: Number, default: 0 },
  freeDeliveryAbove: { type: Number, default: 499 },
  minOrderAmount: { type: Number, default: 199 },
  estimatedDays: { type: Number, default: 3 },
  isCODAvailable: { type: Boolean, default: true },
  isExpressAvailable: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  serviceable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Pincode', pincodeSchema);
