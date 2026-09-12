const Pincode = require('../models/Pincode');

exports.createPincode = async (req, res) => {
  try {
    const existing = await Pincode.findOne({ pincode: req.body.pincode });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Pincode already exists' });
    }
    const pincode = await Pincode.create(req.body);
    res.status(201).json({ success: true, data: pincode, message: 'Pincode created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPincodes = async (req, res) => {
  try {
    const { search, status, serviceable, city, state, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { pincode: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (serviceable !== undefined) query.serviceable = serviceable === 'true';
    if (city) query.city = { $regex: city, $options: 'i' };
    if (state) query.state = { $regex: state, $options: 'i' };
    const total = await Pincode.countDocuments(query);
    const pincodes = await Pincode.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: pincodes,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPincodeById = async (req, res) => {
  try {
    const pincode = await Pincode.findById(req.params.id);
    if (!pincode) {
      return res.status(404).json({ success: false, message: 'Pincode not found' });
    }
    res.status(200).json({ success: true, data: pincode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePincode = async (req, res) => {
  try {
    if (req.body.pincode) {
      const existing = await Pincode.findOne({ pincode: req.body.pincode, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Pincode already exists' });
      }
    }
    const pincode = await Pincode.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pincode) {
      return res.status(404).json({ success: false, message: 'Pincode not found' });
    }
    res.status(200).json({ success: true, data: pincode, message: 'Pincode updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePincode = async (req, res) => {
  try {
    const pincode = await Pincode.findByIdAndDelete(req.params.id);
    if (!pincode) {
      return res.status(404).json({ success: false, message: 'Pincode not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Pincode deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDeletePincodes = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) {
      return res.status(400).json({ success: false, message: 'No pincode IDs provided' });
    }
    await Pincode.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, data: {}, message: `${ids.length} pincodes deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkServiceability = async (req, res) => {
  try {
    const { pincode } = req.params;
    const pincodeData = await Pincode.findOne({ pincode, serviceable: true, status: 'active' });
    if (!pincodeData) {
      return res.status(200).json({
        success: true, data: { serviceable: false, message: 'Delivery is not available for this pincode' }
      });
    }
    res.status(200).json({
      success: true, data: {
        serviceable: true,
        city: pincodeData.city,
        state: pincodeData.state,
        deliveryCharge: pincodeData.deliveryCharge,
        freeDeliveryAbove: pincodeData.freeDeliveryAbove,
        minOrderAmount: pincodeData.minOrderAmount,
        estimatedDays: pincodeData.estimatedDays,
        isCODAvailable: pincodeData.isCODAvailable,
        isExpressAvailable: pincodeData.isExpressAvailable
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkImportPincodes = async (req, res) => {
  try {
    const { pincodes } = req.body;
    if (!pincodes || !pincodes.length) {
      return res.status(400).json({ success: false, message: 'No pincodes provided' });
    }
    const results = { created: 0, updated: 0, errors: [] };
    for (const pincodeData of pincodes) {
      try {
        const existing = await Pincode.findOne({ pincode: pincodeData.pincode });
        if (existing) {
          await Pincode.findByIdAndUpdate(existing._id, pincodeData);
          results.updated++;
        } else {
          await Pincode.create(pincodeData);
          results.created++;
        }
      } catch (err) {
        results.errors.push({ pincode: pincodeData.pincode, error: err.message });
      }
    }
    res.status(200).json({ success: true, data: results, message: `Import completed: ${results.created} created, ${results.updated} updated` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPincodes = exports.getPincodes;
exports.getPincode = exports.getPincodeById;
exports.bulkDelete = exports.bulkDeletePincodes;
