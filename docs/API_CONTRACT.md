# LockNBook API Contract

**Status:** Initial draft  
**Purpose:** Define communication between the frontend, backend, and load-testing system.

## 1. Base URL

Development: `http://localhost:3000`

All API endpoints use the `/api` prefix.

## 2. Standard Response Format

Successful responses return JSON containing the requested data.

Errors use this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "A human-readable explanation"
  }
}
```

## 3. Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in and receive an access token |

Protected requests use:

`Authorization: Bearer <access_token>`

Admin endpoints require admin authorization.

## 4. Events and Inventory

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/events` | List available events |
| GET | `/api/events/:id` | Get event details and inventory |

## 5. Reservation Flow

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/holds` | Create a temporary inventory hold |
| POST | `/api/holds/:id/confirm` | Confirm a hold and create a booking |
| GET | `/api/bookings/me` | List the logged-in user's bookings |
| POST | `/api/bookings/:id/cancel` | Cancel a confirmed booking |

### Hold Creation

Request:

```json
{
  "eventId": "event-id",
  "quantity": 2
}
```

The request must include an idempotency key:

`Idempotency-Key: <unique-request-key>`

A successful hold reserves inventory temporarily for five minutes.

Rules:
- A user may have only one active hold per event.
- A hold may contain at most 10 tickets.
- Inventory allocation must be atomic.
- A request must never reserve more tickets than are available.

The backend team must confirm the final request and response fields before implementation is considered integrated.

## 6. Metrics and Load Testing

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/admin/metrics` | Read system metrics |
| POST | `/api/admin/load-tests` | Start a load test |
| GET | `/api/admin/load-tests/:jobId` | Check load-test status and results |
| GET | `/api/admin/load-tests/history` | Retrieve previous test runs |
| POST | `/api/admin/test-event/reset` | Reset dedicated test inventory |

Load-test execution and inventory reset require admin authorization.

Starting a load test returns HTTP `202 Accepted` with a job identifier. A second test must not start while another is queued or running.

## 7. Important Error Codes

| Code | Meaning |
|---|---|
| `VALIDATION_ERROR` | Invalid request data |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `INSUFFICIENT_INVENTORY` | Not enough tickets available |
| `ACTIVE_HOLD_EXISTS` | User already has an active hold |
| `HOLD_EXPIRED` | Hold has expired |
| `IDEMPOTENCY_CONFLICT` | Idempotency key reused with different request data |
| `LOAD_TEST_RUNNING` | Another load test is already running |
| `INTERNAL_ERROR` | Unexpected server error |

## 8. Integration Rules

- Redis handles atomic inventory holds and expiration.
- PostgreSQL stores durable bookings and load-test history.
- Confirmed bookings must not be reported as successful until durable persistence succeeds.
- Cancellation must restore inventory exactly once.
- The load-testing system must exercise the actual Express API.
- Dashboard metrics must use real measurements, not fabricated benchmark values.

## 9. Integration Checklist

- [ ] Backend endpoints implemented
- [ ] Final request and response schemas agreed upon
- [ ] Frontend connected to backend
- [ ] Authentication and admin authorization verified
- [ ] Reservation concurrency tested
- [ ] Inventory correctness verified
- [ ] Load-test results persisted and displayed
