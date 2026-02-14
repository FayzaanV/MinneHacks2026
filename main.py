import os
import json
from http.server import SimpleHTTPRequestHandler
import socketserver
from backend.scanner import get_system_stats

PORT = 8000


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Uncomment to allow cross-origin requests when needed:
        # self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
g
    def do_GET(self):
        # API endpoint
        if self.path == '/api/stats':
            stats = get_system_stats()
            body = json.dumps(stats).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # Serve index for root and fall back to default static handling
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()


if __name__ == '__main__':
    # Serve files from the frontend folder
    os.chdir('frontend')
    with socketserver.ThreadingTCPServer(('', PORT), Handler) as httpd:
        print(f'Serving http://127.0.0.1:{PORT}')
        httpd.serve_forever()
