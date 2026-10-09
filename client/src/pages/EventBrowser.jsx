import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchEvents } from '../api/events';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { ArrowUpDown } from 'lucide-react';

export default function EventBrowser() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date');

  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';

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

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const currentSort = searchParams.get('sort') || 'date';
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
    setSortDropdownOpen(false);
  };

  // Sort events with comprehensive criteria
  const sortedEvents = [...events].sort((a, b) => {
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

  const sortOptions = [
    { id: 'date', label: 'Date (Upcoming First)' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
    { id: 'inventory', label: 'Selling Fast (Fewest Left)' },
    { id: 'title', label: 'Title (A – Z)' }
  ];

  const currentSortLabel = sortOptions.find(o => o.id === currentSort)?.label || 'Date (Upcoming First)';

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
          Discover Live Experiences
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Browse high-demand concerts, festivals, and tech summits with guaranteed concurrency holds.
        </p>
      </div>

      {/* Filter & Search Bar Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '1.5rem',
        backgroundColor: 'var(--bg-white)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <SearchBar
          value={currentSearch}
          onChange={handleSearchChange}
          placeholder="Filter by title, artist, or venue..."
        />

        {/* Interactive Sort Button & Dropdown */}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="btn btn-secondary"
            style={{
              gap: '0.5rem',
              borderColor: currentSort !== 'date' ? 'var(--primary-border)' : 'var(--border-light)',
              backgroundColor: currentSort !== 'date' ? 'var(--primary-light)' : 'var(--bg-white)',
              color: currentSort !== 'date' ? 'var(--primary)' : 'var(--text-main)',
              fontWeight: 600
            }}
            aria-expanded={sortDropdownOpen}
          >
            <ArrowUpDown size={16} color={currentSort !== 'date' ? 'var(--primary)' : 'var(--text-secondary)'} />
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
                Sort Events By
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
                    {isSelected && <span style={{ color: 'var(--primary)', fontWeight: 800 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
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
      {(currentCategory !== 'all' || currentSearch) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          <span>Showing results for:</span>
          {currentCategory !== 'all' && (
            <span className="badge badge-neutral">Category: {currentCategory}</span>
          )}
          {currentSearch && (
            <span className="badge badge-neutral">Search: &ldquo;{currentSearch}&rdquo;</span>
          )}
          <button
            onClick={handleClearFilters}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: 600,
              marginLeft: '0.5rem',
              textDecoration: 'underline'
            }}
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Results Content */}
      {loading && <LoadingState message="Loading events..." />}
      {error && <ErrorMessage message={error} onRetry={loadEvents} />}

      {!loading && !error && sortedEvents.length === 0 && (
        <EmptyState
          title="No Matching Events Found"
          description="We couldn't find any live events matching your search or filters. Try adjusting your query or resetting all filters."
          actionLabel="Reset All Filters"
          onAction={handleClearFilters}
        />
      )}

      {!loading && !error && sortedEvents.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.75rem'
        }}>
          {sortedEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
