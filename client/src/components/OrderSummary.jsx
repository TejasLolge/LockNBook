import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function OrderSummary({
  eventTitle,
  quantity,
  unitPrice,
  feePerTicket = 3.50,
  currency = 'USD'
}) {
  const subtotal = (unitPrice || 0) * (quantity || 1);
  const serviceFees = feePerTicket * (quantity || 1);
  const total = subtotal + serviceFees;

  return (
    <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-white)' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
        Order Summary
      </h3>

      {eventTitle && (
        <div style={{
          paddingBottom: '0.75rem',
          marginBottom: '0.75rem',
          borderBottom: '1px solid var(--border-light)',
          fontWeight: 600,
          fontSize: '0.9375rem',
          color: 'var(--text-main)'
        }}>
          {eventTitle}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>Tickets ({quantity} &times; ${unitPrice})</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${subtotal.toFixed(2)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>Service & Processing Fee</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${serviceFees.toFixed(2)}</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          marginTop: '0.25rem',
          borderTop: '1px solid var(--border-light)',
          fontSize: '1.125rem',
          fontWeight: 800,
          color: 'var(--text-main)'
        }}>
          <span>Total ({currency})</span>
          <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{
        marginTop: '1.25rem',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-muted)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span>Tickets held atomically with backend reservation guarantee.</span>
      </div>
    </div>
  );
}
