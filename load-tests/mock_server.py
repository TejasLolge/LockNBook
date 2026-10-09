from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import threading

class MockAPI(BaseHTTPRequestHandler):
    lock = threading.Lock()
    inventory = 100

    def do_GET(self):
        if self.path.startswith("/api/inventory/"):
            self._send(200, {"eventId": "evt_101", "available": MockAPI.inventory})
        else:
            self._send(404, {"error": "Not Found"})

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(content_length)) if content_length > 0 else {}

        if self.path == "/api/tickets/hold":
            with MockAPI.lock:
                if MockAPI.inventory > 0:
                    MockAPI.inventory -= 1
                    self._send(200, {"status": "HOLD_GRANTED", "remaining": MockAPI.inventory})
                else:
                    self._send(409, {"status": "SOLD_OUT", "remaining": 0})
        elif self.path == "/api/test/reset":
            with MockAPI.lock:
                MockAPI.inventory = body.get("initialInventory", 100)
                self._send(200, {"status": "RESET_SUCCESS", "available": MockAPI.inventory})
        else:
            self._send(404, {"error": "Not Found"})

    def _send(self, code, payload):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", 3000), MockAPI)
    print("Mock LockNBook Server running on http://127.0.0.1:3000")
    server.serve_forever()