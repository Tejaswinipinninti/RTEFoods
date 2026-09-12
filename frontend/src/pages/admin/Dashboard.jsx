import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/10 rounded-xl ${className}`} />
);

const StatCard = ({ icon: Icon, label, value, change, color, index }) => {
  const isPositive = change >= 0;
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span
          className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <p className="text-sm text-gray-400 mt-1">{label}</p>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revenueRes, productsRes, ordersRes, usersRes] = await Promise.allSettled([
          adminService.getDashboardStats(),
          adminService.getRevenue(),
          adminService.getTopProducts(),
          adminService.getRecentOrders(),
          adminService.getRecentUsers(),
        ]);
        if (statsRes.status === 'fulfilled') {
          const d = statsRes.value.data;
          setStats(d?.data || d);
        }
        if (revenueRes.status === 'fulfilled') {
          const d = revenueRes.value.data;
          const raw = d?.data || d || [];
          setRevenue(Array.isArray(raw) ? raw.map(r => ({ month: r._id?.month || r.month, revenue: r.revenue || 0 })) : []);
        }
        if (productsRes.status === 'fulfilled') {
          const d = productsRes.value.data;
          setTopProducts(d?.data || d || []);
        }
        if (ordersRes.status === 'fulfilled') {
          const d = ordersRes.value.data;
          const raw = d?.data || d || [];
          setRecentOrders(Array.isArray(raw) ? raw.map(o => ({
            _id: o._id,
            orderNumber: o.orderNumber || o._id?.slice(-6),
            customerName: o.user?.firstName ? `${o.user.firstName} ${o.user.lastName}` : o.shippingAddress?.name || 'Customer',
            status: o.orderStatus || o.status || 'pending',
            total: o.grandTotal || o.total || 0,
          })) : []);
        }
        if (usersRes.status === 'fulfilled') {
          const d = usersRes.value.data;
          const raw = d?.data || d || [];
          setRecentUsers(Array.isArray(raw) ? raw.map(u => ({
            _id: u._id,
            name: u.firstName ? `${u.firstName} ${u.lastName}` : u.name || 'User',
            email: u.email,
            avatar: u.avatar,
            createdAt: u.createdAt,
          })) : []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = stats
    ? [
        { icon: DollarSign, label: 'Total Sales', value: `₹${(stats.monthlyRevenue || 0).toLocaleString()}`, change: stats.revenueGrowth || 0, color: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
        { icon: ShoppingCart, label: 'Total Orders', value: stats.totalOrders?.toLocaleString() || '0', change: 0, color: 'bg-gradient-to-br from-amber-500 to-orange-600' },
        { icon: Users, label: 'Total Users', value: stats.totalUsers?.toLocaleString() || '0', change: 0, color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
        { icon: Package, label: 'Total Products', value: stats.totalProducts?.toLocaleString() || '0', change: 0, color: 'bg-gradient-to-br from-rose-500 to-pink-600' },
      ]
    : [];

  const pieData = Array.isArray(stats?.salesByCategory)
    ? stats.salesByCategory.map(c => ({ name: c._id || c.name, value: c.totalSales || c.value || 0 }))
    : [];

  const orderStatusColor = {
    pending: 'bg-amber-500/20 text-amber-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-emerald-500/20 text-emerald-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'rgba(17,24,39,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="revenue" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'rgba(17,24,39,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <Link to="/admin/orders" className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders?.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div>
                  <p className="text-white text-sm font-medium">#{order.orderNumber || order._id?.slice(-6)}</p>
                  <p className="text-gray-400 text-xs">{order.customerName || 'Customer'}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderStatusColor[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                    {order.status}
                  </span>
                  <p className="text-white text-sm mt-1">₹{(order.total || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top Products</h3>
            <Link to="/admin/products" className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts?.slice(0, 5).map((product) => (
              <div key={product._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <img
                  src={product.coverImage || product.image || 'https://via.placeholder.com/40'}
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{product.name}</p>
                  <p className="text-gray-400 text-xs">{product.totalSales || 0} sold</p>
                </div>
                <p className="text-white text-sm font-medium">₹{(product.price || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Users</h3>
            <Link to="/admin/users" className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers?.slice(0, 5).map((user) => (
              <div key={user._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user.name}</p>
                  <p className="text-gray-400 text-xs truncate">{user.email}</p>
                </div>
                <p className="text-gray-400 text-xs whitespace-nowrap">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
