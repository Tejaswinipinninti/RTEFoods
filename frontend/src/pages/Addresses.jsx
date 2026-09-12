import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit3, Trash2, Check, X } from 'lucide-react';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../services/authService';
import toast from 'react-hot-toast';

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone required'),
  addressLine1: z.string().min(5, 'Address required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().min(6, 'Valid pincode required'),
  isDefault: z.boolean().optional(),
});

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = () => {
    getAddresses()
      .then((data) => setAddresses(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const openAdd = () => {
    setEditingId(null);
    reset({ name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
    setShowModal(true);
  };

  const openEdit = (addr) => {
    setEditingId(addr._id);
    reset({
      name: addr.name,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await updateAddress(editingId, data);
        toast.success('Address updated');
      } else {
        await addAddress(data);
        toast.success('Address added');
      }
      setShowModal(false);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      setDeleteConfirm(null);
      toast.success('Address deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await updateAddress(id, { isDefault: true });
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a._id === id })));
      toast.success('Default address updated');
    } catch (err) {
      toast.error('Failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Addresses</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openAdd}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg transition-all text-xs sm:text-sm"
        >
          <Plus size={14} className="sm:hidden" /> <Plus size={16} className="hidden sm:block" /> Add
        </motion.button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 sm:h-40 bg-white/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <MapPin size={40} className="text-gray-300 mx-auto mb-3 sm:mb-4 sm:hidden" />
          <MapPin size={48} className="text-gray-300 mx-auto mb-4 hidden sm:block" />
          <p className="text-gray-500 text-sm">No addresses saved yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <AnimatePresence>
            {addresses.map((addr) => (
              <motion.div
                key={addr._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all ${
                  addr.isDefault ? 'border-orange-400 shadow-md' : 'border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-2.5 sm:mb-3">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{addr.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{addr.phone}</p>
                  </div>
                  {addr.isDefault && (
                    <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs bg-orange-100 text-orange-700 px-1.5 sm:px-2 py-0.5 rounded-lg font-medium">
                      <Check size={10} className="sm:hidden" /> <Check size={12} className="hidden sm:block" /> Default
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-[10px] sm:text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                  >
                    <Edit3 size={13} className="sm:hidden" />
                    <Edit3 size={14} className="hidden sm:block" />
                  </button>
                  {deleteConfirm === addr._id ? (
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button onClick={() => handleDelete(addr._id)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(addr._id)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={13} className="sm:hidden" />
                      <Trash2 size={14} className="hidden sm:block" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold">{editingId ? 'Edit Address' : 'Add Address'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <input {...register('name')} placeholder="Full Name" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <input {...register('phone')} placeholder="Phone" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <div>
                <input {...register('addressLine1')} placeholder="Address Line 1" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" />
                {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
              </div>
              <input {...register('addressLine2')} placeholder="Address Line 2 (Optional)" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <input {...register('city')} placeholder="City" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <input {...register('state')} placeholder="State" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <input {...register('pincode')} placeholder="Pincode" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <input type="checkbox" {...register('isDefault')} className="accent-orange-500 rounded" />
                Set as default address
              </label>
              <div className="flex gap-2 sm:gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm">
                  {editingId ? 'Update' : 'Save'} Address
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 sm:px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
