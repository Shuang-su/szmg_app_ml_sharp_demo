#!/usr/bin/env python3
"""
文章爬虫脚本 - 爬取深圳卫视新闻文章内容和图片
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import re
from urllib.parse import urljoin
from datetime import datetime

# 文章列表
ARTICLES = [
    {
        "id": 1,
        "url": "https://www.sztv.com.cn/ysz/zx/zbsz/80611955.shtml",
        "title": "腾讯新闻何毅进：\"可信度\"是AI时代最稀缺的资源"
    },
    {
        "id": 2,
        "url": "https://www.sztv.com.cn/ysz/zx/rd/80611627.shtml",
        "title": "深度丨中国\"三航母时代\"渐入佳境，硬核实力震慑\"台独\"分裂势力"
    },
    {
        "id": 3,
        "url": "https://www.sztv.com.cn/ysz/zx/tj/80611833.shtml",
        "title": "深圳出台青年人才住房支持新政"
    },
    {
        "id": 4,
        "url": "https://www.sztv.com.cn/ysz/zx/tj/80611814.shtml",
        "title": "海南自由贸易港正式启动全岛封关"
    },
    {
        "id": 5,
        "url": "https://www.sztv.com.cn/ysz/zx/tj/80611789.shtml",
        "title": "外交部亚洲事务特使将再次赴柬埔寨、泰国穿梭调停"
    },
    {
        "id": 6,
        "url": "https://www.sztv.com.cn/ysz/zx/tj/80611791.shtml",
        "title": "元旦火车票今起开售 购票注意事项请收好"
    },
    {
        "id": 7,
        "url": "https://www.sztv.com.cn/ysz/zx/zw/80611586.shtml",
        "title": "深圳原创舞剧《咏春》开启北美首演，加拿大媒体刊文点赞"
    },
    {
        "id": 8,
        "url": "https://www.sztv.com.cn/ysz/zx/zw/80611296.shtml",
        "title": "火出圈的深圳\"食物银行\"，已上线三年惠及近50万人次"
    },
    {
        "id": 9,
        "url": "https://www.sztv.com.cn/ysz/zx/zw/80611248.shtml",
        "title": "期待！深圳奇迹的打开方式"
    },
    {
        "id": 10,
        "url": "https://www.sztv.com.cn/ysz/zx/tj/80611001.shtml",
        "title": "中央财办：扩大内需是明年排在首位的重点任务"
    },
    {
        "id": 11,
        "url": "https://www.sztv.com.cn/ysz/zx/tj/80611004.shtml",
        "title": "山东舰入列6周年！三航母时代已来，期待更多突破"
    },
    {
        "id": 12,
        "url": "https://www.sztv.com.cn/ysz/zx/tj/80611058.shtml",
        "title": "台当局辩称\"封禁\"小红书无关两岸政策 国台办回应"
    }
]

# 请求头
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}

def ensure_dir(path):
    """确保目录存在"""
    if not os.path.exists(path):
        os.makedirs(path)

def download_image(url, save_path):
    """下载图片"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            print(f"  ✓ 下载图片: {save_path}")
            return True
    except Exception as e:
        print(f"  ✗ 下载失败 {url}: {e}")
    return False

def scrape_article(article):
    """爬取单篇文章"""
    print(f"\n正在爬取: {article['title']}")
    
    try:
        response = requests.get(article['url'], headers=HEADERS, timeout=30)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 提取文章内容
        content_div = soup.find('div', class_='article-content') or soup.find('div', class_='content')
        
        # 提取所有图片
        images = []
        img_tags = soup.find_all('img')
        
        for img in img_tags:
            src = img.get('src') or img.get('data-src')
            if src:
                src = str(src)  # 转换为字符串
                # 跳过logo、图标等
                if any(skip in src.lower() for skip in ['logo', 'icon', 'sofa', 'send', 'line.png', 'default.jpg']):
                    continue
                # 转换为绝对URL
                full_url = urljoin(article['url'], src)
                if full_url not in images:
                    images.append(full_url)
        
        # 提取发布时间和来源
        source = ""
        pub_time = ""
        meta_info = soup.find('div', class_='article-info') or soup.find('div', class_='info')
        if meta_info:
            text = meta_info.get_text()
            # 尝试提取时间
            time_match = re.search(r'\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}', text)
            if time_match:
                pub_time = time_match.group()
        
        # 提取正文内容（纯文本）
        content_text = ""
        if content_div:
            content_text = content_div.get_text(strip=True)
        
        article_data = {
            "id": article['id'],
            "title": article['title'],
            "url": article['url'],
            "source": source,
            "publish_time": pub_time,
            "images": images,
            "content": content_text[:500] + "..." if len(content_text) > 500 else content_text
        }
        
        print(f"  找到 {len(images)} 张图片")
        return article_data
        
    except Exception as e:
        print(f"  ✗ 爬取失败: {e}")
        return None

def main():
    """主函数"""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, 'data')
    articles_dir = os.path.join(data_dir, 'articles')
    images_dir = os.path.join(data_dir, 'images')
    
    ensure_dir(articles_dir)
    ensure_dir(images_dir)
    
    all_articles = []
    
    for article in ARTICLES:
        article_data = scrape_article(article)
        if article_data:
            all_articles.append(article_data)
            
            # 下载图片
            article_img_dir = os.path.join(images_dir, f"article_{article['id']}")
            ensure_dir(article_img_dir)
            
            local_images = []
            for idx, img_url in enumerate(article_data['images']):
                ext = os.path.splitext(img_url.split('?')[0])[1] or '.jpg'
                img_filename = f"img_{idx+1}{ext}"
                img_path = os.path.join(article_img_dir, img_filename)
                
                if download_image(img_url, img_path):
                    local_images.append({
                        "original_url": img_url,
                        "local_path": f"images/article_{article['id']}/{img_filename}"
                    })
            
            article_data['local_images'] = local_images
    
    # 保存文章数据
    output_file = os.path.join(articles_dir, 'articles.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_articles, f, ensure_ascii=False, indent=2)
    
    print(f"\n\n✓ 爬取完成！共 {len(all_articles)} 篇文章")
    print(f"✓ 数据已保存到: {output_file}")

if __name__ == '__main__':
    main()
