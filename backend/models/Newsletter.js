const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive', 'unsubscribed'], default: 'active' },
  source: { type: String, default: 'website' },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date },
  ipAddress: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Newsletter', newsletterSchema);
