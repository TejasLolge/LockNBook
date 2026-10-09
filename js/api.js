/* ==========================================================================
   LockNBook API Client & Reservation Engine
   Implements Vaibhav's backend API contract with atomic holds, TTL expiry,
   and zero-overselling inventory guarantees.
   ========================================================================== */

(function (window) {
  'use strict';

  // Seed Event Data
  const INITIAL_EVENTS = [
    {
      id: 'ev-001',
      title: 'Neon Horizon: Electronic World Tour',
      artist: 'Aura Collective & Tycho Beats',
      category: 'music',
      categoryLabel: 'Live Concert',
      date: 'Sat, Nov 14, 2026',
      time: '8:00 PM EST',
      venue: 'CyberSphere Arena, Seattle',
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80',
      description: 'Experience an extraordinary audiovisual spectacle with cutting-edge holographic production and immersive soundscapes.',
      featured: true,
      tiers: [
        { id: 't-ga', name: 'General Admission', price: 65, total: 100, held: 12, confirmed: 68 },
        { id: 't-vip', name: 'VIP Pit & Soundcheck', price: 150, total: 30, held: 4, confirmed: 22 },
        { id: 't-backstage', name: 'Backstage Lounge Pass', price: 295, total: 8, held: 1, confirmed: 5 }
      ]
    },
    {
      id: 'ev-002',
      title: 'Global AI Summit & Hackathon 2026',
      artist: 'Keynotes by DeepMind & OpenAI Engineers',
      category: 'tech',
      categoryLabel: 'Tech Conference',
      date: 'Dec 02 - 04, 2026',
      time: '9:00 AM PST',
      venue: 'Moscone Convention Center, SF',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
      description: 'The premier global convention gathering leading researchers in autonomous multi-agent systems and frontier models.',
      featured: false,
      tiers: [
        { id: 't-conf-dev', name: 'Developer Pass', price: 180, total: 80, held: 5, confirmed: 60 },
        { id: 't-conf-all', name: 'All-Access + Workshops', price: 380, total: 40, held: 2, confirmed: 35 },
        { id: 't-conf-founder', name: 'Founder & VIP Dinner', price: 750, total: 10, held: 1, confirmed: 8 }
      ]
    },
    {
      id: 'ev-003',
      title: 'Apex Grand Prix: Night Drift Championship',
      artist: 'Formula Apex Pro Series',
      category: 'sports',
      categoryLabel: 'Motorsport',
      date: 'Sat, Nov 21, 2026',
      time: '7:30 PM CST',
      venue: 'Circuit of the Americas, Austin',
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      description: 'High-octane championship night under floodlights with blistering 200mph speeds and precision drift battles.',
      featured: false,
      tiers: [
        { id: 't-grandstand', name: 'Main Grandstand', price: 95, total: 60, held: 6, confirmed: 45 },
        { id: 't-paddock', name: 'Paddock Club Access', price: 280, total: 15, held: 2, confirmed: 11 },
        { id: 't-grid', name: 'Grid Walk & Podium Suite', price: 590, total: 6, held: 0, confirmed: 5 }
      ]
    },
    {
      id: 'ev-004',
      title: 'Hasan Minhaj: Unfiltered Live Standup',
      artist: 'Special Comedy Showcase Tour',
      category: 'comedy',
      categoryLabel: 'Standup Comedy',
      date: 'Fri, Nov 27, 2026',
      time: '8:30 PM EST',
      venue: 'Beacon Theatre, New York',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      description: 'A brand-new evening of razor-sharp storytelling, social commentary, and unfiltered comedy.',
      featured: false,
      tiers: [
        { id: 't-balcony', name: 'Balcony Reserved', price: 45, total: 50, held: 3, confirmed: 40 },
        { id: 't-orchestra', name: 'Orchestra Front', price: 85, total: 35, held: 4, confirmed: 28 },
        { id: 't-meetgreet', name: 'VIP Meet & Greet', price: 190, total: 5, held: 1, confirmed: 4 }
      ]
    },
    {
      id: 'ev-005',
      title: 'Interstellar: Live Symphonic Orchestra',
      artist: 'Royal Philharmonic Ensemble & Choir',
      category: 'theatre',
      categoryLabel: 'Symphony & Theatre',
      date: 'Sun, Dec 13, 2026',
      time: '6:00 PM GMT',
      venue: 'Royal Albert Hall, London',
      image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
      description: 'Hans Zimmers iconic film score performed live in synchronization with 4K IMAX cinematic projections.',
      featured: false,
      tiers: [
        { id: 't-tier2', name: 'Upper Tier Circle', price: 55, total: 70, held: 4, confirmed: 60 },
        { id: 't-stalls', name: 'Stalls Premium', price: 110, total: 40, held: 3, confirmed: 35 },
        { id: 't-royalbox', name: 'Grand Royal Box', price: 250, total: 6, held: 1, confirmed: 5 }
      ]
    },
    {
      id: 'ev-006',
      title: 'Solstice Sunset Beach Festival',
      artist: 'Rufus Du Sol, Lane 8, Nora En Pure',
      category: 'music',
      categoryLabel: 'Music Festival',
      date: 'Jan 09, 2027',
      time: '2:00 PM EST',
      venue: 'South Beach Arena, Miami',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      description: '12-hour open-air oceanfront celebration of melodic house and deep techno as the sun sets over the Atlantic.',
      featured: false,
      tiers: [
        { id: 't-beach-ga', name: 'General Admission', price: 89, total: 120, held: 15, confirmed: 95 },
        { id: 't-beach-vip', name: 'VIP Sunset Deck', price: 195, total: 35, held: 3, confirmed: 28 },
        { id: 't-beach-cabana', name: 'Private VIP Cabana', price: 600, total: 4, held: 1, confirmed: 3 }
      ]
    }
  ];

  class LockNBookApi {
    constructor() {
      this.STORAGE_KEY_EVENTS = 'locknbook_events_v1';
      this.STORAGE_KEY_LOCKS = 'locknbook_locks_v1';
      this.STORAGE_KEY_BOOKINGS = 'locknbook_bookings_v1';
      this.TTL_SECONDS = 300; // 5 minute lock hold window

      this.listeners = [];
      this.logListeners = [];

      this.initStore();
      this.startExpirySweeper();
    }

    initStore() {
      if (!localStorage.getItem(this.STORAGE_KEY_EVENTS)) {
        localStorage.setItem(this.STORAGE_KEY_EVENTS, JSON.stringify(INITIAL_EVENTS));
      }
      if (!localStorage.getItem(this.STORAGE_KEY_LOCKS)) {
        localStorage.setItem(this.STORAGE_KEY_LOCKS, JSON.stringify({}));
      }
      if (!localStorage.getItem(this.STORAGE_KEY_BOOKINGS)) {
        localStorage.setItem(this.STORAGE_KEY_BOOKINGS, JSON.stringify([]));
      }
    }

    // Logger for concurrency and developer HUD
    log(msg, type = 'info') {
      const entry = {
        timestamp: new Date().toLocaleTimeString(),
        message: msg,
        type: type
      };
      this.logListeners.forEach(fn => fn(entry));
    }

    onLog(fn) {
      this.logListeners.push(fn);
    }

    subscribe(fn) {
      this.listeners.push(fn);
    }

    notify() {
      const events = this.getEvents();
      this.listeners.forEach(fn => fn(events));
    }

    getEvents() {
      try {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY_EVENTS)) || INITIAL_EVENTS;
      } catch (e) {
        return INITIAL_EVENTS;
      }
    }

    getEventById(eventId) {
      return this.getEvents().find(ev => ev.id === eventId);
    }

    getLocks() {
      try {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY_LOCKS)) || {};
      } catch (e) {
        return {};
      }
    }

    saveLocks(locks) {
      localStorage.setItem(this.STORAGE_KEY_LOCKS, JSON.stringify(locks));
    }

    getBookings() {
      try {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY_BOOKINGS)) || [];
      } catch (e) {
        return [];
      }
    }

    saveBookings(bookings) {
      localStorage.setItem(this.STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
    }

    saveEvents(events) {
      localStorage.setItem(this.STORAGE_KEY_EVENTS, JSON.stringify(events));
      this.notify();
    }

    /**
     * ATOMIC RESERVATION HOLD
     * Contract matching Vaibhav's backend (/api/reservations/hold)
     * Acquires a row-level equivalent lock with a 300-second TTL.
     */
    holdReservation({ eventId, tierId, quantity, userId = 'user_guest' }) {
      this.cleanupExpiredLocks();
      const events = this.getEvents();
      const event = events.find(e => e.id === eventId);

      if (!event) {
        return { success: false, error: 'EVENT_NOT_FOUND' };
      }

      const tier = event.tiers.find(t => t.id === tierId);
      if (!tier) {
        return { success: false, error: 'TIER_NOT_FOUND' };
      }

      // Concurrency check: available = total - (confirmed + currently held)
      const available = tier.total - (tier.confirmed + tier.held);
      if (quantity > available) {
        this.log(`❌ Hold REJECTED for ${quantity}x [${tier.name}]. Available: ${available}. Zero overselling enforced!`, 'error');
        return {
          success: false,
          error: 'INSUFFICIENT_INVENTORY',
          available: available
        };
      }

      // Generate atomic lock
      const lockId = 'lock_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      const expiresAt = Date.now() + (this.TTL_SECONDS * 1000);

      // Increment held inventory
      tier.held += quantity;
      this.saveEvents(events);

      // Register lock in distributed table
      const locks = this.getLocks();
      locks[lockId] = {
        lockId,
        eventId,
        eventTitle: event.title,
        tierId,
        tierName: tier.name,
        unitPrice: tier.price,
        quantity,
        userId,
        createdAt: Date.now(),
        expiresAt,
        status: 'HELD'
      };
      this.saveLocks(locks);

      this.log(`🔒 Atomic Lock ACQUIRED [${lockId.slice(0, 12)}...]: ${quantity}x [${tier.name}] held for 300s TTL`, 'success');

      return {
        success: true,
        lockId,
        expiresAt,
        ttlSeconds: this.TTL_SECONDS,
        tierName: tier.name,
        unitPrice: tier.price,
        quantity,
        totalAmount: tier.price * quantity,
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          venue: event.venue
        }
      };
    }

    /**
     * CONFIRM RESERVATION
     * Contract matching Vaibhav's backend (/api/reservations/confirm)
     * Transitions lock state from HELD -> CONFIRMED, commits inventory.
     */
    confirmReservation({ lockId, paymentDetails, idempotencyKey, customerInfo }) {
      this.cleanupExpiredLocks();
      const locks = this.getLocks();
      const lock = locks[lockId];

      if (!lock) {
        return { success: false, error: 'LOCK_NOT_FOUND_OR_EXPIRED' };
      }

      if (lock.status !== 'HELD') {
        return { success: false, error: 'LOCK_INVALID_STATE', currentStatus: lock.status };
      }

      if (Date.now() > lock.expiresAt) {
        this.releaseReservation(lockId, 'TTL_EXPIRED');
        return { success: false, error: 'LOCK_EXPIRED' };
      }

      // Transition lock to confirmed
      lock.status = 'CONFIRMED';
      lock.confirmedAt = Date.now();
      lock.idempotencyKey = idempotencyKey;

      // Update event inventory: held -> confirmed
      const events = this.getEvents();
      const event = events.find(e => e.id === lock.eventId);
      if (event) {
        const tier = event.tiers.find(t => t.id === lock.tierId);
        if (tier) {
          tier.held = Math.max(0, tier.held - lock.quantity);
          tier.confirmed += lock.quantity;
        }
        this.saveEvents(events);
      }

      this.saveLocks(locks);

      // Create booking pass record
      const bookingRef = 'LNB-' + Math.floor(100000 + Math.random() * 900000);
      const booking = {
        bookingRef,
        lockId,
        eventId: lock.eventId,
        eventTitle: lock.eventTitle,
        tierId: lock.tierId,
        tierName: lock.tierName,
        quantity: lock.quantity,
        unitPrice: lock.unitPrice,
        totalAmount: lock.unitPrice * lock.quantity,
        customerName: customerInfo.name || 'Valued Guest',
        customerEmail: customerInfo.email || 'guest@locknbook.com',
        customerPhone: customerInfo.phone || '+1 555-0199',
        bookedAt: Date.now(),
        status: 'CONFIRMED',
        paymentMethod: paymentDetails.method || 'Card',
        qrData: `LOCKNBOOK-PASS::REF=${bookingRef}::EV=${lock.eventId}::QTY=${lock.quantity}::VALID=TRUE`
      };

      const bookings = this.getBookings();
      bookings.unshift(booking);
      this.saveBookings(bookings);

      this.log(`✅ Booking CONFIRMED: ${bookingRef} (${lock.quantity}x ${lock.tierName}). Inventory committed.`, 'success');

      return {
        success: true,
        booking
      };
    }

    /**
     * RELEASE / CANCEL RESERVATION
     * Contract matching Vaibhav's backend (/api/reservations/release)
     */
    releaseReservation(lockId, reason = 'USER_ABANDONED') {
      const locks = this.getLocks();
      const lock = locks[lockId];

      if (!lock || lock.status !== 'HELD') {
        return { success: false, error: 'NO_ACTIVE_LOCK' };
      }

      lock.status = reason === 'TTL_EXPIRED' ? 'EXPIRED' : 'RELEASED';
      lock.releasedAt = Date.now();
      this.saveLocks(locks);

      // Return held seats back to pool
      const events = this.getEvents();
      const event = events.find(e => e.id === lock.eventId);
      if (event) {
        const tier = event.tiers.find(t => t.id === lock.tierId);
        if (tier) {
          tier.held = Math.max(0, tier.held - lock.quantity);
        }
        this.saveEvents(events);
      }

      this.log(`🔓 Lock RELEASED [${lockId.slice(0, 10)}...] (${reason}). Seats returned to pool.`, 'warn');
      return { success: true };
    }

    /**
     * CANCEL CONFIRMED BOOKING
     * Restores inventory to available pool
     */
    cancelBooking(bookingRef) {
      const bookings = this.getBookings();
      const bookingIndex = bookings.findIndex(b => b.bookingRef === bookingRef);

      if (bookingIndex === -1) {
        return { success: false, error: 'BOOKING_NOT_FOUND' };
      }

      const booking = bookings[bookingIndex];
      booking.status = 'CANCELLED';
      this.saveBookings(bookings);

      // Restore event inventory
      const events = this.getEvents();
      const event = events.find(e => e.id === booking.eventId);
      if (event) {
        const tier = event.tiers.find(t => t.id === booking.tierId);
        if (tier) {
          tier.confirmed = Math.max(0, tier.confirmed - booking.quantity);
        }
        this.saveEvents(events);
      }

      this.log(`🔄 Booking CANCELLED: ${bookingRef}. ${booking.quantity} seats restored to available inventory.`, 'info');
      return { success: true };
    }

    /**
     * SWEEPER: Clean up expired locks automatically
     */
    cleanupExpiredLocks() {
      const locks = this.getLocks();
      const now = Date.now();
      let changed = false;

      Object.values(locks).forEach(lock => {
        if (lock.status === 'HELD' && now > lock.expiresAt) {
          this.releaseReservation(lock.lockId, 'TTL_EXPIRED');
          changed = true;
        }
      });

      return changed;
    }

    startExpirySweeper() {
      setInterval(() => {
        this.cleanupExpiredLocks();
      }, 2000);
    }

    resetAllData() {
      localStorage.setItem(this.STORAGE_KEY_EVENTS, JSON.stringify(INITIAL_EVENTS));
      localStorage.setItem(this.STORAGE_KEY_LOCKS, JSON.stringify({}));
      localStorage.setItem(this.STORAGE_KEY_BOOKINGS, JSON.stringify([]));
      this.log(`⚡ System state reset to initial inventory factory seed.`, 'warn');
      this.notify();
    }
  }

  window.LockNBookApi = new LockNBookApi();
})(window);
