const Subcategory = require('../models/Subcategory');

exports.createSubcategory = async (req, res) => {
  try {
    const { name, category, description, image, status, seoTitle, seoDescription, seoKeywords, sortOrder } = req.body;
    const existing = await Subcategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, category });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Subcategory with this name already exists in this category' });
    }
    const subcategory = await Subcategory.create({ name, category, description, image, status, seoTitle, seoDescription, seoKeywords, sortOrder });
    res.status(201).json({ success: true, data: subcategory, message: 'Subcategory created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubcategories = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;
    const total = await Subcategory.countDocuments(query);
    const subcategories = await Subcategory.find(query).populate('category', 'name slug').sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: subcategories,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubcategoryById = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate('category', 'name slug');
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    res.status(200).json({ success: true, data: subcategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubcategoryBySlug = async (req, res) => {
  try {
    const subcategory = await Subcategory.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    res.status(200).json({ success: true, data: subcategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    if (req.body.name && req.body.category) {
      const existing = await Subcategory.findOne({ name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }, category: req.body.category, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Subcategory with this name already exists in this category' });
      }
    }
    const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    res.status(200).json({ success: true, data: subcategory, message: 'Subcategory updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDeleteSubcategories = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) {
      return res.status(400).json({ success: false, message: 'No subcategory IDs provided' });
    }
    await Subcategory.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, data: {}, message: `${ids.length} subcategories deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleSubcategoryStatus = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    subcategory.status = subcategory.status === 'active' ? 'inactive' : 'active';
    await subcategory.save();
    res.status(200).json({ success: true, data: subcategory, message: `Subcategory ${subcategory.status === 'active' ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ category: req.params.categoryId, status: 'active' });
    res.status(200).json({ success: true, data: subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSubcategories = exports.getSubcategories;
exports.getSubcategory = exports.getSubcategoryById;
exports.toggleStatus = exports.toggleSubcategoryStatus;
exports.bulkDelete = exports.bulkDeleteSubcategories;
