import React, { useEffect } from 'react';
import { Modal, View, BackHandler, Platform } from 'react-native';
import { useMemo } from 'react';
import { AuthWebView } from './AuthWebView';
import { useAuthStore, useAuthModal } from './store';


/**
 * This component renders a modal for authentication purposes.
 * To show it programmatically, you should either use the `useRequireAuth` hook or the `useAuthModal` hook.
 *
 * @example
 * ```js
 * import { useAuthModal } from '@/utils/useAuthModal';
 * function MyComponent() {
 * const { open } = useAuthModal();
 * return <Button title="Login" onPress={() => open({ mode: 'signin' })} />;
 * }
 * ```
 *
 * @example
 * ```js
 * import { useRequireAuth } from '@/utils/useAuth';
 * function MyComponent() {
 *   // automatically opens the auth modal if the user is not authenticated
 *   useRequireAuth();
 *   return <Text>Protected Content</Text>;
 * }
 *
 */
export const AuthModal = () => {
  const { isOpen, mode, close } = useAuthModal();
  const { auth } = useAuthStore();

  const snapPoints = useMemo(() => ['100%'], []);
  const proxyURL = process.env.EXPO_PUBLIC_PROXY_BASE_URL;
  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;
  
  // Handle back button press on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (isOpen && !auth) {
          close();
          return true; // Prevent default behavior
        }
        return false; // Allow default behavior
      });
      
      return () => backHandler.remove();
    }
  }, [isOpen, auth, close]);
  
  // Close modal when auth state changes
  useEffect(() => {
    if (auth && isOpen) {
      close();
    }
  }, [auth, isOpen, close]);
  
  if (!proxyURL || !baseURL) {
    return null;
  }

  return (
    <Modal
      visible={isOpen && !auth}
      transparent={true}
      animationType="slide"
    >
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          width: '100%',
          backgroundColor: '#fff',
          padding: 0,
        }}
      >
        <AuthWebView
          mode={mode}
          proxyURL={proxyURL}
          baseURL={baseURL}
        />
      </View>
    </Modal>
  );
};

// Export the AuthModal component
export default AuthModal;