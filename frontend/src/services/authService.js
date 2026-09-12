import api from './api';

export const register = (data) => api.post('/auth/register', data);

export const login = (data) => api.post('/auth/login', data);

export const logout = () => api.post('/auth/logout');

export const getMe = () => api.get('/auth/me');

export const socialLogin = (data) => api.post('/auth/social', data);

export const updateProfile = (data) => api.put('/auth/profile', data);

export const changePassword = (data) => api.put('/auth/change-password', data);

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

export const resetPassword = (token, data) => api.put(`/auth/reset-password/${token}`, data);

export const getAddresses = () => api.get('/auth/addresses');

export const addAddress = (data) => api.post('/auth/addresses', data);

export const updateAddress = (id, data) => api.put(`/auth/addresses/${id}`, data);

export const deleteAddress = (id) => api.delete(`/auth/addresses/${id}`);
