const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  mobileImage: { type: String, default: '' },
  link: { type: String, default: '' },
  type: { type: String, enum: ['homepage', 'category', 'offer', 'popup', 'carousel'], default: 'homepage' },
  position: { type: String, default: '' },
  buttonText: { type: String, default: '' },
  buttonLink: { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
