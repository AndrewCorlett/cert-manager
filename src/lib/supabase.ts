import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
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
export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}