'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File) => void;
}

export default function FileUploadModal({ isOpen, onClose, onFileUpload }: FileUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      setError('Please select a PDF or image file');
      return;
    }
    
    setError(null);
    setIsProcessing(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      onFileUpload(file);
      setIsProcessing(false);
      onClose();
    }, 1000);
  };

  const handleFileExplorerClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 backdrop-blur-md"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="w-full max-w-md rounded-lg p-6 border"
              style={{ 
                backgroundColor: 'var(--grey-700)',
                borderColor: 'var(--grey-500)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--white-pure)' }}
                >
                  Add Certificate
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-600 transition-colors"
                >
                  <X size={20} color="var(--white-pure)" />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  className="flex items-center gap-2 p-3 rounded-lg mb-4 border"
                  style={{ 
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderColor: 'var(--error-red)'
                  }}
                >
                  <AlertCircle size={16} color="var(--error-red)" />
                  <span style={{ color: 'var(--error-red)', fontSize: '14px' }}>{error}</span>
                </div>
              )}

              {/* Processing State */}
              {isProcessing && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-accent mx-auto mb-4"></div>
                  <p style={{ color: 'var(--white-pure)' }}>Processing document with AI...</p>
                </div>
              )}

              {/* Upload Options */}
              {!isProcessing && (
                <div className="space-y-4">
                  {/* Drag & Drop Area */}
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                    style={{
                      borderColor: isDragging ? 'var(--gold-accent)' : 'var(--grey-500)',
                      backgroundColor: isDragging ? 'rgba(200, 155, 60, 0.1)' : 'transparent'
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <FileText size={32} color="var(--grey-500)" className="mx-auto mb-2" />
                    <p style={{ color: 'var(--white-pure)', marginBottom: '8px' }}>
                      Drag and drop your certificate here
                    </p>
                    <p style={{ color: 'var(--grey-500)', fontSize: '14px' }}>
                      PDF or image files only
                    </p>
                  </div>

                  {/* Option Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleFileExplorerClick}
                      variant="ghost"
                      className="h-auto py-4 flex flex-col items-center gap-2 border transition-all"
                      style={{ 
                        backgroundColor: 'transparent',
                        borderColor: 'var(--grey-500)'
                      }}
                    >
                      <Upload size={24} color="var(--white-pure)" />
                      <span style={{ color: 'var(--white-pure)' }}>File Explorer</span>
                    </Button>

                    <Button
                      onClick={handleCameraClick}
                      variant="ghost"
                      className="h-auto py-4 flex flex-col items-center gap-2 border transition-all"
                      style={{ 
                        backgroundColor: 'transparent',
                        borderColor: 'var(--grey-500)'
                      }}
                    >
                      <Camera size={24} color="var(--white-pure)" />
                      <span style={{ color: 'var(--white-pure)' }}>Camera</span>
                    </Button>
                  </div>

                  {/* Info Text */}
                  <p 
                    className="text-sm text-center mt-4"
                    style={{ color: '#9CA3AF' }}
                  >
                    Your document will be processed with AI to extract certificate information.
                  </p>
                </div>
              )}

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}