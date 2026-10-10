import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShieldCheck, Clock, Zap, ArrowRight, Sparkles, Flame, Heart } from 'lucide-react';
import { fetchEvents } from '../api/events';
import EventCard from '../components/EventCard';
import CategoryShowcase from '../components/CategoryShowcase';
import TechnicalArchitecture from '../components/TechnicalArchitecture';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import { useWishlist } from '../context/WishlistContext';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { interests, toggleInterest } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (window.location.hash.includes('architecture') || location.pathname === '/architecture') {
      setTimeout(() => {
        const el = document.getElementById('architecture');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [location]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchEvents();
      setEvents(res.events || []);
      setIsMock(res.isMock);
    } catch (err) {
      setError(err.message || 'Unable to retrieve events from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  const featuredEvents = events.slice(0, 3);
  const upcomingEvents = events.slice(3, 6);

  return (
    <div style={{ paddingBottom: '4.5rem' }}>
      {/* Dev Mode Banner if Backend is Offline */}
      {isMock && (
        <div style={{
          backgroundColor: 'var(--warning-bg)',
          borderBottom: '1px solid var(--warning-border)',
          padding: '0.45rem 1rem',
          fontSize: '0.8125rem',
          color: 'var(--warning)',
          textAlign: 'center',
          fontWeight: 600
        }}>
          ⚠️ Development Fixture Mode &bull; Real backend is currently offline. Demonstrating atomic holds using local store.
        </div>
      )}

      {/* Hero Showcase Section */}
      <section style={{
        backgroundColor: 'var(--bg-white)',
        borderBottom: '1px solid var(--border-light)',
        padding: '5rem 0 4rem'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.95rem',
            backgroundColor: 'var(--primary-light)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--primary)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Sparkles size={15} />
            <span>Atomic Concurrency Ticketing &bull; Zero Overselling</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 4.8vw, 3.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            color: 'var(--text-main)',
            marginBottom: '1.25rem'
          }}>
            Live Experiences,<br />
            <span style={{ color: 'var(--primary)' }}>Guaranteed Reservations.</span>
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '680px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Say goodbye to checkout heartbreak and aggressive ticket bots. LockNBook reserves your passes with atomic server holds—giving you dedicated time to complete checkout with absolute confidence.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleHeroSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-white)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-hover)',
              padding: '0.5rem 0.5rem 0.5rem 1.35rem',
              maxWidth: '580px',
              margin: '0 auto 2rem',
              gap: '0.5rem'
            }}
          >
            <Search size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by event, headlining artist, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                backgroundColor: 'transparent'
              }}
              aria-label="Search events"
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
              Find Events
            </button>
          </form>

          {/* Quick Categories */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.625rem'
          }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Explore:</span>
            {[
              { label: '🎵 Concerts', cat: 'music' },
              { label: '🎬 Movies', cat: 'movies' },
              { label: '🚅 Bullet Trains', cat: 'trains' },
              { label: '🚌 Luxury Buses', cat: 'buses' },
              { label: '🏎️ Motorsports', cat: 'sports' },
              { label: '🎭 Theatre & Symphonies', cat: 'theatre' }
            ].map(item => (
              <Link
                key={item.cat}
                to={`/events?category=${item.cat}`}
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-muted)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  transition: 'all 0.15s ease',
                  border: '1px solid var(--border-light)'
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Strip */}
      <section style={{
        backgroundColor: 'var(--bg-page)',
        borderBottom: '1px solid var(--border-light)',
        padding: '2.25rem 0'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
                Zero Overselling Guarantee
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Inventory is authoritatively locked at the database level. No double-booked seats or canceled orders.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Clock size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
                Dedicated 5-Minute Hold
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Your selected tickets are temporarily held on the server so you can review details without rushing.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Zap size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
                Instant Cryptographic Passes
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Receive tamper-proof admission passes with verifiable reference IDs immediately upon confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Category Showcase Grid */}
      <CategoryShowcase />

      {/* Smart Discovery & Personalized Recommendations Section */}
      <section className="container" style={{ paddingTop: '3.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-info" style={{ gap: '0.3rem' }}>
                <Sparkles size={12} />
                <span>Smart Discovery</span>
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deterministic Matching</span>
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: 0 }}>
              Recommended for You
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Tailored event passes and travel departures matching your selected interests.
            </p>
          </div>

          {/* Real-time Interest Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Tuning:
            </span>
            {[
              { id: 'music', label: '🎵 Concerts' },
              { id: 'movies', label: '🎬 Movies' },
              { id: 'trains', label: '🚅 Trains' },
              { id: 'buses', label: '🚌 Buses' },
              { id: 'sports', label: '🏎️ Sports' },
              { id: 'theatre', label: '🎭 Theatre' }
            ].map(opt => {
              const active = interests.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleInterest(opt.id)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: active ? 'var(--primary)' : 'var(--border-light)',
                    backgroundColor: active ? 'var(--primary-light)' : 'var(--bg-white)',
                    color: active ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Toggle ${opt.label} recommendations`}
                >
                  {opt.label} {active && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {loading && <LoadingState message="Curating personalized experiences..." />}
        {error && <ErrorMessage message={error} onRetry={loadData} />}

        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '4rem'
          }}>
            {(events.filter(e => interests.includes(e.category)).length > 0
              ? events.filter(e => interests.includes(e.category))
              : events
            ).slice(0, 4).map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Experiences Section */}
      <section className="container" style={{ paddingTop: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
              Curated Headliners
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Top verified live experiences and premium express routes with guaranteed seat locking.
            </p>
          </div>
          <Link to="/events" className="btn btn-secondary btn-sm" style={{ gap: '0.375rem' }}>
            <span>Explore All Events &rarr;</span>
          </Link>
        </div>

        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.75rem'
          }}>
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Technical Architecture & Engineering Section */}
      <TechnicalArchitecture />

      {/* Upcoming On the Calendar Section */}
      {!loading && !error && upcomingEvents.length > 0 && (
        <section className="container" style={{ paddingTop: '4rem' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
              Upcoming on the Calendar
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Exciting concerts, bullet train departures, film screenings, and motorsport races.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.75rem'
          }}>
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
