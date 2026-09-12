import { useSelector } from 'react-redux';

const useAuth = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  return { user, isAuthenticated, loading, isAdmin };
};

export default useAuth;
