/**
 * Spatial Parallax 视差效果核心模块
 * 
 * 实现三种视差效果：
 * 1. 滚动视差 - 上下滑动时图片产生空间位移
 * 2. 陀螺仪视差 - 移动端设备倾斜时产生视差
 * 3. 鼠标视差 - 桌面端鼠标移动时产生视差
 */

class SpatialParallax {
    constructor(options = {}) {
        // 配置选项
        this.config = {
            // 滚动视差强度 (0-1)
            scrollIntensity: options.scrollIntensity || 0.15,
            // 陀螺仪视差强度 (0-1)
            gyroIntensity: options.gyroIntensity || 0.08,
            // 鼠标视差强度 (0-1)
            mouseIntensity: options.mouseIntensity || 0.05,
            // 透视深度
            perspective: options.perspective || 1000,
            // 最大位移角度
            maxTilt: options.maxTilt || 15,
            // 平滑过渡时间
            smoothing: options.smoothing || 0.1,
            // 是否启用陀螺仪
            enableGyro: options.enableGyro !== false,
            // 是否启用鼠标
            enableMouse: options.enableMouse !== false,
            // 是否启用滚动
            enableScroll: options.enableScroll !== false,
            // 调试模式
            debug: options.debug || false
        };

        // 状态
        this.state = {
            gyroSupported: false,
            gyroPermissionGranted: false,
            currentGyro: { alpha: 0, beta: 0, gamma: 0 },
            currentMouse: { x: 0.5, y: 0.5 },
            scrollY: 0,
            isScrolling: false,
            scrollTimeout: null,
            activeElements: new Set(),
            rafId: null,
            lastUpdate: 0
        };

        // 绑定方法
        this.handleScroll = this.handleScroll.bind(this);
        this.handleGyro = this.handleGyro.bind(this);
        this.handleMouse = this.handleMouse.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.update = this.update.bind(this);

        // 初始化
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 检测陀螺仪支持
        this.detectGyroSupport();
        
        // 添加事件监听
        this.addEventListeners();
        
        // 开始更新循环
        this.startUpdateLoop();

        if (this.config.debug) {
            console.log('[SpatialParallax] 初始化完成', this.config);
        }
    }

    /**
     * 检测陀螺仪支持
     */
    detectGyroSupport() {
        if (window.DeviceOrientationEvent) {
            this.state.gyroSupported = true;
            
            // iOS 13+ 需要请求权限
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // 权限需要用户交互后请求
                this.state.gyroPermissionGranted = false;
            } else {
                // 其他设备直接可用
                this.state.gyroPermissionGranted = true;
            }
        }

        if (this.config.debug) {
            console.log('[SpatialParallax] 陀螺仪支持:', this.state.gyroSupported);
        }
    }

    /**
     * 请求陀螺仪权限 (iOS)
     */
    async requestGyroPermission() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                this.state.gyroPermissionGranted = permission === 'granted';
                
                if (this.state.gyroPermissionGranted) {
                    window.addEventListener('deviceorientation', this.handleGyro);
                }
                
                return this.state.gyroPermissionGranted;
            } catch (error) {
                console.warn('[SpatialParallax] 陀螺仪权限请求失败:', error);
                return false;
            }
        }
        return true;
    }

    /**
     * 添加事件监听
     */
    addEventListeners() {
        // 滚动事件
        if (this.config.enableScroll) {
            const scrollContainer = document.querySelector('.news-feed') || window;
            scrollContainer.addEventListener('scroll', this.handleScroll, { passive: true });
        }

        // 陀螺仪事件
        if (this.config.enableGyro && this.state.gyroSupported && this.state.gyroPermissionGranted) {
            window.addEventListener('deviceorientation', this.handleGyro);
        }

        // 鼠标事件
        if (this.config.enableMouse) {
            document.addEventListener('mousemove', this.handleMouse, { passive: true });
        }
    }

    /**
     * 处理滚动事件
     */
    handleScroll(e) {
        const target = e.target === document ? document.documentElement : e.target;
        this.state.scrollY = target.scrollTop || window.scrollY;
        this.state.isScrolling = true;

        // 清除之前的超时
        if (this.state.scrollTimeout) {
            clearTimeout(this.state.scrollTimeout);
        }

        // 滚动结束检测
        this.state.scrollTimeout = setTimeout(() => {
            this.state.isScrolling = false;
        }, 150);
    }

    /**
     * 处理陀螺仪事件
     */
    handleGyro(e) {
        // 归一化陀螺仪数据到 -1 到 1 范围
        this.state.currentGyro = {
            alpha: e.alpha || 0,
            beta: this.clamp((e.beta || 0) / 45, -1, 1),  // 前后倾斜
            gamma: this.clamp((e.gamma || 0) / 45, -1, 1)  // 左右倾斜
        };
    }

    /**
     * 处理鼠标移动事件
     */
    handleMouse(e) {
        // 归一化鼠标位置到 0-1 范围
        this.state.currentMouse = {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight
        };
    }

    /**
     * 处理鼠标离开
     */
    handleMouseLeave() {
        // 重置到中心
        this.state.currentMouse = { x: 0.5, y: 0.5 };
    }

    /**
     * 开始更新循环
     */
    startUpdateLoop() {
        const loop = (timestamp) => {
            // 限制更新频率
            if (timestamp - this.state.lastUpdate > 16) { // ~60fps
                this.update();
                this.state.lastUpdate = timestamp;
            }
            this.state.rafId = requestAnimationFrame(loop);
        };
        this.state.rafId = requestAnimationFrame(loop);
    }

    /**
     * 停止更新循环
     */
    stopUpdateLoop() {
        if (this.state.rafId) {
            cancelAnimationFrame(this.state.rafId);
            this.state.rafId = null;
        }
    }

    /**
     * 更新所有活动元素
     */
    update() {
        this.state.activeElements.forEach(element => {
            this.updateElement(element);
        });
    }

    /**
     * 更新单个元素
     */
    updateElement(element) {
        const rect = element.getBoundingClientRect();
        const container = document.querySelector('.news-feed') || document.documentElement;
        const containerRect = container.getBoundingClientRect();
        
        // 检查元素是否在视口中
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
            return;
        }

        // 计算元素在视口中的相对位置 (0-1)
        const viewportProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const centerOffset = viewportProgress - 0.5; // -0.5 到 0.5

        // 计算变换值
        let rotateX = 0;
        let rotateY = 0;
        let translateZ = 0;
        let scale = 1;

        // 滚动视差
        if (this.config.enableScroll && this.state.isScrolling) {
            rotateX = centerOffset * this.config.maxTilt * this.config.scrollIntensity;
            translateZ = Math.abs(centerOffset) * -30 * this.config.scrollIntensity;
        }

        // 陀螺仪视差
        if (this.config.enableGyro && this.state.gyroPermissionGranted) {
            rotateX += this.state.currentGyro.beta * this.config.maxTilt * this.config.gyroIntensity;
            rotateY += this.state.currentGyro.gamma * this.config.maxTilt * this.config.gyroIntensity;
        }

        // 鼠标视差（仅当鼠标在元素上方时）
        if (this.config.enableMouse && !('ontouchstart' in window)) {
            const mouseX = this.state.currentMouse.x;
            const mouseY = this.state.currentMouse.y;
            
            // 检查鼠标是否在元素范围内
            const isMouseOver = (
                this.state.currentMouse.x * window.innerWidth >= rect.left &&
                this.state.currentMouse.x * window.innerWidth <= rect.right &&
                this.state.currentMouse.y * window.innerHeight >= rect.top &&
                this.state.currentMouse.y * window.innerHeight <= rect.bottom
            );

            if (isMouseOver) {
                const relativeX = (this.state.currentMouse.x * window.innerWidth - rect.left) / rect.width;
                const relativeY = (this.state.currentMouse.y * window.innerHeight - rect.top) / rect.height;
                
                rotateY += (relativeX - 0.5) * this.config.maxTilt * this.config.mouseIntensity * 2;
                rotateX += (relativeY - 0.5) * -this.config.maxTilt * this.config.mouseIntensity * 2;
                scale = 1.02;
            }
        }

        // 应用变换
        const img = element.querySelector('.news-card-image') || element.querySelector('.spatial-image');
        if (img) {
            img.style.transform = `
                perspective(${this.config.perspective}px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(${translateZ}px)
                scale(${scale})
            `;
        }

        // 更新高光效果
        const highlight = element.querySelector('.specular-highlight');
        if (highlight) {
            const highlightX = 50 + rotateY * 3;
            const highlightY = 30 - rotateX * 2;
            highlight.style.setProperty('--highlight-x', `${highlightX}%`);
            highlight.style.setProperty('--highlight-y', `${highlightY}%`);
        }
    }

    /**
     * 注册元素
     */
    register(element) {
        if (element && !this.state.activeElements.has(element)) {
            this.state.activeElements.add(element);
            element.setAttribute('data-spatial', 'true');
            
            // 添加鼠标事件
            if (this.config.enableMouse) {
                element.addEventListener('mouseleave', this.handleMouseLeave);
            }

            if (this.config.debug) {
                console.log('[SpatialParallax] 注册元素:', element);
            }
        }
    }

    /**
     * 注销元素
     */
    unregister(element) {
        if (element && this.state.activeElements.has(element)) {
            this.state.activeElements.delete(element);
            element.removeAttribute('data-spatial');
            
            // 移除鼠标事件
            if (this.config.enableMouse) {
                element.removeEventListener('mouseleave', this.handleMouseLeave);
            }

            // 重置变换
            const img = element.querySelector('.news-card-image') || element.querySelector('.spatial-image');
            if (img) {
                img.style.transform = '';
            }
        }
    }

    /**
     * 注册所有符合条件的元素
     */
    registerAll(selector = '[data-scroll-parallax]') {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => this.register(el));
    }

    /**
     * 工具函数：限制范围
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * 工具函数：线性插值
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    /**
     * 销毁实例
     */
    destroy() {
        // 停止更新循环
        this.stopUpdateLoop();

        // 移除事件监听
        const scrollContainer = document.querySelector('.news-feed') || window;
        scrollContainer.removeEventListener('scroll', this.handleScroll);
        
        if (this.state.gyroSupported) {
            window.removeEventListener('deviceorientation', this.handleGyro);
        }
        
        document.removeEventListener('mousemove', this.handleMouse);

        // 清理所有元素
        this.state.activeElements.forEach(el => this.unregister(el));
        this.state.activeElements.clear();

        if (this.config.debug) {
            console.log('[SpatialParallax] 已销毁');
        }
    }
}

/**
 * 深度图视差效果
 * 基于深度图实现更真实的视差
 */
class DepthMapParallax extends SpatialParallax {
    constructor(options = {}) {
        super(options);
        this.depthMaps = new Map();
    }

    /**
     * 加载深度图
     */
    async loadDepthMap(element, depthMapUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                // 创建Canvas获取深度数据
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                try {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    this.depthMaps.set(element, {
                        data: imageData.data,
                        width: canvas.width,
                        height: canvas.height
                    });
                    resolve();
                } catch (e) {
                    reject(e);
                }
            };
            img.onerror = reject;
            img.src = depthMapUrl;
        });
    }

    /**
     * 获取指定位置的深度值
     */
    getDepthAt(element, x, y) {
        const depthMap = this.depthMaps.get(element);
        if (!depthMap) return 0.5;

        const px = Math.floor(x * depthMap.width);
        const py = Math.floor(y * depthMap.height);
        const index = (py * depthMap.width + px) * 4;
        
        // 使用灰度值作为深度 (0-1)
        return depthMap.data[index] / 255;
    }

    /**
     * 基于深度图更新元素
     */
    updateElementWithDepth(element) {
        // 继承基础更新逻辑
        super.updateElement(element);
        
        // 如果有深度图，应用额外效果
        const depthMap = this.depthMaps.get(element);
        if (depthMap) {
            // 可以在这里实现更复杂的深度效果
            // 例如：基于深度的模糊、位移等
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpatialParallax, DepthMapParallax };
}

// 全局暴露
window.SpatialParallax = SpatialParallax;
window.DepthMapParallax = DepthMapParallax;
