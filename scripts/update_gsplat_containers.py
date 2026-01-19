#!/usr/bin/env python3
"""
更新所有mirrors HTML中的gsplat容器为gsplat-viewer2.html的完整样式
"""

import re
import os
from pathlib import Path

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent

# 新的gsplat容器模板（gsplat-viewer2.html风格）
NEW_CONTAINER_TEMPLATE = '''<div class="splat-container" data-ply="{ply_id}" style="position:relative;width:100%;min-height:400px;background:#0d0d1a;border-radius:16px;overflow:hidden;margin:16px 0;box-shadow:0 8px 32px rgba(0,0,0,0.3);">
    <canvas class="gsplat-canvas" style="width:100%;height:100%;min-height:400px;display:block;"></canvas>
    <div class="gsplat-loading" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
        <div style="width:48px;height:48px;border:3px solid rgba(255,255,255,0.1);border-top-color:#e91e63;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto;"></div>
        <div style="margin-top:16px;font-size:14px;color:rgba(255,255,255,0.7);">加载3D模型...</div>
    </div>
</div>'''

def update_gsplat_containers(file_path):
    """更新单个HTML文件中的gsplat容器"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 匹配现有的splat-container并提取data-ply值
        # 更宽松的正则表达式，匹配整个div块
        pattern = r'<div\s+class="splat-container"[^>]*data-ply="([^"]+)"[^>]*>.*?</div>\s*</div>'
        
        def replace_container(match):
            ply_id = match.group(1)
            return NEW_CONTAINER_TEMPLATE.format(ply_id=ply_id)
        
        # 使用DOTALL标志让.匹配换行符
        content = re.sub(pattern, replace_container, content, flags=re.DOTALL)
        
        if content != original_content:
            # 创建备份
            backup_path = str(file_path) + '.container_bak'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            
            # 写入更新后的内容
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f'✅ 已更新: {file_path}')
            return True
        else:
            print(f'ℹ️ 未找到需要更新的容器: {file_path}')
            return False
            
    except Exception as e:
        print(f'❌ 处理文件失败 {file_path}: {e}')
        return False

def main():
    mirrors_dir = PROJECT_ROOT / 'mirrors'
    
    # 需要处理的文件映射
    files_to_update = [
        mirrors_dir / '01' / 'index.html',  # 1个模型
        mirrors_dir / '02' / 'index.html',  # 1个模型
        mirrors_dir / '04' / 'index.html',  # 1个模型
        mirrors_dir / '07' / 'index.html',  # 1个模型
        mirrors_dir / '08' / 'index.html',  # 6个模型
    ]
    
    print('🔧 开始更新gsplat容器样式...\n')
    
    updated_count = 0
    for file_path in files_to_update:
        if file_path.exists():
            if update_gsplat_containers(file_path):
                updated_count += 1
        else:
            print(f'⚠️ 文件不存在: {file_path}')
    
    print(f'\n✨ 完成! 已更新 {updated_count} 个文件')

if __name__ == '__main__':
    main()
