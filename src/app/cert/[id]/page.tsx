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
  
  const certificates = useCertStore((state) => state.certificates);
  const setCurrentViewingCert = useCertStore((state) => state.setCurrentViewingCert);
  const clearSelection = useCertStore((state) => state.clearSelection);

  useEffect(() => {
    const certId = params.id as string;
    const cert = certificates.find(c => c.id === certId);
    setCertificate(cert || null);
    setCurrentViewingCert(cert || null);
  }, [params.id, certificates, setCurrentViewingCert]);

  const handleSend = (selectedCerts: string[]) => {
    // TODO BACKEND:SEND_CERTIFICATES
    console.log('Sending certificates:', selectedCerts);
    
    // Create mailto link
    const subject = 'Professional Certificates';
    const body = 'Please find my professional certificates attached.\n\nBest regards,\n[Your Name]';
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(mailtoLink, '_self');
    
    // Reset state
    clearSelection();
    setNavMode('collapsed');
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
            fileUrl={certificate.fileUrl || certificate.pdfUrl || ''} 
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