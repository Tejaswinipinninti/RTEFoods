import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import {
  User, ShoppingCart, Heart, MapPin,
  LogOut, Menu, ChevronDown
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { logout } from '../redux/slices/authSlice';

const userMenuItems = [
  { name: 'My Profile', path: '/profile', icon: User },
  { name: 'Addresses', path: '/profile/addresses', icon: MapPin },
  { name: 'My Orders', path: '/orders', icon: ShoppingCart },
  { name: 'Wishlist', path: '/wishlist', icon: Heart },
];

const UserLayout = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const initial = user?.firstName?.[0] || user?.name?.charAt(0)?.toUpperCase() || 'U';

  const isActive = (path) => {
    if (path === '/profile') return location.pathname === '/profile' || location.pathname === '/user/profile';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-dark-50">
      <div className="container-premium py-8">
        {/* Mobile Menu Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-glass"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold">
                {initial}
              </div>
              <div className="text-left">
                <p className="font-semibold text-dark-900 font-poppins">{displayName}</p>
                <p className="text-xs text-dark-500 font-inter">{user?.email || ''}</p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-dark-400 transition-transform ${
                mobileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside
            className={`${
              mobileMenuOpen ? 'block' : 'hidden'
            } lg:block w-full lg:w-64 shrink-0`}
          >
            <div className="bg-white rounded-2xl shadow-glass overflow-hidden sticky top-24">
              {/* User Info */}
              <div className="p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-2xl font-bold mb-3">
                  {initial}
                </div>
                <p className="font-poppins font-bold text-lg leading-tight">
                  {displayName}
                </p>
                <p className="text-white/70 text-sm font-inter truncate">
                  {user?.email || ''}
                </p>
              </div>

              {/* Menu Items */}
              <nav className="p-3">
                {userMenuItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-poppins font-medium transition-all ${
                        active
                          ? 'bg-primary-500/10 text-primary-600'
                          : 'text-dark-600 hover:bg-dark-50'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${active ? 'text-primary-500' : 'text-dark-400'}`} />
                      {item.name}
                      {active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                      )}
                    </Link>
                  );
                })}

                <hr className="my-2 border-dark-100" />

                <button
                  onClick={() => dispatch(logout())}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-poppins font-medium text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-glass p-6 md:p-8">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
