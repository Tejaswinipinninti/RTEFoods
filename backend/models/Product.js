const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, unique: true },
  sku: { type: String, unique: true, sparse: true },
  barcode: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  brand: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  fullDescription: { type: String, default: '' },
  ingredients: { type: String, default: '' },
  nutrition: {
    servingSize: { type: String, default: '' },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 }
  },
  cookingInstructions: { type: String, default: '' },
  shelfLife: { type: String, default: '' },
  weight: { type: String, default: '' },
  servingSize: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  stockQuantity: { type: Number, default: 0, min: 0 },
  lowStockLimit: { type: Number, default: 10 },
  isVeg: { type: Boolean, default: true },
  isBestseller: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isTodaysSpecial: { type: Boolean, default: false },
  isCombo: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  tags: [String],
  coverImage: { type: String, default: '' },
  galleryImages: [String],
  variants: [{
    name: String,
    weight: String,
    price: Number,
    mrp: Number,
    sku: String,
    stockQuantity: Number,
    status: { type: String, default: 'active' }
  }],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' }
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  if (this.mrp > 0 && this.price < this.mrp) {
    this.discountPercent = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  next();
});

productSchema.index({ name: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, subcategory: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestseller: 1 });

module.exports = mongoose.model('Product', productSchema);
