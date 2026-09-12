import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
  Truck, ShieldCheck, Clock, Headphones, Leaf, ShoppingBag,
  Star, ArrowRight, Flame, Award, Heart, Mail,
  Utensils, Salad, Pizza, Cake, Coffee, Beef, Egg, IceCream, Sandwich
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { Loader } from '../components/common/Loader';
import { addItem } from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import * as productService from '../services/productService';
import * as categoryService from '../services/categoryService';
import { toggleWishlist } from '../services/wishlistService';
import toast from 'react-hot-toast';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80';

const heroSlides = [
  {
    title: 'Delicious Meals\nDelivered Fresh',
    subtitle: 'Experience the finest cuisines from top chefs, delivered to your doorstep.',
    cta: 'Order Now',
    ctaSecondary: 'View Menu',
    gradient: 'from-orange-600/90 via-red-600/80 to-pink-600/70',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
  },
  {
    title: 'Fresh & Healthy\nOrganic Options',
    subtitle: 'Nourish your body with our curated selection of organic, farm-to-table meals.',
    cta: 'Explore Healthy',
    ctaSecondary: 'Our Story',
    gradient: 'from-emerald-600/90 via-teal-600/80 to-cyan-600/70',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80',
  },
  {
    title: 'Premium Gourmet\nExperience',
    subtitle: 'Indulge in world-class culinary artistry with our exclusive gourmet collection.',
    cta: 'Shop Gourmet',
    ctaSecondary: 'Gift Cards',
    gradient: 'from-purple-600/90 via-indigo-600/80 to-blue-600/70',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
  },
  {
    title: 'Flat 30% Off\nCombo Deals',
    subtitle: 'Save big on our specially curated combos. Perfect for family dinners and parties.',
    cta: 'Grab Deals',
    ctaSecondary: 'View All',
    gradient: 'from-amber-600/90 via-orange-600/80 to-red-600/70',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80',
  },
];

const categoryIcons = [Utensils, Salad, Pizza, Cake, Coffee, Beef, Egg, IceCream, Sandwich];

const deliveryFeatures = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹499' },
  { icon: Leaf, title: '100% Fresh', desc: 'Fresh ingredients daily' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
];

const reviews = [
  { name: 'Priya Sharma', rating: 5, text: 'Absolutely love the food quality! The butter chicken was divine. Best delivery experience.', avatar: 'PS' },
  { name: 'Rahul Verma', rating: 5, text: 'The combo deals are unbeatable. Fresh, hot, and delivered on time every single time.', avatar: 'RV' },
  { name: 'Ananya Patel', rating: 4, text: 'Great variety of healthy options. The quinoa bowl has become my daily lunch. Highly recommended!', avatar: 'AP' },
  { name: 'Vikram Singh', rating: 5, text: 'Premium quality at affordable prices. The gourmet collection is worth every penny.', avatar: 'VS' },
];

const Home = () => {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [todaysSpecials, setTodaysSpecials] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

    const fetchData = async () => {
      try {
        const apiCalls = [
          categoryService.getAllCategories(),
          productService.getTodaysSpecials(),
          productService.getFeaturedProducts(),
          productService.getBestsellers(),
          productService.getCombos(),
        ];

        const results = await Promise.allSettled(
          apiCalls.map((call) => Promise.race([call, timeout(5000)]))
        );

        const extractData = (res, keys) => {
          if (res.status !== 'fulfilled') return [];
          const d = res.value.data;
          return d?.data || d?.[keys[0]] || d?.[keys[1]] || (Array.isArray(d) ? d : []);
        };

        setCategories(extractData(results[0], ['categories', 'data']));
        setTodaysSpecials(extractData(results[1], ['products', 'data']));
        setFeatured(extractData(results[2], ['products', 'data']));
        setBestsellers(extractData(results[3], ['products', 'data']));
        setCombos(extractData(results[4], ['products', 'data']));
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

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

  const SectionTitle = ({ title, subtitle }) => (
    <div className="text-center mb-10 sm:mb-12">
      <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 transition-all duration-500">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto px-4 transition-all duration-500 delay-100">
          {subtitle}
        </p>
      )}
    </div>
  );

  const getProductImage = (product) => {
    return product?.coverImage || product?.galleryImages?.[0] || product?.image || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full overflow-hidden">
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} to-transparent`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="relative h-full flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-xl">
                      <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 whitespace-pre-line leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-8 leading-relaxed">
                        {slide.subtitle}
                      </p>
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        <Link
                          to="/products"
                          className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all hover:scale-105 text-sm sm:text-base"
                        >
                          {slide.cta}
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <Link
                          to="/categories"
                          className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold backdrop-blur-sm hover:bg-white/10 transition-all hover:scale-105 text-sm sm:text-base"
                        >
                          {slide.ctaSecondary}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Categories Section - CSS grid, no framer-motion stagger */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionTitle title="Explore Categories" subtitle="Find exactly what you're craving from our diverse selection" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {categories.slice(0, 8).map((cat, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];
            return (
              <div key={cat._id}>
                <Link
                  to={`/products?category=${cat._id}`}
                  className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
                >
                  <div className="relative h-32 sm:h-40 overflow-hidden bg-gray-100">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=60'}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=60'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-3 sm:p-4 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                    </div>
                    <h3 className="font-poppins font-semibold text-gray-900 mb-1 text-sm sm:text-base">{cat.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-400">{cat.productCount > 0 ? `${cat.productCount} products` : ''}</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Today's Specials */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionTitle title="Today's Specials" subtitle="Chef's handpicked selections just for you" />
        {todaysSpecials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {todaysSpecials.map((product) => (
              <div key={product._id} className="relative">
                <div className="absolute -top-2 -right-2 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Special
                </div>
                <ProductCard product={product} onAddToCart={handleAddToCart} onWishlist={handleWishlist} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">No specials available today</p>
        )}
      </section>

      {/* Popular Products - CSS grid, no stagger */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionTitle title="Popular Products" subtitle="Most ordered items by our happy customers" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {featured.slice(0, 8).map((product) => (
            <div key={product._id}>
              <ProductCard product={product} onAddToCart={handleAddToCart} onWishlist={handleWishlist} />
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers - CSS, no framer-motion stagger */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-orange-50">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="Best Sellers" subtitle="Our most loved dishes, tried and adored by thousands" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {bestsellers.slice(0, 6).map((product, index) => (
              <div
                key={product._id}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all group"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=60'; }}
                    />
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                    #{index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-poppins font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors text-sm sm:text-base">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-orange-500 font-bold text-sm sm:text-base">{formatPrice(product.price)}</span>
                    {product.mrp > product.price && (
                      <span className="text-xs sm:text-sm text-gray-400 line-through">{formatPrice(product.mrp)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-500">{product.averageRating || '4.5'}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 flex-shrink-0 hover:scale-110 active:scale-95 transition-transform"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Healthy Meals - CSS grid, no stagger */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-600 text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            100% Vegetarian
          </div>
          <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Healthy Meals
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
            Nourish your body with our carefully crafted vegetarian and vegan options
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {featured.filter(p => p.isVeg).slice(0, 8).map((product) => (
            <div key={product._id}>
              <ProductCard product={product} onAddToCart={handleAddToCart} onWishlist={handleWishlist} />
            </div>
          ))}
        </div>
        {featured.filter(p => p.isVeg).length === 0 && (
          <div className="text-center py-12">
            <Salad className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-gray-400">Healthy options coming soon!</p>
          </div>
        )}
      </section>

      {/* Combo Offers - CSS grid, no stagger */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="Combo Offers" subtitle="Save more when you order more - curated combos for every occasion" />
          {combos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {combos.map((product) => (
                <div key={product._id}>
                  <ProductCard product={product} onAddToCart={handleAddToCart} onWishlist={handleWishlist} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-white border border-gray-100">
              <Award className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Exciting combos launching soon!</p>
              <p className="text-gray-400 text-sm mt-2">Stay tuned for amazing deals</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Brands - CSS grid, no stagger */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionTitle title="Featured Brands" subtitle="Trusted partners delivering quality" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {["Nature's Basket", 'Organic India', 'Amul', 'McCain', "Haldiram's", 'Paper Boat'].map((brand) => (
            <div
              key={brand}
              className="flex items-center justify-center p-4 sm:p-6 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 h-20 sm:h-24"
            >
              <span className="font-poppins font-semibold text-gray-400 text-center text-xs sm:text-sm">{brand}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="What Our Customers Say" subtitle="Join thousands of happy food lovers" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{review.name}</p>
                    <p className="text-xs text-gray-400">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Promise - CSS grid, no stagger */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {deliveryFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center p-5 sm:p-6 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500" />
                </div>
                <h3 className="font-poppins font-semibold text-gray-900 mb-1 text-sm sm:text-base">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-8 sm:p-10 md:p-12 text-center shadow-xl">
          <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-white/80 mx-auto mb-4" />
          <h2 className="font-poppins text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
            Stay in the Loop
          </h2>
          <p className="text-white/80 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
            Subscribe for exclusive deals, new menu updates, and a 15% off welcome discount!
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed!'); setEmail(''); }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors text-sm sm:text-base"
            />
            <button
              type="submit"
              className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-white text-orange-600 font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-sm sm:text-base"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-white/50 mt-3 sm:mt-4">No spam, unsubscribe anytime.</p>
        </div>
      </section>

      {/* Instagram Gallery - CSS grid, no framer-motion */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionTitle title="Follow Us on Instagram" subtitle="@rtefoods" />
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {[
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=60',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=60',
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&q=60',
            'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=300&q=60',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=60',
            'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&q=60',
          ].map((img, index) => (
            <a
              key={index}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden group hover:scale-105 hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={img}
                alt="Instagram"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
