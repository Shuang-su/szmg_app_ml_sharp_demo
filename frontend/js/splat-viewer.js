/**
 * Gaussian Splat 渲染器
 * 基于 PlayCanvas SuperSplat 的简化实现
 * 用于在网页中渲染 .ply 高斯泼溅文件
 */

class GaussianSplatViewer {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        this.options = {
            autoRotate: options.autoRotate || false,
            rotateSpeed: options.rotateSpeed || 0.5,
            enableGyro: options.enableGyro !== false,
            enableMouse: options.enableMouse !== false,
            backgroundColor: options.backgroundColor || [0, 0, 0, 0],
            fov: options.fov || 60,
            near: options.near || 0.1,
            far: options.far || 1000,
            ...options
        };

        this.canvas = null;
        this.gl = null;
        this.plyData = null;
        this.rotation = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.isLoading = false;
        this.isReady = false;
        
        // 交互状态
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };
        this.gyroData = { alpha: 0, beta: 0, gamma: 0 };
        
        this.init();
    }

    init() {
        // 创建Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'width: 100%; height: 100%; display: block;';
        this.container.appendChild(this.canvas);

        // 初始化WebGL
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            this.showFallback();
            return;
        }

        // 设置大小
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // 绑定事件
        this.bindEvents();

        // 开始渲染循环
        this.animate();
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    bindEvents() {
        // 鼠标事件
        if (this.options.enableMouse) {
            this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
            document.addEventListener('mousemove', (e) => this.onMouseMove(e));
            document.addEventListener('mouseup', () => this.onMouseUp());
            
            this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
            document.addEventListener('touchmove', (e) => this.onTouchMove(e));
            document.addEventListener('touchend', () => this.onTouchEnd());
        }

        // 陀螺仪事件
        if (this.options.enableGyro && window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => this.onDeviceOrientation(e));
        }
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.lastMouse = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
    }

    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastMouse.x;
        const deltaY = e.clientY - this.lastMouse.y;
        
        this.targetRotation.y += deltaX * 0.5;
        this.targetRotation.x += deltaY * 0.5;
        this.targetRotation.x = Math.max(-60, Math.min(60, this.targetRotation.x));
        
        this.lastMouse = { x: e.clientX, y: e.clientY };
    }

    onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }

    onTouchMove(e) {
        if (!this.isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        
        const deltaX = e.touches[0].clientX - this.lastMouse.x;
        const deltaY = e.touches[0].clientY - this.lastMouse.y;
        
        this.targetRotation.y += deltaX * 0.5;
        this.targetRotation.x += deltaY * 0.5;
        this.targetRotation.x = Math.max(-60, Math.min(60, this.targetRotation.x));
        
        this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }

    onTouchEnd() {
        this.isDragging = false;
    }

    onDeviceOrientation(e) {
        if (!this.isDragging) {
            this.gyroData = {
                alpha: e.alpha || 0,
                beta: e.beta || 0,
                gamma: e.gamma || 0
            };
            
            // 将陀螺仪数据映射到旋转
            this.targetRotation.x = this.gyroData.beta * 0.3;
            this.targetRotation.y = this.gyroData.gamma * 0.5;
        }
    }

    async loadPLY(url) {
        this.isLoading = true;
        this.showLoading();

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load PLY: ${response.status}`);
            
            const arrayBuffer = await response.arrayBuffer();
            this.plyData = this.parsePLY(arrayBuffer);
            
            this.isReady = true;
            this.hideLoading();
            console.log(`Loaded PLY: ${this.plyData.vertexCount} vertices`);
            
        } catch (error) {
            console.error('Error loading PLY:', error);
            this.showError(error.message);
        }
        
        this.isLoading = false;
    }

    parsePLY(arrayBuffer) {
        const decoder = new TextDecoder();
        const data = new Uint8Array(arrayBuffer);
        
        // 查找header结束位置
        let headerEnd = 0;
        const endHeader = 'end_header\n';
        const text = decoder.decode(data.subarray(0, Math.min(4096, data.length)));
        headerEnd = text.indexOf(endHeader);
        
        if (headerEnd === -1) {
            throw new Error('Invalid PLY file: no end_header found');
        }
        headerEnd += endHeader.length;

        // 解析header
        const header = text.substring(0, headerEnd);
        const lines = header.split('\n');
        
        let vertexCount = 0;
        let format = 'ascii';
        const properties = [];
        
        for (const line of lines) {
            const parts = line.trim().split(' ');
            if (parts[0] === 'element' && parts[1] === 'vertex') {
                vertexCount = parseInt(parts[2]);
            } else if (parts[0] === 'format') {
                format = parts[1];
            } else if (parts[0] === 'property') {
                properties.push({
                    type: parts[1],
                    name: parts[2]
                });
            }
        }

        // 解析顶点数据
        const vertices = [];
        const colors = [];
        
        if (format === 'binary_little_endian') {
            const dataView = new DataView(arrayBuffer, headerEnd);
            let offset = 0;
            
            for (let i = 0; i < vertexCount; i++) {
                // 读取位置 (x, y, z)
                const x = dataView.getFloat32(offset, true); offset += 4;
                const y = dataView.getFloat32(offset, true); offset += 4;
                const z = dataView.getFloat32(offset, true); offset += 4;
                vertices.push(x, y, z);
                
                // 跳过其他属性，读取颜色
                // 这是简化处理，实际需要根据header解析
                offset += (properties.length - 3) * 4;
                
                // 默认颜色
                colors.push(1.0, 1.0, 1.0, 1.0);
            }
        } else {
            // ASCII格式
            const dataText = decoder.decode(data.subarray(headerEnd));
            const dataLines = dataText.trim().split('\n');
            
            for (let i = 0; i < Math.min(vertexCount, dataLines.length); i++) {
                const values = dataLines[i].trim().split(/\s+/).map(parseFloat);
                if (values.length >= 3) {
                    vertices.push(values[0], values[1], values[2]);
                    
                    // 如果有颜色信息
                    if (values.length >= 6) {
                        colors.push(
                            values[3] / 255,
                            values[4] / 255,
                            values[5] / 255,
                            1.0
                        );
                    } else {
                        colors.push(1.0, 1.0, 1.0, 1.0);
                    }
                }
            }
        }

        return {
            vertexCount: vertices.length / 3,
            vertices: new Float32Array(vertices),
            colors: new Float32Array(colors)
        };
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 平滑旋转
        this.rotation.x += (this.targetRotation.x - this.rotation.x) * 0.1;
        this.rotation.y += (this.targetRotation.y - this.rotation.y) * 0.1;
        
        // 自动旋转
        if (this.options.autoRotate && !this.isDragging) {
            this.targetRotation.y += this.options.rotateSpeed;
        }
        
        this.render();
    }

    render() {
        const gl = this.gl;
        if (!gl) return;

        // 清除背景
        const bg = this.options.backgroundColor;
        gl.clearColor(bg[0], bg[1], bg[2], bg[3]);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (!this.isReady || !this.plyData) return;

        // 简化渲染 - 实际项目应使用shader进行高斯泼溅渲染
        // 这里只是占位，显示点云
        this.renderPointCloud();
    }

    renderPointCloud() {
        // 这是一个简化的点云渲染
        // 真正的高斯泼溅渲染需要更复杂的shader
        const gl = this.gl;
        
        // 创建简单的点渲染（仅用于演示）
        if (!this.pointProgram) {
            this.initPointRenderer();
        }
        
        if (this.pointProgram && this.plyData) {
            gl.useProgram(this.pointProgram);
            
            // 更新uniform
            const rotX = this.rotation.x * Math.PI / 180;
            const rotY = this.rotation.y * Math.PI / 180;
            
            gl.uniform2f(
                gl.getUniformLocation(this.pointProgram, 'uRotation'),
                rotX, rotY
            );
            
            gl.drawArrays(gl.POINTS, 0, this.plyData.vertexCount);
        }
    }

    initPointRenderer() {
        const gl = this.gl;
        
        const vertexShader = `
            attribute vec3 aPosition;
            attribute vec4 aColor;
            uniform vec2 uRotation;
            varying vec4 vColor;
            
            void main() {
                float cx = cos(uRotation.x);
                float sx = sin(uRotation.x);
                float cy = cos(uRotation.y);
                float sy = sin(uRotation.y);
                
                vec3 pos = aPosition;
                
                // 旋转Y
                float x1 = pos.x * cy - pos.z * sy;
                float z1 = pos.x * sy + pos.z * cy;
                pos.x = x1;
                pos.z = z1;
                
                // 旋转X
                float y1 = pos.y * cx - pos.z * sx;
                float z2 = pos.y * sx + pos.z * cx;
                pos.y = y1;
                pos.z = z2;
                
                gl_Position = vec4(pos * 0.5, 1.0);
                gl_PointSize = 2.0;
                vColor = aColor;
            }
        `;
        
        const fragmentShader = `
            precision mediump float;
            varying vec4 vColor;
            
            void main() {
                gl_FragColor = vColor;
            }
        `;
        
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vertexShader);
        gl.compileShader(vs);
        
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fragmentShader);
        gl.compileShader(fs);
        
        this.pointProgram = gl.createProgram();
        gl.attachShader(this.pointProgram, vs);
        gl.attachShader(this.pointProgram, fs);
        gl.linkProgram(this.pointProgram);
        
        // 创建缓冲区
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.plyData.vertices, gl.STATIC_DRAW);
        
        const posLoc = gl.getAttribLocation(this.pointProgram, 'aPosition');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.plyData.colors, gl.STATIC_DRAW);
        
        const colorLoc = gl.getAttribLocation(this.pointProgram, 'aColor');
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    }

    showLoading() {
        if (this.loadingEl) return;
        this.loadingEl = document.createElement('div');
        this.loadingEl.className = 'splat-loading';
        this.loadingEl.innerHTML = `
            <div class="splat-spinner"></div>
            <span>加载3D模型...</span>
        `;
        this.container.appendChild(this.loadingEl);
    }

    hideLoading() {
        if (this.loadingEl) {
            this.loadingEl.remove();
            this.loadingEl = null;
        }
    }

    showError(message) {
        this.hideLoading();
        const errorEl = document.createElement('div');
        errorEl.className = 'splat-error';
        errorEl.innerHTML = `<span>⚠️ ${message}</span>`;
        this.container.appendChild(errorEl);
    }

    showFallback() {
        const fallbackEl = document.createElement('div');
        fallbackEl.className = 'splat-fallback';
        fallbackEl.innerHTML = `
            <span>您的浏览器不支持WebGL</span>
            <small>请使用现代浏览器查看3D效果</small>
        `;
        this.container.appendChild(fallbackEl);
    }

    setRotation(x, y) {
        this.targetRotation.x = x;
        this.targetRotation.y = y;
    }

    destroy() {
        if (this.canvas) {
            this.canvas.remove();
        }
        window.removeEventListener('resize', this.resize);
    }
}

// 添加CSS样式
const splatStyles = document.createElement('style');
splatStyles.textContent = `
    .splat-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: white;
        z-index: 10;
    }
    
    .splat-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: splat-spin 1s linear infinite;
    }
    
    @keyframes splat-spin {
        to { transform: rotate(360deg); }
    }
    
    .splat-error, .splat-fallback {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: white;
        padding: 20px;
    }
    
    .splat-fallback small {
        display: block;
        margin-top: 8px;
        opacity: 0.7;
    }
`;
document.head.appendChild(splatStyles);

// 导出
window.GaussianSplatViewer = GaussianSplatViewer;
