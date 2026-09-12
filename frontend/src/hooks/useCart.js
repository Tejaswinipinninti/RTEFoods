import { useSelector } from 'react-redux';

const useCart = () => {
  const cartState = useSelector((state) => state.cart || {});
  const items = cartState.items || [];
  const coupon = cartState.coupon || null;
  const couponDiscount = cartState.couponDiscount || 0;
  const subtotal = cartState.subtotal || 0;
  const total = cartState.total || 0;
  const itemCount = cartState.itemCount || 0;
  const loading = cartState.loading || false;
  const tax = Math.round(subtotal * 0.05);
  const shipping = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const discount = couponDiscount;
  const grandTotal = subtotal - discount + shipping + tax;

  return {
    items,
    cart: items,
    coupon,
    couponDiscount,
    discount,
    subtotal,
    total,
    tax,
    shipping,
    grandTotal,
    itemCount,
    loading
  };
};

export default useCart;
