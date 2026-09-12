import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  Eye,
  Clock,
  ArrowUpDown,
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

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gray-900 z-10">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Input = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
    <input {...props} className={`w-full px-4 py-2.5 bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`} />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const Textarea = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
    <textarea {...props} className={`w-full px-4 py-2.5 bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`} />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const Select = ({ label, options, error, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
    <select {...props} className={`w-full px-4 py-2.5 bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}>
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adjustModal, setAdjustModal] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [adjustData, setAdjustData] = useState({ type: 'in', quantity: 0, reason: '', notes: '' });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await adminService.getInventory({ page, search, filter, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setInventory(data?.inventory || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, [page, search, filter]);

  const handleAdjust = async () => {
    if (!adjustData.quantity || adjustData.quantity <= 0) return toast.error('Enter a valid quantity');
    try {
      await adminService.adjustStock({ productId: adjustModal._id, ...adjustData });
      toast.success('Stock adjusted');
      setAdjustModal(null);
      setAdjustData({ type: 'in', quantity: 0, reason: '', notes: '' });
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to adjust stock');
    }
  };

  const viewHistory = async (item) => {
    setHistoryModal(item);
    try {
      const res = await adminService.getInventoryLogs({ productId: item._id || item.product?._id, limit: 20 });
      const d = res.data;
      const data = d?.data || d;
      setHistoryData(data?.logs || data?.data || (Array.isArray(data) ? data : []));
    } catch (error) {
      toast.error('Failed to fetch history');
      setHistoryData([]);
    }
  };

  const getStockStatus = (item) => {
    const available = item.available ?? (item.currentStock - (item.reserved || 0));
    if (available <= 0) return { label: 'Out of Stock', color: 'bg-red-500/20 text-red-400', icon: XCircle };
    if (available <= (item.lowStockLimit || 10)) return { label: 'Low Stock', color: 'bg-amber-500/20 text-amber-400', icon: AlertTriangle };
    return { label: 'In Stock', color: 'bg-emerald-500/20 text-emerald-400', icon: Package };
  };

  const lowStockItems = inventory.filter((i) => {
    const avail = i.available ?? (i.currentStock - (i.reserved || 0));
    return avail > 0 && avail <= (i.lowStockLimit || 10);
  });

  const outOfStockItems = inventory.filter((i) => {
    const avail = i.available ?? (i.currentStock - (i.reserved || 0));
    return avail <= 0;
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        <p className="text-gray-400 mt-1">Manage product stock levels and adjustments</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: inventory.length, color: 'from-indigo-500 to-purple-600', icon: Package },
          { label: 'In Stock', value: inventory.filter((i) => (i.available ?? (i.currentStock - (i.reserved || 0))) > (i.lowStockLimit || 10)).length, color: 'from-emerald-500 to-teal-600', icon: Package },
          { label: 'Low Stock', value: lowStockItems.length, color: 'from-amber-500 to-orange-600', icon: AlertTriangle },
          { label: 'Out of Stock', value: outOfStockItems.length, color: 'from-red-500 to-pink-600', icon: XCircle },
        ].map((card, i) => (
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

      {lowStockItems.length > 0 && (
        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Low Stock Alerts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.slice(0, 6).map((item) => {
              const avail = item.available ?? (item.currentStock - (item.reserved || 0));
              return (
                <div key={item._id || item.product?._id} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{item.product?.name || item.name}</p>
                    <p className="text-amber-400 text-xs">{avail} remaining</p>
                  </div>
                  <button onClick={() => { setAdjustModal(item); setAdjustData({ type: 'in', quantity: 0, reason: '', notes: '' }); }}
                    className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/30">Reorder</button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {outOfStockItems.length > 0 && (
        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2"><XCircle className="w-4 h-4" /> Out of Stock</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {outOfStockItems.slice(0, 6).map((item) => (
              <div key={item._id || item.product?._id} className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{item.product?.name || item.name}</p>
                  <p className="text-red-400 text-xs">Out of stock</p>
                </div>
                <button onClick={() => { setAdjustModal(item); setAdjustData({ type: 'in', quantity: 0, reason: '', notes: '' }); }}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30">Restock</button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Stock</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-sm font-medium text-gray-400">Product</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">SKU</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Current Stock</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Reserved</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Available</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Low Limit</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Reorder</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={9} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : inventory.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-gray-500">No inventory data found</td></tr>
              ) : (
                inventory.map((item) => {
                  const available = item.available ?? (item.currentStock - (item.reserved || 0));
                  const status = getStockStatus(item);
                  const StatusIcon = status.icon;
                  return (
                    <tr key={item._id || item.product?._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white text-sm font-medium max-w-[180px] truncate">{item.product?.name || item.name}</td>
                      <td className="p-4 text-gray-400 text-sm font-mono">{item.sku || item.product?.sku || '—'}</td>
                      <td className="p-4 text-white text-sm">{item.currentStock ?? 0}</td>
                      <td className="p-4 text-gray-400 text-sm">{item.reserved || 0}</td>
                      <td className="p-4 text-white text-sm font-medium">{available}</td>
                      <td className="p-4 text-gray-400 text-sm">{item.lowStockLimit || 10}</td>
                      <td className="p-4 text-gray-400 text-sm">{item.reorderPoint || '—'}</td>
                      <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${status.color}`}><StatusIcon className="w-3 h-3" /> {status.label}</span></td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setAdjustModal(item); setAdjustData({ type: 'in', quantity: 0, reason: '', notes: '' }); }}
                            className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Adjust Stock"><ArrowUpDown className="w-4 h-4" /></button>
                          <button onClick={() => viewHistory(item)}
                            className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="View History"><Clock className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      <Modal isOpen={!!adjustModal} onClose={() => setAdjustModal(null)} title="Adjust Stock">
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white font-medium">{adjustModal?.product?.name || adjustModal?.name}</p>
            <p className="text-gray-400 text-sm mt-1">Current Stock: {adjustModal?.currentStock ?? 0}</p>
          </div>
          <Select label="Adjustment Type"
            value={adjustData.type} onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value })}
            options={[{ value: 'in', label: 'Stock In (Add)' }, { value: 'out', label: 'Stock Out (Remove)' }, { value: 'adjustment', label: 'Set Exact Value' }]} />
          <Input label="Quantity" type="number" min="0" value={adjustData.quantity} onChange={(e) => setAdjustData({ ...adjustData, quantity: Number(e.target.value) })} />
          <Input label="Reason" value={adjustData.reason} onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })} placeholder="e.g. New shipment received" />
          <Textarea label="Notes" rows={3} value={adjustData.notes} onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })} placeholder="Additional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setAdjustModal(null)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleAdjust} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all">
              <ArrowUpDown className="w-4 h-4" /> Apply Adjustment
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!historyModal} onClose={() => { setHistoryModal(null); setHistoryData([]); }} title="Stock History">
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">{historyModal?.product?.name || historyModal?.name}</p>
          {historyData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No stock history found</p>
          ) : (
            <div className="space-y-3">
              {historyData.map((log, i) => (
                <div key={log._id || i} className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.type === 'in' ? 'bg-emerald-500/20' : log.type === 'out' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                      {log.type === 'in' ? <Plus className="w-4 h-4 text-emerald-400" /> : log.type === 'out' ? <Minus className="w-4 h-4 text-red-400" /> : <ArrowUpDown className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{log.reason || 'Stock adjustment'}</p>
                      <p className="text-gray-500 text-xs">{formatDate(log.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${log.type === 'in' ? 'text-emerald-400' : log.type === 'out' ? 'text-red-400' : 'text-amber-400'}`}>
                    {log.type === 'in' ? '+' : log.type === 'out' ? '-' : ''}{log.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  );
}
