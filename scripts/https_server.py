#!/usr/bin/env python3
"""
HTTPS 服务器，用于测试需要安全上下文的 Web API（如陀螺仪）
使用自签名证书
"""

import http.server
import ssl
import os
import subprocess
import sys

# 配置
PORT = 8443
DIRECTORY = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CERT_DIR = os.path.join(DIRECTORY, 'certs')
CERT_FILE = os.path.join(CERT_DIR, 'server.pem')
KEY_FILE = os.path.join(CERT_DIR, 'server.key')

def generate_self_signed_cert():
    """生成自签名证书"""
    os.makedirs(CERT_DIR, exist_ok=True)
    
    if os.path.exists(CERT_FILE) and os.path.exists(KEY_FILE):
        print(f"证书已存在: {CERT_FILE}")
        return True
    
    print("生成自签名证书...")
    
    # 使用 openssl 生成证书
    cmd = [
        'openssl', 'req', '-x509', '-newkey', 'rsa:4096',
        '-keyout', KEY_FILE,
        '-out', CERT_FILE,
        '-days', '365',
        '-nodes',
        '-subj', '/CN=localhost/O=Development/C=CN',
        '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1,IP:192.168.5.33'
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"证书已生成: {CERT_FILE}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"生成证书失败: {e}")
        print(f"stderr: {e.stderr.decode()}")
        return False
    except FileNotFoundError:
        print("错误: 需要安装 openssl")
        return False

def get_local_ip():
    """获取本机局域网 IP"""
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # 添加 CORS 头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        
        # 强制禁止缓存 - 特别针对 Safari
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        super().end_headers()

def main():
    # 生成证书
    if not generate_self_signed_cert():
        print("\n无法生成证书，将使用 HTTP 模式")
        print("注意: iOS 陀螺仪功能需要 HTTPS!")
        use_https = False
    else:
        use_https = True
    
    local_ip = get_local_ip()
    
    if use_https:
        # HTTPS 服务器
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(CERT_FILE, KEY_FILE)
        
        server = http.server.HTTPServer(('0.0.0.0', PORT), CustomHandler)
        server.socket = context.wrap_socket(server.socket, server_side=True)
        
        print(f"\n🔒 HTTPS 服务器已启动!")
        print(f"\n访问地址:")
        print(f"  本机: https://localhost:{PORT}/frontend/")
        print(f"  局域网: https://{local_ip}:{PORT}/frontend/")
        print(f"\n陀螺仪测试: https://{local_ip}:{PORT}/frontend/gyro-test.html")
        print(f"3D 视差: https://{local_ip}:{PORT}/frontend/gsplat-viewer.html")
        print(f"\n⚠️ 首次访问需要在浏览器中信任自签名证书")
        print(f"   iOS: 设置 → 通用 → 关于本机 → 证书信任设置")
    else:
        # HTTP 服务器（备用）
        server = http.server.HTTPServer(('0.0.0.0', 8080), CustomHandler)
        print(f"\n⚠️ HTTP 服务器已启动 (陀螺仪可能无法工作)")
        print(f"\n访问地址:")
        print(f"  本机: http://localhost:8080/frontend/")
        print(f"  局域网: http://{local_ip}:8080/frontend/")
    
    print(f"\n按 Ctrl+C 停止服务器\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.shutdown()

if __name__ == '__main__':
    main()
