import api from './api';

export const getWishlist = () => api.get('/wishlist');

export const toggleWishlist = (productId) => api.post('/wishlist/toggle', { productId });

export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);

export const checkInWishlist = (productId) => api.get(`/wishlist/check/${productId}`);
