'use client';

import { useState } from 'react';
import FileTree from '@/components/FileTree';
import FloatingNavBar, { NavMode } from '@/components/FloatingNavBar';
import SendPanel from '@/components/SendPanel';
import SettingsPanel from '@/components/SettingsPanel';
import { useCertStore } from '@/lib/store';

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
      case 'list':
        return <FileTree />;
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
    <div className="h-screen overflow-hidden pb-32">
      {/* Fancy Header */}
      <header className="relative overflow-hidden">
        {/* Background with gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1E1E1E 0%, #2D2D2D 50%, #1E1E1E 100%)',
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
                    style={{ color: '#1E1E1E' }}
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

      <div className="px-6 h-full overflow-y-auto">
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
