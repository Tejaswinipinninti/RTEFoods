import api from './api';

export const getProducts = (params) => api.get('/products', { params });

export const getProduct = (id) => api.get(`/products/${id}`);

export const getFeaturedProducts = () => api.get('/products/featured');

export const getBestsellers = () => api.get('/products/bestsellers');

export const getTodaysSpecials = () => api.get('/products/todays-specials');

export const getCombos = () => api.get('/products/combos');

export const getRelatedProducts = (id) => api.get(`/products/${id}/related`);
