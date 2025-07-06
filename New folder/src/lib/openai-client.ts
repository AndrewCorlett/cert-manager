'use client';

import OpenAI from 'openai';

// Initialize OpenAI client for browser usage
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Required for client-side usage
});

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
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set NEXT_PUBLIC_OPENAI_API_KEY environment variable.');
  }

  const prompt = `
Analyze the following certificate text and extract key information.
Return ONLY a JSON object with these exact fields:

{
  "certificateName": "extracted name or null",
  "issueDate": "YYYY-MM-DD or null",
  "expiryDate": "YYYY-MM-DD or null", 
  "issuingAuthority": "authority name or null",
  "certificateNumber": "number/serial or null",
  "category": "STCW|GWO|OPITO|Contracts|Other",
  "confidence": 0.95
}

Category Guidelines:
- STCW: Seafarer training (Basic Fire Fighting, Medical First Aid, Personnel Survival Techniques, Security)
- GWO: Global Wind Organisation training (Basic Safety Training, etc.)
- OPITO: Offshore petroleum industry training
- Contracts: Employment contracts, agreements, work authorizations
- Other: Everything else

Certificate text:
${extractedText}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional certificate analysis assistant. Extract information accurately and return only valid JSON."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI API');
    }

    // Parse JSON response
    const analysis: CertificateAnalysis = JSON.parse(response);
    
    // Validate response structure
    if (!analysis.category || !['STCW', 'GWO', 'OPITO', 'Contracts', 'Other'].includes(analysis.category)) {
      analysis.category = 'Other';
    }
    
    if (typeof analysis.confidence !== 'number' || analysis.confidence < 0 || analysis.confidence > 1) {
      analysis.confidence = 0.5;
    }

    return analysis;
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
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    // Return basic template if API not available
    return `Dear Recipient,

Please find my professional certificates attached.

Best regards,
[Your Name]`;
  }

  const certificateList = certificates
    .map(cert => `- ${cert.name} (${cert.category}, expires: ${cert.expiryDate})`)
    .join('\n');

  const contextPrompts = {
    job_application: "This is for a job application. Emphasize qualifications and readiness.",
    renewal_reminder: "This is a renewal reminder. Focus on upcoming expiry dates and renewal needs.",
    general: "This is a general certificate sharing email. Keep it professional but neutral."
  };

  const prompt = `
Generate a professional email template for sending these certificates:

${certificateList}

Context: ${contextPrompts[context]}

Requirements:
- Professional greeting
- Brief explanation of attached certificates
- Mention relevant details (expiry dates if within 6 months)
- Professional closing
- Keep it concise (under 200 words)
- Use placeholders like [Your Name] for personalization

Return only the email text, no additional formatting.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional email writing assistant. Create clear, concise, and professional emails."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    return completion.choices[0]?.message?.content || 'Failed to generate email template.';
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
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
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

  const prompt = `
Based on the certificate name "${certificateName}" and content excerpt, classify this into exactly one category:

- STCW: Seafarer training (Basic Fire Fighting, Medical First Aid, Personnel Survival Techniques, Security Awareness)
- GWO: Global Wind Organisation training (Basic Safety Training, etc.)
- OPITO: Offshore petroleum industry training
- Contracts: Employment contracts, agreements, work authorizations
- Other: Everything else

Content excerpt: ${extractedText.substring(0, 500)}

Respond with only the category name and confidence (0-1):
Format: {"category": "CATEGORY", "confidence": 0.95}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 100
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      const parsed = JSON.parse(response);
      return {
        category: parsed.category || 'Other',
        confidence: parsed.confidence || 0.5
      };
    }
  } catch (error) {
    console.error('Categorization failed:', error);
  }

  // Fallback to simple categorization
  return { category: 'Other', confidence: 0.3 };
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

// Export the OpenAI client for direct usage if needed
export { openai };