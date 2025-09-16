import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Encryption key name in SecureStore
const ENCRYPTION_KEY_NAME = 'auth_encryption_key';

/**
 * Generates or retrieves the encryption key
 * @returns {Promise<string>} The encryption key
 */
async function getEncryptionKey() {
  let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
  
  if (!key) {
    // Generate a new encryption key if none exists
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    key = Array.from(randomBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
  }
  
  return key;
}

/**
 * Encrypts data before storing it
 * @param {string} data - Data to encrypt
 * @returns {Promise<string>} Encrypted data
 */
async function encrypt(data) {
  try {
    const key = await getEncryptionKey();
    // Generate a random IV for each encryption
    const iv = await Crypto.getRandomBytesAsync(16);
    const ivHex = Array.from(iv)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    // Use a simple XOR encryption with the key and IV
    // In a production app, you would use a proper encryption algorithm like AES
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const ivChar = parseInt(ivHex.charAt(i % ivHex.length), 16);
      const dataChar = data.charCodeAt(i);
      const encryptedChar = (dataChar ^ keyChar ^ ivChar) % 256;
      encrypted += encryptedChar.toString(16).padStart(2, '0');
    }
    
    // Store the IV with the encrypted data
    return JSON.stringify({
      iv: ivHex,
      data: encrypted
    });
  } catch (error) {
    console.error('Encryption error:', error);
    return data; // Fallback to unencrypted data
  }
}

/**
 * Decrypts stored data
 * @param {string} encryptedData - Data to decrypt
 * @returns {Promise<string|null>} Decrypted data or null if decryption fails
 */
async function decrypt(encryptedData) {
  try {
    // Try to parse the encrypted data
    const { iv, data } = JSON.parse(encryptedData);
    
    // If we have valid encrypted data format
    if (iv && data) {
      const key = await getEncryptionKey();
      
      // Decrypt using the same XOR method
      let decrypted = '';
      for (let i = 0; i < data.length; i += 2) {
        const encryptedByte = parseInt(data.substr(i, 2), 16);
        const keyChar = key.charCodeAt((i / 2) % key.length);
        const ivChar = parseInt(iv.charAt((i / 2) % iv.length), 16);
        const decryptedChar = (encryptedByte ^ keyChar ^ ivChar) % 256;
        decrypted += String.fromCharCode(decryptedChar);
      }
      
      return decrypted;
    }
    
    // If the format is invalid, return null
    return null;
  } catch (error) {
    // If parsing fails, it's likely not encrypted data
    console.error('Decryption error:', error);
    return encryptedData; // Return the original data
  }
}

/**
 * Securely stores an item in SecureStore with encryption
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @returns {Promise<void>}
 */
export async function secureSetItem(key, value) {
  try {
    const encryptedValue = await encrypt(value);
    await SecureStore.setItemAsync(key, encryptedValue);
  } catch (error) {
    console.error('Error storing secure item:', error);
    // Fallback to regular storage
    await SecureStore.setItemAsync(key, value);
  }
}

/**
 * Securely retrieves an item from SecureStore with decryption
 * @param {string} key - Storage key
 * @returns {Promise<string|null>} Retrieved value or null
 */
export async function secureGetItem(key) {
  try {
    const encryptedValue = await SecureStore.getItemAsync(key);
    if (!encryptedValue) return null;
    
    return await decrypt(encryptedValue);
  } catch (error) {
    console.error('Error retrieving secure item:', error);
    // Attempt to get the value without decryption as fallback
    return await SecureStore.getItemAsync(key);
  }
}

/**
 * Securely deletes an item from SecureStore
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export async function secureDeleteItem(key) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error deleting secure item:', error);
  }
}