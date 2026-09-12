const { Inventory, InventoryLog } = require('../models/Inventory');
const Product = require('../models/Product');

exports.createInventory = async (req, res) => {
  try {
    const existing = await Inventory.findOne({ product: req.body.product, variant: req.body.variant || '' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Inventory record already exists for this product/variant' });
    }
    const inventory = await Inventory.create(req.body);
    await InventoryLog.create({
      product: req.body.product,
      type: 'in',
      quantity: req.body.currentStock || 0,
      previousStock: 0,
      newStock: req.body.currentStock || 0,
      reference: 'Initial stock',
      performedBy: req.user._id
    });
    res.status(201).json({ success: true, data: inventory, message: 'Inventory created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      const products = await Product.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      query.$or = [
        { product: { $in: products.map(p => p._id) } },
        { sku: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    const total = await Inventory.countDocuments(query);
    const inventory = await Inventory.find(query).populate('product', 'name slug sku coverImage').sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: inventory,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate('product', 'name slug sku');
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory record not found' });
    }
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory record not found' });
    }
    inventory.availableStock = inventory.currentStock - inventory.reservedStock;
    if (inventory.currentStock === 0) inventory.status = 'out_of_stock';
    else if (inventory.currentStock <= inventory.lowStockLimit) inventory.status = 'low_stock';
    else inventory.status = 'in_stock';
    await inventory.save();
    res.status(200).json({ success: true, data: inventory, message: 'Inventory updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const { type, quantity, reason, reference } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory record not found' });
    }
    const previousStock = inventory.currentStock;
    if (type === 'in') {
      inventory.currentStock += quantity;
    } else if (type === 'out') {
      if (inventory.currentStock < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }
      inventory.currentStock -= quantity;
    } else if (type === 'adjustment') {
      inventory.currentStock = quantity;
    } else if (type === 'return') {
      inventory.currentStock += quantity;
    }
    inventory.availableStock = inventory.currentStock - inventory.reservedStock;
    if (inventory.currentStock === 0) inventory.status = 'out_of_stock';
    else if (inventory.currentStock <= inventory.lowStockLimit) inventory.status = 'low_stock';
    else inventory.status = 'in_stock';
    if (type === 'in') inventory.lastRestocked = new Date();
    await inventory.save();
    await InventoryLog.create({
      product: inventory.product,
      type,
      quantity,
      previousStock,
      newStock: inventory.currentStock,
      reference: reference || '',
      reason: reason || '',
      orderId: req.body.orderId || undefined,
      performedBy: req.user._id
    });
    res.status(200).json({ success: true, data: inventory, message: 'Stock adjusted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adjustStockByProduct = async (req, res) => {
  try {
    const { product, variant, type, quantity, reason, reference } = req.body;
    if (!product || !type || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'product, type, and quantity are required' });
    }
    const query = { product };
    if (variant) query.variant = variant;
    const inventory = await Inventory.findOne(query);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory record not found for this product' });
    }
    const previousStock = inventory.currentStock;
    if (type === 'in') {
      inventory.currentStock += quantity;
    } else if (type === 'out') {
      if (inventory.currentStock < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }
      inventory.currentStock -= quantity;
    } else if (type === 'adjustment') {
      inventory.currentStock = quantity;
    } else if (type === 'return') {
      inventory.currentStock += quantity;
    }
    inventory.availableStock = inventory.currentStock - inventory.reservedStock;
    if (inventory.currentStock === 0) inventory.status = 'out_of_stock';
    else if (inventory.currentStock <= inventory.lowStockLimit) inventory.status = 'low_stock';
    else inventory.status = 'in_stock';
    if (type === 'in') inventory.lastRestocked = new Date();
    await inventory.save();
    await InventoryLog.create({
      product: inventory.product,
      type,
      quantity,
      previousStock,
      newStock: inventory.currentStock,
      reference: reference || '',
      reason: reason || '',
      orderId: req.body.orderId || undefined,
      performedBy: req.user._id
    });
    res.status(200).json({ success: true, data: inventory, message: 'Stock adjusted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInventoryHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const query = { product: req.params.productId };
    if (type) query.type = type;
    const total = await InventoryLog.countDocuments(query);
    const logs = await InventoryLog.find(query).populate('product', 'name slug').populate('performedBy', 'firstName lastName').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: logs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllStockHistory = async (req, res) => {
  try {
    const { product, type, page = 1, limit = 10 } = req.query;
    const query = {};
    if (product) query.product = product;
    if (type) query.type = type;
    const total = await InventoryLog.countDocuments(query);
    const logs = await InventoryLog.find(query).populate('product', 'name slug').populate('performedBy', 'firstName lastName').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: logs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLowStockAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = {
      $or: [
        { status: 'low_stock' },
        { status: 'out_of_stock' },
        { $expr: { $lte: ['$currentStock', '$lowStockLimit'] } }
      ]
    };
    const total = await Inventory.countDocuments(query);
    const inventory = await Inventory.find(query).populate('product', 'name slug sku coverImage').sort('currentStock').skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: inventory,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOutOfStockProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { $or: [{ status: 'out_of_stock' }, { currentStock: 0 }] };
    const total = await Inventory.countDocuments(query);
    const inventory = await Inventory.find(query).populate('product', 'name slug sku coverImage').skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: inventory,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory record not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Inventory record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllInventory = exports.getInventory;
exports.getInventoryItem = exports.getInventoryById;
exports.updateStock = exports.updateInventory;
exports.getStockHistory = exports.getInventoryHistory;
exports.bulkUpdate = exports.updateInventory;
