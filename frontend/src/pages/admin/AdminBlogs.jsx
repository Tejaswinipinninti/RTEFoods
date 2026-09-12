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
  Eye,
  Image as ImageIcon,
  FileText,
  Tag,
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

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const Modal = ({ isOpen, onClose, title, children, wide }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`w-full ${wide ? 'max-w-4xl' : 'max-w-2xl'} bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
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

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: { status: 'draft' },
  });

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBlogs({ page, search, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setBlogs(data?.blogs || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, [page, search]);

  const openAddModal = () => {
    setEditingBlog(null);
    reset({ title: '', content: '', excerpt: '', category: '', tags: '', status: 'draft', seoTitle: '', seoDescription: '' });
    setShowModal(true);
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    reset({
      title: blog.title, content: blog.content || '', excerpt: blog.excerpt || '',
      category: blog.category || '', tags: blog.tags?.join(', ') || '',
      status: blog.status || 'draft', seoTitle: blog.seo?.title || '', seoDescription: blog.seo?.description || '',
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
        seo: { title: data.seoTitle, description: data.seoDescription },
      };
      delete payload.seoTitle;
      delete payload.seoDescription;
      if (editingBlog) {
        await adminService.updateBlog(editingBlog._id, payload);
        toast.success('Blog updated');
      } else {
        await adminService.createBlog(payload);
        toast.success('Blog created');
      }
      setShowModal(false);
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteBlog(deleteModal._id);
      toast.success('Blog deleted');
      setDeleteModal(null);
      fetchBlogs();
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const statusColors = {
    draft: 'bg-amber-500/20 text-amber-400',
    published: 'bg-emerald-500/20 text-emerald-400',
    archived: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Blogs</h1>
          <p className="text-gray-400 mt-1">Manage blog posts and articles</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
          <Plus className="w-5 h-5" /> Add Blog
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search blogs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-sm font-medium text-gray-400">Image</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Title</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Category</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Author</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Views</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={8} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : blogs.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No blogs found</td></tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      {blog.image ? (
                        <img src={blog.image} alt="" className="w-14 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-white/10 flex items-center justify-center"><FileText className="w-4 h-4 text-gray-500" /></div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-white font-medium text-sm max-w-[200px] truncate">{blog.title}</p>
                    </td>
                    <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">{blog.category || '—'}</span></td>
                    <td className="p-4 text-gray-400 text-sm">{blog.author?.name || 'Admin'}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[blog.status] || 'bg-gray-500/20 text-gray-400'}`}>{blog.status}</span></td>
                    <td className="p-4 text-gray-400 text-sm">{blog.views ?? 0}</td>
                    <td className="p-4 text-gray-400 text-sm">{formatDate(blog.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(blog)} className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteModal(blog)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBlog ? 'Edit Blog' : 'Add Blog'} wide>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title *" error={errors.title?.message} {...register('title')} placeholder="Blog title" />
          <Textarea label="Content *" rows={10} error={errors.content?.message} {...register('content')} placeholder="Write your blog content here..." />
          <Textarea label="Excerpt" rows={3} {...register('excerpt')} placeholder="Short excerpt for previews" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category *" error={errors.category?.message} {...register('category')} placeholder="e.g. Food, Recipes" />
            <Input label="Tags (comma separated)" {...register('tags')} placeholder="tag1, tag2, tag3" />
          </div>
          <Select label="Status" {...register('status')}
            options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }]} />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Featured Image</label>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setValue('image', e.target.files); }}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:cursor-pointer" />
          </div>
          <div className="border-t border-white/10 pt-5">
            <h4 className="text-sm font-medium text-gray-300 mb-3">SEO</h4>
            <div className="space-y-3">
              <Input label="Meta Title" {...register('seoTitle')} placeholder="SEO title" />
              <Textarea label="Meta Description" rows={2} {...register('seoDescription')} placeholder="SEO description" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingBlog ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Blog">
        <p className="text-gray-300 mb-6">Are you sure you want to delete <span className="text-white font-medium">{deleteModal?.title}</span>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </motion.div>
  );
}
