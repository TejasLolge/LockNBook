/**
 * Clearly Labeled Development Fixtures & In-Memory Fallback Adapter
 * Used ONLY when VITE_API_BASE_URL is offline so the frontend can be developed and demonstrated.
 */

export const MOCK_EVENTS = [
  {
    id: 'ev-101',
    title: 'Neon Horizon: Electronic World Tour',
    artist: 'Aura Collective & Tycho Beats',
    category: 'music',
    date: '2026-11-14',
    time: '8:00 PM EST',
    venue: 'CyberSphere Arena, Seattle',
    price: 65,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80',
    description: 'Experience an extraordinary audiovisual spectacle with cutting-edge holographic production, immersive multi-channel sound, and live guest performances.',
    featured: true,
    availableInventory: 42,
    totalCapacity: 100
  },
  {
    id: 'ev-102',
    title: 'Global AI & Autonomous Agents Summit',
    artist: 'Keynotes by Frontier AI Researchers',
    category: 'conference',
    date: '2026-12-02',
    time: '9:00 AM PST',
    venue: 'Moscone Convention Center, San Francisco',
    price: 180,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    description: 'The premier global convention gathering developers, researchers, and creators building autonomous agentic systems and foundational models.',
    featured: true,
    availableInventory: 18,
    totalCapacity: 80
  },
  {
    id: 'ev-103',
    title: 'Apex Grand Prix: Night Drift Championship',
    artist: 'Formula Apex Pro Series',
    category: 'sports',
    date: '2026-11-21',
    time: '7:30 PM CST',
    venue: 'Circuit of the Americas, Austin',
    price: 95,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    description: 'High-octane championship night racing under floodlights with blistering speeds and precision drift battles.',
    featured: false,
    availableInventory: 12,
    totalCapacity: 60
  },
  {
    id: 'ev-104',
    title: 'Late Night Comedy Showcase',
    artist: 'Hasan Minhaj & Friends',
    category: 'comedy',
    date: '2026-11-27',
    time: '8:30 PM EST',
    venue: 'Beacon Theatre, New York',
    price: 55,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    description: 'An evening of razor-sharp storytelling, social commentary, and unfiltered stand-up comedy.',
    featured: false,
    availableInventory: 5,
    totalCapacity: 50
  },
  {
    id: 'ev-105',
    title: 'Interstellar: Live Symphonic Experience',
    artist: 'Royal Philharmonic Ensemble',
    category: 'theatre',
    date: '2026-12-13',
    time: '6:00 PM GMT',
    venue: 'Royal Albert Hall, London',
    price: 85,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    description: 'Hans Zimmers iconic film score performed live in synchronization with 4K IMAX cinematic projections.',
    featured: false,
    availableInventory: 8,
    totalCapacity: 70
  },
  {
    id: 'ev-106',
    title: 'Coastal Melodic Sunset Festival',
    artist: 'Rufus Du Sol, Lane 8, Nora En Pure',
    category: 'music',
    date: '2027-01-09',
    time: '2:00 PM EST',
    venue: 'South Beach Arena, Miami',
    price: 89,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    description: '12-hour open-air oceanfront celebration of melodic house and deep techno as the sun sets over the Atlantic.',
    featured: false,
    availableInventory: 35,
    totalCapacity: 120
  }
];

// Persistent state in memory/localStorage for mock mode
export const mockStore = {
  getEvents() {
    const stored = localStorage.getItem('lnb_mock_events');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { /* fallback */ }
    }
    localStorage.setItem('lnb_mock_events', JSON.stringify(MOCK_EVENTS));
    return MOCK_EVENTS;
  },
  saveEvents(events) {
    localStorage.setItem('lnb_mock_events', JSON.stringify(events));
  },
  getHolds() {
    try {
      return JSON.parse(localStorage.getItem('lnb_mock_holds')) || {};
    } catch (e) {
      return {};
    }
  },
  saveHold(hold) {
    const holds = this.getHolds();
    holds[hold.holdId] = hold;
    localStorage.setItem('lnb_mock_holds', JSON.stringify(holds));
  },
  getBookings() {
    try {
      return JSON.parse(localStorage.getItem('lnb_mock_bookings')) || [];
    } catch (e) {
      return [];
    }
  },
  saveBooking(booking) {
    const list = this.getBookings();
    list.unshift(booking);
    localStorage.setItem('lnb_mock_bookings', JSON.stringify(list));
  }
};
