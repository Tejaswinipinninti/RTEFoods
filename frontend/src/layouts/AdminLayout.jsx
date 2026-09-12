import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderTree, Tags, Package, ShoppingCart,
  Users, Ticket, Image, Percent, Star, FileText, HelpCircle,
  Mail, MessageSquare, MapPin, Boxes, Settings, Search,
  Bell, ChevronDown, ChevronLeft, ChevronRight, Menu, X, LogOut
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { logout } from '../redux/slices/authSlice';

const sidebarItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Categories', path: '/admin/categories', icon: FolderTree },
  { name: 'Subcategories', path: '/admin/subcategories', icon: Tags },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
  { name: 'Banners', path: '/admin/banners', icon: Image },
  { name: 'Offers', path: '/admin/offers', icon: Percent },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Blogs', path: '/admin/blogs', icon: FileText },
  { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
  { name: 'Newsletter', path: '/admin/newsletter', icon: Mail },
  { name: 'Contacts', path: '/admin/contacts', icon: MessageSquare },
  { name: 'Pincodes', path: '/admin/pincodes', icon: MapPin },
  { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-dark-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-dark-900 text-white transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } fixed top-0 left-0 bottom-0 z-30`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-1">
              <span className="text-xl font-poppins font-extrabold text-primary-500">RTE</span>
              <span className="text-xl font-poppins font-extrabold text-accent-500">Admin</span>
            </Link>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {sidebarItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-poppins font-medium transition-all ${
                  active
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-dark-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary-400' : ''}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-40 w-64 bg-dark-900 text-white lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                <Link to="/admin" className="flex items-center gap-1">
                  <span className="text-xl font-poppins font-extrabold text-primary-500">RTE</span>
                  <span className="text-xl font-poppins font-extrabold text-accent-500">Admin</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="overflow-y-auto py-4 px-3 space-y-1">
                {sidebarItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-poppins font-medium transition-all ${
                        active
                          ? 'bg-primary-500/15 text-primary-400'
                          : 'text-dark-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary-400' : ''}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-dark-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          {/* Left: Mobile menu + Search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="btn-icon lg:hidden"
            >
              <Menu className="w-5 h-5 text-dark-700" />
            </button>
            <div className="hidden sm:flex items-center bg-dark-50 rounded-xl px-4 py-2 w-64">
              <Search className="w-4 h-4 text-dark-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-dark-700 placeholder:text-dark-400 focus:outline-none w-full font-inter"
              />
            </div>
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative btn-icon"
            >
              <Bell className="w-5 h-5 text-dark-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-dark-900 font-poppins leading-tight">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-[11px] text-dark-500 font-inter">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-dark-400 hidden md:block" />
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-glass-lg border border-dark-100 overflow-hidden py-2"
                  >
                    <Link
                      to="/"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 hover:bg-dark-50 transition-colors"
                    >
                      View Site
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 hover:bg-dark-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <hr className="my-1 border-dark-100" />
                    <button
                      onClick={() => { dispatch(logout()); setProfileOpen(false); navigate('/login'); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
