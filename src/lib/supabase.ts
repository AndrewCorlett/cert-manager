import { createClient, SupabaseClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not found. Running in offline mode.');
      return null;
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // Use PKCE flow for enhanced security
        storage: {
          getItem: (key) => {
            if (typeof window !== 'undefined') {
              return localStorage.getItem(key);
            }
            return null;
          },
          setItem: (key, value) => {
            if (typeof window !== 'undefined') {
              localStorage.setItem(key, value);
            }
          },
          removeItem: (key) => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(key);
            }
          },
        },
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'cert-manager-pwa',
        },
      },
    });
  }
  
  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop, receiver) {
    const instance = getSupabase();
    if (!instance) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }
    return Reflect.get(instance, prop, receiver);
  }
});

// Client-side encryption utilities
export class ClientEncryption {
  private static getOrCreateKey(): string {
    const storedKey = localStorage.getItem('cert_encryption_key');
    if (storedKey) {
      return storedKey;
    }
    
    // Generate a new key if none exists
    const newKey = CryptoJS.lib.WordArray.random(256/8).toString();
    localStorage.setItem('cert_encryption_key', newKey);
    return newKey;
  }

  static encrypt(data: string): string {
    const key = this.getOrCreateKey();
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  static decrypt(encryptedData: string): string {
    const key = this.getOrCreateKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static encryptFile(file: ArrayBuffer): string {
    const key = this.getOrCreateKey();
    const wordArray = CryptoJS.lib.WordArray.create(file);
    return CryptoJS.AES.encrypt(wordArray, key).toString();
  }

  static decryptFile(encryptedData: string): ArrayBuffer {
    const key = this.getOrCreateKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    
    // Convert WordArray to ArrayBuffer
    const words = decrypted.words;
    const sigBytes = decrypted.sigBytes;
    const arrayBuffer = new ArrayBuffer(sigBytes);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < sigBytes; i++) {
      const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      uint8Array[i] = byte;
    }
    
    return arrayBuffer;
  }
}

// Auth utilities
export async function getCurrentUser() {
  const instance = getSupabase();
  if (!instance) {
    return null;
  }
  
  const { data: { user }, error } = await instance.auth.getUser();
  if (error) return null;
  return user;
}

export async function signOut() {
  const instance = getSupabase();
  if (!instance) {
    return;
  }
  
  const { error } = await instance.auth.signOut();
  if (error) throw error;
}

// Export the getSupabase function for use in other modules
export { getSupabase };