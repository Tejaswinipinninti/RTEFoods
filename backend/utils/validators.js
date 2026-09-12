const Joi = require('joi');

exports.registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  password: Joi.string().min(6).max(128).required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.socialLoginSchema = Joi.object({
  provider: Joi.string().valid('google', 'facebook').required(),
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().allow(''),
  avatar: Joi.string().allow(''),
  uid: Joi.string(),
});

exports.updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  phone: Joi.string().min(10).max(15),
  avatar: Joi.string().allow(''),
});

exports.addressSchema = Joi.object({
  label: Joi.string().max(50).required(),
  fullName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().min(10).max(15).required(),
  addressLine1: Joi.string().min(5).max(200).required(),
  addressLine2: Joi.string().max(200).allow(''),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().min(2).max(100).required(),
  pincode: Joi.string().min(5).max(10).required(),
  country: Joi.string().default('India'),
  isDefault: Joi.boolean(),
});

exports.categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow(''),
  image: Joi.string().allow(''),
  status: Joi.string().valid('active', 'inactive'),
  seoTitle: Joi.string().max(200).allow(''),
  seoDescription: Joi.string().max(500).allow(''),
});

exports.productSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  slug: Joi.string().max(200),
  sku: Joi.string().max(50),
  category: Joi.string().required(),
  subcategory: Joi.string().allow(''),
  brand: Joi.string().max(100).allow(''),
  shortDescription: Joi.string().max(500).allow(''),
  fullDescription: Joi.string().allow(''),
  ingredients: Joi.string().allow(''),
  nutrition: Joi.string().allow(''),
  cookingInstructions: Joi.string().allow(''),
  shelfLife: Joi.string().max(100).allow(''),
  weight: Joi.string().max(50).allow(''),
  price: Joi.number().min(0).required(),
  mrp: Joi.number().min(0).required(),
  stockQuantity: Joi.number().min(0).required(),
  isVeg: Joi.boolean(),
  isBestseller: Joi.boolean(),
  isFeatured: Joi.boolean(),
  isTodaysSpecial: Joi.boolean(),
  isCombo: Joi.boolean(),
  status: Joi.string().valid('active', 'inactive'),
  tags: Joi.array().items(Joi.string()),
});

exports.couponSchema = Joi.object({
  code: Joi.string().min(3).max(50).required(),
  type: Joi.string().valid('percentage', 'flat', 'free_shipping').required(),
  value: Joi.number().min(0).required(),
  minCartAmount: Joi.number().min(0).allow(null),
  maxDiscount: Joi.number().min(0).allow(null),
  usageLimit: Joi.number().min(0).allow(null),
  userLimit: Joi.number().min(0).allow(null),
  expiryDate: Joi.date().required(),
  isActive: Joi.boolean(),
});

exports.orderSchema = Joi.object({
  shippingAddress: Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    addressLine1: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
  }).required(),
  paymentMethod: Joi.string().valid('cod', 'upi', 'card', 'razorpay', 'wallet').required(),
  couponCode: Joi.string().allow(''),
  notes: Joi.string().max(500).allow(''),
});

exports.bannerSchema = Joi.object({
  title: Joi.string().max(200).required(),
  subtitle: Joi.string().max(500).allow(''),
  image: Joi.string().required(),
  link: Joi.string().allow(''),
  type: Joi.string().valid('homepage', 'category', 'offer', 'popup'),
  status: Joi.string().valid('active', 'inactive'),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
});

exports.blogSchema = Joi.object({
  title: Joi.string().min(5).max(300).required(),
  content: Joi.string().required(),
  excerpt: Joi.string().max(500).allow(''),
  image: Joi.string().allow(''),
  category: Joi.string().allow(''),
  tags: Joi.array().items(Joi.string()),
  status: Joi.string().valid('draft', 'published', 'archived'),
  seoTitle: Joi.string().max(200).allow(''),
  seoDescription: Joi.string().max(500).allow(''),
});

exports.faqSchema = Joi.object({
  question: Joi.string().min(5).max(500).required(),
  answer: Joi.string().min(5).max(2000).required(),
  category: Joi.string().max(100).allow(''),
  status: Joi.string().valid('active', 'inactive'),
  order: Joi.number().min(0),
});

exports.contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).allow(''),
  subject: Joi.string().max(200).required(),
  message: Joi.string().min(10).max(2000).required(),
});
