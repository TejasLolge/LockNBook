/**
 * Indian Railways Sleeper (SL) Coach Single Source of Truth
 * Domain 9 Challenge: Concurrency-Safe Railway Seat-Locking Engine
 * Hack-a-Night, PVGCOE Nashik
 */

// 1. Single Source of Truth Configuration
export const SL_COACH_CONFIG = {
  coachCode: 'SL',
  coachName: 'Sleeper Class',
  defaultCoach: 'S3',
  totalBerths: 72,
  berthsPerBay: 8,
  totalBays: 9,
  defaultTtlSeconds: 150 // 2.5 minutes (between 2-3 minutes)
};

// 2. Single Source of Truth for Bay Berth Mapping (Offsets 1 to 8)
export const SL_BAY_BERTH_MAP = {
  1: { type: 'LB', name: 'Lower Berth', isSide: false, label: 'Lower' },
  2: { type: 'MB', name: 'Middle Berth', isSide: false, label: 'Middle' },
  3: { type: 'UB', name: 'Upper Berth', isSide: false, label: 'Upper' },
  4: { type: 'LB', name: 'Lower Berth', isSide: false, label: 'Lower' },
  5: { type: 'MB', name: 'Middle Berth', isSide: false, label: 'Middle' },
  6: { type: 'UB', name: 'Upper Berth', isSide: false, label: 'Upper' },
  7: { type: 'SL', name: 'Side Lower', isSide: true, label: 'Side Lower' },
  8: { type: 'SU', name: 'Side Upper', isSide: true, label: 'Side Upper' }
};

export const BERTH_COLOR_PALETTE = {
  LB: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  MB: { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
  UB: { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
  SL: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  SU: { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' }
};

/**
 * Returns seat metadata, bay number, berth type, and display label.
 *
 * @param {number|string} seat_no - Seat number between 1 and 72
 * @param {string} [coach='S3'] - Coach identifier, e.g. 'S3'
 * @returns {object} seat metadata
 * @throws {Error} if seat_no is outside 1-72
 */
export function seat_info(seat_no, coach = SL_COACH_CONFIG.defaultCoach) {
  const num = parseInt(seat_no, 10);

  if (isNaN(num) || num < 1 || num > SL_COACH_CONFIG.totalBerths) {
    throw new Error(
      `Invalid seat number: ${seat_no}. Sleeper berths must be between 1 and ${SL_COACH_CONFIG.totalBerths}.`
    );
  }

  const bay = Math.floor((num - 1) / SL_COACH_CONFIG.berthsPerBay) + 1;
  const offset = ((num - 1) % SL_COACH_CONFIG.berthsPerBay) + 1;
  const berth = SL_BAY_BERTH_MAP[offset];

  const display_label = `Coach ${coach}, Bay ${bay}, ${berth.type}, Seat ${num}`;

  return {
    seat_no: num,
    seatNumber: num,
    bay,
    bay_number: bay,
    berth_type: berth.type,
    berth_name: berth.name,
    is_side: berth.isSide,
    coach,
    display_label
  };
}

/**
 * Robust formatter for any seat identifier (handles numbers 1-72 or row IDs like 'A3').
 */
export function formatSeatDisplay(seatId, coach = SL_COACH_CONFIG.defaultCoach) {
  if (seatId === null || seatId === undefined) return '';

  // If already an object with display_label
  if (typeof seatId === 'object' && seatId.display_label) {
    return seatId.display_label;
  }

  // If numeric or parseable as integer 1-72
  const num = parseInt(seatId, 10);
  if (!isNaN(num) && num >= 1 && num <= SL_COACH_CONFIG.totalBerths) {
    try {
      return seat_info(num, coach).display_label;
    } catch (e) {
      return `Seat ${num}`;
    }
  }

  // Non-railway grid seat (e.g. 'A3', 'B1')
  return `Seat ${seatId}`;
}

/**
 * Concurrency-safe in-memory seat lock engine with automatic TTL expiration.
 */
export class RailwaySeatLockEngine {
  constructor(defaultTtl = SL_COACH_CONFIG.defaultTtlSeconds, coach = SL_COACH_CONFIG.defaultCoach) {
    this.defaultTtl = defaultTtl;
    this.coach = coach;
    this.locks = new Map(); // seat_no -> lockRecord
  }

  clean_expired_locks() {
    const now = Date.now();
    const released = [];
    for (const [seatNo, lock] of this.locks.entries()) {
      if (lock.expiresAtMs <= now) {
        this.locks.delete(seatNo);
        released.push(seatNo);
      }
    }
    return released;
  }

  lock_seat(seat_no, userId = 'user_guest', ttlSeconds = null, coach = null) {
    this.clean_expired_locks();

    const targetCoach = coach || this.coach;
    const info = seat_info(seat_no, targetCoach);
    const seatNum = info.seat_no;
    const ttl = ttlSeconds !== null ? ttlSeconds : this.defaultTtl;

    if (this.locks.has(seatNum)) {
      const existing = this.locks.get(seatNum);
      const remaining = Math.max(0, Math.ceil((existing.expiresAtMs - Date.now()) / 1000));
      throw new Error(
        `Seat ${seatNum} is already blocked by another reservation. Remaining lock: ${remaining}s.`
      );
    }

    const now = Date.now();
    const expiresAtMs = now + ttl * 1000;
    const lockId = 'hld_' + Math.random().toString(36).substring(2, 9);

    const lockRecord = {
      lock_id: lockId,
      holdId: lockId,
      seat_no: seatNum,
      coach: targetCoach,
      userId,
      seat_info: info,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(expiresAtMs).toISOString(),
      expiresAtMs,
      ttl_seconds: ttl
    };

    this.locks.set(seatNum, lockRecord);
    return lockRecord;
  }

  release_lock(seat_no) {
    const num = parseInt(seat_no, 10);
    if (isNaN(num)) return false;
    return this.locks.delete(num);
  }

  is_seat_locked(seat_no) {
    this.clean_expired_locks();
    const num = parseInt(seat_no, 10);
    if (isNaN(num)) return false;
    return this.locks.has(num);
  }

  get_locked_seats() {
    this.clean_expired_locks();
    return Array.from(this.locks.values());
  }
}

// Global singleton instance for easy client-side integration
export const railwayLockEngine = new RailwaySeatLockEngine();
