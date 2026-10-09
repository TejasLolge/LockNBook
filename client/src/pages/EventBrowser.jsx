import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchEvents } from '../api/events';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useWishlist } from '../context/WishlistContext';
import {
  ArrowUpDown,
  Sparkles,
  Heart,
  MapPin,
  DollarSign,
  Compass,
  SlidersHorizontal,
  RotateCcw,
  Check
} from 'lucide-react';

export default function EventBrowser() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist, isWishlisted, interests, savedCount } = useWishlist();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'date';
  const currentTab = searchParams.get('tab') || 'all'; // 'all' | 'recommendations' | 'saved'
  const currentCity = searchParams.get('city') || 'all';
  const currentPrice = searchParams.get('price') || 'all'; // 'all' | 'under50' | '50to100' | 'over100'

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchEvents({
        category: currentCategory,
        search: currentSearch
      });
      setEvents(res.events || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch events from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentCategory, currentSearch]);

  const handleCategoryChange = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'all') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    setSearchParams(params);
  };

  const handleSearchChange = (query) => {
    const params = new URLSearchParams(searchParams);
    if (!query) {
      params.delete('search');
    } else {
      params.set('search', query);
    }
    setSearchParams(params);
  };

  const handleTabChange = (tabId) => {
    const params = new URLSearchParams(searchParams);
    if (tabId === 'all') {
      params.delete('tab');
    } else {
      params.set('tab', tabId);
    }
    setSearchParams(params);
  };

  const handleCityChange = (cityName) => {
    const params = new URLSearchParams(searchParams);
    if (cityName === 'all') {
      params.delete('city');
    } else {
      params.set('city', cityName);
    }
    setSearchParams(params);
  };

  const handlePriceChange = (priceTier) => {
    const params = new URLSearchParams(searchParams);
    if (priceTier === 'all') {
      params.delete('price');
    } else {
      params.set('price', priceTier);
    }
    setSearchParams(params);
  };

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
    setSortDropdownOpen(false);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    if (currentTab !== 'all') {
      params.set('tab', currentTab);
    }
    setSearchParams(params);
  };

  // Derive all unique cities from dataset
  const availableCities = useMemo(() => {
    const defaults = ['New York', 'San Francisco', 'Seattle', 'Austin', 'Los Angeles', 'London', 'Miami', 'Denver'];
    const eventCities = events.map(e => e.city).filter(Boolean);
    const set = new Set([...defaults, ...eventCities]);
    return Array.from(set).sort();
  }, [events]);

  // Filter events based on active tab, city, and price range
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // 1. Tab filter
      if (currentTab === 'saved') {
        if (!isWishlisted(e.id)) return false;
      } else if (currentTab === 'recommendations') {
        if (interests && interests.length > 0 && !interests.includes(e.category)) {
          return false;
        }
      }

      // 2. City filter
      if (currentCity !== 'all' && e.city) {
        if (e.city.toLowerCase() !== currentCity.toLowerCase()) return false;
      }

      // 3. Price filter
      if (currentPrice === 'under50' && e.price >= 50) return false;
      if (currentPrice === '50to100' && (e.price < 50 || e.price > 100)) return false;
      if (currentPrice === 'over100' && e.price <= 100) return false;

      return true;
    });
  }, [events, currentTab, currentCity, currentPrice, isWishlisted, interests]);

  // Sort events
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      if (currentSort === 'price-asc') return a.price - b.price;
      if (currentSort === 'price-desc') return b.price - a.price;
      if (currentSort === 'inventory') {
        const aInv = a.availableInventory ?? 999;
        const bInv = b.availableInventory ?? 999;
        return aInv - bInv;
      }
      if (currentSort === 'title') return a.title.localeCompare(b.title);
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [filteredEvents, currentSort]);

  const sortOptions = [
    { id: 'date', label: 'Date (Upcoming First)' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
    { id: 'inventory', label: 'Selling Fast (Fewest Left)' },
    { id: 'title', label: 'Title (A – Z)' }
  ];

  const currentSortLabel = sortOptions.find(o => o.id === currentSort)?.label || 'Date (Upcoming First)';

  const hasActiveFilters = currentCategory !== 'all' || currentSearch || currentCity !== 'all' || currentPrice !== 'all';

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '2.125rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', marginBottom: '0.375rem' }}>
          Discover Experiences & Transit
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Browse bullet trains, luxury buses, blockbuster movies, concerts, and live sports with instant concurrency holds.
        </p>
      </div>

      {/* Discovery Tabs: All Events / Smart Discovery / Saved Wishlist */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '2px solid var(--border-light)',
        marginBottom: '1.75rem',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => handleTabChange('all')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.125rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9375rem',
            fontWeight: currentTab === 'all' ? 700 : 500,
            color: currentTab === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: currentTab === 'all' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Compass size={17} />
          <span>All Experiences</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: currentTab === 'all' ? 'var(--primary-light)' : 'var(--bg-light)',
            color: currentTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700
          }}>
            {events.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('recommendations')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.125rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9375rem',
            fontWeight: currentTab === 'recommendations' ? 700 : 500,
            color: currentTab === 'recommendations' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: currentTab === 'recommendations' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Sparkles size={17} color={currentTab === 'recommendations' ? 'var(--primary)' : 'var(--text-secondary)'} />
          <span>Recommended For You</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: currentTab === 'recommendations' ? 'var(--primary-light)' : 'var(--bg-light)',
            color: currentTab === 'recommendations' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700
          }}>
            {interests.length} Interests
          </span>
        </button>

        <button
          onClick={() => handleTabChange('saved')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.125rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9375rem',
            fontWeight: currentTab === 'saved' ? 700 : 500,
            color: currentTab === 'saved' ? '#e11d48' : 'var(--text-secondary)',
            borderBottom: currentTab === 'saved' ? '2.5px solid #e11d48' : '2.5px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Heart size={17} fill={currentTab === 'saved' ? '#e11d48' : 'none'} color={currentTab === 'saved' ? '#e11d48' : 'var(--text-secondary)'} />
          <span>Saved Wishlist</span>
          {savedCount > 0 && (
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: '#ffe4e6',
              color: '#e11d48',
              fontWeight: 700
            }}>
              {savedCount}
            </span>
          )}
        </button>
      </div>

      {/* Recommendations Active Banner */}
      {currentTab === 'recommendations' && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.875rem', color: '#1e3a8a', fontWeight: 600 }}>
              Personalized based on your preferred interests:
            </span>
            <div style={{ display: 'inline-flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {interests.map(i => (
                <span key={i} style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  backgroundColor: 'var(--bg-white)',
                  color: 'var(--primary)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  border: '1px solid #bfdbfe'
                }}>
                  {i}
                </span>
              ))}
            </div>
          </div>
          <Link
            to="/profile"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textDecoration: 'underline'
            }}
          >
            Customize Interests in Profile &rarr;
          </Link>
        </div>
      )}

      {/* Saved Wishlist Banner */}
      {currentTab === 'saved' && (
        <div style={{
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={18} fill="#e11d48" color="#e11d48" />
            <span style={{ fontSize: '0.875rem', color: '#9f1239', fontWeight: 600 }}>
              Showing {filteredEvents.length} bookmarked item{filteredEvents.length === 1 ? '' : 's'}. Click the heart icon on any card to add or remove items.
            </span>
          </div>
        </div>
      )}

      {/* Top Filter & Search Controls Bar */}
      <div style={{
        backgroundColor: 'var(--bg-white)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Search Bar */}
          <div style={{ flex: '1 1 300px' }}>
            <SearchBar
              value={currentSearch}
              onChange={handleSearchChange}
              placeholder="Search experiences, artist, route, or venue..."
            />
          </div>

          {/* Quick Select Filters: City & Price & Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* City Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <MapPin size={16} color="var(--text-secondary)" />
              <select
                value={currentCity}
                onChange={(e) => handleCityChange(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: currentCity !== 'all' ? 'var(--primary-light)' : 'var(--bg-white)',
                  color: currentCity !== 'all' ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: currentCity !== 'all' ? 700 : 500,
                  fontSize: '0.875rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Cities</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <DollarSign size={16} color="var(--text-secondary)" />
              <select
                value={currentPrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: currentPrice !== 'all' ? 'var(--primary-light)' : 'var(--bg-white)',
                  color: currentPrice !== 'all' ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: currentPrice !== 'all' ? 700 : 500,
                  fontSize: '0.875rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Price Ranges</option>
                <option value="under50">Under $50</option>
                <option value="50to100">$50 &ndash; $100</option>
                <option value="over100">$100+</option>
              </select>
            </div>

            {/* Sort Dropdown Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="btn btn-secondary"
                style={{
                  gap: '0.5rem',
                  borderColor: currentSort !== 'date' ? 'var(--primary-border)' : 'var(--border-light)',
                  backgroundColor: currentSort !== 'date' ? 'var(--primary-light)' : 'var(--bg-white)',
                  color: currentSort !== 'date' ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
                aria-expanded={sortDropdownOpen}
              >
                <ArrowUpDown size={15} color={currentSort !== 'date' ? 'var(--primary)' : 'var(--text-secondary)'} />
                <span>Sort: <strong>{currentSortLabel}</strong></span>
                <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>▼</span>
              </button>

              {sortDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 6px)',
                  zIndex: 30,
                  backgroundColor: 'var(--bg-white)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-modal)',
                  minWidth: '240px',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    padding: '0.375rem 0.625rem',
                    borderBottom: '1px solid var(--border-light)',
                    marginBottom: '0.25rem'
                  }}>
                    Sort Options
                  </div>
                  {sortOptions.map(opt => {
                    const isSelected = currentSort === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSortChange(opt.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check size={16} color="var(--primary)" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Quick Sort Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <CategoryFilter
          selectedCategory={currentCategory}
          onSelectCategory={handleCategoryChange}
        />

        {/* Quick Sort Action Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Quick Sort:
          </span>
          <button
            onClick={() => handleSortChange('price-asc')}
            className={`btn btn-sm ${currentSort === 'price-asc' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
          >
            Price: Low &rarr; High
          </button>
          <button
            onClick={() => handleSortChange('price-desc')}
            className={`btn btn-sm ${currentSort === 'price-desc' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
          >
            Price: High &rarr; Low
          </button>
          <button
            onClick={() => handleSortChange('inventory')}
            className={`btn btn-sm ${currentSort === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
          >
            🔥 Selling Fast
          </button>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {hasActiveFilters && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          <span>Active filters:</span>
          {currentCategory !== 'all' && (
            <span className="badge badge-neutral">Category: {currentCategory}</span>
          )}
          {currentSearch && (
            <span className="badge badge-neutral">Search: &ldquo;{currentSearch}&rdquo;</span>
          )}
          {currentCity !== 'all' && (
            <span className="badge badge-neutral">City: {currentCity}</span>
          )}
          {currentPrice !== 'all' && (
            <span className="badge badge-neutral">Price: {currentPrice === 'under50' ? '< $50' : currentPrice === '50to100' ? '$50–$100' : '$100+'}</span>
          )}
          <button
            onClick={handleClearFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: 600,
              marginLeft: '0.5rem',
              textDecoration: 'underline'
            }}
          >
            <RotateCcw size={13} />
            <span>Clear filters</span>
          </button>
        </div>
      )}

      {/* Results Content */}
      {loading && <LoadingState message="Discovering live experiences..." />}
      {error && <ErrorMessage message={error} onRetry={loadEvents} />}

      {!loading && !error && sortedEvents.length === 0 && (
        <>
          {currentTab === 'saved' ? (
            <EmptyState
              title="Your Wishlist is Empty"
              description="You have not saved any experiences yet. Browse our live concerts, bullet trains, movies, or sports events and click the heart icon on any card to save it."
              actionLabel="Browse All Experiences"
              onAction={() => handleTabChange('all')}
            />
          ) : currentTab === 'recommendations' ? (
            <EmptyState
              title="No Recommendations Found"
              description="We couldn't find events matching your active filters within your selected categories. Try clearing active filters or adjusting your interests in your Profile."
              actionLabel="Customize Interests"
              onAction={() => { window.location.hash = '#/profile'; }}
            />
          ) : (
            <EmptyState
              title="No Matching Events Found"
              description="We couldn't find any events or transit tickets matching your current search or filters. Try adjusting your query or resetting filters."
              actionLabel="Reset All Filters"
              onAction={handleClearFilters}
            />
          )}
        </>
      )}

      {!loading && !error && sortedEvents.length > 0 && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            <span>Showing <strong>{sortedEvents.length}</strong> available experience{sortedEvents.length === 1 ? '' : 's'}</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.75rem'
          }}>
            {sortedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

