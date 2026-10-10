import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HoldProvider } from './context/HoldContext';
import { WishlistProvider } from './context/WishlistContext';
import EngineeringDashboard from './pages/EngineeringDashboard';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import EventBrowser from './pages/EventBrowser';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <WishlistProvider>
          <HoldProvider>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              backgroundColor: 'var(--bg-page)'
            }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/events" element={<EventBrowser />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/engineering" element={<EngineeringDashboard />} />
                  <Route path="/confirmation/:bookingId" element={<BookingConfirmation />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/architecture" element={<Home />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </HoldProvider>
        </WishlistProvider>
      </AuthProvider>
    </HashRouter>
  );
}
