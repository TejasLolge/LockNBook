import { apiClient } from './client';
import { mockStore } from './mockData';

export async function createHold({ eventId, quantity }) {
  try {
    const res = await apiClient.post('/holds', { eventId, quantity });
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

    // Decrement inventory in mock store
    event.availableInventory -= quantity;
    mockStore.saveEvents(events);

    const holdId = 'hld_' + Math.random().toString(36).substring(2, 9);
    // Explicit server-style absolute ISO timestamp (300 seconds from now)
    const expiresAt = new Date(Date.now() + 300 * 1000).toISOString();

    const hold = {
      holdId,
      eventId: event.id,
      eventTitle: event.title,
      venue: event.venue,
      date: event.date,
      time: event.time,
      quantity,
      unitPrice: event.price,
      totalAmount: event.price * quantity,
      expiresAt,
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
        event.availableInventory += hold.quantity;
        mockStore.saveEvents(events);
      }
      mockStore.saveHold(hold);
    }
    return { success: true, isMock: true };
  }
}
