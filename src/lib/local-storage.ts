import { Certificate } from './store';
import { ClientEncryption } from './supabase';

const DB_NAME = 'CertManagerDB';
const DB_VERSION = 1;
const CERT_STORE = 'certificates';
const FILE_STORE = 'files';

export interface LocalCertificate extends Certificate {
  encryptedFileData?: string;
  syncStatus: 'local' | 'synced' | 'pending' | 'conflict';
  localUpdatedAt: string;
}

export interface LocalFile {
  certificateId: string;
  encryptedData: string;
  fileType: 'pdf' | 'image';
  size: number;
}

class LocalStorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create certificates store
        if (!db.objectStoreNames.contains(CERT_STORE)) {
          const certStore = db.createObjectStore(CERT_STORE, { keyPath: 'id' });
          certStore.createIndex('category', 'category', { unique: false });
          certStore.createIndex('status', 'status', { unique: false });
          certStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Create files store
        if (!db.objectStoreNames.contains(FILE_STORE)) {
          db.createObjectStore(FILE_STORE, { keyPath: 'certificateId' });
        }
      };
    });
  }

  private ensureDb(): IDBDatabase {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  // Certificate operations
  async saveCertificate(cert: Certificate, fileData?: ArrayBuffer): Promise<void> {
    const db = this.ensureDb();
    const transaction = db.transaction([CERT_STORE, FILE_STORE], 'readwrite');
    
    // Encrypt sensitive fields for local storage
    const localCert: LocalCertificate = {
      ...cert,
      name: ClientEncryption.encrypt(cert.name),
      serialNumber: ClientEncryption.encrypt(cert.serialNumber),
      syncStatus: 'pending',
      localUpdatedAt: new Date().toISOString(),
    };

    // Save certificate
    await new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore(CERT_STORE).put(localCert);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Save file if provided
    if (fileData) {
      const encryptedFile = ClientEncryption.encryptFile(fileData);
      const localFile: LocalFile = {
        certificateId: cert.id,
        encryptedData: encryptedFile,
        fileType: cert.fileType || 'pdf',
        size: fileData.byteLength,
      };

      await new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(FILE_STORE).put(localFile);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getCertificate(id: string): Promise<Certificate | null> {
    const db = this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const request = db.transaction(CERT_STORE, 'readonly')
        .objectStore(CERT_STORE)
        .get(id);
      
      request.onsuccess = () => {
        const localCert = request.result as LocalCertificate;
        if (!localCert) {
          resolve(null);
          return;
        }

        // Decrypt sensitive fields
        const cert: Certificate = {
          ...localCert,
          name: ClientEncryption.decrypt(localCert.name),
          serialNumber: ClientEncryption.decrypt(localCert.serialNumber),
        };
        
        resolve(cert);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCertificates(): Promise<Certificate[]> {
    const db = this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const certificates: Certificate[] = [];
      const request = db.transaction(CERT_STORE, 'readonly')
        .objectStore(CERT_STORE)
        .openCursor();
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const localCert = cursor.value as LocalCertificate;
          
          // Decrypt sensitive fields
          const cert: Certificate = {
            ...localCert,
            name: ClientEncryption.decrypt(localCert.name),
            serialNumber: ClientEncryption.decrypt(localCert.serialNumber),
          };
          
          certificates.push(cert);
          cursor.continue();
        } else {
          resolve(certificates);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getCertificateFile(certificateId: string): Promise<ArrayBuffer | null> {
    const db = this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const request = db.transaction(FILE_STORE, 'readonly')
        .objectStore(FILE_STORE)
        .get(certificateId);
      
      request.onsuccess = () => {
        const localFile = request.result as LocalFile;
        if (!localFile) {
          resolve(null);
          return;
        }

        // Decrypt file data
        const decryptedData = ClientEncryption.decryptFile(localFile.encryptedData);
        resolve(decryptedData);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCertificate(id: string): Promise<void> {
    const db = this.ensureDb();
    const transaction = db.transaction([CERT_STORE, FILE_STORE], 'readwrite');
    
    // Delete certificate
    await new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore(CERT_STORE).delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Delete associated file
    await new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore(FILE_STORE).delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateSyncStatus(id: string, status: LocalCertificate['syncStatus']): Promise<void> {
    const cert = await this.getCertificate(id);
    if (!cert) return;

    const db = this.ensureDb();
    const localCert = await this.getLocalCertificate(id);
    if (!localCert) return;

    localCert.syncStatus = status;
    
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction(CERT_STORE, 'readwrite')
        .objectStore(CERT_STORE)
        .put(localCert);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getLocalCertificate(id: string): Promise<LocalCertificate | null> {
    const db = this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const request = db.transaction(CERT_STORE, 'readonly')
        .objectStore(CERT_STORE)
        .get(id);
      
      request.onsuccess = () => resolve(request.result as LocalCertificate);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingCertificates(): Promise<Certificate[]> {
    const db = this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const certificates: Certificate[] = [];
      const request = db.transaction(CERT_STORE, 'readonly')
        .objectStore(CERT_STORE)
        .index('syncStatus')
        .openCursor(IDBKeyRange.only('pending'));
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const localCert = cursor.value as LocalCertificate;
          
          // Decrypt sensitive fields
          const cert: Certificate = {
            ...localCert,
            name: ClientEncryption.decrypt(localCert.name),
            serialNumber: ClientEncryption.decrypt(localCert.serialNumber),
          };
          
          certificates.push(cert);
          cursor.continue();
        } else {
          resolve(certificates);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const localStorageManager = new LocalStorageManager();