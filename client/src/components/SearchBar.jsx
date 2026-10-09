import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search events, artists, or venues...' }) {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && value) {
      onChange('');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
      <Search
        size={18}
        color="var(--text-muted)"
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none'
        }}
      />
      <input
        ref={inputRef}
        type="text"
        className="form-input"
        style={{
          paddingLeft: '2.75rem',
          paddingRight: value ? '2.5rem' : '1rem',
          backgroundColor: '#FFFFFF',
          fontSize: '0.9rem'
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Search events"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.25rem',
            borderRadius: '50%'
          }}
          title="Clear search [Esc]"
          aria-label="Clear search input"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
