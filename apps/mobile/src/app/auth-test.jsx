import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Stack } from 'expo-router';
import AuthTest from '../utils/auth/AuthTest';
import AuthModal from '../utils/auth/useAuthModal';

/**
 * Screen for testing authentication flow
 */
export default function AuthTestScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Auth Test' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Authentication Flow Test</Text>
        <Text style={styles.description}>
          This screen allows you to test the authentication flow implementation.
          You can sign in, sign up, check token status, and refresh authentication.
        </Text>
        
        <View style={styles.testContainer}>
          <AuthTest />
        </View>
        
        <Text style={styles.note}>
          Note: The authentication modal will appear when you press Sign In or Sign Up.
          After successful authentication, the modal will close automatically.
        </Text>
      </ScrollView>
      
      {/* Include the AuthModal component to handle authentication */}
      <AuthModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
    textAlign: 'center',
  },
  testContainer: {
    marginVertical: 20,
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
});