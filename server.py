#!/usr/bin/env python3
"""
简单的HTTP服务器
用于本地预览Spatial News Demo
"""

import http.server
import socketserver
import os
import sys

PORT = 8080
# 服务整个项目根目录，因为需要访问 frontend/, mirrors/, data/ 等
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # 添加CORS头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)) or '.')
    
    if not os.path.exists(DIRECTORY):
        print(f"错误: 目录 '{DIRECTORY}' 不存在")
        sys.exit(1)
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 Spatial News Demo 服务器已启动")
        print(f"📱 本地访问: http://localhost:{PORT}/frontend/")
        print(f"🌐 局域网访问: http://[你的IP]:{PORT}/frontend/")
        print(f"")
        print(f"按 Ctrl+C 停止服务器")
        print("-" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")
