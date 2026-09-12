const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, icon, status, seoTitle, seoDescription, seoKeywords, sortOrder } = req.body;
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }
    const category = await Category.create({ name, description, image, icon, status, seoTitle, seoDescription, seoKeywords, sortOrder });
    res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    const total = await Category.countDocuments(query);
    const categories = await Category.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: categories,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    if (req.body.name) {
      const existing = await Category.findOne({ name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Category with this name already exists' });
      }
    }
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category, message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) {
      return res.status(400).json({ success: false, message: 'No category IDs provided' });
    }
    await Category.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, data: {}, message: `${ids.length} categories deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    category.status = category.status === 'active' ? 'inactive' : 'active';
    await category.save();
    res.status(200).json({ success: true, data: category, message: `Category ${category.status === 'active' ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProductCount = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const Product = require('../models/Product');
    const count = await Product.countDocuments({ category: category._id, status: 'active' });
    category.productCount = count;
    await category.save();
    res.status(200).json({ success: true, data: category, message: 'Product count updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCategories = exports.getCategories;
exports.getAllCategoriesNoAuth = exports.getCategories;
exports.getCategory = exports.getCategoryById;
exports.toggleStatus = exports.toggleCategoryStatus;
exports.bulkDelete = exports.bulkDeleteCategories;
