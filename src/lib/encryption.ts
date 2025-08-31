// Simple encryption/decryption utility
// Using base64 encoding with a simple key rotation for demo purposes
// In production, use proper encryption like AES

const ENCRYPTION_KEY = "GMS_QUIZ_2025_SECRET_KEY";

export function encryptId(id: string): string {
  try {
    // Simple XOR encryption with base64 encoding
    const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
    const idBytes = new TextEncoder().encode(id);
    
    const encrypted = new Uint8Array(idBytes.length);
    for (let i = 0; i < idBytes.length; i++) {
      encrypted[i] = idBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert to base64 and make URL safe
    return btoa(String.fromCharCode(...encrypted))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } catch (error) {
    console.error('Encryption error:', error);
    return id; // fallback to original ID
  }
}

export function decryptId(encryptedId: string): string {
  try {
    // Reverse URL safe base64
    const base64 = encryptedId
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    const padded = base64 + '==='.slice(0, (4 - base64.length % 4) % 4);
    
    const encryptedBytes = new Uint8Array(
      atob(padded).split('').map(c => c.charCodeAt(0))
    );
    
    const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
    const decrypted = new Uint8Array(encryptedBytes.length);
    
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedId; // fallback to original ID
  }
}

// Utility to check if a string is encrypted (basic check)
export function isEncrypted(id: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(id) && id.length > 10;
}
