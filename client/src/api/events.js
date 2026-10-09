import { apiClient } from './client';
import { mockStore } from './mockData';

export async function fetchEvents(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get(`/events${qs}`);
    return { events: res.data || res.events || res, isMock: false };
  } catch (err) {
    // Graceful development fallback
    console.warn('[LockNBook API] Real backend unreachable. Using development fixtures.', err.message);
    let events = mockStore.getEvents();

    if (params.category && params.category !== 'all') {
      events = events.filter(e => e.category === params.category);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      events = events.filter(e => 
        e.title.toLowerCase().includes(q) ||
        (e.artist && e.artist.toLowerCase().includes(q)) ||
        (e.venue && e.venue.toLowerCase().includes(q))
      );
    }
    return { events, isMock: true };
  }
}

export async function fetchEventById(id) {
  try {
    const res = await apiClient.get(`/events/${id}`);
    return { event: res.data || res.event || res, isMock: false };
  } catch (err) {
    console.warn(`[LockNBook API] Fetching event ${id} via dev fixture fallback`);
    const events = mockStore.getEvents();
    const event = events.find(e => e.id === id);
    if (!event) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }
    return { event, isMock: true };
  }
}
