import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, ChevronDown, Star, Filter,
  ArrowUpDown
} from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductCard from '../components/common/ProductCard';
import Pagination from '../components/common/Pagination';
import { Loader, SkeletonProduct } from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { addItem } from '../redux/slices/cartSlice';
import { useDispatch } from 'react-redux';
import * as productService from '../services/productService';
import * as categoryService from '../services/categoryService';
import { toggleWishlist } from '../services/wishlistService';
import toast from 'react-hot-toast';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest' },
  { value: 'popularity', label: 'Popularity' },
];

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);
  const retryRef = useRef(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('category') ? searchParams.get('category').split(',') : []
  );
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [isVeg, setIsVeg] = useState(searchParams.get('isVeg') === 'true');
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating')) || 0);
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  const breadcrumbItems = [
    { label: 'Home', link: '/' },
    { label: 'Products' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        const d = res.data;
        const items = d?.data || d?.categories || (Array.isArray(d) ? d : []);
        setCategories(items);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 12 };
      if (search) params.search = search;
      if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
      if (priceMin) params.priceMin = priceMin;
      if (priceMax) params.priceMax = priceMax;
      if (isVeg) params.isVeg = 'true';
      if (minRating) params.rating = minRating;
      if (inStock) params.inStock = 'true';
      if (sortBy && sortBy !== 'featured') params.sort = sortBy;

      const res = await productService.getProducts(params);
      const d = res.data;
      const items = d?.data || d?.products || (Array.isArray(d) ? d : []);
      setProducts(items);
      setTotalPages(d?.pagination?.pages || d?.totalPages || 1);
      setTotalResults(d?.pagination?.total || d?.totalResults || d?.total || items.length);
    } catch (err) {
      if (!retryRef.current) {
        retryRef.current = true;
        setTimeout(() => {
          retryRef.current = false;
          fetchProducts();
        }, 1000);
        return;
      }
      console.error('Failed to load products:', err);
      setProducts([]);
    } finally {
      retryRef.current = false;
      setLoading(false);
    }
  }, [search, selectedCategories, priceMin, priceMax, isVeg, minRating, inStock, sortBy, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const prevParamsRef = useRef('');
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    if (isVeg) params.set('isVeg', 'true');
    if (minRating) params.set('rating', String(minRating));
    if (inStock) params.set('inStock', 'true');
    if (sortBy !== 'featured') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', String(currentPage));
    const paramStr = params.toString();
    if (paramStr !== prevParamsRef.current) {
      prevParamsRef.current = paramStr;
      setSearchParams(params, { replace: true });
    }
  }, [search, selectedCategories, priceMin, priceMax, isVeg, minRating, inStock, sortBy, currentPage, setSearchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleCategoryToggle = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchInput('');
    setSelectedCategories([]);
    setPriceMin('');
    setPriceMax('');
    setIsVeg(false);
    setMinRating(0);
    setInStock(false);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const handleAddToCart = (product) => {
    dispatch(addItem({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.coverImage || product.galleryImages?.[0] || '',
      quantity: 1
    }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = async (product) => {
    try {
      await toggleWishlist(product._id);
      toast.success('Wishlist updated!');
    } catch {
      toast.error('Please login to add to wishlist');
    }
  };

  const activeFilterCount = [
    selectedCategories.length > 0,
    priceMin || priceMax,
    isVeg,
    minRating > 0,
    inStock,
  ].filter(Boolean).length;

  const FilterSidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'p-4' : 'p-5'} space-y-5`}>
      <div>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400 text-sm"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearch(''); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat._id)}
                onChange={() => handleCategoryToggle(cat._id)}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors truncate">
                {cat.name}
              </span>
            </label>
          ))}
          {categories.length === 0 && (
            <p className="text-xs text-gray-400">Loading categories...</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceMin}
            onChange={(e) => { setPriceMin(e.target.value); setCurrentPage(1); }}
            placeholder="Min"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-900"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            value={priceMax}
            onChange={(e) => { setPriceMax(e.target.value); setCurrentPage(1); }}
            placeholder="Max"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-900"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Food Type</h3>
        <button
          onClick={() => { setIsVeg(!isVeg); setCurrentPage(1); }}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all w-full ${
            isVeg
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
          }`}
        >
          <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${isVeg ? 'border-green-600 bg-green-50' : 'border-gray-400'}`}>
            {isVeg && <div className="w-2.5 h-2.5 rounded-full bg-green-600" />}
          </div>
          Veg Only
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => { setMinRating(minRating === rating ? 0 : rating); setCurrentPage(1); }}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all ${
                minRating === rating
                  ? 'bg-orange-50 border border-orange-200'
                  : 'border border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">& up</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Availability</h3>
        <button
          onClick={() => { setInStock(!inStock); setCurrentPage(1); }}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all w-full ${
            inStock
              ? 'bg-orange-50 border-orange-300 text-orange-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
          }`}
        >
          <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${inStock ? 'border-orange-500 bg-orange-50' : 'border-gray-400'}`}>
            {inStock && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
          </div>
          In Stock Only
        </button>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={handleClearFilters}
          className="w-full py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-3"
          >
            All Products
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 mt-1 text-sm sm:text-base"
          >
            {totalResults} products found
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile Search + Filter Toggle */}
        <div className="lg:hidden mb-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400"
            />
          </form>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="flex-1 relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-orange-400 bg-white"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-poppins font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  <Filter className="w-4 h-4" />
                  Filters
                </h2>
              </div>
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {showMobileFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileFilters(false)}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 overflow-y-auto"
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="font-poppins font-semibold text-gray-900">Filters</h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <FilterSidebar isMobile />
                  <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100">
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-lg"
                    >
                      Show {totalResults} Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Desktop Sort */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{products.length}</span> of{' '}
                <span className="font-medium text-gray-900">{totalResults}</span> results
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-orange-400 bg-white pr-8"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonProduct key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try adjusting your filters or search terms"
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onWishlist={handleWishlist}
                    />
                  ))}
                </div>

                <div className="mt-8 sm:mt-10">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
