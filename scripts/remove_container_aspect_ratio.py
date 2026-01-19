#!/usr/bin/env python3
"""移除splat-container的aspect-ratio限制，让容器自适应canvas"""

import re
import os

mirrors_base = '/Volumes/Prism/sharp2/mirrors'
mirror_dirs = ['01', '02', '04', '07', '08']

for mirror_dir in mirror_dirs:
    index_path = os.path.join(mirrors_base, mirror_dir, 'index.html')
    
    if not os.path.exists(index_path):
        continue
    
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 移除容器style中的aspect-ratio:16/9;
    content = re.sub(
        r'(<div class="splat-container"[^>]*style="[^"]*?)aspect-ratio:16/9;',
        r'\1',
        content
    )
    
    # 修改canvas的style：从absolute改为relative，添加aspect-ratio
    content = re.sub(
        r'<canvas class="gsplat-canvas" style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;">',
        '<canvas class="gsplat-canvas" style="position:relative;width:100%;aspect-ratio:16/9;display:block;">',
        content
    )
    
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'✅ 已更新: {index_path}')

print('\n完成！容器现在会自适应16:9的canvas')
