const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { type: String, default: '' },
  sku: { type: String, default: '' },
  currentStock: { type: Number, default: 0, min: 0 },
  reservedStock: { type: Number, default: 0, min: 0 },
  availableStock: { type: Number, default: 0, min: 0 },
  lowStockLimit: { type: Number, default: 10 },
  reorderPoint: { type: Number, default: 20 },
  reorderQuantity: { type: Number, default: 50 },
  costPrice: { type: Number, default: 0 },
  supplier: { type: String, default: '' },
  warehouse: { type: String, default: 'Main Warehouse' },
  lastRestocked: { type: Date },
  status: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'in_stock' }
}, { timestamps: true });

const inventoryLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['in', 'out', 'adjustment', 'transfer', 'return'], required: true },
  quantity: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reference: { type: String, default: '' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  reason: { type: String, default: '' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

module.exports = { Inventory, InventoryLog };
