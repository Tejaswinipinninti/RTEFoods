import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const subcategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  sortOrder: z.number().min(0).optional(),
});

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
          <div className="flex items-center justify-between p-6 border-b border-white/10">
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

export default function AdminSubcategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subcategorySchema),
    defaultValues: { status: 'active', sortOrder: 0, category: '' },
  });

  const selectedCategory = watch('category');

  const fetchCategories = async () => {
    try {
      const res = await adminService.getCategories({ limit: 100 });
      const d = res.data;
      const data = d?.data || d;
      setCategories(data?.categories || data?.data || (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSubcategories({ page, search, category: filterCategory, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setSubcategories(data?.subcategories || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch subcategories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubcategories();
  }, [page, search, filterCategory]);

  const openAddModal = () => {
    setEditingSub(null);
    reset({ name: '', category: '', description: '', status: 'active', sortOrder: 0 });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (sub) => {
    setEditingSub(sub);
    reset({
      name: sub.name,
      category: sub.category?._id || sub.category,
      description: sub.description || '',
      status: sub.status,
      sortOrder: sub.sortOrder || 0,
    });
    setImagePreview(sub.image);
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image' && value?.[0]) {
          formData.append('image', value[0]);
        } else {
          formData.append(key, value);
        }
      });

      if (editingSub) {
        await adminService.updateSubcategory(editingSub._id, formData);
        toast.success('Subcategory updated successfully');
      } else {
        await adminService.createSubcategory(formData);
        toast.success('Subcategory created successfully');
      }
      setShowModal(false);
      fetchSubcategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteSubcategory(deleteModal._id);
      toast.success('Subcategory deleted successfully');
      setDeleteModal(null);
      fetchSubcategories();
    } catch (error) {
      toast.error('Failed to delete subcategory');
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    try {
      await adminService.bulkDeleteSubcategories(selected);
      toast.success(`${selected.length} subcategories deleted`);
      setSelected([]);
      fetchSubcategories();
    } catch (error) {
      toast.error('Bulk delete failed');
    }
  };

  const handleStatusToggle = async (sub) => {
    try {
      await adminService.updateSubcategory(sub._id, { status: sub.status === 'active' ? 'inactive' : 'active' });
      toast.success('Status updated');
      fetchSubcategories();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const toggleSelectAll = () => {
    if (selected.length === subcategories.length) {
      setSelected([]);
    } else {
      setSelected(subcategories.map((s) => s._id));
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Subcategories</h1>
          <p className="text-gray-400 mt-1">Manage your product subcategories</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-5 h-5" /> Add Subcategory
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search subcategories..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        {selected.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete ({selected.length})
          </button>
        )}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === subcategories.length && subcategories.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Image</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Name</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Category</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Slug</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Products</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Sort</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={10} className="p-4"><div className="h-10 bg-white/5 rounded-xl animate-pulse" /></td>
                  </tr>
                ))
              ) : subcategories.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">No subcategories found</td>
                </tr>
              ) : (
                subcategories.map((sub) => (
                  <tr key={sub._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(sub._id)}
                        onChange={() => toggleSelect(sub._id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-4">
                      {sub.image ? (
                        <img src={sub.image} alt={sub.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-white font-medium">{sub.name}</td>
                    <td className="p-4 text-gray-400 text-sm">{sub.category?.name || '—'}</td>
                    <td className="p-4 text-gray-400 text-sm">{sub.slug}</td>
                    <td className="p-4 text-gray-400 text-sm">{sub.productCount || 0}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleStatusToggle(sub)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          sub.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {sub.status}
                      </button>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{sub.sortOrder || 0}</td>
                    <td className="p-4 text-gray-400 text-sm">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(sub)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
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
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSub ? 'Edit Subcategory' : 'Add Subcategory'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Category *</label>
            <select
              {...register('category')}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name *</label>
            <input
              {...register('name')}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Subcategory name"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Subcategory description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImagePreview(URL.createObjectURL(file));
                  setValue('image', e.target.files);
                }
              }}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:cursor-pointer"
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-3 w-20 h-20 rounded-xl object-cover" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Sort Order</label>
              <input
                type="number"
                {...register('sortOrder', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingSub ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Subcategory">
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete <span className="text-white font-medium">{deleteModal?.name}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModal(null)}
            className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
