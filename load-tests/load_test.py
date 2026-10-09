import argparse
import asyncio
import json
import os
import sys
import time
from typing import Any, Dict, List, Tuple
import httpx
import numpy as np

class LockNBookTester:
    def __init__(self, base_url: str, timeout: float = 10.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.client: httpx.AsyncClient | None = None

    async def __aenter__(self):
        limits = httpx.Limits(max_connections=5000, max_keepalive_connections=500)
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout,
            limits=limits,
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.client:
            await self.client.aclose()

    async def reset_backend_state(self, event_id: str, initial_inventory: int) -> Tuple[int, float]:
        start = time.perf_counter()
        try:
            res = await self.client.post(
                "/api/test/reset",
                json={"eventId": event_id, "initialInventory": initial_inventory},
            )
            return res.status_code, (time.perf_counter() - start) * 1000
        except Exception:
            return 0, (time.perf_counter() - start) * 1000

    async def get_inventory(self, event_id: str) -> Tuple[int, float, Dict[str, Any]]:
        start = time.perf_counter()
        try:
            res = await self.client.get(f"/api/inventory/{event_id}")
            data = res.json() if res.content else {}
            return res.status_code, (time.perf_counter() - start) * 1000, data
        except Exception as exc:
            return 0, (time.perf_counter() - start) * 1000, {"error": str(exc)}

    async def send_hold_request(self, event_id: str, user_id: str, qty: int = 1) -> Tuple[int, float, Dict[str, Any]]:
        start = time.perf_counter()
        try:
            res = await self.client.post(
                "/api/tickets/hold",
                json={"eventId": event_id, "userId": user_id, "qty": qty},
            )
            data = res.json() if res.content else {}
            return res.status_code, (time.perf_counter() - start) * 1000, data
        except Exception as exc:
            return 0, (time.perf_counter() - start) * 1000, {"error": str(exc)}

async def main():
    parser = argparse.ArgumentParser(description="LockNBook Load & Correctness Tester")
    parser.add_argument("-u", "--url", type=str, default="http://127.0.0.1:3000", help="API Base URL")
    parser.add_argument("-e", "--event", type=str, default="evt_101", help="Target Event ID")
    parser.add_argument("-n", "--requests", type=int, default=150, help="Total concurrent requests")
    parser.add_argument("-i", "--inventory", type=int, default=100, help="Initial expected inventory")
    parser.add_argument("-o", "--output", type=str, default="results.json", help="Export report path")
    args = parser.parse_args()

    print("================================================================")
    print("      LOCKNBOOK CONCURRENCY & CORRECTNESS LOAD TEST             ")
    print("================================================================")

    async with LockNBookTester(base_url=args.url) as tester:
        await tester.reset_backend_state(args.event, args.inventory)
        _, _, inv_data = await tester.get_inventory(args.event)
        print(f"Pre-Test Available Stock: {inv_data.get('available', 'N/A')}")

        print(f"Dispatching {args.requests} concurrent hold requests...")
        start_time = time.perf_counter()

        tasks = [
            tester.send_hold_request(event_id=args.event, user_id=f"user_{i}")
            for i in range(args.requests)
        ]
        results = await asyncio.gather(*tasks)
        total_duration = time.perf_counter() - start_time

        _, _, post_inv_data = await tester.get_inventory(args.event)

    status_codes = [r[0] for r in results]
    latencies = [r[1] for r in results]

    successful_holds = status_codes.count(200)
    rejected_requests = status_codes.count(409)
    errors = sum(1 for c in status_codes if c not in (200, 409))

    p50 = np.percentile(latencies, 50) if latencies else 0.0
    p95 = np.percentile(latencies, 95) if latencies else 0.0
    p99 = np.percentile(latencies, 99) if latencies else 0.0
    throughput = args.requests / total_duration if total_duration > 0 else 0.0

    oversold_count = max(0, successful_holds - args.inventory)
    correctness_passed = (oversold_count == 0) and (successful_holds <= args.inventory)

    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "total_requests": args.requests,
        "initial_inventory": args.inventory,
        "final_reported_inventory": post_inv_data.get("available", "N/A"),
        "metrics": {
            "successful_holds": successful_holds,
            "rejected_requests_409": rejected_requests,
            "errors": errors,
            "oversold_count": oversold_count,
            "test_duration_sec": round(total_duration, 3),
            "throughput_req_sec": round(throughput, 2),
            "latency_p50_ms": round(p50, 2),
            "latency_p95_ms": round(p95, 2),
            "latency_p99_ms": round(p99, 2),
        },
        "correctness_passed": correctness_passed
    }

    print("\n--- SUMMARY REPORT ---")
    print(f" Requests Sent       : {args.requests}")
    print(f" Successful Holds    : {successful_holds} (200 OK)")
    print(f" Rejected Requests   : {rejected_requests} (409 Conflict)")
    print(f" Duration / RPS      : {total_duration:.2f}s | {throughput:.2f} req/sec")
    print(f" Latency p50 / p95   : {p50:.2f}ms / {p95:.2f}ms")
    print(f" Correctness Verdict : {'✅ PASSED' if correctness_passed else '❌ FAILED'}")

    with open(args.output, "w") as f:
        json.dump(report, f, indent=2)

    if not correctness_passed:
        sys.exit(1)
    sys.exit(0)

if __name__ == "__main__":
    asyncio.run(main())