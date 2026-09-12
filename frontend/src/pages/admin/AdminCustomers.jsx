import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  Trash2,
  X,
  Mail,
  Phone,
  Calendar,
  Package,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import { formatPrice, formatDate } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Modal = ({ isOpen, onClose, title, children, wide }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`w-full ${wide ? 'max-w-4xl' : 'max-w-2xl'} bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gray-900 z-10">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState([]);
  const [detailModal, setDetailModal] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ page, search, status, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setCustomers(data?.users || data?.customers || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [page, search, status]);

  const handleBlockToggle = async (customer) => {
    try {
      await adminService.blockUser(customer._id);
      toast.success(customer.isBlocked ? 'Customer unblocked' : 'Customer blocked');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to update customer');
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteUser?.(deleteModal._id) || await adminService.blockUser(deleteModal._id);
      toast.success('Customer deleted');
      setDeleteModal(null);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const handleExportCSV = async () => {
    try {
      const headers = ['Name', 'Email', 'Phone', 'Orders', 'Status', 'Joined'];
      const rows = customers.map((c) => [c.name, c.email, c.phone || '', c.ordersCount || 0, c.isBlocked ? 'Blocked' : 'Active', formatDate(c.createdAt)]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers.csv';
      a.click();
      toast.success('CSV exported');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const viewCustomer = async (customer) => {
    setDetailModal(customer);
    try {
      const res = await adminService.getUserDetails?.(customer._id);
      const d = res?.data;
      setDetailData(d?.data || d || null);
    } catch (error) {
      setDetailData(null);
    }
  };

  const toggleSelectAll = () => {
    if (selected.length === customers.length) setSelected([]);
    else setSelected(customers.map((c) => c._id));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-gray-400 mt-1">Manage your customer base</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by name, email, or phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left"><input type="checkbox" checked={selected.length === customers.length && customers.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500" /></th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Customer</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Email</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Phone</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Orders</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Joined</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={8} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No customers found</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4"><input type="checkbox" checked={selected.includes(customer._id)} onChange={() => toggleSelect(customer._id)} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500" /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {customer.avatar ? <img src={customer.avatar} alt="" className="w-9 h-9 rounded-full object-cover" /> : (customer.name?.[0] || 'U').toUpperCase()}
                        </div>
                        <span className="text-white font-medium text-sm">{customer.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{customer.email}</td>
                    <td className="p-4 text-gray-400 text-sm">{customer.phone || '—'}</td>
                    <td className="p-4 text-white text-sm">{customer.ordersCount ?? customer.orderCount ?? 0}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${customer.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {customer.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{formatDate(customer.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => viewCustomer(customer)} title="View Details"
                          className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleBlockToggle(customer)} title={customer.isBlocked ? 'Unblock' : 'Block'}
                          className={`p-2 rounded-lg transition-colors ${customer.isBlocked ? 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/10'}`}>
                          {customer.isBlocked ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDeleteModal(customer)} title="Delete"
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      <Modal isOpen={!!detailModal} onClose={() => { setDetailModal(null); setDetailData(null); }} title="Customer Details" wide>
        {detailModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {detailModal.avatar ? <img src={detailModal.avatar} alt="" className="w-16 h-16 rounded-full object-cover" /> : (detailModal.name?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{detailModal.name}</h3>
                <p className="text-gray-400">{detailModal.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Phone className="w-4 h-4" /> Phone</div>
                <p className="text-white">{detailModal.phone || 'Not provided'}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Calendar className="w-4 h-4" /> Joined</div>
                <p className="text-white">{formatDate(detailModal.createdAt)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Package className="w-4 h-4" /> Total Orders</div>
                <p className="text-white">{detailData?.ordersCount ?? detailModal.ordersCount ?? 0}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Shield className="w-4 h-4" /> Status</div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${detailModal.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {detailModal.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
            </div>

            {detailData?.addresses?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Addresses</h4>
                <div className="space-y-2">
                  {detailData.addresses.map((addr, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10 text-sm text-gray-300">
                      {addr.fullName && <p className="text-white font-medium">{addr.fullName}</p>}
                      <p>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailData?.recentOrders?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Orders</h4>
                <div className="space-y-2">
                  {detailData.recentOrders.map((order) => (
                    <div key={order._id} className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">#{order.orderNumber}</p>
                        <p className="text-gray-400 text-xs">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">{formatPrice(order.total)}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Customer">
        <p className="text-gray-300 mb-6">Are you sure you want to delete <span className="text-white font-medium">{deleteModal?.name}</span>? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </motion.div>
  );
}
