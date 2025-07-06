import { getSupabase, signInAnonymously, getCurrentUser } from './supabase';
import { localStorageManager } from './local-storage';
import { Certificate } from './store';

export class SyncService {
  private syncInProgress = false;
  private userId: string | null = null;

  async initialize(): Promise<void> {
    // Initialize local storage
    await localStorageManager.init();

    // Check if Supabase is available
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('Supabase not configured - running in offline mode');
      return;
    }

    // Sign in anonymously if not already signed in
    const user = await getCurrentUser();
    if (!user) {
      await signInAnonymously();
    }
    
    // Get current user
    const currentUser = await getCurrentUser();
    this.userId = currentUser?.id || null;

    // Start periodic sync only if we have a user
    if (this.userId) {
      this.startPeriodicSync();
    }
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds
    setInterval(() => {
      if (!this.syncInProgress) {
        this.sync().catch(console.error);
      }
    }, 30000);
  }

  async sync(): Promise<void> {
    if (this.syncInProgress || !this.userId) return;

    try {
      this.syncInProgress = true;
      
      // 1. Upload pending local certificates
      await this.uploadPendingCertificates();
      
      // 2. Download remote certificates
      await this.downloadRemoteCertificates();
      
      // 3. Resolve conflicts if any
      await this.resolveConflicts();
    } finally {
      this.syncInProgress = false;
    }
  }

  private async uploadPendingCertificates(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    
    const pendingCerts = await localStorageManager.getPendingCertificates();
    
    for (const cert of pendingCerts) {
      try {
        // Get file data if exists
        const fileData = await localStorageManager.getCertificateFile(cert.id);
        
        // Call the database function to insert certificate
        const { error } = await supabase.rpc('insert_certificate', {
          p_name: cert.name,
          p_serial_number: cert.serialNumber,
          p_category: cert.category,
          p_issue_date: cert.issueDate,
          p_expiry_date: cert.expiryDate,
          p_file_type: cert.fileType || 'pdf',
          p_file_size: fileData ? fileData.byteLength : null,
          p_client_id: cert.id,
          p_client_updated_at: new Date().toISOString(),
          p_file_data: fileData ? btoa(String.fromCharCode(...new Uint8Array(fileData))) : null
        });

        if (error) throw error;

        // Update sync status
        await localStorageManager.updateSyncStatus(cert.id, 'synced');
      } catch (error) {
        console.error('Failed to upload certificate:', cert.id, error);
        // Keep as pending for retry
      }
    }
  }

  private async downloadRemoteCertificates(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    
    try {
      // Fetch certificates from the decrypted view
      const { data: remoteCerts, error } = await supabase
        .from('certificates_decrypted')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const localCerts = await localStorageManager.getAllCertificates();
      const localCertMap = new Map(localCerts.map(c => [c.id, c]));

      for (const remoteCert of remoteCerts || []) {
        const localCert = localCertMap.get(remoteCert.client_id);
        
        // Skip if local version is newer
        if (localCert && new Date(localCert.id) > new Date(remoteCert.client_updated_at)) {
          continue;
        }

        // Convert remote cert to local format
        const cert: Certificate = {
          id: remoteCert.client_id,
          name: remoteCert.name,
          category: remoteCert.category,
          filePath: `/certificates/${remoteCert.client_id}`,
          issueDate: remoteCert.issue_date,
          expiryDate: remoteCert.expiry_date,
          serialNumber: remoteCert.serial_number,
          status: remoteCert.status,
          fileType: remoteCert.file_type,
        };

        // Download file data if needed
        let fileData: ArrayBuffer | undefined;
        if (remoteCert.has_file_data && (!localCert || !await localStorageManager.getCertificateFile(cert.id))) {
          const { data: fileDataResult, error: fileError } = await supabase.rpc('get_certificate_file', {
            p_certificate_id: remoteCert.id
          });

          if (!fileError && fileDataResult) {
            // Convert base64 to ArrayBuffer
            const binaryString = atob(fileDataResult);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            fileData = bytes.buffer;
          }
        }

        // Save to local storage
        await localStorageManager.saveCertificate(cert, fileData);
        await localStorageManager.updateSyncStatus(cert.id, 'synced');
      }
    } catch (error) {
      console.error('Failed to download remote certificates:', error);
    }
  }

  private async resolveConflicts(): Promise<void> {
    // For now, we're using a simple last-write-wins strategy
    // In a production app, you might want to implement more sophisticated
    // conflict resolution (e.g., showing conflicts to the user)
  }

  async uploadCertificate(cert: Certificate, fileData?: ArrayBuffer): Promise<void> {
    // Save locally first
    await localStorageManager.saveCertificate(cert, fileData);
    
    // Trigger sync
    await this.sync();
  }

  async deleteCertificate(id: string): Promise<void> {
    // Delete locally
    await localStorageManager.deleteCertificate(id);
    
    // Delete from Supabase
    const supabase = getSupabase();
    if (this.userId && supabase) {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('client_id', id);
      
      if (error) {
        console.error('Failed to delete certificate from server:', error);
      }
    }
  }

  async getCertificates(): Promise<Certificate[]> {
    // Always return from local storage (which is synced with remote)
    return localStorageManager.getAllCertificates();
  }

  async getCertificateFile(id: string): Promise<ArrayBuffer | null> {
    return localStorageManager.getCertificateFile(id);
  }
}

export const syncService = new SyncService();