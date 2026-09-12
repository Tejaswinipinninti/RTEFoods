const Offer = require('../models/Offer');

exports.createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, data: offer, message: 'Offer created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOffers = async (req, res) => {
  try {
    const { search, type, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (status) query.status = status;
    const total = await Offer.countDocuments(query);
    const offers = await Offer.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: offers,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveOffers = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { status: 'active' };
    if (type) query.type = type;
    const now = new Date();
    query.startDate = { $lte: now };
    query.endDate = { $gte: now };
    const offers = await Offer.find(query).sort('sortOrder');
    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('applicableProducts', 'name slug coverImage price')
      .populate('applicableCategories', 'name slug');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.status(200).json({ success: true, data: offer, message: 'Offer updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleOfferStatus = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    offer.status = offer.status === 'active' ? 'inactive' : 'active';
    await offer.save();
    res.status(200).json({ success: true, data: offer, message: `Offer ${offer.status === 'active' ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOffers = exports.getOffers;
exports.getOffer = exports.getOfferById;
exports.toggleStatus = exports.toggleOfferStatus;
