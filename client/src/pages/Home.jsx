import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Clock, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { fetchEvents } from '../api/events';
import EventCard from '../components/EventCard';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchEvents();
      setEvents(res.events || []);
      setIsMock(res.isMock);
    } catch (err) {
      setError(err.message || 'Unable to load events from server');
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
    <div style={{ paddingBottom: '4rem' }}>
      {/* Dev Mode Banner if Backend is Offline */}
      {isMock && (
        <div style={{
          backgroundColor: 'var(--warning-bg)',
          borderBottom: '1px solid var(--warning-border)',
          padding: '0.5rem 1rem',
          fontSize: '0.8125rem',
          color: 'var(--warning)',
          textAlign: 'center',
          fontWeight: 600
        }}>
          ⚠️ Backend Offline Mode: Using development test fixtures. Connect Vaibhav's backend to view live inventory.
        </div>
      )}

      {/* Hero Section */}
      <section style={{
        backgroundColor: 'var(--bg-white)',
        borderBottom: '1px solid var(--border-light)',
        padding: '4.5rem 0 3.5rem'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.875rem',
            backgroundColor: 'var(--primary-light)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--primary)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '1.25rem'
          }}>
            <Sparkles size={15} />
            <span>Fair-Queue Ticketing &bull; Zero Overselling</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--text-main)',
            marginBottom: '1.25rem'
          }}>
            Find Your Next Experience.
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '640px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Discover live concerts, tech summits, and sports championships. Hold your tickets securely with server-backed reservation locks while you checkout.
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
              padding: '0.5rem 0.5rem 0.5rem 1.25rem',
              maxWidth: '560px',
              margin: '0 auto 2rem',
              gap: '0.5rem'
            }}
          >
            <Search size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by event, artist, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.9375rem',
                color: 'var(--text-main)',
                backgroundColor: 'transparent'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
              Search
            </button>
          </form>

          {/* Category Shortcuts */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.625rem'
          }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Browse:</span>
            {[
              { label: 'Music', cat: 'music' },
              { label: 'Tech Summits', cat: 'conference' },
              { label: 'Sports', cat: 'sports' },
              { label: 'Comedy', cat: 'comedy' },
              { label: 'Theatre', cat: 'theatre' }
            ].map(item => (
              <Link
                key={item.cat}
                to={`/events?category=${item.cat}`}
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-muted)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  transition: 'background-color 0.15s ease'
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
        padding: '2rem 0'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              flexShrink: 0
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Zero Overselling Guarantee
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Inventory is authoritative and maintained by the backend engine. No double-booked seats.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <Clock size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Authoritative TTL Holds
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Your selected tickets are temporarily locked on the server so you can review without rushing.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              flexShrink: 0
            }}>
              <Zap size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Instant Confirmation
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Idempotent payment confirmation confirms booking references safely and immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="container" style={{ paddingTop: '3.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Featured Events
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Handpicked headliners and high-demand events.
            </p>
          </div>
          <Link to="/events" className="btn btn-secondary btn-sm" style={{ gap: '0.375rem' }}>
            <span>Explore All Events</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading && <LoadingState message="Loading featured events..." />}
        {error && <ErrorMessage message={error} onRetry={loadData} />}

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

      {/* Upcoming Events Section */}
      {!loading && !error && upcomingEvents.length > 0 && (
        <section className="container" style={{ paddingTop: '3.5rem' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Upcoming on the Calendar
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Concerts, tech gatherings, and comedy specials coming up next.
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
