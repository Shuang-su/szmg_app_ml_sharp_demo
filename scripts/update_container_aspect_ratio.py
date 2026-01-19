#!/usr/bin/env python3
"""
更新mirrors HTML中的gsplat容器为16:9宽高比（与gsplat-viewer2.html一致）
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

def update_aspect_ratio(file_path):
    """更新单个HTML文件中的容器宽高比"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 替换 min-height:400px 为 aspect-ratio:16/9（移除min-height，添加aspect-ratio）
        # 匹配整个splat-container的style属性
        pattern = r'(<div class="splat-container"[^>]*style="[^"]*?)min-height:400px;([^"]*")'
        
        def add_aspect_ratio(match):
            before = match.group(1)
            after = match.group(2)
            # 如果已经有aspect-ratio，不重复添加
            if 'aspect-ratio' in before + after:
                return match.group(0)
            # 在width:100%后添加aspect-ratio:16/9
            result = before.replace('width:100%;', 'width:100%;aspect-ratio:16/9;') + after
            return result
        
        content = re.sub(pattern, add_aspect_ratio, content)
        
        # 同时从canvas样式中移除min-height
        content = re.sub(
            r'(<canvas class="gsplat-canvas"[^>]*style="[^"]*?)min-height:400px;([^"]*">)',
            r'\1\2',
            content
        )
        
        if content != original_content:
            # 创建备份
            backup_path = str(file_path) + '.aspect_bak'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            
            # 写入更新
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f'✅ 已更新为16:9比例: {file_path}')
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
    
    print('📐 更新容器为16:9宽高比...\n')
    
    updated = 0
    for file_path in files_to_update:
        if file_path.exists():
            if update_aspect_ratio(file_path):
                updated += 1
    
    print(f'\n✨ 完成! 已更新 {updated} 个文件')

if __name__ == '__main__':
    main()
