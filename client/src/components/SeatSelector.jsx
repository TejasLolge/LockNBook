import React from 'react';
import { Armchair, Check, X } from 'lucide-react';

export default function SeatSelector({
  event,
  selectedSeats = [],
  onSeatsChange,
  maxAllowed = 4,
  disabled = false
}) {
  const rows = event?.seatRows || ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = event?.seatsPerRow || 8;
  const occupiedSeats = new Set(event?.occupiedSeats || ['A1', 'A2', 'B4', 'B5', 'C8']);

  const getStageLabel = () => {
    switch (event?.category) {
      case 'movies':
        return 'IMAX Curved Screen Front';
      case 'trains':
        return 'Front of Train Car • Direction of Travel';
      case 'buses':
        return 'Front of Coach • Driver Cabin';
      case 'sports':
        return 'Trackside / Pitch Field View';
      default:
        return 'Main Stage / Performance Area';
    }
  };

  const handleSeatClick = (seatId) => {
    if (disabled || occupiedSeats.has(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      onSeatsChange(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= maxAllowed) {
        // Replace first selected seat or prevent
        const next = [...selectedSeats.slice(1), seatId];
        onSeatsChange(next);
      } else {
        onSeatsChange([...selectedSeats, seatId]);
      }
    }
  };

  const aisleIndex = Math.floor(seatsPerRow / 2);

  return (
    <div style={{
      padding: '1.25rem',
      backgroundColor: 'var(--bg-muted)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-light)',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Armchair size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Choose Numbered Seats
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Max {maxAllowed} seats per order
        </span>
      </div>

      {/* Screen / Stage Indicator */}
      <div style={{
        textAlign: 'center',
        margin: '0.5rem auto 1.25rem',
        maxWidth: '380px'
      }}>
        <div style={{
          height: '6px',
          background: 'linear-gradient(90deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.8) 50%, rgba(37,99,235,0.1) 100%)',
          borderRadius: 'var(--radius-full)',
          marginBottom: '0.375rem'
        }} />
        <span style={{
          fontSize: '0.6875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 700,
          color: 'var(--text-muted)'
        }}>
          {getStageLabel()}
        </span>
      </div>

      {/* Seating Grid */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'center',
        marginBottom: '1.25rem',
        overflowX: 'auto',
        padding: '0.25rem 0'
      }}>
        {rows.map((row) => (
          <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '18px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>
              {row}
            </span>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {Array.from({ length: seatsPerRow }, (_, i) => {
                const seatNumber = i + 1;
                const seatId = `${row}${seatNumber}`;
                const isOccupied = occupiedSeats.has(seatId);
                const isSelected = selectedSeats.includes(seatId);
                const isAisle = i === aisleIndex;

                return (
                  <React.Fragment key={seatId}>
                    {isAisle && (
                      <div style={{ width: '14px' }} aria-hidden="true" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleSeatClick(seatId)}
                      disabled={disabled || isOccupied}
                      title={isOccupied ? `Seat ${seatId} (Occupied)` : `Seat ${seatId}`}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        border: '1px solid',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isOccupied ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                        backgroundColor: isSelected
                          ? 'var(--primary)'
                          : isOccupied
                            ? 'var(--border-light)'
                            : 'var(--bg-white)',
                        borderColor: isSelected
                          ? 'var(--primary)'
                          : isOccupied
                            ? 'var(--border-light)'
                            : 'var(--border-hover)',
                        color: isSelected
                          ? '#FFFFFF'
                          : isOccupied
                            ? 'var(--text-muted)'
                            : 'var(--text-main)',
                        boxShadow: isSelected ? '0 2px 6px rgba(37,99,235,0.3)' : 'none'
                      }}
                      aria-label={`Seat ${seatId} ${isOccupied ? 'Unavailable' : isSelected ? 'Selected' : 'Available'}`}
                    >
                      {seatNumber}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            <span style={{ width: '18px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>
              {row}
            </span>
          </div>
        ))}
      </div>

      {/* Seating Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-light)',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: 'var(--bg-white)', border: '1px solid var(--border-hover)' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: 'var(--primary)', border: '1px solid var(--primary)' }} />
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Selected ({selectedSeats.length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: 'var(--border-light)' }} />
          <span>Reserved</span>
        </div>
      </div>

      {/* Selected Seats Badges */}
      {selectedSeats.length > 0 && (
        <div style={{
          marginTop: '0.875rem',
          padding: '0.625rem 0.875rem',
          backgroundColor: 'var(--bg-white)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--primary-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Assigned:
            </span>
            {selectedSeats.map(seat => (
              <span
                key={seat}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.2rem 0.5rem',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Seat {seat}
                <X
                  size={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSeatClick(seat)}
                />
              </span>
            ))}
          </div>

          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {selectedSeats.length} of {maxAllowed} max
          </span>
        </div>
      )}
    </div>
  );
}
