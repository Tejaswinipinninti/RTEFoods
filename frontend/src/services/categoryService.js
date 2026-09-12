import api from './api';

const FALLBACK_CATEGORIES = [
  { _id: 'cat1', name: 'Breakfast', slug: 'breakfast', description: 'Start your day with delicious breakfast options', sortOrder: 1, image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80', productCount: 5 },
  { _id: 'cat2', name: 'Lunch Meals', slug: 'lunch-meals', description: 'Quick and tasty lunch meals for busy days', sortOrder: 2, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', productCount: 8 },
  { _id: 'cat3', name: 'Dinner Meals', slug: 'dinner-meals', description: 'Hearty dinner meals ready in minutes', sortOrder: 3, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80', productCount: 6 },
  { _id: 'cat4', name: 'Frozen Foods', slug: 'frozen-foods', description: 'Fresh frozen foods for anytime convenience', sortOrder: 4, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', productCount: 4 },
  { _id: 'cat5', name: 'Snacks', slug: 'snacks', description: 'Crunchy and tasty snacks for every mood', sortOrder: 5, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80', productCount: 7 },
  { _id: 'cat6', name: 'Instant Foods', slug: 'instant-foods', description: 'Ready in minutes, taste in seconds', sortOrder: 6, image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80', productCount: 5 },
  { _id: 'cat7', name: 'Healthy Foods', slug: 'healthy-foods', description: 'Nutritious meals for health-conscious', sortOrder: 7, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', productCount: 6 },
  { _id: 'cat8', name: 'Beverages', slug: 'beverages', description: 'Refreshing drinks and beverages', sortOrder: 8, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', productCount: 4 },
  { _id: 'cat9', name: 'Desserts', slug: 'desserts', description: 'Sweet treats and indulgent desserts', sortOrder: 9, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', productCount: 3 }
];

export const getCategories = async (params) => {
  try {
    const response = await api.get('/categories', { params });
    const items = response.data?.data || response.data?.categories || (Array.isArray(response.data) ? response.data : []);
    if (items.length > 0) return response;
  } catch (err) {
    console.warn('Backend categories API unavailable, using fallback data:', err.message);
  }
  return { data: { success: true, categories: FALLBACK_CATEGORIES, data: FALLBACK_CATEGORIES, total: FALLBACK_CATEGORIES.length } };
};

export const getAllCategories = async () => {
  try {
    const response = await api.get('/categories/all');
    const items = response.data?.data || response.data?.categories || (Array.isArray(response.data) ? response.data : []);
    if (items.length > 0) return response;
  } catch (err) {
    console.warn('Backend all-categories API unavailable, using fallback data:', err.message);
  }
  return { data: { success: true, categories: FALLBACK_CATEGORIES, data: FALLBACK_CATEGORIES } };
};

export const getCategory = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    if (response.data && response.data.category) return response;
  } catch (err) {
    console.warn('Backend single category API unavailable, using fallback:', err.message);
  }
  const found = FALLBACK_CATEGORIES.find(c => c._id === id || c.slug === id) || FALLBACK_CATEGORIES[0];
  return { data: { success: true, category: found, data: found } };
};
