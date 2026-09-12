import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, ShoppingBag, Eye } from 'lucide-react';
import { getMyOrders } from '../services/orderService';
import { formatPrice, formatDate } from '../utils/helpers';

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Clock },
  packed: { label: 'Packed', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-yellow-100 text-yellow-900 border-yellow-200', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    getMyOrders()
      .then((res) => {
        const orderList = Array.isArray(res) ? res : (res?.data?.data || res?.data?.orders || res?.data || []);
        setOrders(orderList);
      })
      .catch((err) => console.error('Error fetching orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'All'
    ? orders
    : orders.filter((o) => {
        const statusStr = (o.orderStatus || o.status || '').toLowerCase();
        return statusStr === activeTab.toLowerCase();
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <nav className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 sm:gap-2">
          <Link to="/" className="hover:text-orange-500 font-medium">Home</Link>
          <span>/</span>
          <Link to="/profile" className="hover:text-orange-500 font-medium">Account</Link>
          <span>/</span>
          <span className="text-orange-600 font-bold">My Orders</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">My Orders</h1>
            <p className="text-[11px] sm:text-xs lg:text-sm text-gray-500 mt-1">Track and manage your ready-to-eat food orders</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Order More Food
          </Link>
        </div>

        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-100 -mx-1 px-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs lg:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 sm:h-36 bg-white/70 rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16 bg-white/70 backdrop-blur-md rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-orange-500">
              <ShoppingBag size={28} className="sm:hidden" />
              <ShoppingBag size={32} className="hidden sm:block" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} orders found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">You haven't placed any orders matching this category yet.</p>
            <Link
              to="/products"
              className="inline-flex mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm"
            >
              Browse Fresh Food Menu
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <AnimatePresence>
              {filtered.map((order) => {
                const statusKey = (order.orderStatus || order.status || 'pending').toLowerCase();
                const statusConf = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
                const StatusIcon = statusConf.icon;
                const totalAmount = order.grandTotal || order.total || 0;

                return (
                  <motion.div
                    key={order._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-gray-100 pb-3 sm:pb-4">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                          <Package size={18} className="text-orange-600 sm:hidden" />
                          <Package size={20} className="text-orange-600 hidden sm:block" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Order #{order.orderNumber}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 pl-[46px] sm:pl-0">
                        <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${statusConf.color}`}>
                          <StatusIcon size={12} className="sm:hidden" />
                          <StatusIcon size={14} className="hidden sm:block" />
                          {statusConf.label || order.orderStatus}
                        </span>
                        <p className="font-extrabold text-gray-900 text-sm sm:text-base">{formatPrice(totalAmount)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {(order.items || []).slice(0, 4).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-xl border border-gray-100">
                            <img
                              src={item.image || 'https://via.placeholder.com/40'}
                              alt={item.name}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover border border-gray-200"
                            />
                            <div className="text-[10px] sm:text-xs">
                              <p className="font-semibold text-gray-800 truncate max-w-[100px] sm:max-w-[120px]">{item.name}</p>
                              <p className="text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {(order.items || []).length > 4 && (
                          <span className="text-[10px] sm:text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-lg">
                            +{(order.items.length - 4)} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <Link
                          to={`/order/${order._id}`}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-[10px] sm:text-xs font-bold rounded-xl transition-all border border-orange-200"
                        >
                          <Eye size={12} className="sm:hidden" /> <Eye size={14} className="hidden sm:block" /> View Details <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
