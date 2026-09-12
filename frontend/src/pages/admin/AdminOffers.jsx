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
  Tag,
  Percent,
  Zap,
  Gift,
  Star,
  Sun,
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

const offerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['festival', 'combo', 'flash_sale', 'bogo', 'featured', 'seasonal'], { required_error: 'Type is required' }),
  discountType: z.enum(['percentage', 'flat'], { required_error: 'Discount type is required' }),
  discountValue: z.number().min(0, 'Discount value is required'),
  minOrderAmount: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().min(0).optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  applicableProducts: z.string().optional(),
  applicableCategories: z.string().optional(),
  couponCode: z.string().optional(),
  termsAndConditions: z.string().optional(),
  isActive: z.boolean().optional(),
});

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-white/10'}`}>
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
    <span className="text-sm text-gray-300">{label}</span>
  </label>
);

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: { discountType: 'percentage', isActive: true },
  });

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOffers({ page, search, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setOffers(data?.offers || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffers(); }, [page, search]);

  const openAddModal = () => {
    setEditingOffer(null);
    reset({ title: '', description: '', type: 'festival', discountType: 'percentage', discountValue: 0, minOrderAmount: null, maxDiscount: null, startDate: '', endDate: '', startTime: '', endTime: '', applicableProducts: '', applicableCategories: '', couponCode: '', termsAndConditions: '', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    reset({
      title: offer.title, description: offer.description || '', type: offer.type,
      discountType: offer.discountType, discountValue: offer.discountValue || 0,
      minOrderAmount: offer.minOrderAmount || null, maxDiscount: offer.maxDiscount || null,
      startDate: offer.startDate ? offer.startDate.split('T')[0] : '',
      endDate: offer.endDate ? offer.endDate.split('T')[0] : '',
      startTime: offer.startTime || '', endTime: offer.endTime || '',
      applicableProducts: offer.applicableProducts?.join(', ') || '',
      applicableCategories: offer.applicableCategories?.join(', ') || '',
      couponCode: offer.couponCode || '', termsAndConditions: offer.termsAndConditions || '',
      isActive: offer.isActive ?? true,
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        discountValue: Number(data.discountValue),
        minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : null,
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
        applicableProducts: data.applicableProducts ? data.applicableProducts.split(',').map((s) => s.trim()).filter(Boolean) : [],
        applicableCategories: data.applicableCategories ? data.applicableCategories.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (editingOffer) {
        await adminService.updateOffer(editingOffer._id, payload);
        toast.success('Offer updated');
      } else {
        await adminService.createOffer(payload);
        toast.success('Offer created');
      }
      setShowModal(false);
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteOffer(deleteModal._id);
      toast.success('Offer deleted');
      setDeleteModal(null);
      fetchOffers();
    } catch (error) {
      toast.error('Failed to delete offer');
    }
  };

  const typeIcons = { festival: Gift, combo: Tag, flash_sale: Zap, bogo: Gift, featured: Star, seasonal: Sun };
  const typeColors = {
    festival: 'bg-red-500/20 text-red-400',
    combo: 'bg-blue-500/20 text-blue-400',
    flash_sale: 'bg-amber-500/20 text-amber-400',
    bogo: 'bg-purple-500/20 text-purple-400',
    featured: 'bg-pink-500/20 text-pink-400',
    seasonal: 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Offers</h1>
          <p className="text-gray-400 mt-1">Manage promotional offers and deals</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
          <Plus className="w-5 h-5" /> Add Offer
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search offers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-sm font-medium text-gray-400">Title</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Type</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Discount</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Date Range</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={6} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : offers.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No offers found</td></tr>
              ) : (
                offers.map((offer) => {
                  const Icon = typeIcons[offer.type] || Tag;
                  const isActive = offer.startDate && offer.endDate
                    ? new Date(offer.startDate) <= new Date() && new Date(offer.endDate) >= new Date()
                    : offer.isActive;
                  return (
                    <tr key={offer._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <p className="text-white font-medium text-sm">{offer.title}</p>
                        {offer.couponCode && <p className="text-indigo-400 text-xs font-mono mt-0.5">{offer.couponCode}</p>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${typeColors[offer.type] || 'bg-gray-500/20 text-gray-400'}`}>{offer.type?.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="p-4 text-white text-sm">
                        {offer.discountType === 'percentage' ? `${offer.discountValue}%` : formatPrice(offer.discountValue)}
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {offer.startDate ? formatDate(offer.startDate) : '—'}<br />
                        {offer.endDate ? formatDate(offer.endDate) : '—'}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditModal(offer)} className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteModal(offer)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingOffer ? 'Edit Offer' : 'Add Offer'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title *" error={errors.title?.message} {...register('title')} placeholder="Offer title" />
          <Textarea label="Description" rows={2} {...register('description')} placeholder="Offer description" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type *" error={errors.type?.message} {...register('type')}
              options={[{ value: 'festival', label: 'Festival' }, { value: 'combo', label: 'Combo' }, { value: 'flash_sale', label: 'Flash Sale' }, { value: 'bogo', label: 'BOGO' }, { value: 'featured', label: 'Featured' }, { value: 'seasonal', label: 'Seasonal' }]} />
            <Select label="Discount Type *" error={errors.discountType?.message} {...register('discountType')}
              options={[{ value: 'percentage', label: 'Percentage' }, { value: 'flat', label: 'Flat Amount' }]} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Discount Value *" type="number" step="0.01" error={errors.discountValue?.message} {...register('discountValue', { valueAsNumber: true })} />
            <Input label="Min Order Amount" type="number" step="0.01" {...register('minOrderAmount', { valueAsNumber: true })} />
            <Input label="Max Discount" type="number" step="0.01" {...register('maxDiscount', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" {...register('startDate')} />
            <Input label="End Date" type="date" {...register('endDate')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" {...register('startTime')} />
            <Input label="End Time" type="time" {...register('endTime')} />
          </div>
          <Input label="Applicable Products (comma separated IDs)" {...register('applicableProducts')} placeholder="prod1, prod2" />
          <Input label="Applicable Categories (comma separated)" {...register('applicableCategories')} placeholder="cat1, cat2" />
          <Input label="Coupon Code" {...register('couponCode')} placeholder="e.g. FEST50" />
          <Textarea label="Terms & Conditions" rows={3} {...register('termsAndConditions')} placeholder="Terms and conditions..." />
          <Toggle label="Active" checked={watch('isActive')} onChange={(v) => setValue('isActive', v)} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingOffer ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Offer">
        <p className="text-gray-300 mb-6">Are you sure you want to delete <span className="text-white font-medium">{deleteModal?.title}</span>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </motion.div>
  );
}
