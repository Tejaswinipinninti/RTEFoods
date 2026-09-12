import api from './api';

export const createReview = (data) => api.post('/reviews', data);

export const getProductReviews = (productId) => api.get(`/reviews/product/${productId}`);

export const deleteReview = (id) => api.delete(`/reviews/${id}`);

export const getRatingStats = (productId) => api.get(`/reviews/product/${productId}/stats`);
