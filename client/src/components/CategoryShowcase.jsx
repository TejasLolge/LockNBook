import React from 'react';
import { Link } from 'react-router-dom';
import { Train, Bus, Film, Music, Trophy, Sparkles, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'music',
    title: 'Music & Concerts',
    tagline: 'World tours, stadium festivals & intimate live sessions',
    count: '2 Active Events',
    icon: Music,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    accent: '#2563EB'
  },
  {
    id: 'movies',
    title: 'Movies & Cinema',
    tagline: 'IMAX 70mm screenings, red carpet premieres & film fests',
    count: '2 Screenings',
    icon: Film,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    accent: '#7C3AED'
  },
  {
    id: 'trains',
    title: 'Bullet Trains & Rail',
    tagline: 'High-speed intercity maglevs & scenic mountain vistas',
    count: '2 Daily Departures',
    icon: Train,
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
    accent: '#059669'
  },
  {
    id: 'buses',
    title: 'Luxury Sleeper Buses',
    tagline: 'Executive lie-flat sleeper pods & zero-emission express coaches',
    count: '2 Express Routes',
    icon: Bus,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    accent: '#D97706'
  },
  {
    id: 'sports',
    title: 'Sports & Motorsports',
    tagline: 'Championship night drifting, continental football & tournaments',
    count: '2 Fixtures',
    icon: Trophy,
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    accent: '#DC2626'
  },
  {
    id: 'theatre',
    title: 'Live Theatre & Arts',
    tagline: 'Orchestral film symphonies, standup showcases & tech summits',
    count: '3 Productions',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    accent: '#DB2777'
  }
];

export default function CategoryShowcase() {
  return (
    <section className="container" style={{ paddingTop: '4rem', paddingBottom: '1rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 800,
            color: 'var(--primary)',
            display: 'block',
            marginBottom: '0.25rem'
          }}>
            Multi-Category Ticketing
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Book by Category
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Explore verified seat reservations across entertainment and intercity transit.
          </p>
        </div>

        <Link to="/events" className="btn btn-secondary btn-sm" style={{ gap: '0.375rem' }}>
          <span>Browse All Categories</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={`/events?category=${cat.id}`}
              className="card"
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                textDecoration: 'none',
                color: '#FFFFFF',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '1.5rem',
                border: 'none',
                boxShadow: 'var(--shadow-card)',
                transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              {/* Background Image with Zoom Effect */}
              <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                overflow: 'hidden'
              }}>
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </div>

              {/* Gradient Scrim Overlay for Readability */}
              <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                background: 'linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.4) 40%, rgba(15,23,42,0.92) 100%)'
              }} />

              {/* Top Badge */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                zIndex: 3,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.3rem 0.65rem',
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#FFFFFF'
              }}>
                <Icon size={12} color={cat.accent} />
                <span>{cat.count}</span>
              </div>

              {/* Content at Bottom */}
              <div style={{ position: 'relative', zIndex: 3 }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  marginBottom: '0.25rem',
                  letterSpacing: '-0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>{cat.title}</span>
                  <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>&rarr;</span>
                </h3>

                <p style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  lineHeight: 1.4,
                  margin: 0
                }}>
                  {cat.tagline}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
