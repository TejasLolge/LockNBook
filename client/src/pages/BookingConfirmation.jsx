import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Ticket, Calendar, MapPin, ArrowRight, Printer, AlertCircle } from 'lucide-react';
import { getBookingById } from '../api/bookings';
import BookingStatusBadge from '../components/BookingStatusBadge';
import LoadingState from '../components/LoadingState';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        setError(null);
        const res = await getBookingById(bookingId);
        setBooking(res.booking);
      } catch (err) {
        setError(err.message || 'Unable to retrieve booking verification from backend.');
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '4rem' }}>
        <LoadingState message="Verifying booking with reservation engine..." />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '520px', margin: '0 auto', padding: '2.5rem' }}>
          <AlertCircle size={40} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Unverified Booking Reference
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {error || 'This booking could not be verified by the authoritative backend.'}
          </p>
          <Link to="/events" className="btn btn-primary">
            Explore Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '640px' }}>
        {/* Success Card Header */}
        <div className="card" style={{ padding: '2.25rem', backgroundColor: 'var(--bg-white)', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            border: '2px solid var(--success-border)'
          }}>
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>

          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            You&apos;re Confirmed &amp; Going!
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            Your seats were atomically locked into the reservation engine. Your digital pass and admission credentials are ready below.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 1.25rem',
            backgroundColor: 'var(--bg-muted)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)'
          }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Order Reference:
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              {booking.bookingRef}
            </span>
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>

        {/* Digital Admission Pass Voucher */}
        <div className="card" style={{
          backgroundColor: 'var(--bg-white)',
          marginBottom: '2rem',
          overflow: 'hidden',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-card)'
        }}>
          {/* Ticket Header Banner */}
          <div style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85, fontWeight: 700 }}>
                Verified Admission Pass
              </span>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, margin: '0.25rem 0 0', color: '#FFFFFF' }}>
                {booking.eventTitle}
              </h2>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '0.375rem 0.875rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 700
            }}>
              {booking.quantity} {booking.quantity === 1 ? 'Pass' : 'Passes'}
            </div>
          </div>

          {/* Ticket Main Details */}
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Event Date &amp; Time
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  <Calendar size={15} color="var(--primary)" />
                  <span>{booking.date} &bull; {booking.time}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Venue Location
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  <MapPin size={15} color="var(--primary)" />
                  <span>{booking.venue}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Primary Attendee
                </span>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {booking.customerName}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Amount Paid
                </span>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  ${booking.totalAmount?.toFixed(2) || (booking.unitPrice * booking.quantity).toFixed(2)}
                </div>
              </div>

              {booking.selectedSeats && booking.selectedSeats.length > 0 && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Confirmed Berths / Assigned Seats
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.35rem' }}>
                    {booking.selectedSeats.map((s, idx) => (
                      <div key={idx} style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                        &bull; {typeof s === 'object' && s?.display_label ? s.display_label : String(s)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Perforated Divider */}
            <div style={{
              margin: '1.5rem -2rem',
              borderTop: '2px dashed var(--border-light)',
              position: 'relative'
            }} />

            {/* QR / Barcode Verification Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              paddingTop: '0.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Gate Entry Verification Code
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                  Present this digital barcode or printout at the door.
                </div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  letterSpacing: '0.15em',
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem',
                  padding: '0.375rem 0.625rem',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-block'
                }}>
                  ||| | | |||| || | || |||| | {booking.bookingRef}
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.375rem' }}
              >
                <Printer size={15} />
                <span>Print Admission Pass</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/my-bookings" className="btn btn-secondary">
            <Ticket size={16} />
            <span>View All My Bookings</span>
          </Link>
          <Link to="/events" className="btn btn-primary">
            <span>Discover More Events</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
