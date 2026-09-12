const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    variant: String,
    weight: String,
    total: Number
  }],
  shippingAddress: {
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  billingAddress: {
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  paymentMethod: { type: String, enum: ['cod', 'razorpay', 'stripe', 'wallet', 'upi', 'phonepe', 'gpay', 'paytm', 'card', 'netbanking'], required: true },
  paymentDetails: { type: Object, default: {} },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentId: { type: String, default: '' },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  couponDiscount: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  deliverySlot: {
    date: String,
    time: String
  },
  deliveryPincode: String,
  estimatedDelivery: String,
  trackingNumber: String,
  shippingPartner: String,
  timeline: [{
    status: String,
    date: { type: Date, default: Date.now },
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  notes: { type: String, default: '' },
  cancellationReason: { type: String, default: '' },
  refundStatus: { type: String, enum: ['none', 'pending', 'processed', 'completed'], default: 'none' },
  refundAmount: { type: Number, default: 0 },
  refundId: { type: String, default: '' },
  invoiceNumber: String,
  printCount: { type: Number, default: 0 }
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
