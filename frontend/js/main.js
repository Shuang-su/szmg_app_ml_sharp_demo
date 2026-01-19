/**
 * 主入口文件
 * 初始化应用和视差效果
 */

// 全局变量
let spatialParallax = null;
let spatialIndicator = null;

/**
 * 渲染新闻卡片
 */
function renderNewsCards(articles) {
    const container = document.getElementById('newsFeed');
    if (!container) return;

    container.innerHTML = articles.map(article => `
        <a href="${article.url}" class="news-card" data-article-id="${article.id}" ${article.hasSpatial ? 'data-scroll-parallax' : ''}>
            <div class="news-card-content">
                <h3 class="news-card-title">${article.title}</h3>
                <div class="news-card-meta">
                    <span class="news-card-source">${article.source}</span>
                    <span class="news-card-time">${article.timeAgo}</span>
                </div>
            </div>
            <div class="news-card-image-wrapper ${article.hasSpatial ? 'spatial' : ''}">
                <img class="news-card-image" 
                     src="${article.coverImage}" 
                     alt="${article.title}"
                     loading="lazy">
                ${article.hasSpatial ? '<div class="specular-highlight"></div>' : ''}
            </div>
        </a>
    `).join('');

    // 重新注册视差元素
    if (spatialParallax) {
        spatialParallax.registerAll('[data-scroll-parallax]');
    }
}

/**
 * 初始化Spatial视差效果
 */
function initSpatialParallax() {
    spatialParallax = new SpatialParallax({
        scrollIntensity: 0.2,
        gyroIntensity: 0.1,
        mouseIntensity: 0.08,
        maxTilt: 12,
        perspective: 800,
        enableGyro: true,
        enableMouse: true,
        enableScroll: true,
        debug: false
    });

    // 注册所有带有视差属性的元素
    spatialParallax.registerAll('[data-scroll-parallax]');

    // 显示Spatial指示器
    spatialIndicator = document.getElementById('spatialIndicator');
    if (spatialIndicator) {
        // 滚动时显示指示器
        const feed = document.querySelector('.news-feed');
        if (feed) {
            let indicatorTimeout;
            feed.addEventListener('scroll', () => {
                spatialIndicator.classList.add('active');
                clearTimeout(indicatorTimeout);
                indicatorTimeout = setTimeout(() => {
                    spatialIndicator.classList.remove('active');
                }, 1500);
            });
        }
    }
}

/**
 * 初始化陀螺仪权限请求
 */
function initGyroPermission() {
    // iOS需要用户交互后请求权限
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        
        // 创建权限请求弹窗
        const overlay = document.createElement('div');
        overlay.id = 'gyro-permission-overlay';
        overlay.innerHTML = `
            <div class="gyro-permission-modal">
                <div class="gyro-icon">📱</div>
                <h3>启用空间视差效果</h3>
                <p>允许访问设备陀螺仪，体验沉浸式3D视觉效果</p>
                <button id="gyro-enable-btn">启用</button>
                <button id="gyro-skip-btn">跳过</button>
            </div>
        `;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .gyro-permission-modal {
                background: white;
                border-radius: 16px;
                padding: 32px 24px;
                text-align: center;
                max-width: 300px;
                margin: 20px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }
            .gyro-permission-modal .gyro-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            .gyro-permission-modal h3 {
                margin: 0 0 12px 0;
                font-size: 18px;
                color: #222;
            }
            .gyro-permission-modal p {
                margin: 0 0 24px 0;
                font-size: 14px;
                color: #666;
                line-height: 1.5;
            }
            .gyro-permission-modal button {
                width: 100%;
                padding: 14px;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 10px;
                transition: transform 0.1s, opacity 0.2s;
            }
            .gyro-permission-modal button:active {
                transform: scale(0.98);
            }
            #gyro-enable-btn {
                background: linear-gradient(135deg, #ff4081, #ff79b0);
                color: white;
            }
            #gyro-skip-btn {
                background: #f5f5f5;
                color: #666;
                margin-bottom: 0;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        
        // 启用按钮
        document.getElementById('gyro-enable-btn').addEventListener('click', async () => {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    spatialParallax.state.gyroPermissionGranted = true;
                    window.addEventListener('deviceorientation', spatialParallax.handleGyro.bind(spatialParallax));
                    showToast('空间视差已启用');
                    console.log('✅ 陀螺仪权限已授予');
                }
            } catch (err) {
                console.error('陀螺仪权限请求失败:', err);
                showToast('权限请求失败');
            }
            overlay.remove();
        });
        
        // 跳过按钮
        document.getElementById('gyro-skip-btn').addEventListener('click', () => {
            overlay.remove();
        });
    }
}

/**
 * 显示Toast提示
 */
function showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        animation: fadeInUp 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOutDown 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * 添加CSS动画
 */
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes fadeOutDown {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded fired');
    console.log('📊 ARTICLES_DATA available:', typeof ARTICLES_DATA !== 'undefined');
    
    // 添加动画样式
    addAnimationStyles();
    
    // 渲染新闻卡片
    if (typeof ARTICLES_DATA !== 'undefined') {
        console.log('📰 Rendering', ARTICLES_DATA.length, 'articles');
        renderNewsCards(ARTICLES_DATA);
    } else {
        console.error('❌ ARTICLES_DATA is not defined!');
    }
    
    // 初始化视差效果
    initSpatialParallax();
    
    // 初始化陀螺仪权限（iOS）
    if ('ontouchstart' in window) {
        initGyroPermission();
    }
    
    // 处理新闻卡片点击
    document.getElementById('newsFeed').addEventListener('click', (e) => {
        const card = e.target.closest('.news-card');
        if (card) {
            e.preventDefault();
            const articleId = card.dataset.articleId;
            // 跳转到文章详情页
            window.location.href = `article.html?id=${articleId}`;
        }
    });
    
    console.log('📱 Spatial News Demo 已启动');
    console.log('💡 滚动页面查看视差效果');
    console.log('💡 移动设备倾斜手机查看陀螺仪效果');
    console.log('💡 桌面设备将鼠标移到图片上查看效果');
});

/**
 * 页面可见性变化处理
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时暂停更新
        if (spatialParallax) {
            spatialParallax.stopUpdateLoop();
        }
    } else {
        // 页面显示时恢复更新
        if (spatialParallax) {
            spatialParallax.startUpdateLoop();
        }
    }
});

/**
 * 页面卸载时清理
 */
window.addEventListener('beforeunload', () => {
    if (spatialParallax) {
        spatialParallax.destroy();
    }
});
