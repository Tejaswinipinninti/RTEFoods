const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    if (product.category) {
      await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } });
    }
    if (product.subcategory) {
      await Subcategory.findByIdAndUpdate(product.subcategory, { $inc: { productCount: 1 } });
    }
    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const {
      search, category, subcategory, brand, isVeg, isBestseller, isFeatured, isTodaysSpecial, isCombo,
      minPrice, maxPrice, minRating, status, sort = '-createdAt', page = 1, limit = 12
    } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      const catList = Array.isArray(category)
        ? category
        : String(category).split(',').map(s => s.trim()).filter(Boolean);
      
      const objectIds = [];
      const slugs = [];
      for (const item of catList) {
        if (mongoose.Types.ObjectId.isValid(item) && String(new mongoose.Types.ObjectId(item)) === item) {
          objectIds.push(item);
        } else {
          slugs.push(item);
        }
      }

      const orConditions = [];
      if (objectIds.length > 0) orConditions.push({ _id: { $in: objectIds } });
      if (slugs.length > 0) orConditions.push({ slug: { $in: slugs } });

      const foundCategories = orConditions.length > 0
        ? await Category.find({ $or: orConditions }).select('_id')
        : [];

      const categoryIds = foundCategories.map(c => c._id);
      if (categoryIds.length > 0) {
        query.category = categoryIds.length === 1 ? categoryIds[0] : { $in: categoryIds };
      } else {
        query.category = new mongoose.Types.ObjectId();
      }
    }

    if (subcategory) {
      const subcatList = Array.isArray(subcategory)
        ? subcategory
        : String(subcategory).split(',').map(s => s.trim()).filter(Boolean);
      
      const objectIds = [];
      const slugs = [];
      for (const item of subcatList) {
        if (mongoose.Types.ObjectId.isValid(item) && String(new mongoose.Types.ObjectId(item)) === item) {
          objectIds.push(item);
        } else {
          slugs.push(item);
        }
      }

      const orConditions = [];
      if (objectIds.length > 0) orConditions.push({ _id: { $in: objectIds } });
      if (slugs.length > 0) orConditions.push({ slug: { $in: slugs } });

      const foundSubcategories = orConditions.length > 0
        ? await Subcategory.find({ $or: orConditions }).select('_id')
        : [];

      const subcategoryIds = foundSubcategories.map(s => s._id);
      if (subcategoryIds.length > 0) {
        query.subcategory = subcategoryIds.length === 1 ? subcategoryIds[0] : { $in: subcategoryIds };
      } else {
        query.subcategory = new mongoose.Types.ObjectId();
      }
    }

    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (isVeg !== undefined) query.isVeg = isVeg === 'true';
    if (isBestseller !== undefined) query.isBestseller = isBestseller === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (isTodaysSpecial !== undefined) query.isTodaysSpecial = isTodaysSpecial === 'true';
    if (isCombo !== undefined) query.isCombo = isCombo === 'true';

    const effectiveMinPrice = minPrice !== undefined ? minPrice : req.query.priceMin;
    const effectiveMaxPrice = maxPrice !== undefined ? maxPrice : req.query.priceMax;
    if ((effectiveMinPrice !== undefined && effectiveMinPrice !== '') || (effectiveMaxPrice !== undefined && effectiveMaxPrice !== '')) {
      query.price = {};
      if (effectiveMinPrice !== undefined && effectiveMinPrice !== '') query.price.$gte = Number(effectiveMinPrice);
      if (effectiveMaxPrice !== undefined && effectiveMaxPrice !== '') query.price.$lte = Number(effectiveMaxPrice);
    }

    const effectiveRating = minRating !== undefined ? minRating : req.query.rating;
    if (effectiveRating !== undefined && effectiveRating !== '' && Number(effectiveRating) > 0) {
      query.averageRating = { $gte: Number(effectiveRating) };
    }

    if (req.query.inStock === 'true') {
      query.stockQuantity = { $gt: 0 };
    }

    if (status) {
      query.status = status;
    }

    let sortOption = '-createdAt';
    if (sort) {
      switch (sort) {
        case 'featured':
          sortOption = { isFeatured: -1, createdAt: -1 };
          break;
        case 'price_asc':
        case 'price-asc':
        case 'priceLow':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
        case 'price-desc':
        case 'priceHigh':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { averageRating: -1, totalReviews: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'popularity':
        case 'bestseller':
          sortOption = { totalSales: -1 };
          break;
        default:
          sortOption = sort;
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug').populate('subcategory', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug').populate('subcategory', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.category) {
      await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
    }
    if (product.subcategory) {
      await Subcategory.findByIdAndUpdate(product.subcategory, { $inc: { productCount: -1 } });
    }
    res.status(200).json({ success: true, data: {}, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const products = await Product.find({ isFeatured: true, status: 'active' }).populate('category', 'name slug').limit(Number(limit));
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBestsellerProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const products = await Product.find({ isBestseller: true, status: 'active' }).populate('category', 'name slug').sort('-totalSales').limit(Number(limit));
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTodaysSpecialProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const products = await Product.find({ isTodaysSpecial: true, status: 'active' }).populate('category', 'name slug').limit(Number(limit));
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getComboProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const products = await Product.find({ isCombo: true, status: 'active' }).populate('category', 'name slug').limit(Number(limit));
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.duplicateProduct = async (req, res) => {
  try {
    const original = await Product.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const productData = original.toObject();
    delete productData._id;
    delete productData.slug;
    delete productData.sku;
    delete productData.createdAt;
    delete productData.updatedAt;
    productData.name = `${original.name} (Copy)`;
    productData.status = 'inactive';
    productData.totalSales = 0;
    productData.averageRating = 0;
    productData.totalReviews = 0;
    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product, message: 'Product duplicated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { ids, updateData } = req.body;
    if (!ids || !ids.length) {
      return res.status(400).json({ success: false, message: 'No product IDs provided' });
    }
    await Product.updateMany({ _id: { $in: ids } }, { $set: updateData });
    const products = await Product.find({ _id: { $in: ids } });
    res.status(200).json({ success: true, data: products, message: `${ids.length} products updated successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) {
      return res.status(400).json({ success: false, message: 'No product IDs provided' });
    }
    const products = await Product.find({ _id: { $in: ids } });
    for (const product of products) {
      if (product.category) await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
      if (product.subcategory) await Subcategory.findByIdAndUpdate(product.subcategory, { $inc: { productCount: -1 } });
    }
    await Product.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, data: {}, message: `${ids.length} products deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportProductsCSV = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category', 'name').populate('subcategory', 'name');
    const csvHeader = 'Name,SKU,Category,Subcategory,Price,MRP,Stock,Status,IsVeg,IsFeatured,IsBestseller\n';
    const csvRows = products.map(p =>
      `"${p.name}","${p.sku || ''}","${p.category?.name || ''}","${p.subcategory?.name || ''}",${p.price},${p.mrp},${p.stockQuantity},${p.status},${p.isVeg},${p.isFeatured},${p.isBestseller}`
    ).join('\n');
    const csv = csvHeader + csvRows;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProduct = exports.getProductById;
exports.getFeatured = exports.getFeaturedProducts;
exports.getBestsellers = exports.getBestsellerProducts;
exports.getTodaysSpecial = exports.getTodaysSpecialProducts;
exports.getCombos = exports.getComboProducts;
exports.getRelated = exports.getProductById;
exports.bulkUpdate = exports.bulkUpdateProducts;
exports.bulkDelete = exports.bulkDeleteProducts;
exports.exportCSV = exports.exportProductsCSV;
