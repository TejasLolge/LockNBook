import { apiClient } from './client';
import { mockStore } from './mockData';
import { SL_COACH_CONFIG, seat_info, formatSeatDisplay } from './railwaySeatEngine';

/**
 * Sweeps and automatically releases expired holds from the mock store,
 * returning seats and inventory back to the available pool.
 */
export function cleanExpiredHolds() {
  try {
    const holds = mockStore.getHolds();
    const events = mockStore.getEvents();
    let eventsChanged = false;
    let holdsChanged = false;
    const now = Date.now();

    for (const holdId in holds) {
      const hold = holds[holdId];
      if (hold && hold.status === 'HELD' && new Date(hold.expiresAt).getTime() <= now) {
        hold.status = 'EXPIRED';
        holdsChanged = true;

        const event = events.find(e => e.id === hold.eventId);
        if (event) {
          event.availableInventory = Math.min(event.totalCapacity, (event.availableInventory || 0) + hold.quantity);
          if (Array.isArray(event.occupiedSeats)) {
            const seatsToFree = new Set([
              ...(hold.rawSeatKeys || []),
              ...(hold.selectedSeats || [])
            ]);
            event.occupiedSeats = event.occupiedSeats.filter(
              s => !seatsToFree.has(s) && !seatsToFree.has(String(s)) && !seatsToFree.has(Number(s))
            );
          }
          eventsChanged = true;
        }
      }
    }

    if (eventsChanged) mockStore.saveEvents(events);
    if (holdsChanged) {
      localStorage.setItem('lnb_mock_holds', JSON.stringify(holds));
    }
  } catch (err) {
    console.error('[LockNBook] Error cleaning expired holds:', err);
  }
}

export async function createHold({ eventId, quantity, selectedSeats = [] }) {
  // Always sweep expired holds first so expired seats are immediately re-claimable
  cleanExpiredHolds();

  try {
    const res = await apiClient.post('/holds', { eventId, quantity, selectedSeats });
    return {
      hold: res.data || res.hold || res,
      isMock: false
    };
  } catch (err) {
    console.warn('[LockNBook API] Real backend holds endpoint offline. Simulating atomic hold in dev adapter.');
    const events = mockStore.getEvents();
    const event = events.find(e => e.id === eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    if (quantity > event.availableInventory) {
      const error = new Error(`Insufficient inventory: only ${event.availableInventory} seats remaining`);
      error.status = 409;
      throw error;
    }

    const coach = event.coach || SL_COACH_CONFIG.defaultCoach;
    const isRailway = event.category === 'trains' || event.coachType === 'SL';

    // Format display labels and rich metadata for blocked seats
    const formattedSeatLabels = selectedSeats.length > 0
      ? selectedSeats.map(s => formatSeatDisplay(s, coach))
      : Array.from({ length: quantity }, (_, i) => `Seat ${i + 1}`);

    const seatDetails = selectedSeats.map(s => {
      try {
        const num = parseInt(s, 10);
        return !isNaN(num) && num >= 1 && num <= 72
          ? seat_info(num, coach)
          : { seat_no: s, display_label: formatSeatDisplay(s, coach) };
      } catch (e) {
        return { seat_no: s, display_label: formatSeatDisplay(s, coach) };
      }
    });

    // Decrement inventory and record occupied seats in mock store
    event.availableInventory -= quantity;
    if (selectedSeats && selectedSeats.length > 0) {
      event.occupiedSeats = Array.from(new Set([
        ...(event.occupiedSeats || []),
        ...selectedSeats
      ]));
    }
    mockStore.saveEvents(events);

    const holdId = 'hld_' + Math.random().toString(36).substring(2, 9);
    // 2.5 minutes TTL (150 seconds, meeting the 2-3 minutes requirement)
    const ttlSeconds = SL_COACH_CONFIG.defaultTtlSeconds;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    const hold = {
      holdId,
      eventId: event.id,
      eventTitle: event.title,
      venue: event.venue,
      date: event.date,
      time: event.time,
      coach: isRailway ? coach : null,
      coachType: event.coachType || null,
      quantity,
      selectedSeats: formattedSeatLabels,
      rawSeatKeys: selectedSeats,
      seatDetails,
      unitPrice: event.price,
      totalAmount: event.price * quantity,
      expiresAt,
      ttlSeconds,
      createdAt: new Date().toISOString(),
      status: 'HELD'
    };

    mockStore.saveHold(hold);
    return { hold, isMock: true };
  }
}

export async function releaseHold(holdId) {
  try {
    const res = await apiClient.post(`/holds/${holdId}/release`, {});
    return { success: true, isMock: false };
  } catch (err) {
    console.warn(`[LockNBook API] Releasing hold ${holdId} in dev adapter`);
    const holds = mockStore.getHolds();
    const hold = holds[holdId];
    if (hold && hold.status === 'HELD') {
      hold.status = 'RELEASED';
      const events = mockStore.getEvents();
      const event = events.find(e => e.id === hold.eventId);
      if (event) {
        event.availableInventory = Math.min(event.totalCapacity, (event.availableInventory || 0) + hold.quantity);
        if (Array.isArray(event.occupiedSeats)) {
          const seatsToFree = new Set([
            ...(hold.rawSeatKeys || []),
            ...(hold.selectedSeats || [])
          ]);
          event.occupiedSeats = event.occupiedSeats.filter(
            s => !seatsToFree.has(s) && !seatsToFree.has(String(s)) && !seatsToFree.has(Number(s))
          );
        }
        mockStore.saveEvents(events);
      }
      mockStore.saveHold(hold);
    }
    cleanExpiredHolds();
    return { success: true, isMock: true };
  }
}

