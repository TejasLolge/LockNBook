import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  MapPin,
  AlertCircle,
  Loader2,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { listMyBookings, cancelBooking } from '../api/bookings';
import { useAuth } from '../context/AuthContext';
import { useHold } from '../context/HoldContext';
import { releaseHold } from '../api/holds';
import BookingStatusBadge from '../components/BookingStatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function MyBookings() {
  const { isAuthenticated } = useAuth();
  const { activeHold, clearHold } = useHold();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [releasingHold, setReleasingHold] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const initialTab = searchParams.get('tab')?.toUpperCase();
  const [activeTab, setActiveTab] = useState(
    ['ALL', 'CONFIRMED', 'RELEASED'].includes(initialTab) ? initialTab : 'ALL'
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'ALL') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tab.toLowerCase() });
    }
  };

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

  const confirmedBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'CONFIRMED');
  }, [bookings]);

  const releasedBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'CANCELLED' || b.status === 'RELEASED');
  }, [bookings]);

  const visibleBookings = useMemo(() => {
    if (activeTab === 'CONFIRMED') return confirmedBookings;
    if (activeTab === 'RELEASED') return releasedBookings;
    return bookings;
  }, [bookings, activeTab, confirmedBookings, releasedBookings]);

  const handleCancel = async (bookingId, bookingRef) => {
    if (!confirm(`Release tickets for booking ${bookingRef}? Your reserved berths/seats will be immediately returned to the live inventory pool.`)) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
      setActionNotice(`✅ Booking ${bookingRef} released successfully. Reserved seats have been returned to inventory.`);
      await loadBookings();
    } catch (err) {
      alert(`Ticket release failed: ${err.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  const handleReleaseActiveHold = async () => {
    if (!activeHold) return;
    if (!confirm('Release your active reservation hold? Locked seats will be freed immediately.')) {
      return;
    }

    try {
      setReleasingHold(true);
      await releaseHold(activeHold.holdId);
      clearHold();
      setActionNotice('✅ Active reservation hold released. Berths returned to public pool.');
    } catch (err) {
      clearHold();
    } finally {
      setReleasingHold(false);
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
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
          My Bookings &amp; Digital Passes
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Manage your confirmed admission vouchers, print gate tickets, or release seats back to the inventory pool.
        </p>
      </div>

      {/* Action Banner / Notification */}
      {actionNotice && (
        <div style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius-md)',
          color: '#065f46',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{actionNotice}</span>
          <button
            onClick={() => setActionNotice(null)}
            style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Reservation Hold Banner (if any hold is in progress) */}
      {activeHold && (
        <div style={{
          padding: '1.25rem',
          backgroundColor: '#eff6ff',
          border: '1.5px solid #bfdbfe',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Clock size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1e3a8a' }}>
                Active Concurrency Hold in Progress
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#1e40af', marginTop: '0.2rem' }}>
                Event: <strong>{activeHold.eventTitle}</strong> &bull; {activeHold.quantity} berth(s) locked exclusively for your session.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <button
              onClick={handleReleaseActiveHold}
              disabled={releasingHold}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.35rem', borderColor: '#bfdbfe', color: '#1e40af' }}
            >
              <RotateCcw size={13} />
              <span>{releasingHold ? 'Releasing...' : 'Release Hold'}</span>
            </button>

            <Link
              to="/checkout"
              className="btn btn-primary btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <span>Complete Checkout &rarr;</span>
            </Link>
          </div>
        </div>
      )}

      {/* Bookings & Release Ticket Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '2px solid var(--border-light)',
        marginBottom: '1.75rem',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => handleTabChange('ALL')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.125rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9375rem',
            fontWeight: activeTab === 'ALL' ? 700 : 500,
            color: activeTab === 'ALL' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'ALL' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Ticket size={16} />
          <span>All Bookings</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: activeTab === 'ALL' ? 'var(--primary-light)' : 'var(--bg-light)',
            color: activeTab === 'ALL' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700
          }}>
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('CONFIRMED')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.125rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9375rem',
            fontWeight: activeTab === 'CONFIRMED' ? 700 : 500,
            color: activeTab === 'CONFIRMED' ? '#059669' : 'var(--text-secondary)',
            borderBottom: activeTab === 'CONFIRMED' ? '2.5px solid #059669' : '2.5px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <CheckCircle2 size={16} color={activeTab === 'CONFIRMED' ? '#059669' : 'var(--text-secondary)'} />
          <span>Active Passes</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            fontWeight: 700
          }}>
            {confirmedBookings.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('RELEASED')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.125rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9375rem',
            fontWeight: activeTab === 'RELEASED' ? 700 : 500,
            color: activeTab === 'RELEASED' ? '#dc2626' : 'var(--text-secondary)',
            borderBottom: activeTab === 'RELEASED' ? '2.5px solid #dc2626' : '2.5px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <RotateCcw size={16} color={activeTab === 'RELEASED' ? '#dc2626' : 'var(--text-secondary)'} />
          <span>Released / Cancelled</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            fontWeight: 700
          }}>
            {releasedBookings.length}
          </span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadBookings} />}

      {/* Tab Empty States */}
      {!loading && !error && visibleBookings.length === 0 && (
        <EmptyState
          icon={activeTab === 'RELEASED' ? Ban : Ticket}
          title={
            activeTab === 'CONFIRMED'
              ? 'No Active Passes'
              : activeTab === 'RELEASED'
                ? 'No Released Tickets'
                : 'No Bookings Found'
          }
          description={
            activeTab === 'CONFIRMED'
              ? 'You do not have any active confirmed passes right now. All previous bookings have concluded or been released.'
              : activeTab === 'RELEASED'
                ? 'You have not cancelled or released any tickets yet. Confirmed passes can be released anytime using the Release Ticket button.'
                : 'You have not reserved any tickets yet. Explore upcoming bullet trains, concerts, and live sports to book your spot!'
          }
          actionLabel="Discover Live Experiences &rarr;"
          actionLink="/events"
        />
      )}

      {/* Bookings Card List */}
      {!loading && !error && visibleBookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {visibleBookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isReleased = b.status === 'CANCELLED' || b.status === 'RELEASED';
            const isCancellingThis = cancellingId === (b.bookingId || b.bookingRef);

            return (
              <div
                key={b.bookingId || b.bookingRef}
                className="card"
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--bg-white)',
                  borderLeft: isConfirmed ? '4px solid #059669' : '4px solid #94a3b8'
                }}
              >
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
                      Total Amount
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      ${b.totalAmount?.toFixed(2) || (b.unitPrice * b.quantity).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {b.quantity} Ticket(s)
                    </div>
                  </div>
                </div>

                {/* Assigned Berths / Seats Details */}
                {b.selectedSeats && b.selectedSeats.length > 0 && (
                  <div style={{
                    padding: '0.625rem 0.875rem',
                    backgroundColor: isReleased ? '#f8fafc' : 'var(--bg-muted)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {isReleased ? 'Released Berths / Seats:' : 'Confirmed Berths / Seats:'}
                    </span>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: isReleased ? '#64748b' : 'var(--primary)',
                      textDecoration: isReleased ? 'line-through' : 'none'
                    }}>
                      {b.selectedSeats.map(s => typeof s === 'object' && s?.display_label ? s.display_label : String(s)).join(', ')}
                    </span>
                  </div>
                )}

                {/* Footer Actions */}
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
                    {isReleased && b.releasedAt && (
                      <span style={{ marginLeft: '0.5rem', color: '#dc2626', fontWeight: 600 }}>
                        &bull; Released on {new Date(b.releasedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Link
                      to={`/confirmation/${b.bookingId || b.bookingRef}`}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.35rem' }}
                    >
                      <span>{isReleased ? 'View Release Voucher' : 'Digital Pass'}</span>
                      <ArrowRight size={13} />
                    </Link>

                    {/* Interactive Release Ticket Action */}
                    {isConfirmed && (
                      <button
                        onClick={() => handleCancel(b.bookingId || b.bookingRef, b.bookingRef)}
                        disabled={isCancellingThis}
                        className="btn btn-danger btn-sm"
                        style={{ gap: '0.35rem' }}
                        title="Release these tickets and return your seats to the live inventory pool"
                      >
                        {isCancellingThis ? (
                          <>
                            <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            <span>Releasing Seats...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw size={13} />
                            <span>Release Tickets</span>
                          </>
                        )}
                      </button>
                    )}

                    {isReleased && b.eventId && (
                      <Link
                        to={`/events/${b.eventId}`}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '0.35rem', borderColor: 'var(--primary-border)', color: 'var(--primary)' }}
                      >
                        <span>Re-book Experience</span>
                      </Link>
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

