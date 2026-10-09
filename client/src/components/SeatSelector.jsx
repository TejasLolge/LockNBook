import React, { useState, useMemo } from 'react';
import { Armchair, Check, X, ShieldAlert, Train, Zap, RotateCcw, Filter, Sparkles } from 'lucide-react';
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
  maxAllowed = 6,
  disabled = false
}) {
  const isRailway = event?.category === 'trains' || event?.coachType === 'SL';
  const coach = event?.coach || SL_COACH_CONFIG.defaultCoach;
  const occupiedSeats = new Set(event?.occupiedSeats || []);
  const [berthTypeFilter, setBerthTypeFilter] = useState('ALL');

  // Compute live available counts per berth type across the coach
  const berthCounts = useMemo(() => {
    const counts = { ALL: 0, LB: 0, MB: 0, UB: 0, SL: 0, SU: 0 };
    for (let i = 1; i <= SL_COACH_CONFIG.totalBerths; i++) {
      const isOcc = occupiedSeats.has(i) ||
                    occupiedSeats.has(String(i)) ||
                    occupiedSeats.has(Number(i));
      if (!isOcc) {
        counts.ALL++;
        const offset = ((i - 1) % 8) + 1;
        const bType = SL_BAY_BERTH_MAP[offset]?.type;
        if (bType && counts[bType] !== undefined) {
          counts[bType]++;
        }
      }
    }
    return counts;
  }, [occupiedSeats]);

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

  // Auto-pick next available berth matching user's selected berth type
  const handleAutoPickBerth = (targetType = berthTypeFilter) => {
    if (disabled || selectedSeats.length >= maxAllowed) return;

    for (let seatNum = 1; seatNum <= SL_COACH_CONFIG.totalBerths; seatNum++) {
      const isOcc = occupiedSeats.has(seatNum) ||
                    occupiedSeats.has(String(seatNum)) ||
                    occupiedSeats.has(Number(seatNum));
      const alreadyChosen = selectedSeats.some(s => s === seatNum || String(s) === String(seatNum));

      if (!isOcc && !alreadyChosen) {
        const offset = ((seatNum - 1) % 8) + 1;
        const bType = SL_BAY_BERTH_MAP[offset]?.type;

        if (targetType === 'ALL' || bType === targetType) {
          onSeatsChange([...selectedSeats, seatNum]);
          return;
        }
      }
    }
  };

  const handleClearAllSelected = () => {
    if (disabled) return;
    onSeatsChange([]);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '0.2rem 0.55rem',
              borderRadius: '999px',
              border: '1px solid var(--primary-border)'
            }}>
              Max {maxAllowed} berths per order
            </span>
          </div>
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

        {/* Interactive Berth Type Option & Filter Toolbar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
          marginBottom: '1.25rem',
          padding: '0.75rem 0.875rem',
          backgroundColor: 'var(--bg-white)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Filter size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Select Berth Type Option:
              </span>
            </div>

            {/* Quick Auto-Pick action button */}
            <button
              type="button"
              onClick={() => handleAutoPickBerth(berthTypeFilter)}
              disabled={disabled || selectedSeats.length >= maxAllowed || (berthCounts[berthTypeFilter] || berthCounts.ALL) === 0}
              className="btn btn-sm"
              style={{
                gap: '0.35rem',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
                cursor: selectedSeats.length >= maxAllowed ? 'not-allowed' : 'pointer',
                opacity: selectedSeats.length >= maxAllowed ? 0.6 : 1
              }}
              title={selectedSeats.length >= maxAllowed ? `Limit reached (max ${maxAllowed})` : `Quickly choose next available ${berthTypeFilter === 'ALL' ? 'berth' : berthTypeFilter}`}
            >
              <Zap size={13} fill="#ffffff" />
              <span>Auto-Pick {berthTypeFilter === 'ALL' ? 'Any Free' : berthTypeFilter}</span>
            </button>
          </div>

          {/* Clickable Berth Type Filter Chips */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              onClick={() => setBerthTypeFilter('ALL')}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: berthTypeFilter === 'ALL' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                backgroundColor: berthTypeFilter === 'ALL' ? 'var(--primary-light)' : 'transparent',
                color: berthTypeFilter === 'ALL' ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: berthTypeFilter === 'ALL' ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Berths ({berthCounts.ALL})
            </button>

            {Object.entries({
              LB: 'Lower (LB)',
              MB: 'Middle (MB)',
              UB: 'Upper (UB)',
              SL: 'Side Lower (SL)',
              SU: 'Side Upper (SU)'
            }).map(([type, label]) => {
              const isCurrent = berthTypeFilter === type;
              const colors = BERTH_COLOR_PALETTE[type];
              const count = berthCounts[type] || 0;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBerthTypeFilter(isCurrent ? 'ALL' : type)}
                  title={`Filter and highlight all ${label} berths in coach`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.25rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isCurrent ? `2px solid ${colors.text}` : `1px solid ${colors.border}`,
                    backgroundColor: isCurrent ? colors.bg : '#ffffff',
                    color: colors.text,
                    fontWeight: isCurrent ? 800 : 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isCurrent ? `0 0 0 2px ${colors.border}` : 'none'
                  }}
                >
                  <span>{label}</span>
                  <span style={{
                    fontSize: '0.625rem',
                    padding: '0.05rem 0.3rem',
                    borderRadius: '999px',
                    backgroundColor: isCurrent ? '#ffffff' : colors.bg,
                    border: `1px solid ${colors.border}`,
                    fontWeight: 700
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {berthTypeFilter !== 'ALL' && (
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 600
            }}>
              <Sparkles size={12} />
              <span>
                Filtering <strong>{berthTypeFilter}</strong>: Matching berths are highlighted below with a focus ring. Non-matching berths are dimmed.
              </span>
            </div>
          )}
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
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>
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

    const matchesFilter = berthTypeFilter === 'ALL' || info.berth_type === berthTypeFilter;
    const isHighlighted = matchesFilter && berthTypeFilter !== 'ALL' && !isOccupied && !isSelected;

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
          boxShadow: isSelected
            ? '0 2px 6px rgba(37,99,235,0.3)'
            : isHighlighted
              ? `0 0 0 2px ${colors.text}`
              : 'none',
          opacity: isOccupied ? 0.5 : !matchesFilter ? 0.35 : 1,
          transform: isHighlighted ? 'scale(1.04)' : 'none'
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
                  title="Remove seat"
                />
              </span>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleClearAllSelected}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            <RotateCcw size={12} />
            <span>Clear</span>
          </button>

          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
            {selectedSeats.length} of {maxAllowed} selected
          </span>
        </div>
      </div>
    );
  }
}


