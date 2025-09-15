import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from './useAuth';
import { getTokenExpiryTime, isTokenExpired } from './tokenManager';
import { authKey } from './store';
import { secureGetItem } from './secureStorage';

/**
 * Test component for authentication flow
 */
export const AuthTest = () => {
  const { auth, signIn, signUp, signOut, initiate } = useAuth();
  
  const checkToken = async () => {
    try {
      const authData = await secureGetItem(authKey);
      if (!authData) {
        alert('No token found');
        return;
      }
      
      const parsedAuth = JSON.parse(authData);
      if (!parsedAuth || !parsedAuth.jwt) {
        alert('Invalid token format');
        return;
      }
      
      const expired = isTokenExpired(parsedAuth.jwt);
      const expiryTime = getTokenExpiryTime(parsedAuth.jwt);
      
      alert(
        `Token status:\n\n` +
        `Expired: ${expired ? 'Yes' : 'No'}\n` +
        `Time remaining: ${expiryTime} seconds\n` +
        `User: ${parsedAuth.user ? parsedAuth.user.email : 'Unknown'}`
      );
    } catch (error) {
      alert(`Error checking token: ${error.message}`);
    }
  };
  
  const refreshAuth = () => {
    initiate();
    alert('Auth refreshed');
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={styles.statusValue}>
          {auth ? 'Authenticated' : 'Not authenticated'}
        </Text>
      </View>
      
      {auth && (
        <View style={styles.userContainer}>
          <Text style={styles.userLabel}>User:</Text>
          <Text style={styles.userValue}>{auth.user?.email || 'Unknown'}</Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        {!auth ? (
          <>
            <Button title="Sign In" onPress={signIn} />
            <View style={styles.buttonSpacer} />
            <Button title="Sign Up" onPress={signUp} />
          </>
        ) : (
          <Button title="Sign Out" onPress={signOut} color="#ff3b30" />
        )}
        
        <View style={styles.buttonSpacer} />
        <Button 
          title="Check Token" 
          onPress={checkToken} 
          color="#007aff" 
        />
        
        <View style={styles.buttonSpacer} />
        <Button 
          title="Refresh Auth" 
          onPress={refreshAuth} 
          color="#34c759" 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  statusValue: {
    fontSize: 16,
  },
  userContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  userLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  userValue: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
  },
  buttonSpacer: {
    height: 10,
  },
});

export default AuthTest;