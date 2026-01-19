# Spatial Browsing Demo 项目笔记

## 项目目标
构建一个移动端新闻H5页面Demo，实现类似Apple Spatial Gallery / Spatial Browsing的视差效果：
1. **滚动视差效果**：上下滑动浏览文章时，嵌入的图片/iframe随位置产生空间视差
2. **陀螺仪视差效果**：用户停留时，图片随陀螺仪运动产生视差动效（类似iOS 26空间照片）
3. **桌面端鼠标模拟**：通过鼠标滑动模拟陀螺仪效果（参考marble.worldlabs.ai）

## 技术栈
- **深度估计**: Apple ml-depth-pro (https://github.com/apple/ml-depth-pro)
- **图像锐化**: Apple ml-sharp (https://github.com/apple/ml-sharp)  
- **高斯泼溅渲染**: PlayCanvas SuperSplat (https://github.com/playcanvas/supersplat)
- **前端**: HTML5 + CSS3 + JavaScript

## 数据来源
### 主页截图
- 来自深圳卫视App首页

### 需要爬取的文章页面（共12篇）

#### 顶部新增2篇：
1. https://www.sztv.com.cn/ysz/zx/zbsz/80611955.shtml - 腾讯新闻何毅进："可信度"是AI时代最稀缺的资源
2. https://www.sztv.com.cn/ysz/zx/rd/80611627.shtml - 深度丨中国"三航母时代"渐入佳境，硬核实力震慑"台独"分裂势力

#### 原有10篇：
3. https://www.sztv.com.cn/ysz/zx/tj/80611833.shtml - 深圳出台青年人才住房支持新政
4. https://www.sztv.com.cn/ysz/zx/tj/80611814.shtml - 海南自由贸易港正式启动全岛封关
5. https://www.sztv.com.cn/ysz/zx/tj/80611789.shtml - 外交部亚洲事务特使将再次赴柬埔寨、泰国穿梭调停
6. https://www.sztv.com.cn/ysz/zx/tj/80611791.shtml - 元旦火车票今起开售 购票注意事项请收好
7. https://www.sztv.com.cn/ysz/zx/zw/80611586.shtml - 深圳原创舞剧《咏春》开启北美首演，加拿大媒体刊文点赞
8. https://www.sztv.com.cn/ysz/zx/zw/80611296.shtml - 火出圈的深圳"食物银行"，已上线三年惠及近50万人次
9. https://www.sztv.com.cn/ysz/zx/zw/80611248.shtml - 期待！深圳奇迹的打开方式
10. https://www.sztv.com.cn/ysz/zx/tj/80611001.shtml - 中央财办：扩大内需是明年排在首位的重点任务
11. https://www.sztv.com.cn/ysz/zx/tj/80611004.shtml - 山东舰入列6周年！三航母时代已来，期待更多突破
12. https://www.sztv.com.cn/ysz/zx/tj/80611058.shtml - 台当局辩称"封禁"小红书无关两岸政策 国台办回应

## 参考资料

### Apple Spatial Browsing
- visionOS用户指南: https://support.apple.com/guide/apple-vision-pro/use-spatial-browsing-tan2d245b30e/visionos

### visionOS 26 Spatial Scenes
- 利用生成式AI算法和计算深度创建多视角空间场景
- 用户可以"倾斜和环顾"
- 可在Photos app、Spatial Gallery app和Safari中查看
- 开发者可使用Spatial Scene API

### WWDC Sessions
1. **What's new for the spatial web** (WWDC 2025 #237)
   - HTML model元素显示内联3D模型
   - 模型光照、交互和动画
   - 360度视频和Apple Immersive Video
   - 自定义网页环境

2. **What's new in Safari and WebKit** (WWDC 2025 #233)
   - Scroll driven animation（滚动驱动动画）
   - Cross document view transitions
   - Anchor positioning

3. **Build compelling spatial photo and video experiences** (WWDC 2024 #10166)
   - 立体媒体类型
   - 空间视频捕捉
   - QuickLook Preview Application API
   - 空间照片/视频元数据

### 技术文档
- 写入空间照片: https://developer.apple.com/documentation/ImageIO/writing-spatial-photos
- 创建空间元数据: https://developer.apple.com/documentation/ImageIO/Creating-spatial-photos-and-videos-with-spatial-metadata

## 实现步骤

### Phase 1: 数据准备 ✅ 已完成
1. [x] 爬取12个文章页面的HTML内容
2. [x] 提取文章标题、封面图片、正文内容  
3. [x] 下载并存储所有图片资源
4. [x] **保存原始网页** - HTML/CSS/JS/图片都已保存到 `data/original_pages/`

### Phase 2: 前端实现 ✅ 已完成
1. [x] 构建新闻列表首页（模拟App截图样式）
2. [x] 构建文章详情页
3. [x] 实现滚动视差效果
4. [x] 实现陀螺仪视差效果
5. [x] 实现鼠标hover视差效果（桌面端）
6. [x] 创建PLY测试页面 `ply-test.html`

### Phase 3: 高斯泼溅渲染 ✅ 已完成
1. [x] 创建基础splat-viewer.js
2. [x] 集成PlayCanvas引擎渲染高斯泼溅
3. [x] 使用output文件夹的PLY进行测试
4. [x] 创建 `gsplat-viewer.html` - 真正的3D高斯泼溅查看器
   - 使用PlayCanvas GSplatComponentSystem加载PLY文件
   - 支持鼠标拖动/悬停视差效果
   - 支持陀螺仪控制（移动端）
   - 支持自动旋转
   - 可调节视差强度和相机距离

### Phase 4: 深度图生成（可选）
1. [ ] 配置ml-depth-pro环境
2. [ ] 批量处理图片生成深度图
3. [ ] 可选：使用ml-sharp进行图像增强
4. [ ] 将RGB图片+深度图转换为高斯泼溅格式

### Phase 5: 优化
1. [ ] 性能优化
2. [ ] 移动端适配
3. [ ] 加载动画

## 文件结构规划
```
sharp2/
├── PROJECT_NOTES.md          # 项目笔记
├── server.py                 # 本地HTTP服务器
├── Picsew_20251218113949.JPEG # App首页截图
├── data/
│   ├── articles/             
│   │   └── articles.json     # 文章数据JSON
│   └── original_pages/       # 【新增】原始网页存档
│       ├── 80611955/         # 每篇文章一个目录
│       │   ├── original.html # 原始HTML
│       │   ├── index.html    # 本地化HTML
│       │   ├── css/          # CSS文件
│       │   ├── js/           # JS文件
│       │   └── img/          # 图片文件
│       └── ...
├── output/                   # PLY高斯泼溅文件（已有）
│   ├── teaser.ply
│   └── *.ply
├── frontend/
│   ├── index.html            # 首页（新闻列表）
│   ├── article.html          # 文章详情页
│   ├── ply-test.html         # PLY测试页面（图片视差模拟）
│   ├── gsplat-viewer.html    # 【新增】真正的3D高斯泼溅查看器
│   ├── css/
│   │   ├── style.css         # 主样式
│   │   ├── spatial.css       # 视差效果样式
│   │   └── article.css       # 文章页样式
│   └── js/
│       ├── articles-data.js  # 文章数据
│       ├── main.js           # 主入口
│       ├── spatial-parallax.js # 视差效果核心
│       ├── splat-viewer.js   # 高斯泼溅渲染器
│       └── article.js        # 文章页脚本
├── scripts/
│   ├── scraper.py            # 网页爬虫
│   ├── save_original_pages.py # 【新增】保存原始网页
│   └── depth_gen.py          # 深度图生成
└── .venv/                    # Python虚拟环境
```

## 运行说明

### 启动本地服务器
```bash
cd /Volumes/Prism/sharp2
python server.py
# 或
python -m http.server 8080 --directory frontend
```

### 访问Demo
- 首页: http://localhost:8080
- PLY测试: http://localhost:8080/ply-test.html
- 文章详情: http://localhost:8080/article.html?id=1

### 保存原始网页
```bash
python scripts/save_original_pages.py
```
