import unittest
import time
from railway_seat_engine import seat_info, RailwaySeatLockEngine, SL_CONFIG

class TestRailwaySeatEngine(unittest.TestCase):

    def test_seat_1_lower_bay_1(self):
        res = seat_info(1)
        self.assertEqual(res["seat_no"], 1)
        self.assertEqual(res["bay"], 1)
        self.assertEqual(res["berth_type"], "LB")
        self.assertEqual(res["display_label"], "Coach S3, Bay 1, LB, Seat 1")

    def test_seat_3_upper_bay_1(self):
        res = seat_info(3)
        self.assertEqual(res["seat_no"], 3)
        self.assertEqual(res["bay"], 1)
        self.assertEqual(res["berth_type"], "UB")
        self.assertEqual(res["display_label"], "Coach S3, Bay 1, UB, Seat 3")

    def test_seat_8_side_upper_bay_1(self):
        res = seat_info(8)
        self.assertEqual(res["seat_no"], 8)
        self.assertEqual(res["bay"], 1)
        self.assertEqual(res["berth_type"], "SU")
        self.assertEqual(res["display_label"], "Coach S3, Bay 1, SU, Seat 8")

    def test_seat_9_lower_bay_2(self):
        res = seat_info(9)
        self.assertEqual(res["seat_no"], 9)
        self.assertEqual(res["bay"], 2)
        self.assertEqual(res["berth_type"], "LB")
        self.assertEqual(res["display_label"], "Coach S3, Bay 2, LB, Seat 9")

    def test_seat_10_middle_bay_2(self):
        res = seat_info(10)
        self.assertEqual(res["seat_no"], 10)
        self.assertEqual(res["bay"], 2)
        self.assertEqual(res["berth_type"], "MB")
        self.assertEqual(res["display_label"], "Coach S3, Bay 2, MB, Seat 10")

    def test_seat_72_side_upper_bay_9(self):
        res = seat_info(72)
        self.assertEqual(res["seat_no"], 72)
        self.assertEqual(res["bay"], 9)
        self.assertEqual(res["berth_type"], "SU")
        self.assertEqual(res["display_label"], "Coach S3, Bay 9, SU, Seat 72")

    def test_seat_0_raises_error(self):
        with self.assertRaises(ValueError):
            seat_info(0)

    def test_seat_73_raises_error(self):
        with self.assertRaises(ValueError):
            seat_info(73)

    def test_negative_seat_raises_error(self):
        with self.assertRaises(ValueError):
            seat_info(-5)

    def test_lock_and_automatic_ttl_expiry(self):
        engine = RailwaySeatLockEngine(default_ttl=1)  # 1 second TTL for test
        
        # 1. Lock seat 10
        lock = engine.lock_seat(10, user_id="user_test", ttl_seconds=1)
        self.assertEqual(lock["seat_no"], 10)
        self.assertEqual(lock["seat_info"]["display_label"], "Coach S3, Bay 2, MB, Seat 10")
        self.assertTrue(engine.is_seat_locked(10))

        # 2. Duplicate lock while active must fail
        with self.assertRaises(RuntimeError):
            engine.lock_seat(10, user_id="another_user")

        # 3. Wait for TTL to expire
        time.sleep(1.1)

        # 4. Verify seat is no longer locked and removed from active locks
        self.assertFalse(engine.is_seat_locked(10))
        self.assertNotIn(10, engine.get_locked_seats())

        # 5. Seat can now be locked by another user without permanent blockage
        new_lock = engine.lock_seat(10, user_id="new_user", ttl_seconds=2)
        self.assertEqual(new_lock["user_id"], "new_user")
        self.assertTrue(engine.is_seat_locked(10))

if __name__ == "__main__":
    unittest.main()
