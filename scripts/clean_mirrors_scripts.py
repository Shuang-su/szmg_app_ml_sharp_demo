#!/usr/bin/env python3
"""清理mirrors HTML文件中的外部脚本引用"""

import re
from pathlib import Path

def clean_html(html_content):
    """删除外部脚本标签但保留HTML结构"""
    # 删除带src的script标签
    html_content = re.sub(r'<script[^>]*\ssrc="[^"]*"[^>]*></script>', '', html_content, flags=re.MULTILINE)
    html_content = re.sub(r'<script[^>]*\ssrc="[^"]*"[^>]*>\s*</script>', '', html_content, flags=re.MULTILINE)
    
    # 删除handleStatFunc调用
    html_content = re.sub(r'<script>\s*handleStatFunc\([^)]*\);\s*</script>', '<script>\n</script>', html_content, flags=re.MULTILINE)
    
    return html_content

def main():
    mirrors_dir = Path('/Volumes/Prism/sharp2/mirrors')
    
    for folder in ['01', '02', '04', '07', '08']:
        html_file = mirrors_dir / folder / 'index.html'
        
        if not html_file.exists():
            print(f"⚠️  文件不存在: {html_file}")
            continue
        
        print(f"📝 处理: {html_file}")
        
        # 读取原始内容
        content = html_file.read_text(encoding='utf-8')
        
        # 清理脚本
        cleaned = clean_html(content)
        
        # 备份并保存
        backup = html_file.with_suffix('.html.cleaned_bak')
        html_file.rename(backup)
        html_file.write_text(cleaned, encoding='utf-8')
        
        print(f"✅ 完成: {folder}")
        print(f"   备份: {backup.name}")
    
    print("\n🎉 所有文件处理完成！")

if __name__ == '__main__':
    main()
