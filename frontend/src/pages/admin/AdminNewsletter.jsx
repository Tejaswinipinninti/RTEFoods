import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Mail,
  Users,
  UserCheck,
  UserX,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getNewsletterSubscribers({ page, search, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setSubscribers(data?.subscribers || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
      if (data?.stats) setStats(data.stats);
    } catch (error) {
      toast.error('Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscribers(); }, [page, search]);

  useEffect(() => {
    if (subscribers.length > 0 && !stats.total) {
      setStats({
        total: subscribers.length,
        active: subscribers.filter((s) => s.isActive !== false).length,
        inactive: subscribers.filter((s) => s.isActive === false).length,
      });
    }
  }, [subscribers]);

  const handleExportCSV = async () => {
    try {
      const headers = ['Email', 'Name', 'Source', 'Status', 'Subscribed Date'];
      const rows = subscribers.map((s) => [s.email, s.name || '', s.source || '', s.isActive !== false ? 'Active' : 'Inactive', formatDate(s.createdAt)]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'newsletter-subscribers.csv';
      a.click();
      toast.success('CSV exported');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleDelete = async (subscriber) => {
    try {
      await adminService.deleteSubscriber?.(subscriber._id);
      toast.success('Subscriber deleted');
      fetchSubscribers();
    } catch (error) {
      toast.error('Failed to delete subscriber');
    }
  };

  const handleToggleStatus = async (subscriber) => {
    try {
      await adminService.toggleSubscriberStatus?.(subscriber._id);
      toast.success('Status toggled');
      fetchSubscribers();
    } catch (error) {
      toast.error('Failed to toggle status');
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    try {
      await Promise.all(selected.map((id) => adminService.deleteSubscriber?.(id)));
      toast.success(`${selected.length} subscribers deleted`);
      setSelected([]);
      fetchSubscribers();
    } catch (error) {
      toast.error('Bulk delete failed');
    }
  };

  const toggleSelectAll = () => {
    if (selected.length === subscribers.length) setSelected([]);
    else setSelected(subscribers.map((s) => s._id));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const statCards = [
    { label: 'Total Subscribers', value: stats.total, color: 'from-indigo-500 to-purple-600', icon: Users },
    { label: 'Active', value: stats.active, color: 'from-emerald-500 to-teal-600', icon: UserCheck },
    { label: 'Inactive', value: stats.inactive, color: 'from-gray-500 to-gray-600', icon: UserX },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Newsletter</h1>
          <p className="text-gray-400 mt-1">Manage email subscribers</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={i} variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{card.value ?? 0}</p>
                <p className="text-xs text-gray-400">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search by email or name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </motion.div>

      {selected.length > 0 && (
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{selected.length} selected</span>
          <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">Delete Selected</button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left"><input type="checkbox" checked={selected.length === subscribers.length && subscribers.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500" /></th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Email</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Name</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Source</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Subscribed</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={7} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : subscribers.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No subscribers found</td></tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4"><input type="checkbox" checked={selected.includes(sub._id)} onChange={() => toggleSelect(sub._id)} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500" /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-white text-sm">{sub.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{sub.name || '—'}</td>
                    <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">{sub.source || 'website'}</span></td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {sub.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{formatDate(sub.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleToggleStatus(sub)} title="Toggle Status"
                          className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                          {sub.isActive !== false ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(sub)} title="Delete"
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
    </motion.div>
  );
}
