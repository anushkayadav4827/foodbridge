#!/usr/bin/env python3
"""
FoodBridge Local Server
Runs the demo on http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def do_GET(self):
        # Serve index.html for root path
        if self.path == '/':
            self.path = '/demo/index.html'
        return super().do_GET()

def main():
    # Change to project directory
    os.chdir(Path(__file__).parent)
    
    print("=" * 60)
    print("🌱 FoodBridge Local Server")
    print("=" * 60)
    print(f"\n✅ Starting server on http://localhost:{PORT}")
    print(f"✅ Demo will open automatically in your browser")
    print(f"\n📁 Serving from: {os.getcwd()}")
    print(f"\n🌐 Access the demo at:")
    print(f"   http://localhost:{PORT}")
    print(f"   http://localhost:{PORT}/demo/index.html")
    print(f"\n⏹️  Press Ctrl+C to stop the server")
    print("=" * 60)
    print()
    
    # Create server
    Handler = MyHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        # Open browser
        webbrowser.open(f'http://localhost:{PORT}/demo/index.html')
        
        print(f"✅ Server is running!")
        print(f"✅ Browser should open automatically")
        print()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n⏹️  Server stopped")
            print("=" * 60)

if __name__ == "__main__":
    main()
