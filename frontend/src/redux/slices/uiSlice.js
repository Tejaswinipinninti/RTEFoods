import { createSlice } from '@reduxjs/toolkit';

const getInitialDarkMode = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('rte-dark-mode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const applyDarkClass = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('rte-dark-mode', String(isDark));
};

const initialDark = getInitialDarkMode();
applyDarkClass(initialDark);

const initialState = {
  sidebarOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  darkMode: initialDark,
  cartOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      applyDarkClass(state.darkMode);
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      applyDarkClass(action.payload);
    },
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
    },
    openCart: (state) => {
      state.cartOpen = true;
    },
    closeCart: (state) => {
      state.cartOpen = false;
    },
  },
});

export const { toggleSidebar, toggleMobileMenu, toggleSearch, toggleDarkMode, setDarkMode, toggleCart, openCart, closeCart } = uiSlice.actions;
export default uiSlice.reducer;
