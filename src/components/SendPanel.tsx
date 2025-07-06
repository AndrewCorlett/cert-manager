'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import FileTree from './FileTree';
import { useCertStore } from '@/lib/store';

interface SendPanelProps {
  step: 'step1' | 'step2';
  onStepChange: (step: 'step1' | 'step2') => void;
  onSend: (selectedCerts: string[]) => void;
  currentCertId?: string;
}

export default function SendPanel({ step, onStepChange, onSend, currentCertId }: SendPanelProps) {
  const [selectedOption, setSelectedOption] = useState<'this-doc' | 'multiple' | null>(null);
  const selectedCertificates = useCertStore((state) => state.selectedCertificates);
  const clearSelection = useCertStore((state) => state.clearSelection);
  const currentViewingCert = useCertStore((state) => state.currentViewingCert);
  
  const handleThisDocumentOnly = () => {
    setSelectedOption('this-doc');
    // Small delay to show selection feedback before proceeding
    setTimeout(() => {
      const certId = currentCertId || currentViewingCert?.id;
      if (certId) {
        onSend([certId]);
      }
      setSelectedOption(null);
    }, 200);
  };

  const handleSelectMultiple = () => {
    setSelectedOption('multiple');
    clearSelection();
    onStepChange('step2');
    // Reset selection after transition
    setTimeout(() => setSelectedOption(null), 300);
  };

  const handleSendSelected = () => {
    if (selectedCertificates.length > 0) {
      onSend(selectedCertificates);
    }
  };

  const slideVariants = {
    step1: {
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
    step2: {
      x: '-100%',
      transition: {
        duration: 0.3,
      },
    },
  };

  const step2Variants = {
    step1: {
      x: '100%',
      transition: {
        duration: 0.3,
      },
    },
    step2: {
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '200px' }}>
      {/* Step 1 */}
      <motion.div
        variants={slideVariants}
        animate={step}
        className="absolute inset-0 space-y-4"
      >
        <div className="space-y-3">
          <Button
            onClick={handleThisDocumentOnly}
            variant="ghost"
            className="w-full py-4 text-left justify-start border-0 outline-none shadow-none transition-all duration-200"
            style={{
              backgroundColor: selectedOption === 'this-doc' ? '#C89B3C' : 'var(--grey-700)',
              color: '#FFFFFF',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              transform: selectedOption === 'this-doc' ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <span style={{ color: '#FFFFFF', fontWeight: selectedOption === 'this-doc' ? '600' : '400' }}>
              This Document Only
            </span>
          </Button>
          
          <Button
            onClick={handleSelectMultiple}
            variant="ghost"
            className="w-full py-4 text-left justify-start border-0 outline-none shadow-none transition-all duration-200"
            style={{
              backgroundColor: selectedOption === 'multiple' ? '#C89B3C' : 'var(--grey-700)',
              color: '#FFFFFF',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              transform: selectedOption === 'multiple' ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <span style={{ color: '#FFFFFF', fontWeight: selectedOption === 'multiple' ? '600' : '400' }}>
              Select Multiple
            </span>
          </Button>
        </div>
      </motion.div>

      {/* Step 2 */}
      <motion.div
        variants={step2Variants}
        animate={step}
        className="absolute inset-0"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 
              className="text-lg font-semibold"
              style={{ color: 'var(--white-pure)' }}
            >
              Select Multiple
            </h3>
            {selectedCertificates.length > 0 && (
              <Button
                onClick={handleSendSelected}
                variant="ghost"
                className="px-4 py-2"
                style={{
                  backgroundColor: 'var(--gold-accent)',
                  color: '#1E1E1E',
                  fontWeight: '600',
                }}
              >
                Send ({selectedCertificates.length})
              </Button>
            )}
          </div>
          
          <FileTree 
            showSelection={true}
            onFileSelect={() => {}} // Handled by selection clicks
          />
        </div>
      </motion.div>
    </div>
  );
}