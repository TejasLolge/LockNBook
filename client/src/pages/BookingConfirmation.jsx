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
    <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '4rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '640px' }}>
        {/* Success Card Header */}
        <div className="card" style={{ padding: '2.5rem', backgroundColor: 'var(--bg-white)', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            Booking Confirmed &amp; Guaranteed!
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            Your seats have been atomically committed in the reservation engine. A digital pass confirmation has been sent to your email.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Booking Reference:
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              {booking.bookingRef}
            </span>
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>

        {/* Confirmed Ticket Details Card */}
        <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-white)', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            Admission Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Experience
              </span>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                {booking.eventTitle}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Date &amp; Time
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                <Calendar size={15} color="var(--primary)" />
                <span>{booking.date} &bull; {booking.time}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Venue Location
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                <MapPin size={15} color="var(--primary)" />
                <span>{booking.venue}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Quantity &amp; Total Paid
              </span>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                {booking.quantity} Ticket(s) &bull; ${booking.totalAmount?.toFixed(2) || (booking.unitPrice * booking.quantity).toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Pass issued to <strong>{booking.customerName}</strong> ({booking.customerEmail})
            </div>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.375rem' }}
            >
              <Printer size={14} />
              <span>Print Pass</span>
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/my-bookings" className="btn btn-secondary">
            <Ticket size={16} />
            <span>View in My Bookings</span>
          </Link>
          <Link to="/events" className="btn btn-primary">
            <span>Explore More Events</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
