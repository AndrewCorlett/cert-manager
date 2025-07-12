'use client';

import { useState } from 'react';
import FileTree from '@/components/FileTree';
import FloatingNavBar, { NavMode } from '@/components/FloatingNavBar';
import SendPanel from '@/components/SendPanel';
import SettingsPanel from '@/components/SettingsPanel';
import { useCertStore, Certificate } from '@/lib/store';

export default function Home() {
  const [navMode, setNavMode] = useState<NavMode>('collapsed');
  const certificates = useCertStore((state) => state.certificates);
  const clearSelection = useCertStore((state) => state.clearSelection);

  const handleFileSelect = (certId: string) => {
    window.location.href = `/cert/${certId}`;
  };

  const handleLongPress = (certId: string) => {
    console.log('Long pressed certificate:', certId);
    setNavMode('settings.doc');
  };

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
      case 'list':
        return <FileTree onFileSelect={handleFileSelect} />;
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
          />
        );
      case 'settings.home':
        return <SettingsPanel mode="home" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col"
           style={{ 
             touchAction: 'manipulation',
             overflowX: 'hidden',
             backgroundColor: 'var(--grey-900)'
           }}>
        {/* Fancy Header - Fixed */}
        <header className="relative overflow-hidden fixed top-0 left-0 right-0 z-40">
          {/* Background with gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, var(--grey-700) 0%, var(--grey-900) 50%, var(--grey-700) 100%)',
            }}
          />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <div 
              className="w-full h-full rounded-full"
              style={{ backgroundColor: 'var(--gold-accent)' }}
            />
          </div>
          <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5">
            <div 
              className="w-full h-full rounded-full"
              style={{ backgroundColor: 'var(--gold-accent)' }}
            />
          </div>
          
          {/* Content */}
          <div className="relative z-10 p-6 pb-8">
            <div className="max-w-sm mx-auto">
              {/* Top section */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'var(--gold-accent)' }}
                  >
                    <span 
                      className="text-lg font-bold"
                      style={{ color: 'var(--grey-700)' }}
                    >
                      C
                    </span>
                  </div>
                  <div>
                    <h1 
                      className="text-2xl font-bold leading-tight"
                      style={{ color: 'var(--white-pure)' }}
                    >
                      Cert Manager
                    </h1>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--grey-500)' }}
                    >
                      Professional Certificates
                    </p>
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--success-green)' }}
                    />
                    <span 
                      className="text-xs"
                      style={{ color: 'var(--white-pure)' }}
                    >
                      Active
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Stats bar */}
              <div 
                className="rounded-lg p-3 backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="text-center">
                    <div 
                      className="font-semibold"
                      style={{ color: 'var(--white-pure)' }}
                    >
                      {certificates.length}
                    </div>
                    <div style={{ color: 'var(--grey-500)' }}>Total</div>
                  </div>
                  <div className="text-center">
                    <div 
                      className="font-semibold"
                      style={{ color: 'var(--success-green)' }}
                    >
                      {certificates.filter(c => c.status === 'valid').length}
                    </div>
                    <div style={{ color: 'var(--grey-500)' }}>Valid</div>
                  </div>
                  <div className="text-center">
                    <div 
                      className="font-semibold"
                      style={{ color: 'var(--warn-amber)' }}
                    >
                      {certificates.filter(c => c.status === 'upcoming').length}
                    </div>
                    <div style={{ color: 'var(--grey-500)' }}>Expiring</div>
                  </div>
                  <div className="text-center">
                    <div 
                      className="font-semibold"
                      style={{ color: 'var(--error-red)' }}
                    >
                      {certificates.filter(c => c.status === 'expired').length}
                    </div>
                    <div style={{ color: 'var(--grey-500)' }}>Expired</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-6 overflow-y-auto pb-24"
             style={{ 
               touchAction: 'pan-y',
               overscrollBehavior: 'contain',
               paddingTop: 'calc(10px + 2rem)' /* Reduced top padding */
             }}>
          <div className="max-w-sm mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 
                className="text-2xl font-semibold"
                style={{ color: 'var(--white-pure)' }}
              >
                HOME
              </h2>
            </div>
          
            <FileTree 
              onFileSelect={handleFileSelect}
              onLongPress={handleLongPress}
            />
          </div>
        </div>

        <FloatingNavBar onModeChange={setNavMode}>
          {renderPanelContent()}
        </FloatingNavBar>
      </div>
  );
}
