import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Loader } from './components/common/Loader';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/common/ProtectedRoute';
import { getMe, setLoading } from './redux/slices/authSlice';
import { getCart } from './redux/slices/cartSlice';
import { setAuthCallbacks } from './services/api';

const MainLayout = lazy(() => import('./layouts/MainLayout'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const UserLayout = lazy(() => import('./layouts/UserLayout'));

const Home = lazy(() => import('./pages/Home'));
const Categories = lazy(() => import('./pages/Categories'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const Addresses = lazy(() => import('./pages/Addresses'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminSubcategories = lazy(() => import('./pages/admin/AdminSubcategories'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminOffers = lazy(() => import('./pages/admin/AdminOffers'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs'));
const AdminFAQs = lazy(() => import('./pages/admin/AdminFAQs'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));
const AdminPincodes = lazy(() => import('./pages/admin/AdminPincodes'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    setAuthCallbacks(dispatch);
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(getMe());
      dispatch(getCart());
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 font-inter overflow-x-hidden">
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="categories" element={<Categories />} />
            <Route path="products" element={<Products />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="order-confirmation" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="order-confirmation/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
              <Route index element={<Profile />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="orders" element={<Orders />} />
            </Route>
            <Route path="user/*" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
              <Route index element={<Profile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="orders" element={<Orders />} />
            </Route>
          </Route>

          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="subcategories" element={<AdminSubcategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="faqs" element={<AdminFAQs />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="pincodes" element={<AdminPincodes />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
