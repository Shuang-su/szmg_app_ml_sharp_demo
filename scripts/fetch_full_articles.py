#!/usr/bin/env python3
"""
从sztv.com.cn抓取完整文章内容（包括动态加载的图片）
更新mirrors目录中对应的HTML文件
"""

import os
import re
import asyncio
import hashlib
import requests
from urllib.parse import urljoin, urlparse
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

# 文章配置: mirrors目录 -> 原文URL
ARTICLES = {
    '01': 'https://www.sztv.com.cn/ysz/zx/zbsz/80611955.shtml',  # 腾讯新闻
    '02': 'https://www.sztv.com.cn/ysz/zx/rd/80611627.shtml',    # 深度丨三航母时代
    '03': 'https://www.sztv.com.cn/ysz/zx/tj/80611833.shtml',    # 深圳出台青年人才住房
    '04': 'https://www.sztv.com.cn/ysz/zx/tj/80611814.shtml',    # 海南自由贸易港
    '05': 'https://www.sztv.com.cn/ysz/zx/tj/80611789.shtml',    # 外交部亚洲事务特使
    '06': 'https://www.sztv.com.cn/ysz/zx/tj/80611791.shtml',    # 元旦火车票
    '07': 'https://www.sztv.com.cn/ysz/zx/zw/80611586.shtml',    # 咏春舞剧
    '08': 'https://www.sztv.com.cn/ysz/zx/zw/80611296.shtml',    # 食物银行
    '09': 'https://www.sztv.com.cn/ysz/zx/tj/80611001.shtml',    # 中央财办 (首页ID 10)
    '10': 'https://www.sztv.com.cn/ysz/zx/tj/80611004.shtml',    # 山东舰入列6周年 (首页ID 11)
    '11': 'https://www.sztv.com.cn/ysz/zx/tj/80611058.shtml',    # 台当局小红书 (首页ID 12)
    '12': 'https://www.sztv.com.cn/ysz/zx/zw/80611248.shtml',    # 期待！深圳奇迹 (首页ID 9)
}

MIRRORS_DIR = '/Volumes/Prism/sharp2/mirrors'


def download_image(url: str, save_dir: str) -> str:
    """下载图片到本地，返回本地文件名"""
    try:
        # 生成文件名
        parsed = urlparse(url)
        ext = os.path.splitext(parsed.path)[1] or '.jpg'
        # 使用URL的hash作为文件名，避免重复
        filename = hashlib.md5(url.encode()).hexdigest()[:12] + ext
        
        filepath = os.path.join(save_dir, filename)
        
        # 如果已存在就跳过
        if os.path.exists(filepath):
            print(f"  [跳过] {filename} (已存在)")
            return filename
        
        # 下载
        headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
            'Referer': 'https://www.sztv.com.cn/'
        }
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(resp.content)
        
        print(f"  [下载] {filename} <- {url[:60]}...")
        return filename
    except Exception as e:
        print(f"  [错误] 下载失败 {url}: {e}")
        return None


async def fetch_article_content(url: str) -> tuple:
    """使用Playwright获取渲染后的文章内容"""
    print(f"\n正在抓取: {url}")
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page(
                user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15'
            )
            
            # 使用domcontentloaded而不是networkidle，更快
            await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            
            # 等待文章内容加载
            await page.wait_for_timeout(5000)
            
            # 获取文章正文区域的HTML
            article_body = await page.query_selector('.article-body')
            if article_body:
                content_html = await article_body.inner_html()
            else:
                content_html = ""
            
            # 获取文章标题
            title_el = await page.query_selector('.article-title')
            title = await title_el.inner_text() if title_el else "文章"
            
            # 获取作者和时间
            info = {}
            author_el = await page.query_selector('#author')
            if author_el:
                info['author'] = await author_el.get_attribute('value')
            
            time_el = await page.query_selector('#publishdate')
            if time_el:
                info['publishTime'] = await time_el.get_attribute('value')
            
            await browser.close()
            
        return title.strip(), content_html, info
    except Exception as e:
        print(f"  [错误] 抓取失败: {e}")
        return "", "", {}


def process_content_images(html: str, save_dir: str, base_url: str) -> str:
    """处理HTML中的图片，下载到本地并替换路径"""
    soup = BeautifulSoup(html, 'html.parser')
    
    # 创建images子目录
    img_dir = os.path.join(save_dir, 'images')
    os.makedirs(img_dir, exist_ok=True)
    
    # 查找所有图片
    for img in soup.find_all('img'):
        src = img.get('src') or img.get('data-src') or img.get('data-original')
        if not src:
            continue
        
        # 处理相对路径
        if not src.startswith('http'):
            src = urljoin(base_url, src)
        
        # 跳过base64图片
        if src.startswith('data:'):
            continue
        
        # 下载图片
        local_name = download_image(src, img_dir)
        if local_name:
            # 更新src为本地路径
            img['src'] = f'images/{local_name}'
            # 移除懒加载属性
            for attr in ['data-src', 'data-original', 'data-lazy']:
                if img.has_attr(attr):
                    del img[attr]
    
    return str(soup)


def update_mirror_html(mirror_dir: str, new_content: str, title: str, info: dict = None):
    """更新mirrors中的HTML文件"""
    html_path = os.path.join(mirror_dir, 'index.html')
    
    if not os.path.exists(html_path):
        print(f"  [错误] 找不到 {html_path}")
        return
    
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # 更新标题
    title_el = soup.find('title')
    if title_el and title:
        title_el.string = title
    
    article_title = soup.find(class_='article-title')
    if article_title and title:
        article_title.string = title
    
    # 更新作者和时间信息
    if info:
        info_div = soup.find(class_='info')
        if info_div:
            info_html = ''
            if info.get('author'):
                info_html += f'<span class="source">{info["author"]}</span>'
            if info.get('publishTime'):
                info_html += f'<span class="time">{info["publishTime"]}</span>'
            if info_html:
                info_div.clear()
                info_soup = BeautifulSoup(info_html, 'html.parser')
                for child in info_soup.children:
                    info_div.append(child)
                print(f"  [更新] 作者/时间: {info.get('author', '')} {info.get('publishTime', '')}")
    
    # 找到article-body并替换内容
    article_body = soup.find(id='content') or soup.find(class_='article-body')
    if article_body:
        # 清空现有内容
        article_body.clear()
        # 添加新内容
        new_soup = BeautifulSoup(new_content, 'html.parser')
        for child in new_soup.children:
            article_body.append(child)
        
        print(f"  [更新] article-body 内容已替换")
    else:
        print(f"  [警告] 找不到 article-body 元素")
    
    # 保存
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    
    print(f"  [保存] {html_path}")


async def main():
    print("=" * 60)
    print("开始抓取文章完整内容")
    print("=" * 60)
    
    for mirror_id, url in ARTICLES.items():
        mirror_dir = os.path.join(MIRRORS_DIR, mirror_id)
        
        if not os.path.exists(mirror_dir):
            print(f"\n[跳过] {mirror_id}: 目录不存在")
            continue
        
        print(f"\n{'='*40}")
        print(f"处理 mirrors/{mirror_id}")
        print(f"URL: {url}")
        
        # 1. 获取渲染后的文章内容
        title, content_html, info = await fetch_article_content(url)
        
        if not content_html or len(content_html) < 100:
            print(f"  [警告] 获取到的内容太短或为空，跳过")
            continue
        
        print(f"  [获取] 标题: {title}")
        print(f"  [获取] 内容长度: {len(content_html)} 字符")
        
        # 2. 处理图片 - 下载到本地
        processed_html = process_content_images(content_html, mirror_dir, url)
        
        # 3. 更新HTML文件
        update_mirror_html(mirror_dir, processed_html, title, info)
    
    print("\n" + "=" * 60)
    print("完成!")
    print("=" * 60)


if __name__ == '__main__':
    asyncio.run(main())
