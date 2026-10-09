# 🎟️ LockNBook — High-Concurrency Ticket Reservation Platform

> **Fair-Queue Ticket Booking &bull; Authoritative Backend Inventory &bull; Zero Overselling Guarantee**

LockNBook is an event ticket-booking platform backed by a distributed concurrency-safe reservation engine. Built for high-demand concerts, conferences, and sports events where tickets sell out within seconds.

---

## 👥 Team Responsibilities (20-Hour Sprint)

| Member | Track | Scope & Responsibilities |
| :--- | :--- | :--- |
| **Tanishq** | **Team Lead & Architecture** | GitHub coordination, API contracts, engineering dashboard, final integration, and deployment. |
| **Vaibhav** | **Backend & Reservation Engine** | Node.js/Express API, Redis atomic holds, PostgreSQL persistence, TTL expiration, and cancellation. |
| **Tejas** | **Customer-Facing React Frontend** | UI/UX design, clean white background theme, routing, API client layer, checkout countdown, and ticket passes. |
| **Sarthak** | **Load Testing & Verification** | Python test harness simulating 50+ concurrent requests, latency/throughput measurement, and zero overselling proof. |

---

## 🎨 Design System — Clean White Theme

The frontend features a clean, minimal, professional travel & ticketing aesthetic inspired by modern booking platforms (Booking.com, Airbnb, Eventbrite):

- **Background Palette**: White (`#FFFFFF`) and soft slate neutral (`#F8FAFC`, `#F1F5F9`) surfaces.
- **Primary Action Color**: Royal Blue (`#2563EB`) with accessible hover and focus rings.
- **Typography**: Dark, high-contrast Slate 900 (`#0F172A`) and Slate 600 (`#475569`) with `Inter` / system stack.
- **Card Styling**: Subtle borders (`#E2E8F0`), generous whitespace, and soft hover elevations.
- **Accessible Indicators**: Statuses are never communicated by color alone; every state includes semantic Lucide icons and text descriptions.

---

## 🔒 Concurrency & Reservation Rules

1. **Authoritative Backend**: The backend is the sole source of truth for inventory and ticket validity. The frontend never fabricates remaining ticket counts or booking confirmations.
2. **Server-Backed Absolute Expiry**: The checkout countdown timer calculates remaining seconds strictly from the server's ISO/Unix `expiresAt` timestamp.
3. **Atomic Holds**: Reserving tickets locks seats on the server (`POST /api/holds`). If inventory is unavailable, the user is visibly notified.
4. **Idempotency Protection**: Every checkout session receives a unique `Idempotency-Key` preventing duplicate charges or race conditions from rapid double-clicks.
5. **Verified Confirmation**: Navigating to `/confirmation/:bookingId` fetches and verifies the record against the backend before rendering success.

---

## 📁 Repository Structure

```text
locknbook/
├── .gitignore                      # Git ignore rules for node_modules, dist, env
├── README.md                       # Complete documentation & sprint guide
└── client/                         # Tejas: Customer-Facing React Application
    ├── public/                     # Static public assets
    ├── src/
    │   ├── api/                    # Centralized API client layer
    │   │   ├── client.js           # Native fetch wrapper with auth headers
    │   │   ├── events.js           # Event listing & detail endpoints
    │   │   ├── holds.js            # Atomic reservation hold & release
    │   │   ├── bookings.js         # Confirm booking, list passes, cancel
    │   │   ├── auth.js             # User login, register, session handling
    │   │   └── mockData.js         # Clearly labeled dev fixtures (offline fallback)
    │   ├── components/             # Reusable shared UI components
    │   │   ├── Navbar.jsx          # Header with branding & active hold indicator
    │   │   ├── Footer.jsx          # Footer with platform guarantees & links
    │   │   ├── EventCard.jsx       # Event card with pricing & availability badge
    │   │   ├── SearchBar.jsx       # Search input with clear button
    │   │   ├── CategoryFilter.jsx  # Category pills (Music, Tech, Sports, Comedy)
    │   │   ├── QuantitySelector.jsx# Ticket quantity stepper (min 1, max allowed)
    │   │   ├── CountdownTimer.jsx  # Live countdown from server expiresAt
    │   │   ├── BookingStatusBadge.jsx # Status badge (Confirmed, Held, Cancelled)
    │   │   ├── OrderSummary.jsx    # Subtotal, fee breakdown, and total calculation
    │   │   ├── EmptyState.jsx      # Empty state illustration & actions
    │   │   ├── ErrorMessage.jsx    # Error state with retry action
    │   │   ├── LoadingState.jsx    # Spinner loading indicator
    │   │   └── Skeleton.jsx        # Content loading skeleton placeholder
    │   ├── context/
    │   │   ├── AuthContext.jsx     # User authentication state provider
    │   │   └── HoldContext.jsx     # Active hold session state provider
    │   ├── pages/                  # Route views
    │   │   ├── Home.jsx            # Hero search, guarantees, featured events
    │   │   ├── EventBrowser.jsx    # Filterable, searchable, sortable event grid
    │   │   ├── EventDetails.jsx    # Event specs, pricing, quantity, hold CTA
    │   │   ├── Login.jsx           # Sign in with password toggle & demo login
    │   │   ├── Register.jsx        # Account registration with validation
    │   │   ├── Checkout.jsx        # Countdown timer, payment simulation, hold check
    │   │   ├── BookingConfirmation.jsx # Verified pass with reference ID & print action
    │   │   └── MyBookings.jsx      # Ticket pass history & backend cancellation
    │   ├── App.jsx                 # Router config & layout shell
    │   ├── main.jsx                # React DOM entry point
    │   └── index.css               # Clean white theme design tokens & styles
    ├── .env.example                # Example environment variables
    ├── index.html                  # HTML entry point
    ├── package.json                # React 18, Vite, React Router, Lucide React
    └── vite.config.js              # Vite bundler configuration
```

---

## 🚦 Required Pages & Routes

| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/` | `Home` | Hero search, platform guarantees, featured events, quick categories. |
| `/events` | `EventBrowser` | Search by query, category pills, sorting (price, date, title), empty/error states. |
| `/events/:id` | `EventDetails` | Event overview, real-time availability, ticket quantity selector, order summary, reserve button. |
| `/login` | `Login` | Email & password form with visibility toggle, validation, redirect handling, 1-click demo login. |
| `/register` | `Register` | Name, email, password confirmation, validation rules. |
| `/checkout` | `Checkout` | Real-time countdown timer using server `expiresAt`, idempotency protection, payment confirmation. |
| `/confirmation/:bookingId` | `BookingConfirmation` | Verified confirmation screen with booking reference, ticket summary, and print pass action. |
| `/my-bookings` | `MyBookings` | Upcoming and confirmed passes, status badges, cancellation that restores server inventory. |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24.21.0)
- `pnpm` (or `npm`)

### 1. Installation
Navigate into the `client` folder and install dependencies:
```bash
cd client
pnpm install
# or: npm install
```

### 2. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Default value:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
*(Note: If the backend is not running, the client seamlessly uses its clearly labeled development fixtures so you can test all flows without errors).*

### 3. Start Development Server
```bash
pnpm dev
# or: npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 4. Build for Production
```bash
pnpm build
# or: npm run build
```

---

## 🐙 How to Push to GitHub

To push this frontend codebase to your team's GitHub repository:

```bash
# Initialize git if not already initialized
git init

# Add remote repository
git remote add origin https://github.com/YOUR_TEAM_OR_ORG/locknbook.git

# Stage all files
git add .

# Commit your changes
git commit -m "feat(frontend): complete React customer-facing ticketing app with white theme"

# Push to your branch (e.g. tejas-frontend or main)
git branch -M main
git push -u origin main
```

---

## 🛡️ Integration Verification Checklist

- [x] React 18 + Vite development setup tested and builds in 6s.
- [x] All 8 required routes implemented with clean page transitions.
- [x] Clean white & light-grey design theme matching travel booking platforms.
- [x] Native `fetch` centralized in `src/api/` with `VITE_API_BASE_URL`.
- [x] Server-driven countdown timer based strictly on `expiresAt`.
- [x] Idempotency keys attached to booking confirmations.
- [x] Verified booking confirmation and pass printing support.
- [x] Cancellation calls backend endpoint and refetches updated status.
