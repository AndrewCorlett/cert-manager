'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Plus } from 'lucide-react';
import { useCertStore } from '@/lib/store';
import FileUploadModal from './FileUploadModal';

interface FileTreeProps {
  showSelection?: boolean;
  onFileSelect?: (certId: string) => void;
  onLongPress?: (certId: string) => void;
}

export default function FileTree({ showSelection = false, onFileSelect, onLongPress }: FileTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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
        textColor: '#ef4444', // red
        textDecoration: 'line-through'
      };
    } else if (daysDiff <= notificationDays) {
      // Due for expiry within notification period
      return {
        status: 'expiring',
        textColor: '#ef4444', // red
        textDecoration: 'none'
      };
    } else {
      // Valid
      return {
        status: 'valid',
        textColor: '#ffffff', // white
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
    try {
      // TODO: Replace with actual API key check
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('API key is not configured. Please add your OpenAI API key to environment variables.');
      }

      // For now, create a mock certificate with file information
      // In a real implementation, this would send the file to AI for processing
      const mockProcessedData = {
        name: file.name.replace(/\.(pdf|jpg|jpeg|png)$/i, ''),
        category: 'STCW' as const, // Default category, AI would determine this
        filePath: `/certificates/${file.name}`,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
        serialNumber: `AI-${Date.now()}`,
        status: 'valid' as const,
        pdfUrl: URL.createObjectURL(file)
      };

      addCertificate(mockProcessedData);
      
      // Show success message
      console.log('Certificate added successfully:', mockProcessedData);
      
    } catch (error) {
      // This will show the API key error as requested
      alert(error instanceof Error ? error.message : 'Failed to process document');
      console.error('Upload error:', error);
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
    </div>
  );
}