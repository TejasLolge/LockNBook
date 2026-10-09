import React from 'react';
import { Armchair, Check, X, ShieldAlert, Train } from 'lucide-react';
import {
  SL_COACH_CONFIG,
  seat_info,
  formatSeatDisplay,
  BERTH_COLOR_PALETTE,
  SL_BAY_BERTH_MAP
} from '../api/railwaySeatEngine';

export default function SeatSelector({
  event,
  selectedSeats = [],
  onSeatsChange,
  maxAllowed = 4,
  disabled = false
}) {
  const isRailway = event?.category === 'trains' || event?.coachType === 'SL';
  const coach = event?.coach || SL_COACH_CONFIG.defaultCoach;
  const occupiedSeats = new Set(event?.occupiedSeats || []);

  const handleSeatClick = (seatId) => {
    if (disabled) return;

    // Normalize seatId for membership checking
    const seatIdNum = typeof seatId === 'number' ? seatId : parseInt(seatId, 10);
    const isOccupied = occupiedSeats.has(seatId) ||
                       occupiedSeats.has(String(seatId)) ||
                       (!isNaN(seatIdNum) && occupiedSeats.has(seatIdNum));

    if (isOccupied) return;

    const alreadySelected = selectedSeats.some(s => s === seatId || String(s) === String(seatId));

    if (alreadySelected) {
      onSeatsChange(selectedSeats.filter(s => s !== seatId && String(s) !== String(seatId)));
    } else {
      if (selectedSeats.length >= maxAllowed) {
        // Shift oldest selected seat
        const next = [...selectedSeats.slice(1), seatId];
        onSeatsChange(next);
      } else {
        onSeatsChange([...selectedSeats, seatId]);
      }
    }
  };

  // -------------------------------------------------------------
  // RAILWAY SLEEPER (SL) COACH 72-BERTH 9-BAY RENDERER
  // -------------------------------------------------------------
  if (isRailway) {
    const bays = Array.from({ length: SL_COACH_CONFIG.totalBays }, (_, i) => i + 1);

    return (
      <div style={{
        padding: '1.25rem',
        backgroundColor: 'var(--bg-muted)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        marginBottom: '1.5rem'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Train size={18} color="var(--primary)" />
            <div>
              <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Coach {coach} &bull; Sleeper (SL) Class
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                (72 Berths &bull; 9 Bays)
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Max {maxAllowed} berths per transaction
          </span>
        </div>

        {/* Coach Direction Banner */}
        <div style={{
          textAlign: 'center',
          margin: '0.25rem auto 1rem',
          maxWidth: '460px'
        }}>
          <div style={{
            height: '5px',
            background: 'linear-gradient(90deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.7) 50%, rgba(37,99,235,0.1) 100%)',
            borderRadius: 'var(--radius-full)',
            marginBottom: '0.25rem'
          }} />
          <span style={{
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'var(--text-muted)'
          }}>
            &larr; Engine / Corridor Side &bull; Direction of Travel &rarr;
          </span>
        </div>

        {/* Berth Type Color Legend */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--bg-white)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          fontSize: '0.6875rem'
        }}>
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Berth Types:</span>
          {Object.entries({
            LB: 'Lower (LB)',
            MB: 'Middle (MB)',
            UB: 'Upper (UB)',
            SL: 'Side Lower (SL)',
            SU: 'Side Upper (SU)'
          }).map(([type, label]) => {
            const colors = BERTH_COLOR_PALETTE[type];
            return (
              <span
                key={type}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  fontWeight: 700
                }}
              >
                {label}
              </span>
            );
          })}
        </div>

        {/* 9-Bay Grid Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
          maxHeight: '440px',
          overflowY: 'auto',
          padding: '0.5rem 0.25rem',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-white)'
        }}>
          {bays.map(bayNum => {
            const bayStart = (bayNum - 1) * 8 + 1;
            // 8 seats in this bay:
            // Main compartment facing row 1: seats 1, 2, 3
            // Main compartment facing row 2: seats 4, 5, 6
            // Side berths: seats 7, 8
            const row1Seats = [bayStart, bayStart + 1, bayStart + 2];
            const row2Seats = [bayStart + 3, bayStart + 4, bayStart + 5];
            const sideSeats = [bayStart + 6, bayStart + 7];

            return (
              <div
                key={bayNum}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: bayNum % 2 === 0 ? 'var(--bg-muted)' : '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                {/* Bay Header */}
                <div style={{ minWidth: '70px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                    Bay {bayNum}
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                    Seats {bayStart}&ndash;{bayStart + 7}
                  </div>
                </div>

                {/* Main Compartment: 6 Berths (2 Facing Sets of 3) */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {row1Seats.map(s => renderBerthButton(s))}
                  </div>

                  <div style={{
                    width: '1px',
                    height: '28px',
                    backgroundColor: 'var(--border-light)'
                  }} />

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {row2Seats.map(s => renderBerthButton(s))}
                  </div>
                </div>

                {/* Corridor / Aisle Spacer */}
                <div style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  padding: '0 0.25rem'
                }}>
                  &bull; Aisle &bull;
                </div>

                {/* Side Berths: 2 Berths */}
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {sideSeats.map(s => renderBerthButton(s))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Seats Context Summary */}
        {renderSelectedSeatsSummary()}
      </div>
    );
  }

  // -------------------------------------------------------------
  // NON-RAILWAY STANDARD GRID RENDERER (Movies, Concerts, etc.)
  // -------------------------------------------------------------
  const rows = event?.seatRows || ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = event?.seatsPerRow || 8;
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

      {renderSelectedSeatsSummary()}
    </div>
  );

  // -------------------------------------------------------------
  // HELPER SUB-RENDERERS
  // -------------------------------------------------------------
  function renderBerthButton(seatNo) {
    let info;
    try {
      info = seat_info(seatNo, coach);
    } catch (e) {
      return null;
    }

    const isOccupied = occupiedSeats.has(seatNo) ||
                       occupiedSeats.has(String(seatNo)) ||
                       occupiedSeats.has(Number(seatNo));
    const isSelected = selectedSeats.some(s => s === seatNo || String(s) === String(seatNo));
    const colors = BERTH_COLOR_PALETTE[info.berth_type] || BERTH_COLOR_PALETTE.LB;

    return (
      <button
        key={seatNo}
        type="button"
        onClick={() => handleSeatClick(seatNo)}
        disabled={disabled || isOccupied}
        title={`${info.display_label} • ${isOccupied ? 'Blocked / Reserved' : isSelected ? 'Selected' : 'Available'}`}
        style={{
          width: '38px',
          height: '42px',
          borderRadius: 'var(--radius-sm)',
          border: `1.5px solid ${isSelected ? 'var(--primary)' : isOccupied ? 'var(--border-light)' : colors.border}`,
          backgroundColor: isSelected
            ? 'var(--primary)'
            : isOccupied
              ? '#f1f5f9'
              : colors.bg,
          color: isSelected
            ? '#FFFFFF'
            : isOccupied
              ? 'var(--text-muted)'
              : colors.text,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isOccupied ? 'not-allowed' : 'pointer',
          padding: '2px',
          transition: 'all 0.15s ease',
          boxShadow: isSelected ? '0 2px 6px rgba(37,99,235,0.3)' : 'none',
          opacity: isOccupied ? 0.6 : 1
        }}
        aria-label={`${info.display_label} ${isOccupied ? 'Blocked' : isSelected ? 'Selected' : 'Available'}`}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 800, lineHeight: 1.1 }}>
          {seatNo}
        </span>
        <span style={{
          fontSize: '0.5625rem',
          fontWeight: 700,
          opacity: isSelected ? 0.9 : 0.8,
          textTransform: 'uppercase'
        }}>
          {info.berth_type}
        </span>
      </button>
    );
  }

  function renderSelectedSeatsSummary() {
    if (!selectedSeats || selectedSeats.length === 0) return null;

    return (
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem 0.875rem',
        backgroundColor: 'var(--bg-white)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--primary-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Selected Berths:
          </span>
          {selectedSeats.map(seat => {
            const label = formatSeatDisplay(seat, coach);
            return (
              <span
                key={String(seat)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.55rem',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <span>{label}</span>
                <X
                  size={12}
                  style={{ cursor: 'pointer', strokeWidth: 3 }}
                  onClick={() => handleSeatClick(seat)}
                />
              </span>
            );
          })}
        </div>

        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {selectedSeats.length} of {maxAllowed} selected
        </span>
      </div>
    );
  }
}

