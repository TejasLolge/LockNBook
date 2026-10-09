import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Lock, Ticket, User, LogOut, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHold } from '../context/HoldContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { activeHold } = useHold();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'var(--bg-white)',
      borderBottom: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Active Hold Global Notification Strip */}
      {activeHold && new Date(activeHold.expiresAt).getTime() > Date.now() && (
        <div style={{
          backgroundColor: 'var(--primary-light)',
          borderBottom: '1px solid var(--primary-border)',
          padding: '0.4rem 1rem',
          fontSize: '0.8125rem',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <Clock size={15} className="pulse-timer" />
          <span>Active Hold: You have tickets reserved for <strong>{activeHold.eventTitle}</strong>.</span>
          <Link to="/checkout" style={{
            textDecoration: 'underline',
            fontWeight: 700,
            marginLeft: '0.25rem'
          }}>
            Complete Checkout &rarr;
          </Link>
        </div>
      )}

      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
        gap: '1rem'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          fontWeight: 800,
          fontSize: '1.25rem',
          letterSpacing: '-0.02em',
          color: 'var(--text-main)'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Lock size={20} strokeWidth={2.5} />
          </div>
          <span>Lock<span style={{ color: 'var(--primary)' }}>N</span>Book</span>
        </Link>

        {/* Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          fontWeight: 600,
          fontSize: '0.9375rem'
        }}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'color 0.15s ease'
            })}
          >
            Home
          </NavLink>

          <NavLink
            to="/events"
            style={({ isActive }) => ({
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'color 0.15s ease'
            })}
          >
            Explore Events
          </NavLink>

          <NavLink
            to="/my-bookings"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'color 0.15s ease'
            })}
          >
            <Ticket size={16} />
            <span>My Bookings</span>
          </NavLink>
        </nav>

        {/* User Account / Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-muted)',
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius-full)'
              }}>
                <User size={15} color="var(--primary)" />
                <span>{user?.name || 'Account'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Sign out"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
