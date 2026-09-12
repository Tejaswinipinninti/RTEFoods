import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  User,
  Mail,
  Phone,
  Printer,
  XCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const statusColor = {
  pending: 'bg-amber-500/20 text-amber-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-indigo-500/20 text-indigo-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOrder(id);
      const d = res.data;
      const orderData = d?.data || d;
      setOrder(orderData);
      setNewStatus(orderData?.status);
    } catch (error) {
      toast.error('Failed to fetch order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) return;
    try {
      setUpdating(true);
      await adminService.updateOrderStatus(id, { status: newStatus });
      toast.success('Order status updated');
      fetchOrder();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    try {
      setUpdating(true);
      await adminService.updateOrderStatus(id, { status: 'cancelled', cancelReason });
      toast.success('Order cancelled');
      setCancelModal(false);
      setCancelReason('');
      fetchOrder();
    } catch (error) {
      toast.error('Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => { window.print(); };

  const timeline = order?.timeline || [];

  const statusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!order) return null;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/orders')} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Order #{order.orderNumber}</h1>
          <p className="text-gray-400 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <span className={`px-4 py-2 rounded-xl text-sm font-medium ${statusColor[order.status] || ''}`}>
          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
        </span>
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-colors">
          <Printer className="w-4 h-4" /> Print Invoice
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <button onClick={handleStatusUpdate} disabled={updating || newStatus === order.status}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50">
          {updating && <Loader2 className="w-4 h-4 animate-spin" />}
          Update Status
        </button>
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <button onClick={() => setCancelModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors">
            <XCircle className="w-4 h-4" /> Cancel Order
          </button>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Order Timeline</h3>
          <div className="relative ml-4">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-white/10" />
            {timeline.length > 0 ? timeline.map((event, i) => (
              <div key={i} className="relative flex items-start gap-4 pb-6 last:pb-0">
                <div className={`absolute left-0 w-3 h-3 rounded-full -translate-x-[5px] mt-1 ${
                  i === 0 ? 'bg-indigo-500' : 'bg-white/20'
                }`} />
                <div>
                  <p className="text-white text-sm font-medium capitalize">{event.status}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{event.note || ''}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{new Date(event.date || event.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">No timeline events yet</p>
            )}
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" /> Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="text-white text-sm">{order.user?.name || order.shippingAddress?.fullName || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-white text-sm">{order.user?.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-white text-sm">{order.user?.phone || order.shippingAddress?.phone || '—'}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" /> Shipping Address
            </h3>
            <div className="text-gray-300 text-sm space-y-1">
              <p>{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.address}</p>
              {order.shippingAddress?.address2 && <p>{order.shippingAddress.address2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-3 text-left text-sm font-medium text-gray-400">Item</th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-400">Qty</th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-400">Price</th>
                    <th className="pb-3 text-right text-sm font-medium text-gray-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img src={item.product?.coverImage || item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="text-white text-sm">{item.name}</p>
                            {item.variant && <p className="text-gray-400 text-xs">{item.variant}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-gray-300 text-sm">{item.quantity}</td>
                      <td className="py-3 text-gray-300 text-sm">${item.price?.toFixed(2)}</td>
                      <td className="py-3 text-white text-sm text-right">${(item.price * item.quantity)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" /> Payment Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Method</span>
                <span className="text-white text-sm capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[order.paymentStatus === 'paid' ? 'delivered' : order.paymentStatus] || ''}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Transaction ID</span>
                  <span className="text-white text-sm font-mono">{order.paymentId}</span>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Subtotal</span>
                <span className="text-white text-sm">${order.subtotal?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Discount</span>
                  <span className="text-emerald-400 text-sm">-${order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Shipping</span>
                <span className="text-white text-sm">${order.shippingCost?.toFixed(2) || '0.00'}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Tax</span>
                  <span className="text-white text-sm">${order.tax?.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-white font-semibold">Grand Total</span>
                <span className="text-white font-bold text-lg">${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </GlassCard>

          {order.notes && (
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" /> Notes
              </h3>
              <p className="text-gray-300 text-sm">{order.notes}</p>
            </GlassCard>
          )}
        </motion.div>
      </div>

      {cancelModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setCancelModal(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Cancel Order</h3>
            <p className="text-gray-300 mb-4">Please provide a reason for cancelling this order.</p>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4"
              placeholder="Cancellation reason..." />
            <div className="flex justify-end gap-3">
              <button onClick={() => setCancelModal(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Close</button>
              <button onClick={handleCancel} disabled={updating || !cancelReason.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancel Order
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
