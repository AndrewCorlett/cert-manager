'use client';

import { useState, useEffect } from 'react';
import PDFViewer from './PDFViewer';
import Image from 'next/image';

interface UniversalFileViewerProps {
  fileUrl: string;
  className?: string;
  fileName?: string;
}

export default function UniversalFileViewer({ fileUrl, className = '', fileName = '' }: UniversalFileViewerProps) {
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'unknown'>('unknown');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const determineFileType = () => {
      const url = fileUrl.toLowerCase();
      const name = fileName.toLowerCase();
      
      if (url.endsWith('.pdf') || name.endsWith('.pdf')) {
        setFileType('pdf');
      } else if (
        url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/) ||
        name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)
      ) {
        setFileType('image');
      } else {
        setFileType('unknown');
        setError('Unsupported file type');
      }
      setLoading(false);
    };

    determineFileType();
  }, [fileUrl, fileName]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--white-pure)] mx-auto mb-4"></div>
          <p style={{ color: 'var(--white-pure)' }}>Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || fileType === 'unknown') {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <p style={{ color: 'var(--error-red)' }} className="mb-2">
            {error || 'Unable to display this file type'}
          </p>
          <p style={{ color: 'var(--grey-500)' }} className="text-sm">
            File: {fileName || fileUrl}
          </p>
        </div>
      </div>
    );
  }

  if (fileType === 'pdf') {
    return <PDFViewer pdfUrl={fileUrl} className={className} />;
  }

  if (fileType === 'image') {
    return (
      <div className={`flex items-center justify-center h-full overflow-auto ${className}`}>
        <div className="relative w-full h-full">
          <Image
            src={fileUrl}
            alt={fileName || 'Certificate'}
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
      </div>
    );
  }

  return null;
}