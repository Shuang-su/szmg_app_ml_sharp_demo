#!/usr/bin/env python3
"""
保存原始网页脚本
下载文章页面的HTML、CSS、JS等资源
"""

import requests
import os
import re
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from pathlib import Path

# 文章列表
ARTICLES = [
    ("80611955", "https://www.sztv.com.cn/ysz/zx/zbsz/80611955.shtml"),
    ("80611627", "https://www.sztv.com.cn/ysz/zx/rd/80611627.shtml"),
    ("80611833", "https://www.sztv.com.cn/ysz/zx/tj/80611833.shtml"),
    ("80611814", "https://www.sztv.com.cn/ysz/zx/tj/80611814.shtml"),
    ("80611789", "https://www.sztv.com.cn/ysz/zx/tj/80611789.shtml"),
    ("80611791", "https://www.sztv.com.cn/ysz/zx/tj/80611791.shtml"),
    ("80611586", "https://www.sztv.com.cn/ysz/zx/zw/80611586.shtml"),
    ("80611296", "https://www.sztv.com.cn/ysz/zx/zw/80611296.shtml"),
    ("80611248", "https://www.sztv.com.cn/ysz/zx/zw/80611248.shtml"),
    ("80611001", "https://www.sztv.com.cn/ysz/zx/tj/80611001.shtml"),
    ("80611004", "https://www.sztv.com.cn/ysz/zx/tj/80611004.shtml"),
    ("80611058", "https://www.sztv.com.cn/ysz/zx/tj/80611058.shtml"),
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}

def ensure_dir(path):
    Path(path).mkdir(parents=True, exist_ok=True)

def save_resource(url, save_path, base_url):
    """下载并保存资源文件"""
    try:
        full_url = urljoin(base_url, url)
        response = requests.get(full_url, headers=HEADERS, timeout=30)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
    except Exception as e:
        print(f"  下载失败 {url}: {e}")
    return False

def save_article(article_id, url, output_dir):
    """保存单篇文章及其资源"""
    print(f"\n📄 保存文章: {article_id}")
    
    article_dir = Path(output_dir) / article_id
    ensure_dir(article_dir)
    ensure_dir(article_dir / 'css')
    ensure_dir(article_dir / 'js')
    ensure_dir(article_dir / 'img')
    
    try:
        # 获取HTML
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.encoding = 'utf-8'
        html_content = response.text
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 保存原始HTML
        with open(article_dir / 'original.html', 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"  ✓ HTML已保存")
        
        # 提取并保存CSS
        css_count = 0
        for i, link in enumerate(soup.find_all('link', rel='stylesheet')):
            href = link.get('href')
            if href:
                css_filename = f"style_{i}.css"
                if save_resource(href, article_dir / 'css' / css_filename, url):
                    css_count += 1
                    # 更新HTML中的引用
                    link['href'] = f"css/{css_filename}"
        print(f"  ✓ CSS: {css_count} 个文件")
        
        # 提取并保存JS
        js_count = 0
        for i, script in enumerate(soup.find_all('script', src=True)):
            src = script.get('src')
            if src:
                js_filename = f"script_{i}.js"
                if save_resource(src, article_dir / 'js' / js_filename, url):
                    js_count += 1
                    script['src'] = f"js/{js_filename}"
        print(f"  ✓ JS: {js_count} 个文件")
        
        # 提取并保存图片
        img_count = 0
        for i, img in enumerate(soup.find_all('img')):
            src = img.get('src') or img.get('data-src')
            if src:
                src = str(src)  # 转换为字符串
                if src.startswith('data:'):
                    continue
                ext = os.path.splitext(urlparse(src).path)[1] or '.jpg'
                img_filename = f"img_{i}{ext}"
                if save_resource(src, article_dir / 'img' / img_filename, url):
                    img_count += 1
                    if img.get('src'):
                        img['src'] = f"img/{img_filename}"
                    if img.get('data-src'):
                        img['data-src'] = f"img/{img_filename}"
        print(f"  ✓ 图片: {img_count} 个文件")
        
        # 保存处理后的HTML（本地资源版本）
        with open(article_dir / 'index.html', 'w', encoding='utf-8') as f:
            f.write(str(soup))
        print(f"  ✓ 本地化HTML已保存")
        
        return True
        
    except Exception as e:
        print(f"  ✗ 保存失败: {e}")
        return False

def main():
    base_dir = Path(__file__).parent.parent
    output_dir = base_dir / 'data' / 'original_pages'
    ensure_dir(output_dir)
    
    print("=" * 50)
    print("开始保存原始网页")
    print("=" * 50)
    
    success_count = 0
    for article_id, url in ARTICLES:
        if save_article(article_id, url, output_dir):
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"完成！成功保存 {success_count}/{len(ARTICLES)} 篇文章")
    print(f"保存位置: {output_dir}")
    print("=" * 50)

if __name__ == '__main__':
    main()
