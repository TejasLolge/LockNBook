import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-white)',
      borderTop: '1px solid var(--border-light)',
      paddingTop: '3.5rem',
      paddingBottom: '2.5rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 800,
              fontSize: '1.25rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                backgroundColor: 'var(--primary)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Lock size={16} strokeWidth={2.5} />
              </div>
              <span>Lock<span style={{ color: 'var(--primary)' }}>N</span>Book</span>
            </div>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '320px'
            }}>
              High-concurrency ticket reservations backed by distributed atomic inventory holds. Never lose your booking to checkout latency.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/events" style={{ color: 'inherit' }}>Browse All Events</Link></li>
              <li><Link to="/my-bookings" style={{ color: 'inherit' }}>My Bookings & Passes</Link></li>
              <li><Link to="/login" style={{ color: 'inherit' }}>Account Sign In</Link></li>
              <li><Link to="/register" style={{ color: 'inherit' }}>Create New Account</Link></li>
            </ul>
          </div>

          {/* System Guarantees */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>
              Reservation Guarantees
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="var(--success)" />
                <span>Zero Overselling Guarantee</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={16} color="var(--primary)" />
                <span>Server-Backed Absolute TTL Hold</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={16} color="var(--primary)" />
                <span>Idempotent Transaction Pipeline</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} LockNBook Platform. Built for high concurrency & fair booking.
          </div>
          <div>
            Engineering Track: Tejas (Frontend) &bull; Vaibhav (Backend) &bull; Tanishq (Lead) &bull; Sarthak (QA)
          </div>
        </div>
      </div>
    </footer>
  );
}
