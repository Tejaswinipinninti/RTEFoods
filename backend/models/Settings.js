const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  general: {
    siteName: { type: String, default: 'RTE Foods' },
    siteDescription: { type: String, default: 'Premium Ready-to-Eat Foods' },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' }
  },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    googleAnalyticsId: { type: String, default: '' },
    facebookPixelId: { type: String, default: '' },
    robotsTxt: { type: String, default: '' }
  },
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  email: {
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },
    fromEmail: { type: String, default: '' },
    fromName: { type: String, default: '' }
  },
  payment: {
    razorpay: { enabled: Boolean, keyId: String, keySecret: String },
    stripe: { enabled: Boolean, publishableKey: String, secretKey: String },
    cod: { enabled: { type: Boolean, default: true }, minAmount: Number, maxAmount: Number },
    wallet: { enabled: Boolean },
    upi: { enabled: Boolean }
  },
  shipping: {
    freeShippingEnabled: { type: Boolean, default: true },
    freeShippingMinAmount: { type: Number, default: 499 },
    defaultShippingCharge: { type: Number, default: 49 },
    estimatedDeliveryDays: { type: Number, default: 3 }
  },
  tax: {
    gstEnabled: { type: Boolean, default: true },
    gstPercent: { type: Number, default: 5 },
    cgst: { type: Number, default: 2.5 },
    sgst: { type: Number, default: 2.5 },
    igst: { type: Number, default: 5 }
  },
  notification: {
    emailEnabled: { type: Boolean, default: true },
    smsEnabled: { type: Boolean, default: false },
    pushEnabled: { type: Boolean, default: false }
  },
  footer: {
    aboutText: { type: String, default: '' },
    quickLinks: [{ label: String, url: String }],
    policyLinks: [{ label: String, url: String }]
  },
  maintenance: {
    isMaintenance: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'We are currently under maintenance. Please check back later.' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
