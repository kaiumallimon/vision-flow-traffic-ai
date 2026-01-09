import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    console.log('setAuth called with:', { token: token?.substring(0, 20), user });

    // Update localStorage first
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Saved to localStorage');
    }

    // Then update Zustand state
    set({ token, user, isAuthenticated: true });
    console.log('Updated Zustand state:', get());
  },

  clearAuth: () => {
    console.log('clearAuth called');

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    // Clear Zustand state
    set({ token: null, user: null, isAuthenticated: false });
  },

  // Initialize from localStorage on mount
  initAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      console.log('initAuth - found in localStorage:', { hasToken: !!token, hasUser: !!userStr });

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ token, user, isAuthenticated: true });
          console.log('initAuth - loaded into state');
        } catch (error) {
          console.error('Failed to parse user data:', error);
          get().clearAuth();
        }
      }
    }
  },
}));
