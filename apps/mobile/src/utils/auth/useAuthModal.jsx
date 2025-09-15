import React, { useEffect } from 'react';
import { Modal, View, BackHandler, Platform, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { AuthWebView } from './AuthWebView';
import { useAuthStore, useAuthModal } from './store';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';

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
      animationType="none" // Disable default animation as we're using custom ones
    >
      {/* Background overlay with fade animation */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          type: 'timing',
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        }}
        style={styles.overlay}
      />
      
      {/* Modal container with slide-up animation */}
      <MotiView
        from={{
          translateY: '100%',
          opacity: 0,
        }}
        animate={{
          translateY: 0,
          opacity: 1,
        }}
        exit={{
          translateY: '100%',
          opacity: 0,
        }}
        transition={{
          type: 'timing',
          duration: 500,
          easing: Easing.out(Easing.cubic),
        }}
        style={styles.modalContainer}
      >
        <AuthWebView
          mode={mode}
          proxyURL={proxyURL}
          baseURL={baseURL}
        />
      </MotiView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '90%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    // Add shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // Add elevation for Android
    elevation: 5,
  },
});

// Export the AuthModal component
export default AuthModal;