## 第8章：Node.js（15 题）

### 题目1：Node.js 的事件循环机制是什么？和浏览器的事件循环有什么区别？

**答案：**

Node.js 的事件循环（Event Loop）是 Node.js 能够实现非阻塞 I/O 操作的核心机制。它是基于 libuv 库实现的，负责执行代码、收集和处理事件，以及执行队列中的子任务的机制。

#### 事件循环的六个阶段

Node.js 的事件循环分为六个阶段，每个阶段都有一个先进先出的回调队列：

1. **timers 阶段**：执行 `setTimeout` 和 `setInterval` 的回调。Node.js 会检查定时器是否到期，如果到期则执行对应的回调函数。
2. **pending callbacks 阶段**：执行上一轮循环中遗留的 I/O 回调（某些系统操作的回调，如 TCP 错误类型）。
3. **idle, prepare 阶段**：仅内部使用，开发者通常不直接操作。
4. **poll（轮询）阶段**：获取新的 I/O 事件，执行与 I/O 相关的回调。这是事件循环中最核心的阶段。如果 poll 队列为空，则会检查是否有 `setImmediate` 或定时器到期。
5. **check 阶段**：执行 `setImmediate` 的回调。
6. **close callbacks 阶段**：执行关闭事件的回调，如 `socket.on('close', ...)`。

```
   ┌───────────────────────────┐
┌─>│         timers             │
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │     pending callbacks     │
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │       idle, prepare       │
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │         poll              │<─ I/O 事件在此处理
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │         check             │<─ setImmediate 回调
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
└──│     close callbacks        │
   └───────────────────────────┘
```

#### 事件循环执行示例

```javascript
console.log('1. 同步代码开始');

setTimeout(() => {
  console.log('2. setTimeout 回调 (timers 阶段)');
}, 0);

setImmediate(() => {
  console.log('3. setImmediate 回调 (check 阶段)');
});

fs.readFile(__filename, () => {
  console.log('4. 文件读取回调 (poll 阶段)');

  setTimeout(() => {
    console.log('5. 文件读取内的 setTimeout');
  }, 0);

  setImmediate(() => {
    console.log('6. 文件读取内的 setImmediate');
  });
});

console.log('7. 同步代码结束');

// 可能的输出顺序：
// 1. 同步代码开始
// 7. 同步代码结束
// 2. setTimeout 回调 (timers 阶段)  或  3. setImmediate 回调 (check 阶段)
// 4. 文件读取回调 (poll 阶段)
// 6. 文件读取内的 setImmediate
// 5. 文件读取内的 setTimeout
```

注意：在 I/O 回调内部，`setImmediate` 总是先于 `setTimeout` 执行，因为 I/O 回调在 poll 阶段执行，执行完毕后直接进入 check 阶段。

#### process.nextTick 的特殊性

`process.nextTick` 不属于事件循环的任何一个阶段，它在当前操作完成后、进入下一个阶段之前立即执行。它的优先级高于所有微任务和宏任务。

```javascript
process.nextTick(() => {
  console.log('nextTick 执行');
});

Promise.resolve().then(() => {
  console.log('Promise 微任务执行');
});

// 输出：
// nextTick 执行
// Promise 微任务执行
```

#### 与浏览器事件循环的区别

| 对比项 | Node.js 事件循环 | 浏览器事件循环 |
|--------|------------------|----------------|
| 实现基础 | 基于 libuv | 基于 HTML5 规范 |
| 宏任务 | setTimeout、setInterval、setImmediate、I/O | setTimeout、setInterval、requestAnimationFrame、UI 渲染 |
| 微任务 | process.nextTick、Promise、queueMicrotask | Promise、MutationObserver |
| 微任务执行时机 | 每个阶段完成后清空微任务队列 | 每个宏任务完成后清空微任务队列 |
| 阶段划分 | 六个明确阶段（timers、poll、check 等） | 无明确阶段划分 |
| nextTick | 有 process.nextTick，优先级最高 | 无对应概念 |
| setImmediate | 有 | 无（浏览器有 MessageChannel 可模拟） |

**核心区别总结**：浏览器事件循环是"宏任务 -> 微任务 -> 渲染 -> 宏任务"的循环，而 Node.js 事件循环是按阶段推进的，每个阶段执行完毕后会清空微任务队列（包括 nextTick 和 Promise），然后才进入下一个阶段。

**考点：** 事件循环、宏任务与微任务、libuv、process.nextTick、setImmediate、与浏览器事件循环对比

---

---

### 题目2：Node.js 的模块系统（CommonJS 和 ES Module）有什么区别？

**答案：**

Node.js 支持两种模块系统：CommonJS（CJS）和 ES Module（ESM）。它们在语法、加载机制、缓存策略等方面存在显著差异。

#### CommonJS（CJS）

CommonJS 是 Node.js 原生的模块系统，使用 `require()` 导入和 `module.exports` 导出。

```javascript
// math.js (CommonJS)
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

// 导出方式一：逐个挂载
module.exports.add = add;
module.exports.multiply = multiply;

// 导出方式二：整体导出
// module.exports = { add, multiply };

// 导出方式三：导出函数/类本身
// module.exports = add;
```

```javascript
// app.js (CommonJS)
const math = require('./math');

console.log(math.add(1, 2));       // 3
console.log(math.multiply(3, 4));  // 12
```

#### ES Module（ESM）

ES Module 是 ECMAScript 标准定义的模块系统，使用 `import`/`export` 语法。Node.js 从 v12 开始正式支持。

```javascript
// math.mjs (ES Module)
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// 默认导出
export default class Calculator {
  constructor() {
    this.result = 0;
  }
}
```

```javascript
// app.mjs (ES Module)
import Calculator, { add, multiply } from './math.mjs';

console.log(add(1, 2));       // 3
console.log(multiply(3, 4));  // 12

// 动态导入（返回 Promise）
const module = await import('./math.mjs');
console.log(module.add(5, 6)); // 11
```

#### 核心区别

| 对比项 | CommonJS | ES Module |
|--------|----------|-----------|
| 关键字 | `require` / `module.exports` | `import` / `export` |
| 加载时机 | 运行时加载（动态） | 编译时静态分析（静态） |
| 加载方式 | 值的拷贝（浅拷贝） | 值的引用（只读绑定） |
| 是否可条件导入 | 可以（`require` 可在任意位置调用） | 不可以（`import` 必须在顶层） |
| this 指向 | 指向当前模块的 `module.exports` | 指向 `undefined` |
| 文件扩展名 | `.js` | `.mjs` 或 `package.json 中设置 `"type": "module"` |
| 循环依赖处理 | 返回已执行部分的导出 | 返回已解析的引用，但值为 undefined |
| Tree Shaking | 不支持 | 支持（静态分析可移除未使用代码） |
| 顶层 await | 不支持 | 支持（Top-level await） |

#### 值拷贝 vs 值引用（重要区别）

```javascript
// counter.cjs (CommonJS - 值拷贝)
let count = 0;

function increment() {
  count++;
}

module.exports = { count, increment };
```

```javascript
// app.cjs
const counter = require('./counter.cjs');
console.log(counter.count); // 0
counter.increment();
console.log(counter.count); // 仍然是 0！因为导出的是值的拷贝
```

```javascript
// counter.mjs (ES Module - 值引用)
export let count = 0;

export function increment() {
  count++;
}
```

```javascript
// app.mjs
import { count, increment } from './counter.mjs';
console.log(count); // 0
increment();
console.log(count); // 1！因为导出的是值的引用（只读绑定）
```

#### 如何在 Node.js 中启用 ES Module

方式一：使用 `.mjs` 扩展名。

方式二：在 `package.json` 中设置：

```json
{
  "type": "module"
}
```

#### 混合使用

在 ESM 中导入 CJS 模块（支持）：

```javascript
// app.mjs
import { createServer } from 'http';   // Node.js 内置模块支持
import express from 'express';          // 第三方 CJS 模块支持 default import
import { readFileSync } from 'fs';      // 命名导入也支持
```

在 CJS 中导入 ESM 模块（不支持静态 import，只能动态导入）：

```javascript
// app.cjs
(async () => {
  const { add } = await import('./math.mjs');
  console.log(add(1, 2));
})();
```

#### `__dirname` 和 `__filename` 在 ESM 中的替代

ESM 中没有 `__dirname` 和 `__filename`，需要手动获取：

```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);  // 当前文件所在目录的绝对路径
console.log(__filename); // 当前文件的绝对路径
```

**考点：** CommonJS、ES Module、模块加载机制、值拷贝与值引用、Tree Shaking、循环依赖、`import.meta`

---

---

### 题目3：什么是 Stream（流）？Node.js 中有哪些类型的流？

**答案：**

Stream（流）是 Node.js 中处理流式数据的抽象接口。流的核心思想是"分块处理"，而不是一次性将所有数据加载到内存中。这在处理大文件、网络传输、实时数据等场景中至关重要。

#### 为什么需要 Stream

假设需要读取一个 10GB 的文件并写入另一个文件：

```javascript
// 不使用 Stream（危险！可能导致内存溢出）
const fs = require('fs');
const data = fs.readFileSync('./large-file.dat');  // 一次性加载 10GB 到内存
fs.writeFileSync('./copy.dat', data);
```

```javascript
// 使用 Stream（安全高效，内存占用极小）
const fs = require('fs');
const readStream = fs.createReadStream('./large-file.dat');
const writeStream = fs.createWriteStream('./copy.dat');
readStream.pipe(writeStream);  // 自动管理数据流动
```

#### 四种基本流类型

1. **Readable（可读流）**：从数据源读取数据，如 `fs.createReadStream`、`process.stdin`、HTTP 的 `req` 对象。
2. **Writable（可写流）**：向目标写入数据，如 `fs.createWriteStream`、`process.stdout`、HTTP 的 `res` 对象。
3. **Duplex（双工流）**：同时可读可写，如 TCP Socket、`net.Socket`。
4. **Transform（转换流）**：在读写过程中可以修改或转换数据，如 `zlib.createGzip`、`crypto.createCipheriv`。

#### Readable Stream 详细用法

可读流有两种模式：flowing（流动模式）和 paused（暂停模式）。

```javascript
const fs = require('fs');

// 方式一：flowing 模式（通过 pipe 或 data 事件自动切换）
const readStream = fs.createReadStream('./input.txt', {
  encoding: 'utf-8',    // 设置编码，否则 data 事件返回 Buffer
  highWaterMark: 64 * 1024  // 内部缓冲区大小，默认 64KB
});

readStream.on('data', (chunk) => {
  console.log(`收到 ${chunk.length} 字节的数据`);
});

readStream.on('end', () => {
  console.log('读取完毕');
});

readStream.on('error', (err) => {
  console.error('读取错误:', err);
});
```

```javascript
// 方式二：paused 模式（手动读取）
const readStream = fs.createReadStream('./input.txt');

readStream.on('readable', () => {
  let chunk;
  while (null !== (chunk = readStream.read())) {
    console.log(`读取到 ${chunk.length} 字节`);
  }
});
```

#### Writable Stream 详细用法

```javascript
const fs = require('fs');

const writeStream = fs.createWriteStream('./output.txt');

writeStream.write('第一行数据\n', 'utf-8', (err) => {
  if (err) console.error('写入失败:', err);
});

writeStream.write('第二行数据\n');
writeStream.end('最后一行数据\n', () => {
  console.log('写入完成');
});

// 处理背压（backpressure）
// write() 返回 boolean，false 表示内部缓冲区已满，应暂停读取
const canContinue = writeStream.write('数据');
if (!canContinue) {
  readStream.pause();  // 暂停可读流
}

writeStream.on('drain', () => {
  readStream.resume(); // 缓冲区清空后恢复读取
});
```

#### pipe 管道

`pipe` 是最简洁的流连接方式，自动处理背压和错误传播。

```javascript
const fs = require('fs');
const zlib = require('zlib');

// 文件压缩：读取 -> Gzip 压缩 -> 写入
fs.createReadStream('./input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('./output.txt.gz'));

// 链式管道
const { pipeline } = require('stream/promises');

async function compressFile() {
  await pipeline(
    fs.createReadStream('./input.txt'),
    zlib.createGzip(),
    fs.createWriteStream('./output.txt.gz')
  );
  console.log('压缩完成');
}

compressFile().catch(console.error);
```

#### Transform Stream 自定义实现

```javascript
const { Transform } = require('stream');

// 大写转换流
class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}

// 使用
fs.createReadStream('./input.txt')
  .pipe(new UpperCaseTransform())
  .pipe(fs.createWriteStream('./output.txt'));

// 简写方式
const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});
```

#### 实际应用场景

```javascript
// 场景一：HTTP 文件下载（流式响应，不占用大量内存）
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const fileStream = fs.createReadStream('./large-video.mp4');
  res.setHeader('Content-Type', 'video/mp4');
  fileStream.pipe(res);  // 流式传输给客户端
});

server.listen(3000);

// 场景二：CSV 数据处理（逐行读取大文件）
const { createReadStream } = require('fs');
const { createInterface } = require('readline');

async function processLargeCSV(filePath) {
  const readStream = createReadStream(filePath, { encoding: 'utf-8' });
  const rl = createInterface({ input: readStream });

  for await (const line of rl) {
    const [name, age, city] = line.split(',');
    console.log(`姓名: ${name}, 年龄: ${age}, 城市: ${city}`);
  }
}

processLargeCSV('./users.csv');
```

**考点：** Stream 四种类型、pipe 管道、背压机制、Readable/Writable/Transform、流式数据处理、内存优化

---

---

### 题目4：Node.js 中的 Buffer 是什么？如何使用？

**答案：**

Buffer 是 Node.js 中用于处理二进制数据的类。在 Node.js 中，TCP 流、文件系统操作、以及其他与 I/O 交互的场景都涉及二进制数据，Buffer 就是用来存储和操作这些二进制数据的容器。

JavaScript 原生只有字符串类型，无法直接操作二进制数据。Buffer 类似于一个固定长度的字节数组，每个元素是一个 0 到 255 之间的无符号整数。

#### 创建 Buffer

```javascript
// 方式一：Buffer.alloc（推荐，分配指定大小的 Buffer，自动填充 0）
const buf1 = Buffer.alloc(10);  // 创建 10 字节的全零 Buffer
console.log(buf1); // <Buffer 00 00 00 00 00 00 00 00 00 00>

// 方式二：Buffer.allocUnsafe（更快，但可能包含旧数据，需要手动覆盖）
const buf2 = Buffer.allocUnsafe(10);
buf2.fill(0);  // 手动填充

// 方式三：Buffer.from（从字符串、数组、ArrayBuffer 创建）
const buf3 = Buffer.from('Hello Node.js', 'utf-8');
console.log(buf3); // <Buffer 48 65 6c 6c 6f 20 4e 6f 64 65 2e 6a 73>

const buf4 = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
console.log(buf4.toString()); // "Hello"

const buf5 = Buffer.from(new Uint8Array([1, 2, 3, 4, 5]));
```

#### Buffer 的基本操作

```javascript
const buf = Buffer.from('Hello World');

// 读取和写入
console.log(buf[0]);           // 72 (H 的 ASCII 码)
console.log(buf.toString());   // "Hello World"
console.log(buf.toString('hex')); // "48656c6c6f20576f726c64"
console.log(buf.toString('base64')); // "SGVsbG8gV29ybGQ="

// 写入
buf.write('Node');
console.log(buf.toString());   // "Node World"

// 长度和截取
console.log(buf.length);       // 11
const sub = buf.subarray(0, 4); // 推荐使用 subarray（返回视图，共享内存）
console.log(sub.toString());   // "Node"

// Buffer 比较
const a = Buffer.from('ABC');
const b = Buffer.from('ABD');
console.log(a.equals(b));      // false
console.log(a.compare(b));     // -1 (a < b)

// Buffer 拼接
const c = Buffer.concat([Buffer.from('Hello '), Buffer.from('World')]);
console.log(c.toString());     // "Hello World"

// Buffer 判断
console.log(Buffer.isBuffer(buf));   // true
console.log(Buffer.isBuffer('str')); // false
```

#### Buffer 与字符串的编码转换

```javascript
// Node.js 支持的编码格式
const encodings = [
  'utf-8',      // 默认编码，可变长度（1-4 字节）
  'ascii',      // 7 位 ASCII，高位清零
  'utf16le',    // UTF-16 小端序
  'ucs2',       // utf16le 的别名
  'base64',     // Base64 编码
  'hex',        // 十六进制编码
  'latin1',     // ISO-8859-1，单字节编码
];

// 编码示例
const text = '你好，世界';
const utf8Buf = Buffer.from(text, 'utf-8');
console.log(utf8Buf.length);  // 15（中文字符在 UTF-8 中占 3 字节）

const base64Str = utf8Buf.toString('base64');
console.log(base64Str);  // "5L2g5aW977yM5LiW55WM"

// Base64 解码
const decoded = Buffer.from(base64Str, 'base64').toString('utf-8');
console.log(decoded);  // "你好，世界"
```

#### Buffer 在文件操作中的应用

```javascript
const fs = require('fs');

// 读取二进制文件（如图片）
const imageBuffer = fs.readFileSync('./image.png');
console.log(`图片大小: ${imageBuffer.length} 字节`);

// 复制二进制文件
fs.writeFileSync('./image-copy.png', imageBuffer);

// 使用 Buffer 处理文件上传
const http = require('http');
const server = http.createServer((req, res) => {
  const chunks = [];

  req.on('data', (chunk) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    const buffer = Buffer.concat(chunks);
    console.log(`接收到 ${buffer.length} 字节数据`);
    fs.writeFileSync('./uploaded-file', buffer);
    res.end('上传成功');
  });
});

server.listen(3000);
```

#### Buffer 在网络编程中的应用

```javascript
const net = require('net');

const server = net.createServer((socket) => {
  // 处理 TCP 数据包
  socket.on('data', (data) => {
    // data 是 Buffer 类型
    const command = data.subarray(0, 4).toString('ascii');
    const payload = data.subarray(4);

    console.log(`命令: ${command}, 数据长度: ${payload.length}`);

    // 构造响应 Buffer
    const header = Buffer.from('OKAY');
    const response = Buffer.concat([header, payload]);
    socket.write(response);
  });
});

server.listen(8080);
```

#### Buffer 的注意事项

```javascript
// 1. Buffer 是全局变量，不需要 require
console.log(typeof Buffer); // "function"

// 2. Buffer 内存分配在 V8 堆外（C++ 层），不受 V8 堆大小限制
// 但仍受物理内存限制

// 3. Buffer.subarray() 和 Buffer.slice() 返回的是视图，共享底层内存
const original = Buffer.from('Hello');
const view = original.subarray(0, 3);
view[0] = 74;  // 修改 view 也会修改 original
console.log(original.toString()); // "Jello"

// 4. Buffer.alloc() vs Buffer.allocUnsafe()
// allocUnsafe 不会清零内存，可能泄露敏感信息
// 生产环境推荐使用 Buffer.alloc()
```

**考点：** Buffer 二进制数据、编码转换、Buffer 创建方式、内存管理、文件与网络 I/O 中的 Buffer 使用

---

---

### 题目5：Express 和 Koa 的区别是什么？Koa 的洋葱模型是怎么工作的？

**答案：**

Express 和 Koa 都是 Node.js 的 Web 框架，但它们的设计理念和使用方式有显著差异。Koa 由 Express 原班团队打造，旨在解决 Express 的一些设计缺陷。

#### 核心区别

| 对比项 | Express | Koa |
|--------|---------|-----|
| 设计理念 | 包含路由、模板引擎等（大而全） | 极致精简，只提供核心功能（小而美） |
| 中间件模型 | 线性模型（基于回调） | 洋葱模型（基于 async/await） |
| 异步处理 | 回调函数，需手动处理异步错误 | 原生 async/await，更优雅 |
| this 指向 | request 和 response 对象 | Context（ctx）对象合并了 req 和 res |
| 错误处理 | 需要设置 error handler 中间件 | try/catch + app.on('error') |
| 路由 | 内置 | 需要第三方库（koa-router） |
| 社区生态 | 成熟，中间件丰富 | 较新，但生态也在增长 |

#### Express 中间件（线性模型）

```javascript
const express = require('express');
const app = express();

// 中间件按注册顺序依次执行
app.use((req, res, next) => {
  console.log('1. 第一个中间件 - 请求前');
  next();  // 传递给下一个中间件
  console.log('4. 第一个中间件 - 请求后');
});

app.use((req, res, next) => {
  console.log('2. 第二个中间件 - 请求前');
  next();
  console.log('5. 第二个中间件 - 请求后');
});

app.get('/', (req, res) => {
  console.log('3. 路由处理函数');
  res.send('Hello Express');
});

app.listen(3000);

// 请求 / 时的输出：
// 1. 第一个中间件 - 请求前
// 2. 第二个中间件 - 请求前
// 3. 路由处理函数
// 5. 第二个中间件 - 请求后
// 4. 第一个中间件 - 请求后
```

注意：Express 的"请求后"代码只有在 `next()` 之后的中间件同步执行完毕后才会运行。如果后续中间件是异步的，"请求后"代码可能在异步操作完成之前就执行了。

#### Koa 洋葱模型

```javascript
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
  console.log('1. 第一层 - 请求前');
  await next();  // 等待所有后续中间件执行完毕
  console.log('6. 第一层 - 请求后');
});

app.use(async (ctx, next) => {
  console.log('2. 第二层 - 请求前');
  await next();
  console.log('5. 第二层 - 请求后');
});

app.use(async (ctx, next) => {
  console.log('3. 第三层 - 请求前');
  await next();
  console.log('4. 第三层 - 请求后');
  ctx.body = 'Hello Koa';
});

app.listen(3001);

// 请求时的输出：
// 1. 第一层 - 请求前
// 2. 第二层 - 请求前
// 3. 第三层 - 请求前
// 4. 第三层 - 请求后
// 5. 第二层 - 请求后
// 6. 第一层 - 请求后
```

洋葱模型的执行过程可以用下图表示：

```
    请求进入 →
    ┌─────────────────────────┐
    │  中间件1 (请求前)        │
    │   ┌───────────────────┐ │
    │   │  中间件2 (请求前)   │ │
    │   │   ┌─────────────┐ │ │
    │   │   │  中间件3     │ │ │
    │   │   │  (核心处理)  │ │ │
    │   │   └─────────────┘ │ │
    │   │  中间件2 (请求后)   │ │
    │   └───────────────────┘ │
    │  中间件1 (请求后)        │
    └─────────────────────────┘
    ← 响应返回
```

#### 洋葱模型的优势

洋葱模型最大的优势在于**请求后处理**（Post-processing）。由于 `await next()` 会等待后续所有中间件执行完毕，因此可以在 `next()` 之后执行一些"收尾"工作。

```javascript
// 实际应用：响应时间统计
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
  console.log(`请求 ${ctx.url} 耗时 ${ms}ms`);
});

// 实际应用：统一错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
    ctx.app.emit('error', err, ctx);
  }
});

// 实际应用：统一响应格式
app.use(async (ctx, next) => {
  await next();
  if (ctx.body && typeof ctx.body === 'object') {
    ctx.body = {
      code: 200,
      message: 'success',
      data: ctx.body,
    };
  }
});
```

#### Express vs Koa 异步处理对比

```javascript
// Express 中处理异步错误（容易遗漏）
app.get('/data', async (req, res, next) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (err) {
    next(err);  // 必须手动传递错误
  }
});

// 如果忘记 try/catch，异步错误不会被 Express 捕获
// 需要使用 express-async-errors 等库来补救

// Koa 中处理异步错误（天然支持）
app.use(async (ctx) => {
  const data = await fetchData();  // 如果抛出错误，会被 Koa 自动捕获
  ctx.body = data;
});
```

#### 路由对比

```javascript
// Express - 内置路由
const express = require('express');
const app = express();

app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});

app.post('/users', (req, res) => {
  res.status(201).json({ message: '创建成功' });
});

// Koa - 需要第三方路由
const Koa = require('koa');
const Router = require('@koa/router');
const app = new Koa();
const router = new Router();

router.get('/users/:id', (ctx) => {
  ctx.body = { id: ctx.params.id };
});

router.post('/users', (ctx) => {
  ctx.status = 201;
  ctx.body = { message: '创建成功' };
});

app.use(router.routes());
app.use(router.allowedMethods());
```

**考点：** Express vs Koa、洋葱模型、中间件执行机制、async/await 异步处理、Context 对象、路由设计

---

---

### 题目6：Node.js 中如何处理未捕获的异常和未处理的 Promise 拒绝？

**答案：**

在 Node.js 中，未处理的异常和未处理的 Promise 拒绝是导致进程崩溃的常见原因。正确处理这些错误是构建健壮 Node.js 应用的关键。

#### 同步异常处理

同步代码中的异常可以通过 `try/catch` 捕获：

```javascript
try {
  JSON.parse('invalid json');
} catch (err) {
  console.error('JSON 解析失败:', err.message);
}
```

#### 异步回调中的错误处理

```javascript
const fs = require('fs');

// 回调风格：通过 error-first callback 处理
fs.readFile('./non-existent.txt', (err, data) => {
  if (err) {
    console.error('文件读取失败:', err.message);
    return;
  }
  console.log(data.toString());
});
```

#### Promise 中的错误处理

```javascript
// 方式一：.catch()
fetch('https://api.example.com/data')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error('请求失败:', err.message));

// 方式二：try/catch + async/await（推荐）
async function fetchData() {
  try {
    const res = await fetch('https://api.example.com/data');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('请求失败:', err.message);
    throw err;  // 可以选择重新抛出，让上层处理
  }
}
```

#### 全局未捕获异常处理

当异常未被任何 try/catch 捕获时，Node.js 会触发 `uncaughtException` 事件：

```javascript
// 方式一：process.on('uncaughtException')
process.on('uncaughtException', (err, origin) => {
  console.error('未捕获的异常:', err);
  console.error('异常来源:', origin);

  // 记录日志、发送告警等
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });

  // 重要：捕获后应该优雅退出进程
  // 因为异常发生后，程序状态可能已经不一致
  // 不建议继续运行
  process.exit(1);
});

// 方式二：使用 domain 模块（已废弃，不推荐）
```

#### 全局未处理的 Promise 拒绝处理

当 Promise 被 reject 但没有 .catch() 或 try/catch 处理时，会触发 `unhandledRejection` 事件：

```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);

  // 记录日志
  logger.error('Unhandled Rejection', { reason, promise });

  // 根据业务决定是否退出进程
  // Node.js 默认行为（v15+）是终止进程
  // process.exit(1);
});
```

**重要提示**：从 Node.js v15 开始，未处理的 Promise 拒绝默认会导致进程退出（之前版本只是发出警告）。这是为了鼓励开发者显式处理所有 Promise 错误。

#### Express 中的错误处理

```javascript
const express = require('express');
const app = express();

// 同步错误：Express 自动捕获
app.get('/sync-error', (req, res) => {
  throw new Error('同步错误');  // Express 会自动传递给错误处理中间件
});

// 异步错误：需要手动传递
app.get('/async-error', async (req, res, next) => {
  try {
    await Promise.reject(new Error('异步错误'));
  } catch (err) {
    next(err);  // 必须手动调用 next(err)
  }
});

// 错误处理中间件（四个参数）
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.message);

  // 区分开发环境和生产环境
  if (app.get('env') === 'development') {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  } else {
    res.status(500).json({
      error: '服务器内部错误',
    });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});
```

#### Koa 中的错误处理

```javascript
const Koa = require('koa');
const app = new Koa();

// 全局错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;

    // 生产环境不暴露错误详情
    ctx.body = app.env === 'development'
      ? { error: err.message, stack: err.stack }
      : { error: '服务器内部错误' };

    // 触发应用级错误事件
    ctx.app.emit('error', err, ctx);
  }
});

// 应用级错误监听
app.on('error', (err, ctx) => {
  console.error('应用错误:', err.message);
  logger.error('Application Error', {
    error: err.message,
    stack: err.stack,
    url: ctx.url,
    method: ctx.method,
  });
});

// 路由中直接 throw
app.use(async (ctx) => {
  const user = await getUser(ctx.params.id);
  if (!user) {
    ctx.throw(404, '用户不存在');  // Koa 提供的便捷方法
  }
  ctx.body = user;
});
```

#### 优雅退出（Graceful Shutdown）

```javascript
const http = require('http');
const server = http.createServer(app);

// 优雅退出处理
function gracefulShutdown(signal) {
  console.log(`收到 ${signal} 信号，开始优雅退出...`);

  // 1. 停止接收新请求
  server.close(() => {
    console.log('HTTP 服务器已关闭');
  });

  // 2. 关闭数据库连接
  if (db) {
    db.close()
      .then(() => console.log('数据库连接已关闭'))
      .catch(err => console.error('关闭数据库失败:', err));
  }

  // 3. 设置超时强制退出
  setTimeout(() => {
    console.error('优雅退出超时，强制退出');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('未捕获异常:', err);
  gracefulShutdown('uncaughtException');
});
```

#### 自定义错误类

```javascript
// 自定义业务错误类
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;  // 标记为可预期的业务错误

    Error.captureStackTrace(this, this.constructor);
  }
}

// 具体错误类型
class ValidationError extends AppError {
  constructor(fields) {
    super('参数验证失败', 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}

class NotFoundError extends AppError {
  constructor(resource = '资源') {
    super(`${resource}不存在`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = '未授权') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// 使用
app.get('/users/:id', async (ctx) => {
  const user = await User.findById(ctx.params.id);
  if (!user) {
    throw new NotFoundError('用户');
  }
  ctx.body = user;
});

// 错误处理中间件中区分
app.use((err, req, res, next) => {
  if (err.isOperational) {
    // 可预期的业务错误，返回友好提示
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      fields: err.fields,
    });
  }
  // 不可预期的错误，记录日志并返回通用错误
  logger.error('Unexpected Error', err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: '服务器内部错误' });
});
```

**考点：** 错误处理、uncaughtException、unhandledRejection、Express/Koa 错误中间件、优雅退出、自定义错误类

---

---

### 题目7：什么是 Node.js 的 Cluster 模块？如何实现多进程？

**答案：**

Node.js 是单线程的，这意味着它无法直接利用多核 CPU 的优势。Cluster 模块是 Node.js 内置的多进程解决方案，允许创建一组共享同一端口的子进程（Worker），由主进程（Master）统一管理，从而实现负载均衡。

#### Cluster 基本用法

```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  // 主进程
  console.log(`主进程 ${process.pid} 正在运行`);

  // 根据 CPU 核心数创建 Worker
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // 监听 Worker 退出事件，自动重启
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} 已退出，正在重启...`);
    cluster.fork();  // 重新 fork 一个新的 Worker
  });

  // 监听 Worker 在线事件
  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} 已上线`);
  });
} else {
  // Worker 进程
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`请求由进程 ${process.pid} 处理\n`);
  }).listen(3000);

  console.log(`Worker ${process.pid} 已启动`);
}
```

#### Cluster 工作原理

Cluster 模块有两种工作模式：

1. **Round-Robin（轮询，默认）**：主进程监听端口，接收请求后按轮询方式分发给 Worker。这是 Node.js v0.12+ 的默认模式，由主进程负责负载均衡。

2. **共享句柄（Shared Handle）**：所有 Worker 同时监听同一端口，由操作系统负责分发请求（竞争模式）。

```javascript
// 设置调度策略
cluster.schedulingPolicy = cluster.SCHED_RR;       // 轮询（默认）
cluster.schedulingPolicy = cluster.SCHED_NONE;      // 由操作系统调度
```

#### 主进程与 Worker 通信

```javascript
if (cluster.isPrimary) {
  const worker = cluster.fork();

  // 主进程发送消息给 Worker
  worker.send({ type: 'config', data: { port: 3000, env: 'production' } });

  // 接收 Worker 的消息
  worker.on('message', (msg) => {
    if (msg.type === 'report') {
      console.log(`Worker 报告: 处理了 ${msg.count} 个请求`);
    }
  });
} else {
  // Worker 接收主进程消息
  process.on('message', (msg) => {
    if (msg.type === 'config') {
      console.log('收到配置:', msg.data);
    }
  });

  // Worker 发送消息给主进程
  let requestCount = 0;
  setInterval(() => {
    process.send({ type: 'report', count: requestCount });
  }, 5000);
}
```

#### 实际项目中的 Cluster 封装

```javascript
const cluster = require('cluster');
const os = require('os');

class ClusterManager {
  constructor(options = {}) {
    this.workers = [];
    this.workerCount = options.workers || os.cpus().length;
    this.maxRestarts = options.maxRestarts || 10;
    this.restartDelay = options.restartDelay || 1000;
    this.restartCount = 0;
  }

  start(createServer) {
    if (cluster.isPrimary) {
      console.log(`主进程 ${process.pid} 启动，将创建 ${this.workerCount} 个 Worker`);

      for (let i = 0; i < this.workerCount; i++) {
        this.createWorker();
      }

      cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} 已退出`);
        this.createWorker();
      });

      // 优雅退出
      process.on('SIGTERM', () => this.gracefulShutdown());
      process.on('SIGINT', () => this.gracefulShutdown());
    } else {
      createServer();
    }
  }

  createWorker() {
    if (this.restartCount >= this.maxRestarts) {
      console.error('超过最大重启次数，停止重启');
      process.exit(1);
    }

    const worker = cluster.fork();
    this.workers.push(worker);
    this.restartCount++;

    worker.on('message', (msg) => {
      if (msg.type === 'ready') {
        this.restartCount = 0;  // Worker 稳定运行后重置重启计数
      }
    });
  }

  async gracefulShutdown() {
    console.log('开始优雅退出...');

    // 通知所有 Worker 停止接收新请求
    for (const worker of this.workers) {
      worker.send({ type: 'shutdown' });
    }

    // 等待所有 Worker 退出
    const timeout = setTimeout(() => {
      console.error('优雅退出超时，强制退出');
      process.exit(1);
    }, 10000);

    cluster.on('exit', () => {
      if (this.workers.length === 0) {
        clearTimeout(timeout);
        console.log('所有 Worker 已退出');
        process.exit(0);
      }
    });
  }
}

// 使用
const manager = new ClusterManager({ workers: 4 });
manager.start(() => {
  const app = require('./app');
  app.listen(3000, () => {
    process.send({ type: 'ready' });
  });
});
```

#### Cluster 的局限性

Cluster 模块虽然简单易用，但存在一些局限性：

1. **进程间无法共享状态**：每个 Worker 有独立的内存空间，Session 等状态需要存储在 Redis 等外部存储中。
2. **进程间通信开销**：主进程和 Worker 之间通过 IPC 通信，序列化/反序列化有性能损耗。
3. **不够灵活**：无法动态调整 Worker 数量，无法实现更复杂的负载均衡策略。

因此，在生产环境中，通常使用 PM2 等进程管理工具来替代直接使用 Cluster 模块。

#### Sticky Session（会话粘滞）

在使用 Cluster 时，同一用户的请求可能被分配到不同的 Worker，如果使用内存中的 Session，会导致 Session 丢失。解决方案：

```javascript
// 方案一：使用 sticky-session（同一客户端始终路由到同一 Worker）
const sticky = require('sticky-session');
const server = require('./app');

if (!sticky.listen(server, 3000)) {
  server.once('listening', () => {
    console.log(`主进程 ${process.pid} 已启动`);
  });
} else {
  console.log(`Worker ${process.pid} 已启动`);
}

// 方案二：使用 Redis 存储 Session（推荐）
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'session-secret',
  resave: false,
  saveUninitialized: false,
}));
```

**考点：** Cluster 模块、多进程、主进程与 Worker 通信、负载均衡、进程管理、Sticky Session、进程间状态共享

---

---

### 题目8：Node.js 中 process.nextTick 和 setImmediate 的区别？

**答案：**

`process.nextTick` 和 `setImmediate` 都是 Node.js 中用于延迟执行回调的 API，但它们的执行时机、优先级和设计目的完全不同。

#### 核心区别

| 对比项 | process.nextTick | setImmediate |
|--------|------------------|--------------|
| 执行时机 | 当前操作完成后立即执行 | 事件循环的 check 阶段执行 |
| 优先级 | 高于所有微任务和宏任务 | 低于微任务，属于宏任务 |
| 所属阶段 | 不属于事件循环任何阶段 | 属于 check 阶段 |
| 递归风险 | 极高（会阻塞事件循环） | 较低（每个事件循环轮次执行一次） |
| 设计目的 | 允许用户在当前操作完成后立即处理错误 | 在 I/O 回调之后执行任务 |

#### process.nextTick

`process.nextTick` 将回调放在微任务队列中，在当前同步代码执行完毕后、事件循环进入下一个阶段之前立即执行。

```javascript
console.log('1. 同步代码');

process.nextTick(() => {
  console.log('2. nextTick 回调');
});

console.log('3. 同步代码');

// 输出：
// 1. 同步代码
// 3. 同步代码
// 2. nextTick 回调
```

`process.nextTick` 的回调会在当前操作完成后立即执行，即使当前处于事件循环的任何阶段：

```javascript
const fs = require('fs');

fs.readFile('./file.txt', () => {
  console.log('1. I/O 回调 (poll 阶段)');

  process.nextTick(() => {
    console.log('2. nextTick (poll 阶段结束后立即执行)');
  });

  Promise.resolve().then(() => {
    console.log('3. Promise 微任务');
  });
});

// 输出：
// 1. I/O 回调 (poll 阶段)
// 2. nextTick (poll 阶段结束后立即执行)
// 3. Promise 微任务
```

#### setImmediate

`setImmediate` 将回调放在 check 阶段的队列中，在 poll 阶段完成后执行。

```javascript
console.log('1. 同步代码');

setImmediate(() => {
  console.log('2. setImmediate 回调');
});

console.log('3. 同步代码');

// 输出：
// 1. 同步代码
// 3. 同步代码
// 2. setImmediate 回调
```

#### 执行顺序对比

```javascript
console.log('start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

setImmediate(() => {
  console.log('setImmediate');
});

process.nextTick(() => {
  console.log('nextTick');
});

Promise.resolve().then(() => {
  console.log('Promise');
});

console.log('end');

// 输出顺序（确定）：
// start
// end
// nextTick        ← 最高优先级
// Promise         ← 微任务
// setTimeout      ← timers 阶段（但顺序不确定）
// setImmediate    ← check 阶段（但顺序不确定）
```

注意：`setTimeout(..., 0)` 和 `setImmediate` 在主模块中的执行顺序是不确定的（取决于事件循环启动时的性能），但在 I/O 回调内部，`setImmediate` 总是先于 `setTimeout` 执行。

```javascript
// 主模块中（顺序不确定）
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
// 可能输出：timeout immediate 或 immediate timeout

// I/O 回调内部（setImmediate 一定先执行）
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
  // 一定输出：immediate timeout
});
```

#### nextTick 递归的危险性

```javascript
// 危险！nextTick 递归会阻塞事件循环
function recurse() {
  process.nextTick(recurse);
}
recurse();
// 事件循环永远无法进入下一个阶段，I/O 操作、定时器等全部被阻塞

// 安全！setImmediate 递归不会阻塞事件循环
function safeRecurse() {
  setImmediate(safeRecurse);
}
safeRecurse();
// 每个事件循环轮次只执行一次，其他阶段的回调仍有机会执行
```

#### 实际使用场景

**process.nextTick 的使用场景：**

```javascript
// 场景一：确保回调在当前操作完成后立即执行
function EventEmitter() {
  this.events = {};
}

EventEmitter.prototype.on = function(event, listener) {
  if (typeof this.events[event] !== 'object') {
    this.events[event] = [];
  }
  this.events[event].push(listener);
};

EventEmitter.prototype.emit = function(event, ...args) {
  const listeners = this.events[event] || [];
  // 使用 nextTick 确保所有 listener 在 emit 返回后执行
  // 这样即使 listener 中修改了 listeners 数组，也不会影响当前 emit
  listeners.forEach(listener => {
    process.nextTick(() => listener.apply(this, args));
  });
};

// 场景二：解耦 API，让用户有机会注册事件处理器
class MyStream extends require('stream') {
  constructor(options) {
    super(options);

    // 使用 nextTick，确保构造函数返回前用户有时间注册 'data' 事件
    process.nextTick(() => {
      this.push('hello');
      this.push('world');
      this.push(null);
    });
  }
}

const stream = new MyStream();
stream.on('data', (chunk) => {
  console.log(chunk.toString());
});
```

**setImmediate 的使用场景：**

```javascript
// 场景一：将长任务拆分，避免阻塞事件循环
function processLargeArray(array, handler) {
  let index = 0;

  function processChunk() {
    const start = Date.now();

    // 每次处理最多 5ms 的数据
    while (index < array.length && Date.now() - start < 5) {
      handler(array[index]);
      index++;
    }

    if (index < array.length) {
      // 还有数据没处理完，让出控制权给事件循环
      setImmediate(processChunk);
    }
  }

  processChunk();
}

// 使用
const largeArray = new Array(100000).fill(0).map((_, i) => i);
processLargeArray(largeArray, (item) => {
  // 处理每个元素
});

// 场景二：在 I/O 回调之后执行清理工作
fs.readFile('./data.json', (err, data) => {
  if (err) {
    // 使用 setImmediate 确保错误处理在当前 I/O 回调完成后执行
    setImmediate(() => {
      logger.error('文件读取失败', err);
      notifyAdmin(err);
    });
    return;
  }
  processData(JSON.parse(data));
});
```

**考点：** process.nextTick、setImmediate、微任务与宏任务、事件循环阶段、递归阻塞、任务调度

---

---

### 题目9：Node.js 中如何实现文件上传？

**答案：**

文件上传是 Web 开发中的常见需求。在 Node.js 中，可以通过多种方式实现文件上传，从原生的 HTTP 模块到成熟的第三方库。

#### 方式一：使用 Express + Multer（最常用）

Multer 是 Express 最流行的文件上传中间件，基于 `multipart/form-data` 解析。

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// 磁盘存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 原始扩展名
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  },
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型，仅允许 JPEG、PNG、GIF、WebP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 限制 5MB
  },
});

// 单文件上传
app.post('/upload', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择文件' });
  }

  res.json({
    message: '上传成功',
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
    },
  });
});

// 多文件上传
app.post('/upload/multiple', upload.array('photos', 10), (req, res) => {
  const files = req.files.map(file => ({
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
  }));

  res.json({ message: `${files.length} 个文件上传成功`, files });
});

// 多字段上传
const cpUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 8 },
]);

app.post('/upload/fields', cpUpload, (req, res) => {
  res.json({
    avatar: req.files['avatar'],
    gallery: req.files['gallery'],
  });
});

// 错误处理
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer 错误
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小超过限制（最大 5MB）' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: '文件数量超过限制' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.listen(3000);
```

#### 方式二：使用内存存储 + 云服务上传

```javascript
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// 内存存储（文件保存在 Buffer 中）
const upload = multer({ storage: multer.memoryStorage() });

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

app.post('/upload/s3', upload.single('file'), async (req, res) => {
  try {
    const { buffer, originalname, mimetype } = req.file;

    const command = new PutObjectCommand({
      Bucket: 'my-bucket',
      Key: `uploads/${Date.now()}-${originalname}`,
      Body: buffer,
      ContentType: mimetype,
    });

    await s3Client.send(command);

    res.json({ message: '上传到 S3 成功' });
  } catch (err) {
    res.status(500).json({ error: '上传失败', detail: err.message });
  }
});
```

#### 方式三：使用 formidable（底层库）

```javascript
const http = require('http');
const formidable = require('formidable');

const server = http.createServer((req, res) => {
  if (req.url === '/upload' && req.method === 'POST') {
    const form = formidable({
      multiples: true,
      maxFileSize: 5 * 1024 * 1024,
      uploadDir: './uploads',
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        fields,
        files: files.file,  // formidable v3 的文件格式
      }));
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file" />
        <button type="submit">上传</button>
      </form>
    `);
  }
});

server.listen(3000);
```

#### 方式四：使用 Stream 实现大文件上传（分片上传思路）

```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const UPLOAD_DIR = './uploads/chunks';
const MERGE_DIR = './uploads/merged';

// 分片上传
app.post('/upload/chunk', (req, res) => {
  const chunks = [];

  req.on('data', (chunk) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    const data = Buffer.concat(chunks);
    const { fileHash, chunkIndex, chunkTotal, fileName } = JSON.parse(
      req.headers['upload-info']
    );

    const chunkDir = path.join(UPLOAD_DIR, fileHash);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    // 保存分片
    fs.writeFileSync(
      path.join(chunkDir, `${chunkIndex}`),
      data
    );

    // 检查是否所有分片都已上传
    const uploadedChunks = fs.readdirSync(chunkDir).length;
    if (uploadedChunks === chunkTotal) {
      // 合并分片
      mergeChunks(fileHash, fileName, chunkTotal);
      res.json({ message: '文件合并完成', status: 'merged' });
    } else {
      res.json({
        message: `分片 ${chunkIndex + 1}/${chunkTotal} 上传成功`,
        status: 'partial',
        uploaded: uploadedChunks,
        total: chunkTotal,
      });
    }
  });
});

function mergeChunks(fileHash, fileName, chunkTotal) {
  const chunkDir = path.join(UPLOAD_DIR, fileHash);
  const filePath = path.join(MERGE_DIR, `${Date.now()}-${fileName}`);

  const writeStream = fs.createWriteStream(filePath);

  for (let i = 0; i < chunkTotal; i++) {
    const chunkPath = path.join(chunkDir, `${i}`);
    const chunkBuffer = fs.readFileSync(chunkPath);
    writeStream.write(chunkBuffer);
  }

  writeStream.end();

  // 清理分片文件
  fs.rmSync(chunkDir, { recursive: true });

  console.log(`文件合并完成: ${filePath}`);
}
```

#### 前端上传示例

```html
<form id="uploadForm">
  <input type="file" id="fileInput" name="file" accept="image/*" />
  <input type="text" name="username" placeholder="用户名" />
  <button type="submit">上传</button>
  <div id="progress">进度: 0%</div>
</form>

<script>
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  const fileInput = document.getElementById('fileInput');
  formData.append('file', fileInput.files[0]);
  formData.append('username', document.querySelector('[name="username"]').value);

  const xhr = new XMLHttpRequest();

  // 上传进度
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      document.getElementById('progress').textContent = `进度: ${percent}%`;
    }
  });

  xhr.addEventListener('load', () => {
    const result = JSON.parse(xhr.responseText);
    console.log(result);
  });

  xhr.addEventListener('error', () => {
    console.error('上传失败');
  });

  xhr.open('POST', '/upload');
  xhr.send(formData);
});
</script>
```

**考点：** 文件上传、Multer 中间件、multipart/form-data、文件存储策略、分片上传、上传进度、文件类型校验

---

---

### 题目10：什么是中间件（Middleware）？Express 中间件的执行原理？

**答案：**

中间件（Middleware）是 Web 框架中的一种核心设计模式。它是一个函数，位于客户端请求和服务器响应之间，可以访问请求对象（`req`）、响应对象（`res`）和下一个中间件函数（`next`）。中间件可以执行任何代码、修改请求/响应对象、结束响应循环，或者调用 `next()` 将控制权传递给下一个中间件。

#### Express 中间件的基本结构

```javascript
// 中间件函数签名
function middleware(req, res, next) {
  // req: 请求对象
  // res: 响应对象
  // next: 下一个中间件函数

  // 1. 执行一些操作（如日志记录、身份验证）
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // 2. 调用 next() 传递给下一个中间件
  next();

  // 3. 或直接结束响应（不再调用 next）
  // res.status(403).json({ error: '禁止访问' });
}
```

#### 中间件的分类

```javascript
const express = require('express');
const app = express();

// 1. 应用级中间件（app.use）
app.use((req, res, next) => {
  console.log('每个请求都会经过这里');
  next();
});

// 2. 路由级中间件（挂载到特定路由）
app.use('/api', (req, res, next) => {
  console.log('只有 /api 开头的请求会经过这里');
  next();
});

// 3. 内置中间件
app.use(express.json());        // 解析 JSON 请求体
app.use(express.urlencoded());   // 解析 URL 编码的请求体
app.use(express.static('public')); // 静态文件服务

// 4. 错误处理中间件（四个参数）
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器错误' });
});

// 5. 第三方中间件
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

app.use(helmet());    // 安全头
app.use(cors());      // 跨域
app.use(morgan('dev')); // 日志
```

#### 中间件的执行原理

Express 内部维护一个中间件栈（数组），当请求到来时，依次执行栈中的中间件。

```javascript
// 简化版 Express 中间件实现
class MiniExpress {
  constructor() {
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;  // 支持链式调用
  }

  handle(req, res) {
    let index = 0;

    const next = (err) => {
      if (err) {
        // 如果有错误，跳转到错误处理中间件
        // 简化处理：直接返回 500
        res.status(500).end(err.message);
        return;
      }

      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        middleware(req, res, next);
      }
    };

    next();
  }
}

// 使用
const app = new MiniExpress();

app.use((req, res, next) => {
  console.log('1. 第一个中间件');
  next();
  console.log('4. 第一个中间件（next 之后）');
});

app.use((req, res, next) => {
  console.log('2. 第二个中间件');
  next();
  console.log('3. 第二个中间件（next 之后）');
});

app.use((req, res, next) => {
  console.log('5. 路由处理');
  res.end('Hello');
});

// 模拟请求
app.handle({}, { end: (data) => console.log('响应:', data) });

// 输出：
// 1. 第一个中间件
// 2. 第二个中间件
// 5. 路由处理
// 响应: Hello
// 3. 第二个中间件（next 之后）
// 4. 第一个中间件（next 之后）
```

#### 实际中间件示例

```javascript
// 日志中间件
function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
}

// 认证中间件
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  try {
    const decoded = verifyToken(token);  // JWT 验证
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: '令牌无效或已过期' });
  }
}

// 权限中间件（可配置）
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
}

// 请求频率限制中间件
function rateLimit(windowMs, maxRequests) {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const record = requests.get(ip) || { count: 0, startTime: now };

    // 重置窗口
    if (now - record.startTime > windowMs) {
      record.count = 0;
      record.startTime = now;
    }

    record.count++;

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: '请求过于频繁',
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    requests.set(ip, record);
    next();
  };
}

// 使用
app.use(logger);
app.use(rateLimit(60 * 1000, 100));  // 每分钟最多 100 次请求

app.get('/admin', auth, authorize('admin'), (req, res) => {
  res.json({ message: '管理员页面' });
});
```

#### 路由中间件

```javascript
const express = require('express');
const router = express.Router();

// 路由级别的中间件
router.use(auth);  // 该路由下的所有接口都需要认证

router.get('/profile', (req, res) => {
  res.json(req.user);
});

router.get('/settings', (req, res) => {
  res.json({ settings: {} });
});

app.use('/api/user', router);
```

#### 中间件的注意事项

```javascript
// 1. 不要忘记调用 next()
// 错误示例：请求会挂起
app.use((req, res, next) => {
  console.log('日志');
  // 忘记调用 next()，请求永远不会到达路由处理函数
});

// 2. next() 只能调用一次
// 错误示例
app.use((req, res, next) => {
  next();
  next();  // 错误！会导致 headers 已发送的错误
});

// 3. 错误处理中间件必须放在最后
// 正确顺序
app.use(logger);
app.use(auth);
app.get('/api/data', handler);
app.use(notFoundHandler);  // 404
app.use(errorHandler);     // 500（必须最后）

// 4. 中间件的顺序很重要
app.use(express.json());   // 必须在路由之前，否则 req.body 为 undefined
app.use('/api', apiRouter);
```

**考点：** 中间件原理、Express 中间件栈、next() 机制、应用级/路由级中间件、错误处理中间件、中间件组合

---

---

### 题目11：Node.js 的垃圾回收机制是什么？V8 引擎的内存管理？

**答案：**

Node.js 运行在 V8 JavaScript 引擎上，V8 的垃圾回收（Garbage Collection, GC）机制直接决定了 Node.js 应用的内存使用效率和性能表现。

#### V8 内存结构

V8 将内存分为堆内存（Heap）和栈内存（Stack）：

```
V8 内存布局
├── 栈内存 (Stack)
│   ├── 基本类型（number, boolean, string, null, undefined）
│   ├── 函数调用帧
│   └── 指针引用
│
└── 堆内存 (Heap)
    ├── 新生代 (Young Generation / Semi Space)
    │   ├── From Space（正在使用的空间）
    │   └── To Space（空闲空间）
    │
    └── 老生代 (Old Generation)
        ├── Old Pointer Space（指针类型的旧对象）
        └── Old Data Space（数据类型的旧对象）
```

#### 新生代垃圾回收（Scavenge 算法）

新生代使用 Scavenge（半空间复制）算法，分为两个等大的空间：From Space 和 To Space。

**工作流程：**
1. 新对象分配在 From Space
2. 当 From Space 快满时，触发 Scavenge GC
3. 检查 From Space 中的存活对象，复制到 To Space
4. 清空 From Space
5. From Space 和 To Space 角色互换

```javascript
// 大部分临时变量会在新生代被快速回收
function processData() {
  const tempData = { name: 'temp', value: 42 }; // 分配在新生代
  // 函数执行完毕后，tempData 变为不可达
  // 下次 Scavenge GC 时被回收
}
```

**对象晋升条件（从新生代晋升到老生代）：**
1. 对象已经经历过一次 Scavenge GC 仍然存活
2. To Space 的使用率超过 25%（避免复制时内存不足）

#### 老生代垃圾回收（Mark-Sweep + Mark-Compact）

老生代使用 Mark-Sweep（标记清除）和 Mark-Compact（标记整理）算法。

**Mark-Sweep（标记清除）：**
1. 从根对象（全局变量、栈上的引用）出发，标记所有可达对象
2. 清除所有未标记的对象

**Mark-Compact（标记整理）：**
1. 标记所有可达对象
2. 将存活对象向内存一端移动
3. 清除边界以外的内存

```javascript
// 长期存活的对象会被晋升到老生代
const globalCache = new Map(); // 长期存在，会晋升到老生代

function addToCache(key, value) {
  globalCache.set(key, value);
  // globalCache 和其中的值会长期存活在老生代
}
```

#### 增量标记（Incremental Marking）

为了减少 GC 的停顿时间（Stop-The-World），V8 引入了增量标记。GC 过程被拆分为多个小步骤，与应用代码交替执行。

```
正常执行 → 标记一小段 → 正常执行 → 标记一小段 → ... → 清除
```

#### 并行回收与并发回收

- **并行回收（Parallel）**：多个辅助线程同时执行 GC，主线程暂停
- **并发回收（Concurrent）**：GC 线程和主线程同时运行，减少停顿时间

#### Node.js 内存限制与查看

```javascript
// 查看内存使用情况
console.log(process.memoryUsage());
// {
//   rss: 49356800,        // 常驻内存（进程占用的物理内存）
//   heapTotal: 10485760,  // V8 堆总大小
//   heapUsed: 6123456,    // V8 堆已使用大小
//   external: 123456,     // V8 管理的外部内存（如 Buffer）
//   arrayBuffers: 98765,  // ArrayBuffer 和 SharedArrayBuffer 占用的内存
// }

// V8 默认堆内存限制（64 位系统）
// 新生代：约 16-32MB
// 老生代：约 1.4GB
// 总堆内存：约 1.5-1.7GB

// 通过启动参数调整内存限制
// node --max-old-space-size=4096 app.js  // 老生代最大 4GB
// node --max-new-space-size=64 app.js    // 新生代最大 64MB
```

#### 内存泄漏的常见原因与排查

```javascript
// 1. 全局变量（忘记声明局部变量）
function leak1() {
  // bar 没有用 let/const/var 声明，变成全局变量，永远不会被回收
  bar = '这是一个全局变量';
}

// 2. 闭包引用
function leak2() {
  const largeData = new Array(1000000).fill('leak');

  return function() {
    // 闭包引用了 largeData，即使不使用也不会被回收
    console.log('closure');
  };
}

// 3. 未清除的定时器
function leak3() {
  const cache = new Set();
  setInterval(() => {
    cache.add(Date.now());
    // cache 不断增长，永远不会被回收
  }, 1000);
}

// 4. 未清除的事件监听器
const emitter = new (require('events').EventEmitter)();
function leak4() {
  const handler = () => {};
  emitter.on('data', handler);
  // handler 一直被引用，emitter 和 handler 都不会被回收
  // 解决：emitter.removeListener('data', handler)
}

// 5. 无限增长的 Map/Set/Array
const cache = new Map();
function leak5(key, value) {
  cache.set(key, value);
  // 没有清理机制，cache 会无限增长
  // 解决：使用 LRU Cache 或定期清理
}

// 6. console.log 大对象
// console.log 会引用对象，阻止 GC 回收
// 生产环境应移除或使用 debug 库
```

#### 内存泄漏排查工具

```javascript
// 方式一：使用 heapdump 生成堆快照
const heapdump = require('heapdump');

// 手动生成快照
app.get('/heapdump', (req, res) => {
  const fileName = `/tmp/heapdump-${Date.now()}.heapsnapshot`;
  heapdump.writeSnapshot(fileName, (err, filename) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: '快照已生成', filename });
    }
  });
});

// 方式二：使用 Chrome DevTools 分析
// 1. 启动应用：node --inspect app.js
// 2. 打开 Chrome：chrome://inspect
// 3. 点击 "inspect" 连接到 Node.js 进程
// 4. 在 Memory 面板中生成和分析堆快照

// 方式三：使用 v8 模块获取 GC 统计
const v8 = require('v8');

// 获取堆空间统计
const heapStats = v8.getHeapStatistics();
console.log('堆总大小:', heapStats.total_heap_size);
console.log('堆已使用:', heapStats.used_heap_size);

// 设置 GC 回调
v8.setFlagsFromString('--expose-gc');
```

#### 性能优化建议

```javascript
// 1. 使用 Buffer 代替字符串处理二进制数据
// Buffer 在堆外分配内存，不占用 V8 堆

// 2. 使用 Stream 处理大文件，避免一次性加载到内存
const fs = require('fs');
fs.createReadStream('./large-file.txt').pipe(fs.createWriteStream('./output.txt'));

// 3. 使用对象池复用对象
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  acquire() {
    return this.pool.pop() || this.createFn();
  }

  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// 4. 使用 WeakMap/WeakSet 避免阻止 GC
const cache = new WeakMap();  // 键是弱引用，不会阻止 GC
let obj = { data: 'large data' };
cache.set(obj, 'metadata');
obj = null;  // obj 可以被 GC 回收，WeakMap 中的条目自动移除

// 5. 及时清理引用
function processRequest(req, res) {
  const data = loadLargeData();
  // 处理完毕后
  res.json(data);
  // data 在函数结束后可以被回收
}
```

**考点：** V8 垃圾回收、新生代/老生代、Scavenge/Mark-Sweep/Mark-Compact、内存泄漏排查、内存限制、性能优化

---

---

### 题目12：Node.js 中如何实现认证和授权？（JWT、Session）

**答案：**

认证（Authentication）是验证用户身份的过程（"你是谁"），授权（Authorization）是验证用户权限的过程（"你能做什么"）。Node.js 中最常用的两种方案是基于 Session 的认证和基于 JWT（JSON Web Token）的认证。

#### 方案一：基于 Session 的认证

Session 认证的工作流程：用户登录 -> 服务器创建 Session 并存储 -> 返回 Session ID（通过 Cookie）-> 后续请求携带 Cookie -> 服务器通过 Session ID 查找 Session。

```javascript
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Redis 客户端
const redisClient = createClient({
  url: 'redis://localhost:6379',
});
redisClient.connect().catch(console.error);

// Session 配置
app.use(session({
  name: 'sessionId',
  secret: crypto.randomBytes(32).toString('hex'),  // 签名密钥
  resave: false,
  saveUninitialized: false,  // 未登录不创建 Session
  store: new RedisStore({ client: redisClient }),
  cookie: {
    httpOnly: true,     // 防止 XSS 攻击
    secure: false,      // 生产环境应设为 true（HTTPS）
    sameSite: 'lax',    // CSRF 防护
    maxAge: 24 * 60 * 60 * 1000,  // 24 小时
  },
}));

// 用户模型（模拟）
const users = new Map();

// 注册
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    if (users.has(username)) {
      return res.status(409).json({ error: '用户名已存在' });
    }

    // 密码哈希（bcrypt 自动加盐）
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    users.set(username, {
      id: crypto.randomUUID(),
      username,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
    });

    res.status(201).json({ message: '注册成功' });
  } catch (err) {
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.get(username);

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 创建 Session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.json({ message: '登录成功', user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: '登录失败' });
  }
});

// 登出
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: '登出失败' });
    }
    res.clearCookie('sessionId');
    res.json({ message: '登出成功' });
  });
});

// 需要认证的路由
app.get('/profile', requireAuth, (req, res) => {
  res.json({
    userId: req.session.userId,
    username: req.session.username,
  });
});

// 认证中间件
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: '请先登录' });
  }
  next();
}

app.listen(3000);
```

#### 方案二：基于 JWT 的认证

JWT 认证的工作流程：用户登录 -> 服务器生成 JWT 并返回 -> 客户端存储 JWT（通常在 localStorage 或 Cookie 中）-> 后续请求在 Authorization 头中携带 JWT -> 服务器验证 JWT。

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// 模拟数据库
const users = new Map();
const refreshTokens = new Set();  // 生产环境应使用 Redis

// 注册（同 Session 方案）
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  users.set(username, {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
    role: 'user',
  });

  res.status(201).json({ message: '注册成功' });
});

// 登录
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.get(username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  // 生成 Access Token
  const accessToken = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // 生成 Refresh Token
  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  refreshTokens.add(refreshToken);

  res.json({
    accessToken,
    refreshToken,
    expiresIn: 24 * 60 * 60,
  });
});

// 刷新 Token
app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Refresh Token 无效' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = [...users.values()].find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ accessToken: newAccessToken, expiresIn: 24 * 60 * 60 });
  } catch (err) {
    return res.status(401).json({ error: 'Refresh Token 已过期' });
  }
});

// 登出
app.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens.delete(refreshToken);
  res.json({ message: '登出成功' });
});

// JWT 认证中间件
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  // 将用户信息挂载到 req 上
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '令牌已过期', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: '令牌无效' });
  }
}

// 授权中间件
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
}

// 使用
app.get('/profile', authenticate, (req, res) => {
  res.json({ userId: req.user.userId, username: req.user.username });
});

app.get('/admin', authenticate, authorize('admin'), (req, res) => {
  res.json({ message: '管理员页面' });
});

app.listen(3000);
```

#### Session vs JWT 对比

| 对比项 | Session | JWT |
|--------|---------|-----|
| 存储位置 | 服务器端（内存/Redis/数据库） | 客户端（localStorage/Cookie） |
| 扩展性 | 需要共享存储（如 Redis） | 无状态，天然支持分布式 |
| 安全性 | Session ID 存在 Cookie 中，相对安全 | Token 泄露风险较高 |
| 性能 | 每次请求需查询 Session 存储 | 无需查询，直接验证签名 |
| 注销 | 服务端销毁 Session 即可 | 难以立即失效（需黑名单机制） |
| 适用场景 | 传统 Web 应用 | RESTful API、微服务、移动端 |

#### 前端使用示例

```javascript
// JWT 前端拦截器（Axios）
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// 请求拦截器：自动添加 Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：自动刷新 Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/refresh', { refreshToken });

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**考点：** Session 认证、JWT 认证、bcrypt 密码哈希、Token 刷新机制、认证中间件、授权中间件、Session vs JWT 对比

---

---

### 题目13：Node.js 中如何连接和操作数据库？（以 MongoDB/MySQL 为例）

**答案：**

Node.js 生态中有丰富的数据库驱动和 ORM/ODM 库，下面分别以 MongoDB 和 MySQL 为例，介绍数据库的连接和操作。

#### MongoDB 操作（使用 Mongoose）

Mongoose 是 MongoDB 最流行的 ODM（Object Document Mapping）库，提供了 Schema 定义、数据验证、中间件等功能。

```javascript
// 安装：npm install mongoose

const mongoose = require('mongoose');

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/myapp', {
      // Mongoose v6+ 默认配置已优化，无需手动设置以下选项
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log('MongoDB 连接成功');
  } catch (err) {
    console.error('MongoDB 连接失败:', err.message);
    process.exit(1);
  }
}

// 定义 Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少 3 个字符'],
    maxlength: [20, '用户名最多 20 个字符'],
  },
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, '邮箱格式不正确'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,  // 默认查询不返回密码
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  avatar: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
}, {
  timestamps: true,  // 自动管理 createdAt 和 updatedAt
});

// Schema 中间件（钩子）
userSchema.pre('save', async function(next) {
  // 只在密码被修改时才重新哈希
  if (!this.isModified('password')) return next();

  const bcrypt = require('bcrypt');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.post('save', function(doc, next) {
  console.log(`用户 ${doc.username} 已保存`);
  next();
});

// 实例方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcrypt');
  return bcrypt.compare(candidatePassword, this.password);
};

// 静态方法
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

// 创建 Model
const User = mongoose.model('User', userSchema);

// CRUD 操作
async function crudExample() {
  // Create - 创建
  const user = await User.create({
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    password: '123456',
  });
  console.log('创建用户:', user._id);

  // Read - 查询
  // 查询单个
  const foundUser = await User.findById(user._id).select('+password');
  // 条件查询
  const admins = await User.find({ role: 'admin' });
  // 分页查询
  const page = 1, pageSize = 10;
  const paginatedUsers = await User.find()
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 })
    .select('-password');

  // Update - 更新
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { username: 'lisi', avatar: 'avatar.jpg' },
    { new: true, runValidators: true }  // 返回更新后的文档，运行验证
  );

  // Delete - 删除
  await User.findByIdAndDelete(user._id);
}

// 聚合查询
async function aggregationExample() {
  const stats = await User.aggregate([
    { $match: { role: 'user' } },
    { $group: {
      _id: '$role',
      count: { $sum: 1 },
      avgCreatedAt: { $avg: '$createdAt' },
    }},
    { $sort: { count: -1 } },
  ]);
}

// 事务（需要副本集）
async function transactionExample() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create([{ username: 'test', email: 'test@test.com', password: '123456' }], { session });

    await Account.create([{ userId: user[0]._id, balance: 0 }], { session });

    await session.commitTransaction();
    console.log('事务提交成功');
  } catch (err) {
    await session.abortTransaction();
    console.error('事务回滚:', err);
  } finally {
    session.endSession();
  }
}

connectDB();
```

#### MySQL 操作（使用 Sequelize）

Sequelize 是 MySQL/PostgreSQL/SQLite 最流行的 ORM 库，支持 Promise API 和事务。

```javascript
// 安装：npm install sequelize mysql2

const { Sequelize, DataTypes, Op } = require('sequelize');

// 创建连接
const sequelize = new Sequelize('myapp', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,  // 关闭 SQL 日志（生产环境）
  pool: {
    max: 10,        // 最大连接数
    min: 2,         // 最小连接数
    acquire: 30000, // 获取连接超时时间
    idle: 10000,    // 连接空闲超时时间
  },
  define: {
    timestamps: true,    // 自动添加 createdAt 和 updatedAt
    underscored: true,   // 字段名使用下划线命名
  },
});

// 测试连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('MySQL 连接成功');
  } catch (err) {
    console.error('MySQL 连接失败:', err.message);
  }
}

// 定义模型
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '1: 正常, 0: 禁用',
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      const bcrypt = require('bcrypt');
      user.password = await bcrypt.hash(user.password, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const bcrypt = require('bcrypt');
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

// 定义关联关系
const Post = sequelize.define('Post', {
  title: { type: DataTypes.STRING(200), allowNull: false },
  content: { type: DataTypes.TEXT },
  userId: { type: DataTypes.INTEGER, allowNull: false },
});

const Comment = sequelize.define('Comment', {
  content: { type: DataTypes.TEXT, allowNull: false },
  postId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
});

// 一对多：用户 -> 文章
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// 一对多：文章 -> 评论
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// 多对一：评论 -> 用户
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// CRUD 操作
async function crudExample() {
  // Create
  const user = await User.create({
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    password: '123456',
  });

  // 批量创建
  await User.bulkCreate([
    { username: 'user1', email: 'user1@test.com', password: '123456' },
    { username: 'user2', email: 'user2@test.com', password: '123456' },
  ]);

  // Read
  // 查询所有
  const allUsers = await User.findAll();

  // 条件查询
  const activeUsers = await User.findAll({
    where: {
      role: 'user',
      status: 1,
    },
    attributes: ['id', 'username', 'email'],  // 选择字段
    order: [['createdAt', 'DESC']],
    limit: 10,
    offset: 0,
  });

  // 复杂条件查询
  const results = await User.findAll({
    where: {
      [Op.or]: [
        { username: { [Op.like]: '%zhang%' } },
        { email: { [Op.like]: '%zhang%' } },
      ],
      createdAt: {
        [Op.gte]: new Date('2024-01-01'),
        [Op.lte]: new Date(),
      },
    },
  });

  // 包含关联查询
  const userWithPosts = await User.findByPk(user.id, {
    include: [{
      model: Post,
      as: 'posts',
      where: { status: 1 },
      include: [{
        model: Comment,
        as: 'comments',
      }],
    }],
  });

  // Update
  await User.update(
    { username: 'lisi', status: 0 },
    { where: { id: user.id } }
  );

  // Delete
  await User.destroy({ where: { id: user.id } });

  // 软删除（需要 paranoid: true）
  // await User.destroy({ where: { id: 1 }, force: false });
  // await User.restore({ where: { id: 1 } });
}

// 事务
async function transactionExample() {
  const t = await sequelize.transaction();

  try {
    const user = await User.create({
      username: 'test',
      email: 'test@test.com',
      password: '123456',
    }, { transaction: t });

    await Post.create({
      title: '第一篇文章',
      content: 'Hello World',
      userId: user.id,
    }, { transaction: t });

    await t.commit();
    console.log('事务提交成功');
  } catch (err) {
    await t.rollback();
    console.error('事务回滚:', err);
  }
}

// 同步模型到数据库（生产环境应使用 Migration）
// await sequelize.sync({ force: true });  // 强制同步（会删除已有表）
// await sequelize.sync({ alter: true });   // 修改表结构

testConnection();
```

#### 数据库连接池管理

```javascript
// 连接池配置建议
const sequelize = new Sequelize(database, username, password, {
  pool: {
    max: 20,           // 最大连接数（根据并发量调整）
    min: 5,            // 最小保持连接数
    acquire: 60000,    // 获取连接超时（60秒）
    idle: 10000,       // 空闲连接超时（10秒）
  },
});

// 优雅关闭连接
async function gracefulShutdown() {
  try {
    await sequelize.close();
    console.log('数据库连接已关闭');
  } catch (err) {
    console.error('关闭数据库连接失败:', err);
  }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

**考点：** MongoDB/Mongoose、MySQL/Sequelize、ORM/ODM、Schema 定义、CRUD 操作、关联关系、事务、连接池、数据验证

---

---

### 题目14：什么是 PM2？PM2 的常用命令和功能？

**答案：**

PM2 是 Node.js 生产环境中最常用的进程管理工具。它提供了进程守护、负载均衡、日志管理、监控、零停机重启等功能，是部署 Node.js 应用的必备工具。

#### 安装与基本使用

```bash
# 全局安装
npm install -g pm2

# 启动应用
pm2 start app.js                    # 启动应用
pm2 start app.js --name "my-api"    # 指定应用名称
pm2 start app.js -i max             # 以集群模式启动（根据 CPU 核心数）
pm2 start app.js -i 4               # 启动 4 个 Worker 进程
pm2 start app.js --watch            # 监听文件变化自动重启

# 使用配置文件启动
pm2 start ecosystem.config.js

# 使用不同包管理器
pm2 start npm --name "my-app" -- start
pm2 start yarn --name "my-app" -- start
```

#### ecosystem.config.js 配置文件

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'my-api',
      script: './src/app.js',
      instances: 'max',          // 或指定数字
      exec_mode: 'cluster',      // 集群模式
      watch: false,              // 生产环境不建议开启
      max_memory_restart: '500M', // 内存超过 500MB 自动重启
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 8081,
      },
      // 日志配置
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      // 重启策略
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      // 优雅退出
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Cron 重启
      cron_restart: '0 4 * * *',  // 每天凌晨 4 点重启
    },
    {
      name: 'my-worker',
      script: './src/worker.js',
      instances: 1,
      exec_mode: 'fork',          // 非 HTTP 服务使用 fork 模式
    },
  ],

  // 部署配置
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your/repo.git',
      path: '/var/www/my-app',
      'pre-deploy-local': '',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
```

#### 常用管理命令

```bash
# 进程管理
pm2 list                           # 查看所有进程
pm2 show my-api                    # 查看进程详情
pm2 stop my-api                    # 停止进程
pm2 restart my-api                 # 重启进程
pm2 reload my-api                  # 零停机重启（集群模式）
pm2 delete my-api                  # 删除进程
pm2 stop all                       # 停止所有进程
pm2 restart all                    # 重启所有进程

# 日志管理
pm2 logs                           # 查看所有日志
pm2 logs my-api                    # 查看指定应用日志
pm2 logs --err                     # 只看错误日志
pm2 logs --lines 100               # 查看最近 100 行
pm2 flush                          # 清空所有日志

# 监控
pm2 monit                          # 实时监控面板（CPU、内存）
pm2 status                         # 进程状态列表

# 启动与守护
pm2 startup                        # 设置开机自启
pm2 save                           # 保存当前进程列表
pm2 resurrect                      # 恢复已保存的进程

# 环境切换
pm2 start ecosystem.config.js --env production    # 生产环境
pm2 start ecosystem.config.js --env staging       # 预发布环境

# 远程操作
pm2 ping                           # 检查 PM2 守护进程状态
```

#### PM2 核心功能详解

**1. 进程守护（Daemon）**

PM2 在后台运行一个守护进程，当 Node.js 应用崩溃时，PM2 会自动重启应用。

```javascript
// 模拟崩溃
app.get('/crash', (req, res) => {
  process.nextTick(() => {
    throw new Error('应用崩溃了！');
  });
});

// PM2 会自动重启应用，无需人工干预
// 可通过 pm2 logs 查看崩溃日志
```

**2. 集群模式（Cluster Mode）**

```bash
# 启动集群模式（自动利用所有 CPU 核心）
pm2 start app.js -i max

# 查看集群状态
pm2 list
# 输出示例：
# ┌─────┬──────────────┬─────────┬─────────┐
# │ id  │ name         │ mode    │ status  │
# ├─────┼──────────────┼─────────┼─────────┤
# │ 0   │ my-api       │ cluster │ online  │
# │ 1   │ my-api       │ cluster │ online  │
# │ 2   │ my-api       │ cluster │ online  │
# │ 3   │ my-api       │ cluster │ online  │
# └─────┴──────────────┴─────────┴─────────┘
```

**3. 零停机重启（Graceful Reload）**

```javascript
// 在应用中处理 PM2 的关闭信号
const server = app.listen(3000);

// PM2 发送 SIGINT 信号时，先关闭 HTTP 服务器
// 等待所有请求处理完毕后再退出
process.on('SIGINT', async () => {
  console.log('收到关闭信号，开始优雅退出...');

  // 停止接收新请求
  server.close(() => {
    console.log('HTTP 服务器已关闭');
  });

  // 关闭数据库连接
  await sequelize.close();

  // 设置超时强制退出
  setTimeout(() => {
    console.error('优雅退出超时，强制退出');
    process.exit(1);
  }, 10000);
});
```

```bash
# 使用 reload 而不是 restart
pm2 reload my-api  # 零停机重启
pm2 restart my-api # 会先停后启，有短暂停机
```

**4. 日志管理**

```bash
# PM2 日志模块
pm2 install pm2-logrotate  # 安装日志轮转模块

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M        # 单个日志文件最大 10MB
pm2 set pm2-logrotate:retain 30           # 保留最近 30 个日志文件
pm2 set pm2-logrotate:compress true       # 压缩旧日志
```

**5. Keymetrics 监控（PM2 Plus）**

```bash
# 连接 PM2 Plus（在线监控面板）
pm2 link <secret_key> <public_key>
```

#### PM2 编程式 API

```javascript
// 在代码中使用 PM2 API
const pm2 = require('pm2');

pm2.connect((err) => {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  // 启动应用
  pm2.start({
    script: 'app.js',
    name: 'my-api',
    instances: 'max',
    exec_mode: 'cluster',
  }, (err, apps) => {
    if (err) throw err;
    console.log('应用已启动:', apps);

    // 获取进程列表
    pm2.list((err, list) => {
      console.log('进程列表:', list);

      // 断开连接
      pm2.disconnect();
    });
  });

  // 监听事件
  pm2.launchBus((err, bus) => {
    bus.on('log:out', (data) => {
      console.log('[PM2 Log]', data.data);
    });

    bus.on('process:exception', (data) => {
      console.error('[PM2 Exception]', data.data);
    });
  });
});
```

**考点：** PM2 进程管理、集群模式、零停机重启、进程守护、日志管理、配置文件、优雅退出、PM2 API

---

---

### 题目15：Node.js 中如何处理并发？什么是 worker_threads？

**答案：**

Node.js 是单线程的，通过事件循环实现异步非阻塞 I/O。但 CPU 密集型任务会阻塞事件循环，导致整个应用卡顿。Node.js 提供了多种方案来处理并发和 CPU 密集型任务。

#### Node.js 并发模型

```
Node.js 单线程模型：
┌────────────────────────────────────────────┐
│           单线程（主线程 / Event Loop）       │
│                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ 请求 A   │  │ 请求 B   │  │ 请求 C   │ │
│  │ (I/O)    │  │ (I/O)    │  │ (CPU)    │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│       ↓             ↓             ↓        │
│    异步等待       异步等待      阻塞！      │
│    (不阻塞)      (不阻塞)    (阻塞所有请求) │
└────────────────────────────────────────────┘
```

#### 方案一：worker_threads（Worker 线程）

`worker_threads` 是 Node.js v10.5+ 引入的模块，允许创建真正的操作系统线程。每个 Worker 线程有独立的 V8 实例和事件循环。

```javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // 主线程
  console.log(`主线程 PID: ${process.pid}`);

  // 创建 Worker 线程
  const worker = new Worker(__filename, {
    workerData: { start: 1, end: 10000000 },
  });

  // 接收 Worker 的结果
  worker.on('message', (result) => {
    console.log(`计算结果: ${result}`);
  });

  // 接收 Worker 的错误
  worker.on('error', (err) => {
    console.error('Worker 错误:', err);
  });

  // Worker 退出
  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker 异常退出，退出码: ${code}`);
    }
  });
} else {
  // Worker 线程
  console.log(`Worker 线程 PID: ${process.pid}`);

  // CPU 密集型计算
  const { start, end } = workerData;
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += i;
  }

  // 将结果发送回主线程
  parentPort.postMessage(sum);
}
```

#### Worker 线程池

```javascript
// worker-pool.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');

// Worker 脚本（可以内联）
const workerScript = `
  const { parentPort, workerData } = require('worker_threads');

  parentPort.on('message', async (task) => {
    try {
      const result = await processTask(task);
      parentPort.postMessage({ id: task.id, result });
    } catch (err) {
      parentPort.postMessage({ id: task.id, error: err.message });
    }
  });

  async function processTask(task) {
    // 模拟 CPU 密集型任务
    if (task.type === 'fibonacci') {
      return fibonacci(task.n);
    }
    if (task.type === 'image-process') {
      return processImage(task.data);
    }
    throw new Error('未知任务类型');
  }

  function fibonacci(n) {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  function processImage(data) {
    // 模拟图片处理
    return { width: 800, height: 600, processed: true };
  }
`;

class WorkerPool {
  constructor(numWorkers = 4) {
    this.workers = [];
    this.taskQueue = [];
    this.taskCallbacks = new Map();
    this.nextTaskId = 0;

    // 创建 Worker 线程
    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(workerScript, { eval: true });
      worker.on('message', (msg) => {
        const callback = this.taskCallbacks.get(msg.id);
        if (callback) {
          if (msg.error) {
            callback.reject(new Error(msg.error));
          } else {
            callback.resolve(msg.result);
          }
          this.taskCallbacks.delete(msg.id);
        }
        this.processQueue();
      });
      this.workers.push({ worker, busy: false });
    }
  }

  run(task) {
    return new Promise((resolve, reject) => {
      const taskId = this.nextTaskId++;
      this.taskCallbacks.set(taskId, { resolve, reject });
      this.taskQueue.push({ ...task, id: taskId });
      this.processQueue();
    });
  }

  processQueue() {
    for (const entry of this.workers) {
      if (!entry.busy && this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        entry.worker.postMessage(task);
        entry.busy = true;

        // 标记为空闲（简化处理，实际应等 Worker 返回结果后）
        const worker = entry.worker;
        const onMessage = () => {
          entry.busy = false;
          this.processQueue();
        };
        worker.once('message', onMessage);
      }
    }
  }

  terminate() {
    this.workers.forEach(({ worker }) => worker.terminate());
  }
}

// 使用
if (isMainThread) {
  const pool = new WorkerPool(4);

  async function main() {
    const start = Date.now();

    // 并行执行多个任务
    const results = await Promise.all([
      pool.run({ type: 'fibonacci', n: 40 }),
      pool.run({ type: 'fibonacci', n: 45 }),
      pool.run({ type: 'fibonacci', n: 50 }),
      pool.run({ type: 'image-process', data: 'image1' }),
    ]);

    console.log('所有结果:', results);
    console.log(`总耗时: ${Date.now() - start}ms`);

    pool.terminate();
  }

  main();
}
```

#### 方案二：child_process（子进程）

```javascript
const { fork, exec, spawn } = require('child_process');

// 方式一：fork（专门用于 Node.js 子进程，支持 IPC 通信）
const child = fork('./heavy-task.js', ['arg1', 'arg2']);

child.on('message', (result) => {
  console.log('子进程结果:', result);
});

child.on('exit', (code) => {
  console.log(`子进程退出，退出码: ${code}`);
});

child.send({ data: 'hello' });

// 方式二：exec（执行 shell 命令，有缓冲区限制）
exec('ls -la', (error, stdout, stderr) => {
  if (error) {
    console.error(`执行错误: ${error}`);
    return;
  }
  console.log(`输出: ${stdout}`);
});

// 方式三：spawn（执行命令，流式输出，无缓冲区限制）
const ls = spawn('ls', ['-la', '/']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`子进程退出码: ${code}`);
});
```

#### 方案三：将 CPU 密集型任务拆分到事件循环间隙

```javascript
// 使用 setImmediate 将长任务拆分为小块
function processLargeData(array, handler, callback) {
  let index = 0;

  function processChunk() {
    const chunkStart = Date.now();

    // 每次最多执行 5ms，避免阻塞事件循环
    while (index < array.length && Date.now() - chunkStart < 5) {
      handler(array[index], index);
      index++;
    }

    if (index < array.length) {
      // 还有数据，让出控制权给事件循环
      setImmediate(processChunk);
    } else {
      callback();
    }
  }

  processChunk();
}

// 使用
const largeArray = new Array(100000).fill(0).map((_, i) => i);
processLargeData(largeArray, (item, index) => {
  // 处理每个元素
}, () => {
  console.log('处理完成');
});
```

#### worker_threads vs child_process vs Cluster

| 对比项 | worker_threads | child_process | Cluster |
|--------|---------------|---------------|---------|
| 通信方式 | 共享内存 + MessageChannel | IPC（序列化/反序列化） | IPC |
| 内存共享 | 支持 SharedArrayBuffer | 不支持 | 不支持 |
| 创建开销 | 较小（共享 V8 代码缓存） | 较大（独立 V8 实例） | 中等 |
| 适用场景 | CPU 密集型任务 | 系统命令、独立进程 | HTTP 服务负载均衡 |
| 数据传输 | 结构化克隆 + Transferable | JSON 序列化 | JSON 序列化 |
| 线程安全 | 需要注意（共享内存时） | 天然隔离 | 天然隔离 |

#### SharedArrayBuffer（共享内存）

```javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // 创建共享内存
  const sharedBuffer = new SharedArrayBuffer(1024);
  const sharedArray = new Int32Array(sharedBuffer);

  const worker = new Worker(__filename, {
    workerData: { sharedBuffer },
  });

  worker.on('message', () => {
    console.log('共享数组:', sharedArray);
    // 输出: Int32Array [1, 2, 3, 4, 5, 0, 0, ...]
  });
} else {
  const sharedArray = new Int32Array(workerData.sharedBuffer);

  // Worker 直接写入共享内存（无需通信）
  for (let i = 0; i < 5; i++) {
    sharedArray[i] = i + 1;
  }

  parentPort.postMessage('done');
}
```

#### 实际应用场景

```javascript
// 场景一：图片压缩
const { Worker } = require('worker_threads');
const path = require('path');

async function compressImages(imagePaths) {
  const workers = imagePaths.map(
    (imagePath) => new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, 'image-worker.js'), {
        workerData: { imagePath },
      });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker 退出码: ${code}`));
      });
    })
  );

  return Promise.all(workers);
}

// 场景二：PDF 生成
async function generatePDFs(templates) {
  const results = [];
  const batchSize = 4;  // 并发 Worker 数量

  for (let i = 0; i < templates.length; i += batchSize) {
    const batch = templates.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(template => new Promise((resolve, reject) => {
        const worker = new Worker('./pdf-worker.js', {
          workerData: template,
        });
        worker.on('message', resolve);
        worker.on('error', reject);
      }))
    );
    results.push(...batchResults);
  }

  return results;
}

// 场景三：数据加密
async function encryptData(dataChunks) {
  const workers = dataChunks.map(
    (chunk) => new Promise((resolve, reject) => {
      const worker = new Worker('./crypto-worker.js', {
        workerData: chunk,
      });
      worker.on('message', resolve);
      worker.on('error', reject);
    })
  );

  return Promise.all(workers);
}
```

**考点：** worker_threads、并发处理、CPU 密集型任务、线程池、child_process、SharedArrayBuffer、进程间通信、任务拆分

---

## 总结

以上 15 道题目覆盖了 Node.js 面试中的核心知识点：

1. **事件循环** -- Node.js 异步机制的核心
2. **模块系统** -- CommonJS 与 ES Module 的区别和使用
3. **Stream 流** -- 大数据处理和内存优化
4. **Buffer** -- 二进制数据处理
5. **Express vs Koa** -- Web 框架对比和洋葱模型
6. **错误处理** -- 全局异常捕获和优雅退出
7. **Cluster 模块** -- 多进程和负载均衡
8. **nextTick vs setImmediate** -- 任务调度机制
9. **文件上传** -- 多种实现方式和分片上传
10. **中间件原理** -- Express 中间件执行机制
11. **垃圾回收** -- V8 内存管理和性能优化
12. **认证授权** -- Session 和 JWT 实战
13. **数据库操作** -- MongoDB/Mongoose 和 MySQL/Sequelize
14. **PM2** -- 生产环境进程管理
15. **并发处理** -- worker_threads 和线程池