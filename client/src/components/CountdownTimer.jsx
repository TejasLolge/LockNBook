import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function CountdownTimer({ expiresAt, onExpire }) {
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (!expiresAt) return 0;
    const expiry = new Date(expiresAt).getTime();
    return Math.max(0, Math.floor((expiry - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isExpired = secondsRemaining <= 0;
  const isWarning = secondsRemaining > 0 && secondsRemaining <= 60;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.625rem',
      padding: '0.55rem 1.15rem',
      borderRadius: 'var(--radius-full)',
      backgroundColor: isExpired ? 'var(--danger-bg)' : isWarning ? 'var(--warning-bg)' : 'var(--primary-light)',
      border: `1px solid ${isExpired ? 'var(--danger-border)' : isWarning ? 'var(--warning-border)' : 'var(--primary-border)'}`,
      color: isExpired ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--primary)',
      fontWeight: 700,
      fontSize: '0.875rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {isExpired ? (
        <>
          <AlertTriangle size={16} />
          <span>Hold Window Expired &bull; Seats Released</span>
        </>
      ) : isWarning ? (
        <>
          <Clock size={16} className="pulse-timer" />
          <span>Hurry! Hold expires in <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{formatted}</strong></span>
        </>
      ) : (
        <>
          <Clock size={16} className="pulse-timer" />
          <span>Seats held for you: <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{formatted}</strong></span>
        </>
      )}
    </div>
  );
}
