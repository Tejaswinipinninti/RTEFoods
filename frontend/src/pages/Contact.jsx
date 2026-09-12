import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

const contactInfo = [
  { icon: MapPin, title: 'Address', lines: ['123 Food Street', 'Mumbai, Maharashtra 400001'] },
  { icon: Phone, title: 'Phone', lines: ['+91 98765 43210', '+91 22 1234 5678'] },
  { icon: Mail, title: 'Email', lines: ['support@rtefoods.com', 'info@rtefoods.com'] },
  { icon: Clock, title: 'Hours', lines: ['Mon - Sat: 9AM - 9PM', 'Sun: 10AM - 6PM'] },
];

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('Message sent! We\'ll get back to you soon.');
      reset();
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4"
          >
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Touch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base"
          >
            Have a question or feedback? We'd love to hear from you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-5 sm:mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <input
                    {...register('name')}
                    placeholder="Your Name"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-gray-50 text-sm"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-gray-50 text-sm"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <input
                    {...register('phone')}
                    placeholder="Phone Number"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-gray-50 text-sm"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <input
                    {...register('subject')}
                    placeholder="Subject"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-gray-50 text-sm"
                  />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>
              </div>
              <div>
                <textarea
                  {...register('message')}
                  placeholder="Your Message"
                  rows={5}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-gray-50 resize-none text-sm"
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-sm sm:text-base"
              >
                <Send size={16} className="sm:hidden" />
                <Send size={18} className="hidden sm:block" />
                {loading ? 'Sending...' : 'Send Message'}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {contactInfo.map((info, idx) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-2.5 sm:mb-3">
                    <info.icon size={16} className="text-white sm:hidden" />
                    <info.icon size={18} className="text-white hidden sm:block" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-0.5 sm:mb-1 text-sm">{info.title}</h3>
                  {info.lines.map((line, i) => (
                    <p key={i} className="text-xs sm:text-sm text-gray-500">{line}</p>
                  ))}
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-40 sm:h-48 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MapPin size={28} className="mx-auto mb-1.5 sm:mb-2 sm:hidden" />
                <MapPin size={32} className="mx-auto mb-2 hidden sm:block" />
                <p className="text-xs sm:text-sm">Map placeholder</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
              <h3 className="font-bold text-gray-800 mb-2.5 sm:mb-3 text-sm sm:text-base">Follow Us</h3>
              <div className="flex gap-2.5 sm:gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                  <motion.a
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href="#"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white hover:shadow-lg transition-all"
                  >
                    <Icon size={16} className="sm:hidden" />
                    <Icon size={18} className="hidden sm:block" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
