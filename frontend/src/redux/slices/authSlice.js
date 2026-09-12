import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';
import { signInWithGoogle, signInWithFacebook } from '../../services/firebase/auth';

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.login(data);
    const payload = response.data;
    const token = payload.data?.accessToken || payload.accessToken;
    const refToken = payload.data?.refreshToken || payload.refreshToken;
    if (token) localStorage.setItem('accessToken', token);
    if (refToken) localStorage.setItem('refreshToken', refToken);
    return payload;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.register(data);
    const payload = response.data;
    const token = payload.data?.accessToken || payload.accessToken;
    const refToken = payload.data?.refreshToken || payload.refreshToken;
    if (token) localStorage.setItem('accessToken', token);
    if (refToken) localStorage.setItem('refreshToken', refToken);
    return payload;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const socialLogin = createAsyncThunk('auth/socialLogin', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.socialLogin(data);
    const token = response.data.accessToken || response.data.data?.accessToken;
    const refToken = response.data.refreshToken || response.data.data?.refreshToken;
    if (token) localStorage.setItem('accessToken', token);
    if (refToken) localStorage.setItem('refreshToken', refToken);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Social login failed');
  }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async (_, { rejectWithValue }) => {
  try {
    const firebaseUser = await signInWithGoogle();
    const response = await authService.socialLogin({
      provider: 'google',
      email: firebaseUser.email,
      firstName: firebaseUser.firstName,
      lastName: firebaseUser.lastName,
      avatar: firebaseUser.avatar,
    });
    const token = response.data.accessToken || response.data.data?.accessToken;
    const refToken = response.data.refreshToken || response.data.data?.refreshToken;
    if (token) localStorage.setItem('accessToken', token);
    if (refToken) localStorage.setItem('refreshToken', refToken);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'Google login failed');
  }
});

export const facebookLogin = createAsyncThunk('auth/facebookLogin', async (_, { rejectWithValue }) => {
  try {
    const firebaseUser = await signInWithFacebook();
    const response = await authService.socialLogin({
      provider: 'facebook',
      email: firebaseUser.email,
      firstName: firebaseUser.firstName,
      lastName: firebaseUser.lastName,
      avatar: firebaseUser.avatar,
    });
    const token = response.data.accessToken || response.data.data?.accessToken;
    const refToken = response.data.refreshToken || response.data.data?.refreshToken;
    if (token) localStorage.setItem('accessToken', token);
    if (refToken) localStorage.setItem('refreshToken', refToken);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'Facebook login failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getMe();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to get user');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return rejectWithValue(error.response?.data?.message || 'Logout failed');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.updateProfile(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Update profile failed');
  }
});

export const addAddress = createAsyncThunk('auth/addAddress', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.addAddress(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Add address failed');
  }
});

export const updateAddress = createAsyncThunk('auth/updateAddress', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await authService.updateAddress(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Update address failed');
  }
});

export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (id, { rejectWithValue }) => {
  try {
    const response = await authService.deleteAddress(id);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Delete address failed');
  }
});

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: !!localStorage.getItem('accessToken'),
  token: localStorage.getItem('accessToken') || '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = '';
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user || action.payload.user || action.payload.data;
        state.isAuthenticated = true;
        state.token = action.payload.data?.accessToken || action.payload.accessToken || state.token;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user || action.payload.user || action.payload.data;
        state.isAuthenticated = true;
        state.token = action.payload.data?.accessToken || action.payload.accessToken || state.token;
      })
      .addCase(register.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(socialLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user || action.payload.user || action.payload.data;
        state.isAuthenticated = true;
        state.token = action.payload.data?.accessToken || action.payload.accessToken || state.token;
      })
      .addCase(socialLogin.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user || action.payload.user || action.payload.data;
        state.isAuthenticated = true;
        state.token = action.payload.data?.accessToken || action.payload.accessToken || state.token;
      })
      .addCase(googleLogin.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(facebookLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(facebookLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user || action.payload.user || action.payload.data;
        state.isAuthenticated = true;
        state.token = action.payload.data?.accessToken || action.payload.accessToken || state.token;
      })
      .addCase(facebookLogin.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data || action.payload.user || action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = '';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = '';
        state.loading = false;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data || action.payload.user || action.payload;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload.addresses;
        }
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload.addresses;
        }
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload.addresses;
        }
      });
  },
});

export const { setUser, clearAuth, setLoading } = authSlice.actions;
export default authSlice.reducer;
