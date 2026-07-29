import http.server
import socketserver
from app.config import settings

class HealthCheckHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Ecommerce worker health status: OK")

if __name__ == "__main__":
    with socketserver.TCPServer(("0.0.0.0", settings.PORT), HealthCheckHandler) as httpd:
        print(f"Render health check port listening on {settings.PORT}")
        httpd.serve_forever()
