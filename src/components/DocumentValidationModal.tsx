'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Save, Calendar, FileText, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentData {
  name: string;
  category: string;
  issuedDate: string;
  expiryDate: string;
  certificateNumber: string;
  issuingOrganization: string;
  filePath?: string;
}

interface DocumentValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DocumentData) => void;
  aiData: Partial<DocumentData>;
  fileName: string;
  aiProcessingFailed?: boolean;
}

const requiredFields = ['name', 'category', 'issuedDate', 'expiryDate'];

export default function DocumentValidationModal({
  isOpen,
  onClose,
  onSave,
  aiData,
  fileName,
  aiProcessingFailed = false
}: DocumentValidationModalProps) {
  const [formData, setFormData] = useState<DocumentData>({
    name: '',
    category: '',
    issuedDate: '',
    expiryDate: '',
    certificateNumber: '',
    issuingOrganization: '',
    ...aiData
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill with AI data when modal opens
      setFormData({
        name: aiData.name || '',
        category: aiData.category || '',
        issuedDate: aiData.issuedDate || '',
        expiryDate: aiData.expiryDate || '',
        certificateNumber: aiData.certificateNumber || '',
        issuingOrganization: aiData.issuingOrganization || '',
        filePath: aiData.filePath || fileName
      });
      
      // Check for missing required fields
      const newErrors: Record<string, boolean> = {};
      requiredFields.forEach(field => {
        if (!aiData[field as keyof DocumentData]) {
          newErrors[field] = true;
        }
      });
      setErrors(newErrors);
    }
  }, [isOpen, aiData, fileName]);

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    requiredFields.forEach(field => {
      if (!formData[field as keyof DocumentData]?.trim()) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof DocumentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          style={{
            backgroundColor: 'var(--grey-700)',
            border: '1px solid var(--grey-500)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b"
               style={{ borderColor: 'var(--grey-500)' }}>
            <div className="flex items-center gap-3">
              <FileText size={24} color="var(--gold-accent)" />
              <h2 
                className="text-xl font-semibold"
                style={{ color: 'var(--white-pure)' }}
              >
                Verify Document Details
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-black/20 transition-colors"
            >
              <X size={20} color="var(--white-pure)" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Processing Notice */}
              <div 
                className="p-3 rounded-lg border"
                style={{ 
                  backgroundColor: aiProcessingFailed 
                    ? 'rgba(220, 38, 38, 0.1)' 
                    : 'rgba(200, 155, 60, 0.1)',
                  borderColor: aiProcessingFailed 
                    ? 'var(--error-red)' 
                    : 'var(--gold-accent)'
                }}
              >
                <p 
                  className="text-sm"
                  style={{ color: 'var(--white-pure)' }}
                >
                  {aiProcessingFailed ? (
                    <>
                      AI processing is unavailable. Please manually enter all document details. 
                      <span style={{ color: 'var(--error-red)' }}> All required fields must be completed.</span>
                    </>
                  ) : (
                    <>
                      Please review and correct the information extracted by AI. 
                      <span style={{ color: 'var(--error-red)' }}> Required fields are marked in red.</span>
                    </>
                  )}
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Document Name */}
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--white-pure)' }}
                  >
                    Document Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--grey-900)',
                      color: 'var(--white-pure)',
                      borderColor: errors.name ? 'var(--error-red)' : 'var(--grey-500)'
                    }}
                    placeholder="Enter document name"
                  />
                  {errors.name && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle size={14} color="var(--error-red)" />
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--error-red)' }}
                      >
                        Document name is required
                      </span>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--white-pure)' }}
                  >
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--grey-900)',
                      color: 'var(--white-pure)',
                      borderColor: errors.category ? 'var(--error-red)' : 'var(--grey-500)'
                    }}
                  >
                    <option value="">Select category</option>
                    <option value="STCW">STCW</option>
                    <option value="GWO">GWO</option>
                    <option value="OPITO">OPITO</option>
                    <option value="Contracts">Contracts</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.category && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle size={14} color="var(--error-red)" />
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--error-red)' }}
                      >
                        Category is required
                      </span>
                    </div>
                  )}
                </div>

                {/* Issued Date */}
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--white-pure)' }}
                  >
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    value={formData.issuedDate}
                    onChange={(e) => handleInputChange('issuedDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--grey-900)',
                      color: 'var(--white-pure)',
                      borderColor: errors.issuedDate ? 'var(--error-red)' : 'var(--grey-500)'
                    }}
                  />
                  {errors.issuedDate && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle size={14} color="var(--error-red)" />
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--error-red)' }}
                      >
                        Issue date is required
                      </span>
                    </div>
                  )}
                </div>

                {/* Expiry Date */}
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--white-pure)' }}
                  >
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--grey-900)',
                      color: 'var(--white-pure)',
                      borderColor: errors.expiryDate ? 'var(--error-red)' : 'var(--grey-500)'
                    }}
                  />
                  {errors.expiryDate && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle size={14} color="var(--error-red)" />
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--error-red)' }}
                      >
                        Expiry date is required
                      </span>
                    </div>
                  )}
                </div>

                {/* Certificate Number */}
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--white-pure)' }}
                  >
                    Certificate Number
                  </label>
                  <input
                    type="text"
                    value={formData.certificateNumber}
                    onChange={(e) => handleInputChange('certificateNumber', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--grey-900)',
                      color: 'var(--white-pure)',
                      borderColor: 'var(--grey-500)'
                    }}
                    placeholder="Enter certificate number"
                  />
                </div>

                {/* Issuing Organization */}
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--white-pure)' }}
                  >
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    value={formData.issuingOrganization}
                    onChange={(e) => handleInputChange('issuingOrganization', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--grey-900)',
                      color: 'var(--white-pure)',
                      borderColor: 'var(--grey-500)'
                    }}
                    placeholder="Enter issuing organization"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t flex-shrink-0"
               style={{ borderColor: 'var(--grey-500)' }}>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSaving}
              className="px-6"
              style={{
                borderColor: 'var(--grey-500)',
                color: 'var(--white-pure)'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || Object.values(errors).some(Boolean)}
              className="px-6 flex items-center gap-2"
              style={{
                backgroundColor: 'var(--gold-accent)',
                color: 'var(--grey-700)'
              }}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Document
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}