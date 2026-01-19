# SZMG Spatial News Demo

> 🌟 新闻空间照片 Demo - 基于 Apple ml-sharp 和 3D 高斯泼溅技术的沉浸式新闻阅读体验

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://szmg-app-ml-sharp-demo.netlify.app)

## 🎯 项目简介

这是一个**移动端新闻 H5 页面 Demo**，实现类似 Apple Spatial Gallery / Spatial Browsing 的沉浸式视差效果。将普通新闻图片转换为具有空间深度感的 3D 高斯泼溅模型，让用户通过陀螺仪或触摸操作与内容进行交互。

### 核心功能

| 功能 | 描述 |
|------|------|
| 🎠 **滚动视差** | 上下滑动浏览文章时，嵌入的 3D 模型随位置产生空间视差 |
| 📱 **陀螺仪控制** | 移动端设备倾斜时，3D 模型随手机陀螺仪运动产生视差动效 |
| 🖱️ **触摸/鼠标控制** | 支持触摸拖拽和鼠标 hover 控制视角 |
| 🌐 **3D 高斯泼溅** | 使用 PlayCanvas 引擎实时渲染 3DGS 模型，带来真正的空间感 |

## 🚀 在线演示

**👉 [https://szmg-app-ml-sharp-demo.netlify.app](https://szmg-app-ml-sharp-demo.netlify.app)**

> 📱 推荐在移动设备上访问以体验完整的陀螺仪视差效果

## ✨ 技术栈

| 技术 | 用途 | 链接 |
|------|------|------|
| Apple ml-depth-pro | 从单张图片估计深度图 | [GitHub](https://github.com/apple/ml-depth-pro) |
| Apple ml-sharp | 基于深度的图像锐化增强 | [GitHub](https://github.com/apple/ml-sharp) |
| PlayCanvas SuperSplat | 3D 高斯泼溅渲染引擎 | [GitHub](https://github.com/playcanvas/supersplat) |
| HTML5 + CSS3 + JS | 前端 Web 实现 | - |

## 📱 页面说明

| 页面 | 路径 | 功能 |
|------|------|------|
| **首页** | `/index.html` | 新闻列表页，模拟"第一现场"App 首页样式，点击进入文章详情 |
| **文章详情** | `/article.html?id=N` | 文章阅读页，嵌入原始新闻 HTML 并注入 3DGS 渲染容器 |
| **3D 查看器** | `/gsplat-viewer2.html` | 独立的 3DGS 模型预览页，可选择不同 PLY 模型查看 |

## 💻 本地开发

### 快速启动

```bash
# 克隆项目
git clone https://github.com/Shuang-su/szmg_app_ml_sharp_demo.git
cd szmg_app_ml_sharp_demo

# 方式一：Python HTTP 服务器
python3 server.py
# 访问 http://localhost:8080

# 方式二：HTTPS 服务器（移动端陀螺仪需要 HTTPS）
python3 scripts/https_server.py
# 访问 https://localhost:8443
```

### 移动端测试

iOS/Android 设备的陀螺仪 API 需要 HTTPS 环境。你可以：

1. **使用 ngrok 等工具**暴露本地 HTTPS 服务
2. **使用自签名证书**运行 `scripts/https_server.py`
3. **部署到 Netlify** 后在手机上直接访问

> ⚠️ iOS 13+ 需要用户授权才能访问陀螺仪，页面会自动弹出权限请求

## 📂 项目结构

```
szmg_app_ml_sharp_demo/
│
├── frontend/                    # 📁 前端静态文件（Netlify publish 目录）
│   │
│   ├── index.html              # 🏠 首页 - 新闻列表
│   ├── article.html            # 📰 文章详情页 - 含嵌入式 3DGS 渲染
│   ├── gsplat-viewer2.html     # 🎨 3D 查看器 - 独立 PLY 模型预览
│   │
│   ├── css/                    # 🎨 样式文件
│   │   ├── style.css           #    主样式（首页布局、主题色）
│   │   ├── spatial.css         #    空间视差效果样式
│   │   └── article.css         #    文章页面专用样式
│   │
│   ├── js/                     # ⚙️ JavaScript 模块
│   │   ├── main.js             #    主程序入口（视差初始化、陀螺仪权限）
│   │   ├── spatial-parallax.js #    视差效果核心实现
│   │   ├── splat-viewer.js     #    3DGS 渲染逻辑
│   │   └── articles-data.js    #    文章数据配置
│   │
│   ├── img/                    # 🖼️ UI 图片资源（Logo、图标等）
│   ├── covers/                 # 🖼️ 文章封面图（首页列表展示用）
│   │
│   ├── data/                   # 📦 数据资源
│   │   ├── ply/                #    PLY 3D 模型（13 个，约 819MB）
│   │   ├── articles/           #    文章元数据 JSON
│   │   ├── select/             #    文章缩略图
│   │   ├── article_images/     #    文章内嵌图片
│   │   └── original_pages/     #    原始网页截图备份
│   │
│   └── mirrors/                # 📄 爬取的新闻页面
│       └── 01-12/              #    12 篇文章的完整 HTML + 资源
│
├── scripts/                    # 🔧 Python 工具脚本
│   ├── scraper.py              #    网页爬虫
│   ├── fetch_full_articles.py  #    抓取完整文章内容
│   ├── download_images.py      #    批量下载图片
│   ├── https_server.py         #    本地 HTTPS 开发服务器
│   └── ...                     #    其他辅助脚本
│
├── server.py                   # 🖥️ 本地 HTTP 开发服务器
├── netlify.toml                # ☁️ Netlify 部署配置
├── README.md                   # 📖 项目文档（本文件）
└── PROJECT_NOTES.md            # 📝 开发笔记
```

## 🔧 3DGS 工作流程

```
原始图片 → ml-depth-pro(深度估计) → ml-sharp(3D增强) → SuperSplat(转PLY) → PlayCanvas(渲染)
```

1. **深度估计**：使用 Apple ml-depth-pro 从单张图片生成深度图
2. **3D 增强**：使用 Apple ml-sharp 基于深度进行图像锐化
3. **模型转换**：使用 PlayCanvas SuperSplat 转换为 PLY 格式的 3DGS 模型
4. **实时渲染**：在浏览器中使用 PlayCanvas 引擎实时渲染

## 🛠️ 功能清单

- ✅ 新闻列表页面（模拟第一现场 App 首页）
- ✅ 文章详情页面（iframe 嵌入 + 3DGS 注入）
- ✅ 滚动视差效果
- ✅ 陀螺仪视差效果（移动端）
- ✅ 鼠标 hover 视差效果（桌面端）
- ✅ 触摸拖拽控制
- ✅ 3D 高斯泼溅实时渲染
- ✅ 模型懒加载（IntersectionObserver）
- ✅ iOS 陀螺仪权限自动请求
- ✅ 响应式布局适配

## 🤝 相关项目

- [Apple ml-depth-pro](https://github.com/apple/ml-depth-pro) - 单目深度估计
- [Apple ml-sharp](https://github.com/apple/ml-sharp) - 深度感知图像锐化
- [PlayCanvas SuperSplat](https://github.com/playcanvas/supersplat) - 3DGS 编辑器
- [PlayCanvas Engine](https://github.com/playcanvas/engine) - WebGL 游戏引擎

## 📄 License

本项目仅供演示和学习目的。新闻内容版权归原作者所有。

---

<p align="center">
  Made with ❤️ for spatial computing exploration
</p>
