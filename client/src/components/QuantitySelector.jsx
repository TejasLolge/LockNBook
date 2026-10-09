import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ quantity, onChange, min = 1, max = 4, disabled = false }) {
  const handleDecrement = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--bg-white)',
      overflow: 'hidden'
    }}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || quantity <= min}
        style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: disabled || quantity <= min ? 'not-allowed' : 'pointer',
          color: quantity <= min ? 'var(--text-muted)' : 'var(--text-main)',
          transition: 'background-color 0.15s ease'
        }}
        aria-label="Decrease tickets"
      >
        <Minus size={16} />
      </button>

      <span style={{
        minWidth: '40px',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '1rem',
        color: 'var(--text-main)'
      }}>
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || quantity >= max}
        style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: disabled || quantity >= max ? 'not-allowed' : 'pointer',
          color: quantity >= max ? 'var(--text-muted)' : 'var(--text-main)',
          transition: 'background-color 0.15s ease'
        }}
        aria-label="Increase tickets"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
