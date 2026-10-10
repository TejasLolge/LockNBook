
import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import './EngineeringDashboard.css';

const EMPTY_METRICS = {
  totalInventory: null,
  availableInventory: null,
  heldInventory: null,
  confirmedBookings: null,
  totalRequests: null,
  latencyMs: null,
  throughput: null,
};

function MetricCard({ label, value, unit = '' }) {
  return (
    <article className="engineering-metric">
      <p className="engineering-metric__label">{label}</p>
      <p className="engineering-metric__value">
        {value == null ? '—' : `${value}${unit}`}
      </p>
    </article>
  );
}

export default function EngineeringDashboard() {
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');

  const refreshMetrics = useCallback(async () => {
    setStatus('checking');
    setError('');

    try {
      const result = await apiClient.get(
        '/admin/metrics',
        {},
        { skipCache: true, timeout: 5000 }
      );

      const data = result?.data ?? result?.metrics ?? result;

      setMetrics({
        totalInventory: data?.totalInventory ?? data?.inventory?.total ?? null,
        availableInventory: data?.availableInventory ?? data?.inventory?.available ?? null,
        heldInventory: data?.heldInventory ?? data?.inventory?.held ?? null,
        confirmedBookings:
          data?.confirmedBookings ?? data?.bookings?.confirmed ?? null,
        totalRequests: data?.totalRequests ?? data?.requests?.total ?? null,
        latencyMs: data?.latencyMs ?? data?.latency?.averageMs ?? null,
        throughput: data?.throughput ?? data?.requestsPerSecond ?? null,
      });

      setStatus('connected');
    } catch (err) {
      setMetrics(EMPTY_METRICS);
      setStatus('disconnected');
      setError(err.message || 'Unable to retrieve metrics.');
    }
  }, []);

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  return (
    <main className="engineering-dashboard">
      <header className="engineering-dashboard__header">
        <div>
          <p className="engineering-dashboard__eyebrow">LOCKNBOOK / ENGINEERING</p>
          <h1>System Dashboard</h1>
          <p>Reservation inventory and system performance.</p>
        </div>

        <button
          type="button"
          className="engineering-dashboard__refresh"
          onClick={refreshMetrics}
          disabled={status === 'checking'}
        >
          {status === 'checking' ? 'Checking…' : 'Refresh metrics'}
        </button>
      </header>

      <section
        className={`engineering-dashboard__status engineering-dashboard__status--${status}`}
        aria-live="polite"
      >
        <span className="engineering-dashboard__status-dot" />
        {status === 'connected' && 'Metrics API connected'}
        {status === 'checking' && 'Connecting to metrics API…'}
        {status === 'disconnected' && 'Metrics API unavailable'}
      </section>

      {error && (
        <p className="engineering-dashboard__error" role="alert">
          {error}. Values are unavailable, not zero.
        </p>
      )}

      <section className="engineering-dashboard__grid" aria-label="System metrics">
        <MetricCard label="Total inventory" value={metrics.totalInventory} />
        <MetricCard label="Available tickets" value={metrics.availableInventory} />
        <MetricCard label="Held tickets" value={metrics.heldInventory} />
        <MetricCard label="Confirmed bookings" value={metrics.confirmedBookings} />
        <MetricCard label="Total requests" value={metrics.totalRequests} />
        <MetricCard label="Average latency" value={metrics.latencyMs} unit=" ms" />
        <MetricCard label="Throughput" value={metrics.throughput} unit=" req/s" />
      </section>

      <p className="engineering-dashboard__note">
        Metrics are populated only from the API response. A successful response
        with an unrecognized schema will leave the corresponding values unavailable.
      </p>
    </main>
  );
}
