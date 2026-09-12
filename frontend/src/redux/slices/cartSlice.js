import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartService from '../../services/cartService';
import { logout } from './authSlice';

export const getCart = createAsyncThunk('cart/getCart', async (_, { rejectWithValue }) => {
  try {
    const response = await cartService.getCart();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to get cart');
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (data, { rejectWithValue }) => {
  try {
    const response = await cartService.addToCart(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/updateCartItem', async (data, { rejectWithValue }) => {
  try {
    const response = await cartService.updateCartItem(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
  }
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (productId, { rejectWithValue }) => {
  try {
    const response = await cartService.removeFromCart(productId);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
  }
});

export const applyCoupon = createAsyncThunk('cart/applyCoupon', async (code, { rejectWithValue }) => {
  try {
    const response = await cartService.applyCoupon(code);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to apply coupon');
  }
});

export const removeCoupon = createAsyncThunk('cart/removeCoupon', async (_, { rejectWithValue }) => {
  try {
    const response = await cartService.removeCoupon();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to remove coupon');
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    const response = await cartService.clearCart();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
  }
});

const calculateTotals = (state) => {
  state.subtotal = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  state.total = state.subtotal - state.couponDiscount;
  state.itemCount = state.items.reduce((acc, item) => acc + item.quantity, 0);
};

const initialState = {
  items: [],
  coupon: null,
  couponDiscount: 0,
  subtotal: 0,
  total: 0,
  itemCount: 0,
  loading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const pId = action.payload.product || action.payload._id || action.payload.id;
      const existingItem = state.items.find((item) => (item.product || item._id || item.id) === pId);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ ...action.payload, product: pId, quantity: action.payload.quantity || 1 });
      }
      calculateTotals(state);
    },
    removeItem: (state, action) => {
      const id = typeof action.payload === 'object' ? (action.payload.id || action.payload.product || action.payload._id) : action.payload;
      state.items = state.items.filter((item) => (item.product || item._id || item.id) !== id);
      calculateTotals(state);
    },
    updateQuantity: (state, action) => {
      const id = action.payload.productId || action.payload.id || action.payload.product;
      const item = state.items.find((item) => (item.product || item._id || item.id) === id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      calculateTotals(state);
    },
    calculateTotals: (state) => {
      calculateTotals(state);
    },
    applyCouponLocal: (state, action) => {
      state.coupon = action.payload.coupon;
      state.couponDiscount = action.payload.discount;
      calculateTotals(state);
    },
    clearCoupon: (state) => {
      state.coupon = null;
      state.couponDiscount = 0;
      calculateTotals(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.coupon = action.payload.coupon || null;
        state.couponDiscount = action.payload.couponDiscount || 0;
        calculateTotals(state);
      })
      .addCase(getCart.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.coupon = action.payload.coupon || null;
        state.couponDiscount = action.payload.couponDiscount || 0;
        calculateTotals(state);
      })
      .addCase(addToCart.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.coupon = action.payload.coupon || null;
        state.couponDiscount = action.payload.couponDiscount || 0;
        calculateTotals(state);
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.coupon = action.payload.coupon || null;
        state.couponDiscount = action.payload.couponDiscount || 0;
        calculateTotals(state);
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.coupon = action.payload.coupon;
        state.couponDiscount = action.payload.couponDiscount || 0;
        state.total = action.payload.total || state.total;
      })
      .addCase(removeCoupon.fulfilled, (state) => {
        state.coupon = null;
        state.couponDiscount = 0;
        calculateTotals(state);
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.coupon = null;
        state.couponDiscount = 0;
        calculateTotals(state);
      })
      .addCase(logout.fulfilled, (state) => {
        state.items = [];
        state.coupon = null;
        state.couponDiscount = 0;
        state.subtotal = 0;
        state.total = 0;
        state.itemCount = 0;
      });
  },
});

export const { addItem, removeItem, updateQuantity, calculateTotals: calcTotals, applyCouponLocal, clearCoupon } = cartSlice.actions;
export default cartSlice.reducer;
