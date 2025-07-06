'use client';

import { useCertStore } from '@/lib/store';

export default function StatWidget() {
  const getStatistics = useCertStore((state) => state.getStatistics);
  const stats = getStatistics();

  return (
    <div 
      className="rounded-lg p-6 flex items-center justify-between shadow-lg"
      style={{ 
        backgroundColor: '#1E1E1E', // Consistent dark background for contrast
        border: '1px solid #3B3B3B' // Subtle border for definition
      }}
    >
      <div className="flex flex-col items-center">
        <div 
          className="text-3xl font-semibold"
          style={{ color: 'var(--error-red)' }}
        >
          {stats.expired}
        </div>
        <div 
          className="text-sm"
          style={{ color: 'var(--white-pure)' }}
        >
          Expired
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <div 
          className="text-5xl font-semibold"
          style={{ color: 'var(--white-pure)' }}
        >
          {stats.valid}
        </div>
        <div 
          className="text-sm"
          style={{ color: 'var(--white-pure)' }}
        >
          Valid
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <div 
          className="text-3xl font-semibold"
          style={{ color: 'var(--warn-amber)' }}
        >
          {stats.upcoming}
        </div>
        <div 
          className="text-sm"
          style={{ color: 'var(--white-pure)' }}
        >
          Upcoming
        </div>
      </div>
    </div>
  );
}