import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Lock, Ticket, User, LogOut, Clock, Menu, X, Compass, Home, Heart, Sparkles, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHold } from '../context/HoldContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { activeHold } = useHold();
  const { savedCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

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
          padding: '0.45rem 1rem',
          fontSize: '0.8125rem',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          <Clock size={15} className="pulse-timer" />
          <span>Reserved for you: <strong>{activeHold.eventTitle}</strong> ({activeHold.quantity} passes)</span>
          <Link to="/checkout" style={{
            textDecoration: 'underline',
            fontWeight: 700,
            marginLeft: '0.25rem'
          }}>
            Checkout &rarr;
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
        <Link to="/" onClick={closeMenu} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          fontWeight: 800,
          fontSize: '1.25rem',
          letterSpacing: '-0.025em',
          color: 'var(--text-main)'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'var(--primary-gradient)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
          }}>
            <Lock size={18} strokeWidth={2.5} />
          </div>
          <span>Lock<span style={{ color: 'var(--primary)' }}>N</span>Book</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          fontWeight: 600,
          fontSize: '0.9375rem'
        }} className="desktop-nav">
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
            Explore All
          </NavLink>

          <NavLink
            to="/events?tab=recommendations"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'color 0.15s ease'
            })}
          >
            <Sparkles size={15} color="var(--primary)" />
            <span>Smart Discovery</span>
          </NavLink>

          <NavLink
            to="/events?tab=saved"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'color 0.15s ease'
            })}
          >
            <Heart size={15} color={savedCount > 0 ? '#EF4444' : 'currentColor'} fill={savedCount > 0 ? '#EF4444' : 'transparent'} />
            <span>Wishlist</span>
            {savedCount > 0 && (
              <span style={{
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)'
              }}>
                {savedCount}
              </span>
            )}
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
            <span>My Passes</span>
          </NavLink>

          <NavLink
            to="/#architecture"
            onClick={(e) => {
              const el = document.getElementById('architecture');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease'
            }}
          >
            <Cpu size={15} color="var(--primary)" />
            <span>Architecture</span>
          </NavLink>
        </nav>

        {/* User Account / Auth Actions (Desktop) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-auth">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-muted)',
                  padding: '0.375rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-light)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <User size={14} color="var(--primary)" />
                <span>{user?.name || 'Profile'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Sign out of your account"
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
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-secondary btn-sm mobile-menu-toggle"
          style={{ display: 'none', padding: '0.4rem', border: 'none' }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-white)',
          borderTop: '1px solid var(--border-light)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--shadow-hover)'
        }}>
          <Link
            to="/"
            onClick={closeMenu}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}
          >
            <Home size={18} color="var(--primary)" />
            <span>Home</span>
          </Link>
          <Link
            to="/events"
            onClick={closeMenu}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}
          >
            <Compass size={18} color="var(--primary)" />
            <span>Explore All Events</span>
          </Link>
          <Link
            to="/events?tab=recommendations"
            onClick={closeMenu}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}
          >
            <Sparkles size={18} color="var(--primary)" />
            <span>Smart Discovery</span>
          </Link>
          <Link
            to="/events?tab=saved"
            onClick={closeMenu}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}
          >
            <Heart size={18} color={savedCount > 0 ? '#EF4444' : 'var(--primary)'} fill={savedCount > 0 ? '#EF4444' : 'transparent'} />
            <span>Wishlist ({savedCount})</span>
          </Link>
          <Link
            to="/my-bookings"
            onClick={closeMenu}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}
          >
            <Ticket size={18} color="var(--primary)" />
            <span>My Passes</span>
          </Link>
          <Link
            to="/#architecture"
            onClick={() => {
              closeMenu();
              setTimeout(() => {
                const el = document.getElementById('architecture');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}
          >
            <Cpu size={18} color="var(--primary)" />
            <span>Architecture &amp; Design</span>
          </Link>
          {isAuthenticated && (
            <Link
              to="/profile"
              onClick={closeMenu}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}
            >
              <User size={18} color="var(--primary)" />
              <span>My Profile &amp; Preferences</span>
            </Link>
          )}

          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">Sign Out</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Link to="/login" onClick={closeMenu} className="btn btn-secondary" style={{ textAlign: 'center' }}>Sign In</Link>
                <Link to="/register" onClick={closeMenu} className="btn btn-primary" style={{ textAlign: 'center' }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive Breakpoint CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .desktop-auth { display: none !important; }
          .mobile-menu-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
