import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({
  message = 'An unexpected error occurred. Please try again.',
  onRetry
}) {
  return (
    <div style={{
      backgroundColor: 'var(--danger-bg)',
      border: '1px solid var(--danger-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      margin: '1.5rem 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertCircle size={22} color="var(--danger)" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9375rem' }}>
            Request Failed
          </div>
          <div style={{ fontSize: '0.875rem', color: '#991B1B' }}>
            {message}
          </div>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-secondary btn-sm"
          style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--danger-border)' }}
        >
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
