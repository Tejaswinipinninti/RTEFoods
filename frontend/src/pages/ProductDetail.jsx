import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart, Heart, Minus, Plus, Star, Truck, RotateCcw,
  CheckCircle, ChevronRight, Leaf, Flame, User, Send
} from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import ImageGallery from '../components/common/ImageGallery';
import Rating from '../components/common/Rating';
import Badge from '../components/common/Badge';
import ProductCard from '../components/common/ProductCard';
import { Loader, SkeletonText } from '../components/common/Loader';
import { addItem } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import useAuth from '../hooks/useAuth';
import { formatPrice, getDiscountPercent } from '../utils/helpers';
import * as productService from '../services/productService';
import * as reviewService from '../services/reviewService';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const wishlistItems = useSelector((state) => state.wishlist.productIds);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(null);
  const [showMobileBar, setShowMobileBar] = useState(false);

  const isWishlisted = wishlistItems.includes(id);

  const getProductImages = (p) => {
    if (!p) return [];
    if (p.galleryImages?.length > 0) return p.galleryImages;
    if (p.images?.length > 0) return p.images;
    if (p.coverImage) return [p.coverImage];
    if (p.image) return [p.image];
    return [];
  };

  const getProductCover = (p) => {
    if (!p) return '';
    return p.coverImage || p.galleryImages?.[0] || p.images?.[0] || p.image || '';
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [prodRes, relatedRes, reviewRes, statsRes] = await Promise.all([
          productService.getProduct(id),
          productService.getRelatedProducts(id),
          reviewService.getProductReviews(id),
          reviewService.getRatingStats(id),
        ]);
        const prodData = prodRes.data.data || prodRes.data.product || prodRes.data;
        setProduct(prodData);
        if (prodData?.variants?.length > 0) {
          setSelectedVariant(prodData.variants[0]);
        }
        setRelatedProducts(relatedRes.data.data || relatedRes.data.products || (Array.isArray(relatedRes.data) ? relatedRes.data : []));
        setReviews(reviewRes.data.data || reviewRes.data.reviews || (Array.isArray(reviewRes.data) ? reviewRes.data : []));
        setRatingStats(statsRes.data.data || statsRes.data.stats || statsRes.data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowMobileBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    dispatch(addItem({
      product: product._id,
      name: product.name,
      price: selectedVariant?.price || product.price,
      image: getProductCover(product),
      quantity,
      variant: selectedVariant,
    }));
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product._id));
  };

  const handleCheckDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryAvailable(true);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        product: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      const reviewRes = await reviewService.getProductReviews(id);
      setReviews(reviewRes.data.reviews || reviewRes.data || []);
      const statsRes = await reviewService.getRatingStats(id);
      setRatingStats(statsRes.data.stats || statsRes.data || null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const tabs = [
    { key: 'description', label: 'Description' },
    { key: 'ingredients', label: 'Ingredients' },
    { key: 'nutrition', label: 'Nutrition Facts' },
    { key: 'cooking', label: 'Cooking Instructions' },
    { key: 'shelf', label: 'Shelf Life' },
  ];

  const discount = product ? getDiscountPercent(selectedVariant?.mrp || product.mrp, selectedVariant?.price || product.price) : 0;

  const breadcrumbItems = [
    { label: 'Home', link: '/' },
    { label: 'Categories', link: '/categories' },
    { label: product?.category?.name || 'Products', link: product?.category?.slug ? `/products?category=${product.category.slug}` : '/products' },
    { label: product?.name || 'Product' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            <div className="rounded-2xl bg-white border border-gray-200 aspect-square animate-pulse" />
            <div className="space-y-4 sm:space-y-6">
              <SkeletonText lines={1} />
              <SkeletonText lines={2} />
              <SkeletonText lines={1} />
              <SkeletonText lines={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium text-sm sm:text-base"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const productImages = getProductImages(product);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mt-4 sm:mt-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <ImageGallery images={productImages.length > 0 ? productImages : [product.image]} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              {product.category && (
                <Badge variant="info" size="sm">{product.category.name || product.category}</Badge>
              )}
              {product.isVeg ? (
                <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                  <Leaf className="w-3 h-3" /> Veg
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                  <Flame className="w-3 h-3" /> Non-Veg
                </span>
              )}
              {product.isFeatured && (
                <Badge variant="warning" size="sm">Featured</Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <Rating rating={product.rating || 0} size="md" showCount count={product.reviewCount || reviews.length || 0} />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold text-orange-600">
                {formatPrice(selectedVariant?.price || product.price)}
              </span>
              {(selectedVariant?.mrp || product.mrp) > (selectedVariant?.price || product.price) && (
                <span className="text-base sm:text-lg text-gray-400 line-through">
                  {formatPrice(selectedVariant?.mrp || product.mrp)}
                </span>
              )}
              {discount > 0 && (
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold border border-emerald-200">
                  {discount}% OFF
                </span>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{product.shortDescription}</p>
            )}

            {product.variants?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">Select Variant</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant._id || variant.name}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                        selectedVariant?._id === variant._id || selectedVariant?.name === variant.name
                          ? 'bg-orange-50 border-orange-300 text-orange-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {variant.name} - {formatPrice(variant.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">Quantity</h3>
              <div className="inline-flex items-center gap-0 rounded-xl bg-white border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 sm:p-3 hover:bg-gray-100 transition-colors text-gray-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 sm:px-6 py-2.5 sm:py-3 text-gray-900 font-medium min-w-[50px] sm:min-w-[60px] text-center text-sm sm:text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 sm:p-3 hover:bg-gray-100 transition-colors text-gray-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                Add to Cart
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlist}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                  isWishlisted
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-300'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </motion.button>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Truck className="w-4 h-4 text-orange-500" />
                Check Delivery
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setDeliveryAvailable(null); }}
                  placeholder="Enter pincode"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 text-sm"
                />
                <button
                  onClick={handleCheckDelivery}
                  disabled={pincode.length !== 6}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 text-sm font-medium disabled:opacity-40 hover:bg-orange-100 transition-colors"
                >
                  Check
                </button>
              </div>
              {deliveryAvailable !== null && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-2 text-xs sm:text-sm flex items-center gap-1 ${deliveryAvailable ? 'text-emerald-600' : 'text-red-500'}`}
                >
                  {deliveryAvailable ? (
                    <><CheckCircle className="w-4 h-4" /> Delivery available. Estimated 30-45 mins.</>
                  ) : (
                    'Delivery not available for this pincode.'
                  )}
                </motion.p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: Truck, text: 'Free Delivery' },
                { icon: RotateCcw, text: 'Easy Returns' },
                { icon: CheckCircle, text: 'Fresh Quality' },
              ].map((feat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-xl bg-white border border-gray-200 text-center">
                  <feat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  <span className="text-[10px] sm:text-xs text-gray-500">{feat.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-10 sm:mt-16">
          <div className="flex gap-1 overflow-x-auto pb-1 border-b border-gray-200 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all relative ${
                  activeTab === tab.key ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-4 sm:mt-6 p-4 sm:p-6 rounded-2xl bg-white border border-gray-200"
            >
              {activeTab === 'description' && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {product.description || 'No description available for this product.'}
                  </p>
                </div>
              )}
              {activeTab === 'ingredients' && (
                <div>
                  {product.ingredients?.length > 0 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.ingredients.map((ing, i) => (
                        <li key={i} className="text-gray-700 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">Ingredients information not available.</p>
                  )}
                </div>
              )}
              {activeTab === 'nutrition' && (
                <div>
                  {product.nutrition ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {Object.entries(product.nutrition).map(([key, value]) => (
                        <div key={key} className="text-center p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100">
                          <p className="text-xl sm:text-2xl font-bold text-orange-600">{value}</p>
                          <p className="text-xs sm:text-sm text-gray-500 capitalize mt-1">{key}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nutrition information not available.</p>
                  )}
                </div>
              )}
              {activeTab === 'cooking' && (
                <div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {product.cookingInstructions || 'Cooking instructions not available.'}
                  </p>
                </div>
              )}
              {activeTab === 'shelf' && (
                <div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {product.shelfLife || 'Shelf life information not available.'}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-10 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Related Products</h2>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-4 sm:gap-6" style={{ minWidth: 'max-content' }}>
                {relatedProducts.map((prod) => (
                  <div key={prod._id} className="w-56 sm:w-64 flex-shrink-0">
                    <ProductCard product={prod} onAddToCart={handleAddToCart} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {product.frequentlyBoughtWith?.length > 0 && (
          <section className="mt-10 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Frequently Bought Together</h2>
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-gray-200">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={getProductCover(product)} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-gray-800 font-medium text-xs sm:text-sm">{product.name}</span>
                </div>
                <span className="text-gray-400 text-lg">+</span>
                {product.frequentlyBoughtWith.map((item) => (
                  <div key={item._id || item} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.coverImage || item.galleryImages?.[0] || item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-gray-800 font-medium text-xs sm:text-sm">{item.name}</span>
                  </div>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium text-xs sm:text-sm"
                >
                  Add All to Cart
                </motion.button>
              </div>
            </div>
          </section>
        )}

        <section className="mt-10 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Customer Reviews</h2>

          {ratingStats && (
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-gray-200 mb-6 sm:mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8">
                <div className="text-center">
                  <p className="text-4xl sm:text-5xl font-bold text-orange-600">{ratingStats.averageRating?.toFixed(1) || '0.0'}</p>
                  <Rating rating={ratingStats.averageRating || 0} size="md" />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{ratingStats.totalReviews || 0} reviews</p>
                </div>
                <div className="flex-1 w-full space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingStats.starDistribution?.[star] || 0;
                    const total = ratingStats.totalReviews || 1;
                    const percent = (count / total) * 100;
                    return (
                      <div key={star} className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm text-gray-500 w-6 sm:w-8">{star} ★</span>
                        <div className="flex-1 h-2 sm:h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, delay: (5 - star) * 0.1 }}
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                          />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-400 w-6 sm:w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {isAuthenticated && (
            <motion.form
              onSubmit={handleReviewSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-6 rounded-2xl bg-white border border-gray-200 mb-6 sm:mb-8"
            >
              <h3 className="font-medium text-gray-800 mb-4 text-sm sm:text-base">Write a Review</h3>
              <div className="mb-4">
                <label className="block text-xs sm:text-sm text-gray-600 mb-2">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                    >
                      <Star
                        className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                          star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-gray-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs sm:text-sm text-gray-600 mb-2">Your Review</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 text-sm resize-none"
                  placeholder="Share your experience..."
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submittingReview}
                className="flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium text-sm shadow-lg shadow-orange-500/25 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </motion.button>
            </motion.form>
          )}

          {!isAuthenticated && (
            <div className="p-4 rounded-2xl bg-white border border-gray-200 mb-6 sm:mb-8 text-center">
              <p className="text-gray-600 text-sm">
                <Link to="/login" className="text-orange-600 hover:text-orange-500 font-medium">Login</Link> to write a review
              </p>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            {reviews.length === 0 ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 text-center">
                <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      {review.user?.name?.charAt(0) || <User className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1">
                        <span className="font-medium text-gray-800 text-xs sm:text-sm">{review.user?.name || 'Anonymous'}</span>
                        <Rating rating={review.rating} size="sm" />
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{review.comment}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showMobileBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-3 sm:p-4 lg:hidden z-30"
          >
            <div className="flex items-center gap-3 sm:gap-4 max-w-7xl mx-auto">
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs text-gray-500">Price</p>
                <p className="text-lg sm:text-xl font-bold text-orange-600">{formatPrice(selectedVariant?.price || product.price)}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/25"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                Add to Cart
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
