import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.015em' }}>
          Pricing Summary
        </h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Check size={14} />
          <span>Price Locked</span>
        </span>
      </div>

      {eventTitle && (
        <div style={{
          paddingBottom: '0.75rem',
          marginBottom: '0.75rem',
          borderBottom: '1px solid var(--border-light)',
          fontWeight: 600,
          fontSize: '0.9rem',
          color: 'var(--text-main)'
        }}>
          {eventTitle}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>Admission Passes ({quantity} &times; ${unitPrice})</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${subtotal.toFixed(2)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>Gate Processing &amp; Verification Fee</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${serviceFees.toFixed(2)}</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingTop: '0.85rem',
          marginTop: '0.25rem',
          borderTop: '1px solid var(--border-light)',
          fontSize: '1.15rem',
          fontWeight: 800,
          color: 'var(--text-main)'
        }}>
          <span>Grand Total ({currency})</span>
          <span style={{ color: 'var(--primary)', fontSize: '1.35rem', letterSpacing: '-0.02em' }}>${total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{
        marginTop: '1.25rem',
        padding: '0.75rem 0.85rem',
        backgroundColor: 'var(--bg-muted)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span><strong>Fair Booking Guarantee:</strong> Inventory is locked exclusively for your session.</span>
      </div>
    </div>
  );
}
