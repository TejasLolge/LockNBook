import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export default function EventCard({ event }) {
  const isAvailable = event.availableInventory === undefined || event.availableInventory > 0;

  return (
    <article className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%'
    }}>
      {/* Event Media Banner */}
      <div style={{ position: 'relative', height: '180px', backgroundColor: 'var(--bg-muted)' }}>
        <img
          src={event.image}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        {event.category && (
          <span style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            color: 'var(--text-main)',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)'
          }}>
            {event.category}
          </span>
        )}

        {/* Live inventory badge only if server provided */}
        {event.availableInventory !== undefined && (
          <span style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            backgroundColor: isAvailable ? 'var(--bg-white)' : 'var(--danger-bg)',
            color: isAvailable ? 'var(--text-main)' : 'var(--danger)',
            border: `1px solid ${isAvailable ? 'var(--border-light)' : 'var(--danger-border)'}`,
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-full)'
          }}>
            {isAvailable ? `${event.availableInventory} Left` : 'Sold Out'}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
          <Calendar size={14} />
          <span>{event.date} &bull; {event.time}</span>
        </div>

        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          lineHeight: 1.35,
          color: 'var(--text-main)',
          marginBottom: '0.375rem'
        }}>
          {event.title}
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          color: 'var(--text-secondary)',
          fontSize: '0.8125rem',
          marginBottom: '1rem'
        }}>
          <MapPin size={14} style={{ flexShrink: 0 }} />
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              Tickets from
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ${event.price}
            </span>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.375rem' }}
          >
            <span>View Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
