import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  HelpCircle,
  GripVertical,
  Eye,
  ThumbsUp,
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

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().min(1, 'Category is required'),
  isActive: z.boolean().optional(),
  sortOrder: z.number().min(0).optional(),
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

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: { isActive: true, sortOrder: 0 },
  });

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getFAQs({ page, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setFaqs(data?.faqs || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFAQs(); }, [page]);

  const openAddModal = () => {
    setEditingFaq(null);
    reset({ question: '', answer: '', category: 'General', isActive: true, sortOrder: 0 });
    setShowModal(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    reset({ question: faq.question, answer: faq.answer, category: faq.category || 'General', isActive: faq.isActive ?? true, sortOrder: faq.sortOrder || 0 });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const payload = { ...data, sortOrder: Number(data.sortOrder) };
      if (editingFaq) {
        await adminService.updateFAQ(editingFaq._id, payload);
        toast.success('FAQ updated');
      } else {
        await adminService.createFAQ(payload);
        toast.success('FAQ created');
      }
      setShowModal(false);
      fetchFAQs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteFAQ(deleteModal._id);
      toast.success('FAQ deleted');
      setDeleteModal(null);
      fetchFAQs();
    } catch (error) {
      toast.error('Failed to delete FAQ');
    }
  };

  const handleMoveUp = async (faq, index) => {
    if (index === 0) return;
    try {
      const newOrder = faq.sortOrder || index;
      await adminService.updateFAQ(faq._id, { sortOrder: newOrder - 1 });
      fetchFAQs();
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  const handleMoveDown = async (faq, index) => {
    try {
      const newOrder = faq.sortOrder ?? index;
      await adminService.updateFAQ(faq._id, { sortOrder: newOrder + 1 });
      fetchFAQs();
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  const categoryColors = {
    General: 'bg-blue-500/20 text-blue-400',
    Ordering: 'bg-emerald-500/20 text-emerald-400',
    Payment: 'bg-amber-500/20 text-amber-400',
    Delivery: 'bg-purple-500/20 text-purple-400',
    Returns: 'bg-red-500/20 text-red-400',
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">FAQs</h1>
          <p className="text-gray-400 mt-1">Manage frequently asked questions</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
          <Plus className="w-5 h-5" /> Add FAQ
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-sm font-medium text-gray-400 w-12"></th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Question</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Answer</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Category</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Views</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Helpful</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={8} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : faqs.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No FAQs found</td></tr>
              ) : (
                faqs.map((faq, index) => (
                  <tr key={faq._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => handleMoveUp(faq, index)} disabled={index === 0} className="text-gray-500 hover:text-white disabled:opacity-30"><GripVertical className="w-3 h-3 rotate-180" /></button>
                        <button onClick={() => handleMoveDown(faq, index)} className="text-gray-500 hover:text-white"><GripVertical className="w-3 h-3" /></button>
                      </div>
                    </td>
                    <td className="p-4 text-white text-sm font-medium max-w-[250px] truncate">{faq.question}</td>
                    <td className="p-4 text-gray-400 text-sm max-w-[250px] truncate">{faq.answer}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[faq.category] || 'bg-gray-500/20 text-gray-400'}`}>{faq.category || 'General'}</span></td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${faq.isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {faq.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{faq.views ?? 0}</td>
                    <td className="p-4 text-gray-400 text-sm">{faq.helpful ?? 0}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(faq)} className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteModal(faq)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingFaq ? 'Edit FAQ' : 'Add FAQ'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Question *" error={errors.question?.message} {...register('question')} placeholder="Enter the question" />
          <Textarea label="Answer *" rows={6} error={errors.answer?.message} {...register('answer')} placeholder="Enter the answer" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category *" error={errors.category?.message} {...register('category')}
              options={[{ value: 'General', label: 'General' }, { value: 'Ordering', label: 'Ordering' }, { value: 'Payment', label: 'Payment' }, { value: 'Delivery', label: 'Delivery' }, { value: 'Returns', label: 'Returns' }]} />
            <Input label="Sort Order" type="number" {...register('sortOrder', { valueAsNumber: true })} />
          </div>
          <Toggle label="Active" checked={watch('isActive')} onChange={(v) => setValue('isActive', v)} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingFaq ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete FAQ">
        <p className="text-gray-300 mb-6">Are you sure you want to delete this FAQ?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </motion.div>
  );
}
