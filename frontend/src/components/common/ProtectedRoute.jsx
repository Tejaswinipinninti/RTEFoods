import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useAuth from '../../hooks/useAuth';
import { setLoading } from '../../redux/slices/authSlice';
import { Loader } from './Loader';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch();

  // Safety fallback: ensure loading never hangs indefinitely
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        dispatch(setLoading(false));
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [loading, dispatch]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-8 rounded-3xl my-8 mx-auto max-w-lg">
        <Loader size="lg" />
        <p className="mt-4 text-sm font-semibold text-gray-700">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
