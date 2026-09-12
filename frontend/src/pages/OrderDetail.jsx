import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, MapPin, CreditCard, Download, XCircle, Clock, CheckCircle, Truck, X as XIcon } from 'lucide-react';
import { getOrderById, cancelOrder } from '../services/orderService';
import { formatPrice, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const TIMELINE_STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getOrderById(id)
      .then((res) => {
        const data = res.data?.data || res.data;
        setOrder(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const orderStatus = order?.orderStatus || order?.status || '';
  const currentStepIndex = TIMELINE_STEPS.indexOf(orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1));

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      await cancelOrder(id, cancelReason);
      setOrder((prev) => ({ ...prev, orderStatus: 'cancelled' }));
      setShowCancel(false);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-6 sm:py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 sm:h-24 bg-white/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">
        <p className="text-gray-500 text-sm sm:text-base">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <nav className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <Link to="/" className="hover:text-orange-500">Home</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <Link to="/orders" className="hover:text-orange-500">Orders</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-orange-600 font-medium">#{order.orderNumber}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Order #{order.orderNumber}</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <a
              href={`/api/orders/${id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/60 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium hover:bg-white/80 transition-all"
            >
              <Download size={14} className="sm:hidden" /> <Download size={16} className="hidden sm:block" /> Invoice
            </a>
            {['pending', 'confirmed'].includes(orderStatus.toLowerCase()) && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCancel(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs sm:text-sm font-medium hover:bg-red-100 transition-all"
              >
                <XCircle size={14} /> Cancel
              </motion.button>
            )}
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">Order Status</h2>
          <div className="flex items-center justify-between relative overflow-x-auto pb-2">
            <div className="absolute top-3 sm:top-4 left-0 right-0 h-0.5 bg-gray-200" />
            <div
              className="absolute top-3 sm:top-4 left-0 h-0.5 bg-green-500 transition-all duration-500"
              style={{ width: `${Math.max(0, (currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100)}%` }}
            />
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center min-w-[60px] sm:min-w-0">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-3 sm:ring-4 ring-green-200' : ''}`}
                  >
                    {isCompleted ? <CheckCircle size={14} className="sm:hidden" /> : <Clock size={14} className="sm:hidden" />}
                    {isCompleted ? <CheckCircle size={16} className="hidden sm:block" /> : <Clock size={16} className="hidden sm:block" />}
                  </motion.div>
                  <span className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-medium ${isCompleted ? 'text-green-600' : 'text-gray-400'} text-center`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
          {orderStatus.toLowerCase() === 'cancelled' && (
            <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-red-50 rounded-xl text-red-600 text-xs sm:text-sm font-medium flex items-center gap-2">
              <XIcon size={16} /> Order has been cancelled
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2 mb-2.5 sm:mb-3">
              <MapPin size={16} className="text-orange-500 sm:hidden" />
              <MapPin size={18} className="text-orange-500 hidden sm:block" />
              Shipping Address
            </h2>
            <div className="text-xs sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
              <p className="font-medium text-gray-800">{(order.shippingAddress || order.address || {}).name}</p>
              <p>{(order.shippingAddress || order.address || {}).addressLine1}</p>
              {(order.shippingAddress || order.address || {}).addressLine2 && <p>{(order.shippingAddress || order.address || {}).addressLine2}</p>}
              <p>{(order.shippingAddress || order.address || {}).city}, {(order.shippingAddress || order.address || {}).state} - {(order.shippingAddress || order.address || {}).pincode}</p>
              <p>{(order.shippingAddress || order.address || {}).phone}</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2 mb-2.5 sm:mb-3">
              <CreditCard size={16} className="text-orange-500 sm:hidden" />
              <CreditCard size={18} className="text-orange-500 hidden sm:block" />
              Payment Info
            </h2>
            <div className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm p-4 sm:p-6 mt-4 sm:mt-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Order Items</h2>
          <div className="space-y-2.5 sm:space-y-3">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 bg-white/40 rounded-xl">
                <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate text-sm">{item.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-800 text-sm">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-3 sm:mt-4 pt-3 sm:pt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>{(order.shippingCharge || order.shipping || 0) === 0 ? 'FREE' : formatPrice(order.shippingCharge || order.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-base sm:text-lg font-bold border-t border-gray-100 pt-2 sm:pt-2.5">
              <span>Total</span>
              <span className="text-orange-600">{formatPrice(order.grandTotal || order.total)}</span>
            </div>
          </div>
        </div>

        {showCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full"
            >
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Cancel Order</h3>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                rows={3}
                className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-none mb-3 sm:mb-4 text-sm"
              />
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleCancel}
                  disabled={!cancelReason.trim() || cancelling}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 text-sm"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
                <button
                  onClick={() => setShowCancel(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 text-sm"
                >
                  Keep Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
