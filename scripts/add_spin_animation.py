#!/usr/bin/env python3
"""
在mirrors HTML的head中添加spin动画CSS
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

# CSS动画定义
SPIN_ANIMATION_CSS = '''<style>
@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>'''

def add_spin_animation(file_path):
    """在HTML的head中添加spin动画"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已存在spin动画
        if '@keyframes spin' in content:
            print(f'ℹ️ 动画已存在: {file_path}')
            return False
        
        # 在</head>前插入CSS
        if '</head>' in content:
            content = content.replace('</head>', f'{SPIN_ANIMATION_CSS}\n</head>')
            
            # 创建备份
            backup_path = str(file_path) + '.anim_bak'
            with open(file_path, 'r', encoding='utf-8') as f:
                original = f.read()
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original)
            
            # 写入更新
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f'✅ 已添加动画: {file_path}')
            return True
        else:
            print(f'⚠️ 未找到</head>标签: {file_path}')
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
    
    print('🎨 添加spin动画CSS...\n')
    
    updated = 0
    for file_path in files_to_update:
        if file_path.exists():
            if add_spin_animation(file_path):
                updated += 1
    
    print(f'\n✨ 完成! 已更新 {updated} 个文件')

if __name__ == '__main__':
    main()
