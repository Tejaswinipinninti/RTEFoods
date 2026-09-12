import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import EmptyState from '../components/common/EmptyState';
import * as categoryService from '../services/categoryService';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=60';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const retryRef = useRef(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await categoryService.getAllCategories();
      const d = res.data;
      const items = d?.data || d?.categories || (Array.isArray(d) ? d : []);
      setCategories(items);
    } catch (err) {
      if (!retryRef.current) {
        retryRef.current = true;
        setTimeout(() => fetchCategories(), 1000);
        return;
      }
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      retryRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const breadcrumbItems = [
    { label: 'Home', link: '/' },
    { label: 'Categories' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-3 sm:mt-4"
          >
            All Categories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 mt-1.5 sm:mt-2 text-sm sm:text-base"
          >
            Explore our wide range of food categories
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white border border-gray-200 animate-pulse">
                <div className="h-44 sm:h-56 bg-gray-200" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load categories"
            description={error}
            actionLabel="Try Again"
            onAction={() => window.location.reload()}
          />
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories found"
            description="We're working on adding new categories. Check back soon!"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <div key={category._id} className="animate-fadeIn">
                <Link
                  to={`/products?category=${category.slug || category._id}`}
                  className="group block rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10"
                >
                  <div className="relative h-44 sm:h-56 overflow-hidden">
                    <img
                      src={category.image || PLACEHOLDER_IMG}
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1 group-hover:text-orange-300 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-[11px] sm:text-sm text-gray-200 line-clamp-2">{category.description || 'Explore our delicious range'}</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-orange-500 transition-all flex-shrink-0 ml-2 sm:ml-3">
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-500">
                      {category.productCount || 0} products
                    </span>
                    <span className="text-xs sm:text-sm text-orange-600 font-medium flex items-center gap-0.5 sm:gap-1 group-hover:gap-1.5 sm:group-hover:gap-2 transition-all">
                      View All <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
