import api from './api';

export const createOrder = (data) => api.post('/orders', data);

export const getMyOrders = (params) => api.get('/orders/my-orders', { params });

export const getAllOrders = (params) => api.get('/orders', { params });

export const getOrder = (id) => api.get(`/orders/${id}`);
export const getOrderById = (id) => api.get(`/orders/${id}`);

export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);

export const cancelOrder = (id, reason) => api.post(`/orders/${id}/cancel`, { reason });
