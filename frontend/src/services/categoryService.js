import api from './api';

export const getCategories = (params) => api.get('/categories', { params });

export const getAllCategories = () => api.get('/categories/all');

export const getCategory = (id) => api.get(`/categories/${id}`);
