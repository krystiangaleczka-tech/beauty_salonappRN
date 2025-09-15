import { create } from 'zustand';
import { secureSetItem, secureGetItem, secureDeleteItem } from './secureStorage';

export const authKey = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-jwt`;
export const userCacheKey = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-user-cache`;

/**
 * This store manages the authentication state of the application.
 */
export const useAuthStore = create((set) => ({
  isReady: false,
  auth: null,
  setAuth: (auth) => {
    if (auth) {
      secureSetItem(authKey, JSON.stringify(auth));
    } else {
      secureDeleteItem(authKey);
    }
    set({ auth });
  },
}));

/**
 * This store manages the user data and caching.
 */
export const useUserStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  lastFetchTime: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds

  // Set user data and update cache
  setUser: (user) => {
    if (user) {
      const userData = {
        ...user,
        _timestamp: Date.now(),
      };
      secureSetItem(userCacheKey, JSON.stringify(userData));
      set({ 
        user: userData, 
        lastFetchTime: Date.now(),
        error: null 
      });
    } else {
      secureDeleteItem(userCacheKey);
      set({ 
        user: null, 
        lastFetchTime: null,
        error: null 
      });
    }
  },

  // Load user from cache
  loadUserFromCache: async () => {
    try {
      const cachedUser = await secureGetItem(userCacheKey);
      if (cachedUser) {
        const userData = JSON.parse(cachedUser);
        const { _timestamp, ...user } = userData;
        const now = Date.now();
        const { cacheExpiry } = get();
        
        // Check if cache is still valid
        if (_timestamp && (now - _timestamp < cacheExpiry)) {
          set({ 
            user: userData, 
            lastFetchTime: _timestamp,
            error: null 
          });
          return user;
        } else {
          // Cache expired, clear it
          secureDeleteItem(userCacheKey);
          set({ 
            user: null, 
            lastFetchTime: null,
            error: null 
          });
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading user from cache:', error);
      set({ error: 'Failed to load user data from cache' });
      return null;
    }
  },

  // Clear user data and cache
  clearUser: () => {
    secureDeleteItem(userCacheKey);
    set({ 
      user: null, 
      lastFetchTime: null,
      error: null 
    });
  },

  // Set loading state
  setLoading: (isLoading) => {
    set({ isLoading });
  },

  // Set error state
  setError: (error) => {
    set({ error });
  },
}));

/**
 * This store manages the state of the authentication modal.
 */
export const useAuthModal = create((set) => ({
  isOpen: false,
  mode: 'signup',
  open: (options) => set({ isOpen: true, mode: options?.mode || 'signup' }),
  close: () => set({ isOpen: false }),
}));