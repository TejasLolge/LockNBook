import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, ShieldCheck, AlertTriangle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useHold } from '../context/HoldContext';
import { useAuth } from '../context/AuthContext';
import { confirmBooking } from '../api/bookings';
import { releaseHold } from '../api/holds';
import CountdownTimer from '../components/CountdownTimer';
import OrderSummary from '../components/OrderSummary';

export default function Checkout() {
  const { activeHold, clearHold } = useHold();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.name || 'Alex Morgan');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'alex@locknbook.dev');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 234-5678');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isExpired, setIsExpired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Generate an idempotency key once per checkout mount to guarantee concurrency safety
  const [idempotencyKey] = useState(() => 'idemp_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now());

  // Check initial expiration on mount
  useEffect(() => {
    if (activeHold) {
      const expiry = new Date(activeHold.expiresAt).getTime();
      if (expiry <= Date.now()) {
        setIsExpired(true);
      }
    }
  }, [activeHold]);

  // If no hold is present in context
  if (!activeHold) {
    return (
      <div className="container" style={{ paddingTop: '3.5rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 2rem' }}>
          <AlertTriangle size={36} color="var(--warning)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            No Active Reservation Hold
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            To protect available inventory from overbooking, checkouts require an active server-backed ticket hold.
          </p>
          <Link to="/events" className="btn btn-primary">
            Browse Live Events &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const handleExpire = () => {
    setIsExpired(true);
  };

  const handleCancelHold = async () => {
    if (confirm('Cancel your held reservation? Your seats will be immediately returned to the available inventory pool.')) {
      try {
        await releaseHold(activeHold.holdId);
      } catch (e) {
        // Continue cleanup
      }
      clearHold();
      navigate('/events');
    }
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (isExpired) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await confirmBooking({
        holdId: activeHold.holdId,
        customerInfo: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        paymentMethod,
        idempotencyKey
      });

      // Clear hold from local session state
      clearHold();

      // Navigate to verified confirmation route
      navigate(`/confirmation/${res.booking.bookingId || res.booking.bookingRef}`);
    } catch (err) {
      setError(err.message || 'Payment confirmation failed. Your hold may have expired.');
      if (err.status === 410) {
        setIsExpired(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Top Navigation & Countdown Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={handleCancelHold}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.375rem' }}
        >
          <ArrowLeft size={14} />
          <span>Cancel & Release Hold</span>
        </button>

        <CountdownTimer
          expiresAt={activeHold.expiresAt}
          onExpire={handleExpire}
        />
      </div>

      {/* Expired Warning Banner */}
      {isExpired && (
        <div style={{
          backgroundColor: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1rem' }}>
                Reservation Window Elapsed
              </div>
              <div style={{ fontSize: '0.875rem', color: '#991B1B' }}>
                Your server hold expired to prevent inventory hoarding. Your tickets have been safely returned to the pool.
              </div>
            </div>
          </div>
          <Link to={`/events/${activeHold.eventId}`} className="btn btn-danger btn-sm">
            Re-select Tickets
          </Link>
        </div>
      )}

      {/* Main Layout Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Checkout & Simulated Payment Form */}
        <div>
          <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-white)', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Attendee & Payment Details
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Simulated payment confirmation backed by server inventory locking.
            </p>

            {error && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleConfirmPayment}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (for Digital Passes)</label>
                <input
                  type="email"
                  className="form-input"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Phone (SMS pass delivery)</label>
                <input
                  type="tel"
                  className="form-input"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>

              {/* Payment Methods */}
              <div style={{ marginTop: '1.75rem', marginBottom: '1.25rem' }}>
                <label className="form-label">Select Payment Method (Simulated)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                    { id: 'upi', label: 'Instant Pay', icon: ShieldCheck },
                    { id: 'wallet', label: 'Apple / Google', icon: CheckCircle2 }
                  ].map(m => {
                    const isSelected = paymentMethod === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--primary)' : 'var(--border-light)',
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-white)',
                          color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.375rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Icon size={18} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Simulated Card Inputs */}
              {paymentMethod === 'card' && (
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  marginBottom: '1.5rem'
                }}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Simulated Card Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value="4532 •••• •••• 8920"
                      readOnly
                      style={{ backgroundColor: 'var(--bg-white)', color: 'var(--text-muted)' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8125rem' }}>Expiry</label>
                      <input
                        type="text"
                        className="form-input"
                        value="12/28"
                        readOnly
                        style={{ backgroundColor: 'var(--bg-white)', color: 'var(--text-muted)' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8125rem' }}>CVC</label>
                      <input
                        type="text"
                        className="form-input"
                        value="•••"
                        readOnly
                        style={{ backgroundColor: 'var(--bg-white)', color: 'var(--text-muted)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Concurrency Idempotency Notice */}
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}>
                <ShieldCheck size={14} color="var(--primary)" />
                <span>Idempotency Protected: <code>{idempotencyKey.slice(0, 16)}...</code></span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isExpired || submitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', gap: '0.5rem' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Verifying with Backend Engine...</span>
                  </>
                ) : (
                  <span>Confirm Simulated Payment &rarr;</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary & Hold Details */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <OrderSummary
            eventTitle={activeHold.eventTitle}
            quantity={activeHold.quantity}
            unitPrice={activeHold.unitPrice}
          />

          <div style={{
            marginTop: '1.25rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Hold Reference: {activeHold.holdId}
            </div>
            <div>Venue: {activeHold.venue}</div>
            <div>Event Date: {activeHold.date} &bull; {activeHold.time}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
