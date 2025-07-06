'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import UniversalFileViewer from '@/components/UniversalFileViewer';
import FloatingNavBar, { NavMode } from '@/components/FloatingNavBar';
import SendPanel from '@/components/SendPanel';
import SettingsPanel from '@/components/SettingsPanel';
import { useCertStore, Certificate } from '@/lib/store';

export default function CertificateViewer() {
  const params = useParams();
  const [navMode, setNavMode] = useState<NavMode>('collapsed');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  
  const certificates = useCertStore((state) => state.certificates);
  const setCurrentViewingCert = useCertStore((state) => state.setCurrentViewingCert);
  const clearSelection = useCertStore((state) => state.clearSelection);
  const getCertificateFile = useCertStore((state) => state.getCertificateFile);

  useEffect(() => {
    const certId = params.id as string;
    const cert = certificates.find(c => c.id === certId);
    setCertificate(cert || null);
    setCurrentViewingCert(cert || null);
    
    // Load file from backend if certificate exists
    if (cert) {
      getCertificateFile(cert.id).then((fileData) => {
        if (fileData) {
          // Create blob URL from file data
          const blob = new Blob([fileData], { 
            type: cert.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg' 
          });
          const url = URL.createObjectURL(blob);
          setFileUrl(url);
        } else if (cert.fileUrl || cert.pdfUrl) {
          // Fallback to existing URLs
          setFileUrl(cert.fileUrl || cert.pdfUrl || null);
        }
      });
    }
  }, [params.id, certificates, setCurrentViewingCert, getCertificateFile]);
  
  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const handleSend = async (selectedCerts: string[]) => {
    try {
      // Get certificate objects
      const certsToSend = certificates.filter(cert => selectedCerts.includes(cert.id));
      
      if (certsToSend.length === 0) {
        alert('No certificates selected');
        return;
      }

      // Check if Web Share API is supported and has file sharing capability
      if ('share' in navigator && 'canShare' in navigator) {
        await shareViaWebAPI(certsToSend);
      } else {
        // Fallback: Download files and open email client
        await shareViaDownload(certsToSend);
      }
    } catch (error) {
      console.error('Error sharing certificates:', error);
      // Fallback to original mailto approach
      shareViaEmail(selectedCerts);
    }
    
    // Reset state
    clearSelection();
    setNavMode('collapsed');
  };

  const shareViaWebAPI = async (certificates: Certificate[]) => {
    const files: File[] = [];
    
    for (const cert of certificates) {
      try {
        const fileUrl = cert.fileUrl || cert.pdfUrl;
        if (!fileUrl) continue;
        
        // Fetch the file as blob
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        
        // Create File object
        const fileName = `${cert.name}.${cert.fileType === 'pdf' ? 'pdf' : 'jpg'}`;
        const file = new File([blob], fileName, { type: blob.type });
        files.push(file);
      } catch (error) {
        console.error(`Failed to fetch file for ${cert.name}:`, error);
      }
    }

    if (files.length === 0) {
      throw new Error('No files could be prepared for sharing');
    }

    const shareData = {
      title: 'Professional Certificates',
      text: `Sharing ${files.length} professional certificate${files.length > 1 ? 's' : ''}`,
      files: files
    };

    // Check if the data can be shared
    if (navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      throw new Error('Files cannot be shared via Web Share API');
    }
  };

  const shareViaDownload = async (certificates: Certificate[]) => {
    // If only one certificate, download it directly
    if (certificates.length === 1) {
      const cert = certificates[0];
      const fileUrl = cert.fileUrl || cert.pdfUrl;
      if (fileUrl) {
        const fileName = `${cert.name}.${cert.fileType === 'pdf' ? 'pdf' : 'jpg'}`;
        downloadFile(fileUrl, fileName);
      }
    } else {
      // Multiple certificates: create a ZIP file (simplified approach)
      alert(`Downloading ${certificates.length} certificates individually. Please attach them to your email manually.`);
      
      for (const cert of certificates) {
        const fileUrl = cert.fileUrl || cert.pdfUrl;
        if (fileUrl) {
          const fileName = `${cert.name}.${cert.fileType === 'pdf' ? 'pdf' : 'jpg'}`;
          // Small delay between downloads to avoid browser blocking
          setTimeout(() => downloadFile(fileUrl, fileName), 100);
        }
      }
    }
    
    // Open email client after downloads
    setTimeout(() => {
      const subject = 'Professional Certificates';
      const body = `Please find my ${certificates.length} professional certificate${certificates.length > 1 ? 's' : ''} attached.\n\nCertificates included:\n${certificates.map(c => `- ${c.name}`).join('\n')}\n\nBest regards,\n[Your Name]`;
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, '_self');
    }, 500);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareViaEmail = (selectedCerts: string[]) => {
    // Original fallback method
    const subject = 'Professional Certificates';
    const body = `Please find my professional certificates attached.\n\nSelected: ${selectedCerts.length} certificate${selectedCerts.length > 1 ? 's' : ''}\nNote: Files need to be attached manually due to browser limitations.\n\nBest regards,\n[Your Name]`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_self');
  };

  const renderPanelContent = () => {
    switch (navMode) {
      case 'send.step1':
        return (
          <SendPanel
            step="step1"
            onStepChange={(newStep) => {
              if (newStep === 'step2') {
                setNavMode('send.step2');
              }
            }}
            onSend={handleSend}
            currentCertId={certificate?.id}
          />
        );
      case 'send.step2':
        return (
          <SendPanel
            step="step2"
            onStepChange={(newStep) => {
              if (newStep === 'step1') {
                setNavMode('send.step1');
              }
            }}
            onSend={handleSend}
            currentCertId={certificate?.id}
          />
        );
      case 'settings.doc':
        return <SettingsPanel mode="doc" />;
      default:
        return null;
    }
  };

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--white-pure)' }}>Certificate not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col"
         style={{ 
           touchAction: 'manipulation',
           overflowX: 'hidden'
         }}>
      {/* Compact Header */}
      <header className="flex-shrink-0 px-4 py-3 border-b"
              style={{ 
                backgroundColor: 'var(--grey-900)',
                borderColor: 'var(--grey-700)'
              }}>
        <div className="flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="text-sm px-3 py-1 rounded-md"
            style={{ 
              color: 'var(--grey-300)',
              backgroundColor: 'var(--grey-800)'
            }}
          >
            ← Back
          </button>
          <h1 className="text-sm font-medium truncate mx-4"
              style={{ color: 'var(--white-pure)' }}>
            {certificate.name}
          </h1>
          <div className="w-16"></div> {/* Spacer for balance */}
        </div>
      </header>

      {/* PDF Viewer - Auto-centered */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden"
           style={{ backgroundColor: 'var(--grey-900)' }}>
        <div className="w-full h-full max-w-4xl">
          <UniversalFileViewer 
            fileUrl={fileUrl || ''} 
            fileName={certificate.name}
            className="w-full h-full rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Floating NavBar */}
      <div className="relative z-40">
        <FloatingNavBar onModeChange={setNavMode}>
          {renderPanelContent()}
        </FloatingNavBar>
      </div>
    </div>
  );
}