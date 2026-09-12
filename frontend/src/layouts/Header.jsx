import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search, User, ShoppingCart, Menu, X, ChevronDown,
  Heart, Package, LogOut, Settings, Home, Sun, Moon
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { logout } from '../redux/slices/authSlice';
import { toggleDarkMode } from '../redux/slices/uiSlice';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Categories', path: '/categories' },
  { name: 'Products', path: '/products' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const { darkMode } = useSelector((state) => state.ui);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserDropdown(false);
    setSearchOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl shadow-lg border-b border-gray-100 dark:border-dark-700'
            : 'bg-white/70 dark:bg-dark-900/70 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 shrink-0">
              <span className="text-xl sm:text-2xl md:text-3xl font-poppins font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                RTE
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-poppins font-extrabold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                Foods
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium font-poppins rounded-xl transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>

              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => dispatch(toggleDarkMode())}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                )}
              </motion.button>

              {/* Wishlist */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  to={isAuthenticated ? '/wishlist' : '/login'}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-dark-700"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                </Link>
              </motion.div>

              {/* User */}
              {isAuthenticated ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-dark-700"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                      {user?.firstName?.[0] || 'U'}
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {userDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-52 sm:w-56 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-700 overflow-hidden py-2"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700">
                          <p className="font-semibold text-gray-900 dark:text-white font-poppins truncate text-sm">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-dark-700 hover:text-orange-600 transition-colors">
                            <Settings className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-dark-700 hover:text-orange-600 transition-colors">
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-dark-700 hover:text-orange-600 transition-colors">
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>
                        <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-dark-700 hover:text-orange-600 transition-colors">
                          <Heart className="w-4 h-4" />
                          Wishlist
                        </Link>
                        <hr className="my-1 border-gray-100 dark:border-dark-700" />
                        <button
                          onClick={() => { dispatch(logout()); setUserDropdown(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link to="/login" className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-dark-700">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                  </Link>
                </motion.div>
              )}

              {/* Cart */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link to="/cart" className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-dark-700 relative">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Mobile Hamburger */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-dark-700 lg:hidden"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-24 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-2xl"
            >
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 p-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for food items, categories..."
                    className="w-full pl-12 pr-12 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/20 outline-none transition-all text-gray-900 dark:text-white text-base"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </form>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Breakfast', 'Lunch', 'Snacks', 'Healthy', 'Combos'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { navigate(`/products?search=${tag}`); setSearchOpen(false); }}
                      className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-dark-800 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-700">
                <span className="font-poppins font-bold text-lg text-gray-900 dark:text-white">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-poppins font-medium transition-all ${
                      isActive(link.path)
                        ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-100 dark:border-dark-700 space-y-2">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="block w-full py-3 text-center font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg">
                      Login
                    </Link>
                    <Link to="/register" className="block w-full py-3 text-center font-semibold text-orange-500 border-2 border-orange-500 rounded-xl">
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700">
                      <User className="w-5 h-5" />
                      <span className="font-poppins font-medium">My Account</span>
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700">
                      <Package className="w-5 h-5" />
                      <span className="font-poppins font-medium">My Orders</span>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-14 sm:h-16 md:h-20" />
    </>
  );
};

export default Header;
