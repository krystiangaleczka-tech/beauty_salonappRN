import { Platform } from 'react-native';
import { authKey } from './store';
import { secureGetItem, secureSetItem } from './secureStorage';
import { BASE_URL } from '../../config';

/**
 * Parses a JWT token to extract its payload
 * @param {string} token - JWT token
 * @returns {object|null} Parsed token payload or null if invalid
 */
export function parseJwt(token) {
  try {
    // Split the token into parts
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    // Convert base64url to base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode the payload
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired or invalid
 */
export function isTokenExpired(token) {
  if (!token) return true;
  
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  
  // Check if the expiration time is in the past
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Gets the remaining time in seconds before token expiration
 * @param {string} token - JWT token
 * @returns {number} Seconds until expiration (0 if expired or invalid)
 */
export function getTokenExpiryTime(token) {
  if (!token) return 0;
  
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemaining = payload.exp - currentTime;
  
  return timeRemaining > 0 ? timeRemaining : 0;
}

/**
 * Refreshes the JWT token
 * @param {string} currentToken - Current JWT token
 * @returns {Promise<object|null>} New auth object or null if refresh failed
 */
export async function refreshToken(currentToken) {
  if (!currentToken) return null;
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ token: currentToken })
    });
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.jwt) {
      const newAuth = { jwt: data.jwt, user: data.user };
      await secureSetItem(authKey, JSON.stringify(newAuth));
      return newAuth;
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Gets the current auth data with token validation
 * @param {boolean} autoRefresh - Whether to automatically refresh expired tokens
 * @returns {Promise<object|null>} Auth data or null if invalid/expired
 */
export async function getValidAuth(autoRefresh = true) {
  try {
    const authData = await secureGetItem(authKey);
    if (!authData) return null;
    
    const auth = JSON.parse(authData);
    if (!auth || !auth.jwt) return null;
    
    // Check if token is expired
    if (isTokenExpired(auth.jwt)) {
      // If auto-refresh is enabled, try to refresh the token
      if (autoRefresh) {
        return await refreshToken(auth.jwt);
      }
      return null;
    }
    
    return auth;
  } catch (error) {
    console.error('Error getting valid auth:', error);
    return null;
  }
}

// Helper function for web platforms
function atob(data) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.atob) {
    return window.atob(data);
  } else {
    // Simple base64 decoder for non-web platforms
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let i = 0;
    
    // Remove non-base64 chars
    data = data.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    
    while (i < data.length) {
      const enc1 = chars.indexOf(data.charAt(i++));
      const enc2 = chars.indexOf(data.charAt(i++));
      const enc3 = chars.indexOf(data.charAt(i++));
      const enc4 = chars.indexOf(data.charAt(i++));
      
      const chr1 = (enc1 << 2) | (enc2 >> 4);
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const chr3 = ((enc3 & 3) << 6) | enc4;
      
      output += String.fromCharCode(chr1);
      
      if (enc3 !== 64) {
        output += String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output += String.fromCharCode(chr3);
      }
    }
    
    return output;
  }
}