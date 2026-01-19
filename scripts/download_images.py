#!/usr/bin/env python3
"""
下载mirrors目录中文章的外链图片到本地
"""

import os
import re
import requests
import hashlib
from pathlib import Path
from urllib.parse import urlparse

MIRRORS_DIR = Path(__file__).parent.parent / 'mirrors'

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Referer': 'https://www.sztv.com.cn/',
}

def get_image_filename(url):
    """从URL生成本地文件名"""
    # 尝试从URL获取原始文件名
    parsed = urlparse(url)
    path = parsed.path
    filename = os.path.basename(path)
    
    # 如果文件名为空或太短，使用URL的hash
    if not filename or len(filename) < 5:
        url_hash = hashlib.md5(url.encode()).hexdigest()[:16]
        ext = '.jpg'  # 默认扩展名
        if '.png' in url.lower():
            ext = '.png'
        elif '.gif' in url.lower():
            ext = '.gif'
        elif '.webp' in url.lower():
            ext = '.webp'
        filename = f"img_{url_hash}{ext}"
    
    return filename

def download_image(url, save_path):
    """下载图片"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
    except Exception as e:
        print(f"    下载失败: {e}")
    return False

def process_html_file(html_path):
    """处理单个HTML文件，下载外链图片并更新引用"""
    print(f"\n📄 处理: {html_path}")
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 查找所有外链图片URL - 更宽松的匹配
    # 匹配所有 https://...png/jpg/jpeg/gif/webp
    img_pattern = r'(https?://[^\s"\'<>]+\.(?:png|jpg|jpeg|gif|webp)(?:\?[^\s"\'<>]*)?)'
    matches = re.findall(img_pattern, content, re.IGNORECASE)
    
    if not matches:
        print("  没有找到外链图片")
        return 0
    
    # 去重
    urls = list(set(matches))
    print(f"  找到 {len(urls)} 个外链图片")
    
    download_count = 0
    parent_dir = html_path.parent
    
    for url in urls:
        # 清理URL（移除查询参数用于文件名）
        clean_url = url.split('?')[0]
        filename = get_image_filename(clean_url)
        save_path = parent_dir / filename
        
        # 检查是否已下载
        if save_path.exists() and save_path.stat().st_size > 100:
            print(f"  ✓ 已存在: {filename}")
        else:
            print(f"  ⬇ 下载: {filename}")
            if download_image(url, save_path):
                download_count += 1
                print(f"    ✓ 成功 ({save_path.stat().st_size} bytes)")
            else:
                print(f"    ✗ 失败")
                continue
        
        # 更新HTML中的引用
        content = content.replace(url, filename)
    
    # 保存更新后的HTML
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  已更新HTML引用")
    return download_count

def main():
    print("=" * 50)
    print("开始下载外链图片")
    print("=" * 50)
    
    total_downloaded = 0
    
    # 遍历所有mirrors子目录
    for dir_path in sorted(MIRRORS_DIR.iterdir()):
        if dir_path.is_dir() and not dir_path.name.startswith('.'):
            html_file = dir_path / 'index.html'
            if html_file.exists():
                count = process_html_file(html_file)
                total_downloaded += count
    
    print("\n" + "=" * 50)
    print(f"完成！共下载 {total_downloaded} 张图片")
    print("=" * 50)

if __name__ == '__main__':
    main()
