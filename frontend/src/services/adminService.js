import api from './api';

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getRevenue = () => api.get('/dashboard/revenue');
export const getTopProducts = () => api.get('/dashboard/top-products');
export const getRecentOrders = () => api.get('/dashboard/recent-orders');
export const getRecentUsers = () => api.get('/dashboard/recent-users');

// Categories
export const getCategories = (params) => api.get('/categories', { params });
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
export const bulkDeleteCategories = (ids) => api.post('/categories/bulk-delete', { ids });

// Subcategories
export const getSubcategories = (params) => api.get('/subcategories', { params });
export const createSubcategory = (data) => api.post('/subcategories', data);
export const updateSubcategory = (id, data) => api.put(`/subcategories/${id}`, data);
export const deleteSubcategory = (id) => api.delete(`/subcategories/${id}`);
export const bulkDeleteSubcategories = (ids) => api.post('/subcategories/bulk-delete', { ids });

// Products
export const getProducts = (params) => api.get('/products', { params });
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const duplicateProduct = (id) => api.post(`/products/${id}/duplicate`);
export const bulkDeleteProducts = (ids) => api.post('/products/bulk-delete', { ids });
export const bulkUpdateProductStatus = (ids, status) => api.post('/products/bulk-update-status', { ids, status });
export const exportProductsCSV = () => api.get('/products/export', { responseType: 'blob' });

// Orders
export const getOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);
export const getOrderStats = () => api.get('/orders/stats');
export const bulkUpdateOrderStatus = (ids, status) => api.post('/orders/bulk-update-status', { ids, status });

// Users/Customers
export const getUsers = (params) => api.get('/users', { params });
export const blockUser = (id) => api.put(`/users/${id}/block`);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getUserDetails = (id) => api.get(`/users/${id}`);

// Coupons
export const getCoupons = (params) => api.get('/coupons', { params });
export const createCoupon = (data) => api.post('/coupons', data);
export const updateCoupon = (id, data) => api.put(`/coupons/${id}`, data);
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`);

// Banners
export const getBanners = (params) => api.get('/banners', { params });
export const createBanner = (data) => api.post('/banners', data);
export const updateBanner = (id, data) => api.put(`/banners/${id}`, data);
export const deleteBanner = (id) => api.delete(`/banners/${id}`);

// Offers
export const getOffers = (params) => api.get('/offers', { params });
export const createOffer = (data) => api.post('/offers', data);
export const updateOffer = (id, data) => api.put(`/offers/${id}`, data);
export const deleteOffer = (id) => api.delete(`/offers/${id}`);

// Blogs
export const getBlogs = (params) => api.get('/blogs', { params });
export const createBlog = (data) => api.post('/blogs', data);
export const updateBlog = (id, data) => api.put(`/blogs/${id}`, data);
export const deleteBlog = (id) => api.delete(`/blogs/${id}`);

// FAQs
export const getFAQs = (params) => api.get('/faqs', { params });
export const createFAQ = (data) => api.post('/faqs', data);
export const updateFAQ = (id, data) => api.put(`/faqs/${id}`, data);
export const deleteFAQ = (id) => api.delete(`/faqs/${id}`);

// Newsletter
export const getNewsletterSubscribers = (params) => api.get('/newsletter', { params });
export const deleteSubscriber = (id) => api.delete(`/newsletter/${id}`);
export const toggleSubscriberStatus = (id) => api.put(`/newsletter/${id}/toggle`);

// Contacts
export const getContacts = (params) => api.get('/contacts', { params });
export const updateContactStatus = (id, data) => api.put(`/contacts/${id}/status`, data);
export const replyContact = (id, data) => api.post(`/contacts/${id}/reply`, data);
export const deleteContact = (id) => api.delete(`/contacts/${id}`);

// Reviews
export const getReviews = (params) => api.get('/reviews', { params });
export const getReviewStats = () => api.get('/reviews/stats');
export const approveReview = (id) => api.put(`/reviews/${id}/approve`);
export const rejectReview = (id) => api.put(`/reviews/${id}/reject`);
export const replyToReview = (id, data) => api.post(`/reviews/${id}/reply`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Inventory
export const getInventory = (params) => api.get('/inventory', { params });
export const adjustStock = (data) => api.post('/inventory/adjust', data);
export const getInventoryLogs = (params) => api.get('/inventory/logs', { params });

// Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);

// Pincodes
export const getPincodes = (params) => api.get('/pincodes', { params });
export const createPincode = (data) => api.post('/pincodes', data);
export const updatePincode = (id, data) => api.put(`/pincodes/${id}`, data);
export const deletePincode = (id) => api.delete(`/pincodes/${id}`);
export const importPincodes = (pincodes) => api.post('/pincodes/import', { pincodes });

const adminService = {
  getDashboardStats,
  getRevenue,
  getTopProducts,
  getRecentOrders,
  getRecentUsers,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  bulkDeleteSubcategories,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  bulkDeleteProducts,
  bulkUpdateProductStatus,
  exportProductsCSV,
  getOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
  bulkUpdateOrderStatus,
  getUsers,
  blockUser,
  deleteUser,
  getUserDetails,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getNewsletterSubscribers,
  deleteSubscriber,
  toggleSubscriberStatus,
  getContacts,
  updateContactStatus,
  replyContact,
  deleteContact,
  getReviews,
  getReviewStats,
  approveReview,
  rejectReview,
  replyToReview,
  deleteReview,
  getInventory,
  adjustStock,
  getInventoryLogs,
  getSettings,
  updateSettings,
  getPincodes,
  createPincode,
  updatePincode,
  deletePincode,
  importPincodes,
};

export default adminService;
