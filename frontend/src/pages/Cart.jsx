import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Minus, Plus, X, ArrowLeft, Trash2, Tag, Truck } from 'lucide-react';
import useCart from '../hooks/useCart';
import { useDispatch } from 'react-redux';
import { updateQuantity, removeItem } from '../redux/slices/cartSlice';
import { applyCoupon } from '../services/cartService';
import { formatPrice } from '../utils/helpers';

const CartItem = ({ item, onUpdateQuantity, onRemove, loading }) => {
  const itemId = item._id || item.product || item.id;
  return (
    <motion.div
      layoutId={`cart-item-${itemId}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <img
        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=60'}
        alt={item.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 truncate text-sm sm:text-base">{item.name}</h3>
        {item.variant && (
          <p className="text-xs sm:text-sm text-gray-500">{item.variant}</p>
        )}
        <p className="text-orange-600 font-bold mt-1 text-sm sm:text-base">{formatPrice(item.price)}</p>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onUpdateQuantity(itemId, item.quantity - 1)}
          disabled={loading || item.quantity <= 1}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 touch-manipulation"
        >
          <Minus size={14} />
        </motion.button>
        <span className="w-7 sm:w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onUpdateQuantity(itemId, item.quantity + 1)}
          disabled={loading}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 touch-manipulation"
        >
          <Plus size={14} />
        </motion.button>
      </div>
      <div className="text-right min-w-[70px] sm:min-w-[80px]">
        <p className="font-bold text-gray-800 text-sm sm:text-base">{formatPrice(item.price * item.quantity)}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(itemId)}
        disabled={loading}
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <X size={16} />
      </motion.button>
    </motion.div>
  );
};

export default function Cart() {
  const { items, subtotal, itemCount, loading } = useCart();
  const dispatch = useDispatch();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const shipping = subtotal >= 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal - discount + shipping + tax;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const result = await applyCoupon(couponCode, subtotal);
      setDiscount(result.discount || 0);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleUpdateQuantity = (id, quantity) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemove = (id) => {
    dispatch(removeItem(id));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 mb-4 sm:mb-6"
          >
            <ShoppingBag size={36} className="text-orange-500 sm:hidden" />
            <ShoppingBag size={48} className="text-orange-500 hidden sm:block" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">Add some delicious items to get started!</p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
          >
            <ArrowLeft size={18} />
            Browse Menu
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-6 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <nav className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-orange-600 font-medium">Cart</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">
          Shopping Cart <span className="text-orange-500">({itemCount} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <CartItem
                  key={item._id || item.product || item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                  loading={loading}
                />
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-lg p-5 sm:p-6 space-y-4 sm:space-y-5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Order Summary</h2>

              <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 sm:py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-gray-50"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </motion.button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-xs">{couponError}</p>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-xl px-3 py-2">
                    <Truck size={14} />
                    <span>Add {formatPrice(499 - subtotal)} more for free shipping</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-500">Tax (5%)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between text-base sm:text-lg font-bold">
                  <span>Grand Total</span>
                  <span className="text-orange-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-3 pt-2">
                <Link
                  to="/menu"
                  className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Continue Shopping
                </Link>
                <Link
                  to="/checkout"
                  className="flex items-center justify-center w-full py-2.5 sm:py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
