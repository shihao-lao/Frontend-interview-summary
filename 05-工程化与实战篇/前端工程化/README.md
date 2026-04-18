## 第13章：前端工程化（5 题）

### 题目41：Webpack和Vite区别

**答案：**

**1. Webpack**

Webpack是打包器（Bundler），开发时将所有模块打包成bundle，启动开发服务器。

```
启动开发服务器 -> 分析所有模块依赖 -> 编译所有模块 -> 打包 -> 启动服务器
（项目越大，启动越慢）
```

**2. Vite**

Vite利用浏览器原生ES Module，开发时不打包，按需编译。

```
启动开发服务器（几乎瞬间）-> 浏览器请求模块 -> Vite按需编译并返回
（启动快，HMR快）
```

**3. 对比**

| 对比项 | Webpack | Vite |
|--------|---------|------|
| 开发启动速度 | 慢（需要打包） | 快（按需编译） |
| 热更新（HMR） | 慢（重新打包受影响的模块） | 快（精确到模块级别） |
| 生产构建 | Webpack自身 | Rollup |
| 配置复杂度 | 较高 | 较低 |
| 插件生态 | 丰富 | 增长中 |
| 兼容性 | 支持旧浏览器 | 需要配置@vitejs/plugin-legacy |
| Vue支持 | vue-loader | 原生支持 |
| React支持 | 支持 | 支持（@vitejs/plugin-react） |

**4. Vite的原理**

```html
<!-- Vite开发模式下，浏览器直接加载ES模块 -->
<script type="module" src="/src/main.js"></script>

<!-- main.js中直接import -->
import App from './App.vue'; // 浏览器请求时Vite按需编译
```

**考点：** Webpack/Vite区别、Vite原理、ES Module、开发体验对比

---

---

### 题目42：loader和plugin区别

**答案：**

**1. Loader**

Loader是文件转换器，将非JS文件转换为Webpack能处理的模块。

```javascript
module: {
    rules: [
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader', 'postcss-loader']
            // 执行顺序：从右到左
            // postcss-loader -> css-loader -> style-loader
        },
        {
            test: /\.js$/,
            use: 'babel-loader' // 将ES6+转换为ES5
        },
        {
            test: /\.(png|jpg|gif)$/,
            use: 'file-loader' // 将图片复制到输出目录
        },
        {
            test: /\.vue$/,
            use: 'vue-loader' // 解析Vue单文件组件
        }
    ]
}
```

**常用Loader：**
- `babel-loader`：ES6+转ES5
- `css-loader`：解析CSS中的 `@import` 和 `url()`
- `style-loader`：将CSS插入到DOM中
- `file-loader`：处理文件（复制到输出目录）
- `url-loader`：小文件转base64
- `vue-loader`：解析Vue单文件组件
- `ts-loader`：编译TypeScript

**2. Plugin**

Plugin是插件，在Webpack构建的各个阶段执行更广泛的任务。

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

plugins: [
    new CleanWebpackPlugin(),           // 清理输出目录
    new HtmlWebpackPlugin({             // 生成HTML文件
        template: './public/index.html',
        filename: 'index.html'
    }),
    new MiniCssExtractPlugin({         // 提取CSS到单独文件
        filename: 'css/[name].[contenthash:8].css'
    }),
    new DefinePlugin({                 // 定义全局变量
        'process.env.NODE_ENV': JSON.stringify('production')
    })
]
```

**常用Plugin：**
- `HtmlWebpackPlugin`：生成HTML文件
- `MiniCssExtractPlugin`：提取CSS到单独文件
- `CleanWebpackPlugin`：清理输出目录
- `DefinePlugin`：定义全局变量
- `BundleAnalyzerPlugin`：打包分析
- `CompressionPlugin`：Gzip压缩

**3. 对比**

| 对比项 | Loader | Plugin |
|--------|--------|--------|
| 作用 | 文件转换 | 构建流程扩展 |
| 运行时机 | 文件加载时 | 整个构建生命周期 |
| 配置位置 | module.rules | plugins |
| 执行顺序 | 从右到左（链式调用） | 按注册顺序执行 |
| 本质 | 函数（接收源文件，返回转换结果） | 类（有apply方法，通过compiler访问构建流程） |

**考点：** Loader和Plugin区别、常用Loader/Plugin、执行时机、配置方式

---

---

### 题目43：Tree Shaking原理

**答案：**

**1. 什么是Tree Shaking**

Tree Shaking（摇树优化）是消除无用的死代码（Dead Code Elimination），减少打包体积。

**2. 原理**

Tree Shaking基于ES Module的静态结构特性：

- ES Module是静态的，导入导出关系在编译时就能确定。
- Webpack在构建时分析模块的导出是否被使用，未被使用的导出会被标记为无用代码。
- 最终由Terser等压缩工具删除无用代码。

```javascript
// utils.js
export function usedFunction() {
    console.log('被使用');
}
export function unusedFunction() {
    console.log('未被使用');
}

// main.js
import { usedFunction } from './utils.js';
usedFunction();

// Tree Shaking后，unusedFunction会被删除
```

**3. 使用条件**

- 必须使用ES Module语法（`import` / `export`），不能使用CommonJS（`require` / `module.exports`）。
- `package.json` 中设置 `"sideEffects": false`（或指定无副作用的文件）。
- Webpack配置 `optimization.usedExports: true`（Webpack 5默认开启）。
- 生产模式下自动开启压缩（`mode: 'production'`）。

**4. sideEffects配置**

```json
// package.json
{
    "sideEffects": false,
    // 或指定有副作用的文件
    "sideEffects": ["*.css", "*.scss", "./src/polyfill.js"]
}
```

**5. 注意事项**

- CommonJS模块无法被Tree Shaking（因为require是动态的）。
- 有副作用的代码（如修改全局变量、原型链）不能被删除。
- 使用 `/*#__PURE__*/` 注释标记纯函数调用，帮助Tree Shaking。

```javascript
const result = /*#__PURE__*/ getExpensiveValue(); // 标记为纯函数
```

**考点：** Tree Shaking原理、ES Module静态分析、sideEffects、使用条件

---

---

### 题目44：Git rebase和merge

**答案：**

**1. Git merge**

将两个分支的提交历史合并，保留所有提交记录，创建一个新的合并提交。

```bash
# 在feature分支上开发完成后
git checkout main
git merge feature
# 会创建一个新的merge commit
```

```
main:     A --- B ----------- M (merge commit)
               \             /
feature:        C --- D --- E
```

**特点：**
- 保留完整的提交历史。
- 不会改变已有提交的哈希值。
- 提交历史可能比较复杂（非线性）。
- 如果有冲突，只需要解决一次。

**2. Git rebase**

将当前分支的提交"重新播放"到目标分支的最新提交之上，生成新的提交。

```bash
# 在feature分支上
git rebase main
# 将feature分支的提交重新应用到main之上
```

```
main:     A --- B
               \
feature:        C' --- D' --- E'  (新的提交哈希)
```

**特点：**
- 产生线性的提交历史（更清晰）。
- 会改变提交的哈希值（因为重新创建了提交）。
- 如果有冲突，需要逐个提交解决。

**3. 对比**

| 对比项 | merge | rebase |
|--------|-------|--------|
| 提交历史 | 非线性，保留分支信息 | 线性，更清晰 |
| 提交哈希 | 不变 | 改变 |
| 冲突解决 | 一次性解决 | 逐个提交解决 |
| 安全性 | 安全（不改变历史） | 危险（改写历史） |
| 适用场景 | 合并功能分支到主分支 | 同步主分支更新到功能分支 |

**4. 最佳实践**

```bash
# 1. 功能分支开发时，定期rebase主分支（保持功能分支最新）
git checkout feature
git rebase main

# 2. 合并功能分支到主分支时，使用merge（保留分支历史）
git checkout main
git merge feature --no-ff

# 3. 不要对已推送到远程的公共分支进行rebase
# 4. 交互式rebase（整理提交）
git rebase -i HEAD~3
# 可以合并、编辑、删除、重排提交
```

**5. 交互式rebase**

```bash
git rebase -i HEAD~3

# 弹出编辑器：
pick abc1234 第一个提交
squash def5678 第二个提交（合并到上一个）
reorder ghi9012 第三个提交（可以调整顺序）
```

**考点：** merge vs rebase、提交历史、冲突解决、最佳实践、交互式rebase

---

---

### 题目45：前端CI/CD

**答案：**

**1. 什么是CI/CD**

- **CI（Continuous Integration，持续集成）**：频繁地将代码合并到主分支，每次合并自动运行构建和测试。
- **CD（Continuous Delivery/Deployment，持续交付/部署）**：将通过测试的代码自动部署到测试环境或生产环境。

**2. CI/CD流程**

```
代码提交 -> 触发CI/CD -> 安装依赖 -> 代码检查（Lint） -> 单元测试 -> 构建
  -> 构建产物 -> 部署到测试环境 -> 自动化测试 -> 部署到生产环境
```

**3. GitHub Actions配置**

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # 1. 检出代码
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. 安装Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      # 3. 安装依赖
      - name: Install dependencies
        run: npm ci

      # 4. 代码检查
      - name: Lint
        run: npm run lint

      # 5. 单元测试
      - name: Test
        run: npm run test -- --coverage

      # 6. 构建
      - name: Build
        run: npm run build

      # 7. 部署到服务器
      - name: Deploy
        uses: easingthemes/ssh-deploy@v4
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          SOURCE: 'dist/'
          TARGET: '/var/www/html/'
```

**4. GitLab CI配置**

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build
  - deploy

lint:
  stage: lint
  script:
    - npm ci
    - npm run lint

test:
  stage: test
  script:
    - npm run test -- --coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d.]+)/'

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  only:
    - main
  script:
    - scp -r dist/* user@server:/var/www/html/
```

**5. 前端CI/CD最佳实践**

| 阶段 | 具体措施 |
|------|----------|
| 代码检查 | ESLint、Prettier、Stylelint |
| 单元测试 | Jest、Vitest、React Testing Library |
| 构建 | Webpack/Vite构建、环境变量注入 |
| 部署 | Docker容器化、Nginx、CDN |
| 监控 | Sentry错误监控、Lighthouse性能监控 |
| 版本管理 | 语义化版本（Semantic Versioning） |

**6. Docker部署**

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**考点：** CI/CD概念、GitHub Actions、GitLab CI、Docker部署、自动化流程

---


---

## 📊 题库统计

| 篇章 | 分类 | 题目数量 |
|------|------|---------|
| **一、基础篇** | | |
| 第1章 | HTML 基础 | 15 题 |
| 第2章 | CSS 基础与进阶 | 15 题 |
| **二、核心语言篇** | | |
| 第3章 | JavaScript 基础 | 10 题 |
| 第4章 | JavaScript 进阶 | 15 题 |
| 第5章 | TypeScript | 15 题 |
| **三、运行环境篇** | | |
| 第6章 | 浏览器原理 | 8 题 |
| 第7章 | 网络协议 | 7 题 |
| 第8章 | Node.js | 15 题 |
| **四、框架篇** | | |
| 第9章 | Vue | 8 题 |
| 第10章 | React | 7 题 |
| **五、工程化与实战篇** | | |
| 第11章 | 性能优化 | 5 题 |
| 第12章 | 手写代码与算法 | 5 题 |
| 第13章 | 前端工程化 | 5 题 |
| | **合计** | **115 题** |