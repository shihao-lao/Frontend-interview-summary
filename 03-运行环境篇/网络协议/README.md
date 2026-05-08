## 第7章：网络协议（8 题）

### 题目9：HTTP和HTTPS的区别

**答案：**

**1. 基本概念**

- **HTTP（HyperText Transfer Protocol）**：超文本传输协议，用于客户端和服务器之间的通信。
- **HTTPS（HTTP Secure）**：HTTP的安全版本，在HTTP的基础上加入了SSL/TLS加密层。

**2. 主要区别**

| 对比项 | HTTP | HTTPS |
|--------|------|-------|
| 协议 | `http://` | `https://` |
| 默认端口 | 80 | 443 |
| 安全性 | 明文传输，不安全 | 加密传输，安全 |
| 证书 | 不需要 | 需要CA证书 |
| 速度 | 略快（无加密开销） | 略慢（TLS握手开销） |
| SEO | 较低 | 搜索引擎优先排名 |

**3. HTTPS的TLS握手过程**

```
客户端                          服务器
  |                               |
  |--- ClientHello ------------->|  (支持的TLS版本、加密套件列表、随机数)
  |                               |
  |<-- ServerHello --------------|  (选择的加密套件、随机数)
  |<-- Certificate --------------|  (服务器数字证书)
  |<-- ServerKeyExchange --------|  (密钥交换参数)
  |<-- ServerHelloDone ----------|
  |                               |
  |--- ClientKeyExchange ------->|  (客户端密钥交换参数)
  |--- ChangeCipherSpec -------->|  (切换到加密通信)
  |--- Finished ---------------->|  (握手完成消息)
  |                               |
  |<-- ChangeCipherSpec ---------|
  |<-- Finished -----------------|
  |                               |
  |=== 加密通信开始 =============|
```

**简化版TLS 1.2握手：**

1. 客户端发送支持的加密套件和随机数。
2. 服务器返回选择的加密套件、数字证书和随机数。
3. 客户端验证证书（CA签名、域名、有效期）。
4. 客户端生成预主密钥（Pre-Master Secret），用服务器公钥加密后发送。
5. 双方通过预主密钥和两个随机数生成会话密钥（Session Key）。
6. 后续通信使用对称加密（AES等）。

**TLS 1.3的改进：**

- 将握手从2-RTT减少到1-RTT。
- 移除了不安全的加密算法（如RC4、DES、3DES）。
- 支持0-RTT恢复（有重放攻击风险）。

**4. HTTPS的加密方式**

HTTPS使用混合加密：

- **非对称加密**（RSA/ECC）：用于TLS握手阶段交换密钥。
- **对称加密**（AES）：用于实际数据传输，性能更好。

**5. 证书验证过程**

```
1. 服务器将证书发送给客户端
2. 客户端验证证书链：
   服务器证书 -> 中间CA证书 -> 根CA证书
3. 检查证书是否被吊销（CRL/OCSP）
4. 检查域名是否匹配
5. 检查证书是否过期
```

**考点：** HTTP/HTTPS区别、TLS握手过程、加密方式、证书验证、TLS 1.3改进

---

---

### 题目10：HTTP状态码

**答案：**

HTTP状态码由三位数字组成，第一位数字表示响应类别。

**1xx - 信息性状态码**

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 100 Continue | 继续发送 | 客户端应继续发送请求体 |
| 101 Switching Protocols | 切换协议 | 如切换到WebSocket |

**2xx - 成功状态码**

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 200 OK | 请求成功 | 最常见的成功状态码 |
| 201 Created | 已创建 | 成功创建新资源（POST请求） |
| 204 No Content | 无内容 | 成功但无返回体（DELETE请求） |
| 206 Partial Content | 部分内容 | 断点续传/范围请求 |

**3xx - 重定向状态码**

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 301 Moved Permanently | 永久重定向 | 搜索引擎会更新索引 |
| 302 Found | 临时重定向 | 搜索引擎保留原URL |
| 304 Not Modified | 未修改 | 资源未变化，使用缓存 |
| 307 Temporary Redirect | 临时重定向 | 不允许改变请求方法 |
| 308 Permanent Redirect | 永久重定向 | 不允许改变请求方法 |

**301 vs 302 vs 307 vs 308 的区别：**

```
301：浏览器会缓存重定向，SEO权重转移(允许修改请求方法,可能会数据=丢失)
302：浏览器不缓存重定向，SEO权重不转移(允许修改请求方法,可能会数据=丢失)
307: 临时重定向，不允许改变请求方法
308: 永久重定向，不允许改变请求方法
示例：
// HTTP到HTTPS重定向
301 https://example.com  -> 永久重定向(修改访问路径)

// 未登录重定向到登录页
302 https://example.com/login -> 临时重定向
从登录页返回原页面,会保留原URL
```

**4xx - 客户端错误**

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 400 Bad Request | 错误请求 | 请求参数错误 |
| 401 Unauthorized | 未认证 | 需要登录 |
| 403 Forbidden | 禁止访问 | 无权限访问该资源 |
| 404 Not Found | 未找到 | 资源不存在 |
| 405 Method Not Allowed | 方法不允许 | 如POST接口用GET请求 |
| 408 Request Timeout | 请求超时 | 客户端发送请求太慢 |
| 429 Too Many Requests | 请求过多 | 触发限流 |

**401 vs 403 的区别：**

```
401：未认证（不知道你是谁）-> 需要登录
403：已认证但无权限（知道你是谁，但你没权限）-> 权限不足
```

**5xx - 服务器错误**

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 500 Internal Server Error | 服务器内部错误 | 代码异常 |
| 502 Bad Gateway | 网关错误 | 代理服务器收到无效响应 |
| 503 Service Unavailable | 服务不可用 | 服务器过载或维护 |
| 504 Gateway Timeout | 网关超时 | 代理服务器等待上游超时 |

**考点：** 常见状态码含义、301/302区别、304缓存机制、401/403区别

---

---

### 题目11：HTTP/1.1 vs HTTP/2 vs HTTP/3

**答案：**

**1. HTTP/1.1**

HTTP/1.1是目前使用最广泛的HTTP版本（1997年发布）。

**特点：**

- **持久连接**：默认开启 `Connection: keep-alive`，一个TCP连接可以发送多个请求。
- **管道化（Pipelining）**：支持在同一个连接上连续发送请求，但由于队头阻塞问题，浏览器基本没有实现。
- **队头阻塞（Head-of-Line Blocking）**：同一个TCP连接上，前面的请求未完成会阻塞后面的请求。

```
请求1 ----响应1----
请求2 --------------响应2----  （请求2被请求1阻塞）
请求3 --------------------响应3----
```

**2. HTTP/2（2015年发布）**

HTTP/2在HTTP/1.1的基础上做了重大改进，主要解决性能问题。

**核心特性：**

**（1）二进制分帧（Binary Framing）**

HTTP/1.1使用文本格式，HTTP/2使用二进制格式，更高效且不易出错。

**（2）多路复用（Multiplexing）**

在同一个TCP连接上可以同时发送多个请求和响应，解决了HTTP/1.1的队头阻塞。

```
连接1: [流1: 请求1 -> 响应1]
       [流2: 请求2 -> 响应2]
       [流3: 请求3 -> 响应3]
       （所有流并行，互不阻塞）
```

**（3）头部压缩（HPACK）**

HTTP/2使用HPACK算法压缩头部：

- 静态表：预定义的61个常见头部字段。
- 动态表：之前发送过的头部字段。
- 哈夫曼编码：对字符串值进行压缩。

**（4）服务器推送（Server Push）**

服务器可以主动向客户端推送资源，减少请求延迟。

**（5）流优先级（Stream Priority）**

客户端可以为不同的流设置优先级，让重要的资源优先加载。

**HTTP/2的队头阻塞问题：**

HTTP/2虽然解决了应用层的队头阻塞，但TCP层的队头阻塞仍然存在。当一个TCP数据包丢失时，所有流都会被阻塞等待重传。

**3. HTTP/3（2022年发布）**

HTTP/3是基于QUIC协议的HTTP版本，解决了TCP层面的队头阻塞。

**核心改进：**

**（1）基于UDP的QUIC协议**

QUIC运行在UDP之上，内置了TLS 1.3加密，不需要额外的TLS握手。

```
HTTP/1.1: TCP + TLS = 3-4 RTT
HTTP/2:   TCP + TLS = 3 RTT
HTTP/3:   QUIC（内置TLS 1.3）= 1 RTT（首次）/ 0 RTT（恢复）
```

**（2）解决TCP队头阻塞**

QUIC为每个流独立管理，一个流的数据包丢失不会影响其他流。

```
QUIC: 流1丢包 -> 只重传流1的数据包
      流2、流3正常传输，不受影响
```

**（3）连接迁移（Connection Migration）**

TCP连接由四元组（源IP、源端口、目标IP、目标端口）标识，网络切换（如WiFi到4G）会导致连接断开。QUIC使用连接ID标识连接，支持网络切换不断连。

**4. 三者对比**

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|--------|--------|
| 传输层 | TCP | TCP | UDP(QUIC) |
| 格式 | 文本 | 二进制 | 二进制 |
| 多路复用 | 不支持（队头阻塞） | 支持（TCP层仍有阻塞） | 支持（无队头阻塞） |
| 头部压缩 | 无 | HPACK | QPACK |
| 服务器推送 | 不支持 | 支持 | 支持 |
| 连接迁移 | 不支持 | 不支持 | 支持 |
| 加密 | 可选 | 可选 | 强制（TLS 1.3） |

**考点：** HTTP版本演进、多路复用、队头阻塞、头部压缩、QUIC协议

---

---

### 题目12：浏览器缓存机制

**答案：**

浏览器缓存是前端性能优化的重要手段，分为**强缓存**和**协商缓存**两种。

**1. 强缓存**

强缓存不需要向服务器发送请求，直接从本地缓存读取。通过响应头控制。

**（1）Expires**

```http
Expires: Wed, 15 Apr 2026 08:00:00 GMT
```

- HTTP/1.0 的产物，表示缓存的过期时间（绝对时间）。
- 缺点：依赖客户端本地时间，修改时间可能导致缓存失效。

**（2）Cache-Control**

```http
Cache-Control: max-age=31536000, public, immutable
```

- HTTP/1.1 的产物，优先级高于 `Expires`。
- `max-age`：缓存有效时间（秒）。
- `public`：响应可被任何缓存（包括代理服务器）缓存。
- `private`：响应只能被浏览器缓存。
- `no-cache`：跳过强缓存，进入协商缓存。
- `no-store`：不缓存任何内容。
- `immutable`：在 `max-age` 期间，即使用户刷新页面也不会发请求。
- `s-maxage`：仅用于共享缓存（如CDN）的缓存时间。

**2. 协商缓存**

协商缓存需要向服务器验证资源是否可用，如果可用则返回304，否则返回200和新资源。

**（1）Last-Modified / If-Modified-Since**

```http
# 首次请求响应
Last-Modified: Mon, 10 Apr 2026 08:00:00 GMT

# 再次请求
If-Modified-Since: Mon, 10 Apr 2026 08:00:00 GMT

# 服务器比较：
# 如果文件未修改 -> 304 Not Modified
# 如果文件已修改 -> 200 OK + 新资源
```

缺点：精度只到秒，文件内容未变但修改时间变了也会导致重新下载。

**（2）ETag / If-None-Match**

```http
# 首次请求响应
ETag: "abc123"

# 再次请求
If-None-Match: "abc123"

# 服务器比较：
# 如果ETag匹配 -> 304 Not Modified
# 如果ETag不匹配 -> 200 OK + 新资源 + 新ETag
```

ETag的生成方式：

- **强ETag**：基于文件内容的哈希值，完全匹配。
- **弱ETag**：以 `W/` 开头，语义等价即可匹配。

**ETag优先级高于Last-Modified。**

**3. 完整缓存流程**

```
浏览器请求资源
    |
    v
是否有Cache-Control或Expires？ --否--> 向服务器请求
    |是
    v
是否过期？ --否--> 使用强缓存（200 from cache）
    |是
    v
是否有ETag？ --是--> 发送If-None-Match
    |否
    v
是否有Last-Modified？ --是--> 发送If-Modified-Since
    |否
    v
向服务器请求
    |
    v
服务器验证 --未修改--> 304 Not Modified（使用缓存）
         --已修改--> 200 OK（返回新资源）
```

**4. 实际项目中的缓存策略**

```nginx
# Nginx配置示例
server {
    # HTML文件：不缓存或短时间缓存
    location / {
        root /dist;
        try_files $uri /index.html;
        add_header Cache-Control "no-cache";
    }

    # JS/CSS文件（带hash）：长期缓存
    location ~* \.(js|css)$ {
        root /dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 图片/字体文件：中等时间缓存
    location ~* \.(jpg|jpeg|png|gif|ico|svg|woff2)$ {
        root /dist;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

**考点：** 强缓存与协商缓存、Cache-Control、ETag、Last-Modified、缓存策略

---

---

### 题目13：TCP三次握手四次挥手

**答案：**

**1. TCP三次握手（建立连接）**

TCP通过三次握手建立可靠的双向通信连接。

```
客户端                          服务器
  |                               |
  |--- SYN (seq=x) ------------->|  第一次握手：客户端发送SYN包
  |                               |  客户端进入 SYN_SENT 状态
  |                               |
  |<-- SYN+ACK (seq=y,ack=x+1) --|  第二次握手：服务器返回SYN+ACK包
  |                               |  服务器进入 SYN_RCVD 状态
  |                               |
  |--- ACK (ack=y+1) ----------->|  第三次握手：客户端发送ACK包
  |                               |  双方进入 ESTABLISHED 状态
  |                               |
  |=== 数据传输开始 =============|
```

**为什么需要三次握手？**

- **第一次握手**：服务器确认客户端的发送能力正常。
- **第二次握手**：客户端确认服务器的接收和发送能力正常。
- **第三次握手**：服务器确认客户端的接收能力正常。

如果只有两次握手，服务器无法确认客户端的接收能力，可能导致已失效的连接请求被服务器接受。

**2. TCP四次挥手（断开连接）**

TCP通过四次挥手安全地断开连接，因为TCP是全双工的，每个方向都需要单独关闭。

```
客户端                          服务器
  |                               |
  |--- FIN (seq=u) ------------->|  第一次挥手：客户端发送FIN包
  |                               |  客户端进入 FIN_WAIT_1 状态
  |                               |
  |<-- ACK (ack=u+1) ------------|  第二次挥手：服务器返回ACK包
  |                               |  服务器进入 CLOSE_WAIT 状态
  |                               |  客户端进入 FIN_WAIT_2 状态
  |                               |  （服务器仍可发送数据）
  |                               |
  |<-- FIN (seq=w) --------------|  第三次挥手：服务器发送FIN包
  |                               |  服务器进入 LAST_ACK 状态
  |                               |
  |--- ACK (ack=w+1) ----------->|  第四次挥手：客户端返回ACK包
  |                               |  客户端进入 TIME_WAIT 状态
  |                               |  等待 2MSL 后关闭
  |                               |  服务器进入 CLOSED 状态
```

**为什么需要四次挥手？**

因为TCP是全双工通信，每个方向都需要独立的FIN和ACK。服务器收到客户端的FIN后，可能还有数据未发送完，所以先回复ACK，等数据发送完毕后再发送FIN。

**3. TIME_WAIT状态**

客户端在发送最后一个ACK后进入TIME_WAIT状态，等待 **2MSL（Maximum Segment Lifetime，最大报文段生存时间）** 后才关闭。

**为什么需要TIME_WAIT？**

1. **确保最后一个ACK到达服务器**：如果ACK丢失，服务器会重发FIN，客户端可以重发ACK。
2. **让旧连接的报文在网络中消亡**：确保新连接不会收到旧连接的残留报文。

**4. 相关面试问题**

**为什么不是两次握手？**

防止已失效的连接请求到达服务器，导致服务器创建无效连接，浪费资源。

**为什么不是四次握手？**

第二次和第三次握手可以合并（SYN+ACK），所以三次就够了。但断开时，服务器收到FIN后可能还有数据要发送，所以ACK和FIN不能合并。

**考点：** 三次握手流程、四次挥手流程、为什么三次/四次、TIME_WAIT、全双工

---

---

### 题目14：Cookie / Session / Token 的区别

**答案：**

**1. Cookie**

Cookie是服务器发送到浏览器并保存在本地的一小块数据。

```javascript
// 服务端设置Cookie（Node.js示例）
res.setHeader('Set-Cookie', 'sessionId=abc123; HttpOnly; Secure; SameSite=Strict; Max-Age=3600');

// 客户端自动携带Cookie
// 后续请求会自动在请求头中携带
Cookie: sessionId=abc123
```

**特点：**

- 存储在客户端（浏览器）。
- 容量约4KB。
- 每次请求自动携带。
- 可设置过期时间。

**2. Session**

Session存储在服务器端，通过Cookie中的Session ID来关联。

```javascript
// Node.js + Express Session示例
const session = require('express-session');
app.use(session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000, httpOnly: true }
}));

// 登录时设置Session
app.post('/login', (req, res) => {
    req.session.userId = user.id;
    req.session.username = user.name;
    res.send('登录成功');
});

// 后续请求获取Session
app.get('/profile', (req, res) => {
    const userId = req.session.userId;
    // 根据userId查询用户信息
});
```

**Session存储方式：**

- 内存存储（默认，重启丢失）。
- Redis存储（推荐，支持分布式）。
- 数据库存储。

**3. Token（JWT）**

Token是无状态的认证方式，服务器不保存会话信息。

**JWT（JSON Web Token）结构：**

```
Header.Payload.Signature

# Header（头部）
{
    "alg": "HS256",
    "typ": "JWT"
}

# Payload（载荷）
{
    "userId": "123",
    "username": "zhangsan",
    "exp": 1713139200
}

# Signature（签名）
HMACSHA256(base64(header) + "." + base64(payload), secret)
```

```javascript
// 生成JWT
const jwt = require('jsonwebtoken');
const token = jwt.sign(
    { userId: user.id, username: user.name },
    'your-secret-key',
    { expiresIn: '7d' }
);

// 验证JWT
app.get('/api/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        const userId = decoded.userId;
        // 查询用户信息
    } catch (err) {
        res.status(401).send('Token无效');
    }
});
```

**前端存储Token的方式：**

```javascript
// 方式1：localStorage（有XSS风险）
localStorage.setItem('token', token);

// 方式2：Cookie（推荐，设置HttpOnly）
// 由服务端设置，前端无法通过JS读取

// 方式3：请求头携带
fetch('/api/data', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

**4. 三者对比**

| 对比项 | Cookie | Session | Token(JWT) |
|--------|--------|---------|------------|
| 存储位置 | 客户端 | 服务器 | 客户端 |
| 存储容量 | ~4KB | 无限制 | 无限制（但不宜过大） |
| 安全性 | 较低（需HttpOnly） | 较高 | 较高 |
| 跨域 | 需要配置 | 需要配置 | 天然支持（Bearer Token） |
| 分布式 | 支持 | 需要共享存储（Redis） | 天然支持 |
| 状态 | 有状态 | 有状态 | 无状态 |
| 性能 | 每次携带Cookie | 查询Session存储 | 无需查询（自包含） |
| CSRF风险 | 有 | 有 | 无（不自动携带） |
| XSS风险 | 低（HttpOnly） | 低 | 高（localStorage） |
| 适用场景 | 传统Web应用 | 传统Web应用 | SPA、移动端、微服务 |

**考点：** Cookie/Session/Token区别、JWT原理、认证方式选择、安全性对比

---

---

### 题目15：WebSocket原理

**答案：**

**1. WebSocket概述**

WebSocket是一种在单个TCP连接上实现全双工通信的协议。与HTTP的请求-响应模式不同，WebSocket允许服务器主动向客户端推送数据。

**2. WebSocket握手过程**

WebSocket通过HTTP升级请求建立连接：

```
客户端请求：
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

服务器响应：
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

握手成功后，连接从HTTP协议升级为WebSocket协议。

**3. 基本使用**

```javascript
// 创建WebSocket连接
const ws = new WebSocket('wss://example.com/chat');

// 连接建立
ws.onopen = () => {
    console.log('WebSocket连接已建立');
    ws.send('Hello Server!');
    ws.send(JSON.stringify({ type: 'message', content: '你好' }));
};

// 接收消息
ws.onmessage = (event) => {
    console.log('收到消息：', event.data);
    const data = JSON.parse(event.data);
    switch (data.type) {
        case 'message':
            console.log(data.content);
            break;
        case 'notification':
            showNotification(data.content);
            break;
    }
};

// 连接关闭
ws.onclose = (event) => {
    console.log(`连接关闭，code=${event.code}, reason=${event.reason}`);
};

// 连接错误
ws.onerror = (error) => {
    console.error('WebSocket错误：', error);
};

// 主动关闭连接
ws.close(1000, '正常关闭');
```

**4. 心跳机制**

```javascript
let heartbeatInterval;

function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
        }
    }, 30000); // 每30秒发送一次心跳
}

function stopHeartbeat() {
    clearInterval(heartbeatInterval);
}

ws.onopen = startHeartbeat;
ws.onclose = stopHeartbeat;
```

**5. 断线重连**

```javascript
class ReconnectWebSocket {
    constructor(url, options = {}) {
        this.url = url;
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || Infinity;
        this.reconnectAttempts = 0;
        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('连接已建立');
            this.reconnectAttempts = 0;
        };

        this.ws.onclose = () => {
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(`${this.reconnectInterval}ms后尝试第${this.reconnectAttempts}次重连`);
                setTimeout(() => this.connect(), this.reconnectInterval);
            }
        };

        this.ws.onmessage = (event) => {
            // 处理消息
        };
    }

    send(data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        }
    }
}

// 使用
const ws = new ReconnectWebSocket('wss://example.com/chat');
```

**6. WebSocket与HTTP对比**

| 对比项 | HTTP | WebSocket |
|--------|------|-----------|
| 通信模式 | 请求-响应 | 全双工 |
| 服务器推送 | 不支持（需轮询/SSE） | 原生支持 |
| 协议 | `http://` / `https://` | `ws://` / `wss://` |
| 头部开销 | 每次请求都有完整头部 | 建立后头部极小（2-10字节） |
| 连接 | 短连接/长连接 | 持久连接 |
| 适用场景 | 普通API请求 | 实时聊天、股票行情、游戏、协同编辑 |

**考点：** WebSocket原理、握手过程、心跳机制、断线重连、与HTTP对比、Socket.io

---

### 题目16：SSE 和 WebSocket 有什么区别？在前端方面是怎么表现的？

**答案：**

**1. 基本概念**

- **SSE（Server-Sent Events，服务器推送事件）**：基于 HTTP 协议，服务器向客户端单向推送数据的机制。客户端通过 `EventSource` API 建立连接，服务器可以持续发送文本数据。
- **WebSocket**：基于 TCP 协议的全双工通信协议。客户端和服务器之间建立持久连接，双方可以随时互发消息。

**2. 核心区别对比**

| 对比项 | SSE | WebSocket |
|--------|-----|-----------|
| 通信方向 | **单向**（服务器 → 客户端） | **全双工**（双向） |
| 底层协议 | HTTP | TCP（`ws://` / `wss://`） |
| 数据格式 | 仅文本（UTF-8） | 文本 + 二进制（ArrayBuffer、Blob） |
| 断线重连 | **浏览器自动重连**（原生支持） | 需要手动实现重连逻辑 |
| 连接数限制 | HTTP/1.1 下同域最多 6 个连接 | 单个 TCP 连接，无此限制 |
| 浏览器兼容性 | 除 IE 外全部支持 | 全部现代浏览器支持 |
| 跨域 | 支持 CORS | 无跨域限制（`ws://` 协议本身不受同源策略约束） |
| 自定义事件 | 原生支持自定义事件类型（`event:` 字段） | 需要自行在消息体中定义协议 |
| 心跳机制 | 不需要（长连接自动保持） | 需要手动实现 `ping/pong` 心跳 |
| 典型场景 | AI 对话流式输出、实时通知、股票行情推送 | 实时聊天、协同编辑、游戏、双向交互 |

**3. 前端 SSE 实现**

SSE 的前端实现非常简单，浏览器原生提供 `EventSource` API：

```javascript
// ========== 基础用法 ==========
const eventSource = new EventSource('/api/chat/stream');

// 监听默认 message 事件
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);
};

// 监听自定义事件（服务器通过 event: 字段指定事件名）
eventSource.addEventListener('token', (event) => {
  // AI 对话中常见的逐 token 推送
  const token = event.data;
  appendToChat(token);
});

eventSource.addEventListener('done', (event) => {
  // 服务器通知流结束
  console.log('生成完毕');
  eventSource.close();
});

// 监听错误
eventSource.onerror = (event) => {
  if (eventSource.readyState === EventSource.CLOSED) {
    console.log('连接已关闭');
  } else {
    console.log('连接出错，浏览器会自动重连');
  }
};

// 手动关闭连接
// eventSource.close();
```

**AI 对话场景中的 SSE 前端实现（流式输出）：**

```javascript
// ========== AI 对话流式输出完整示例 ==========
async function streamChat(prompt) {
  const chatBox = document.getElementById('chat-box');
  const responseEl = document.createElement('div');
  responseEl.classList.add('message', 'assistant');
  chatBox.appendChild(responseEl);

  // 使用 fetch + ReadableStream 处理 SSE（比 EventSource 更灵活）
  // 因为 AI 对话通常需要 POST 请求发送上下文，而 EventSource 只支持 GET
  const response = await fetch('/api/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      stream: true  // 开启流式输出
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // 解码二进制数据
    buffer += decoder.decode(value, { stream: true });

    // SSE 数据格式：每条消息以 \n\n 分隔
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 保留不完整的行

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();

        // [DONE] 是 OpenAI 兼容的流结束标记
        if (data === '[DONE]') {
          console.log('流式输出结束');
          continue;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            // 逐字追加到页面上，实现"打字机"效果
            responseEl.textContent += content;
          }
        } catch (e) {
          // 解析失败，可能是非 JSON 格式的纯文本
          responseEl.textContent += data;
        }
      }
    }
  }
}
```

**SSE 服务器端数据格式说明：**

```
# SSE 协议规定的数据格式（每条消息以 \n\n 结尾）
data: {"choices":[{"delta":{"content":"你"}}]}\n\n
data: {"choices":[{"delta":{"content":"好"}}]}\n\n
data: {"choices":[{"delta":{"content":"！"}}]}\n\n
data: [DONE]\n\n

# 自定义事件类型
event: token
data: Hello\n\n

event: error
data: {"code": 500, "message": "服务器错误"}\n\n
```

**4. 前端 WebSocket 实现**

```javascript
// ========== 基础用法 ==========
const ws = new WebSocket('wss://example.com/chat');

// 连接建立
ws.onopen = () => {
  console.log('WebSocket 连接已建立');
  // 连接建立后可以主动发送消息
  ws.send(JSON.stringify({ type: 'join', room: 'general' }));
};

// 接收消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);

  // 可以是文本
  if (typeof data === 'string') {
    console.log('文本消息:', data);
  }
};

// 连接关闭
ws.onclose = (event) => {
  console.log(`连接关闭: code=${event.code}, reason=${event.reason}`);
};

// 连接错误
ws.onerror = (error) => {
  console.error('WebSocket 错误:', error);
};

// 主动发送消息（随时可以发送，不受请求-响应限制）
ws.send(JSON.stringify({ type: 'message', content: '你好' }));
```

**AI 对话场景中的 WebSocket 前端实现：**

```javascript
// ========== AI 对话 WebSocket 完整示例 ==========
class AIChatWebSocket {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.messageQueue = []; // 消息队列，连接断开时缓存消息
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('AI 对话连接已建立');
      this.reconnectAttempts = 0;
      // 发送缓存的消息
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        this.ws.send(JSON.stringify(msg));
      }
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'token':
          // 逐 token 推送，与 SSE 类似
          this.onToken?.(data.content);
          break;
        case 'done':
          // 生成完毕
          this.onDone?.(data);
          break;
        case 'error':
          this.onError?.(data);
          break;
        case 'heartbeat':
          // 心跳响应
          break;
      }
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 3000);
      }
    };

    // 心跳保活
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  sendMessage(content) {
    const msg = { type: 'message', content };
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      this.messageQueue.push(msg);
    }
  }

  disconnect() {
    clearInterval(this.heartbeatTimer);
    this.ws?.close();
  }
}

// 使用
const chat = new AIChatWebSocket('wss://api.example.com/ai-chat');
chat.onToken = (token) => {
  document.getElementById('response').textContent += token;
};
chat.onDone = () => {
  console.log('AI 回复完成');
};
chat.sendMessage('请解释一下什么是闭包');
```

**5. AI 对话场景中 SSE vs WebSocket 的选型建议**

| 考量维度 | SSE（推荐用于 AI 对话） | WebSocket |
|---------|----------------------|-----------|
| 交互模式 | 用户提问 → AI 流式回复（请求-推送） | 需要双向实时通信 |
| 实现复杂度 | 前端代码极简（`fetch` + `ReadableStream`） | 需要管理连接状态、心跳、重连 |
| 部署成本 | 走 HTTP，无需额外端口，CDN 友好 | 需要 WebSocket 代理配置（Nginx 需额外配置） |
| 连接管理 | 请求结束即关闭，无状态 | 长连接，服务器需维护连接状态 |
| 兼容性 | 需要 `fetch` + `ReadableStream`（现代浏览器均支持） | 兼容性更好 |
| 适用场景 | ChatGPT 式对话、单轮问答流式输出 | 多人实时协作、持续双向对话、AI Agent 多轮交互 |

**6. 为什么主流 AI 产品（ChatGPT、Claude）都选择 SSE？**

1. **AI 对话本质是"请求-流式响应"模式**：用户发送一个问题，服务器持续推送生成结果，不需要客户端在生成过程中频繁发送数据，SSE 的单向推送完全够用。
2. **无状态、易扩展**：SSE 基于 HTTP，天然无状态，方便负载均衡和水平扩展。WebSocket 长连接则需要粘性会话（Sticky Session）。
3. **基础设施兼容性好**：SSE 走标准 HTTP 协议，所有 HTTP 代理、CDN、负载均衡器都天然支持，无需额外配置。WebSocket 需要代理层显式支持协议升级。
4. **自动重连**：`EventSource` 内置自动重连机制，断线后浏览器自动恢复连接，开发者无需额外处理。
5. **前端实现简单**：使用 `fetch` + `ReadableStream` 即可实现流式读取，代码量少，维护成本低。

**考点：** SSE、WebSocket、流式输出、EventSource、ReadableStream、AI 对话前端实现、全双工通信

---

## 第三部分：Vue + React 框架

---
