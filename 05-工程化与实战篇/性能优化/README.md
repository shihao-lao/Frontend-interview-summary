## 第11章：性能优化（5 题）

### 题目31：首屏加载优化

**答案：**

**1. 优化指标**

| 指标 | 含义 | 目标 |
|------|------|------|
| FCP | 首次内容绘制 | < 1.8s |
| LCP | 最大内容绘制 | < 2.5s |
| FID | 首次输入延迟 | < 100ms |
| CLS | 累积布局偏移 | < 0.1 |
| TTI | 可交互时间 | < 3.8s |

**2. 网络层面优化**

```html
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="preconnect" href="https://api.example.com" crossorigin>
<link rel="preload" href="/static/css/critical.css" as="style">
<link rel="preload" href="/static/js/app.js" as="script">
```

**3. 资源优化**

```javascript
// 代码分割
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

function App() {
    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </Suspense>
    );
}
```

**4. 渲染层面优化**

```html
<!-- 内联关键CSS -->
<style>.header { ... }</style>
<!-- 非关键CSS异步加载 -->
<link rel="preload" href="/static/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

**5. 完整优化清单**

| 优化方向 | 具体措施 |
|----------|----------|
| 网络层 | CDN加速、HTTP/2、Gzip/Brotli压缩 |
| 资源层 | 代码分割、Tree Shaking、图片压缩/WebP、字体子集化 |
| 渲染层 | 关键CSS内联、骨架屏、SSR/SSG、延迟加载 |
| 缓存层 | 强缓存（带hash的静态资源）、协商缓存、CDN缓存 |
| 监控层 | Performance API、Lighthouse、Web Vitals |

**考点：** 首屏优化策略、Web Vitals指标、资源优化、渲染优化、SSR

---

---

### 题目32：图片懒加载

**答案：**

**1. IntersectionObserver实现（推荐）**

```javascript
class LazyImage {
    constructor(selector) {
        this.images = document.querySelectorAll(selector);
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.onload = () => img.classList.add('loaded');
                        this.observer.unobserve(img);
                    }
                });
            },
            { rootMargin: '200px 0px', threshold: 0.01 }
        );
        this.images.forEach((img) => this.observer.observe(img));
    }
}
new LazyImage('img[data-src]');
```

**2. 滚动事件监听（兼容旧浏览器）**

```javascript
function lazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    const viewHeight = window.innerHeight;
    images.forEach((img) => {
        const rect = img.getBoundingClientRect();
        if (rect.top < viewHeight + 200) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    });
}
const throttledLazyLoad = throttle(lazyLoad, 200);
window.addEventListener('scroll', throttledLazyLoad);
```

**3. 原生loading属性**

```html
<img src="image.jpg" loading="lazy" alt="图片">
```

**4. React组件实现**

```jsx
function LazyImage({ src, alt }) {
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.unobserve(entry.target);
            }
        }, { rootMargin: '200px' });
        if (imgRef.current) observer.observe(imgRef.current);
        return () => observer.disconnect();
    }, []);

    return <img ref={imgRef} src={isInView ? src : undefined} alt={alt} />;
}
```

**考点：** IntersectionObserver、懒加载原理、React/Vue实现、性能优化

---

---

### 题目33：虚拟列表

**答案：**

**1. 原理**

虚拟列表只渲染可视区域内的元素，通过滚动位置动态计算应该显示哪些数据。

```
总数据：10000条，可视区域高度：600px，每项高度：40px
可视区域可显示：600 / 40 = 15条
实际只渲染15条DOM，通过transform偏移模拟滚动
```

**2. 手写虚拟列表**

```jsx
function VirtualList({ items, itemHeight, containerHeight }) {
    const [scrollTop, setScrollTop] = useState(0);

    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 3);
    const endIndex = Math.min(items.length, startIndex + visibleCount + 6);
    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return (
        <div style={{ height: containerHeight, overflow: 'auto' }} onScroll={(e) => setScrollTop(e.target.scrollTop)}>
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, index) => (
                        <div key={startIndex + index} style={{ height: itemHeight, borderBottom: '1px solid #eee' }}>
                            {item.name} - {item.id}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

**3. 现有方案**

| 方案 | 适用框架 | 特点 |
|------|----------|------|
| react-window | React | 轻量、高性能 |
| react-virtualized | React | 功能丰富 |
| vue-virtual-scroller | Vue | Vue官方推荐 |
| @tanstack/virtual | 跨框架 | React/Vue/Svelte |

**考点：** 虚拟列表原理、固定高度/动态高度实现、性能优化

---

---

### 题目34：Webpack打包优化

**答案：**

**1. 构建速度优化**

```javascript
module.exports = {
    // 缩小构建范围
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            include: path.resolve(__dirname, 'src'),
            use: 'babel-loader'
        }]
    },

    // 合理配置resolve
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: { '@': path.resolve(__dirname, 'src') }
    },

    // 文件系统缓存（Webpack 5）
    cache: {
        type: 'filesystem',
        buildDependencies: { config: [__filename] }
    },

    // 多线程打包
    module: {
        rules: [{
            test: /\.js$/,
            use: [{ loader: 'thread-loader', options: { workers: 4 } }, 'babel-loader']
        }]
    }
};
```

**2. 打包体积优化**

```javascript
module.exports = {
    optimization: {
        // 代码分割
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        },
        // Tree Shaking（Webpack 5默认开启）
        usedExports: true,
        sideEffects: true
    }
};
```

**3. 图片优化**

```javascript
{
    test: /\.(png|jpe?g|gif|webp)$/,
    type: 'asset',
    parser: { dataUrlCondition: { maxSize: 8 * 1024 } },
    generator: { filename: 'images/[name].[hash:8][ext]' }
}
```

**4. Gzip压缩**

```javascript
const CompressionPlugin = require('compression-webpack-plugin');
plugins: [
    new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8
    })
]
```

**考点：** 构建速度优化、打包体积优化、代码分割、Tree Shaking

---

---

### 题目35：代码分割

**答案：**

**1. 为什么需要代码分割**

将大包拆分成多个小包，按需加载，减少首屏加载时间。

**2. 入口起点分割**

```javascript
module.exports = {
    entry: {
        main: './src/main.js',
        vendor: './src/vendor.js'
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    }
};
```

**3. 动态导入（推荐）**

```javascript
// 按路由懒加载
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

// 按条件加载
button.addEventListener('click', () => {
    import('./heavyModule.js').then((module) => {
        module.doSomething();
    });
});
```

**4. splitChunks配置**

```javascript
optimization: {
    splitChunks: {
        chunks: 'all',
        minSize: 20000,        // 最小20KB才分割
        minChunks: 1,           // 最少被引用1次
        cacheGroups: {
            vendors: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10
            },
            commons: {
                name: 'commons',
                minChunks: 2,    // 至少被2个chunk引用
                chunks: 'initial',
                priority: 5
            }
        }
    }
}
```

**5. Vue路由懒加载**

```javascript
const routes = [
    { path: '/', component: () => import('@/views/Home.vue') },
    { path: '/about', component: () => import('@/views/About.vue') }
];
```

**考点：** 代码分割方式、splitChunks配置、动态导入、路由懒加载

---