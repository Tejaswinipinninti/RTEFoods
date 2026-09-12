const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const generateOrderNumber = require('../utils/generateOrderNumber');

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, paymentDetails, deliverySlot, deliveryDate, deliveryPincode, notes, addressId } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || !cart.items.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    for (const item of cart.items) {
      if (item.product && item.product.stockQuantity < item.quantity) {
        return res.status(400).json({ success: false, message: `${item.product.name} is out of stock` });
      }
    }

    let finalAddress = shippingAddress;
    if (!finalAddress || !finalAddress.addressLine1) {
      const user = await User.findById(req.user._id);
      if (user && user.addresses && user.addresses.length) {
        const found = addressId ? user.addresses.id(addressId) || user.addresses.find(a => a._id.toString() === addressId.toString()) : null;
        const target = found || user.addresses.find(a => a.isDefault) || user.addresses[0];
        if (target) {
          finalAddress = {
            name: target.name,
            phone: target.phone,
            addressLine1: target.addressLine1,
            addressLine2: target.addressLine2 || '',
            city: target.city,
            state: target.state,
            pincode: target.pincode,
            country: target.country || 'India'
          };
        }
      }
    }

    let formattedSlot = deliverySlot;
    if (typeof deliverySlot === 'string') {
      formattedSlot = {
        date: deliveryDate || new Date().toISOString().split('T')[0],
        time: deliverySlot
      };
    }

    const subtotal = cart.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const totalMRP = cart.items.reduce((sum, item) => sum + (item.mrp || item.price || 0) * item.quantity, 0);
    const discount = Math.max(0, totalMRP - subtotal);
    const couponDiscount = cart.couponDiscount || 0;
    let shippingCharge = subtotal < 499 ? 49 : 0;
    const taxableAmount = Math.max(0, subtotal - couponDiscount);
    const taxPercent = 5;
    const tax = Math.round((taxableAmount * taxPercent) / 100);
    const grandTotal = taxableAmount + shippingCharge + tax;
    const orderNumber = generateOrderNumber();
    const invoiceNumber = `INV-${orderNumber}`;
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: cart.items.map(item => ({
        product: item.product?._id || item.product,
        name: item.product?.name || item.name || 'Food Item',
        image: item.product?.coverImage || item.image || '',
        price: item.price,
        quantity: item.quantity,
        variant: item.variant || '',
        weight: item.weight || '',
        total: item.price * item.quantity
      })),
      shippingAddress: finalAddress,
      billingAddress: billingAddress || finalAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentDetails: paymentDetails || {},
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'confirmed',
      subtotal,
      discount,
      couponCode: cart.couponCode || '',
      couponDiscount,
      shippingCharge,
      tax,
      taxPercent,
      grandTotal,
      deliverySlot: formattedSlot,
      deliveryPincode: finalAddress?.pincode || deliveryPincode || '',
      notes: notes || '',
      invoiceNumber,
      timeline: [{ status: 'confirmed', date: new Date(), note: `Order placed successfully via ${paymentMethod || 'COD'}`, updatedBy: req.user._id }]
    });
    for (const item of cart.items) {
      if (item.product?._id) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stockQuantity: -item.quantity, totalSales: item.quantity }
        });
      }
    }
    cart.items = [];
    cart.coupon = null;
    cart.couponCode = '';
    cart.couponDiscount = 0;
    await cart.save();
    res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };
    if (status) query.orderStatus = status;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email phone');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderbyNumber = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber }).populate('user', 'firstName lastName email phone');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, orderStatus, paymentStatus, search, sortBy = '-createdAt' } = req.query;
    const query = {};
    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } }
      ];
    }
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).populate('user', 'firstName lastName email').sort(sortBy).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['packed', 'cancelled'],
      packed: ['shipped', 'cancelled'],
      shipped: ['out_for_delivery', 'delivered', 'cancelled'],
      out_for_delivery: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };
    if (!validTransitions[order.orderStatus] || !validTransitions[order.orderStatus].includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${order.orderStatus} to ${status}` });
    }
    order.orderStatus = status;
    order.timeline.push({ status, date: new Date(), note: note || `Status updated to ${status}`, updatedBy: req.user._id });
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }
    if (status === 'shipped' && req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }
    if (status === 'shipped' && req.body.shippingPartner) {
      order.shippingPartner = req.body.shippingPartner;
    }
    await order.save();
    res.status(200).json({ success: true, data: order, message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (['delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order in ${order.orderStatus} status` });
    }
    order.orderStatus = 'cancelled';
    order.cancellationReason = cancellationReason || 'Cancelled by user';
    order.timeline.push({ status: 'cancelled', date: new Date(), note: cancellationReason || 'Order cancelled', updatedBy: req.user._id });
    if (order.paymentStatus === 'paid') {
      order.refundStatus = 'pending';
      order.refundAmount = order.grandTotal;
    }
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: item.quantity, totalSales: -item.quantity } });
    }
    await order.save();
    res.status(200).json({ success: true, data: order, message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const { refundId, refundAmount } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.orderStatus !== 'cancelled') {
      return res.status(400).json({ success: false, message: 'Refund can only be processed for cancelled orders' });
    }
    if (order.refundStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Refund already completed' });
    }
    order.refundStatus = 'completed';
    order.refundId = refundId || `REF-${Date.now()}`;
    order.refundAmount = refundAmount || order.grandTotal;
    order.paymentStatus = 'refunded';
    order.timeline.push({ status: 'refunded', date: new Date(), note: `Refund of ₹${order.refundAmount} processed`, updatedBy: req.user._id });
    await order.save();
    res.status(200).json({ success: true, data: order, message: 'Refund processed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 }, totalAmount: { $sum: '$grandTotal' } } }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrder = exports.getOrderById;

exports.bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !ids.length) {
      return res.status(400).json({ success: false, message: 'No order IDs provided' });
    }
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const orders = await Order.find({ _id: { $in: ids } });
    for (const order of orders) {
      order.orderStatus = status;
      order.timeline.push({ status, date: new Date(), note: `Bulk status update to ${status}`, updatedBy: req.user._id });
      if (status === 'delivered') {
        order.paymentStatus = 'paid';
      }
      await order.save();
    }
    res.status(200).json({ success: true, data: {}, message: `${ids.length} orders updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
