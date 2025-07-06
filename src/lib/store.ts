import { create } from 'zustand';

export interface Certificate {
  id: string;
  name: string;
  category: 'STCW' | 'GWO' | 'OPITO' | 'Contracts' | 'Other';
  filePath: string;
  issueDate: string;
  expiryDate: string;
  serialNumber: string;
  status: 'valid' | 'expired' | 'upcoming';
  pdfUrl?: string;
  fileUrl?: string; // Universal file URL for PDFs, images, etc.
  fileType?: 'pdf' | 'image';
}

export interface CertificateStore {
  certificates: Certificate[];
  selectedCertificates: string[];
  currentViewingCert: Certificate | null;
  
  // Actions
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  updateCertificate: (id: string, updates: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;
  toggleCertificateSelection: (id: string) => void;
  clearSelection: () => void;
  setCurrentViewingCert: (cert: Certificate | null) => void;
  
  // Getters
  getCertificatesByCategory: (category: string) => Certificate[];
  getStatistics: () => { expired: number; valid: number; upcoming: number };
  
  // TODO BACKEND:FETCH_CERTS
  fetchCertificates: () => Promise<void>;
}

// Mock data for development
const mockCertificates: Certificate[] = [
  {
    id: '1',
    name: 'Basic Fire Fighting',
    category: 'STCW',
    filePath: '/certificates/basic-fire-fighting.pdf',
    issueDate: '2023-01-15',
    expiryDate: '2028-01-15',
    serialNumber: 'BFF-2023-001',
    status: 'valid',
    pdfUrl: '/dev-assets/ENG-1-2023.pdf'
  },
  {
    id: '2',
    name: 'Medical First Aid',
    category: 'STCW',
    filePath: '/certificates/medical-first-aid.pdf',
    issueDate: '2023-02-20',
    expiryDate: '2028-02-20',
    serialNumber: 'MFA-2023-002',
    status: 'valid',
    pdfUrl: '/dev-assets/ENG-1-2023.pdf'
  },
  {
    id: '3',
    name: 'Personnel Survival Techniques',
    category: 'STCW',
    filePath: '/certificates/pst.pdf',
    issueDate: '2023-03-10',
    expiryDate: '2028-03-10',
    serialNumber: 'PST-2023-003',
    status: 'valid',
    pdfUrl: '/dev-assets/ENG-1-2023.pdf'
  },
  {
    id: '4',
    name: 'Social & Security',
    category: 'STCW',
    filePath: '/certificates/social-security.pdf',
    issueDate: '2023-04-05',
    expiryDate: '2028-04-05',
    serialNumber: 'SS-2023-004',
    status: 'valid',
    pdfUrl: '/dev-assets/ENG-1-2023.pdf'
  },
  {
    id: '5',
    name: 'Seafarer Medical Certificate',
    category: 'STCW',
    filePath: '/certificates/medical-cert.pdf',
    issueDate: '2022-06-15',
    expiryDate: '2024-06-15',
    serialNumber: 'SMC-2022-005',
    status: 'expired',
    pdfUrl: '/dev-assets/ENG-1-2023.pdf'
  },
  {
    id: '6',
    name: 'GWO Basic Safety Training',
    category: 'GWO',
    filePath: '/certificates/gwo-basic.pdf',
    issueDate: '2023-07-20',
    expiryDate: '2025-07-20',
    serialNumber: 'GWO-2023-006',
    status: 'upcoming',
    pdfUrl: '/dev-assets/ENG-1-2023.pdf'
  },
  {
    id: '7',
    name: 'Proficiency in Personal Survival Techniques',
    category: 'STCW',
    filePath: '/certificates/ppst.png',
    issueDate: '2023-08-15',
    expiryDate: '2028-08-15',
    serialNumber: 'PPST-2023-007',
    status: 'valid',
    fileUrl: '/dev-assets/stcw-certificate.png',
    fileType: 'image'
  },
];

export const useCertStore = create<CertificateStore>((set, get) => ({
  certificates: mockCertificates,
  selectedCertificates: [],
  currentViewingCert: null,

  addCertificate: (cert) => {
    const newCert: Certificate = {
      ...cert,
      id: Date.now().toString(),
    };
    set((state) => ({
      certificates: [...state.certificates, newCert],
    }));
  },

  updateCertificate: (id, updates) => {
    set((state) => ({
      certificates: state.certificates.map((cert) =>
        cert.id === id ? { ...cert, ...updates } : cert
      ),
    }));
  },

  deleteCertificate: (id) => {
    set((state) => ({
      certificates: state.certificates.filter((cert) => cert.id !== id),
      selectedCertificates: state.selectedCertificates.filter((certId) => certId !== id),
      currentViewingCert: state.currentViewingCert?.id === id ? null : state.currentViewingCert,
    }));
  },

  toggleCertificateSelection: (id) => {
    set((state) => ({
      selectedCertificates: state.selectedCertificates.includes(id)
        ? state.selectedCertificates.filter((certId) => certId !== id)
        : [...state.selectedCertificates, id],
    }));
  },

  clearSelection: () => {
    set({ selectedCertificates: [] });
  },

  setCurrentViewingCert: (cert) => {
    set({ currentViewingCert: cert });
  },

  getCertificatesByCategory: (category) => {
    const { certificates } = get();
    return certificates.filter((cert) => cert.category === category);
  },

  getStatistics: () => {
    const { certificates } = get();
    const stats = certificates.reduce(
      (acc, cert) => {
        acc[cert.status]++;
        return acc;
      },
      { expired: 0, valid: 0, upcoming: 0 }
    );
    return stats;
  },

  // TODO BACKEND:FETCH_CERTS
  fetchCertificates: async () => {
    // Mock implementation - replace with actual Supabase call
    console.log('Fetching certificates from backend...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    // set({ certificates: fetchedCertificates });
  },
}));