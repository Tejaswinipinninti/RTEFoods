import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { getWishlist, removeFromWishlist } from '../services/wishlistService';
import { addItem } from '../redux/slices/cartSlice';
import ProductCard from '../components/common/ProductCard';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlist()
      .then((res) => {
        const rawItems = res.data?.data || res.data || [];
        const productsList = Array.isArray(rawItems)
          ? rawItems.map((item) => item.product || item).filter(Boolean)
          : [];
        setItems(productsList);
      })
      .catch((err) => {
        console.error('Failed to load wishlist:', err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((item) => (item._id || item.id) !== productId));
      toast.success('Removed from wishlist');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (product) => {
    const id = product._id || product.id;
    dispatch(addItem({
      product: id,
      name: product.name,
      price: product.price,
      image: product.coverImage || product.galleryImages?.[0] || product.images?.[0] || product.image,
      quantity: 1
    }));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-6 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <nav className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <Link to="/" className="hover:text-orange-500">Home</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-orange-600 font-medium">Wishlist</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">
          My Wishlist <span className="text-orange-500">({items.length})</span>
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 sm:h-72 bg-white/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <Heart size={40} className="text-gray-300 mx-auto mb-3 sm:mb-4 sm:hidden" />
            <Heart size={48} className="text-gray-300 mx-auto mb-4 hidden sm:block" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-600">Your wishlist is empty</h3>
            <p className="text-gray-400 mt-1 text-sm">Save your favorite items here</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-4 px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg transition-all text-sm"
            >
              <ShoppingBag size={16} />
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence>
              {items.map((item) => {
                const pId = item._id || item.id;
                return (
                  <motion.div
                    key={pId}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="relative">
                      <ProductCard product={item} onAddToCart={handleAddToCart} />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemove(pId)}
                        className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors z-10"
                      >
                        <Heart size={12} fill="currentColor" className="sm:hidden" />
                        <Heart size={14} fill="currentColor" className="hidden sm:block" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
