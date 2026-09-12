import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Ticket,
  Tag,
  Percent,
  Truck,
  Copy,
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

const couponSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  type: z.enum(['percentage', 'flat', 'free_shipping'], { required_error: 'Type is required' }),
  value: z.number().min(0, 'Value is required'),
  maxDiscount: z.number().min(0).optional().nullable(),
  minOrderAmount: z.number().min(0).optional().nullable(),
  usageLimit: z.number().min(0).optional().nullable(),
  perUserLimit: z.number().min(0).optional().nullable(),
  startDate: z.string().optional(),
  expiryDate: z.string().optional(),
  applicableCategories: z.string().optional(),
  isActive: z.boolean().optional(),
});

const Modal = ({ isOpen, onClose, title, children }) => (
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
          className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
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

const Input = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
    <input {...props} className={`w-full px-4 py-2.5 bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`} />
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

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-white/10'}`}>
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
    <span className="text-sm text-gray-300">{label}</span>
  </label>
);

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: { isActive: true },
  });

  const watchType = watch('type');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCoupons({ page, search, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setCoupons(data?.coupons || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, [page, search]);

  const openAddModal = () => {
    setEditingCoupon(null);
    reset({ code: '', type: 'percentage', value: 0, maxDiscount: null, minOrderAmount: null, usageLimit: null, perUserLimit: null, startDate: '', expiryDate: '', applicableCategories: '', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    reset({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value || 0,
      maxDiscount: coupon.maxDiscount || null,
      minOrderAmount: coupon.minOrderAmount || null,
      usageLimit: coupon.usageLimit || null,
      perUserLimit: coupon.perUserLimit || null,
      startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
      applicableCategories: coupon.applicableCategories?.join(', ') || '',
      isActive: coupon.isActive ?? true,
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        value: Number(data.value),
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
        minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : null,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
        perUserLimit: data.perUserLimit ? Number(data.perUserLimit) : null,
        applicableCategories: data.applicableCategories ? data.applicableCategories.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon._id, payload);
        toast.success('Coupon updated');
      } else {
        await adminService.createCoupon(payload);
        toast.success('Coupon created');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteCoupon(deleteModal._id);
      toast.success('Coupon deleted');
      setDeleteModal(null);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await adminService.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      toast.success(coupon.isActive ? 'Coupon deactivated' : 'Coupon activated');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to toggle status');
    }
  };

  const typeIcon = { percentage: Percent, flat: Tag, free_shipping: Truck };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-gray-400 mt-1">Manage discount coupons and promotions</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
          <Plus className="w-5 h-5" /> Add Coupon
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search by coupon code..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-sm font-medium text-gray-400">Code</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Type</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Value</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Min Order</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Usage</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Expiry</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={8} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : coupons.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No coupons found</td></tr>
              ) : (
                coupons.map((coupon) => {
                  const Icon = typeIcon[coupon.type] || Tag;
                  const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                  return (
                    <tr key={coupon._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-400 font-mono font-bold text-sm">{coupon.code}</span>
                          <button onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success('Copied!'); }}
                            className="text-gray-500 hover:text-gray-300"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm capitalize">{coupon.type?.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="p-4 text-white text-sm">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : coupon.type === 'flat' ? formatPrice(coupon.value) : 'Free'}
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : '—'}</td>
                      <td className="p-4 text-gray-400 text-sm">{coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</td>
                      <td className="p-4 text-gray-400 text-sm">{coupon.expiryDate ? formatDate(coupon.expiryDate) : '—'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isExpired ? 'bg-red-500/20 text-red-400' :
                          coupon.isActive ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditModal(coupon)} className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleToggleStatus(coupon)} className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                            {coupon.isActive ? <X className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setDeleteModal(coupon)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Coupon Code *" error={errors.code?.message} {...register('code')} placeholder="e.g. SAVE20" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type *" error={errors.type?.message} {...register('type')}
              options={[{ value: 'percentage', label: 'Percentage' }, { value: 'flat', label: 'Flat Amount' }, { value: 'free_shipping', label: 'Free Shipping' }]} />
            <Input label="Value *" type="number" step="0.01" error={errors.value?.message} {...register('value', { valueAsNumber: true })} />
          </div>
          {watchType === 'percentage' && (
            <Input label="Max Discount Amount" type="number" step="0.01" {...register('maxDiscount', { valueAsNumber: true })} />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Order Amount" type="number" step="0.01" {...register('minOrderAmount', { valueAsNumber: true })} />
            <Input label="Usage Limit" type="number" {...register('usageLimit', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Per User Limit" type="number" {...register('perUserLimit', { valueAsNumber: true })} />
            <div />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" {...register('startDate')} />
            <Input label="Expiry Date" type="date" {...register('expiryDate')} />
          </div>
          <Input label="Applicable Categories (comma separated)" {...register('applicableCategories')} placeholder="e.g. cat1, cat2" />
          <Toggle label="Active" checked={watch('isActive')} onChange={(v) => setValue('isActive', v)} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingCoupon ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Coupon">
        <p className="text-gray-300 mb-6">Are you sure you want to delete coupon <span className="text-white font-mono font-bold">{deleteModal?.code}</span>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </motion.div>
  );
}
