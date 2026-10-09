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

  // Sort events
  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
          Explore Events
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Browse verified events with authoritative inventory and reservation holds.
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
            <ArrowUpDown size={15} />
            <span>Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-input"
            style={{ width: 'auto', height: '38px', padding: '0 0.75rem', fontSize: '0.875rem' }}
          >
            <option value="date">Date (Earliest First)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="title">Title (A &ndash; Z)</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ marginBottom: '2rem' }}>
        <CategoryFilter
          selectedCategory={currentCategory}
          onSelectCategory={handleCategoryChange}
        />
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
          title="No events match your search"
          description="Try modifying your search terms, changing the category, or clearing filters."
          actionLabel="Clear Filters"
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
