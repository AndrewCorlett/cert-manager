'use client';

export interface TextExtractionResult {
  text: string;
  pageCount: number;
  quality: 'excellent' | 'good' | 'poor' | 'unreadable';
  isScanned: boolean;
  extractionTime: number;
}

/**
 * Extract text content from PDF file for AI analysis
 */
export async function extractTextFromPDF(pdfUrl: string): Promise<TextExtractionResult> {
  const startTime = Date.now();
  
  if (typeof window === 'undefined') {
    return {
      text: '',
      pageCount: 0,
      quality: 'unreadable',
      isScanned: true,
      extractionTime: 0
    };
  }
  
  try {
    // Dynamic import for client-side only
    const { getDocument } = await import('pdfjs-dist');
    const pdfjs = await import('pdfjs-dist');
    
    // Configure worker
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    
    // Load PDF document
    const pdf = await getDocument(pdfUrl).promise;
    let fullText = '';
    let totalTextLength = 0;
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items with proper spacing
      const pageText = textContent.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => {
          if (item.str) {
            return item.str;
          }
          return '';
        })
        .filter(str => str.trim().length > 0)
        .join(' ');
      
      if (pageText.trim()) {
        fullText += pageText + '\n\n';
        totalTextLength += pageText.length;
      }
    }

    // Assess text quality
    const averageTextPerPage = totalTextLength / pdf.numPages;
    const hasMinimalText = averageTextPerPage < 50;
    const hasGoodText = averageTextPerPage > 200;
    
    let quality: 'excellent' | 'good' | 'poor' | 'unreadable';
    let isScanned = false;

    if (totalTextLength === 0) {
      quality = 'unreadable';
      isScanned = true;
    } else if (hasMinimalText) {
      quality = 'poor';
      isScanned = true;
    } else if (hasGoodText) {
      quality = 'excellent';
    } else {
      quality = 'good';
    }

    // Detect if document might be scanned based on text patterns
    const hasWeirdSpacing = /\s{3,}/.test(fullText);
    const hasFragmentedWords = /\b\w\s\w\s\w/.test(fullText);
    if (hasWeirdSpacing || hasFragmentedWords) {
      isScanned = true;
      if (quality === 'excellent') {
        quality = 'good';
      }
    }

    const extractionTime = Date.now() - startTime;

    return {
      text: fullText.trim(),
      pageCount: pdf.numPages,
      quality,
      isScanned,
      extractionTime
    };

  } catch (error) {
    console.error('PDF text extraction failed:', error);
    
    return {
      text: '',
      pageCount: 0,
      quality: 'unreadable',
      isScanned: true,
      extractionTime: Date.now() - startTime
    };
  }
}

/**
 * Assess document quality and provide recommendations
 */
export async function assessDocumentQuality(pdfUrl: string): Promise<{
  textQuality: 'excellent' | 'good' | 'poor' | 'unreadable';
  isScanned: boolean;
  recommendsOCR: boolean;
  issues: string[];
  suggestions: string[];
}> {
  if (typeof window === 'undefined') {
    // Return default during SSR
    return {
      textQuality: 'good',
      isScanned: false,
      recommendsOCR: false,
      issues: [],
      suggestions: [],
    };
  }
  
  const extraction = await extractTextFromPDF(pdfUrl);
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Analyze extraction results
  if (extraction.quality === 'unreadable') {
    issues.push('No text could be extracted from this PDF');
    suggestions.push('This appears to be a scanned image. Try rescanning at higher resolution');
    suggestions.push('Ensure the document is clear and well-lit when scanning');
  } else if (extraction.quality === 'poor') {
    issues.push('Limited text extracted - document may be low quality scan');
    suggestions.push('Try rescanning the document at 300 DPI or higher');
    suggestions.push('Ensure the document is flat and well-lit when scanning');
  } else if (extraction.isScanned) {
    issues.push('Document appears to be scanned - text may have spacing issues');
    suggestions.push('For better accuracy, use the original digital document if available');
  }

  if (extraction.extractionTime > 5000) {
    issues.push('Document took a long time to process');
    suggestions.push('Consider using a smaller file size or fewer pages');
  }

  if (extraction.pageCount > 5) {
    issues.push('Multi-page document detected');
    suggestions.push('For certificates, typically only the first page contains relevant information');
  }

  const recommendsOCR = extraction.quality === 'unreadable' || 
                       (extraction.quality === 'poor' && extraction.isScanned);

  return {
    textQuality: extraction.quality,
    isScanned: extraction.isScanned,
    recommendsOCR,
    issues,
    suggestions
  };
}

/**
 * Clean and normalize extracted text for AI processing
 */
export function cleanExtractedText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove common PDF artifacts
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    // Normalize line breaks
    .replace(/\n\s*\n/g, '\n')
    // Trim whitespace
    .trim();
}

/**
 * Extract specific information patterns from text
 */
export function extractCommonPatterns(text: string): {
  dates: string[];
  numbers: string[];
  emails: string[];
  organizations: string[];
} {
  const dates = text.match(/\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/g) || [];
  const numbers = text.match(/\b[A-Z0-9]{6,}\b/g) || [];
  const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
  
  // Common certification organizations
  const orgPatterns = [
    /STCW/gi, /MCA/gi, /Maritime[\s\w]*Authority/gi,
    /GWO/gi, /Global Wind/gi,
    /OPITO/gi, /BOSIET/gi, /HUET/gi,
    /Red Cross/gi, /St\.?\s*John/gi,
    /Lloyd'?s Register/gi, /DNV/gi, /ABS/gi
  ];
  
  const organizations = orgPatterns
    .map(pattern => text.match(pattern))
    .filter(match => match !== null)
    .flat()
    .map(match => match![0]);

  return {
    dates: [...new Set(dates)],
    numbers: [...new Set(numbers)],
    emails: [...new Set(emails)],
    organizations: [...new Set(organizations)]
  };
}