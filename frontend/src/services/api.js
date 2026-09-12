import axios from 'axios';

let authDispatch = null;

export const setAuthCallbacks = (dispatch) => {
  authDispatch = dispatch;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh-token`,
            { refreshToken }
          );
          const newToken = data.accessToken || data.data?.accessToken;
          const newRefresh = data.refreshToken || data.data?.refreshToken;
          if (newToken) localStorage.setItem('accessToken', newToken);
          if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (authDispatch) {
          const { clearAuth } = await import('../redux/slices/authSlice');
          authDispatch(clearAuth());
        }
        return Promise.reject(refreshError);
      }

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (authDispatch) {
        const { clearAuth } = await import('../redux/slices/authSlice');
        authDispatch(clearAuth());
      }
    }

    return Promise.reject(error);
  }
);

export default api;
