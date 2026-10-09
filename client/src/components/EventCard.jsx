import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Flame } from 'lucide-react';

export default function EventCard({ event }) {
  const isAvailable = event.availableInventory === undefined || event.availableInventory > 0;
  const isLowStock = event.availableInventory !== undefined && event.availableInventory > 0 && event.availableInventory <= 12;

  // Format date nicely (e.g., Nov 14, 2026)
  const formattedDate = (() => {
    try {
      const parsed = new Date(event.date);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (e) { /* fallback */ }
    return event.date;
  })();

  return (
    <article className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%'
    }}>
      {/* Event Media Banner with Zoom on Hover */}
      <div className="card-media" style={{ height: '190px', backgroundColor: 'var(--bg-muted)' }}>
        <img
          src={event.image}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />

        {/* Category Pill */}
        {event.category && (
          <span style={{
            position: 'absolute',
            top: '0.85rem',
            left: '0.85rem',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(6px)',
            color: 'var(--text-main)',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}>
            {event.category}
          </span>
        )}

        {/* Real-time Inventory Badge */}
        {event.availableInventory !== undefined && (
          <span style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
            backgroundColor: !isAvailable ? 'var(--danger-bg)' : isLowStock ? 'var(--warning-bg)' : 'rgba(255, 255, 255, 0.95)',
            color: !isAvailable ? 'var(--danger)' : isLowStock ? 'var(--warning)' : 'var(--text-main)',
            border: `1px solid ${!isAvailable ? 'var(--danger-border)' : isLowStock ? 'var(--warning-border)' : 'var(--border-light)'}`,
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}>
            {isLowStock && <Flame size={12} color="var(--warning)" />}
            <span>{!isAvailable ? 'Sold Out' : isLowStock ? `Only ${event.availableInventory} Left!` : `${event.availableInventory} Available`}</span>
          </span>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
          <Calendar size={14} />
          <span>{formattedDate} &bull; {event.time}</span>
        </div>

        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          lineHeight: 1.35,
          color: 'var(--text-main)',
          marginBottom: '0.35rem',
          letterSpacing: '-0.015em'
        }}>
          {event.title}
        </h3>

        {event.artist && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>
            {event.artist}
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: 'var(--text-secondary)',
          fontSize: '0.8125rem',
          marginBottom: '1.25rem'
        }}>
          <MapPin size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {event.venue}
          </span>
        </div>

        {/* Card Footer */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Passes from
            </span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              ${event.price}
            </span>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.375rem' }}
          >
            <span>{isAvailable ? 'Reserve Passes' : 'View Details'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
