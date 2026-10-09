import React from 'react';
import { SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = SearchX,
  title = 'No results found',
  description = 'Try adjusting your search criteria or filters.',
  actionLabel,
  actionLink,
  onAction
}) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 1.5rem',
      backgroundColor: 'var(--bg-white)',
      border: '1px dashed var(--border-light)',
      borderRadius: 'var(--radius-lg)',
      margin: '2rem 0'
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-muted)',
        color: 'var(--text-muted)',
        marginBottom: '1rem'
      }}>
        <Icon size={28} />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
        {description}
      </p>

      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
