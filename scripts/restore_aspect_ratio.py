#!/usr/bin/env python3
"""
恢复使用aspect-ratio: 16/9（最可靠的方案）
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

def restore_aspect_ratio(file_path):
    """恢复aspect-ratio方案"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 替换容器的style - 使用简洁的aspect-ratio
        pattern = r'(<div class="splat-container"[^>]*style=")([^"]*?)(")'
        
        def update_container_style(match):
            prefix = match.group(1)
            suffix = match.group(3)
            
            # 使用固定的样式
            new_style = 'position:relative;width:100%;aspect-ratio:16/9;background:#0d0d1a;border-radius:16px;overflow:hidden;margin:16px 0;box-shadow:0 8px 32px rgba(0,0,0,0.3);'
            
            return prefix + new_style + suffix
        
        content = re.sub(pattern, update_container_style, content)
        
        # 更新canvas样式 - 添加absolute定位
        canvas_pattern = r'(<canvas class="gsplat-canvas"[^>]*style=")([^"]*?)(")'
        
        def update_canvas_style(match):
            prefix = match.group(1)
            suffix = match.group(3)
            
            new_style = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;'
            
            return prefix + new_style + suffix
        
        content = re.sub(canvas_pattern, update_canvas_style, content)
        
        if content != original_content:
            # 创建备份
            backup_path = str(file_path) + '.aspect_restore_bak'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            
            # 写入更新
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f'✅ 已恢复aspect-ratio: {file_path}')
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
    
    print('🔄 恢复aspect-ratio: 16/9方案...\n')
    
    updated = 0
    for file_path in files_to_update:
        if file_path.exists():
            if restore_aspect_ratio(file_path):
                updated += 1
    
    print(f'\n✨ 完成! 已更新 {updated} 个文件')

if __name__ == '__main__':
    main()
