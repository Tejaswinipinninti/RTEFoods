const FAQ = require('../models/FAQ');

exports.createFAQ = async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, data: faq, message: 'FAQ created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFAQs = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10, sort = 'sortOrder' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;
    const total = await FAQ.countDocuments(query);
    const faqs = await FAQ.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: faqs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveFAQs = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { status: 'active' };
    if (category) query.category = category;
    const faqs = await FAQ.find(query).sort('sortOrder');
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    faq.views += 1;
    await faq.save();
    res.status(200).json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.status(200).json({ success: true, data: faq, message: 'FAQ updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markHelpful = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, { $inc: { helpful: 1 } }, { new: true });
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.status(200).json({ success: true, data: faq, message: 'Marked as helpful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFAQCategories = async (req, res) => {
  try {
    const categories = await FAQ.distinct('category');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFaq = exports.createFAQ;
exports.getAllFaqs = exports.getFAQs;
exports.getFaq = exports.getFAQById;
exports.getPublicFaqs = exports.getActiveFAQs;
exports.updateFaq = exports.updateFAQ;
exports.deleteFaq = exports.deleteFAQ;
exports.toggleStatus = exports.updateFAQ;
