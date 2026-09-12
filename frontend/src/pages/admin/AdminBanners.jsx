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
  LayoutGrid,
  List,
  Image as ImageIcon,
  GripVertical,
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

const bannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  link: z.string().optional(),
  type: z.enum(['homepage', 'category', 'offer', 'popup', 'carousel'], { required_error: 'Type is required' }),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  sortOrder: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [imagePreview, setImagePreview] = useState(null);
  const [mobileImagePreview, setMobileImagePreview] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(bannerSchema),
    defaultValues: { type: 'homepage', sortOrder: 0, isActive: true },
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBanners({ page, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setBanners(data?.banners || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, [page]);

  const openAddModal = () => {
    setEditingBanner(null);
    reset({ title: '', subtitle: '', link: '', type: 'homepage', buttonText: '', buttonLink: '', sortOrder: 0, startDate: '', endDate: '', isActive: true });
    setImagePreview(null);
    setMobileImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    reset({
      title: banner.title, subtitle: banner.subtitle || '', link: banner.link || '',
      type: banner.type, buttonText: banner.buttonText || '', buttonLink: banner.buttonLink || '',
      sortOrder: banner.sortOrder || 0, startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '', isActive: banner.isActive ?? true,
    });
    setImagePreview(banner.image || null);
    setMobileImagePreview(banner.mobileImage || null);
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'image' && key !== 'mobileImage') {
          formData.append(key, value);
        }
      });
      if (editingBanner) {
        await adminService.updateBanner(editingBanner._id, formData);
        toast.success('Banner updated');
      } else {
        await adminService.createBanner(formData);
        toast.success('Banner created');
      }
      setShowModal(false);
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteBanner(deleteModal._id);
      toast.success('Banner deleted');
      setDeleteModal(null);
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const typeColors = {
    homepage: 'bg-blue-500/20 text-blue-400',
    category: 'bg-emerald-500/20 text-emerald-400',
    offer: 'bg-amber-500/20 text-amber-400',
    popup: 'bg-purple-500/20 text-purple-400',
    carousel: 'bg-pink-500/20 text-pink-400',
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Banners</h1>
          <p className="text-gray-400 mt-1">Manage homepage and promotional banners</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('table')} className={`p-2.5 transition-colors ${viewMode === 'table' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}><LayoutGrid className="w-4 h-4" /></button>
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
            <Plus className="w-5 h-5" /> Add Banner
          </button>
        </div>
      </motion.div>

      {viewMode === 'table' ? (
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Image</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Title</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Type</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Sort</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Dates</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-white/5"><td colSpan={7} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                  ))
                ) : banners.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500">No banners found</td></tr>
                ) : (
                  banners.map((banner) => (
                    <tr key={banner._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        {banner.image ? (
                          <img src={banner.image} alt="" className="w-20 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-20 h-12 rounded-lg bg-white/10 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-500" /></div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium text-sm">{banner.title}</p>
                        {banner.subtitle && <p className="text-gray-500 text-xs">{banner.subtitle}</p>}
                      </td>
                      <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${typeColors[banner.type] || 'bg-gray-500/20 text-gray-400'}`}>{banner.type}</span></td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${banner.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{banner.sortOrder ?? 0}</td>
                      <td className="p-4 text-gray-400 text-xs">
                        {banner.startDate ? formatDate(banner.startDate) : '—'}<br />
                        {banner.endDate ? formatDate(banner.endDate) : '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditModal(banner)} className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteModal(banner)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)
          ) : banners.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">No banners found</p>
          ) : (
            banners.map((banner) => (
              <motion.div key={banner._id} variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group hover:border-indigo-500/30 transition-all">
                <div className="relative h-40 bg-white/5">
                  {banner.image ? <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-gray-600" /></div>}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(banner)} className="p-1.5 bg-black/60 rounded-lg text-white hover:bg-indigo-500"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteModal(banner)} className="p-1.5 bg-black/60 rounded-lg text-white hover:bg-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[banner.type] || ''}`}>{banner.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${banner.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>{banner.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium">{banner.title}</h3>
                  {banner.subtitle && <p className="text-gray-500 text-sm mt-1">{banner.subtitle}</p>}
                  <p className="text-gray-500 text-xs mt-2">Sort: {banner.sortOrder ?? 0}</p>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBanner ? 'Edit Banner' : 'Add Banner'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title *" error={errors.title?.message} {...register('title')} placeholder="Banner title" />
          <Input label="Subtitle" {...register('subtitle')} placeholder="Subtitle" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type *" error={errors.type?.message} {...register('type')}
              options={[{ value: 'homepage', label: 'Homepage' }, { value: 'category', label: 'Category' }, { value: 'offer', label: 'Offer' }, { value: 'popup', label: 'Popup' }, { value: 'carousel', label: 'Carousel' }]} />
            <Input label="Sort Order" type="number" {...register('sortOrder', { valueAsNumber: true })} />
          </div>
          <Input label="Link" {...register('link')} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Button Text" {...register('buttonText')} placeholder="Shop Now" />
            <Input label="Button Link" {...register('buttonLink')} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Image</label>
              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) { setImagePreview(URL.createObjectURL(e.target.files[0])); } }}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:cursor-pointer" />
              {imagePreview && <img src={imagePreview} alt="" className="mt-2 w-full h-24 rounded-xl object-cover" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Mobile Image</label>
              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) { setMobileImagePreview(URL.createObjectURL(e.target.files[0])); } }}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:cursor-pointer" />
              {mobileImagePreview && <img src={mobileImagePreview} alt="" className="mt-2 w-full h-24 rounded-xl object-cover" />}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" {...register('startDate')} />
            <Input label="End Date" type="date" {...register('endDate')} />
          </div>
          <Toggle label="Active" checked={watch('isActive')} onChange={(v) => setValue('isActive', v)} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingBanner ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Banner">
        <p className="text-gray-300 mb-6">Are you sure you want to delete banner <span className="text-white font-medium">{deleteModal?.title}</span>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </motion.div>
  );
}
