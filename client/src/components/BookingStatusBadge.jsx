import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function BookingStatusBadge({ status }) {
  const norm = (status || '').toUpperCase();

  if (norm === 'CONFIRMED') {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={13} />
        <span>Confirmed</span>
      </span>
    );
  }

  if (norm === 'HELD') {
    return (
      <span className="badge badge-warning">
        <Clock size={13} />
        <span>Hold Active</span>
      </span>
    );
  }

  if (norm === 'CANCELLED') {
    return (
      <span className="badge badge-danger">
        <XCircle size={13} />
        <span>Cancelled</span>
      </span>
    );
  }

  return (
    <span className="badge badge-neutral">
      <AlertCircle size={13} />
      <span>{status || 'Unknown'}</span>
    </span>
  );
}
