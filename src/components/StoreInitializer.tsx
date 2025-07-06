'use client';

import { useEffect } from 'react';
import { useCertStore } from '@/lib/store';

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useCertStore((state) => state.initialize);
  const isInitialized = useCertStore((state) => state.isInitialized);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-white">Initializing secure storage...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}