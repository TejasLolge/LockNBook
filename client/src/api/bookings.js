import { apiClient } from './client';
import { mockStore } from './mockData';

export async function confirmBooking({ holdId, customerInfo, paymentMethod, idempotencyKey }) {
  try {
    const res = await apiClient.post('/bookings/confirm', {
      holdId,
      customerInfo,
      paymentMethod,
    }, {
      'Idempotency-Key': idempotencyKey,
    });
    return { booking: res.data || res.booking || res, isMock: false };
  } catch (err) {
    console.warn('[LockNBook API] Backend booking confirmation offline. Confirming in dev adapter.');
    const holds = mockStore.getHolds();
    const hold = holds[holdId];

    if (!hold) {
      const error = new Error('Reservation hold not found or invalid');
      error.status = 404;
      throw error;
    }

    if (new Date() > new Date(hold.expiresAt)) {
      const error = new Error('Hold has expired. Please reselect your tickets.');
      error.status = 410;
      throw error;
    }

    hold.status = 'CONFIRMED';
    mockStore.saveHold(hold);

    const bookingRef = 'LNB-' + Math.floor(100000 + Math.random() * 900000);
    const booking = {
      bookingId: 'bk_' + Math.random().toString(36).substring(2, 9),
      bookingRef,
      holdId,
      eventId: hold.eventId,
      eventTitle: hold.eventTitle,
      venue: hold.venue,
      date: hold.date,
      time: hold.time,
      quantity: hold.quantity,
      selectedSeats: hold.selectedSeats || [],
      rawSeatKeys: hold.rawSeatKeys || [],
      unitPrice: hold.unitPrice,
      totalAmount: (hold.unitPrice * hold.quantity) + (3.50 * hold.quantity), // with service fee
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      paymentMethod,
      idempotencyKey,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    mockStore.saveBooking(booking);
    return { booking, isMock: true };
  }
}

export async function listMyBookings() {
  try {
    const res = await apiClient.get('/bookings');
    return { bookings: res.data || res.bookings || res, isMock: false };
  } catch (err) {
    console.warn('[LockNBook API] Fetching bookings via dev adapter');
    return { bookings: mockStore.getBookings(), isMock: true };
  }
}

export async function getBookingById(id) {
  try {
    const res = await apiClient.get(`/bookings/${id}`);
    return { booking: res.data || res.booking || res, isMock: false };
  } catch (err) {
    const bookings = mockStore.getBookings();
    const booking = bookings.find(b => b.bookingId === id || b.bookingRef === id);
    if (!booking) {
      const error = new Error('Booking not found');
      error.status = 404;
      throw error;
    }
    return { booking, isMock: true };
  }
}

export async function cancelBooking(bookingId) {
  try {
    const res = await apiClient.post(`/bookings/${bookingId}/cancel`, {});
    return { success: true, isMock: false };
  } catch (err) {
    console.warn(`[LockNBook API] Cancelling and releasing booking ${bookingId} via dev adapter`);
    const bookings = mockStore.getBookings();
    const booking = bookings.find(b => b.bookingId === bookingId || b.bookingRef === bookingId);
    if (booking) {
      booking.status = 'CANCELLED';
      booking.releasedAt = new Date().toISOString();
      const events = mockStore.getEvents();
      const event = events.find(e => e.id === booking.eventId);
      if (event) {
        event.availableInventory = Math.min(event.totalCapacity, (event.availableInventory || 0) + booking.quantity);
        if (Array.isArray(event.occupiedSeats)) {
          const seatsToFree = new Set([
            ...(booking.rawSeatKeys || []),
            ...(booking.selectedSeats || [])
          ]);
          event.occupiedSeats = event.occupiedSeats.filter(
            s => !seatsToFree.has(s) && !seatsToFree.has(String(s)) && !seatsToFree.has(Number(s))
          );
        }
        mockStore.saveEvents(events);
      }
      localStorage.setItem('lnb_mock_bookings', JSON.stringify(bookings));
    }
    return { success: true, isMock: true };
  }
}
