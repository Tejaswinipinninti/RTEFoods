const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

exports.getStatsCards = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [totalOrders, todayOrders, totalUsers, todayUsers, totalProducts, activeProducts] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: today } }),
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' })
    ]);

    const [thisMonthRevenue, lastMonthRevenue] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: thisMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: lastMonth, $lt: thisMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ])
    ]);

    const revenue = thisMonthRevenue[0]?.total || 0;
    const lastRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastRevenue > 0 ? Math.round(((revenue - lastRevenue) / lastRevenue) * 100) : 100;

    res.status(200).json({
      success: true, data: {
        totalOrders, todayOrders, totalUsers, todayUsers,
        totalProducts, activeProducts, monthlyRevenue: revenue,
        revenueGrowth
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    let groupBy, dateFormat;
    if (period === 'daily') {
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
      dateFormat = '%Y-%m-%d';
    } else if (period === 'weekly') {
      groupBy = { year: { $year: '$createdAt' }, week: { $isoWeek: '$createdAt' } };
      dateFormat = '%Y-W%V';
    } else {
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
      dateFormat = '%Y-%m';
    }
    const revenue = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) }, paymentStatus: 'paid' } },
      { $group: { _id: groupBy, revenue: { $sum: '$grandTotal' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    res.status(200).json({ success: true, data: revenue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 10, sortBy = 'totalSales' } = req.query;
    const products = await Product.find({ status: 'active' }).sort(`-${sortBy}`).limit(Number(limit)).select('name slug coverImage price totalSales averageRating totalReviews');
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const orders = await Order.find().sort('-createdAt').limit(Number(limit)).populate('user', 'firstName lastName email');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentUsers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const users = await User.find({ role: 'user' }).sort('-createdAt').limit(Number(limit)).select('firstName lastName email avatar createdAt isActive');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMonthlySalesData = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$grandTotal' },
          paidOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthlyData = monthNames.map((name, index) => {
      const data = sales.find(s => s._id.month === index + 1);
      return {
        month: name,
        totalOrders: data?.totalOrders || 0,
        totalRevenue: data?.totalRevenue || 0,
        paidOrders: data?.paidOrders || 0,
        cancelledOrders: data?.cancelledOrders || 0
      };
    });
    res.status(200).json({ success: true, data: monthlyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategorySales = async (req, res) => {
  try {
    const categorySales = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productData'
        }
      },
      { $unwind: '$productData' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productData.category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      { $unwind: '$categoryData' },
      {
        $group: {
          _id: '$categoryData.name',
          totalSales: { $sum: '$items.total' },
          totalQuantity: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
    res.status(200).json({ success: true, data: categorySales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = exports.getStatsCards;
exports.getRevenue = exports.getRevenueAnalytics;
exports.getMonthlySales = exports.getMonthlySalesData;
