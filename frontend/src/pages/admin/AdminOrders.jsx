import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const statusTabs = [
  { key: '', label: 'All', icon: Package },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
];

const statusColor = {
  pending: 'bg-amber-500/20 text-amber-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-indigo-500/20 text-indigo-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const paymentStatusColor = {
  pending: 'bg-amber-500/20 text-amber-400',
  paid: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-red-500/20 text-red-400',
  refunded: 'bg-gray-500/20 text-gray-400',
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOrders({ page, search, status, paymentStatus, dateFrom, dateTo, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setOrders(data?.orders || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await adminService.getOrderStats();
      const d = res.data;
      setStats(d?.data || d);
    } catch (error) {
      console.error('Failed to fetch order stats');
    }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchOrders(); }, [page, search, status, paymentStatus, dateFrom, dateTo]);

  const handleBulkStatusUpdate = async () => {
    if (!selected.length || !bulkStatus) return;
    try {
      await adminService.bulkUpdateOrderStatus(selected, bulkStatus);
      toast.success(`${selected.length} orders updated to ${bulkStatus}`);
      setSelected([]);
      setBulkStatus('');
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update orders');
    }
  };

  const toggleSelectAll = () => {
    if (selected.length === orders.length) setSelected([]);
    else setSelected(orders.map((o) => o._id));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const statCards = stats
    ? [
        { label: 'Pending', value: stats.pending || 0, color: 'from-amber-500 to-orange-600', icon: Clock },
        { label: 'Confirmed', value: stats.confirmed || 0, color: 'from-blue-500 to-indigo-600', icon: CheckCircle },
        { label: 'Shipped', value: stats.shipped || 0, color: 'from-purple-500 to-pink-600', icon: Truck },
        { label: 'Delivered', value: stats.delivered || 0, color: 'from-emerald-500 to-teal-600', icon: CheckCircle },
      ]
    : [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-gray-400 mt-1">Manage customer orders</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={i} variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-gray-400">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatus(tab.key); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              status === tab.key
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by order ID or customer..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Payment</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <span className="text-gray-500">to</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </motion.div>

      {selected.length > 0 && (
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{selected.length} selected</span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={handleBulkStatusUpdate} disabled={!bulkStatus}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50">
            Update Status
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left"><input type="checkbox" checked={selected.length === orders.length && orders.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500" /></th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Order ID</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Customer</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Items</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Payment</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Total</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={9} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-gray-500">No orders found</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/admin/orders/${order._id}`)}>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.includes(order._id)} onChange={() => toggleSelect(order._id)} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500" />
                    </td>
                    <td className="p-4 text-indigo-400 font-medium text-sm">#{order.orderNumber}</td>
                    <td className="p-4 text-white text-sm">{order.user?.name || order.shippingAddress?.fullName || '—'}</td>
                    <td className="p-4 text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-400 text-sm">{order.items?.length || 0}</td>
                    <td className="p-4 text-gray-400 text-sm capitalize">{order.paymentMethod}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStatusColor[order.paymentStatus] || ''}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-white text-sm font-medium">${order.total?.toFixed(2)}</td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <p className="text-sm text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
