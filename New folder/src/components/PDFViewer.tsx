'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set worker path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  pdfUrl: string;
  className?: string;
}

export default function PDFViewer({ pdfUrl, className = '' }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    setError('Failed to load PDF');
    setLoading(false);
    console.error('PDF load error:', error);
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p style={{ color: 'var(--white-pure)' }}>Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <p style={{ color: 'var(--error-red)' }} className="mb-2">
            {error}
          </p>
          <p style={{ color: 'var(--grey-500)' }} className="text-sm">
            URL: {pdfUrl}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer ${className}`}>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        className="flex flex-col items-center"
      >
        <Page
          pageNumber={pageNumber}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="pdf-page"
          scale={1.0}
          width={Math.min(window?.innerWidth || 375, 375)}
        />
      </Document>

      {numPages && numPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-50"
          >
            Previous
          </button>
          
          <span style={{ color: 'var(--white-pure)' }}>
            Page {pageNumber} of {numPages}
          </span>
          
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}