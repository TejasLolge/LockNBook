import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Ticket, Heart, Sparkles, LogOut, ArrowRight, Settings, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useHold } from '../context/HoldContext';

const AVAILABLE_CATEGORIES = [
  { id: 'music', label: '🎵 Music & Concerts' },
  { id: 'movies', label: '🎬 Movies & Cinema' },
  { id: 'trains', label: '🚅 Bullet Trains' },
  { id: 'buses', label: '🚌 Luxury Sleeper Buses' },
  { id: 'sports', label: '🏎️ Sports & Motorsports' },
  { id: 'theatre', label: '🎭 Theatre & Symphonies' },
  { id: 'conference', label: '💻 Tech Summits' }
];

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const { interests, toggleInterest, savedCount } = useWishlist();
  const { activeHold } = useHold();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '820px' }}>
      {/* Profile Header Card */}
      <div className="card" style={{
        padding: '2rem',
        backgroundColor: 'var(--bg-white)',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '1.5rem',
            fontWeight: 800,
            boxShadow: 'var(--shadow-card)'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={28} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                {user?.name || 'Guest Explorer'}
              </h1>
              <span className="badge badge-success" style={{ gap: '0.25rem' }}>
                <ShieldCheck size={12} />
                <span>Verified Attendee</span>
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              {user?.email || 'guest@locknbook.dev'} &bull; Concurrency Protected Account
            </p>
          </div>
        </div>

        {isAuthenticated ? (
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ gap: '0.375rem' }}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Sign In to Sync
          </Link>
        )}
      </div>

      {/* Snapshot Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <Link to="/my-bookings" className="card" style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-white)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          textDecoration: 'none'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Ticket size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
              Confirmed Passes
            </span>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
              View Orders &rarr;
            </div>
          </div>
        </Link>

        <Link to="/events?tab=saved" className="card" style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-white)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          textDecoration: 'none'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#DC2626'
          }}>
            <Heart size={22} fill="#DC2626" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
              Saved Wishlist
            </span>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {savedCount} {savedCount === 1 ? 'Event' : 'Events'} &rarr;
            </div>
          </div>
        </Link>

        {activeHold ? (
          <Link to="/checkout" className="card" style={{
            padding: '1.25rem',
            backgroundColor: 'var(--warning-bg)',
            borderColor: 'var(--warning-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            textDecoration: 'none'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warning)'
            }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--warning)' }}>
                Active Reservation
              </span>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Resume Checkout &rarr;
              </div>
            </div>
          </Link>
        ) : (
          <div className="card" style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-white)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                Protection Status
              </span>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Zero Double-Booking Active
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Personalized Interests & Smart Discovery Settings */}
      <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-white)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Sparkles size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Smart Discovery: Personal Preferences
              </h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Select your favorite categories. Our recommendation engine curates tailored tickets and transit options for you.
            </p>
          </div>

          <Link to="/events?tab=recommendations" className="btn btn-secondary btn-sm" style={{ gap: '0.375rem' }}>
            <span>View My Recommendations</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          {AVAILABLE_CATEGORIES.map((cat) => {
            const isSelected = interests.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleInterest(cat.id)}
                style={{
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-light)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-white)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{cat.label}</span>
                {isSelected && <span style={{ fontWeight: 800 }}>✓</span>}
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: '1.5rem',
          padding: '0.875rem 1rem',
          backgroundColor: 'var(--bg-muted)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Settings size={15} color="var(--primary)" />
          <span>Preferences are automatically saved to your browser and customize your homepage feed.</span>
        </div>
      </div>
    </div>
  );
}
