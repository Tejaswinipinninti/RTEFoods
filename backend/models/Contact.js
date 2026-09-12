const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['contact', 'enquiry', 'complaint', 'feedback', 'other'], default: 'contact' },
  status: { type: String, enum: ['pending', 'read', 'replied', 'resolved', 'archived'], default: 'pending' },
  reply: {
    text: String,
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    repliedAt: Date
  },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  ipAddress: String
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
