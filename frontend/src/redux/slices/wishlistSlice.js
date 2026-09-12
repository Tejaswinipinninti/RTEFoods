import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as wishlistService from '../../services/wishlistService';

export const getWishlist = createAsyncThunk('wishlist/getWishlist', async (_, { rejectWithValue }) => {
  try {
    const response = await wishlistService.getWishlist();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to get wishlist');
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggleWishlist', async (productId, { rejectWithValue }) => {
  try {
    const response = await wishlistService.toggleWishlist(productId);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to toggle wishlist');
  }
});

const initialState = {
  items: [],
  loading: false,
  productIds: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlistItem: (state, action) => {
      const productId = action.payload;
      const index = state.productIds.indexOf(productId);
      if (index > -1) {
        state.productIds.splice(index, 1);
        state.items = state.items.filter((item) => item._id !== productId);
      } else {
        state.productIds.push(productId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const listData = action.payload.data || action.payload.items || (Array.isArray(action.payload) ? action.payload : []);
        const products = Array.isArray(listData)
          ? listData.map((item) => item.product || item).filter(Boolean)
          : [];
        state.items = products;
        state.productIds = products.map((p) => p._id || p.id);
      })
      .addCase(getWishlist.rejected, (state) => {
        state.loading = false;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta?.arg) {
          const toggledId = action.meta.arg;
          const idx = state.productIds.indexOf(toggledId);
          if (idx > -1) {
            state.productIds.splice(idx, 1);
            state.items = state.items.filter((item) => (item._id || item.id) !== toggledId);
          } else {
            state.productIds.push(toggledId);
          }
        }
      });
  },
});

export const { toggleWishlistItem } = wishlistSlice.actions;
export default wishlistSlice.reducer;
