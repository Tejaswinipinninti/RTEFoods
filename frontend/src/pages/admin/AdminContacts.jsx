import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Reply,
  CheckCircle,
  Trash2,
  X,
  Mail,
  Clock,
  MessageSquare,
  AlertCircle,
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
  { key: 'read', label: 'Read' },
  { key: 'replied', label: 'Replied' },
  { key: 'resolved', label: 'Resolved' },
];

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400',
  read: 'bg-blue-500/20 text-blue-400',
  replied: 'bg-indigo-500/20 text-indigo-400',
  resolved: 'bg-emerald-500/20 text-emerald-400',
};

const priorityColors = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-red-500/20 text-red-400',
};

const Modal = ({ isOpen, onClose, title, children, wide }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`w-full ${wide ? 'max-w-3xl' : 'max-w-2xl'} bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
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

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewModal, setViewModal] = useState(null);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await adminService.getContacts({ page, status, limit: 10 });
      const d = res.data;
      const data = d?.data || d;
      setContacts(data?.contacts || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pages || data?.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, [page, status]);

  const handleView = async (contact) => {
    setViewModal(contact);
    if (contact.status === 'pending') {
      try {
        await adminService.updateContactStatus(contact._id, { status: 'read' });
        fetchContacts();
      } catch (error) { /* silent */ }
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await adminService.replyContact(replyModal._id, { message: replyText });
      toast.success('Reply sent');
      setReplyModal(null);
      setReplyText('');
      fetchContacts();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleResolve = async (contact) => {
    try {
      await adminService.updateContactStatus(contact._id, { status: 'resolved' });
      toast.success('Marked as resolved');
      fetchContacts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteContact?.(deleteModal._id) || await adminService.updateContactStatus(deleteModal._id, { status: 'archived' });
      toast.success('Contact deleted');
      setDeleteModal(null);
      fetchContacts();
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const pendingCount = contacts.filter((c) => c.status === 'pending').length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
          <p className="text-gray-400 mt-1">Manage customer inquiries and messages</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">{contacts.length} messages</span>
            {pendingCount > 0 && <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">{pendingCount} new</span>}
          </div>
        </div>
      </motion.div>

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
                <th className="p-4 text-left text-sm font-medium text-gray-400">Name</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Email</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Subject</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Type</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Priority</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={8} className="p-4"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : contacts.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No messages found</td></tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact._id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${contact.status === 'pending' ? 'bg-white/[0.02]' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {contact.name?.[0] || 'U'}
                        </div>
                        <span className="text-white text-sm font-medium">{contact.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{contact.email}</td>
                    <td className="p-4 text-gray-300 text-sm max-w-[180px] truncate">{contact.subject}</td>
                    <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">{contact.type || 'general'}</span></td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[contact.status] || 'bg-gray-500/20 text-gray-400'}`}>{contact.status}</span></td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${priorityColors[contact.priority] || 'bg-gray-500/20 text-gray-400'}`}>{contact.priority || 'medium'}</span></td>
                    <td className="p-4 text-gray-400 text-sm">{formatDate(contact.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleView(contact)} title="View" className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setReplyModal(contact); setReplyText(''); }} title="Reply" className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Reply className="w-4 h-4" /></button>
                        <button onClick={() => handleResolve(contact)} title="Mark Resolved" className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteModal(contact)} title="Delete" className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Message Details" wide>
        {viewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">From</p>
                <p className="text-white font-medium">{viewModal.name}</p>
                <p className="text-gray-400 text-sm">{viewModal.email}</p>
                {viewModal.phone && <p className="text-gray-400 text-sm">{viewModal.phone}</p>}
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">Details</p>
                <p className="text-white text-sm">Subject: {viewModal.subject}</p>
                <p className="text-gray-400 text-sm">Type: {viewModal.type || 'general'}</p>
                <p className="text-gray-400 text-sm">Priority: {viewModal.priority || 'medium'}</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-gray-400 mb-2">Message</p>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{viewModal.message}</p>
            </div>
            {viewModal.reply && (
              <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20">
                <p className="text-xs text-indigo-400 mb-2">Your Reply</p>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{viewModal.reply}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!replyModal} onClose={() => { setReplyModal(null); setReplyText(''); }} title="Reply to Message">
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-medium text-sm">{replyModal?.name}</span>
              <span className="text-gray-500 text-sm">({replyModal?.email})</span>
            </div>
            <p className="text-gray-400 text-sm">{replyModal?.subject}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Your Reply</label>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={5} placeholder="Write your reply..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setReplyModal(null); setReplyText(''); }} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleReply} disabled={!replyText.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50">
              <Reply className="w-4 h-4" /> Send Reply
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Message">
        <p className="text-gray-300 mb-6">Are you sure you want to delete this message from <span className="text-white font-medium">{deleteModal?.name}</span>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </motion.div>
  );
}
