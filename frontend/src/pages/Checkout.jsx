import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, Clock, FileText, Plus, Check, ShieldCheck, Smartphone, Building2, Banknote } from 'lucide-react';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { createOrder } from '../services/orderService';
import { getAddresses, addAddress } from '../services/authService';
import { getCart } from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode required'),
  isDefault: z.boolean().optional(),
});

const PAYMENT_METHODS = [
  { id: 'phonepe', name: 'PhonePe', icon: '🟣', description: 'PhonePe UPI & Wallet', badge: 'Popular' },
  { id: 'gpay', name: 'Google Pay (GPay)', icon: '🔵', description: 'GPay Instant Payment', badge: 'Fast' },
  { id: 'paytm', name: 'Paytm', icon: '🟦', description: 'Paytm Wallet & UPI', badge: 'Instant' },
  { id: 'upi', name: 'UPI ID / QR Code', icon: '📱', description: 'Any UPI (BHIM, CRED, Amazon)', badge: '' },
  { id: 'card', name: 'Credit / Debit Card', icon: '💳', description: 'Visa, Mastercard, RuPay', badge: '' },
  { id: 'netbanking', name: 'Net Banking', icon: '🏦', description: 'SBI, HDFC, ICICI, Axis', badge: '' },
  { id: 'cod', name: 'Cash on Delivery (COD)', icon: '💵', description: 'Pay cash upon delivery', badge: 'Zero Fee' },
];

const TIME_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '02:00 PM - 04:00 PM',
  '05:00 PM - 07:00 PM',
  '07:00 PM - 09:00 PM',
];

const NET_BANKING_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank'
];

export default function Checkout() {
  const { items, subtotal, tax, shipping, coupon, discount, grandTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('phonepe');

  const [upiId, setUpiId] = useState('9876543210@ybl');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');

  const today = new Date().toISOString().split('T')[0];
  const [deliveryDate, setDeliveryDate] = useState(today);
  const [deliverySlot, setDeliverySlot] = useState(TIME_SLOTS[0]);
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    getAddresses()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
        setAddresses(list);
        const def = list.find((a) => a?.isDefault);
        if (def) setSelectedAddress(def._id);
        else if (list.length) setSelectedAddress(list[0]._id);
      })
      .catch((err) => console.error(err));
  }, [isAuthenticated]);

  const handleAddAddress = async (data) => {
    try {
      const res = await addAddress(data);
      const newAddr = res?.data?.data || res?.data || res;
      if (newAddr) {
        setAddresses((prev) => [...prev, newAddr]);
        if (newAddr._id) setSelectedAddress(newAddr._id);
      }
      setShowNewAddress(false);
      reset();
      toast.success('Address saved!');
    } catch (err) {
      toast.error('Failed to add address');
      console.error(err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address');
      return;
    }
    if (!deliveryDate || !deliverySlot) {
      toast.error('Please select delivery date and slot');
      return;
    }

    let paymentDetails = {};

    if (['phonepe', 'gpay', 'paytm', 'upi'].includes(paymentMethod)) {
      if (!upiId || upiId.trim().length < 3) {
        toast.error(`Please enter your ${paymentMethod.toUpperCase()} ID or Mobile Number`);
        return;
      }
      paymentDetails = { upiId: upiId.trim(), type: 'UPI' };
    } else if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 15) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardExpiry || !cardCvv) {
        toast.error('Please enter card expiry and CVV');
        return;
      }
      paymentDetails = { cardLast4: cardNumber.slice(-4), cardHolder: cardHolder || 'Valued Customer', type: 'CARD' };
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        toast.error('Please select a bank for Net Banking');
        return;
      }
      paymentDetails = { bankName: selectedBank, type: 'NETBANKING' };
    } else {
      paymentDetails = { type: 'COD' };
    }

    setLoading(true);
    try {
      const selectedAddrObj = addresses.find((a) => a._id === selectedAddress);
      const orderData = {
        addressId: selectedAddress,
        shippingAddress: selectedAddrObj,
        paymentMethod,
        paymentDetails,
        deliveryDate,
        deliverySlot,
        notes: orderNotes,
        couponCode: coupon?.code,
      };

      const response = await createOrder(orderData);
      const createdOrder = response.data?.data || response.data;
      dispatch(getCart());
      toast.success('Order placed successfully!');
      if (createdOrder && createdOrder._id) {
        navigate(`/order/${createdOrder._id}`, { state: { orderPlaced: true } });
      } else {
        navigate('/orders');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to place order';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/60 backdrop-blur-md rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-10 max-w-md w-full"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Please login to checkout</h2>
          <p className="text-gray-500 mb-6 text-sm">Sign in to complete your purchase securely.</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
          >
            Login to Checkout
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-6 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <nav className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <Link to="/" className="hover:text-orange-500">Home</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <Link to="/cart" className="hover:text-orange-500">Cart</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-orange-600 font-medium">Checkout</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Checkout & Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2 mb-3 sm:mb-4">
                <MapPin size={20} className="text-orange-500" />
                Select Delivery Address
              </h2>

              {addresses.length === 0 && !showNewAddress && (
                <div className="p-3 sm:p-4 bg-orange-50 rounded-xl text-center text-xs sm:text-sm text-orange-800 mb-4">
                  No saved addresses found. Please add a delivery address below.
                </div>
              )}

              <div className="space-y-2.5 sm:space-y-3">
                {addresses.map((addr) => (
                  <motion.label
                    key={addr._id}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddress === addr._id
                        ? 'border-orange-500 bg-orange-50/60 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr._id}
                      checked={selectedAddress === addr._id}
                      onChange={() => setSelectedAddress(addr._id)}
                      className="mt-1 accent-orange-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 text-sm">{addr.name}</p>
                        <span className="text-[10px] sm:text-xs text-gray-500 font-normal">({addr.phone})</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                        {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                        {addr.city}, {addr.state} - <span className="font-semibold">{addr.pincode}</span>
                      </p>
                    </div>
                    {addr.isDefault && (
                      <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </motion.label>
                ))}
              </div>

              {!showNewAddress ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewAddress(true)}
                  className="mt-3 sm:mt-4 flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 text-sm"
                >
                  <Plus size={18} /> Add New Address
                </motion.button>
              ) : (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleSubmit(handleAddAddress)}
                  className="mt-3 sm:mt-4 p-4 sm:p-5 bg-orange-50/40 rounded-2xl border border-orange-100 space-y-3 sm:space-y-4"
                >
                  <h3 className="font-bold text-gray-800 text-sm">Add New Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <input {...register('name')} placeholder="Full Name" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-white" />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <input {...register('phone')} placeholder="Phone Number" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-white" />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>
                  <div>
                    <input {...register('addressLine1')} placeholder="Flat, House no., Building, Company, Apartment" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-white" />
                    {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
                  </div>
                  <input {...register('addressLine2')} placeholder="Area, Street, Sector, Village (Optional)" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-white" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <input {...register('city')} placeholder="Town/City" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-white" />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <input {...register('state')} placeholder="State" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-white" />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                    </div>
                    <div>
                      <input {...register('pincode')} placeholder="6-digit Pincode" className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-white" />
                      {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" {...register('isDefault')} className="accent-orange-500 rounded" />
                    Make this my default address
                  </label>
                  <div className="flex gap-2 sm:gap-3 pt-2">
                    <button type="submit" className="flex-1 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold shadow-md text-sm">Save Address</button>
                    <button type="button" onClick={() => setShowNewAddress(false)} className="px-4 sm:px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-medium text-sm">Cancel</button>
                  </div>
                </motion.form>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2 mb-3 sm:mb-4">
                <Clock size={20} className="text-orange-500" />
                Select Delivery Slot
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Delivery Date</label>
                  <input
                    type="date"
                    min={today}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none font-medium text-sm text-gray-800 bg-white w-full sm:w-auto"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preferred Time Slot</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {TIME_SLOTS.map((slot) => (
                      <motion.button
                        key={slot}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setDeliverySlot(slot)}
                        className={`p-2.5 sm:p-3 rounded-xl border-2 text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-between ${
                          deliverySlot === slot
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        <span>{slot}</span>
                        {deliverySlot === slot && <Check className="w-4 h-4 text-orange-600" />}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <span className="flex items-center gap-2">
                  <CreditCard size={20} className="text-orange-500" />
                  Payment Options
                </span>
                <span className="text-[10px] sm:text-xs text-green-600 font-semibold flex items-center gap-1 bg-green-50 px-2 py-0.5 sm:py-1 rounded-full border border-green-200">
                  <ShieldCheck size={12} className="hidden sm:block" /> SSL Encrypted
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {PAYMENT_METHODS.map((method) => (
                  <motion.label
                    key={method.id}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-orange-500 bg-orange-50/70 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="mt-1 accent-orange-500"
                    />
                    <span className="text-lg sm:text-2xl">{method.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <p className="font-semibold text-xs sm:text-sm text-gray-800">{method.name}</p>
                        {method.badge && (
                          <span className="text-[9px] sm:text-[10px] uppercase font-bold bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full">
                            {method.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{method.description}</p>
                    </div>
                  </motion.label>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {['phonepe', 'gpay', 'paytm', 'upi'].includes(paymentMethod) && (
                  <motion.div
                    key="upi-box"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-purple-600" />
                        Enter {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name} Details
                      </h4>
                      <span className="text-[9px] sm:text-xs text-purple-700 bg-purple-100 font-semibold px-2 py-0.5 rounded-full hidden sm:inline">
                        Instant Auto-Approval
                      </span>
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs text-gray-600 font-medium mb-1">
                        UPI ID or Registered Mobile Number:
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. 9876543210@ybl"
                          className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm bg-white font-medium text-gray-800"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs pt-1">
                      <span className="text-gray-500 self-center hidden sm:inline">Quick Fill:</span>
                      <button type="button" onClick={() => setUpiId('9876543210@ybl')} className="px-2 py-1 bg-white border border-gray-200 rounded-lg hover:border-purple-400">PhonePe</button>
                      <button type="button" onClick={() => setUpiId('customer@okaxis')} className="px-2 py-1 bg-white border border-gray-200 rounded-lg hover:border-purple-400">GPay</button>
                      <button type="button" onClick={() => setUpiId('9876543210@paytm')} className="px-2 py-1 bg-white border border-gray-200 rounded-lg hover:border-purple-400">Paytm</button>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'card' && (
                  <motion.div
                    key="card-box"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 rounded-2xl border border-blue-100 space-y-3 sm:space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        Credit or Debit Card Details
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setCardNumber('4532 8910 2345 6789');
                          setCardHolder('Tejaswini Customer');
                          setCardExpiry('12/28');
                          setCardCvv('789');
                        }}
                        className="text-[10px] sm:text-xs text-blue-700 underline font-medium"
                      >
                        Auto-fill Test Card
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs text-gray-600 font-medium mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 8910 2345 6789"
                        className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                      <div className="sm:col-span-1">
                        <label className="block text-[10px] sm:text-xs text-gray-600 font-medium mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name on card"
                          className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs text-gray-600 font-medium mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs text-gray-600 font-medium mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm bg-white font-mono"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'netbanking' && (
                  <motion.div
                    key="netbanking-box"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 space-y-3"
                  >
                    <h4 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      Select Bank for Net Banking
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {NET_BANKING_BANKS.map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2 sm:p-2.5 rounded-xl border text-[10px] sm:text-xs font-semibold text-left transition-all ${
                            selectedBank === bank
                              ? 'border-amber-500 bg-amber-100 text-amber-900 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-amber-300 text-gray-700'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'cod' && (
                  <motion.div
                    key="cod-box"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 sm:p-4 bg-green-50/80 rounded-2xl border border-green-200 flex items-center gap-3"
                  >
                    <Banknote className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 shrink-0" />
                    <div>
                      <p className="font-bold text-green-900 text-xs sm:text-sm">Cash on Delivery Selected</p>
                      <p className="text-[10px] sm:text-xs text-green-700">Pay cash or UPI QR scan when your fresh meal arrives at your doorstep.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
                <FileText size={20} className="text-orange-500" />
                Delivery Instructions
              </h2>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Write any special instructions for the delivery executive or kitchen..."
                rows={3}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none resize-none text-sm bg-gray-50"
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl border border-gray-200 shadow-xl p-5 sm:p-6 space-y-4 sm:space-y-5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 border-b border-gray-100 pb-3">Order Summary</h2>

              <div className="space-y-2.5 sm:space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center gap-2.5 sm:gap-3">
                    <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-gray-100 shadow-sm flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">{formatPrice((item.price || 0) * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Special Discount</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span className="font-semibold">{shipping === 0 ? <span className="text-green-600 uppercase font-bold">FREE</span> : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST & Taxes (5%)</span>
                  <span className="font-semibold text-gray-800">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-extrabold border-t border-gray-200 pt-2.5 sm:pt-3 text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-orange-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || loading}
                className="w-full py-3 sm:py-4 font-bold text-white bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 text-center text-sm sm:text-base"
              >
                {loading ? 'Processing Order...' : `Pay & Place Order (${formatPrice(grandTotal)})`}
              </motion.button>

              <div className="text-center pt-1">
                <span className="text-[10px] sm:text-[11px] text-gray-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
                  Guaranteed Safe & Secure Checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
