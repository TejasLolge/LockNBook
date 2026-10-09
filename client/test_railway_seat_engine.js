import assert from 'node:assert/strict';
import {
  seat_info,
  RailwaySeatLockEngine,
  SL_COACH_CONFIG,
  formatSeatDisplay
} from './src/api/railwaySeatEngine.js';

console.log('--- Running Node.js Railway Seat Engine Unit Tests ---');

// Test 1: Seat 1 (LB, Bay 1)
{
  const res = seat_info(1);
  assert.equal(res.seat_no, 1);
  assert.equal(res.bay, 1);
  assert.equal(res.berth_type, 'LB');
  assert.equal(res.display_label, 'Coach S3, Bay 1, LB, Seat 1');
  console.log('✓ test_seat_1_lower_bay_1 passed');
}

// Test 2: Seat 3 (UB, Bay 1)
{
  const res = seat_info(3);
  assert.equal(res.seat_no, 3);
  assert.equal(res.bay, 1);
  assert.equal(res.berth_type, 'UB');
  assert.equal(res.display_label, 'Coach S3, Bay 1, UB, Seat 3');
  console.log('✓ test_seat_3_upper_bay_1 passed');
}

// Test 3: Seat 8 (SU, Bay 1)
{
  const res = seat_info(8);
  assert.equal(res.seat_no, 8);
  assert.equal(res.bay, 1);
  assert.equal(res.berth_type, 'SU');
  assert.equal(res.display_label, 'Coach S3, Bay 1, SU, Seat 8');
  console.log('✓ test_seat_8_side_upper_bay_1 passed');
}

// Test 4: Seat 9 (LB, Bay 2)
{
  const res = seat_info(9);
  assert.equal(res.seat_no, 9);
  assert.equal(res.bay, 2);
  assert.equal(res.berth_type, 'LB');
  assert.equal(res.display_label, 'Coach S3, Bay 2, LB, Seat 9');
  console.log('✓ test_seat_9_lower_bay_2 passed');
}

// Test 5: Seat 10 (MB, Bay 2)
{
  const res = seat_info(10);
  assert.equal(res.seat_no, 10);
  assert.equal(res.bay, 2);
  assert.equal(res.berth_type, 'MB');
  assert.equal(res.display_label, 'Coach S3, Bay 2, MB, Seat 10');
  console.log('✓ test_seat_10_middle_bay_2 passed');
}

// Test 6: Seat 72 (SU, Bay 9)
{
  const res = seat_info(72);
  assert.equal(res.seat_no, 72);
  assert.equal(res.bay, 9);
  assert.equal(res.berth_type, 'SU');
  assert.equal(res.display_label, 'Coach S3, Bay 9, SU, Seat 72');
  console.log('✓ test_seat_72_side_upper_bay_9 passed');
}

// Test 7: Seat 0 raises error
{
  assert.throws(
    () => seat_info(0),
    /Invalid seat number/
  );
  console.log('✓ test_seat_0_raises_error passed');
}

// Test 8: Seat 73 raises error
{
  assert.throws(
    () => seat_info(73),
    /Invalid seat number/
  );
  console.log('✓ test_seat_73_raises_error passed');
}

// Test 9: Seat -1 raises error
{
  assert.throws(
    () => seat_info(-1),
    /Invalid seat number/
  );
  console.log('✓ test_negative_seat_raises_error passed');
}

// Test 10: Lock and Automatic TTL Expiry
async function testLockExpiry() {
  const engine = new RailwaySeatLockEngine(1); // 1 second TTL

  // Lock seat 10
  const lock = engine.lock_seat(10, 'user_test', 1);
  assert.equal(lock.seat_no, 10);
  assert.equal(lock.seat_info.display_label, 'Coach S3, Bay 2, MB, Seat 10');
  assert.equal(engine.is_seat_locked(10), true);
  console.log('✓ seat 10 locked successfully');

  // Duplicate lock fails
  assert.throws(
    () => engine.lock_seat(10, 'other_user'),
    /already blocked/
  );
  console.log('✓ duplicate seat lock rejected');

  // Wait 1.1s for TTL expiry
  await new Promise((resolve) => setTimeout(resolve, 1100));

  // Verify seat lock expired automatically and released
  assert.equal(engine.is_seat_locked(10), false);
  assert.equal(engine.get_locked_seats().length, 0);
  console.log('✓ seat lock expired and released automatically');

  // Verify seat can be locked again without permanent blockage
  const newLock = engine.lock_seat(10, 'new_user', 2);
  assert.equal(newLock.userId, 'new_user');
  assert.equal(engine.is_seat_locked(10), true);
  console.log('✓ seat successfully re-locked by new user');
}

testLockExpiry().then(() => {
  console.log('--- ALL NODE.JS RAILWAY UNIT TESTS PASSED (10/10) ---');
});
