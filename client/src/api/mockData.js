/**
 * Clearly Labeled Development Fixtures & In-Memory Fallback Adapter
 * Used ONLY when VITE_API_BASE_URL is offline so the frontend can be developed and demonstrated.
 */

export const MOCK_EVENTS = [
  // 1. CONCERTS & MUSIC
  {
    id: 'ev-101',
    title: 'Neon Horizon: Electronic World Tour',
    artist: 'Aura Collective & Tycho Beats',
    category: 'music',
    city: 'Seattle',
    date: '2026-11-14',
    time: '8:00 PM EST',
    venue: 'CyberSphere Arena, Seattle',
    price: 65,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80',
    description: 'Experience an extraordinary audiovisual spectacle with cutting-edge holographic production, immersive multi-channel sound, and live guest performances.',
    featured: true,
    availableInventory: 32,
    totalCapacity: 40,
    seatRows: ['A', 'B', 'C', 'D', 'E'],
    seatsPerRow: 8,
    occupiedSeats: ['A1', 'A2', 'B4', 'B5', 'C1', 'C8', 'D4', 'E5'],
    tags: ['music', 'concert', 'electronic', 'nightlife']
  },
  {
    id: 'ev-106',
    title: 'Coastal Melodic Sunset Festival',
    artist: 'Rufus Du Sol, Lane 8, Nora En Pure',
    category: 'music',
    city: 'Miami',
    date: '2027-01-09',
    time: '2:00 PM EST',
    venue: 'South Beach Oceanfront Arena, Miami',
    price: 89,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    description: '12-hour open-air oceanfront celebration of melodic house and deep techno as the sun sets over the Atlantic with festival sound design.',
    featured: true,
    availableInventory: 28,
    totalCapacity: 40,
    seatRows: ['A', 'B', 'C', 'D', 'E'],
    seatsPerRow: 8,
    occupiedSeats: ['A3', 'A4', 'B1', 'B2', 'B7', 'C4', 'C5', 'D2', 'D3', 'E8', 'E7', 'A8'],
    tags: ['music', 'festival', 'beach', 'sunset']
  },

  // 2. MOVIES & CINEMA
  {
    id: 'ev-201',
    title: 'Dune: Part Two — IMAX 70mm Special Screening',
    artist: 'Directed by Denis Villeneuve',
    category: 'movies',
    city: 'Los Angeles',
    date: '2026-11-18',
    time: '7:15 PM PST',
    venue: 'Cinema Dome IMAX, Los Angeles',
    price: 24,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-exclusive 70mm IMAX dual-laser projection presentation on North Americas tallest curved screen with laser-aligned acoustic reproduction.',
    featured: true,
    availableInventory: 22,
    totalCapacity: 40,
    seatRows: ['A', 'B', 'C', 'D', 'E'],
    seatsPerRow: 8,
    occupiedSeats: ['B3', 'B4', 'B5', 'B6', 'C3', 'C4', 'C5', 'C6', 'D3', 'D4', 'D5', 'D6', 'A1', 'A8', 'E1', 'E2', 'E7', 'E8'],
    tags: ['movies', 'imax', 'cinema', 'sci-fi']
  },
  {
    id: 'ev-202',
    title: 'Cyberpunk Neo-Tokyo: Redline Premiere',
    artist: 'Studio Trigger & Guests',
    category: 'movies',
    city: 'New York',
    date: '2026-11-25',
    time: '9:00 PM EST',
    venue: 'Metropolis IMAX Theatre, New York',
    price: 28,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    description: 'Exclusive worldwide anime cinematic premiere featuring cast Q&A, limited collector art prints, and high-contrast Dolby Cinema presentation.',
    featured: false,
    availableInventory: 19,
    totalCapacity: 40,
    seatRows: ['A', 'B', 'C', 'D', 'E'],
    seatsPerRow: 8,
    occupiedSeats: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'D1', 'D2', 'A3', 'A4', 'B5', 'B6', 'E3', 'E4'],
    tags: ['movies', 'anime', 'premiere', 'new-york']
  },

  // 3. TRAINS & RAIL TRANSIT
  {
    id: 'ev-301',
    title: 'Apex Bullet Rail: Coastliner Express (SF → LA)',
    artist: 'High-Speed Magnetic Levitation Service',
    category: 'trains',
    city: 'San Francisco',
    date: '2026-11-20',
    time: '6:30 AM PST',
    venue: 'Transbay Transit Center, San Francisco',
    price: 78,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra high-speed express bullet train connection arriving in downtown Los Angeles in under 2 hours 15 minutes. Includes ergonomic reclining seats and onboard fiber Wi-Fi.',
    featured: true,
    availableInventory: 26,
    totalCapacity: 40,
    seatRows: ['A', 'B', 'C', 'D', 'E'],
    seatsPerRow: 8,
    occupiedSeats: ['A1', 'A2', 'A7', 'A8', 'B1', 'B8', 'C1', 'C8', 'D1', 'D8', 'E1', 'E2', 'E7', 'E8'],
    tags: ['trains', 'transit', 'high-speed', 'commute']
  },
  {
    id: 'ev-302',
    title: 'Silver Glacier Scenic Vista Panorama Rail',
    artist: 'Rocky Mountain Observation Coach',
    category: 'trains',
    city: 'Denver',
    date: '2026-12-05',
    time: '8:00 AM MST',
    venue: 'Union Station, Denver',
    price: 110,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    description: 'Glass-domed scenic panorama rail winding through snow-capped Continental Divide passes with gourmet mountain breakfast service and observation lounge.',
    featured: false,
    availableInventory: 15,
    totalCapacity: 40,
    seatRows: ['A', 'B', 'C', 'D', 'E'],
    seatsPerRow: 8,
    occupiedSeats: ['A3', 'A4', 'A5', 'A6', 'B3', 'B4', 'B5', 'B6', 'C3', 'C4', 'C5', 'C6', 'D3', 'D4'],
    tags: ['trains', 'scenic', 'luxury', 'mountains']
  },

  // 4. BUSES & LUXURY COACHES
  {
    id: 'ev-401',
    title: 'MetroCruiser Luxury Sleeper Coach (NYC → Boston)',
    artist: 'Executive Direct Overnight Service',
    category: 'buses',
    city: 'New York',
    date: '2026-11-22',
    time: '11:30 PM EST',
    venue: 'Port Authority Midtown Terminal, New York',
    price: 45,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    description: 'Lie-flat memory foam sleeper pods with privacy curtains, personal ambient lighting, noise-canceling headsets, and complimentary morning espresso.',
    featured: true,
    availableInventory: 18,
    totalCapacity: 32,
    seatRows: ['A', 'B', 'C', 'D'],
    seatsPerRow: 8,
    occupiedSeats: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'A7', 'A8', 'B7', 'B8', 'C7', 'C8'],
    tags: ['buses', 'overnight', 'luxury', 'sleeper']
  },
  {
    id: 'ev-402',
    title: 'Pacific Coastliner Express (Seattle → Portland)',
    artist: 'Scenic Interstate Luxury Coach',
    category: 'buses',
    city: 'Seattle',
    date: '2026-11-28',
    time: '9:00 AM PST',
    venue: 'King Street Coach Hub, Seattle',
    price: 36,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    description: 'Direct zero-emissions electric coach connection with extra legroom, USB-C power ports at every seat, and panoramic views of Mount Rainier.',
    featured: false,
    availableInventory: 24,
    totalCapacity: 32,
    seatRows: ['A', 'B', 'C', 'D'],
    seatsPerRow: 8,
    occupiedSeats: ['A3', 'A4', 'B3', 'B4', 'C5', 'C6', 'D7', 'D8'],
    tags: ['buses', 'express', 'eco-friendly', 'travel']
  },

  // 5. SPORTS & MOTORSPORTS
  {
    id: 'ev-103',
    title: 'Apex Grand Prix: Night Drift Championship',
    artist: 'Formula Apex Pro Series',
    category: 'sports',
    city: 'Austin',
    date: '2026-11-21',
    time: '7:30 PM CST',
    venue: 'Circuit of the Americas, Austin',
    price: 95,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    description: 'High-octane championship night racing under floodlights with blistering speeds, smoking tires, and millimeter-precision tandem drift battles.',
    featured: true,
    availableInventory: 14,
    totalCapacity: 40,
    seatRows: ['A', 'B', 'C', 'D', 'E'],
    seatsPerRow: 8,
    occupiedSeats: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2'],
    tags: ['sports', 'racing', 'motorsport', 'drift']
  },
  {
    id: 'ev-501',
    title: 'Continental Cup: Football Championship Final',
    artist: 'FC Barcelona vs Manchester Stars',
    category: 'sports',
    city: 'New York',
    date: '2026-12-19',
    time: '8:00 PM EST',
    venue: 'MetLife Stadium Arena, New York',
    price: 135,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    description: 'The crowning spectacle of club football as two international giants clash for championship silverware in front of 80,000 roaring fans.',
    featured: true,
    availableInventory: 11,
    totalCapacity: 40,
    seatRows: ['A', 'B', 'C', 'D', 'E'],
    seatsPerRow: 8,
    occupiedSeats: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'C1', 'C2', 'C7', 'C8', 'D1'],
    tags: ['sports', 'soccer', 'football', 'championship']
  },

  // 6. LIVE CONFERENCES & THEATRE
  {
    id: 'ev-102',
    title: 'Global AI & Autonomous Agents Summit',
    artist: 'Keynotes by Frontier AI Researchers',
    category: 'conference',
    city: 'San Francisco',
    date: '2026-12-02',
    time: '9:00 AM PST',
    venue: 'Moscone Convention Center, San Francisco',
    price: 180,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    description: 'The premier global convention gathering developers, researchers, and creators building autonomous agentic systems and foundational models.',
    featured: false,
    availableInventory: 18,
    totalCapacity: 40,
    seatRows: ['A', 'B', 'C', 'D', 'E'],
    seatsPerRow: 8,
    occupiedSeats: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2'],
    tags: ['conference', 'tech', 'ai', 'developer']
  },
  {
    id: 'ev-105',
    title: 'Interstellar: Live Symphonic Experience',
    artist: 'Royal Philharmonic Ensemble',
    category: 'theatre',
    city: 'London',
    date: '2026-12-13',
    time: '6:00 PM GMT',
    venue: 'Royal Albert Hall, London',
    price: 85,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    description: 'Hans Zimmers iconic film score performed live in synchronization with 4K IMAX projections and massive pipe organ accompaniment.',
    featured: false,
    availableInventory: 16,
    totalCapacity: 40,
    seatRows: ['A', 'B', 'C', 'D', 'E'],
    seatsPerRow: 8,
    occupiedSeats: ['A4', 'A5', 'B4', 'B5', 'C4', 'C5', 'D4', 'D5', 'E4', 'E5', 'B1', 'B8', 'C1', 'C8'],
    tags: ['theatre', 'symphony', 'orchestra', 'classical']
  },
  {
    id: 'ev-104',
    title: 'Late Night Comedy Showcase',
    artist: 'Hasan Minhaj & Standup Friends',
    category: 'comedy',
    city: 'New York',
    date: '2026-11-27',
    time: '8:30 PM EST',
    venue: 'Beacon Theatre, New York',
    price: 55,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    description: 'An evening of razor-sharp storytelling, social commentary, and unfiltered stand-up comedy with surprise guest headliners.',
    featured: false,
    availableInventory: 8,
    totalCapacity: 40,
    seatRows: ['A', 'B', 'C', 'D', 'E'],
    seatsPerRow: 8,
    occupiedSeats: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'C1', 'C2', 'C3', 'C4'],
    tags: ['comedy', 'standup', 'live', 'humor']
  }
];

// Persistent state in memory/localStorage for mock mode
export const mockStore = {
  getEvents() {
    const stored = localStorage.getItem('lnb_mock_events_v2');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= MOCK_EVENTS.length) {
          return parsed;
        }
      } catch (e) { /* fallback */ }
    }
    localStorage.setItem('lnb_mock_events_v2', JSON.stringify(MOCK_EVENTS));
    return MOCK_EVENTS;
  },
  saveEvents(events) {
    localStorage.setItem('lnb_mock_events_v2', JSON.stringify(events));
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
