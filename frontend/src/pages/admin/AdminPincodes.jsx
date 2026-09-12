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
  Upload,
  MapPin,
  Truck,
  Download,
  Trash,
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

const pincodeSchema = z.object({
  pincode: z.string().min(1, 'Pincode is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zone: z.string().optional(),
  deliveryCharge: z.number().min(0).optional(),
  freeDeliveryAbove: z.number().min(0).optional().nullable(),
  minOrderAmount: z.number().min(0).optional().nullable(),
  estimatedDays: z.number().min(0).optional(),
  isCodAvailable: z.boolean().optional(),
  isExpressDelivery: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

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

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-white/10'}`}>
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
    <span className="text-sm text-gray-300">{label}</span>
  </label>
);

export default function AdminPincodes() {
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPincode, setEditingPincode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [bulkImportModal, setBulkImportModal] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(pincodeSchema),
    defaultValues: { isCodAvailable: true, isExpressDelivery: false, isActive: true },
  });

  const fetchPincodes = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPincodes({ page, search, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setPincodes(data?.pincodes || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch pincodes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPincodes(); }, [page, search]);

  const openAddModal = () => {
    setEditingPincode(null);
    reset({ pincode: '', city: '', state: '', zone: '', deliveryCharge: 0, freeDeliveryAbove: null, minOrderAmount: null, estimatedDays: 3, isCodAvailable: true, isExpressDelivery: false, isActive: true });
    setShowModal(true);
  };

  const openEditModal = (pincode) => {
    setEditingPincode(pincode);
    reset({
      pincode: pincode.pincode, city: pincode.city, state: pincode.state, zone: pincode.zone || '',
      deliveryCharge: pincode.deliveryCharge || 0, freeDeliveryAbove: pincode.freeDeliveryAbove || null,
      minOrderAmount: pincode.minOrderAmount || null, estimatedDays: pincode.estimatedDays || 3,
      isCodAvailable: pincode.isCodAvailable ?? true, isExpressDelivery: pincode.isExpressDelivery ?? false,
      isActive: pincode.isActive ?? true,
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        deliveryCharge: Number(data.deliveryCharge),
        freeDeliveryAbove: data.freeDeliveryAbove ? Number(data.freeDeliveryAbove) : null,
        minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : null,
        estimatedDays: Number(data.estimatedDays),
      };
      if (editingPincode) {
        await adminService.updatePincode?.(editingPincode._id, payload);
        toast.success('Pincode updated');
      } else {
        await adminService.createPincode?.(payload);
        toast.success('Pincode created');
      }
      setShowModal(false);
      fetchPincodes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deletePincode?.(deleteModal._id);
      toast.success('Pincode deleted');
      setDeleteModal(null);
      fetchPincodes();
    } catch (error) {
      toast.error('Failed to delete pincode');
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    try {
      await Promise.all(selected.map((id) => adminService.deletePincode?.(id)));
      toast.success(`${selected.length} pincodes deleted`);
      setSelected([]);
      fetchPincodes();
    } catch (error) {
      toast.error('Bulk delete failed');
    }
  };

  const handleBulkImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(Boolean);
      const pincodes = lines.slice(1).map((line) => {
        const [pincode, city, state] = line.split(',').map((s) => s.trim());
        return { pincode, city, state };
      }).filter((p) => p.pincode && p.city);
      await adminService.importPincodes?.(pincodes);
      toast.success(`${pincodes.length} pincodes imported`);
      setBulkImportModal(false);
      fetchPincodes();
    } catch (error) {
      toast.error('Import failed');
    }
  };

  const toggleSelectAll = () => {
    if (selected.length === pincodes.length) setSelected([]);
    else setSelected(pincodes.map((p) => p._id));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pincodes</h1>
          <p className="text-gray-400 mt-1">Manage delivery pincodes and charges</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setBulkImportModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-colors">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
            <Plus className="w-5 h-5" /> Add Pincode
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search by pincode, city, or state..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                <th className="p-4 text-left"><input type="checkbox" checked={selected.length === pincodes.length && pincodes.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500" /></th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Pincode</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">City</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">State</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Zone</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Delivery Charge</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Est. Days</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">COD</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={10} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : pincodes.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-gray-500">No pincodes found</td></tr>
              ) : (
                pincodes.map((pin) => (
                  <tr key={pin._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4"><input type="checkbox" checked={selected.includes(pin._id)} onChange={() => toggleSelect(pin._id)} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500" /></td>
                    <td className="p-4 text-indigo-400 font-mono font-medium text-sm">{pin.pincode}</td>
                    <td className="p-4 text-white text-sm">{pin.city}</td>
                    <td className="p-4 text-gray-400 text-sm">{pin.state}</td>
                    <td className="p-4 text-gray-400 text-sm">{pin.zone || '—'}</td>
                    <td className="p-4 text-white text-sm">{pin.deliveryCharge > 0 ? `₹${pin.deliveryCharge}` : 'Free'}</td>
                    <td className="p-4 text-gray-400 text-sm">{pin.estimatedDays || '—'} days</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pin.isCodAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {pin.isCodAvailable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${pin.isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {pin.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(pin)} className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteModal(pin)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPincode ? 'Edit Pincode' : 'Add Pincode'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Pincode *" error={errors.pincode?.message} {...register('pincode')} placeholder="e.g. 400001" />
            <Input label="City *" error={errors.city?.message} {...register('city')} placeholder="City name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="State *" error={errors.state?.message} {...register('state')} placeholder="State name" />
            <Input label="Zone" {...register('zone')} placeholder="e.g. North, South" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Delivery Charge (₹)" type="number" step="0.01" {...register('deliveryCharge', { valueAsNumber: true })} />
            <Input label="Free Delivery Above (₹)" type="number" step="0.01" {...register('freeDeliveryAbove', { valueAsNumber: true })} />
            <Input label="Min Order Amount (₹)" type="number" step="0.01" {...register('minOrderAmount', { valueAsNumber: true })} />
          </div>
          <Input label="Estimated Days" type="number" {...register('estimatedDays', { valueAsNumber: true })} />
          <div className="grid grid-cols-3 gap-4">
            <Toggle label="COD Available" checked={watch('isCodAvailable')} onChange={(v) => setValue('isCodAvailable', v)} />
            <Toggle label="Express Delivery" checked={watch('isExpressDelivery')} onChange={(v) => setValue('isExpressDelivery', v)} />
            <Toggle label="Active" checked={watch('isActive')} onChange={(v) => setValue('isActive', v)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingPincode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Pincode">
        <p className="text-gray-300 mb-6">Are you sure you want to delete pincode <span className="text-white font-mono font-bold">{deleteModal?.pincode}</span>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>

      <Modal isOpen={bulkImportModal} onClose={() => setBulkImportModal(false)} title="Bulk Import Pincodes">
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">Upload a CSV file with columns: <span className="text-white font-mono">pincode, city, state</span></p>
          <input type="file" accept=".csv" onChange={handleBulkImport}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:cursor-pointer" />
          <div className="flex justify-end gap-3">
            <button onClick={() => setBulkImportModal(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
