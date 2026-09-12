const Banner = require('../models/Banner');

exports.createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, data: banner, message: 'Banner created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const { search, type, status, page = 1, limit = 10, sort = 'sortOrder' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (status) query.status = status;
    const total = await Banner.countDocuments(query);
    const banners = await Banner.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: banners,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveBanners = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { status: 'active' };
    if (type) query.type = type;
    const now = new Date();
    query.$or = [{ startDate: { $lte: now } }, { startDate: { $exists: false } }];
    query.$and = [{ $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }] }];
    const banners = await Banner.find(query).sort('sortOrder');
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.status(200).json({ success: true, data: banner, message: 'Banner updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reorderBanners = async (req, res) => {
  try {
    const { items } = req.body;
    for (const item of items) {
      await Banner.findByIdAndUpdate(item.id, { sortOrder: item.sortOrder });
    }
    res.status(200).json({ success: true, data: {}, message: 'Banners reordered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    banner.status = banner.status === 'active' ? 'inactive' : 'active';
    await banner.save();
    res.status(200).json({ success: true, data: banner, message: `Banner ${banner.status === 'active' ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllBanners = exports.getBanners;
exports.getBanner = exports.getBannerById;
exports.toggleStatus = exports.toggleBannerStatus;
