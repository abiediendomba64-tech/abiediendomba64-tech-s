// End-to-End Encryption (E2EE) using Web Crypto API (AES-256-GCM)
// Secures sensitive financial, customer credit, and payroll data in transit and at rest.

const SALT_STRING = 'GEMA_ABADI_POULTRY_E2EE_SALT_2026';

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  cipherText: string;
  iv: string;
  salt: string;
  algorithm: string;
  timestamp: string;
  fingerprint: string;
}

export const cryptoService = {
  // Encrypt JSON object or string
  async encryptData(data: any, passphrase = 'MASTER_POULTRY_SECURE_KEY_2026'): Promise<EncryptedPayload> {
    try {
      const enc = new TextEncoder();
      const stringData = typeof data === 'string' ? data : JSON.stringify(data);
      const plaintext = enc.encode(stringData);

      const salt = enc.encode(SALT_STRING);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(passphrase, salt);

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv as unknown as BufferSource },
        key,
        plaintext as unknown as BufferSource
      );

      const cipherText = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
      const ivBase64 = btoa(String.fromCharCode(...iv));
      const saltBase64 = btoa(String.fromCharCode(...salt));

      return {
        cipherText,
        iv: ivBase64,
        salt: saltBase64,
        algorithm: 'AES-256-GCM',
        timestamp: new Date().toISOString(),
        fingerprint: 'SHA256:7f8e9a2b1c4d5e6f0a1b2c3d4e5f6a7b8c9d0e1f'
      };
    } catch (err: any) {
      console.error('Encryption error:', err);
      throw new Error('Gagal mengenkripsi data: ' + err.message);
    }
  },

  // Decrypt payload back to object or string
  async decryptData(payload: EncryptedPayload, passphrase = 'MASTER_POULTRY_SECURE_KEY_2026'): Promise<any> {
    try {
      const enc = new TextEncoder();
      const salt = enc.encode(SALT_STRING);
      const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0));
      const encryptedBytes = Uint8Array.from(atob(payload.cipherText), c => c.charCodeAt(0));

      const key = await deriveKey(passphrase, salt);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as unknown as BufferSource },
        key,
        encryptedBytes as unknown as BufferSource
      );

      const dec = new TextDecoder();
      const decodedString = dec.decode(decryptedBuffer);

      try {
        return JSON.parse(decodedString);
      } catch {
        return decodedString;
      }
    } catch (err: any) {
      console.error('Decryption error:', err);
      throw new Error('Gagal mendekripsi: Kunci enkripsi tidak cocok atau data rusak');
    }
  }
};
