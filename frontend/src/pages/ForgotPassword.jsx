import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../services/authService';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-300"
        animate={{
          background: [
            'linear-gradient(135deg, #f97316, #f59e0b, #eab308)',
            'linear-gradient(135deg, #f59e0b, #eab308, #f97316)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-4"
            >
              <Mail size={28} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>
            <p className="text-gray-500 mt-1">No worries, we'll send you reset instructions</p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Reset link sent!</p>
              <p className="text-gray-500 text-sm mt-2">Check your email and follow the instructions to reset your password.</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Email address"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white/50"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                <Send size={18} />
                {loading ? 'Sending...' : 'Send Reset Link'}
              </motion.button>
            </form>
          )}

          {!sent && (
            <p className="text-center text-sm text-gray-600 mt-6">
              <Link to="/login" className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium">
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
