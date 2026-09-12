import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
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
  Copy,
  Download,
  Upload,
  Image as ImageIcon,
  Leaf,
  Star,
  Flame,
  Tag,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  ingredients: z.string().optional(),
  cookingInstructions: z.string().optional(),
  shelfLife: z.string().optional(),
  weight: z.string().optional(),
  servingSize: z.string().optional(),
  price: z.number().min(0, 'Price is required'),
  mrp: z.number().min(0).optional(),
  stockQuantity: z.number().min(0).optional(),
  lowStockLimit: z.number().min(0).optional(),
  isVeg: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTodaysSpecial: z.boolean().optional(),
  isCombo: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'draft']),
  tags: z.string().optional(),
  nutrition: z.object({
    servingSize: z.string().optional(),
    calories: z.number().optional(),
    protein: z.number().optional(),
    fat: z.number().optional(),
    carbs: z.number().optional(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    sodium: z.number().optional(),
  }).optional(),
  variants: z.array(z.object({
    name: z.string().optional(),
    weight: z.string().optional(),
    price: z.number().optional(),
    mrp: z.number().optional(),
    sku: z.string().optional(),
    stock: z.number().optional(),
  })).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

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
          className={`w-full ${wide ? 'max-w-5xl' : 'max-w-2xl'} bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}
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
    <input
      {...props}
      className={`w-full px-4 py-2.5 bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const Textarea = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
    <textarea
      {...props}
      className={`w-full px-4 py-2.5 bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const Select = ({ label, options, error, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
    <select
      {...props}
      className={`w-full px-4 py-2.5 bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
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

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVeg, setFilterVeg] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'active',
      isVeg: false,
      isBestseller: false,
      isFeatured: false,
      isTodaysSpecial: false,
      isCombo: false,
      nutrition: {},
      variants: [],
    },
  });

  const { fields: variantFields, append: addVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });

  const watchCategory = watch('category');
  const watchPrice = watch('price');
  const watchMrp = watch('mrp');

  const discount = watchMrp && watchPrice ? Math.round(((watchMrp - watchPrice) / watchMrp) * 100) : 0;

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

  const fetchSubcategories = async (catId) => {
    if (!catId) { setSubcategories([]); return; }
    try {
      const res = await adminService.getSubcategories({ category: catId, limit: 100 });
      const d = res.data;
      const data = d?.data || d;
      setSubcategories(data?.subcategories || data?.data || (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('Failed to fetch subcategories');
    }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchSubcategories(watchCategory); }, [watchCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await adminService.getProducts({ page, search, category: filterCategory, status: filterStatus, isVeg: filterVeg, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setProducts(data?.products || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search, filterCategory, filterStatus, filterVeg]);

  const openAddModal = () => {
    setEditingProduct(null);
    reset({
      name: '', sku: '', barcode: '', category: '', subcategory: '', brand: '',
      shortDescription: '', description: '', ingredients: '', cookingInstructions: '',
      shelfLife: '', weight: '', servingSize: '', price: 0, mrp: 0,
      stockQuantity: 0, lowStockLimit: 0, isVeg: false, isBestseller: false,
      isFeatured: false, isTodaysSpecial: false, isCombo: false, status: 'active',
      tags: '', nutrition: {}, variants: [], seoTitle: '', seoDescription: '',
    });
    setCoverPreview(null);
    setGalleryPreviews([]);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      sku: product.sku || '',
      barcode: product.barcode || '',
      category: product.category?._id || product.category,
      subcategory: product.subcategory?._id || product.subcategory || '',
      brand: product.brand || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      ingredients: product.ingredients || '',
      cookingInstructions: product.cookingInstructions || '',
      shelfLife: product.shelfLife || '',
      weight: product.weight || '',
      servingSize: product.servingSize || '',
      price: product.price || 0,
      mrp: product.mrp || 0,
      stockQuantity: product.stockQuantity || 0,
      lowStockLimit: product.lowStockLimit || 0,
      isVeg: product.isVeg || false,
      isBestseller: product.isBestseller || false,
      isFeatured: product.isFeatured || false,
      isTodaysSpecial: product.isTodaysSpecial || false,
      isCombo: product.isCombo || false,
      status: product.status || 'active',
      tags: product.tags?.join(', ') || '',
      nutrition: product.nutrition || {},
      variants: product.variants || [],
      seoTitle: product.seo?.title || '',
      seoDescription: product.seo?.description || '',
    });
    setCoverPreview(product.coverImage);
    setGalleryPreviews(product.galleryImages || []);
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      const { tags, nutrition, variants, ...rest } = data;

      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
      });
      if (tags) formData.append('tags', tags);
      if (nutrition) formData.append('nutrition', JSON.stringify(nutrition));
      if (variants?.length) formData.append('variants', JSON.stringify(variants));

      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, formData);
        toast.success('Product updated successfully');
      } else {
        await adminService.createProduct(formData);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteProduct(deleteModal._id);
      toast.success('Product deleted successfully');
      setDeleteModal(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleDuplicate = async (product) => {
    try {
      await adminService.duplicateProduct(product._id);
      toast.success('Product duplicated');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to duplicate product');
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    try {
      await adminService.bulkDeleteProducts(selected);
      toast.success(`${selected.length} products deleted`);
      setSelected([]);
      fetchProducts();
    } catch (error) {
      toast.error('Bulk delete failed');
    }
  };

  const handleBulkStatus = async (status) => {
    if (!selected.length) return;
    try {
      await adminService.bulkUpdateProductStatus(selected, status);
      toast.success(`${selected.length} products updated`);
      setSelected([]);
      fetchProducts();
    } catch (error) {
      toast.error('Bulk update failed');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await adminService.exportProductsCSV();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      a.click();
      toast.success('CSV exported');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const toggleSelectAll = () => {
    if (selected.length === products.length) setSelected([]);
    else setSelected(products.map((p) => p._id));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-1">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
            <Plus className="w-5 h-5" /> Add Product
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
        <select value={filterVeg} onChange={(e) => { setFilterVeg(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Veg & Non-Veg</option>
          <option value="true">Veg Only</option>
          <option value="false">Non-Veg Only</option>
        </select>
      </motion.div>

      {selected.length > 0 && (
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{selected.length} selected</span>
          <button onClick={() => handleBulkStatus('active')} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30">Set Active</button>
          <button onClick={() => handleBulkStatus('inactive')} className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30">Set Inactive</button>
          <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">Delete</button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left"><input type="checkbox" checked={selected.length === products.length && products.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500" /></th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Image</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Name</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Category</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Price</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Stock</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Featured</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={10} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-gray-500">No products found</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4"><input type="checkbox" checked={selected.includes(product._id)} onChange={() => toggleSelect(product._id)} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500" /></td>
                    <td className="p-4">
                      {product.coverImage ? (
                        <img src={product.coverImage} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-500" /></div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{product.name}</span>
                        {product.isVeg && <Leaf className="w-4 h-4 text-emerald-400" />}
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{product.category?.name || '—'}</td>
                    <td className="p-4 text-white text-sm">${product.price?.toFixed(2)}</td>
                    <td className="p-4 text-sm">
                      <span className={product.stockQuantity <= (product.lowStockLimit || 0) ? 'text-red-400' : 'text-gray-400'}>
                        {product.stockQuantity || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        product.status === 'draft' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{product.status}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {product.isFeatured && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                        {product.isBestseller && <Flame className="w-4 h-4 text-orange-400" />}
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{new Date(product.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDuplicate(product)} className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"><Copy className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteModal(product)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? 'Edit Product' : 'Add Product'} wide>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input label="Product Name *" error={errors.name?.message} {...register('name')} placeholder="Product name" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU" {...register('sku')} placeholder="SKU" />
            <Input label="Barcode" {...register('barcode')} placeholder="Barcode" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Category *" error={errors.category?.message} {...register('category')}
              options={[{ value: '', label: 'Select Category' }, ...categories.map((c) => ({ value: c._id, label: c.name }))]} />
            <Select label="Subcategory" {...register('subcategory')}
              options={[{ value: '', label: 'Select Subcategory' }, ...subcategories.map((s) => ({ value: s._id, label: s.name }))]} />
          </div>

          <Input label="Brand" {...register('brand')} placeholder="Brand name" />
          <Textarea label="Short Description" rows={2} {...register('shortDescription')} placeholder="Short description" />
          <Textarea label="Full Description" rows={4} {...register('description')} placeholder="Full description" />
          <Textarea label="Ingredients" rows={3} {...register('ingredients')} placeholder="Ingredients list" />

          <div className="border-t border-white/10 pt-5">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Nutrition Facts</h4>
            <div className="grid grid-cols-4 gap-3">
              <Input label="Serving Size" {...register('nutrition.servingSize')} placeholder="e.g. 100g" />
              <Input label="Calories" type="number" {...register('nutrition.calories', { valueAsNumber: true })} placeholder="0" />
              <Input label="Protein (g)" type="number" {...register('nutrition.protein', { valueAsNumber: true })} placeholder="0" />
              <Input label="Fat (g)" type="number" {...register('nutrition.fat', { valueAsNumber: true })} placeholder="0" />
              <Input label="Carbs (g)" type="number" {...register('nutrition.carbs', { valueAsNumber: true })} placeholder="0" />
              <Input label="Fiber (g)" type="number" {...register('nutrition.fiber', { valueAsNumber: true })} placeholder="0" />
              <Input label="Sugar (g)" type="number" {...register('nutrition.sugar', { valueAsNumber: true })} placeholder="0" />
              <Input label="Sodium (mg)" type="number" {...register('nutrition.sodium', { valueAsNumber: true })} placeholder="0" />
            </div>
          </div>

          <Textarea label="Cooking Instructions" rows={3} {...register('cookingInstructions')} placeholder="Cooking instructions" />

          <div className="grid grid-cols-3 gap-4">
            <Input label="Shelf Life" {...register('shelfLife')} placeholder="e.g. 7 days" />
            <Input label="Weight" {...register('weight')} placeholder="e.g. 500g" />
            <Input label="Serving Size" {...register('servingSize')} placeholder="e.g. 1 bowl" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Price *" type="number" step="0.01" error={errors.price?.message} {...register('price', { valueAsNumber: true })} />
            <Input label="MRP" type="number" step="0.01" {...register('mrp', { valueAsNumber: true })} />
            <div className="flex items-end pb-1">
              {discount > 0 && <span className="text-emerald-400 text-sm font-medium">{discount}% OFF</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock Quantity" type="number" {...register('stockQuantity', { valueAsNumber: true })} />
            <Input label="Low Stock Limit" type="number" {...register('lowStockLimit', { valueAsNumber: true })} />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            <Toggle label="Veg" checked={watch('isVeg')} onChange={(v) => setValue('isVeg', v)} />
            <Toggle label="Bestseller" checked={watch('isBestseller')} onChange={(v) => setValue('isBestseller', v)} />
            <Toggle label="Featured" checked={watch('isFeatured')} onChange={(v) => setValue('isFeatured', v)} />
            <Toggle label="Today's Special" checked={watch('isTodaysSpecial')} onChange={(v) => setValue('isTodaysSpecial', v)} />
            <Toggle label="Combo" checked={watch('isCombo')} onChange={(v) => setValue('isCombo', v)} />
          </div>

          <Select label="Status" {...register('status')}
            options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'draft', label: 'Draft' }]} />

          <Input label="Tags" {...register('tags')} placeholder="Comma separated tags" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Cover Image</label>
              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) { setCoverPreview(URL.createObjectURL(e.target.files[0])); setValue('coverImage', e.target.files); } }}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:cursor-pointer" />
              {coverPreview && <img src={coverPreview} alt="Cover" className="mt-3 w-20 h-20 rounded-xl object-cover" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Gallery Images</label>
              <input type="file" accept="image/*" multiple onChange={(e) => { if (e.target.files) { setGalleryPreviews([...galleryPreviews].concat(Array.from(e.target.files).map((f) => URL.createObjectURL(f)))); setValue('galleryImages', e.target.files); } }}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:cursor-pointer" />
              {galleryPreviews.length > 0 && (
                <div className="flex gap-2 mt-3">{galleryPreviews.map((src, i) => <img key={i} src={src} alt="" className="w-16 h-16 rounded-lg object-cover" />)}</div>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300">Variants</h4>
              <button type="button" onClick={() => addVariant({ name: '', weight: '', price: 0, mrp: 0, sku: '', stock: 0 })}
                className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"><Plus className="w-4 h-4" /> Add Variant</button>
            </div>
            {variantFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-6 gap-3 mb-3 items-end">
                <Input placeholder="Name" {...register(`variants.${index}.name`)} />
                <Input placeholder="Weight" {...register(`variants.${index}.weight`)} />
                <Input type="number" placeholder="Price" {...register(`variants.${index}.price`, { valueAsNumber: true })} />
                <Input type="number" placeholder="MRP" {...register(`variants.${index}.mrp`, { valueAsNumber: true })} />
                <Input placeholder="SKU" {...register(`variants.${index}.sku`)} />
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="Stock" {...register(`variants.${index}.stock`, { valueAsNumber: true })} />
                  <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
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
              {editingProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Product">
        <p className="text-gray-300 mb-6">Are you sure you want to delete <span className="text-white font-medium">{deleteModal?.name}</span>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </motion.div>
  );
}
