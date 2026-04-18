## 第1章：HTML 基础（15 题）

### 题目1：HTML5 有哪些语义化标签？它们各自的作用和使用场景是什么？

**答案：**

HTML5 引入了一系列语义化标签，目的是让页面的结构更加清晰，提升代码的可读性、可维护性，同时对搜索引擎优化（SEO）和无障碍访问（Accessibility）也有很大帮助。

常见的语义化标签及其作用如下：

**1. `<header>` —— 页面或区块的头部**

```html
<header>
  <h1>网站标题</h1>
  <nav>导航栏</nav>
</header>
```

用于定义页面或某个区块（如 `<article>`、`<section>`）的头部区域，通常包含标题、Logo、导航等内容。一个页面中可以有多个 `<header>`。

**2. `<nav>` —— 导航区域**

```html
<nav>
  <ul>
    <li><a href="/home">首页</a></li>
    <li><a href="/about">关于</a></li>
    <li><a href="/contact">联系我们</a></li>
  </ul>
</nav>
```

用于定义页面的主要导航链接区域。不是所有的链接组都需要放在 `<nav>` 中，只有主要的导航区块才使用。

**3. `<main>` —— 页面主体内容**

```html
<main>
  <article>文章内容...</article>
  <aside>侧边栏...</aside>
</main>
```

用于表示页面的核心内容区域，一个页面中只能有一个 `<main>` 标签。它不应包含在 `<header>`、`<footer>`、`<nav>`、`<aside>` 等标签内。

**4. `<article>` —— 独立的内容单元**

```html
<article>
  <h2>文章标题</h2>
  <p>文章正文内容...</p>
  <footer>发布时间：2024-01-01</footer>
</article>
```

表示一段独立的、完整的内容，如一篇博客文章、一条新闻、一个论坛帖子等。判断标准是：这段内容能否脱离上下文独立存在并被完整理解。

**5. `<section>` —— 主题性的内容分组**

```html
<section>
  <h2>产品特点</h2>
  <p>特点一...</p>
  <p>特点二...</p>
</section>
```

用于将页面内容按主题进行分组，通常带有标题（`<h1>` ~ `<h6>`）。`<section>` 不同于 `<div>`，它具有语义含义，表示一个有逻辑关联的内容区块。

**6. `<aside>` —— 侧边栏或附属内容**

```html
<aside>
  <h3>相关推荐</h3>
  <ul>
    <li>推荐文章一</li>
    <li>推荐文章二</li>
  </ul>
</aside>
```

用于定义与页面主要内容相关但非核心的附属内容，如侧边栏、广告、相关链接等。

**7. `<footer>` —— 页面或区块的底部**

```html
<footer>
  <p>版权所有 &copy; 2024</p>
  <p>联系方式：xxx@example.com</p>
</footer>
```

用于定义页面或某个区块的底部信息，通常包含版权信息、联系方式、相关链接等。

**8. `<figure>` 和 `<figcaption>` —— 图文组合**

```html
<figure>
  <img src="chart.png" alt="销售数据图表">
  <figcaption>图1：2024年第一季度销售数据</figcaption>
</figure>
```

`<figure>` 用于包裹独立的引用内容（图片、图表、代码片段等），`<figcaption>` 用于为其添加标题或说明。

**9. `<time>` —— 时间日期**

```html
<p>发布于 <time datetime="2024-01-01">2024年1月1日</time></p>
```

用于表示日期或时间，`datetime` 属性提供机器可读的格式，有助于搜索引擎理解时间信息。

**10. `<mark>`、`<strong>`、`<em>` —— 文本语义**

```html
<p>搜索关键词 <mark>前端面试</mark> 的结果</p>
<p><strong>重要提示：</strong>请务必在截止日期前提交。</p>
<p><em>注意：</em>这是一条需要强调的信息。</p>
```

- `<mark>`：标记高亮文本（类似荧光笔效果）
- `<strong>`：表示内容的重要性（加粗）
- `<em>`：表示语气的强调（斜体）

**语义化标签的优势总结：**

| 优势 | 说明 |
|------|------|
| 可读性 | 代码结构清晰，开发者更容易理解和维护 |
| SEO | 搜索引擎能更好地理解页面结构和内容层次 |
| 无障碍 | 屏幕阅读器等辅助设备能更好地解析页面 |
| 可维护性 | 代码语义明确，团队协作效率更高 |

**考点：** HTML5语义化标签

---

---

### 题目2：DOCTYPE 的作用是什么？常见的 DOCTYPE 声明有哪些？浏览器的渲染模式有哪些区别？

**答案：**

**1. DOCTYPE 的作用**

DOCTYPE（Document Type Declaration，文档类型声明）位于 HTML 文档的最前面，在 `<html>` 标签之前。它的主要作用是告诉浏览器当前文档使用的是哪种 HTML 或 XHTML 规范，以便浏览器决定使用哪种渲染模式来解析和显示页面。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>页面标题</title>
</head>
<body>
  <!-- 页面内容 -->
</body>
</html>
```

如果不声明 DOCTYPE，浏览器会进入"怪异模式"（Quirks Mode），导致不同浏览器的渲染结果不一致，出现各种兼容性问题。

**2. 常见的 DOCTYPE 声明**

**HTML5 DOCTYPE（推荐使用）：**

```html
<!DOCTYPE html>
```

HTML5 的 DOCTYPE 声明非常简洁，不引用 DTD（Document Type Definition），因为它不基于 SGML。

**HTML 4.01 Strict（严格模式）：**

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
  "http://www.w3.org/TR/html4/strict.dtd">
```

不包含展示性的和废弃的元素（如 `<font>`、`<center>`）。

**HTML 4.01 Transitional（过渡模式）：**

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
  "http://www.w3.org/TR/html4/loose.dtd">
```

包含展示性的和废弃的元素，允许使用更宽松的语法。

**XHTML 1.0 Strict：**

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
```

**XHTML 1.0 Transitional：**

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
```

**3. 浏览器的三种渲染模式**

| 渲染模式 | 触发条件 | 特点 |
|----------|----------|------|
| **Standards Mode（标准模式）** | 声明了正确的 DOCTYPE | 浏览器按照 W3C 标准来渲染页面，行为最一致 |
| **Almost Standards Mode（近乎标准模式）** | 声明了某些特定的过渡型 DOCTYPE | 基本遵循标准，但在少数细节（如表格内图片的垂直对齐）上保留怪异模式的行为 |
| **Quirks Mode（怪异模式）** | 未声明 DOCTYPE 或声明了错误的 DOCTYPE | 模拟旧版浏览器的行为，不同浏览器之间差异很大 |

**各模式的核心区别：**

```css
/* 怪异模式下的盒模型：width 包含 padding 和 border */
/* 标准模式下的盒模型：width 只包含 content */

/* 怪异模式示例 */
.box-quirks {
  /* width = content + padding + border */
  width: 200px;
  padding: 10px;
  border: 5px solid #000;
  /* 实际内容区域宽度 = 200 - 10*2 - 5*2 = 170px */
}

/* 标准模式示例 */
.box-standard {
  /* width 仅为 content 的宽度 */
  width: 200px;
  padding: 10px;
  border: 5px solid #000;
  /* 实际占用宽度 = 200 + 10*2 + 5*2 = 230px */
}
```

**其他差异：**

- **行内元素的垂直对齐**：怪异模式中，行内元素（如图片）在表格单元格中的基线对齐方式不同。
- **`font-size` 关键字**：怪异模式中某些关键字的计算值不同。
- **百分比高度**：标准模式中，如果父元素没有明确的高度，子元素的百分比高度会计算为 `auto`；怪异模式中可能不同。
- **替换元素**：如 `<img>`、`<input>` 等在怪异模式中可能被视为行内块级元素。

**4. 如何确保使用标准模式**

最简单的方法就是始终在 HTML 文档的第一行使用 `<!DOCTYPE html>` 声明，这也是现代前端开发的标准做法。

**考点：** DOCTYPE和渲染模式

---

---

### 题目3：localStorage 和 sessionStorage 有什么区别？它们与 Cookie 相比各有什么优缺点？

**答案：**

**1. localStorage 和 sessionStorage 的基本概念**

两者都属于 Web Storage API，是 HTML5 提供的在客户端存储数据的机制。它们都遵循同源策略（Same-Origin Policy），即只有同协议、同域名、同端口的页面才能访问相同的数据。

**2. localStorage 和 sessionStorage 的区别**

| 特性 | localStorage | sessionStorage |
|------|-------------|----------------|
| **生命周期** | 永久存储，除非手动清除 | 会话级存储，标签页/窗口关闭后自动清除 |
| **作用域** | 同源下所有标签页/窗口共享 | 仅当前标签页/窗口可见（不同标签页不共享） |
| **存储大小** | 约 5MB（因浏览器而异） | 约 5MB（因浏览器而异） |
| **存储位置** | 浏览器本地 | 浏览器本地 |

**代码示例：**

```javascript
// ========== localStorage ==========

// 存储数据
localStorage.setItem('username', '张三');
localStorage.setItem('age', '25');

// 也可以存储对象（需要序列化）
const user = { name: '张三', age: 25 };
localStorage.setItem('user', JSON.stringify(user));

// 读取数据
const username = localStorage.getItem('username'); // '张三'
const userObj = JSON.parse(localStorage.getItem('user')); // { name: '张三', age: 25 }

// 删除某条数据
localStorage.removeItem('username');

// 清空所有数据
localStorage.clear();

// 获取存储的数据条数
const count = localStorage.length;

// 按索引获取 key
const firstKey = localStorage.key(0);


// ========== sessionStorage ==========

// 用法与 localStorage 完全一致
sessionStorage.setItem('token', 'abc123');
const token = sessionStorage.getItem('token'); // 'abc123'
sessionStorage.removeItem('token');
sessionStorage.clear();
```

**sessionStorage 的作用域细节：**

```javascript
// 页面 A（在标签页1中打开）
sessionStorage.setItem('tab', 'tab1');

// 页面 A（在标签页2中打开）
console.log(sessionStorage.getItem('tab')); // null —— 不同标签页不共享

// 但同一标签页中的 iframe 可以共享（同源的情况下）
// 标签页1中嵌套的 iframe：
console.log(sessionStorage.getItem('tab')); // 'tab1'
```

**3. Web Storage 与 Cookie 的对比**

| 特性 | Cookie | localStorage | sessionStorage |
|------|--------|-------------|----------------|
| **存储大小** | 约 4KB | 约 5MB | 约 5MB |
| **生命周期** | 可设置过期时间，默认会话结束 | 永久 | 会话级 |
| **与服务器通信** | 每次请求都会自动携带（Cookie 头） | 不自动发送 | 不自动发送 |
| **作用域** | 同源 + 可设置 path/domain | 同源所有标签页 | 仅当前标签页 |
| **安全性** | 可设置 HttpOnly、Secure | 无 HttpOnly | 无 HttpOnly |
| **API** | `document.cookie`（操作不便） | `setItem/getItem` 等简洁 API | `setItem/getItem` 等简洁 API |
| **适用场景** | 身份认证、Session ID | 长期存储的用户偏好、主题设置 | 临时表单数据、一次性会话数据 |

**Cookie 的基本操作：**

```javascript
// 设置 Cookie
document.cookie = 'username=张三; expires=Fri, 31 Dec 2025 23:59:59 GMT; path=/; Secure; HttpOnly';

// 读取 Cookie（需要手动解析）
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

// 删除 Cookie（设置过期时间为过去的时间）
document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
```

**4. 实际应用场景**

```javascript
// 场景1：使用 localStorage 记住用户主题偏好
function setTheme(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

// 页面加载时恢复主题
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

// 场景2：使用 sessionStorage 保存表单临时数据（防止刷新丢失）
const form = document.getElementById('myForm');
form.addEventListener('input', () => {
  sessionStorage.setItem('formData', JSON.stringify({
    name: form.name.value,
    email: form.email.value
  }));
});

// 页面加载时恢复表单数据
const savedData = JSON.parse(sessionStorage.getItem('formData') || '{}');
if (savedData.name) form.name.value = savedData.name;
if (savedData.email) form.email.value = savedData.email;

// 场景3：使用 Cookie 进行身份认证
// 服务端设置 Set-Cookie: session_id=xxx; HttpOnly; Secure; SameSite=Strict
// 前端每次请求自动携带
```

**5. 安全注意事项**

- 不要在 localStorage/sessionStorage 中存储敏感信息（如密码、Token），因为它们可以通过 JavaScript 访问，容易受到 XSS 攻击。
- Cookie 可以设置 `HttpOnly` 属性防止 JavaScript 访问，更适合存储 Session ID。
- 敏感数据应使用 `Secure` 属性确保只通过 HTTPS 传输。
- 存储大量数据时应考虑性能影响，Web Storage 是同步操作，数据量大时会阻塞主线程。

**考点：** localStorage和sessionStorage

---