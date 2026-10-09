import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, ShieldCheck, ArrowLeft, Lock, AlertCircle, Loader2, Heart } from 'lucide-react';
import { fetchEventById } from '../api/events';
import { createHold } from '../api/holds';
import { formatSeatDisplay } from '../api/railwaySeatEngine';
import { useAuth } from '../context/AuthContext';
import { useHold } from '../context/HoldContext';
import { useWishlist } from '../context/WishlistContext';
import QuantitySelector from '../components/QuantitySelector';
import SeatSelector from '../components/SeatSelector';
import OrderSummary from '../components/OrderSummary';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setHold } = useHold();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState(['A3']);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState(null);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchEventById(id);
      setEvent(res.event);

      // Default first available seat
      const occupied = new Set(res.event?.occupiedSeats || []);
      const rows = res.event?.seatRows || ['A', 'B', 'C', 'D'];
      let firstAvailable = 'A1';
      for (const r of rows) {
        for (let num = 1; num <= (res.event?.seatsPerRow || 8); num++) {
          const sId = `${r}${num}`;
          if (!occupied.has(sId)) {
            firstAvailable = sId;
            break;
          }
        }
        if (firstAvailable !== 'A1') break;
      }
      setSelectedSeats([firstAvailable]);
      setQuantity(1);
    } catch (err) {
      setError(err.message || 'Unable to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleSeatsChange = (newSeats) => {
    if (newSeats.length === 0) {
      setSelectedSeats([]);
      setQuantity(1);
    } else {
      setSelectedSeats(newSeats);
      setQuantity(newSeats.length);
    }
  };

  const handleReserve = async () => {
    if (!event) return;

    // 1. Check authentication
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/events/${event.id}`)}`);
      return;
    }

    // 2. Submit hold request with selected seats to authoritative backend
    try {
      setReserving(true);
      setReserveError(null);

      const defaultSeats = (event.category === 'trains' || event.coachType === 'SL')
        ? Array.from({ length: quantity }, (_, i) => i + 1)
        : Array.from({ length: quantity }, (_, i) => `A${i + 1}`);

      const res = await createHold({
        eventId: event.id,
        quantity: selectedSeats.length > 0 ? selectedSeats.length : quantity,
        selectedSeats: selectedSeats.length > 0 ? selectedSeats : defaultSeats
      });

      // 3. Store valid hold in context & navigate to checkout
      setHold(res.hold);
      navigate('/checkout');
    } catch (err) {
      setReserveError(err.message || 'Hold request rejected by reservation engine.');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <LoadingState message="Fetching event information..." />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <Link to="/events" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', gap: '0.375rem' }}>
          <ArrowLeft size={14} />
          <span>Back to All Events</span>
        </Link>
        <ErrorMessage message={error || 'Event could not be found'} onRetry={loadEvent} />
      </div>
    );
  }

  const isAvailable = event.availableInventory === undefined || event.availableInventory > 0;
  const maxAllowed = event.availableInventory !== undefined ? Math.min(6, event.availableInventory) : 6;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Breadcrumb / Back button */}
      <Link to="/events" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', gap: '0.375rem' }}>
        <ArrowLeft size={14} />
        <span>Back to Events</span>
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Event Media & Information */}
        <div>
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-muted)',
            maxHeight: '360px',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <img
              src={event.image}
              alt={event.title}
              style={{ width: '100%', height: '360px', objectFit: 'cover' }}
            />
            {/* Wishlist Bookmark Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(event.id)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(6px)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'transform 0.15s ease'
              }}
              title={isWishlisted(event.id) ? "Saved in wishlist" : "Add to wishlist"}
              aria-label={isWishlisted(event.id) ? "Saved in wishlist" : "Add to wishlist"}
            >
              <Heart
                size={20}
                color={isWishlisted(event.id) ? '#EF4444' : '#64748B'}
                fill={isWishlisted(event.id) ? '#EF4444' : 'transparent'}
              />
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--primary)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            marginBottom: '0.5rem'
          }}>
            <Calendar size={18} />
            <span>{event.date} &bull; {event.time}</span>
          </div>

          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-main)',
            marginBottom: '0.5rem',
            lineHeight: 1.2
          }}>
            {event.title}
          </h1>

          {event.artist && (
            <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Featured Artist: <span style={{ color: 'var(--text-main)' }}>{event.artist}</span>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9375rem',
            marginBottom: '1.5rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-light)'
          }}>
            <MapPin size={18} style={{ flexShrink: 0 }} />
            <span>{event.venue}</span>
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            About This Experience
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {event.description}
          </p>

          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.875rem'
          }}>
            <ShieldCheck size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                Fair-Queue Concurrency Protection
              </strong>
              Reserving these passes acquires a distributed server lock. No competing buyer can purchase or claim your tickets while your 5-minute countdown is active.
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Reservation Panel */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-white)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Official Admission
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  ${event.price} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ ticket</span>
                </div>
              </div>

              {event.availableInventory !== undefined && (
                <span className={`badge ${event.availableInventory > 0 ? (event.availableInventory <= 20 ? 'badge-warning' : 'badge-success') : 'badge-danger'}`}>
                  {event.availableInventory > 0 ? (
                    event.availableInventory <= 20 ? `🔥 Only ${event.availableInventory} Left` : `${event.availableInventory} Remaining`
                  ) : 'Sold Out'}
                </span>
              )}
            </div>

            {/* Ticket / Berth Quantity Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Number of Passes / Berths
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Increased Limit: Up to {maxAllowed} berths per booking
                </div>
              </div>
              <QuantitySelector
                quantity={selectedSeats.length > 0 ? selectedSeats.length : quantity}
                onChange={(q) => {
                  setQuantity(q);
                  if (selectedSeats.length > q) {
                    setSelectedSeats(selectedSeats.slice(0, q));
                  }
                }}
                min={1}
                max={maxAllowed}
                disabled={!isAvailable || reserving}
              />
            </div>

            {/* Interactive Numbered Seat Selection Map */}
            <SeatSelector
              event={event}
              selectedSeats={selectedSeats}
              onSeatsChange={handleSeatsChange}
              maxAllowed={maxAllowed}
              disabled={!isAvailable || reserving}
            />

            {/* Error Message if Hold Fails */}
            {reserveError && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{reserveError}</span>
              </div>
            )}

            {/* Reserve Action Button */}
            <button
              onClick={handleReserve}
              disabled={!isAvailable || reserving || maxAllowed === 0}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', gap: '0.5rem' }}
            >
              {reserving ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Locking Tickets on Server...</span>
                </>
              ) : isAvailable ? (
                <>
                  <Lock size={18} />
                  <span>Lock Passes &amp; Proceed ({quantity}) &rarr;</span>
                </>
              ) : (
                <span>Currently Sold Out</span>
              )}
            </button>
            <style>{`
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <div style={{ textAlign: 'center', marginTop: '0.875rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Reserves an exclusive 2.5-minute concurrency hold upon clicking. No charge until confirmation.
            </div>
          </div>

          {/* Real-time Order Summary Preview */}
          <OrderSummary
            eventTitle={event.title}
            quantity={selectedSeats.length > 0 ? selectedSeats.length : quantity}
            unitPrice={event.price}
            selectedSeats={selectedSeats.map(s => formatSeatDisplay(s, event.coach || 'S3'))}
          />
        </div>
      </div>
    </div>
  );
}
