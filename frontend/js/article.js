/**
 * 文章详情页脚本
 * 实现增强的Spatial视差效果
 */

// 全局变量
let articleParallax = null;
let spatialModeEnabled = true;
let currentArticle = null;

// 文章详细内容（模拟数据）
const ARTICLE_CONTENT = {
    1: {
        body: `
            <p>在AI技术席卷资讯行业的今天，我们正面临信息极度丰饶与认知深度焦灼并存的困境。一方面，AI生成内容的便捷性使得深度伪造、批量造谣泛滥成灾，从名人换脸到专业报告失真，获取真实准确信息的成本不降反升；另一方面，传统算法在AI加持下加剧了信息茧房、认知浅化和观点极化，用户视野窄化，理性讨论空间被压缩。</p>
            
            <p>面对这一挑战，腾讯新闻负责人何毅进在2025腾讯ConTech大会上指出，AI是双刃剑，关键在于使用者的选择。他提出，优质资讯产品必须完成双重进化：从"内容平台"进化为"可信生态"，从"信息推送者"升级为"认知协作者"。其最高价值不是填满用户时间，而是点亮用户思维。</p>
            
            <h2>可信为基：精品资讯的立身之本</h2>
            
            <p>在何毅进看来，可信度是AI时代最稀缺的资源，资讯产品必须以可信内容生态为基座。打造这一生态，需要让每一个内容账号都拥有专属的信息质量数字档案，通过动态升降级机制实现优胜劣汰。</p>
            
            <blockquote>
            "AI时代，人们稀缺的不是信息本身，而是经过验证的真相；需要的不是更多声音，而是值得信赖的解读；渴望的不是更大音量，而是凝聚共识的理性表达。"
            </blockquote>
            
            <h2>协作赋能：精品资讯的价值内核</h2>
            
            <p>解决了信息真伪的问题，还要破解认知局限的困境。何毅进认为，资讯产品必须从"信息推送者"升级为"认知协作者"，从"猜你喜欢"转向"助你成长"。</p>
        `
    },
    2: {
        body: `
            <p>台防务部门12月17日发布消息称，解放军海军福建舰于16日航经台湾海峡。作为今年11月正式入列的新晋主力，福建舰首次出航即选择穿越台海，其背后的战略深意引发各方揣测。</p>
            
            <p>与此同时，"人民海军"官方发布消息确认，山东舰近期圆满完成年度最后一次远海实战化训练，返回三亚某军港。而在不久前，辽宁舰编队在西太平洋抵近日本附近海域进行训练。</p>
            
            <h2>福建舰入列后首航经过台湾海峡</h2>
            
            <p>据台防务部门发布的动态图，福建舰16日自西南向东北穿过台湾海峡。发布中特别强调，这是福建舰今年11月正式入列后的首次出航。</p>
            
            <p>实际上，这并非福建舰首次过航台海。今年9月上旬，还在海试阶段的中国海军第三艘航母福建舰，就曾通过台湾海峡赴南海海域开展科研试验和训练任务。</p>
            
            <h2>山东舰入列六周年</h2>
            
            <p>12月17日恰逢山东舰入列六周年纪念日。作为解放军海军第二艘航母，也是中国独立自主设计建造配套的第一艘国产航母，山东舰在参考辽宁舰设计理念和运用模式的基础上进一步优化。</p>
            
            <blockquote>
            中国海军现在的3艘航母都是非常强的，使中国海军能够在航母战斗力上形成良性循环。
            </blockquote>
        `
    },
    3: {
        body: `
            <p>记者从深圳市住房和建设局获悉，为进一步加强青年人才来深发展服务保障，打造最好的科技创新生态和人才发展环境，切实解决首次来深青年人才阶段性住房困难，深圳正式出台《深圳市青年人才住房支持实施办法》。</p>
            
            <p>该办法明确了青年人才住房支持的申请条件、过渡性住房和安居补贴支持标准、申请流程、监督管理等内容。该政策将于2026年1月1日起正式实施。</p>
            
            <h2>支持方式</h2>
            
            <p>此次青年人才住房支持政策，明确了过渡性住房和安居补贴两种支持方式，符合条件的青年人才可任选其一，不可重复享受。</p>
            
            <p>面向青年人才配租的过渡性住房以一间房为主，两居室及以上户型以一间房为单位面向青年人才配租。租金标准按市场参考租金的60%左右确定，最长租住期限不超过36个月。安居补贴每月1250元（税后1000元），发放期不超过24个月。</p>
            
            <h2>青年友好型社区</h2>
            
            <p>深圳将打造若干青年友好型社区，鼓励配备智能家居、青年食堂、共享厨房、自助洗衣房、书吧、咖啡厅、健身房及文化创意空间等设施。</p>
        `
    }
};

/**
 * 获取URL参数
 */
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: parseInt(params.get('id')) || 1
    };
}

/**
 * 加载文章数据
 */
function loadArticle(articleId) {
    // 从ARTICLES_DATA中查找文章
    currentArticle = ARTICLES_DATA.find(a => a.id === articleId);
    
    if (!currentArticle) {
        document.getElementById('articleTitle').textContent = '文章未找到';
        return;
    }

    // 更新页面标题
    document.title = currentArticle.title + ' - Spatial News';
    
    // 更新文章标题
    document.getElementById('articleTitle').textContent = currentArticle.title;
    
    // 更新元信息
    const meta = document.getElementById('articleMeta');
    meta.innerHTML = `
        <span class="article-source">${currentArticle.source}</span>
        <span class="article-time">${currentArticle.publishTime}</span>
    `;
    
    // 渲染Spatial图片
    renderSpatialImages(currentArticle.images, currentArticle.hasSpatial);
    
    // 加载文章内容
    const content = ARTICLE_CONTENT[articleId];
    if (content) {
        document.getElementById('articleBody').innerHTML = content.body;
    } else {
        document.getElementById('articleBody').innerHTML = `
            <p>${currentArticle.summary}</p>
            <p>（完整文章内容请访问原文链接）</p>
        `;
    }
}

/**
 * 渲染Spatial图片
 */
function renderSpatialImages(images, hasSpatial) {
    const container = document.getElementById('spatialImages');
    
    if (!images || images.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = images.map((img, index) => `
        <div class="spatial-image-wrapper ${hasSpatial ? 'spatial-enabled' : ''}" 
             data-image-index="${index}"
             data-scroll-parallax>
            <img class="spatial-image" src="${img}" alt="图片 ${index + 1}" loading="lazy">
            ${hasSpatial ? `
                <div class="spatial-tag">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    Spatial
                </div>
                <div class="specular-highlight"></div>
                <div class="depth-indicator">
                    <span>深度</span>
                    <div class="depth-bar">
                        <div class="depth-fill"></div>
                    </div>
                </div>
            ` : ''}
        </div>
        <p class="image-caption">图${index + 1}${hasSpatial ? ' · 支持空间视差' : ''}</p>
    `).join('');
    
    // 添加点击事件打开全屏
    container.querySelectorAll('.spatial-image-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            if (hasSpatial) {
                openFullscreenViewer(wrapper);
            }
        });
    });
}

/**
 * 打开全屏查看器
 */
function openFullscreenViewer(imageWrapper) {
    const imgSrc = imageWrapper.querySelector('.spatial-image').src;
    
    const viewer = document.createElement('div');
    viewer.className = 'fullscreen-viewer';
    viewer.innerHTML = `
        <button class="close-btn" aria-label="关闭">×</button>
        <div class="spatial-image-wrapper spatial-enabled fullscreen" data-scroll-parallax>
            <img class="spatial-image" src="${imgSrc}" alt="全屏图片">
            <div class="specular-highlight"></div>
        </div>
        <div class="gyro-hint" style="display: flex;">
            <span class="gyro-hint-icon">📱</span>
            <span>移动设备或拖动鼠标查看空间效果</span>
        </div>
    `;
    
    document.body.appendChild(viewer);
    document.body.style.overflow = 'hidden';
    
    // 注册视差效果
    const fullscreenWrapper = viewer.querySelector('.spatial-image-wrapper');
    if (articleParallax) {
        articleParallax.register(fullscreenWrapper);
    }
    
    // 增强的全屏视差效果
    const fullscreenImg = fullscreenWrapper.querySelector('.spatial-image');
    const highlight = fullscreenWrapper.querySelector('.specular-highlight');
    
    // 鼠标拖动效果
    let isDragging = false;
    let startX, startY;
    let currentRotateX = 0, currentRotateY = 0;
    
    fullscreenWrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        fullscreenWrapper.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = (e.clientX - startX) * 0.2;
        const deltaY = (e.clientY - startY) * 0.2;
        
        currentRotateY = Math.max(-30, Math.min(30, deltaX));
        currentRotateX = Math.max(-30, Math.min(30, -deltaY));
        
        fullscreenImg.style.transform = `
            perspective(1000px)
            rotateX(${currentRotateX}deg)
            rotateY(${currentRotateY}deg)
            scale(1.05)
        `;
        
        // 更新高光
        if (highlight) {
            const highlightX = 50 + currentRotateY;
            const highlightY = 30 - currentRotateX;
            highlight.style.setProperty('--highlight-x', `${highlightX}%`);
            highlight.style.setProperty('--highlight-y', `${highlightY}%`);
            highlight.style.opacity = '1';
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        fullscreenWrapper.style.cursor = 'grab';
    });
    
    // 触摸事件
    fullscreenWrapper.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    fullscreenWrapper.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const deltaX = (e.touches[0].clientX - startX) * 0.3;
        const deltaY = (e.touches[0].clientY - startY) * 0.3;
        
        currentRotateY = Math.max(-25, Math.min(25, deltaX));
        currentRotateX = Math.max(-25, Math.min(25, -deltaY));
        
        fullscreenImg.style.transform = `
            perspective(1000px)
            rotateX(${currentRotateX}deg)
            rotateY(${currentRotateY}deg)
            scale(1.02)
        `;
    });
    
    // 关闭按钮
    viewer.querySelector('.close-btn').addEventListener('click', () => {
        if (articleParallax) {
            articleParallax.unregister(fullscreenWrapper);
        }
        document.body.removeChild(viewer);
        document.body.style.overflow = '';
    });
    
    // 点击背景关闭
    viewer.addEventListener('click', (e) => {
        if (e.target === viewer) {
            if (articleParallax) {
                articleParallax.unregister(fullscreenWrapper);
            }
            document.body.removeChild(viewer);
            document.body.style.overflow = '';
        }
    });
    
    // 隐藏提示
    setTimeout(() => {
        const hint = viewer.querySelector('.gyro-hint');
        if (hint) {
            hint.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => hint.style.display = 'none', 500);
        }
    }, 3000);
}

/**
 * 初始化Spatial视差
 */
function initArticleParallax() {
    articleParallax = new SpatialParallax({
        scrollIntensity: 0.25,
        gyroIntensity: 0.15,
        mouseIntensity: 0.12,
        maxTilt: 15,
        perspective: 800,
        enableGyro: true,
        enableMouse: true,
        enableScroll: true,
        debug: false
    });
    
    // 注册所有spatial图片
    document.querySelectorAll('.spatial-image-wrapper[data-scroll-parallax]').forEach(el => {
        articleParallax.register(el);
    });
}

/**
 * 切换Spatial模式
 */
function toggleSpatialMode() {
    spatialModeEnabled = !spatialModeEnabled;
    
    const toggle = document.getElementById('spatialModeToggle');
    const wrappers = document.querySelectorAll('.spatial-image-wrapper');
    
    if (spatialModeEnabled) {
        toggle.classList.add('active');
        toggle.querySelector('span').textContent = 'Spatial ON';
        
        wrappers.forEach(wrapper => {
            wrapper.classList.add('spatial-active');
            articleParallax.register(wrapper);
        });
        
        showGyroHint();
    } else {
        toggle.classList.remove('active');
        toggle.querySelector('span').textContent = 'Spatial';
        
        wrappers.forEach(wrapper => {
            wrapper.classList.remove('spatial-active');
            articleParallax.unregister(wrapper);
            // 重置变换
            const img = wrapper.querySelector('.spatial-image');
            if (img) img.style.transform = '';
        });
    }
}

/**
 * 显示陀螺仪提示
 */
function showGyroHint() {
    if ('ontouchstart' in window) {
        const hint = document.getElementById('gyroHint');
        hint.style.display = 'flex';
        
        setTimeout(() => {
            hint.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => hint.style.display = 'none', 500);
        }, 3000);
    }
}

/**
 * 请求陀螺仪权限
 */
async function requestGyroPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.warn('陀螺仪权限请求失败:', error);
            return false;
        }
    }
    return true;
}

/**
 * 页面初始化
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 获取文章ID并加载
    const { id } = getUrlParams();
    loadArticle(id);
    
    // 初始化视差效果
    initArticleParallax();
    
    // 设置Spatial模式切换
    const toggle = document.getElementById('spatialModeToggle');
    toggle.addEventListener('click', async () => {
        // 首次点击时请求陀螺仪权限
        if ('ontouchstart' in window && !articleParallax.state.gyroPermissionGranted) {
            await requestGyroPermission();
        }
        toggleSpatialMode();
    });
    
    // 默认激活Spatial模式
    if (currentArticle && currentArticle.hasSpatial) {
        setTimeout(() => {
            document.querySelectorAll('.spatial-image-wrapper').forEach(wrapper => {
                wrapper.classList.add('spatial-active');
            });
        }, 500);
    }
    
    // 添加fadeOut动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
    `;
    document.head.appendChild(style);
    
    console.log('📄 文章详情页已加载');
    console.log('💡 点击图片可全屏查看空间效果');
});

/**
 * 页面可见性变化
 */
document.addEventListener('visibilitychange', () => {
    if (articleParallax) {
        if (document.hidden) {
            articleParallax.stopUpdateLoop();
        } else {
            articleParallax.startUpdateLoop();
        }
    }
});

/**
 * 页面卸载清理
 */
window.addEventListener('beforeunload', () => {
    if (articleParallax) {
        articleParallax.destroy();
    }
});
