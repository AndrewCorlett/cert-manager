'use client';

// Canvas polyfill for PDF.js in Next.js environments
export class NodeCanvasFactory {
  create(width: number, height: number) {
    if (typeof window !== 'undefined' && window.document) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      return {
        canvas,
        context: canvas.getContext('2d'),
      };
    }
    
    // Fallback for SSR
    return {
      canvas: null,
      context: null,
    };
  }

  reset(canvasAndContext: any, width: number, height: number) {
    if (canvasAndContext.canvas) {
      canvasAndContext.canvas.width = width;
      canvasAndContext.canvas.height = height;
    }
  }

  destroy(canvasAndContext: any) {
    if (canvasAndContext.canvas) {
      canvasAndContext.canvas.width = 0;
      canvasAndContext.canvas.height = 0;
    }
  }
}