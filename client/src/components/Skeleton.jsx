import React from 'react';

export default function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)' }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#E2E8F0',
        animation: 'skeletonPulse 1.5s ease-in-out infinite'
      }}
    >
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
