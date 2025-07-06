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
    setCertificate(cert);
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
    <div className="min-h-screen relative">
      {/* File Viewer - Full Screen */}
      <div className="absolute inset-0">
        <UniversalFileViewer 
          fileUrl={certificate.fileUrl || certificate.pdfUrl} 
          fileName={certificate.name}
          className="w-full h-full"
        />
      </div>

      {/* Certificate Name Badge */}
      <div 
        className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full z-30"
        style={{ 
          backgroundColor: 'var(--grey-900)',
          color: 'var(--white-pure)'
        }}
      >
        {certificate.name}
      </div>

      {/* Floating NavBar with Settings Active */}
      <div className="relative z-40">
        <FloatingNavBar onModeChange={setNavMode}>
          {renderPanelContent()}
        </FloatingNavBar>
      </div>
    </div>
  );
}