import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { Modal, View } from 'react-native';
import { useAuthModal, useAuthStore, authKey } from './store';
import { getValidAuth, isTokenExpired, refreshToken } from './tokenManager';
import { secureGetItem } from './secureStorage';


/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { isOpen, close, open } = useAuthModal();

  const initiate = useCallback(async () => {
    try {
      // Get valid auth data with automatic token refresh if expired
      const auth = await getValidAuth(true);
      if (auth) {
        setAuth(auth);
      }
    } catch (e) {
      console.error('Error initializing auth:', e);
    } finally {
      useAuthStore.setState({ isReady: true });
    }
  }, [setAuth]);

  // Set up token refresh interval
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    // Initialize authentication state when component mounts
    initiate();

    // Set up token refresh check every 5 minutes
    const interval = setInterval(async () => {
      try {
        const authData = await secureGetItem(authKey);
        if (!authData) return;

        const auth = JSON.parse(authData);
        if (!auth || !auth.jwt) return;

        // If token is expired or will expire in the next 10 minutes (600 seconds)
        if (isTokenExpired(auth.jwt)) {
          console.log('Token expired, refreshing...');
          const newAuth = await refreshToken(auth.jwt);
          if (newAuth) {
            setAuth(newAuth);
          } else {
            // If refresh fails, sign out
            setAuth(null);
          }
        }
      } catch (error) {
        console.error('Error in token refresh interval:', error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    setRefreshInterval(interval);

    // Clean up interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [initiate, setAuth]);

  const signIn = useCallback(() => {
    open({ mode: 'signin' });
  }, [open]);
  const signUp = useCallback(() => {
    open({ mode: 'signup' });
  }, [open]);

  const signOut = useCallback(() => {
    setAuth(null);
    close();
  }, [close]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  const { open } = useAuthModal();

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      open({ mode: options?.mode });
    }
  }, [isAuthenticated, open, options?.mode, isReady]);
};

export default useAuth;