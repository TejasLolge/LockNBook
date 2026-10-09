import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { listMyBookings, cancelBooking } from '../api/bookings';
import { useAuth } from '../context/AuthContext';
import BookingStatusBadge from '../components/BookingStatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function MyBookings() {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listMyBookings();
      setBookings(res.bookings || []);
    } catch (err) {
      setError(err.message || 'Unable to retrieve your bookings from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (bookingId, bookingRef) => {
    if (!confirm(`Cancel booking ${bookingRef}? Your reserved tickets will be immediately released back to the event inventory.`)) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
      // Refetch from backend to verify updated state
      await loadBookings();
    } catch (err) {
      alert(`Cancellation failed: ${err.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3.5rem' }}>
        <LoadingState message="Fetching your verified bookings &amp; passes..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '860px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
          My Bookings &amp; Digital Passes
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Access your confirmed admission vouchers, print gate tickets, or manage active reservations.
        </p>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadBookings} />}

      {!loading && !error && bookings.length === 0 && (
        <EmptyState
          icon={Ticket}
          title="No Bookings Found"
          description="You haven't reserved any event tickets yet. Explore upcoming concerts, festivals, and tech conferences to book your spot!"
          actionLabel="Discover Live Events &rarr;"
          actionLink="/events"
        />
      )}

      {!loading && !error && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isCancellingThis = cancellingId === (b.bookingId || b.bookingRef);

            return (
              <div key={b.bookingId || b.bookingRef} className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-white)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                        {b.bookingRef}
                      </span>
                      <BookingStatusBadge status={b.status} />
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                      {b.eventTitle}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Calendar size={14} color="var(--primary)" />
                        <span>{b.date} &bull; {b.time}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <MapPin size={14} color="var(--primary)" />
                        <span>{b.venue}</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Confirmed Total
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      ${b.totalAmount?.toFixed(2) || (b.unitPrice * b.quantity).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {b.quantity} Ticket(s)
                    </div>
                  </div>
                </div>

                <div style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Attendee: <strong>{b.customerName}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Link
                      to={`/confirmation/${b.bookingId || b.bookingRef}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <span>Digital Pass &rarr;</span>
                    </Link>

                    {isConfirmed && (
                      <button
                        onClick={() => handleCancel(b.bookingId || b.bookingRef, b.bookingRef)}
                        disabled={isCancellingThis}
                        className="btn btn-danger btn-sm"
                      >
                        {isCancellingThis ? (
                          <>
                            <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            <span>Releasing...</span>
                          </>
                        ) : (
                          <span>Release Tickets</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
