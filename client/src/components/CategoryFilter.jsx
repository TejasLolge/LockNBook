import React from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All Events' },
  { id: 'music', label: 'Music & Concerts' },
  { id: 'conference', label: 'Conferences & Tech' },
  { id: 'sports', label: 'Sports & Racing' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'theatre', label: 'Theatre & Arts' }
];

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      overflowX: 'auto',
      paddingBottom: '0.5rem',
      scrollbarWidth: 'none'
    }}>
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-full)',
              border: '1px solid',
              borderColor: isActive ? 'var(--primary)' : 'var(--border-light)',
              backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-white)',
              color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
