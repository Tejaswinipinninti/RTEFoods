import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Mail, Phone, MapPin, Facebook, Instagram, Twitter,
  Youtube, MessageCircle, ArrowRight, Heart
} from 'lucide-react';
import api from '../services/api';

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'Categories', path: '/categories' },
  { name: 'Products', path: '/products' },
  { name: 'About', path: '/about' },
];

const customerLinks = [
  { name: 'My Account', path: '/profile' },
  { name: 'Orders', path: '/orders' },
  { name: 'Wishlist', path: '/wishlist' },
  { name: 'Contact', path: '/contact' },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-pink-500' },
  { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
  { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:bg-red-600' },
  { icon: MessageCircle, href: '#', label: 'WhatsApp', color: 'hover:bg-green-500' },
];

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await api.post('/newsletter/subscribe', { email: email.trim() });
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'Email already subscribed') {
        toast.error('This email is already subscribed');
      } else {
        toast.success('Subscribed successfully!');
        setEmail('');
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-poppins font-bold mb-2">
                  Subscribe to Our{' '}
                  <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                    Newsletter
                  </span>
                </h3>
                <p className="text-gray-400 font-inter text-sm sm:text-base">
                  Get exclusive offers, new arrivals, and food tips delivered to your inbox.
                </p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto gap-2">
                <div className="relative flex-1 md:w-72">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all font-inter text-sm"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-poppins font-semibold px-5 sm:px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-orange-500/25 transition-all shrink-0 text-sm"
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-1">
              <span className="text-2xl font-poppins font-extrabold text-orange-500">RTE</span>
              <span className="text-2xl font-poppins font-extrabold text-green-500">Foods</span>
            </Link>
            <p className="text-gray-400 font-inter text-sm leading-relaxed">
              Premium quality food products delivered fresh to your doorstep. We source the finest ingredients to bring you the best culinary experience.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-bold text-white mb-4 text-base sm:text-lg">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-orange-400 font-inter text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500/40 group-hover:bg-orange-500 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-poppins font-bold text-white mb-4 text-base sm:text-lg">Customer Service</h4>
            <ul className="space-y-2.5">
              {customerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-orange-400 font-inter text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/40 group-hover:bg-green-500 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-bold text-white mb-4 text-base sm:text-lg">Contact Us</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-gray-400 font-inter text-sm leading-relaxed">
                  123 Food Street, Gourmet District, Mumbai, Maharashtra 400001
                </p>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-orange-400" />
                </div>
                <a href="tel:+919876543210" className="text-gray-400 hover:text-orange-400 font-inter text-sm transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-orange-400" />
                </div>
                <a href="mailto:support@rtefoods.com" className="text-gray-400 hover:text-orange-400 font-inter text-sm transition-colors">
                  support@rtefoods.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 font-inter text-xs sm:text-sm text-center sm:text-left">
            &copy; {new Date().getFullYear()} RTE Foods. All rights reserved.
          </p>
          <p className="text-gray-500 font-inter text-xs flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for food lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
