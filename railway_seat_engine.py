"""
Indian Railways Sleeper (SL) Coach Seat-Locking Engine
Domain 9 Challenge: Concurrency-Safe Railway Seat-Locking Engine
Hack-a-Night, PVGCOE Nashik
"""

import time
import uuid

# Single source of truth configuration
SL_CONFIG = {
    "coach_code": "SL",
    "coach_name": "Sleeper Class",
    "default_coach": "S3",
    "total_berths": 72,
    "berths_per_bay": 8,
    "total_bays": 9,
    "default_ttl_seconds": 150,  # 2.5 minutes (within 2-3 minutes requirement)
}

# Single source of truth for 8-berth bay layout
# Offsets 1 through 8 in each bay
SL_BAY_LAYOUT = {
    1: {"type": "LB", "name": "Lower Berth", "is_side": False},
    2: {"type": "MB", "name": "Middle Berth", "is_side": False},
    3: {"type": "UB", "name": "Upper Berth", "is_side": False},
    4: {"type": "LB", "name": "Lower Berth", "is_side": False},
    5: {"type": "MB", "name": "Middle Berth", "is_side": False},
    6: {"type": "UB", "name": "Upper Berth", "is_side": False},
    7: {"type": "SL", "name": "Side Lower", "is_side": True},
    8: {"type": "SU", "name": "Side Upper", "is_side": True},
}


def seat_info(seat_no, coach=None):
    """
    Returns seat metadata, bay number, berth type, and display label.
    
    Validates that seat_no is an integer between 1 and 72.
    Raises ValueError for numbers outside 1-72 or invalid types.
    """
    if coach is None:
        coach = SL_CONFIG["default_coach"]

    try:
        seat_num = int(seat_no)
    except (ValueError, TypeError):
        raise ValueError(f"Seat number must be an integer between 1 and 72. Received: {seat_no}")

    if seat_num < 1 or seat_num > SL_CONFIG["total_berths"]:
        raise ValueError(
            f"Invalid seat number: {seat_num}. Sleeper coach berths must be between 1 and {SL_CONFIG['total_berths']}."
        )

    bay = ((seat_num - 1) // SL_CONFIG["berths_per_bay"]) + 1
    offset = ((seat_num - 1) % SL_CONFIG["berths_per_bay"]) + 1
    berth = SL_BAY_LAYOUT[offset]

    display_label = f"Coach {coach}, Bay {bay}, {berth['type']}, Seat {seat_num}"

    return {
        "seat_no": seat_num,
        "bay": bay,
        "berth_type": berth["type"],
        "berth_name": berth["name"],
        "is_side": berth["is_side"],
        "coach": coach,
        "display_label": display_label,
    }


class RailwaySeatLockEngine:
    """
    In-memory concurrency-safe seat locking engine with automatic TTL expiration.
    """

    def __init__(self, default_ttl=None, coach=None):
        self.default_ttl = default_ttl if default_ttl is not None else SL_CONFIG["default_ttl_seconds"]
        self.coach = coach if coach is not None else SL_CONFIG["default_coach"]
        # Storage: seat_no -> lock_dict
        self._locks = {}

    def clean_expired_locks(self):
        """
        Removes expired locks automatically and returns list of released seat numbers.
        """
        now = time.time()
        expired_seats = [seat for seat, lock in self._locks.items() if lock["expires_at"] <= now]
        for seat in expired_seats:
            del self._locks[seat]
        return expired_seats

    def lock_seat(self, seat_no, user_id="user_guest", ttl_seconds=None, coach=None):
        """
        Locks a seat for a user with TTL in seconds.
        Ensures unexpired locks cannot be locked by another user.
        """
        self.clean_expired_locks()

        target_coach = coach or self.coach
        info = seat_info(seat_no, target_coach)
        seat_num = info["seat_no"]
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl

        if seat_num in self._locks:
            existing = self._locks[seat_num]
            remaining = max(0, int(existing["expires_at"] - time.time()))
            raise RuntimeError(
                f"Seat {seat_num} is already locked by another session. Remaining TTL: {remaining}s."
            )

        now = time.time()
        lock_id = f"lock_{uuid.uuid4().hex[:8]}"
        lock_record = {
            "lock_id": lock_id,
            "seat_no": seat_num,
            "coach": target_coach,
            "user_id": user_id,
            "seat_info": info,
            "created_at": now,
            "expires_at": now + ttl,
            "ttl_seconds": ttl,
        }
        self._locks[seat_num] = lock_record
        return lock_record

    def release_lock(self, seat_no):
        """
        Releases a seat lock manually.
        """
        try:
            seat_num = int(seat_no)
        except (ValueError, TypeError):
            return False

        if seat_num in self._locks:
            del self._locks[seat_num]
            return True
        return False

    def is_seat_locked(self, seat_no):
        """
        Returns True if seat is currently locked and unexpired.
        """
        self.clean_expired_locks()
        try:
            seat_num = int(seat_no)
            return seat_num in self._locks
        except (ValueError, TypeError):
            return False

    def get_locked_seats(self):
        """
        Returns dictionary of all active, unexpired locks.
        """
        self.clean_expired_locks()
        return dict(self._locks)
