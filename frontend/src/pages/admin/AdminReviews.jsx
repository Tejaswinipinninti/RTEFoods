import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  X,
  Trash2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const statusTabs = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/20 text-red-400',
};

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gray-900 z-10">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`w-4 h-4 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
    ))}
  </div>
);

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReviews?.({ page, status, limit: 10 }) || { data: { reviews: [], totalPages: 1 } };
      const d = res.data;
      const data = d?.data || d;
      setReviews(data?.reviews || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await adminService.getReviewStats?.();
      const d = res?.data;
      setStats(d?.data || d || null);
    } catch (error) {
      console.error('Failed to fetch review stats');
    }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchReviews(); }, [page, status]);

  const handleApprove = async (review) => {
    try {
      await adminService.approveReview?.(review._id);
      toast.success('Review approved');
      fetchReviews();
      fetchStats();
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (review) => {
    try {
      await adminService.rejectReview?.(review._id);
      toast.success('Review rejected');
      fetchReviews();
      fetchStats();
    } catch (error) {
      toast.error('Failed to reject review');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await adminService.replyToReview?.(replyModal._id, { reply: replyText });
      toast.success('Reply sent');
      setReplyModal(null);
      setReplyText('');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteReview?.(deleteModal._id);
      toast.success('Review deleted');
      setDeleteModal(null);
      fetchReviews();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <p className="text-gray-400 mt-1">Manage customer reviews and ratings</p>
      </motion.div>

      {stats && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.averageRating?.toFixed(1) || '0.0'}</p>
                <p className="text-xs text-gray-400">Average Rating</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Star className="w-5 h-5 text-white" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalReviews || 0}</p>
                <p className="text-xs text-gray-400">Total Reviews</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h4 className="text-xs text-gray-400 mb-2">Rating Breakdown</h4>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.breakdown?.[star] || 0;
                const total = stats.totalReviews || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 w-3">{star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-gray-500 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h4 className="text-xs text-gray-400 mb-3">Quick Stats</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Pending</span><span className="text-amber-400 font-medium">{stats.pending || 0}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Approved</span><span className="text-emerald-400 font-medium">{stats.approved || 0}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Rejected</span><span className="text-red-400 font-medium">{stats.rejected || 0}</span></div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button key={tab.key} onClick={() => { setStatus(tab.key); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${status === tab.key ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-sm font-medium text-gray-400">Product</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">User</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Rating</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Comment</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={7} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : reviews.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No reviews found</td></tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white text-sm font-medium max-w-[180px] truncate">{review.product?.name || review.productName || '—'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {review.user?.name?.[0] || 'U'}
                        </div>
                        <span className="text-gray-300 text-sm">{review.user?.name || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="p-4"><StarRating rating={review.rating} /></td>
                    <td className="p-4 text-gray-400 text-sm max-w-[200px] truncate">{review.comment || '—'}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[review.status] || 'bg-gray-500/20 text-gray-400'}`}>{review.status || 'pending'}</span></td>
                    <td className="p-4 text-gray-400 text-sm">{formatDate(review.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {review.status !== 'approved' && (
                          <button onClick={() => handleApprove(review)} title="Approve" className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                        )}
                        {review.status !== 'rejected' && (
                          <button onClick={() => handleReject(review)} title="Reject" className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => { setReplyModal(review); setReplyText(review.reply || ''); }} title="Reply" className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"><MessageSquare className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteModal(review)} title="Delete" className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <p className="text-sm text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </motion.div>

      <Modal isOpen={!!replyModal} onClose={() => { setReplyModal(null); setReplyText(''); }} title="Reply to Review">
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-medium text-sm">{replyModal?.user?.name || 'Anonymous'}</span>
              <StarRating rating={replyModal?.rating} />
            </div>
            <p className="text-gray-400 text-sm">{replyModal?.comment}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Your Reply</label>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} placeholder="Write your reply..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setReplyModal(null); setReplyText(''); }} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleReply} disabled={!replyText.trim()} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50">Send Reply</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Review">
        <p className="text-gray-300 mb-6">Are you sure you want to delete this review?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </motion.div>
  );
}
