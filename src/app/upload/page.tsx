'use client';

import { useState } from 'react';
import { Camera, Upload, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FloatingNavBar, { NavMode } from '@/components/FloatingNavBar';
import { useCertStore } from '@/lib/store';
import { extractTextFromPDF, assessDocumentQuality } from '@/lib/pdf-text-extractor';
import { analyzeDocument } from '@/lib/openai-client';

export default function UploadPage() {
  const [navMode, setNavMode] = useState<NavMode>('collapsed');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<{
    certificateName?: string | null;
    category?: string;
    confidence?: number;
    extraction?: { text: string; pageCount: number; quality: string; isScanned: boolean; extractionTime: number };
    fileName?: string;
    issueDate?: string | null;
    expiryDate?: string | null;
    certificateNumber?: string | null;
    issuingAuthority?: string | null;
  } | null>(null);
  const [qualityAssessment, setQualityAssessment] = useState<{
    textQuality: string;
    issues: string[];
  } | null>(null);
  const addCertificate = useCertStore((state) => state.addCertificate);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Start AI analysis
      await performAIAnalysis(url, file.name);
    }
  };

  const performAIAnalysis = async (pdfUrl: string, fileName: string) => {
    setIsAnalyzing(true);
    try {
      // Step 1: Extract text from PDF
      const extraction = await extractTextFromPDF(pdfUrl);
      
      // Step 2: Assess document quality
      const quality = await assessDocumentQuality(pdfUrl);
      setQualityAssessment(quality);
      
      if (extraction.text.length > 0) {
        // Step 3: Analyze with AI (if text available)
        const analysis = await analyzeDocument(extraction.text);
        setAiResults({
          ...analysis,
          extraction,
          fileName: fileName.replace('.pdf', '')
        });
      } else {
        // No text available - suggest improvements
        setAiResults({
          certificateName: fileName.replace('.pdf', ''),
          category: 'Other',
          confidence: 0.0,
          extraction,
          fileName: fileName.replace('.pdf', '')
        });
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback to basic upload
      setAiResults({
        certificateName: fileName.replace('.pdf', ''),
        category: 'Other',
        confidence: 0.0,
        fileName: fileName.replace('.pdf', '')
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptAIResults = () => {
    if (!selectedFile || !previewUrl || !aiResults) return;
    
    const now = new Date();
    const defaultExpiry = new Date(now.getTime() + 5 * 365 * 24 * 60 * 60 * 1000); // 5 years default
    
    addCertificate({
      name: aiResults.certificateName || aiResults.fileName || 'Untitled Certificate',
      category: (aiResults.category as 'STCW' | 'GWO' | 'OPITO' | 'Contracts' | 'Other') || 'Other',
      filePath: `/certificates/${selectedFile.name}`,
      issueDate: aiResults.issueDate || now.toISOString().split('T')[0],
      expiryDate: aiResults.expiryDate || defaultExpiry.toISOString().split('T')[0],
      serialNumber: aiResults.certificateNumber || `CERT-${Date.now()}`,
      status: 'valid',
      pdfUrl: previewUrl,
    });
    
    // Navigate to home
    window.location.href = '/';
  };

  const handleManualUpload = () => {
    if (!selectedFile || !previewUrl) return;
    
    // TODO BACKEND:UPLOAD_FILE
    // Add certificate with basic info
    addCertificate({
      name: selectedFile.name.replace('.pdf', ''),
      category: 'Other',
      filePath: `/certificates/${selectedFile.name}`,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      serialNumber: `CERT-${Date.now()}`,
      status: 'valid',
      pdfUrl: previewUrl,
    });
    
    window.location.href = '/';
  };

  const handleCameraScan = () => {
    // TODO BACKEND:CAMERA_SCAN
    alert('Camera scanning will be implemented in Phase 2');
  };

  return (
    <div className="min-h-screen p-6 pb-32">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 
            className="text-2xl font-semibold"
            style={{ color: 'var(--white-pure)' }}
          >
            Upload Certificate
          </h1>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={handleCameraScan}
            className="w-full py-8 flex-col gap-3"
            style={{
              backgroundColor: 'var(--grey-700)',
              color: 'var(--white-pure)',
              border: `2px solid var(--grey-500)`,
            }}
          >
            <Camera size={32} />
            <div>
              <div className="font-semibold">Scan Document</div>
              <div className="text-sm opacity-75">Use camera to scan certificate</div>
            </div>
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="file-upload"
            />
            <Button
              asChild
              className="w-full py-8 flex-col gap-3"
              style={{
                backgroundColor: 'var(--grey-700)',
                color: 'var(--white-pure)',
                border: `2px solid var(--grey-500)`,
              }}
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={32} />
                <div>
                  <div className="font-semibold">Upload PDF</div>
                  <div className="text-sm opacity-75">Select PDF file from device</div>
                </div>
              </label>
            </Button>
          </div>
        </div>

        {selectedFile && (
          <div 
            className="p-4 rounded-lg space-y-4"
            style={{ backgroundColor: 'var(--grey-700)' }}
          >
            {/* File Info */}
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="font-medium"
                  style={{ color: 'var(--white-pure)' }}
                >
                  {selectedFile.name}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--grey-500)' }}
                >
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {isAnalyzing && (
                <div className="flex items-center gap-2">
                  <Brain 
                    className="animate-pulse" 
                    size={20} 
                    color="var(--gold-accent)" 
                  />
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--gold-accent)' }}
                  >
                    Analyzing...
                  </span>
                </div>
              )}
            </div>

            {/* Quality Assessment */}
            {qualityAssessment && (
              <div 
                className="p-3 rounded border"
                style={{ 
                  backgroundColor: 'var(--grey-900)',
                  borderColor: qualityAssessment.textQuality === 'excellent' ? 'var(--success-green)' : 
                              qualityAssessment.textQuality === 'good' ? 'var(--warn-amber)' : 'var(--error-red)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {qualityAssessment.textQuality === 'excellent' ? (
                    <CheckCircle size={16} color="var(--success-green)" />
                  ) : (
                    <AlertCircle size={16} color="var(--warn-amber)" />
                  )}
                  <span 
                    className="text-sm font-medium"
                    style={{ color: 'var(--white-pure)' }}
                  >
                    Document Quality: {qualityAssessment.textQuality}
                  </span>
                </div>
                
                {qualityAssessment.issues.length > 0 && (
                  <div className="space-y-1">
                    {qualityAssessment.issues.map((issue: string, index: number) => (
                      <p 
                        key={index}
                        className="text-xs"
                        style={{ color: 'var(--grey-500)' }}
                      >
                        • {issue}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI Analysis Results */}
            {aiResults && !isAnalyzing && (
              <div 
                className="p-3 rounded border space-y-3"
                style={{ 
                  backgroundColor: 'var(--grey-900)',
                  borderColor: 'var(--gold-accent)'
                }}
              >
                <div className="flex items-center gap-2">
                  <Brain size={16} color="var(--gold-accent)" />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: 'var(--white-pure)' }}
                  >
                    AI Analysis Results
                  </span>
                  {(aiResults.confidence ?? 0) > 0 && (
                    <span 
                      className="text-xs px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: 'var(--gold-accent)',
                        color: 'var(--grey-900)'
                      }}
                    >
                      {Math.round((aiResults.confidence ?? 0) * 100)}% confident
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span style={{ color: 'var(--grey-500)' }}>Name: </span>
                    <span style={{ color: 'var(--white-pure)' }}>
                      {aiResults.certificateName || 'Not detected'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--grey-500)' }}>Category: </span>
                    <span style={{ color: 'var(--white-pure)' }}>
                      {aiResults.category}
                    </span>
                  </div>
                  {aiResults.expiryDate && (
                    <div>
                      <span style={{ color: 'var(--grey-500)' }}>Expiry: </span>
                      <span style={{ color: 'var(--white-pure)' }}>
                        {aiResults.expiryDate}
                      </span>
                    </div>
                  )}
                  {aiResults.certificateNumber && (
                    <div>
                      <span style={{ color: 'var(--grey-500)' }}>Number: </span>
                      <span style={{ color: 'var(--white-pure)' }}>
                        {aiResults.certificateNumber}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAcceptAIResults}
                    className="flex-1"
                    style={{
                      backgroundColor: 'var(--gold-accent)',
                      color: 'var(--white-pure)'
                    }}
                  >
                    Accept AI Analysis
                  </Button>
                  <Button
                    onClick={handleManualUpload}
                    className="flex-1"
                    style={{
                      backgroundColor: 'var(--grey-500)',
                      color: 'var(--white-pure)'
                    }}
                  >
                    Manual Entry
                  </Button>
                </div>
              </div>
            )}

            {/* Fallback if no AI results yet */}
            {!aiResults && !isAnalyzing && (
              <Button
                onClick={handleManualUpload}
                className="w-full"
                style={{
                  backgroundColor: 'var(--gold-accent)',
                  color: 'var(--white-pure)'
                }}
              >
                Upload Manually
              </Button>
            )}
          </div>
        )}
      </div>

      <FloatingNavBar onModeChange={setNavMode} mode={navMode}>
        {/* No expanded content needed for upload page */}
      </FloatingNavBar>
    </div>
  );
}