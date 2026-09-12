import api from './api';

const FALLBACK_PRODUCTS = [
  {
    _id: 'p1',
    name: 'Masala Oats Bowl',
    category: { _id: 'cat1', name: 'Breakfast', slug: 'breakfast' },
    price: 149,
    mrp: 199,
    stockQuantity: 100,
    isVeg: true,
    isBestseller: true,
    isFeatured: true,
    isTodaysSpecial: true,
    rating: 4.8,
    ratingsCount: 124,
    shortDescription: 'Creamy masala oats with Indian spices and fresh veggies',
    description: 'A wholesome and delicious bowl of oats cooked with authentic aromatic spices, green peas, carrots, and coriander. Perfect high-fiber start to your morning.',
    coverImage: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&q=80'],
    ingredients: 'Oats, Onion, Tomato, Green Chili, Curry Leaves, Mustard Seeds, Turmeric, Salt',
    weight: '250g', calories: 180, protein: 6, fat: 3, carbs: 32, shelfLife: '6 months'
  },
  {
    _id: 'p2',
    name: 'Paneer Tikka Wrap',
    category: { _id: 'cat2', name: 'Lunch Meals', slug: 'lunch-meals' },
    price: 199,
    mrp: 249,
    stockQuantity: 75,
    isVeg: true,
    isBestseller: true,
    isFeatured: true,
    rating: 4.7,
    ratingsCount: 98,
    shortDescription: 'Grilled paneer tikka wrapped in a soft whole wheat tortilla',
    description: 'Juicy cottage cheese cubes marinated in rich tandoori spices, grilled to perfection and wrapped with crisp bell peppers, onions, and mint chutney.',
    coverImage: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80'],
    ingredients: 'Paneer, Whole Wheat Wrap, Capsicum, Onion, Tikka Masala, Curd',
    weight: '200g', calories: 320, protein: 14, fat: 12, carbs: 38, shelfLife: '3 days refrigerated'
  },
  {
    _id: 'p3',
    name: 'Butter Chicken Bowl',
    category: { _id: 'cat3', name: 'Dinner Meals', slug: 'dinner-meals' },
    price: 299,
    mrp: 399,
    stockQuantity: 60,
    isVeg: false,
    isBestseller: true,
    isFeatured: true,
    isTodaysSpecial: true,
    rating: 4.9,
    ratingsCount: 215,
    shortDescription: 'Creamy rich butter chicken paired with fragrant basmati rice',
    description: 'Tender chicken pieces simmered in a velvety, buttery tomato and cream gravy, served alongside long-grain aromatic basmati rice.',
    coverImage: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80'],
    ingredients: 'Chicken, Tomato, Butter, Cream, Ginger-Garlic, Garam Masala, Basmati Rice',
    weight: '350g', calories: 450, protein: 28, fat: 18, carbs: 42, shelfLife: '3 days refrigerated'
  },
  {
    _id: 'p4',
    name: 'Veg Dum Biryani',
    category: { _id: 'cat2', name: 'Lunch Meals', slug: 'lunch-meals' },
    price: 249,
    mrp: 349,
    stockQuantity: 80,
    isVeg: true,
    isBestseller: false,
    isFeatured: true,
    isTodaysSpecial: true,
    rating: 4.6,
    ratingsCount: 84,
    shortDescription: 'Fragrant basmati rice layered with garden vegetables and saffron',
    description: 'Authentic royal dum-cooked vegetable biryani with fresh carrots, beans, potatoes, mint, fried onions, and pure desi ghee.',
    coverImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80'],
    ingredients: 'Basmati Rice, Mixed Vegetables, Saffron, Garam Masala, Ghee, Mint',
    weight: '300g', calories: 380, protein: 8, fat: 12, carbs: 58, shelfLife: '3 days refrigerated'
  },
  {
    _id: 'p5',
    name: 'Chole Bhature Combo',
    category: { _id: 'cat6', name: 'Instant Foods', slug: 'instant-foods' },
    price: 179,
    mrp: 229,
    stockQuantity: 90,
    isVeg: true,
    isBestseller: true,
    isFeatured: false,
    rating: 4.8,
    ratingsCount: 150,
    shortDescription: 'Spicy Punjabi chole served with soft fluffy bhature',
    description: 'Traditional North Indian chickpeas slow-cooked in a tangy onion-tomato gravy with aromatic spices, served with fluffy wheat bhature.',
    coverImage: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80'],
    ingredients: 'Chickpeas, Tomatoes, Onion, Spices, Whole Wheat Flour, Oil',
    weight: '320g', calories: 410, protein: 12, fat: 15, carbs: 52, shelfLife: '6 months'
  },
  {
    _id: 'p6',
    name: 'Rajma Chawal Meal',
    category: { _id: 'cat7', name: 'Healthy Foods', slug: 'healthy-foods' },
    price: 189,
    mrp: 239,
    stockQuantity: 85,
    isVeg: true,
    isBestseller: false,
    isFeatured: true,
    rating: 4.7,
    ratingsCount: 92,
    shortDescription: 'Classic comfort food - spiced red kidney beans with steam rice',
    description: 'Hearty kidney beans simmered in a homestyle onion-tomato masala gravy, paired with fluffy steamed basmati rice.',
    coverImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80'],
    ingredients: 'Red Kidney Beans, Basmati Rice, Onion, Tomato, Ghee, Ginger, Cumin',
    weight: '350g', calories: 360, protein: 14, fat: 6, carbs: 62, shelfLife: '3 days refrigerated'
  },
  {
    _id: 'p7',
    name: 'Mango Lassi Bottled',
    category: { _id: 'cat8', name: 'Beverages', slug: 'beverages' },
    price: 89,
    mrp: 119,
    stockQuantity: 120,
    isVeg: true,
    isBestseller: true,
    isFeatured: false,
    rating: 4.9,
    ratingsCount: 190,
    shortDescription: 'Refreshing thick yogurt drink blended with Alphonso mango pulp',
    description: 'Chilled creamy lassi made from fresh curd and ripe Alphonso mangoes, infused with cardamom.',
    coverImage: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80'],
    ingredients: 'Curd, Alphonso Mango Pulp, Sugar, Cardamom',
    weight: '300ml', calories: 210, protein: 5, fat: 4, carbs: 38, shelfLife: '7 days refrigerated'
  },
  {
    _id: 'p8',
    name: 'Gulab Jamun Pack (4 pcs)',
    category: { _id: 'cat9', name: 'Desserts', slug: 'desserts' },
    price: 129,
    mrp: 169,
    stockQuantity: 110,
    isVeg: true,
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    ratingsCount: 310,
    shortDescription: 'Soft melt-in-the-mouth gulab jamuns in rose sugar syrup',
    description: 'Golden fried milk-solid dumplings soaked in warm aromatic rose and cardamom sugar syrup.',
    coverImage: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80'],
    ingredients: 'Khoya, Milk Powder, Flour, Sugar, Rose Water, Cardamom, Ghee',
    weight: '200g', calories: 290, protein: 4, fat: 10, carbs: 46, shelfLife: '15 days'
  }
];

export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    const items = response.data?.data || response.data?.products || (Array.isArray(response.data) ? response.data : []);
    if (items.length > 0) return response;
  } catch (err) {
    console.warn('Backend products API unavailable, using fallback data:', err.message);
  }

  let filtered = [...FALLBACK_PRODUCTS];
  if (params.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.shortDescription.toLowerCase().includes(s));
  }
  if (params.isVeg === 'true' || params.isVeg === true) {
    filtered = filtered.filter(p => p.isVeg);
  }
  if (params.category) {
    const cats = params.category.split(',');
    filtered = filtered.filter(p => cats.includes(p.category._id) || cats.includes(p.category.slug));
  }

  return {
    data: {
      success: true,
      products: filtered,
      data: filtered,
      pagination: { total: filtered.length, pages: 1, page: 1, limit: 12 },
      totalResults: filtered.length
    }
  };
};

export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    if (response.data && (response.data.product || response.data.data)) return response;
  } catch (err) {
    console.warn('Backend single product API unavailable, using fallback:', err.message);
  }
  const found = FALLBACK_PRODUCTS.find(p => p._id === id || p.slug === id) || FALLBACK_PRODUCTS[0];
  return { data: { success: true, product: found, data: found } };
};

export const getFeaturedProducts = async () => {
  try {
    const response = await api.get('/products/featured');
    const items = response.data?.data || response.data?.products || (Array.isArray(response.data) ? response.data : []);
    if (items.length > 0) return response;
  } catch (err) {
    console.warn('Backend featured products API unavailable, using fallback:', err.message);
  }
  const featured = FALLBACK_PRODUCTS.filter(p => p.isFeatured);
  return { data: { success: true, products: featured, data: featured } };
};

export const getBestsellers = async () => {
  try {
    const response = await api.get('/products/bestsellers');
    const items = response.data?.data || response.data?.products || (Array.isArray(response.data) ? response.data : []);
    if (items.length > 0) return response;
  } catch (err) {
    console.warn('Backend bestsellers API unavailable, using fallback:', err.message);
  }
  const best = FALLBACK_PRODUCTS.filter(p => p.isBestseller);
  return { data: { success: true, products: best, data: best } };
};

export const getTodaysSpecials = async () => {
  try {
    const response = await api.get('/products/todays-specials');
    const items = response.data?.data || response.data?.products || (Array.isArray(response.data) ? response.data : []);
    if (items.length > 0) return response;
  } catch (err) {
    console.warn('Backend todays-specials API unavailable, using fallback:', err.message);
  }
  const spec = FALLBACK_PRODUCTS.filter(p => p.isTodaysSpecial);
  return { data: { success: true, products: spec, data: spec } };
};

export const getCombos = async () => {
  try {
    const response = await api.get('/products/combos');
    const items = response.data?.data || response.data?.products || (Array.isArray(response.data) ? response.data : []);
    if (items.length > 0) return response;
  } catch (err) {
    console.warn('Backend combos API unavailable, using fallback:', err.message);
  }
  return { data: { success: true, products: FALLBACK_PRODUCTS.slice(0, 4), data: FALLBACK_PRODUCTS.slice(0, 4) } };
};

export const getRelatedProducts = async (id) => {
  try {
    const response = await api.get(`/products/${id}/related`);
    const items = response.data?.data || response.data?.products || (Array.isArray(response.data) ? response.data : []);
    if (items.length > 0) return response;
  } catch (err) {
    console.warn('Backend related products API unavailable, using fallback:', err.message);
  }
  return { data: { success: true, products: FALLBACK_PRODUCTS.slice(0, 4), data: FALLBACK_PRODUCTS.slice(0, 4) } };
};
