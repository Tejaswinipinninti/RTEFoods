const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const Blog = require('../models/Blog');
const FAQ = require('../models/FAQ');
const Offer = require('../models/Offer');
const Pincode = require('../models/Pincode');
const Inventory = require('../models/Inventory');
const Newsletter = require('../models/Newsletter');
const Settings = require('../models/Settings');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');

    await Promise.all([
      User.deleteMany(), Category.deleteMany(), Subcategory.deleteMany(),
      Product.deleteMany(), Banner.deleteMany(), Coupon.deleteMany(),
      Blog.deleteMany(), FAQ.deleteMany(), Offer.deleteMany(),
      Pincode.deleteMany(), Inventory.deleteMany(), Newsletter.deleteMany(),
      Settings.deleteMany()
    ]);

    const admin = await User.create({
      firstName: 'Admin', lastName: 'RTE', email: 'admin@rtefoods.com',
      password: 'admin123', phone: '9999999999', role: 'admin', isVerified: true, isActive: true
    });

    const user = await User.create({
      firstName: 'John', lastName: 'Doe', email: 'john@example.com',
      password: 'user123', phone: '8888888888', role: 'user', isVerified: true, isActive: true
    });
    console.log('Users seeded');

    const categoryData = [
      { name: 'Breakfast', description: 'Start your day with delicious breakfast options', sortOrder: 1, image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80' },
      { name: 'Lunch Meals', description: 'Quick and tasty lunch meals for busy days', sortOrder: 2, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' },
      { name: 'Dinner Meals', description: 'Hearty dinner meals ready in minutes', sortOrder: 3, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80' },
      { name: 'Frozen Foods', description: 'Fresh frozen foods for anytime convenience', sortOrder: 4, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
      { name: 'Snacks', description: 'Crunchy and tasty snacks for every mood', sortOrder: 5, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80' },
      { name: 'Instant Foods', description: 'Ready in minutes, taste in seconds', sortOrder: 6, image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80' },
      { name: 'Healthy Foods', description: 'Nutritious meals for health-conscious', sortOrder: 7, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' },
      { name: 'Beverages', description: 'Refreshing drinks and beverages', sortOrder: 8, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80' },
      { name: 'Desserts', description: 'Sweet treats and indulgent desserts', sortOrder: 9, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80' }
    ].map(c => ({ ...c, slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), status: 'active' }));

    const categories = await Category.insertMany(categoryData);
    console.log('Categories seeded');

    const subcategoryData = [
      { name: 'Poha & Upma', category: categories[0]._id, description: 'Light breakfast options', image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80' },
      { name: 'Paratha & Roti', category: categories[0]._id, description: 'Indian bread breakfast', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80' },
      { name: 'Rice Bowls', category: categories[1]._id, description: 'Flavorful rice-based meals', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
      { name: 'Curry Meals', category: categories[1]._id, description: 'Rich curry preparations', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
      { name: 'North Indian', category: categories[2]._id, description: 'Authentic North Indian dishes', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
      { name: 'South Indian', category: categories[2]._id, description: 'South Indian dinner favorites', image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80' },
      { name: 'Samosas & Kachori', category: categories[4]._id, description: 'Fried snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
      { name: 'Chips & Namkeen', category: categories[4]._id, description: 'Light snack options', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80' },
      { name: 'Smoothies', category: categories[7]._id, description: 'Healthy smoothie drinks', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80' },
      { name: 'Cakes & Pastries', category: categories[8]._id, description: 'Indulgent sweet treats', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80' },
    ].map(s => ({ ...s, slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), status: 'active', productCount: 0 }));

    const subcategories = await Subcategory.insertMany(subcategoryData);
    console.log('Subcategories seeded');

    const products = [
      { name: 'Masala Oats Bowl', category: categories[0]._id, subcategory: subcategories[0]._id, price: 149, mrp: 199, stockQuantity: 100, isVeg: true, isBestseller: true, isFeatured: true, isTodaysSpecial: true, shortDescription: 'Creamy masala oats with Indian spices', coverImage: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&q=80'], ingredients: 'Oats, Onion, Tomato, Green Chili, Curry Leaves', weight: '250g', calories: 180, protein: 6, fat: 3, carbs: 32, shelfLife: '6 months', cookingInstructions: 'Heat and serve.' },
      { name: 'Paneer Tikka Wrap', category: categories[1]._id, subcategory: subcategories[2]._id, price: 199, mrp: 249, stockQuantity: 75, isVeg: true, isBestseller: true, isFeatured: true, shortDescription: 'Grilled paneer tikka in a soft wrap', coverImage: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80'], ingredients: 'Paneer, Whole Wheat Wrap, Capsicum, Onion', weight: '200g', calories: 320, protein: 14, fat: 12, carbs: 38, shelfLife: '3 days', cookingInstructions: 'Heat in microwave for 2-3 minutes.' },
      { name: 'Butter Chicken Bowl', category: categories[2]._id, subcategory: subcategories[4]._id, price: 299, mrp: 399, stockQuantity: 60, isVeg: false, isBestseller: true, isFeatured: true, isTodaysSpecial: true, shortDescription: 'Creamy butter chicken with rice', coverImage: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80'], ingredients: 'Chicken, Tomato, Butter, Cream, Basmati Rice', weight: '350g', calories: 450, protein: 28, fat: 18, carbs: 42, shelfLife: '3 days', cookingInstructions: 'Heat for 3-4 minutes.' },
      { name: 'Veg Biryani', category: categories[1]._id, subcategory: subcategories[2]._id, price: 249, mrp: 349, stockQuantity: 80, isVeg: true, isFeatured: true, isTodaysSpecial: true, shortDescription: 'Fragrant basmati rice with mixed vegetables', coverImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80'], ingredients: 'Basmati Rice, Mixed Vegetables, Saffron, Ghee', weight: '300g', calories: 380, protein: 8, fat: 12, carbs: 58, shelfLife: '3 days', cookingInstructions: 'Heat for 3 minutes.' },
      { name: 'Masala Maggi Cup', category: categories[5]._id, price: 49, mrp: 60, stockQuantity: 200, isVeg: true, isBestseller: true, shortDescription: 'Instant noodles with masala flavor', coverImage: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&q=80'], ingredients: 'Wheat Flour, Palm Oil, Spices', weight: '70g', calories: 350, protein: 7, fat: 14, carbs: 48, shelfLife: '12 months', cookingInstructions: 'Boil water, cook for 2 minutes.' },
      { name: 'Samosa - 4 Pack', category: categories[4]._id, subcategory: subcategories[6]._id, price: 99, mrp: 140, stockQuantity: 120, isVeg: true, isBestseller: true, shortDescription: 'Crispy samosas with potato filling', coverImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80'], ingredients: 'Refined Flour, Potato, Peas, Spices', weight: '200g', calories: 280, protein: 5, fat: 14, carbs: 34, shelfLife: '6 months', cookingInstructions: 'Air fry at 180C for 8-10 minutes.' },
      { name: 'Chicken Seekh Kebab', category: categories[4]._id, price: 249, mrp: 349, stockQuantity: 50, isVeg: false, isBestseller: true, shortDescription: 'Juicy chicken seekh kebabs', coverImage: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80'], ingredients: 'Chicken, Onion, Green Chili, Spices', weight: '250g', calories: 220, protein: 20, fat: 14, carbs: 4, shelfLife: '6 months', cookingInstructions: 'Grill or pan fry for 8-10 minutes.' },
      { name: 'Palak Paneer Bowl', category: categories[2]._id, subcategory: subcategories[5]._id, price: 229, mrp: 299, stockQuantity: 65, isVeg: true, isFeatured: true, shortDescription: 'Creamy spinach with cottage cheese', coverImage: 'https://images.unsplash.com/photo-1609881822031-f2b14e1d7f7e?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1609881822031-f2b14e1d7f7e?w=600&q=80'], ingredients: 'Spinach, Paneer, Onion, Tomato, Cream', weight: '300g', calories: 340, protein: 14, fat: 20, carbs: 24, shelfLife: '3 days', cookingInstructions: 'Heat for 3 minutes.' },
      { name: 'Rajma Rice Bowl', category: categories[1]._id, subcategory: subcategories[3]._id, price: 179, mrp: 229, stockQuantity: 90, isVeg: true, isBestseller: true, shortDescription: 'Kidney bean curry with steamed rice', coverImage: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&q=80'], ingredients: 'Kidney Beans, Basmati Rice, Spices', weight: '300g', calories: 360, protein: 12, fat: 6, carbs: 62, shelfLife: '3 days', cookingInstructions: 'Heat for 3 minutes.' },
      { name: 'Chocolate Brownie', category: categories[8]._id, subcategory: subcategories[9]._id, price: 149, mrp: 199, stockQuantity: 80, isVeg: true, isFeatured: true, shortDescription: 'Rich chocolate brownie with walnuts', coverImage: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80'], ingredients: 'Dark Chocolate, Butter, Sugar, Eggs, Flour', weight: '120g', calories: 420, protein: 6, fat: 24, carbs: 48, shelfLife: '5 days', cookingInstructions: 'Serve at room temperature.' },
      { name: 'Protein Smoothie Bowl', category: categories[6]._id, subcategory: subcategories[8]._id, price: 199, mrp: 279, stockQuantity: 40, isVeg: true, shortDescription: 'High protein smoothie bowl with fruits', coverImage: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80'], ingredients: 'Banana, Berries, Protein Powder, Almond Milk', weight: '300g', calories: 280, protein: 22, fat: 8, carbs: 34, shelfLife: '1 day', cookingInstructions: 'Consume immediately.' },
      { name: 'Frozen French Fries', category: categories[3]._id, price: 129, mrp: 179, stockQuantity: 150, isVeg: true, shortDescription: 'Crispy golden french fries', coverImage: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80'], ingredients: 'Potato, Sunflower Oil, Salt', weight: '400g', calories: 300, protein: 3, fat: 15, carbs: 38, shelfLife: '12 months', cookingInstructions: 'Deep fry at 175C for 3-4 minutes.' },
      { name: 'Mango Lassi', category: categories[7]._id, subcategory: subcategories[8]._id, price: 89, mrp: 119, stockQuantity: 60, isVeg: true, shortDescription: 'Refreshing mango yogurt drink', coverImage: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&q=80'], ingredients: 'Mango Pulp, Yogurt, Sugar, Cardamom', weight: '250ml', calories: 180, protein: 5, fat: 4, carbs: 32, shelfLife: '7 days', cookingInstructions: 'Shake well before consuming.' },
      { name: 'Dal Makhani Rice', category: categories[2]._id, subcategory: subcategories[4]._id, price: 219, mrp: 289, stockQuantity: 70, isVeg: true, isFeatured: true, shortDescription: 'Creamy dal makhani with jeera rice', coverImage: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=80'], ingredients: 'Black Lentils, Butter, Cream, Basmati Rice', weight: '350g', calories: 400, protein: 14, fat: 16, carbs: 52, shelfLife: '3 days', cookingInstructions: 'Heat for 3-4 minutes.' },
      { name: 'Chicken Momos - 10 Pack', category: categories[4]._id, price: 199, mrp: 279, stockQuantity: 85, isVeg: false, isBestseller: true, shortDescription: 'Steamed chicken momos with chutney', coverImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&q=80'], ingredients: 'Chicken, Flour, Ginger-Garlic, Soy Sauce', weight: '250g', calories: 300, protein: 16, fat: 10, carbs: 36, shelfLife: '6 months', cookingInstructions: 'Steam for 10-12 minutes.' },
      { name: 'Aloo Paratha Pack', category: categories[0]._id, subcategory: subcategories[1]._id, price: 129, mrp: 179, stockQuantity: 100, isVeg: true, shortDescription: 'Stuffed aloo parathas with pickle', coverImage: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80', galleryImages: ['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80'], ingredients: 'Whole Wheat, Potato, Onion, Spices', weight: '300g', calories: 350, protein: 8, fat: 12, carbs: 52, shelfLife: '3 days', cookingInstructions: 'Heat on tawa or microwave.' },
    ];

    const createdProducts = [];
    for (const pData of products) {
      const p = await Product.create({
        ...pData,
        slug: pData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: 'RTE-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        status: 'active',
        averageRating: (Math.random() * 2 + 3).toFixed(1),
        totalReviews: Math.floor(Math.random() * 50) + 5,
        totalSales: Math.floor(Math.random() * 200) + 20,
        fullDescription: pData.shortDescription + ' Premium quality ready-to-eat food item.',
        metaTitle: pData.name + ' - RTE Foods',
        metaDescription: pData.shortDescription
      });
      createdProducts.push(p);
    }
    console.log('Products seeded');

    const bannerData = [
      { title: 'Flat 30% Off on All Orders', subtitle: 'Use code FLAT30 at checkout', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80', type: 'homepage', status: 'active', order: 1 },
      { title: 'New Combo Deals Available', subtitle: 'Save more when you order more', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80', type: 'homepage', status: 'active', order: 2 },
      { title: 'Fresh Healthy Options', subtitle: 'Eat clean, live clean', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80', type: 'homepage', status: 'active', order: 3 },
    ];
    await Banner.insertMany(bannerData);
    console.log('Banners seeded');

    const couponData = [
      { code: 'FLAT30', type: 'percentage', value: 30, minCartAmount: 499, maxDiscount: 200, expiryDate: new Date('2026-12-31'), usageLimit: 1000, isActive: true },
      { code: 'WELCOME50', type: 'flat', value: 50, minCartAmount: 299, expiryDate: new Date('2026-12-31'), usageLimit: 500, isActive: true },
      { code: 'FREESHIP', type: 'free_shipping', value: 0, minCartAmount: 199, expiryDate: new Date('2026-12-31'), usageLimit: 2000, isActive: true },
      { code: 'COMBO20', type: 'percentage', value: 20, minCartAmount: 399, maxDiscount: 150, expiryDate: new Date('2026-12-31'), usageLimit: 800, isActive: true },
    ];
    await Coupon.insertMany(couponData);
    console.log('Coupons seeded');

    const blogData = [
      { title: '10 Quick Breakfast Ideas for Busy Mornings', content: 'Mornings can be hectic, but that does not mean you have to skip breakfast. Here are 10 quick and delicious breakfast ideas that will keep you energized throughout the day.', excerpt: 'Quick and healthy breakfast ideas', category: 'Recipes', tags: ['breakfast', 'quick', 'healthy'], status: 'published', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80' },
      { title: 'The Benefits of Ready-to-Eat Meals', content: 'Ready-to-eat meals have come a long way from being just convenience food. Modern RTE meals are nutritionally balanced, hygienically prepared, and taste just like home-cooked food.', excerpt: 'Why RTE meals are a great choice', category: 'Lifestyle', tags: ['rte', 'convenience', 'health'], status: 'published', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80' },
      { title: 'Eating Healthy on a Budget', content: 'Eating healthy does not have to be expensive. With the right choices and a bit of planning, you can enjoy nutritious meals without breaking the bank.', excerpt: 'Tips for budget-friendly healthy eating', category: 'Health', tags: ['budget', 'healthy', 'tips'], status: 'published', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80' },
    ];
    await Blog.insertMany(blogData);
    console.log('Blogs seeded');

    const faqData = [
      { question: 'How do I track my order?', answer: 'Once your order is placed, you will receive a tracking link via email and SMS. You can also track your order from the My Orders section in your account.', category: 'Orders', status: 'active', order: 1 },
      { question: 'What is the delivery time?', answer: 'Standard delivery takes 2-4 business days. Express delivery is available in select cities within 24 hours.', category: 'Delivery', status: 'active', order: 2 },
      { question: 'Can I cancel my order?', answer: 'Yes, you can cancel your order before it is dispatched. Once dispatched, cancellation is not possible, but you can return the product after delivery.', category: 'Orders', status: 'active', order: 3 },
      { question: 'Are your products fresh?', answer: 'Absolutely! All our products are prepared fresh and delivered in temperature-controlled packaging to ensure maximum freshness.', category: 'Products', status: 'active', order: 4 },
      { question: 'Do you offer free delivery?', answer: 'Yes, we offer free delivery on all orders above Rs 499. For orders below Rs 499, a nominal delivery charge of Rs 49 applies.', category: 'Delivery', status: 'active', order: 5 },
      { question: 'How do I apply a coupon?', answer: 'You can apply a coupon code at checkout. Enter the code in the coupon field and click Apply to get the discount.', category: 'Payment', status: 'active', order: 6 },
    ];
    await FAQ.insertMany(faqData);
    console.log('FAQs seeded');

    const offerData = [
      { title: 'Monsoon Mega Sale', description: 'Get up to 40% off on all frozen foods', type: 'flash_sale', discount: 40, startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: 'active' },
      { title: 'Breakfast Combo Deal', description: 'Buy 2 breakfast items and save Rs 100', type: 'combo', discount: 100, minQuantity: 2, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), status: 'active' },
      { title: 'First Order Bonus', description: 'Get 25% off on your first order', type: 'featured', discount: 25, startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), status: 'active' },
    ];
    await Offer.insertMany(offerData);
    console.log('Offers seeded');

    const pincodeData = [
      { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', isServiceable: true, deliveryCharge: 0, minOrderAmount: 199, estimatedDays: 2 },
      { pincode: '400002', city: 'Mumbai', state: 'Maharashtra', isServiceable: true, deliveryCharge: 0, minOrderAmount: 199, estimatedDays: 2 },
      { pincode: '400020', city: 'Mumbai', state: 'Maharashtra', isServiceable: true, deliveryCharge: 29, minOrderAmount: 199, estimatedDays: 3 },
      { pincode: '110001', city: 'New Delhi', state: 'Delhi', isServiceable: true, deliveryCharge: 0, minOrderAmount: 199, estimatedDays: 3 },
      { pincode: '560001', city: 'Bangalore', state: 'Karnataka', isServiceable: true, deliveryCharge: 0, minOrderAmount: 199, estimatedDays: 3 },
      { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', isServiceable: true, deliveryCharge: 39, minOrderAmount: 299, estimatedDays: 4 },
      { pincode: '500001', city: 'Hyderabad', state: 'Telangana', isServiceable: true, deliveryCharge: 0, minOrderAmount: 199, estimatedDays: 3 },
      { pincode: '700001', city: 'Kolkata', state: 'West Bengal', isServiceable: true, deliveryCharge: 29, minOrderAmount: 199, estimatedDays: 4 },
    ];
    await Pincode.insertMany(pincodeData);
    console.log('Pincodes seeded');

    for (const p of createdProducts) {
      await Inventory.create({
        product: p._id,
        quantity: p.stockQuantity,
        lowStockLimit: 10,
        reservedQuantity: 0,
        status: p.stockQuantity > 10 ? 'in_stock' : p.stockQuantity > 0 ? 'low_stock' : 'out_of_stock',
      });
    }
    console.log('Inventory seeded');

    const newsletterData = [
      { email: 'priya@example.com', status: 'active' },
      { email: 'rahul@example.com', status: 'active' },
      { email: 'ananya@example.com', status: 'active' },
    ];
    await Newsletter.insertMany(newsletterData);
    console.log('Newsletter subscribers seeded');

    await Settings.create({
      general: { siteName: 'RTE Foods', siteDescription: 'Premium Ready-to-Eat Foods', contactEmail: 'hello@rtefoods.com', contactPhone: '+91 98765 43210', address: '123 Food Street, Mumbai 400001' },
      social: { facebook: 'https://facebook.com/rtefoods', instagram: 'https://instagram.com/rtefoods', twitter: 'https://twitter.com/rtefoods', youtube: 'https://youtube.com/rtefoods', whatsapp: '+919876543210' },
      shipping: { freeShippingEnabled: true, freeShippingMinAmount: 499, defaultShippingCharge: 49, estimatedDeliveryDays: 3 },
      tax: { gstEnabled: true, gstPercent: 5, cgst: 2.5, sgst: 2.5 },
    });
    console.log('Settings seeded');

    console.log('\nDatabase seeded successfully!');
    console.log('Admin: admin@rtefoods.com / admin123');
    console.log('User: john@example.com / user123');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
