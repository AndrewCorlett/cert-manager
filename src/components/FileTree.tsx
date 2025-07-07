'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Plus } from 'lucide-react';
import { useCertStore } from '@/lib/store';
import FileUploadModal from './FileUploadModal';
import DocumentValidationModal from './DocumentValidationModal';

interface DocumentData {
  name: string;
  category: string;
  issuedDate: string;
  expiryDate: string;
  certificateNumber: string;
  issuingOrganization: string;
  filePath?: string;
}

interface FileTreeProps {
  showSelection?: boolean;
  onFileSelect?: (certId: string) => void;
  onLongPress?: (certId: string) => void;
}

export default function FileTree({ showSelection = false, onFileSelect, onLongPress }: FileTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [aiProcessedData, setAiProcessedData] = useState<Partial<DocumentData> | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [aiProcessingFailed, setAiProcessingFailed] = useState(false);
  const certificates = useCertStore((state) => state.certificates);
  const selectedCertificates = useCertStore((state) => state.selectedCertificates);
  const toggleCertificateSelection = useCertStore((state) => state.toggleCertificateSelection);
  const addCertificate = useCertStore((state) => state.addCertificate);

  const categories = ['STCW', 'GWO', 'OPITO', 'Contracts'];

  // Utility function to determine certificate status and styling
  const getCertificateStatus = (expiryDate: string, notificationDays: number = 30) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      // Expired
      return {
        status: 'expired',
        textColor: 'var(--error-red)', // theme-aware red
        textDecoration: 'line-through'
      };
    } else if (daysDiff <= notificationDays) {
      // Due for expiry within notification period
      return {
        status: 'expiring',
        textColor: 'var(--error-red)', // theme-aware red
        textDecoration: 'none'
      };
    } else {
      // Valid
      return {
        status: 'valid',
        textColor: 'var(--white-pure)', // theme-aware text
        textDecoration: 'none'
      };
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCertificateClick = (certId: string) => {
    if (showSelection) {
      toggleCertificateSelection(certId);
    }
    if (onFileSelect) {
      onFileSelect(certId);
    }
  };

  const handleLongPress = (certId: string) => {
    if (onLongPress) {
      onLongPress(certId);
    }
  };

  const getCertificatesByCategory = (category: string) => {
    return certificates.filter(cert => cert.category === category);
  };

  const handleFileUpload = async (file: File) => {
    // Store the file for later use
    setCurrentFile(file);

    let aiData = {};
    let aiProcessingFailed = false;

    try {
      // TODO: Replace with actual API key check
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      if (!apiKey) {
        console.warn('API key not configured - using manual input mode');
        aiProcessingFailed = true;
      } else {
        // Process with AI (mock data for now)
        // In real implementation, this would call your AI service
        try {
          aiData = {
            name: file.name.replace(/\.(pdf|jpg|jpeg|png)$/i, ''),
            category: 'STCW', // AI would determine this
            issuedDate: '', // AI would extract this - leaving empty to test validation
            expiryDate: '', // AI would extract this - leaving empty to test validation
            certificateNumber: `AI-${Date.now()}`,
            issuingOrganization: '' // AI would extract this
          };
          console.log('AI processing completed successfully');
        } catch (aiError) {
          console.warn('AI processing failed - falling back to manual input:', aiError);
          aiProcessingFailed = true;
        }
      }
    } catch (error) {
      console.warn('API configuration error - falling back to manual input:', error);
      aiProcessingFailed = true;
    }

    // If AI processing failed, provide empty data for manual input
    if (aiProcessingFailed) {
      aiData = {
        name: file.name.replace(/\.(pdf|jpg|jpeg|png)$/i, ''),
        category: '',
        issuedDate: '',
        expiryDate: '',
        certificateNumber: '',
        issuingOrganization: ''
      };
    }

    setAiProcessedData(aiData);
    setAiProcessingFailed(aiProcessingFailed);
    setIsUploadModalOpen(false);
    setIsValidationModalOpen(true);
  };

  const handleDocumentSave = async (validatedData: DocumentData) => {
    try {
      if (!currentFile) return;

      // Create the final certificate data
      const certificateData = {
        name: validatedData.name,
        category: validatedData.category as 'STCW' | 'GWO' | 'OPITO' | 'Contracts' | 'Other',
        filePath: `/certificates/${currentFile.name}`,
        issueDate: validatedData.issuedDate,
        expiryDate: validatedData.expiryDate,
        serialNumber: validatedData.certificateNumber || `CERT-${Date.now()}`,
        status: 'valid' as const,
        pdfUrl: URL.createObjectURL(currentFile)
      };

      addCertificate(certificateData);
      
      // Reset state
      setCurrentFile(null);
      setAiProcessedData(null);
      setAiProcessingFailed(false);
      setIsValidationModalOpen(false);
      
      console.log('Certificate added successfully:', certificateData);
      
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document');
    }
  };

  return (
    <div className="space-y-2">
      {!showSelection && (
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-xl font-semibold"
            style={{ color: 'var(--grey-500)' }}
          >
            Documentation
          </h2>
          <button 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus size={20} style={{ color: 'var(--grey-500)' }} />
          </button>
        </div>
      )}

      {categories.map((category) => {
        const categoryCerts = getCertificatesByCategory(category);
        const isExpanded = expandedCategories.includes(category);

        return (
          <div key={category} className="border-b border-gray-200 pb-2">
            <button
              className="w-full flex items-center justify-between py-3 text-left"
              onClick={() => toggleCategory(category)}
            >
              <span 
                className="font-medium text-lg"
                style={{ color: 'var(--grey-500)' }}
              >
                {category}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={20} style={{ color: 'var(--grey-500)' }} />
              </motion.div>
            </button>

            <motion.div
              initial={false}
              animate={{
                height: isExpanded ? 'auto' : 0,
                opacity: isExpanded ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="space-y-1 pl-4">
                {categoryCerts.map((cert) => {
                  const certStatus = getCertificateStatus(cert.expiryDate);
                  
                  return (
                    <div
                      key={cert.id}
                      className={`flex items-center space-x-3 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                        showSelection && selectedCertificates.includes(cert.id)
                          ? 'bg-opacity-20'
                          : 'hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: showSelection && selectedCertificates.includes(cert.id) 
                          ? 'var(--gold-accent)' 
                          : 'transparent'
                      }}
                      onClick={() => handleCertificateClick(cert.id)}
                      onTouchStart={() => {
                        // Simple long press simulation
                        const timer = setTimeout(() => handleLongPress(cert.id), 500);
                        const cleanup = () => clearTimeout(timer);
                        
                        document.addEventListener('touchend', cleanup, { once: true });
                        document.addEventListener('touchmove', cleanup, { once: true });
                      }}
                    >
                      <span 
                        className="flex-1 text-sm"
                        style={{
                          color: showSelection && selectedCertificates.includes(cert.id)
                            ? 'var(--gold-accent)'
                            : certStatus.textColor,
                          textDecoration: showSelection && selectedCertificates.includes(cert.id)
                            ? 'none'
                            : certStatus.textDecoration
                        }}
                      >
                        {cert.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        );
      })}

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileUpload={handleFileUpload}
      />

      {/* Document Validation Modal */}
      <DocumentValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => {
          setIsValidationModalOpen(false);
          setCurrentFile(null);
          setAiProcessedData(null);
          setAiProcessingFailed(false);
        }}
        onSave={handleDocumentSave}
        aiData={aiProcessedData || {}}
        fileName={currentFile?.name || ''}
        aiProcessingFailed={aiProcessingFailed}
      />
    </div>
  );
}