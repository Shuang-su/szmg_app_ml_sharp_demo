# SZMG Spatial News Demo

> 深圳广电集团 AI 空间新闻 Demo - 基于 Apple ml-sharp 和 3D 高斯泼溅技术

## 🎯 项目简介

这是一个移动端新闻 H5 页面 Demo，实现类似 Apple Spatial Gallery / Spatial Browsing 的沉浸式视差效果：

1. **滚动视差效果** - 上下滑动浏览文章时，嵌入的图片/iframe 随位置产生空间视差
2. **陀螺仪视差效果** - 用户停留时，图片随手机陀螺仪运动产生视差动效
3. **3D 高斯泼溅渲染** - 使用 PlayCanvas 引擎渲染 3DGS 模型，带来真正的空间感

## ✨ 技术栈

| 技术 | 用途 |
|------|------|
| [Apple ml-depth-pro](https://github.com/apple/ml-depth-pro) | 深度估计 |
| [Apple ml-sharp](https://github.com/apple/ml-sharp) | 图像锐化增强 |
| [PlayCanvas SuperSplat](https://github.com/playcanvas/supersplat) | 3D 高斯泼溅渲染 |
| HTML5 + CSS3 + JavaScript | 前端实现 |

## 🚀 在线演示

- **Netlify**: [https://szmg-sharp-demo.netlify.app](https://szmg-sharp-demo.netlify.app) *(部署后更新)*

## 📱 本地运行

### 方式一：Python HTTP 服务器
```bash
python3 server.py
# 访问 http://localhost:8080
```

### 方式二：HTTPS 服务器（用于移动端陀螺仪功能）
```bash
python3 scripts/https_server.py
# 访问 https://localhost:8443
```

> ⚠️ 陀螺仪 API 需要 HTTPS 环境才能在移动端工作

## 📂 项目结构

```
├── frontend/           # 前端静态文件
│   ├── index.html      # 新闻列表首页
│   ├── article.html    # 文章详情页（含 3DGS 渲染）
│   ├── gsplat-viewer.html  # 3D 高斯泼溅查看器
│   ├── css/            # 样式文件
│   └── js/             # JavaScript 文件
├── data/
│   ├── ply/            # PLY 3D 模型文件
│   ├── articles/       # 文章数据
│   └── original_pages/ # 原始页面截图
├── mirrors/            # 爬取的文章 HTML 页面
├── scripts/            # Python 工具脚本
├── server.py           # 本地开发服务器
└── netlify.toml        # Netlify 部署配置
```

## 🛠️ 功能特性

- ✅ 新闻列表页面（模拟深圳卫视 App 首页样式）
- ✅ 文章详情页面
- ✅ 滚动视差效果
- ✅ 陀螺仪视差效果（移动端）
- ✅ 鼠标 hover 视差效果（桌面端）
- ✅ 3D 高斯泼溅（3DGS）渲染
- ✅ 懒加载优化（IntersectionObserver）

## 📄 License

本项目仅供演示和学习目的。

---

*深圳广电集团 × AI 技术团队*
