export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'packed', label: 'Packed', color: 'indigo' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'orange' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'returned', label: 'Returned', color: 'gray' },
  { value: 'refunded', label: 'Refunded', color: 'gray' },
];

export const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', icon: 'Banknote' },
  { value: 'upi', label: 'UPI Payment', icon: 'Smartphone' },
  { value: 'card', label: 'Credit/Debit Card', icon: 'CreditCard' },
  { value: 'netbanking', label: 'Net Banking', icon: 'Building2' },
  { value: 'wallet', label: 'Wallet', icon: 'Wallet' },
  { value: 'razorpay', label: 'Razorpay', icon: 'Shield' },
];

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'gray' },
];

export const COUPON_TYPES = [
  { value: 'percentage', label: 'Percentage Discount' },
  { value: 'flat', label: 'Flat Discount' },
  { value: 'free_shipping', label: 'Free Shipping' },
];

export const BANNER_TYPES = [
  { value: 'homepage', label: 'Homepage Carousel' },
  { value: 'category', label: 'Category Banner' },
  { value: 'offer', label: 'Offer Banner' },
  { value: 'popup', label: 'Popup Banner' },
];

export const OFFER_TYPES = [
  { value: 'festival', label: 'Festival Offer' },
  { value: 'combo', label: 'Combo Offer' },
  { value: 'flash_sale', label: 'Flash Sale' },
  { value: 'bogo', label: 'Buy One Get One' },
  { value: 'featured', label: 'Featured Offer' },
];

export const PRODUCT_STATUS = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
  { value: 'out_of_stock', label: 'Out of Stock', color: 'red' },
];

export const CONTACT_STATUS = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'read', label: 'Read', color: 'gray' },
  { value: 'replied', label: 'Replied', color: 'green' },
  { value: 'archived', label: 'Archived', color: 'gray' },
];

export const NOTIFICATION_TYPES = [
  { value: 'order', label: 'Order' },
  { value: 'stock', label: 'Stock' },
  { value: 'offer', label: 'Offer' },
  { value: 'system', label: 'System' },
  { value: 'promo', label: 'Promotion' },
  { value: 'alert', label: 'Alert' },
];

export const DELIVERY_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  packed: { label: 'Packed', color: 'bg-indigo-100 text-indigo-700' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  returned: { label: 'Returned', color: 'bg-gray-100 text-gray-700' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
};

export const UPI_APPS = [
  { id: 'phonepe', name: 'PhonePe', color: '#5F259F' },
  { id: 'gpay', name: 'Google Pay', color: '#4285F4' },
  { id: 'paytm', name: 'Paytm', color: '#00BAF2' },
  { id: 'bhim', name: 'BHIM', color: '#097969' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'featured', label: 'Featured' },
];

export const ITEMS_PER_PAGE_OPTIONS = [12, 24, 36, 48];
