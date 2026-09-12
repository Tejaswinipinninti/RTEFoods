const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');

    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'RTE',
      email: 'admin@rtefoods.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'user123',
      phone: '8888888888',
      role: 'user',
      isVerified: true,
      isActive: true
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
    ].map(c => ({
      ...c,
      slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }));

    const categories = await Category.insertMany(categoryData);
    console.log('Categories seeded');

    const products = [
      {
        name: 'Masala Oats Bowl', category: categories[0]._id, price: 149, mrp: 199, stockQuantity: 100,
        isVeg: true, isBestseller: true, isFeatured: true, isTodaysSpecial: true,
        shortDescription: 'Creamy masala oats with Indian spices',
        coverImage: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&q=80', 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&q=80'],
        ingredients: 'Oats, Onion, Tomato, Green Chili, Curry Leaves, Mustard Seeds, Turmeric, Salt',
        weight: '250g', calories: 180, protein: 6, fat: 3, carbs: 32, shelfLife: '6 months',
        cookingInstructions: 'Heat and serve. Microwave for 2 minutes or boil for 3 minutes.'
      },
      {
        name: 'Paneer Tikka Wrap', category: categories[1]._id, price: 199, mrp: 249, stockQuantity: 75,
        isVeg: true, isBestseller: true, isFeatured: true,
        shortDescription: 'Grilled paneer tikka in a soft wrap',
        coverImage: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80'],
        ingredients: 'Paneer, Whole Wheat Wrap, Capsicum, Onion, Tikka Masala, Curd',
        weight: '200g', calories: 320, protein: 14, fat: 12, carbs: 38, shelfLife: '3 days refrigerated',
        cookingInstructions: 'Heat in microwave for 2-3 minutes.'
      },
      {
        name: 'Butter Chicken Bowl', category: categories[2]._id, price: 299, mrp: 399, stockQuantity: 60,
        isVeg: false, isBestseller: true, isFeatured: true, isTodaysSpecial: true,
        shortDescription: 'Creamy butter chicken with rice',
        coverImage: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80'],
        ingredients: 'Chicken, Tomato, Butter, Cream, Ginger-Garlic, Garam Masala, Basmati Rice',
        weight: '350g', calories: 450, protein: 28, fat: 18, carbs: 42, shelfLife: '3 days refrigerated',
        cookingInstructions: 'Heat in microwave for 3-4 minutes.'
      },
      {
        name: 'Veg Biryani', category: categories[1]._id, price: 249, mrp: 349, stockQuantity: 80,
        isVeg: true, isFeatured: true, isTodaysSpecial: true,
        shortDescription: 'Fragrant basmati rice with mixed vegetables',
        coverImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80'],
        ingredients: 'Basmati Rice, Mixed Vegetables, Saffron, Garam Masala, Ghee, Mint',
        weight: '300g', calories: 380, protein: 8, fat: 12, carbs: 58, shelfLife: '3 days refrigerated',
        cookingInstructions: 'Heat in microwave for 3 minutes.'
      },
      {
        name: 'Masala Maggi Cup', category: categories[5]._id, price: 49, mrp: 60, stockQuantity: 200,
        isVeg: true, isBestseller: true,
        shortDescription: 'Instant noodles with masala flavor',
        coverImage: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&q=80'],
        ingredients: 'Wheat Flour, Palm Oil, Salt, Sugar, Spices, MSG',
        weight: '70g', calories: 350, protein: 7, fat: 14, carbs: 48, shelfLife: '12 months',
        cookingInstructions: 'Boil water, add noodles and tastemaker, cook for 2 minutes.'
      },
      {
        name: 'Samosa - 4 Pack', category: categories[4]._id, price: 99, mrp: 140, stockQuantity: 120,
        isVeg: true, isBestseller: true,
        shortDescription: 'Crispy samosas with potato filling',
        coverImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80'],
        ingredients: 'Refined Flour, Potato, Peas, Cumin, Coriander, Green Chili',
        weight: '200g', calories: 280, protein: 5, fat: 14, carbs: 34, shelfLife: '6 months frozen',
        cookingInstructions: 'Deep fry or air fry at 180°C for 8-10 minutes.'
      },
      {
        name: 'Chicken Seekh Kebab', category: categories[4]._id, price: 249, mrp: 349, stockQuantity: 50,
        isVeg: false, isBestseller: true,
        shortDescription: 'Juicy chicken seekh kebabs',
        coverImage: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80'],
        ingredients: 'Chicken, Onion, Green Chili, Ginger-Garlic, Spices, Herbs',
        weight: '250g', calories: 220, protein: 20, fat: 14, carbs: 4, shelfLife: '6 months frozen',
        cookingInstructions: 'Grill or pan fry for 8-10 minutes.'
      },
      {
        name: 'Palak Paneer Bowl', category: categories[2]._id, price: 229, mrp: 299, stockQuantity: 65,
        isVeg: true, isFeatured: true,
        shortDescription: 'Creamy spinach with cottage cheese',
        coverImage: 'https://images.unsplash.com/photo-1609881822031-f2b14e1d7f7e?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1609881822031-f2b14e1d7f7e?w=600&q=80'],
        ingredients: 'Spinach, Paneer, Onion, Tomato, Garlic, Cream, Spices',
        weight: '300g', calories: 340, protein: 14, fat: 20, carbs: 24, shelfLife: '3 days refrigerated',
        cookingInstructions: 'Heat in microwave for 3 minutes.'
      },
      {
        name: 'Rajma Rice Bowl', category: categories[1]._id, price: 179, mrp: 229, stockQuantity: 90,
        isVeg: true, isBestseller: true,
        shortDescription: 'Kidney bean curry with steamed rice',
        coverImage: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&q=80'],
        ingredients: 'Kidney Beans, Basmati Rice, Onion, Tomato, Cumin, Garam Masala',
        weight: '300g', calories: 360, protein: 12, fat: 6, carbs: 62, shelfLife: '3 days refrigerated',
        cookingInstructions: 'Heat in microwave for 3 minutes.'
      },
      {
        name: 'Chocolate Brownie', category: categories[8]._id, price: 149, mrp: 199, stockQuantity: 80,
        isVeg: true, isFeatured: true,
        shortDescription: 'Rich chocolate brownie with walnuts',
        coverImage: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80'],
        ingredients: 'Dark Chocolate, Butter, Sugar, Eggs, Flour, Walnuts',
        weight: '120g', calories: 420, protein: 6, fat: 24, carbs: 48, shelfLife: '5 days refrigerated',
        cookingInstructions: 'Serve at room temperature. Warm for 30 seconds for gooey center.'
      },
      {
        name: 'Protein Smoothie Bowl', category: categories[6]._id, price: 199, mrp: 279, stockQuantity: 40,
        isVeg: true,
        shortDescription: 'High protein smoothie bowl with fruits',
        coverImage: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80'],
        ingredients: 'Banana, Berries, Protein Powder, Almond Milk, Granola, Chia Seeds',
        weight: '300g', calories: 280, protein: 22, fat: 8, carbs: 34, shelfLife: '1 day fresh',
        cookingInstructions: 'Consume immediately. Keep refrigerated.'
      },
      {
        name: 'Frozen French Fries', category: categories[3]._id, price: 129, mrp: 179, stockQuantity: 150,
        isVeg: true,
        shortDescription: 'Crispy golden french fries',
        coverImage: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80'],
        ingredients: 'Potato, Sunflower Oil, Salt',
        weight: '400g', calories: 300, protein: 3, fat: 15, carbs: 38, shelfLife: '12 months frozen',
        cookingInstructions: 'Deep fry at 175°C for 3-4 minutes. Do not thaw before frying.'
      },
      {
        name: 'Mango Lassi', category: categories[7]._id, price: 89, mrp: 119, stockQuantity: 60,
        isVeg: true,
        shortDescription: 'Refreshing mango yogurt drink',
        coverImage: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&q=80'],
        ingredients: 'Mango Pulp, Yogurt, Sugar, Cardamom',
        weight: '250ml', calories: 180, protein: 5, fat: 4, carbs: 32, shelfLife: '7 days refrigerated',
        cookingInstructions: 'Shake well before consuming.'
      },
      {
        name: 'Dal Makhani Rice', category: categories[2]._id, price: 219, mrp: 289, stockQuantity: 70,
        isVeg: true, isFeatured: true,
        shortDescription: 'Creamy dal makhani with jeera rice',
        coverImage: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=80'],
        ingredients: 'Black Lentils, Kidney Beans, Butter, Cream, Basmati Rice, Cumin',
        weight: '350g', calories: 400, protein: 14, fat: 16, carbs: 52, shelfLife: '3 days refrigerated',
        cookingInstructions: 'Heat in microwave for 3-4 minutes.'
      },
      {
        name: 'Chicken Momos - 10 Pack', category: categories[4]._id, price: 199, mrp: 279, stockQuantity: 85,
        isVeg: false, isBestseller: true,
        shortDescription: 'Steamed chicken momos with chutney',
        coverImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&q=80'],
        ingredients: 'Chicken, Flour, Onion, Ginger-Garlic, Soy Sauce, Vinegar, Spices',
        weight: '250g', calories: 300, protein: 16, fat: 10, carbs: 36, shelfLife: '6 months frozen',
        cookingInstructions: 'Steam for 10-12 minutes from frozen.'
      }
    ];

    for (const pData of products) {
      await Product.create({
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
    }

    console.log('Products seeded with images');

    await Settings.create({
      general: {
        siteName: 'RTE Foods',
        siteDescription: 'Premium Ready-to-Eat Foods Delivered to Your Doorstep',
        contactEmail: 'hello@rtefoods.com',
        contactPhone: '+91 98765 43210',
        address: '123 Food Street, Gourmet Nagar, Mumbai 400001'
      },
      social: {
        facebook: 'https://facebook.com/rtefoods',
        instagram: 'https://instagram.com/rtefoods',
        twitter: 'https://twitter.com/rtefoods',
        youtube: 'https://youtube.com/rtefoods',
        whatsapp: '+919876543210'
      },
      shipping: {
        freeShippingEnabled: true,
        freeShippingMinAmount: 499,
        defaultShippingCharge: 49,
        estimatedDeliveryDays: 3
      },
      tax: {
        gstEnabled: true,
        gstPercent: 5,
        cgst: 2.5,
        sgst: 2.5
      }
    });

    console.log('Settings seeded');
    console.log('Database seeded successfully!');
    console.log('Admin: admin@rtefoods.com / admin123');
    console.log('User: john@example.com / user123');

    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
