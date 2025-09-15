// Web polyfill for expo-crypto

/**
 * Generate random bytes
 * @param length Number of bytes to generate
 * @returns Uint8Array of random bytes
 */
export async function getRandomBytesAsync(length: number): Promise<Uint8Array> {
  const array = new Uint8Array(length);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for older browsers
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return array;
}

/**
 * Crypto digest algorithms
 */
export enum CryptoDigestAlgorithm {
  SHA1 = 'SHA-1',
  SHA256 = 'SHA-256',
  SHA384 = 'SHA-384',
  SHA512 = 'SHA-512',
}

/**
 * Digest a string using the specified algorithm
 * @param algorithm Digest algorithm to use
 * @param data String to digest
 * @returns Hex string of the digest
 */
export async function digestStringAsync(
  algorithm: CryptoDigestAlgorithm,
  data: string
): Promise<string> {
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest(algorithm, dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Simple fallback for browsers without crypto.subtle
    // Note: This is NOT cryptographically secure
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}