import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading events...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1.5rem',
      gap: '0.75rem',
      color: 'var(--text-secondary)'
    }}>
      <Loader2 size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
