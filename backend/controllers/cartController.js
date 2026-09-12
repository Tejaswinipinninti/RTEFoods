const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name slug coverImage price mrp isVeg stockQuantity status')
      .populate('coupon', 'code type value maxDiscount');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalMRP = cart.items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
    const savings = totalMRP - subtotal;
    res.status(200).json({
      success: true, data: {
        ...cart.toObject(),
        subtotal,
        totalMRP,
        savings,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variant, weight } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Product is not available' });
    }
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && (item.variant || '') === (variant || '') && (item.weight || '') === (weight || '')
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        name: product.name,
        image: product.coverImage,
        price: product.price,
        mrp: product.mrp,
        quantity,
        variant: variant || '',
        weight: weight || '',
        isVeg: product.isVeg
      });
    }
    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product', 'name slug coverImage price mrp isVeg stockQuantity');
    res.status(200).json({ success: true, data: cart, message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
    if (quantity <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }
    if (cart.coupon) {
      await applyCouponDiscount(cart);
    }
    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name slug coverImage price mrp isVeg stockQuantity');
    res.status(200).json({ success: true, data: updatedCart, message: 'Cart updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    cart.items.pull(req.params.itemId);
    if (cart.coupon) {
      await applyCouponDiscount(cart);
    }
    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name slug coverImage price mrp isVeg stockQuantity');
    res.status(200).json({ success: true, data: updatedCart, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    if (!cart.items.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true, status: 'active' });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }
    const now = new Date();
    if (now < coupon.startDate || now > coupon.expiryDate) {
      return res.status(400).json({ success: false, message: 'Coupon is expired or not yet valid' });
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount of ₹${coupon.minOrderAmount} required` });
    }
    if (coupon.maxOrderAmount > 0 && subtotal > coupon.maxOrderAmount) {
      return res.status(400).json({ success: false, message: `Maximum order amount of ₹${coupon.maxOrderAmount} exceeded` });
    }
    cart.coupon = coupon._id;
    cart.couponCode = coupon.code;
    await applyCouponDiscount(cart);
    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name slug coverImage price mrp isVeg stockQuantity').populate('coupon', 'code type value maxDiscount');
    res.status(200).json({ success: true, data: updatedCart, message: 'Coupon applied successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    cart.coupon = null;
    cart.couponCode = '';
    cart.couponDiscount = 0;
    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name slug coverImage price mrp isVeg stockQuantity');
    res.status(200).json({ success: true, data: updatedCart, message: 'Coupon removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    cart.items = [];
    cart.coupon = null;
    cart.couponCode = '';
    cart.couponDiscount = 0;
    await cart.save();
    res.status(200).json({ success: true, data: cart, message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function applyCouponDiscount(cart) {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const coupon = await Coupon.findById(cart.coupon);
  if (!coupon) {
    cart.couponDiscount = 0;
    return;
  }
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else if (coupon.type === 'flat') {
    discount = coupon.value;
  } else if (coupon.type === 'free_shipping') {
    discount = 0;
  }
  cart.couponDiscount = Math.min(discount, subtotal);
}
