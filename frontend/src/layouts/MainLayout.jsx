import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, MessageCircle, X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../components/common/ScrollToTop';
import { closeCart } from '../redux/slices/uiSlice';
import { removeItem, updateQuantity } from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/helpers';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const { cartOpen } = useSelector((state) => state.ui);
  const { items, subtotal, itemCount } = useSelector((state) => state.cart);

  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-80 max-w-[90vw] bg-white dark:bg-dark-800 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-700">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                <span className="font-poppins font-bold text-lg text-gray-900 dark:text-white">Cart ({itemCount})</span>
              </div>
              <button onClick={() => dispatch(closeCart())} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Your cart is empty</p>
                  <Link to="/products" onClick={() => dispatch(closeCart())} className="mt-3 inline-block text-sm text-orange-500 hover:text-orange-600 font-semibold">
                    Browse Products
                  </Link>
                </div>
              ) : (
                items.map((item) => {
                  const pid = item.product || item._id || item.id;
                  return (
                    <div key={pid} className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-700">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 dark:bg-dark-600 shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                        <p className="text-orange-500 font-semibold text-sm">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => {
                              if (item.quantity <= 1) dispatch(removeItem(pid));
                              else dispatch(updateQuantity({ productId: pid, quantity: item.quantity - 1 }));
                            }}
                            className="w-6 h-6 rounded-md bg-white dark:bg-dark-600 border border-gray-200 dark:border-dark-500 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => dispatch(updateQuantity({ productId: pid, quantity: item.quantity + 1 }))}
                            className="w-6 h-6 rounded-md bg-white dark:bg-dark-600 border border-gray-200 dark:border-dark-500 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => dispatch(removeItem(pid))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors self-start"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-gray-100 dark:border-dark-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Subtotal</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                <Link
                  to="/cart"
                  onClick={() => dispatch(closeCart())}
                  className="block w-full py-3 text-center font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="block w-full py-3 text-center font-semibold text-orange-500 border-2 border-orange-500 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const MainLayout = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-900 transition-colors">
      <ScrollToTop />
      <Header />
      <CartDrawer />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Floating WhatsApp */}
      <motion.a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.a>

      {/* Back to Top */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-shadow"
          >
            <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
