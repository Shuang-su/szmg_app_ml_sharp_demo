#!/usr/bin/env python3
"""
更新mirrors HTML为弹性高度方案（避免黑边同时保持16:9比例）
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

def update_to_flexible_height(file_path):
    """更新为弹性高度方案"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 替换容器的style - 移除aspect-ratio，添加弹性高度
        pattern = r'(<div class="splat-container"[^>]*style=")([^"]*?)(")'
        
        def update_container_style(match):
            prefix = match.group(1)
            old_style = match.group(2)
            suffix = match.group(3)
            
            # 移除aspect-ratio
            new_style = re.sub(r'aspect-ratio:\s*16/9;?', '', old_style)
            
            # 确保有基础样式
            if 'position:relative' not in new_style:
                new_style = 'position:relative;' + new_style
            if 'width:100%' not in new_style:
                new_style = new_style.replace('position:relative;', 'position:relative;width:100%;')
            
            # 添加弹性高度
            height_styles = 'min-height:300px;height:56.25vw;max-height:calc(100vw * 9 / 16);'
            
            # 插入到width后面
            new_style = new_style.replace('width:100%;', f'width:100%;{height_styles}')
            
            return prefix + new_style + suffix
        
        content = re.sub(pattern, update_container_style, content)
        
        if content != original_content:
            # 创建备份
            backup_path = str(file_path) + '.flex_bak'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            
            # 写入更新
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f'✅ 已更新为弹性高度: {file_path}')
            return True
        else:
            print(f'ℹ️ 无需更新: {file_path}')
            return False
            
    except Exception as e:
        print(f'❌ 处理失败 {file_path}: {e}')
        return False

def main():
    mirrors_dir = PROJECT_ROOT / 'mirrors'
    
    files_to_update = [
        mirrors_dir / '01' / 'index.html',
        mirrors_dir / '02' / 'index.html',
        mirrors_dir / '04' / 'index.html',
        mirrors_dir / '07' / 'index.html',
        mirrors_dir / '08' / 'index.html',
    ]
    
    print('🎨 更新为弹性高度方案（避免黑边+保持16:9）...\n')
    
    updated = 0
    for file_path in files_to_update:
        if file_path.exists():
            if update_to_flexible_height(file_path):
                updated += 1
    
    print(f'\n✨ 完成! 已更新 {updated} 个文件')

if __name__ == '__main__':
    main()
