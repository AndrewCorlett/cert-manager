'use client';

export interface CertificateAnalysis {
  certificateName: string | null;
  issueDate: string | null; // YYYY-MM-DD format
  expiryDate: string | null; // YYYY-MM-DD format
  issuingAuthority: string | null;
  certificateNumber: string | null;
  category: 'STCW' | 'GWO' | 'OPITO' | 'Contracts' | 'Other';
  confidence: number; // 0-1 scale
}

export interface DocumentQualityAssessment {
  textQuality: 'excellent' | 'good' | 'poor' | 'unreadable';
  isScanned: boolean;
  recommendsOCR: boolean;
  issues: string[];
  suggestions: string[];
}

/**
 * Analyze certificate text and extract key metadata using GPT-4
 */
export async function analyzeDocument(extractedText: string): Promise<CertificateAnalysis> {
  try {
    const response = await fetch('/api/analyze-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ extractedText }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze document');
    }

    return await response.json();
  } catch (error) {
    console.error('Document analysis failed:', error);
    
    // Return fallback analysis with low confidence
    return {
      certificateName: null,
      issueDate: null,
      expiryDate: null,
      issuingAuthority: null,
      certificateNumber: null,
      category: 'Other',
      confidence: 0.0
    };
  }
}

/**
 * Generate contextual email template for certificate sharing
 */
export async function generateEmailTemplate(
  certificates: Array<{ name: string; expiryDate: string; category: string }>,
  context: 'job_application' | 'renewal_reminder' | 'general' = 'general'
): Promise<string> {
  try {
    const response = await fetch('/api/generate-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ certificates, context }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate email template');
    }

    const data = await response.json();
    return data.template;
  } catch (error) {
    console.error('Email template generation failed:', error);
    
    // Return fallback template
    return `Dear Recipient,

I hope this email finds you well. Please find my professional certificates attached for your review.

The attached documents include:
${certificates.map(cert => `• ${cert.name}`).join('\n')}

Please let me know if you need any additional information or documentation.

Best regards,
[Your Name]`;
  }
}

/**
 * Categorize certificate based on name and content
 */
export async function categorizeCertificate(
  certificateName: string,
  extractedText: string = ''
): Promise<{ category: 'STCW' | 'GWO' | 'OPITO' | 'Contracts' | 'Other'; confidence: number }> {
  // Simple keyword-based fallback categorization
  const name = certificateName.toLowerCase();
  const text = extractedText.toLowerCase();
  
  if (name.includes('stcw') || text.includes('stcw') || 
      name.includes('fire fighting') || name.includes('medical first aid') ||
      name.includes('survival techniques') || name.includes('security')) {
    return { category: 'STCW', confidence: 0.7 };
  }
  
  if (name.includes('gwo') || text.includes('gwo') || 
      name.includes('global wind') || name.includes('basic safety training')) {
    return { category: 'GWO', confidence: 0.7 };
  }
  
  if (name.includes('opito') || text.includes('opito') || 
      name.includes('offshore') || name.includes('petroleum')) {
    return { category: 'OPITO', confidence: 0.7 };
  }
  
  if (name.includes('contract') || name.includes('employment') || 
      name.includes('agreement') || text.includes('contract')) {
    return { category: 'Contracts', confidence: 0.6 };
  }
  
  return { category: 'Other', confidence: 0.5 };
}

/**
 * Validate certificate logic and flag potential issues
 */
export async function validateCertificateLogic(certificate: {
  name: string;
  issueDate: string;
  expiryDate: string;
  category: string;
}): Promise<{
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
}> {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Basic date validation
  const issueDate = new Date(certificate.issueDate);
  const expiryDate = new Date(certificate.expiryDate);
  const now = new Date();

  if (issueDate >= expiryDate) {
    warnings.push('Issue date is after expiry date');
    suggestions.push('Check that dates are entered correctly');
  }

  // Check if certificate is expired
  if (expiryDate < now) {
    warnings.push('Certificate has expired');
    suggestions.push('Consider renewing this certificate');
  }

  // Check validity period expectations
  const validityYears = (expiryDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  const expectedValidity: Record<string, number> = {
    'STCW': 5,
    'GWO': 2,
    'OPITO': 4,
    'Contracts': 1,
    'Other': 3
  };

  const expected = expectedValidity[certificate.category] || 3;
  if (Math.abs(validityYears - expected) > 1) {
    warnings.push(`Unusual validity period: ${validityYears.toFixed(1)} years (expected ~${expected} years for ${certificate.category})`);
  }

  // Check for approaching expiry (within 60 days)
  const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (daysUntilExpiry > 0 && daysUntilExpiry <= 60) {
    warnings.push(`Certificate expires in ${Math.round(daysUntilExpiry)} days`);
    suggestions.push('Plan for certificate renewal');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
}