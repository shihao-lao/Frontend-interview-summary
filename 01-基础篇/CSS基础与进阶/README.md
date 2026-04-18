## 第2章：CSS 基础与进阶（15 题）

### 题目4：请详细解释 CSS 盒模型，标准盒模型和怪异盒模型有什么区别？如何切换？

**答案：**

**1. CSS 盒模型概述**

CSS 盒模型是 CSS 布局的基础概念。每个 HTML 元素在浏览器中都被渲染为一个矩形盒子，这个盒子由以下四个部分组成（从内到外）：

```
┌─────────────────────────────────────────┐
│                 margin                   │
│  ┌───────────────────────────────────┐  │
│  │              border               │  │
│  │  ┌───────────────────────────┐   │  │
│  │  │          padding          │   │  │
│  │  │  ┌───────────────────┐   │   │  │
│  │  │  │     content       │   │   │  │
│  │  │  │                   │   │   │  │
│  │  │  └───────────────────┘   │   │  │
│  │  └───────────────────────────┘   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

- **content（内容区）**：元素的实际内容，如文本、图片等。
- **padding（内边距）**：内容区与边框之间的空间。
- **border（边框）**：包围内边距和内容的边界线。
- **margin（外边距）**：边框外部与其他元素之间的空间。

**2. 标准盒模型（W3C 标准盒模型）**

在标准盒模型中，`width` 和 `height` 属性只包含 **content** 区域的宽度和高度。

```css
.box {
  width: 200px;
  height: 100px;
  padding: 20px;
  border: 5px solid #333;
  margin: 10px;
}
```

计算方式：
- **内容区域**：200px x 100px
- **实际占用宽度** = 200 + 20 * 2 + 5 * 2 = **250px**
- **实际占用高度** = 100 + 20 * 2 + 5 * 2 = **150px**
- **元素在页面中占据的总宽度** = 250 + 10 * 2 = **270px**

**3. 怪异盒模型（IE 盒模型 / border-box）**

在怪异盒模型中，`width` 和 `height` 属性包含 **content + padding + border** 的总宽度和总高度。

```css
.box {
  box-sizing: border-box;
  width: 200px;
  height: 100px;
  padding: 20px;
  border: 5px solid #333;
  margin: 10px;
}
```

计算方式：
- **实际占用宽度** = **200px**（已包含 padding 和 border）
- **实际占用高度** = **100px**（已包含 padding 和 border）
- **内容区域宽度** = 200 - 20 * 2 - 5 * 2 = **150px**
- **内容区域高度** = 100 - 20 * 2 - 5 * 2 = **50px**
- **元素在页面中占据的总宽度** = 200 + 10 * 2 = **220px**

**4. 两种盒模型的直观对比**

```css
/* 标准盒模型 */
.standard-box {
  box-sizing: content-box; /* 默认值 */
  width: 200px;
  padding: 20px;
  border: 5px solid #000;
  /* 总宽度 = 200 + 40 + 10 = 250px */
}

/* 怪异盒模型 */
.border-box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #000;
  /* 总宽度 = 200px（内容区 = 150px） */
}
```

**5. 如何切换盒模型**

使用 `box-sizing` 属性来切换：

```css
/* 标准盒模型（默认） */
box-sizing: content-box;

/* 怪异盒模型 */
box-sizing: border-box;
```

**6. 最佳实践 —— 全局使用 border-box**

在现代前端开发中，推荐全局使用 `border-box`，这样可以更直观地控制元素尺寸，避免 padding 和 border 影响布局。

```css
/* 方式1：使用通配符选择器 */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* 方式2：使用 inherit（推荐，性能更好） */
html {
  box-sizing: border-box;
}
*,
*::before,
*::after {
  box-sizing: inherit;
}
```

方式2的好处是，如果某个第三方库需要使用 `content-box`，可以在其容器上设置 `box-sizing: content-box`，其子元素会自动继承，而不会影响全局。

**7. 获取盒模型尺寸的 JavaScript 方法**

```javascript
const box = document.querySelector('.box');

// 获取内容区域 + padding 的宽度（不含 border 和 margin）
console.log(box.clientWidth);

// 获取内容区域 + padding + border 的宽度（不含 margin）
console.log(box.offsetWidth);

// 获取内容区域的宽度（不含 padding、border、margin）
// 使用 getComputedStyle
const styles = getComputedStyle(box);
console.log(styles.width); // content-box 模式下等于设置的 width
console.log(styles.paddingLeft);
console.log(styles.borderLeftWidth);

// getBoundingClientRect() 返回元素相对于视口的位置和尺寸
const rect = box.getBoundingClientRect();
console.log(rect.width);  // 内容 + padding + border
console.log(rect.height);
console.log(rect.top);
console.log(rect.left);
```

**考点：** CSS盒模型

---

---

### 题目5：什么是 BFC（Block Formatting Context）？如何创建 BFC？BFC 有什么实际应用？

**答案：**

**1. BFC 的定义**

BFC（Block Formatting Context，块级格式化上下文）是 CSS 中一个非常重要的布局概念。它是一个独立的渲染区域，内部元素的布局不会影响外部元素，外部元素的布局也不会影响内部元素。可以理解为 BFC 就是一个"隔离的容器"。

W3C 规范中对 BFC 的定义：

> 浮动元素、绝对定位元素、非块级盒子的块级容器（如 inline-blocks、table-cells 和 table-captions），以及 `overflow` 不为 `visible` 的块级盒子，都会为它们的内容创建新的 BFC（块级格式化上下文）。

**2. BFC 的布局规则**

BFC 内部遵循以下规则：

1. **内部的 Box 会在垂直方向上一个接一个地放置。**
2. **属于同一个 BFC 的两个相邻 Box 的垂直外边距会发生折叠（Margin Collapsing）。**
3. **每个元素的左外边缘都会触碰到容器的左边缘。** 即使有浮动元素也是如此（除非这个元素本身也是一个新的 BFC）。
4. **BFC 区域不会与浮动元素的区域重叠。**
5. **计算 BFC 的高度时，浮动元素也会参与计算。**
6. **BFC 是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。**

**3. 创建 BFC 的常见方式**

以下任意一种方式都可以创建 BFC：

```css
/* 1. float 不为 none */
.bfc {
  float: left;
  /* 或 float: right; */
}

/* 2. position 为 absolute 或 fixed */
.bfc {
  position: absolute;
  /* 或 position: fixed; */
}

/* 3. display 为 inline-block、table-cell、table-caption、
      flex、inline-flex、grid、inline-grid、flow-root */
.bfc {
  display: inline-block;
  /* 或 display: flex; */
  /* 或 display: flow-root; （推荐，专门用于创建 BFC） */
}

/* 4. overflow 不为 visible */
.bfc {
  overflow: hidden;
  /* 或 overflow: auto; */
  /* 或 overflow: scroll; */
}
```

其中，`display: flow-root` 是 CSS3 中专门为创建 BFC 而引入的属性值，没有副作用，是目前最推荐的创建 BFC 的方式。

**4. BFC 的实际应用场景**

**应用一：解决父元素高度塌陷（清除浮动）**

当子元素全部浮动时，父元素的高度会塌陷为 0。利用 BFC 规则"计算 BFC 高度时浮动元素也参与计算"来解决这个问题。

```html
<div class="container">
  <div class="float-child">浮动子元素</div>
  <div class="float-child">浮动子元素</div>
</div>
```

```css
/* 问题代码：父元素高度塌陷 */
.container {
  border: 2px solid red;
  /* 高度为 0，因为子元素都浮动了 */
}
.float-child {
  float: left;
  width: 200px;
  height: 200px;
  background: lightblue;
}

/* 解决方案1：触发父元素的 BFC */
.container {
  overflow: hidden; /* 触发 BFC */
}

/* 解决方案2：使用 flow-root（推荐） */
.container {
  display: flow-root; /* 专门创建 BFC，无副作用 */
}

/* 解决方案3：使用伪元素清除浮动（经典方案） */
.container::after {
  content: '';
  display: block;
  clear: both;
}
```

**应用二：避免外边距折叠**

属于同一个 BFC 的两个相邻块级元素的垂直外边距会发生折叠。将其中一个元素放入单独的 BFC 中即可避免。

```html
<div class="bfc-wrapper">
  <div class="box1">Box 1</div>
</div>
<div class="box2">Box 2</div>
```

```css
.box1 {
  margin-bottom: 30px;
  background: lightblue;
  height: 100px;
}

.box2 {
  margin-top: 20px;
  background: lightgreen;
  height: 100px;
}

/* 如果 box1 和 box2 在同一个 BFC 中，
   它们之间的间距 = max(30px, 20px) = 30px（外边距折叠） */

/* 解决方案：将 box1 包裹在一个新的 BFC 中 */
.bfc-wrapper {
  display: flow-root; /* 创建新的 BFC */
}

/* 现在 box1 和 box2 不在同一个 BFC 中，
   间距 = 30px + 20px = 50px（不折叠） */
```

**应用三：自适应两栏布局（左侧固定，右侧自适应）**

利用 BFC 区域不会与浮动元素重叠的特性。

```html
<div class="layout">
  <div class="left">左侧固定宽度</div>
  <div class="right">右侧自适应内容</div>
</div>
```

```css
.left {
  float: left;
  width: 200px;
  height: 300px;
  background: lightblue;
}

.right {
  /* 触发 BFC，使右侧区域不与左侧浮动元素重叠 */
  overflow: hidden; /* 或 display: flow-root; */
  height: 300px;
  background: lightgreen;
}
```

**5. BFC 与 IFC 的对比**

| 特性 | BFC（块级格式化上下文） | IFC（行内格式化上下文） |
|------|----------------------|----------------------|
| 参与元素 | 块级元素 | 行内级元素 |
| 排列方向 | 垂直排列 | 水平排列 |
| 创建方式 | float、overflow、position 等 | 块级元素本身就包含 IFC |
| 典型应用 | 清除浮动、避免 margin 折叠 | 文字排版、行内元素对齐 |

**考点：** BFC

---

---

### 题目6：CSS 选择器的优先级（Specificity）是如何计算的？请详细说明。

**答案：**

**1. 优先级概述**

CSS 选择器的优先级（Specificity，也叫特异性或权重）决定了当多条 CSS 规则应用到同一个元素时，哪条规则最终生效。浏览器会按照优先级从高到低来应用样式。

**2. 优先级的计算方式**

优先级通过一个四元组 `(a, b, c, d)` 来表示，从左到右权重依次降低，高位权重大于所有低位权重之和。

| 等级 | 对应值 | 选择器类型 | 示例 |
|------|--------|-----------|------|
| **a** | 1000 | 内联样式（style 属性） | `style="color: red"` |
| **b** | 100 | ID 选择器 | `#header` |
| **c** | 10 | 类选择器、属性选择器、伪类 | `.class`、`[type="text"]`、`:hover` |
| **d** | 1 | 元素选择器、伪元素 | `div`、`::before` |

**通配符选择器 `*` 的优先级为 0。**

**3. 计算示例**

```css
/* 优先级: (0, 0, 0, 1) = 1 */
div { color: black; }

/* 优先级: (0, 0, 1, 0) = 10 */
.special { color: blue; }

/* 优先级: (0, 0, 1, 1) = 11 */
div.special { color: green; }

/* 优先级: (0, 1, 0, 0) = 100 */
#main { color: red; }

/* 优先级: (0, 1, 1, 1) = 111 */
#main div.special { color: orange; }

/* 优先级: (0, 1, 1, 2) = 112 */
#main div.special span { color: purple; }

/* 优先级: (1, 0, 0, 0) = 1000 */
<p style="color: pink;">内联样式</p>

/* 优先级: (0, 0, 0, 0) = 0 */
* { color: gray; }
```

**4. `!important` 的特殊性**

`!important` 声明会覆盖所有正常的优先级计算，但它本身也有优先级比较规则：

```css
/* 正常优先级中，#main 优先级高于 .box */
.box { color: blue !important; }  /* !important 生效 */
#main { color: red; }              /* 被覆盖 */

/* 如果两者都有 !important，则再按正常优先级比较 */
.box { color: blue !important; }   /* 优先级 (0,0,1,0) + !important */
#main { color: red !important; }   /* 优先级 (0,1,0,0) + !important → 生效 */
```

**5. 同优先级时的处理 —— 后声明者优先**

当两条规则的优先级完全相同时，后声明的规则会覆盖先声明的规则（即 CSS 的层叠性）。

```css
/* 两者优先级都是 (0, 0, 1, 0) */
.box { color: blue; }
.box { color: red; }
/* 最终 color 为 red，因为后声明 */
```

**6. 继承的优先级**

继承的样式优先级最低，低于任何直接应用的选择器（即使通配符 `*` 的优先级也高于继承）。

```css
.parent { color: blue; }

/* 子元素 p 继承了 color: blue */
/* 但如果对 p 设置任何样式，都会覆盖继承的值 */
p { color: red; }
/* p 的 color 为 red */
```

**7. 实际开发中的优先级管理**

```css
/* 不推荐：滥用 ID 选择器导致难以覆盖 */
#header .nav .nav-item .nav-link { color: blue; }

/* 推荐：使用类选择器，保持优先级可控 */
.header-nav-link { color: blue; }

/* 如果需要覆盖，只需增加一个类名 */
.header-nav-link.active { color: red; }
```

**8. 常见面试陷阱**

```css
/* 陷阱1：11个类选择器 vs 1个ID选择器 */
/* (0, 0, 11, 0) = 110  vs  (0, 1, 0, 0) = 100 */
/* 结果：ID 选择器胜出，因为高位权重大于所有低位之和 */
.class1.class2.class3.class4.class5.class6.class7.class8.class9.class10.class11 { color: blue; }
#id { color: red; }
/* color 为 red */

/* 陷阱2：伪类 vs 伪元素 */
/* :hover 是伪类，优先级为 (0, 0, 1, 0) = 10 */
/* ::before 是伪元素，优先级为 (0, 0, 0, 1) = 1 */
div:hover { color: blue; }      /* 优先级 10 */
div::before { color: red; }     /* 优先级 1 */

/* 陷阱3：属性选择器与类选择器优先级相同 */
/* 两者都是 (0, 0, 1, 0) */
[type="text"] { color: blue; }  /* 优先级 10 */
.input-class { color: red; }    /* 优先级 10 */
/* 后声明者生效 */
```

**考点：** CSS选择器优先级

---

---

### 题目7：`flex: 1` 具体代表什么含义？它分别设置了哪些属性？

**答案：**

**1. `flex: 1` 的完整含义**

`flex: 1` 是 `flex: 1 1 0%` 的简写形式，它分别设置了三个 Flex 子项属性：

```css
flex: 1;
/* 等价于 */
flex-grow: 1;
flex-shrink: 1;
flex-basis: 0%;
```

**2. 三个属性的详细解释**

**`flex-grow`（弹性增长比例）**

定义子项在主轴方向上如何分配剩余空间。默认值为 `0`（不增长）。

```css
.container {
  display: flex;
  width: 600px;
}

.item1 {
  flex-grow: 1; /* 分配 1 份剩余空间 */
  width: 100px;
}

.item2 {
  flex-grow: 2; /* 分配 2 份剩余空间 */
  width: 100px;
}

.item3 {
  flex-grow: 0; /* 不参与分配 */
  width: 100px;
}

/* 剩余空间 = 600 - 100 - 100 - 100 = 300px */
/* item1 获得：300 * (1 / (1+2)) = 100px，最终宽度 = 200px */
/* item2 获得：300 * (2 / (1+2)) = 200px，最终宽度 = 300px */
/* item3 获得：0px，最终宽度 = 100px */
```

**`flex-shrink`（弹性收缩比例）**

定义子项在空间不足时如何收缩。默认值为 `1`（等比例收缩）。

```css
.container {
  display: flex;
  width: 300px; /* 容器宽度不够 */
}

.item1 {
  flex-shrink: 1;
  width: 200px;
}

.item2 {
  flex-shrink: 2; /* 收缩比例更大 */
  width: 200px;
}

/* 超出空间 = 200 + 200 - 300 = 100px */
/* item1 收缩：100 * (1 / (1+2)) = 33.33px，最终宽度 = 166.67px */
/* item2 收缩：100 * (2 / (1+2)) = 66.67px，最终宽度 = 133.33px */
```

**`flex-basis`（初始尺寸）**

定义子项在分配多余空间之前的初始尺寸。默认值为 `auto`（即子项本身的尺寸）。

```css
.item {
  flex-basis: 200px; /* 初始宽度为 200px */
  /* 如果设置为 0%，则初始宽度为 0，所有空间都按 flex-grow 比例分配 */
}
```

**3. `flex: 1` 的关键理解**

当设置 `flex: 1`（即 `flex: 1 1 0%`）时：

- `flex-basis: 0%` 意味着子项的初始宽度为 0，所有可用空间都作为"剩余空间"来分配。
- `flex-grow: 1` 意味着所有设置了 `flex: 1` 的子项平均分配这些空间。

```css
.container {
  display: flex;
  width: 600px;
}

/* 三个子项都设置 flex: 1，每个占 200px */
.item1 { flex: 1; }
.item2 { flex: 1; }
.item3 { flex: 1; }

/* 不同比例 */
.item1 { flex: 1; } /* 占 1/4 = 150px */
.item2 { flex: 1; } /* 占 1/4 = 150px */
.item3 { flex: 2; } /* 占 2/4 = 300px */
```

**4. `flex: 1` 与 `flex: auto` 的区别**

这是一个非常常见的面试考点：

```css
/* flex: 1 等价于 flex: 1 1 0% */
/* flex-basis 为 0%，所有空间按比例分配 */
.item {
  flex: 1;
}

/* flex: auto 等价于 flex: 1 1 auto */
/* flex-basis 为 auto，先按内容/设置的宽度分配，剩余空间再按比例分配 */
.item {
  flex: auto;
}
```

```html
<div style="display: flex; width: 600px;">
  <div style="flex: 1; background: lightblue;">flex: 1</div>
  <div style="flex: 1; background: lightgreen;">flex: 1</div>
</div>
<!-- 两个子项各占 300px -->

<div style="display: flex; width: 600px;">
  <div style="flex: auto; background: lightblue;">短文本</div>
  <div style="flex: auto; background: lightgreen;">这是一段很长很长的文本内容</div>
</div>
<!-- 第一个子项按内容宽度分配，第二个子项占据剩余空间 -->
```

**5. `flex` 的其他常见简写**

```css
flex: none;       /* 等价于 flex: 0 0 auto —— 不增长、不收缩、按内容尺寸 */
flex: 0;          /* 等价于 flex: 0 1 0% —— 不增长、可收缩 */
flex: initial;    /* 等价于 flex: 0 1 auto —— 默认值 */
flex: auto;       /* 等价于 flex: 1 1 auto */
flex: 1;          /* 等价于 flex: 1 1 0% */
flex: 2;          /* 等价于 flex: 2 1 0% */
```

**6. 实际应用场景**

```css
/* 经典的固定头部 + 自适应内容 + 固定底部布局 */
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  flex: 0 0 60px; /* 固定高度，不增长不收缩 */
}

.content {
  flex: 1; /* 占据剩余所有空间 */
  overflow-y: auto;
}

.footer {
  flex: 0 0 40px; /* 固定高度，不增长不收缩 */
}
```

**考点：** flex:1

---

---

### 题目8：CSS 中 `position` 有哪些取值？各自的特点和使用场景是什么？

**答案：**

**1. position 属性概述**

`position` 属性用于指定元素的定位方式，共有五个取值：

| 值 | 是否脱离文档流 | 相对于什么定位 |
|----|--------------|--------------|
| `static` | 否 | 正常文档流 |
| `relative` | 否（但会偏移） | 相对于自身在正常流中的位置 |
| `absolute` | 是 | 相对于最近的非 `static` 定位的祖先元素 |
| `fixed` | 是 | 相对于浏览器视口（viewport） |
| `sticky` | 否（特定条件下固定） | 相对于滚动容器 |

**2. 各取值详解**

**`position: static`（默认值）**

元素按照正常文档流排列，`top`、`right`、`bottom`、`left`、`z-index` 属性不生效。

```css
.element {
  position: static;
  /* top: 10px; 无效 */
  /* left: 20px; 无效 */
}
```

**`position: relative`（相对定位）**

元素仍然占据文档流中的原始位置，但可以通过 `top`、`right`、`bottom`、`left` 属性进行偏移。偏移不会影响其他元素的布局。

```css
.box {
  position: relative;
  top: 20px;   /* 向下偏移 20px */
  left: 30px;  /* 向右偏移 30px */
  /* 元素在文档流中仍占据原始位置，但视觉上偏移了 */
}
```

**使用场景：**
- 为绝对定位的子元素提供定位参照
- 微调元素位置而不影响布局

```css
/* 为子元素提供定位参照 */
.parent {
  position: relative;
}

.child {
  position: absolute;
  top: 0;
  right: 0;
}
```

**`position: absolute`（绝对定位）**

元素脱离文档流，不占据空间。相对于最近的非 `static` 定位的祖先元素进行定位。如果没有这样的祖先元素，则相对于初始包含块（通常是 `<html>`）。

```css
.parent {
  position: relative; /* 作为定位参照 */
  width: 300px;
  height: 200px;
}

.child {
  position: absolute;
  top: 10px;
  right: 10px;
  /* 相对于 .parent 的右上角偏移 */
}
```

**使用场景：**
- 弹出层、下拉菜单
- 徽标、角标
- 模态框

```css
/* 角标示例 */
.badge-wrapper {
  position: relative;
  display: inline-block;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: red;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
```

**`position: fixed`（固定定位）**

元素脱离文档流，相对于浏览器视口进行定位。即使页面滚动，元素也始终保持在视口中的同一位置。

```css
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 40px;
  height: 40px;
  background: #333;
  color: white;
  border-radius: 50%;
  cursor: pointer;
}

/* 固定导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

/* 固定定位的注意事项 */
/* 如果祖先元素设置了 transform、perspective、filter，
   则 fixed 元素会相对于该祖先定位，而不是视口 */
.parent-with-transform {
  transform: translateZ(0);
}
/* 此时内部的 fixed 元素不再相对于视口定位 */
```

**`position: sticky`（粘性定位）**

元素在正常文档流中，当滚动到指定位置时"粘住"，表现为 `fixed` 效果。它是 `relative` 和 `fixed` 的混合体。

```css
.sticky-header {
  position: sticky;
  top: 0;       /* 滚动到距顶部 0px 时粘住 */
  z-index: 100;
  background: white;
}

/* 注意事项：
   1. 必须指定 top/bottom/left/right 中的至少一个阈值
   2. 父元素不能设置 overflow: hidden
   3. 父元素的高度不能超过视口高度
   4. 只在父元素范围内生效，超出父元素范围会随父元素一起滚动
*/
```

**使用场景：**
- 吸顶导航栏
- 表格的固定表头
- 侧边栏跟随滚动

```html
<div class="container">
  <div class="sticky-nav">导航栏（滚动到顶部时固定）</div>
  <div class="content">
    <!-- 大量内容 -->
  </div>
</div>
```

**3. z-index 与层叠上下文**

`z-index` 只对 `position` 不为 `static` 的元素生效。但 `z-index` 的比较是在同一个层叠上下文（Stacking Context）中进行的。

```css
/* 创建层叠上下文的方式：
   1. position 不为 static 且 z-index 不为 auto
   2. opacity < 1
   3. transform 不为 none
   4. filter 不为 none
   5. isolation: isolate
   等等...
*/

.parent {
  position: relative;
  z-index: 1; /* 创建新的层叠上下文 */
}

/* 即使 .child 的 z-index 很高，也不会超过 .parent 的兄弟元素 */
.child {
  position: absolute;
  z-index: 9999;
}
```

**考点：** position定位

---

---

### 题目9：CSS 中有哪些实现垂直居中的方案？请分别说明。

**答案：**

垂直居中是 CSS 面试中的经典问题，下面从简单到复杂依次介绍各种方案。

**方案一：Flexbox（推荐，最现代的方案）**

```css
.parent {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中（可选） */
  height: 300px;
}

.child {
  width: 100px;
  height: 100px;
}
```

这是目前最推荐的方案，代码简洁，兼容性好（IE10+）。

**方案二：Grid 布局**

```css
.parent {
  display: grid;
  place-items: center; /* 同时实现水平和垂直居中 */
  height: 300px;
}

.child {
  width: 100px;
  height: 100px;
}
```

`place-items: center` 是 `align-items: center` 和 `justify-items: center` 的简写。

**方案三：绝对定位 + transform**

```css
.parent {
  position: relative;
  height: 300px;
}

.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
}
```

利用 `top: 50%` 将子元素的顶部移到父元素的中点，再用 `transform: translate(-50%, -50%)` 将子元素自身向左上方偏移自身宽高的一半，实现精确居中。兼容性好（IE9+）。

**方案四：绝对定位 + margin: auto**

```css
.parent {
  position: relative;
  height: 300px;
}

.child {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100px;
  height: 100px;
  margin: auto; /* 四个方向都设为 auto 时，浏览器自动计算居中 */
}
```

此方案要求子元素有明确的宽高。

**方案五：绝对定位 + 负 margin**

```css
.parent {
  position: relative;
  height: 300px;
}

.child {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  margin-top: -50px;  /* 高度的一半 */
  margin-left: -50px; /* 宽度的一半 */
}
```

此方案需要已知子元素的宽高，兼容性很好（IE6+）。

**方案六：line-height（适用于单行文本）**

```css
.parent {
  height: 300px;
  line-height: 300px; /* line-height 等于 height */
  text-align: center;
}

.child {
  display: inline-block;
  vertical-align: middle;
  line-height: normal; /* 重置 line-height，避免继承 */
}
```

**方案七：table-cell + vertical-align**

```css
.parent {
  display: table-cell;
  vertical-align: middle;
  height: 300px;
  width: 300px;
}

.child {
  /* 不需要额外设置，自动垂直居中 */
}
```

利用表格单元格的 `vertical-align: middle` 特性。兼容性极好（IE8+）。

**方案八：writing-mode（巧妙方案）**

```css
.parent {
  writing-mode: vertical-lr; /* 改变书写方向为纵向 */
  text-align: center;
  height: 300px;
}

.child {
  writing-mode: horizontal-tb; /* 子元素恢复横向 */
  display: inline-block;
}
```

利用改变书写方向后，`text-align: center` 变为垂直居中的特性。

**方案九：CSS Grid + margin: auto**

```css
.parent {
  display: grid;
  height: 300px;
}

.child {
  margin: auto;
}
```

在 Grid 布局中，`margin: auto` 可以同时在两个轴上居中。

**各方案对比总结：**

| 方案 | 优点 | 缺点 | 兼容性 |
|------|------|------|--------|
| Flexbox | 简洁、灵活 | 需要 IE10+ | 现代浏览器 |
| Grid | 最简洁 | 需要 IE11（部分支持） | 现代浏览器 |
| absolute + transform | 不需要已知宽高 | 可能影响其他定位 | IE9+ |
| absolute + margin: auto | 代码简单 | 需要已知宽高 | IE8+ |
| absolute + 负 margin | 兼容性最好 | 需要已知宽高 | IE6+ |
| line-height | 简单 | 仅适用于单行文本 | 全兼容 |
| table-cell | 兼容性好 | 语义不佳 | IE8+ |

**推荐做法：** 优先使用 Flexbox 或 Grid 方案，它们最简洁、最灵活。

**考点：** CSS垂直居中方案

---

---

### 题目10：CSS3 有哪些新特性？请列举并简要说明。

**答案：**

CSS3 不是单个规范，而是由多个模块（Module）组成的集合。以下按类别介绍主要的 CSS3 新特性。

**1. 选择器增强**

```css
/* 属性选择器增强 */
input[type="email"] { }           /* 精确匹配 */
[class^="icon-"] { }              /* 以 icon- 开头 */
[class$="-active"] { }            /* 以 -active 结尾 */
[class*="nav"] { }                /* 包含 nav */

/* 伪类 */
li:first-child { }                /* 第一个子元素 */
li:last-child { }                 /* 最后一个子元素 */
li:nth-child(2n) { }              /* 偶数位子元素 */
li:nth-child(2n+1) { }            /* 奇数位子元素 */
li:nth-child(3) { }               /* 第3个子元素 */
li:nth-last-child(2) { }          /* 倒数第2个子元素 */
div:empty { }                     /* 没有子元素的元素 */
input:enabled { }                 /* 启用状态 */
input:disabled { }                /* 禁用状态 */
input:checked { }                 /* 选中状态 */
div:not(.excluded) { }            /* 排除选择器 */

/* 伪元素 */
p::first-line { }                 /* 第一行 */
p::first-letter { }               /* 首字母 */
::selection { }                   /* 选中文本 */
.element::before { }              /* 元素前插入内容 */
.element::after { }               /* 元素后插入内容 */
```

**2. 边框与圆角**

```css
/* 圆角 */
.box {
  border-radius: 10px;           /* 四个角相同 */
  border-radius: 10px 20px 30px 40px; /* 左上 右上 右下 左下 */
  border-radius: 50%;            /* 圆形 */
}

/* 阴影 */
.box {
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3); /* x偏移 y偏移 模糊 扩展 颜色 */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);     /* 发光效果 */
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3); /* 内阴影 */
}

/* 边框图片 */
.box {
  border-image: url(border.png) 30 round;
}
```

**3. 背景与渐变**

```css
/* 多重背景 */
.box {
  background:
    url(bg1.png) no-repeat top left,
    url(bg2.png) no-repeat bottom right,
    linear-gradient(to right, red, blue);
}

/* 线性渐变 */
.gradient-linear {
  background: linear-gradient(to right, #ff0000, #0000ff);
  background: linear-gradient(45deg, red, orange, yellow, green, blue, purple);
  background: linear-gradient(to right, red 0%, blue 50%, green 100%);
}

/* 径向渐变 */
.gradient-radial {
  background: radial-gradient(circle, #ff0000, #0000ff);
  background: radial-gradient(circle at top left, red, blue);
}

/* 锥形渐变 */
.gradient-conic {
  background: conic-gradient(red, yellow, green, blue, red);
}
```

**4. 文本效果**

```css
/* 文字阴影 */
.text {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* 文字溢出省略号 */
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 多行文本省略号 */
.multi-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 文字描边 */
.text-stroke {
  -webkit-text-stroke: 2px red;
  color: transparent;
}

/* 文字换行控制 */
.break-word {
  word-break: break-all;    /* 允许在任意字符处换行 */
  word-wrap: break-word;    /* 允许在单词内换行 */
  overflow-wrap: break-word; /* 标准属性 */
}
```

**5. 过渡（Transition）**

```css
.button {
  background: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.button:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 分别设置不同属性的过渡 */
.element {
  transition: background 0.3s ease, transform 0.5s ease-in-out;
}

/* 过渡时间函数 */
.element {
  transition-timing-function: ease;        /* 默认，慢-快-慢 */
  transition-timing-function: linear;      /* 匀速 */
  transition-timing-function: ease-in;     /* 慢-快 */
  transition-timing-function: ease-out;    /* 快-慢 */
  transition-timing-function: ease-in-out; /* 慢-快-慢 */
  transition-timing-function: cubic-bezier(0.68, -0.55, 0.27, 1.55); /* 自定义贝塞尔曲线 */
}
```

**6. 动画（Animation）**

```css
@keyframes slideIn {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    transform: translateX(20px);
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.element {
  animation: slideIn 1s ease-in-out forwards;
  /* animation: name duration timing-function delay iteration-count direction fill-mode play-state */
}

/* 动画相关属性 */
.element {
  animation-name: slideIn;
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
  animation-delay: 0.5s;
  animation-iteration-count: infinite;  /* 无限循环 */
  animation-direction: alternate;        /* 交替反向 */
  animation-fill-mode: forwards;        /* 保持最终状态 */
  animation-play-state: paused;          /* 暂停动画 */
}
```

**7. 变换（Transform）**

```css
/* 2D 变换 */
.transform-2d {
  transform: translate(50px, 100px);  /* 平移 */
  transform: rotate(45deg);           /* 旋转 */
  transform: scale(1.5);              /* 缩放 */
  transform: skew(10deg, 20deg);      /* 倾斜 */
  transform: translate(50px, 100px) rotate(45deg); /* 组合变换 */
}

/* 3D 变换 */
.transform-3d {
  transform: translate3d(50px, 100px, 200px);
  transform: rotateX(45deg);
  transform: rotateY(45deg);
  transform: rotateZ(45deg);
  transform: perspective(500px) rotateY(45deg);
}

/* 3D 变换相关属性 */
.parent-3d {
  perspective: 1000px;        /* 设置透视距离 */
  transform-style: preserve-3d; /* 保留子元素的 3D 效果 */
  backface-visibility: hidden;  /* 背面不可见 */
}
```

**8. 媒体查询（Media Query）**

```css
/* 根据屏幕宽度应用不同样式 */
@media screen and (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}

@media screen and (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 250px;
  }
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #ffffff;
  }
}

/* 打印样式 */
@media print {
  .no-print {
    display: none;
  }
}
```

**9. Flexbox 和 Grid 布局**

```css
/* Flexbox */
.flex-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

/* Grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 20px;
}
```

**10. CSS 变量（Custom Properties）**

```css
:root {
  --primary-color: #3498db;
  --font-size-base: 16px;
  --spacing: 8px;
}

.button {
  background: var(--primary-color);
  font-size: var(--font-size-base);
  padding: var(--spacing) calc(var(--spacing) * 2);
}
```

**11. 滤镜（Filter）**

```css
.image {
  filter: blur(5px);           /* 模糊 */
  filter: brightness(1.2);     /* 亮度 */
  filter: contrast(1.5);       /* 对比度 */
  filter: grayscale(100%);     /* 灰度 */
  filter: sepia(100%);         /* 复古色调 */
  filter: drop-shadow(5px 5px 10px rgba(0,0,0,0.5)); /* 阴影 */
  filter: hue-rotate(90deg);   /* 色相旋转 */
}
```

**考点：** CSS3新特性

---

---

### 题目11：什么是响应式设计？实现响应式设计有哪些常用方法？

**答案：**

**1. 响应式设计的概念**

响应式设计（Responsive Web Design，RWD）是一种网页设计方法，使网站能够根据不同的设备屏幕尺寸、分辨率和方向，自动调整页面布局和内容展示方式，从而在各种设备上都能提供良好的用户体验。

响应式设计的核心理念由 Ethan Marcotte 在 2010 年提出，包含三个关键技术要素：

1. **弹性网格布局（Fluid Grid）** —— 使用相对单位（百分比、vw/vh、fr 等）代替固定像素。
2. **弹性图片/媒体（Flexible Images）** —— 图片和媒体元素能够自适应容器大小。
3. **媒体查询（Media Queries）** —— 根据设备特征应用不同的 CSS 样式。

**2. 常用实现方法**

**方法一：媒体查询（Media Queries）**

媒体查询是最常用的响应式设计方法，可以根据不同的屏幕宽度应用不同的样式。

```css
/* 移动优先（Mobile First）策略 —— 默认为移动端样式 */
.container {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

/* 平板（>= 768px） */
@media screen and (min-width: 768px) {
  .container {
    flex-direction: row;
    padding: 20px;
  }
  .sidebar {
    width: 250px;
  }
}

/* 桌面（>= 1024px） */
@media screen and (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px;
  }
  .sidebar {
    width: 300px;
  }
}

/* 大屏（>= 1440px） */
@media screen and (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
}
```

**常用断点（Breakpoints）：**

| 设备类型 | 断点范围 |
|---------|---------|
| 手机（竖屏） | < 576px |
| 手机（横屏） | 576px ~ 767px |
| 平板 | 768px ~ 1023px |
| 笔记本/小桌面 | 1024px ~ 1439px |
| 大桌面 | >= 1440px |

**方法二：弹性布局（Flexbox / Grid）**

```css
/* Flexbox 响应式卡片布局 */
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card {
  flex: 1 1 300px; /* 最小宽度 300px，自动换行 */
  max-width: calc(33.333% - 16px);
}

/* Grid 响应式布局 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
/* auto-fit + minmax 实现自动适配，无需媒体查询 */
```

**方法三：相对单位**

```css
/* 使用百分比 */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* 使用 vw/vh */
.fullscreen {
  width: 100vw;
  height: 100vh;
}

/* 使用 rem（相对于根元素字体大小） */
html {
  font-size: 16px;
}

@media screen and (max-width: 768px) {
  html {
    font-size: 14px; /* 移动端缩小基准字号 */
  }
}

.element {
  font-size: 1rem;       /* 16px / 14px */
  padding: 1.5rem;       /* 24px / 21px */
  margin-bottom: 1rem;   /* 16px / 14px */
}

/* 使用 clamp() 实现流式排版 */
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
  /* 最小 1.5rem，最大 3rem，中间按视口宽度线性变化 */
}
```

**方法四：响应式图片**

```html
<!-- 使用 srcset 根据屏幕宽度加载不同尺寸的图片 -->
<img
  srcset="small.jpg 480w, medium.jpg 768w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 900px) 768px, 1200px"
  src="medium.jpg"
  alt="响应式图片"
>

<!-- 使用 picture 元素提供不同的图片方案 -->
<picture>
  <source media="(max-width: 768px)" srcset="mobile.jpg">
  <source media="(min-width: 769px)" srcset="desktop.jpg">
  <img src="desktop.jpg" alt="响应式图片">
</picture>

<!-- CSS 控制图片自适应 */
img {
  max-width: 100%;
  height: auto;
}
```

**方法五：CSS clamp() 和 min()/max()**

```css
/* clamp(min, preferred, max) */
.container {
  width: clamp(300px, 80%, 1200px);
  /* 最小 300px，最大 1200px，首选 80% */
}

/* min() 和 max() */
.sidebar {
  width: min(300px, 25%);
  /* 取较小值，防止侧边栏过宽 */
}

.content {
  width: max(50%, 300px);
  /* 取较大值，保证内容区域不会太窄 */
}
```

**3. 视口设置（viewport meta tag）**

响应式设计必须在 HTML 的 `<head>` 中添加 viewport 元标签：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

各参数含义：
- `width=device-width`：视口宽度等于设备宽度
- `initial-scale=1.0`：初始缩放比例为 1
- `maximum-scale=1.0`：最大缩放比例为 1
- `user-scalable=no`：禁止用户缩放（一般不推荐，影响无障碍访问）

**4. 移动优先 vs 桌面优先**

```css
/* 移动优先（推荐）：默认样式为移动端，通过 min-width 逐步增强 */
.base { font-size: 14px; }
@media (min-width: 768px) { .base { font-size: 16px; } }
@media (min-width: 1024px) { .base { font-size: 18px; } }

/* 桌面优先：默认样式为桌面端，通过 max-width 逐步降级 */
.base { font-size: 18px; }
@media (max-width: 1023px) { .base { font-size: 16px; } }
@media (max-width: 767px) { .base { font-size: 14px; } }
```

移动优先的优势：移动端样式更简洁，性能更好；渐进增强的理念更符合现代开发实践。

**考点：** 响应式设计

---

---

### 题目12：什么是 CSS Sprites（CSS 精灵图）？它的原理和优缺点是什么？

**答案：**

**1. CSS Sprites 的概念**

CSS Sprites（也叫 CSS 精灵图、雪碧图）是一种网页性能优化技术。它将多个小图标或图片合并成一张大图，然后通过 CSS 的 `background-position` 属性来定位显示需要的部分，从而减少 HTTP 请求次数，提高页面加载速度。

**2. 基本原理**

假设我们有三个小图标，每个图标大小为 20px x 20px，将它们水平排列合并成一张 60px x 20px 的精灵图：

```
[图标1][图标2][图标3]
 0px    20px    40px
```

```css
/* 精灵图作为所有图标的公共背景 */
.icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-image: url('sprites.png');
  background-repeat: no-repeat;
}

/* 通过 background-position 定位到不同的图标 */
.icon-home {
  background-position: 0 0;       /* 第一个图标 */
}

.icon-search {
  background-position: -20px 0;   /* 第二个图标 */
}

.icon-user {
  background-position: -40px 0;   /* 第三个图标 */
}
```

```html
<span class="icon icon-home"></span>
<span class="icon icon-search"></span>
<span class="icon icon-user"></span>
```

**3. 精灵图的生成方式**

**手动拼接：** 使用 Photoshop 等图像编辑工具手动拼接。

**自动化工具：**
- **Webpack：** 使用 `webpack-spritesmith` 插件
- **Gulp：** 使用 `gulp.spritesmith` 插件
- **在线工具：** 如 spritecow.com、Toptal Sprite Generator

**webpack-spritesmith 配置示例：**

```javascript
const SpritesmithPlugin = require('webpack-spritesmith');

module.exports = {
  plugins: [
    new SpritesmithPlugin({
      src: {
        cwd: path.resolve(__dirname, 'src/icons'),
        glob: '*.png'
      },
      target: {
        image: path.resolve(__dirname, 'src/assets/sprite.png'),
        css: path.resolve(__dirname, 'src/styles/sprite.css')
      },
      apiOptions: {
        cssImageRef: '../assets/sprite.png'
      }
    })
  ]
};
```

**4. 优缺点分析**

**优点：**

| 优点 | 说明 |
|------|------|
| 减少 HTTP 请求 | 多个图标合并为一张图片，减少请求数量，降低服务器压力 |
| 加快页面加载 | 减少网络延迟，特别在 HTTP/1.1 下效果显著 |
| 提前加载 | 精灵图只需加载一次，后续图标切换无需额外请求 |
| 减少图片总大小 | 多张小图合并后，由于共享相同的图片头信息，总大小可能更小 |

**缺点：**

| 缺点 | 说明 |
|------|------|
| 维护困难 | 修改一个图标需要重新生成整张精灵图 |
| 内存占用 | 即使只显示一个小图标，也需要加载整张精灵图到内存 |
| 定位繁琐 | 需要手动计算或使用工具计算 `background-position` |
| 不够灵活 | 难以适应响应式设计，缩放时可能出现模糊 |
| 高 DPI 适配复杂 | 需要为 Retina 屏幕准备 2x、3x 的精灵图 |

**5. 现代替代方案**

随着技术的发展，CSS Sprites 逐渐被以下方案替代：

**方案一：SVG 图标**

```html
<!-- 内联 SVG -->
<svg class="icon" viewBox="0 0 24 24">
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
</svg>

<!-- SVG Sprite -->
<svg style="display: none;">
  <symbol id="icon-home" viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </symbol>
</svg>

<svg class="icon"><use href="#icon-home"/></svg>
```

**方案二：Icon Font（图标字体）**

```html
<!-- 使用 Font Awesome 等图标字体库 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<i class="fas fa-home"></i>
<i class="fas fa-search"></i>
```

**方案三：CSS 内联图标**

```css
/* 使用 CSS 绘制简单图标 */
.icon-close {
  position: relative;
  width: 20px;
  height: 20px;
}
.icon-close::before,
.icon-close::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 2px;
  background: currentColor;
}
.icon-close::before { transform: translate(-50%, -50%) rotate(45deg); }
.icon-close::after { transform: translate(-50%, -50%) rotate(-45deg); }
```

**6. CSS Sprites 在 HTTP/2 时代的变化**

在 HTTP/2 下，多路复用（Multiplexing）允许在同一个 TCP 连接上并行发送多个请求，HTTP 请求的开销大幅降低，因此 CSS Sprites 的优势不再像在 HTTP/1.1 下那么明显。但精灵图仍然在某些场景下有用，例如减少图片解码开销和内存占用。

**考点：** CSS Sprites

---

---

### 题目13：伪元素和伪类有什么区别？请分别列举常见的伪元素和伪类。

**答案：**

**1. 伪元素和伪类的核心区别**

| 特性 | 伪类（Pseudo-class） | 伪元素（Pseudo-element） |
|------|---------------------|------------------------|
| **定义** | 选择处于某种状态的元素 | 创建不在 DOM 中的虚拟元素 |
| **作用** | 选中元素的某种特定状态 | 在元素内容之前/之后插入虚拟内容 |
| **语法（CSS3）** | 单冒号 `:` | 双冒号 `::` |
| **数量** | 一个元素可以同时使用多个伪类 | 一个元素只能使用一个伪元素（某些浏览器允许） |
| **在 DOM 中** | 不创建新元素，只是选择已有元素 | 创建虚拟的行内元素 |
| **权重** | 与类选择器相同（0,0,1,0） | 与类选择器相同（0,0,1,0） |

**简单记忆：** 伪类是"选择"某种状态的元素（如 hover、first-child），伪元素是"创建"某种虚拟的元素（如 ::before、::after）。

**2. 常见伪类**

**（1）用户交互伪类**

```css
a:link { color: blue; }      /* 未访问的链接 */
a:visited { color: purple; } /* 已访问的链接 */
a:hover { color: red; }      /* 鼠标悬停 */
a:active { color: orange; }  /* 激活（按下）状态 */
a:focus { outline: 2px solid blue; } /* 获得焦点 */

/* LVHA 顺序：link → visited → hover → active */
/* 如果顺序不对，某些样式可能被覆盖 */
```

**（2）结构化伪类**

```css
/* 子元素选择 */
li:first-child { }           /* 第一个子元素 */
li:last-child { }            /* 最后一个子元素 */
li:nth-child(3) { }          /* 第3个子元素 */
li:nth-child(odd) { }        /* 奇数位子元素（等价于 2n+1） */
li:nth-child(even) { }       /* 偶数位子元素（等价于 2n） */
li:nth-child(3n) { }         /* 每3个一组中的第3个 */
li:nth-last-child(2) { }     /* 倒数第2个子元素 */

/* 类型选择 */
p:first-of-type { }          /* 同类型中的第一个 */
p:last-of-type { }           /* 同类型中的最后一个 */
p:nth-of-type(2) { }         /* 同类型中的第2个 */
p:nth-last-of-type(2) { }    /* 同类型中的倒数第2个 */
p:only-of-type { }           /* 唯一同类型元素 */
p:only-child { }             /* 唯一子元素 */

/* 根元素 */
:root { }                    /* 文档根元素（即 html） */

/* 空元素 */
div:empty { }                /* 没有子元素的元素 */
```

**（3）表单伪类**

```css
input:enabled { }            /* 启用状态 */
input:disabled { }           /* 禁用状态 */
input:checked { }            /* 被选中（radio/checkbox） */
input:focus { }              /* 获得焦点 */
input:focus-visible { }      /* 键盘聚焦时显示（更精确的焦点控制） */
input:required { }           /* 设置了 required 属性 */
input:optional { }           /* 未设置 required 属性 */
input:valid { }              /* 验证通过 */
input:invalid { }            /* 验证失败 */
input:in-range { }           /* 值在 min-max 范围内 */
input:out-of-range { }       /* 值超出 min-max 范围 */
input:read-only { }          /* 只读状态 */
input:read-write { }         /* 可编辑状态 */
input:placeholder-shown { }  /* 显示占位符文本时 */
```

**（4）否定伪类**

```css
/* 排除特定元素 */
div:not(.excluded) { }       /* 所有 class 不为 excluded 的 div */
li:not(:first-child) { }     /* 除第一个外的所有 li */
input:not(:disabled) { }     /* 所有未禁用的 input */
```

**3. 常见伪元素**

**（1）内容生成伪元素**

```css
/* ::before —— 在元素内容前插入虚拟内容 */
.element::before {
  content: '前缀：';
  color: red;
}

/* ::after —— 在元素内容后插入虚拟内容 */
.element::after {
  content: '';
  display: block;
  clear: both; /* 经典清除浮动方案 */
}

/* content 属性的多种用法 */
.element::before {
  content: '文本内容';              /* 文本 */
  content: attr(data-label);        /* 读取 HTML 属性值 */
  content: url(icon.png);           /* 插入图片 */
  content: '\2014';                 /* 使用 Unicode 字符（破折号） */
  content: counter(section);        /* 使用 CSS 计数器 */
  content: none;                    /* 不生成内容（但伪元素仍存在） */
}
```

**（2）文本修饰伪元素**

```css
/* ::first-line —— 选中第一行文本 */
p::first-line {
  font-size: 1.2em;
  font-weight: bold;
  color: blue;
}

/* ::first-letter —— 选中首字母（常用于首字下沉效果） */
p::first-letter {
  font-size: 3em;
  float: left;
  line-height: 1;
  margin-right: 8px;
  font-weight: bold;
}

/* ::selection —— 选中文本的样式 */
::selection {
  background: #3498db;
  color: white;
}

/* ::placeholder —— 输入框占位符样式 */
input::placeholder {
  color: #999;
  font-size: 14px;
}
```

**4. 伪元素的实际应用**

**应用一：清除浮动**

```css
.clearfix::after {
  content: '';
  display: block;
  clear: both;
}
```

**应用二：CSS 三角形**

```css
.tooltip::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #333;
}
```

**应用三：自定义复选框**

```css
.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkbox-wrapper label::before {
  content: '';
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 3px;
  margin-right: 8px;
  vertical-align: middle;
}

.checkbox-wrapper input[type="checkbox"]:checked + label::before {
  content: '\2713'; /* 对勾符号 */
  background: #3498db;
  color: white;
  text-align: center;
  line-height: 18px;
  border-color: #3498db;
}
```

**应用四：装饰性分割线**

```css
.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: #3498db;
  margin: 10px auto 0;
}
```

**5. CSS2 vs CSS3 语法差异**

```css
/* CSS2 语法（单冒号）—— 兼容旧浏览器 */
.element:before { }
.element:after { }

/* CSS3 语法（双冒号）—— 推荐使用 */
.element::before { }
.element::after { }

/* 注意：为了兼容 IE8，::before 和 ::after 仍需写成 :before 和 :after */
/* 其他伪元素（如 ::selection）在 IE8 中不支持 */
```

**考点：** 伪元素和伪类

---

---

### 题目14：什么是重绘（Repaint）和回流（Reflow/Reflow）？如何减少它们？

**答案：**

**1. 基本概念**

**重绘（Repaint）：** 当元素的外观发生改变，但不影响其在文档流中的位置和大小（如颜色、背景色、可见性等），浏览器会重新绘制该元素的外观。重绘的成本相对较低。

**回流（Reflow / Layout / Reflow）：** 当元素的尺寸、位置、结构发生改变，浏览器需要重新计算元素的几何属性（位置和大小），并可能影响其他元素的位置。回流会导致整个渲染树的部分或全部重新计算，成本远高于重绘。

**2. 渲染流程**

浏览器渲染页面的基本流程：

```
HTML → DOM 树
CSS  → CSSOM 树
DOM + CSSOM → Render Tree（渲染树）
Render Tree → Layout（布局/回流） → Paint（绘制） → Composite（合成）
```

- **DOM 树：** 解析 HTML 生成的节点树。
- **CSSOM 树：** 解析 CSS 生成的样式规则树。
- **渲染树：** DOM 和 CSSOM 合并后，只包含需要显示的节点及其样式。
- **布局（Layout/Reflow）：** 计算每个节点的确切位置和大小。
- **绘制（Paint）：** 将节点绘制到屏幕上。
- **合成（Composite）：** 将多个图层合成最终页面。

**3. 触发回流的常见操作**

```javascript
// 1. 改变几何属性
element.style.width = '200px';
element.style.height = '100px';
element.style.padding = '10px';
element.style.margin = '20px';
element.style.border = '1px solid red';
element.style.display = 'none';    // 改变 display 会触发回流
element.style.position = 'absolute';
element.style.fontSize = '20px';   // 改变字体大小会影响行高，触发回流
element.style.overflow = 'hidden';

// 2. 读取布局属性（会强制触发回流以获取最新值）
const height = element.offsetHeight;
const width = element.offsetWidth;
const top = element.offsetTop;
const left = element.offsetLeft;
const rect = element.getBoundingClientRect();
const styles = getComputedStyle(element);
const scrollTop = element.scrollTop;

// 3. DOM 操作
document.body.appendChild(node);
document.body.removeChild(node);
parent.insertBefore(newNode, referenceNode);

// 4. 窗口变化
window.resize;
window.scroll;
```

**4. 触发重绘但不触发回流的操作**

```javascript
// 只改变外观，不影响布局
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.style.backgroundImage = 'url(...)';
element.style.visibility = 'hidden';  // 注意：visibility: hidden 仍占据空间
element.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
element.style.outline = '2px solid red';
element.style.textDecoration = 'underline';
element.style.borderRadius = '10px';
```

**5. 回流的代价 —— 布局抖动（Layout Thrashing）**

```javascript
// 反模式：读写交替，导致频繁回流（布局抖动）
for (let i = 0; i < items.length; i++) {
  items[i].style.width = container.offsetWidth + 'px';
  // 每次读取 offsetWidth 都会强制回流
  // 每次设置 width 又会触发回流
  // 循环中反复读写，性能极差
}

// 正确做法：批量读取，再批量写入
const containerWidth = container.offsetWidth; // 只读取一次
for (let i = 0; i < items.length; i++) {
  items[i].style.width = containerWidth + 'px'; // 批量写入
}
```

**6. 减少回流和重绘的策略**

**策略一：使用 CSS transform 代替 top/left**

```css
/* 不推荐：修改 top/left 触发回流 */
.box {
  position: absolute;
  top: 100px;
  left: 200px;
  transition: top 0.3s, left 0.3s;
}

/* 推荐：使用 transform 只触发合成，不触发回流和重绘 */
.box {
  transform: translate(200px, 100px);
  transition: transform 0.3s;
}
```

`transform` 和 `opacity` 的变化只触发合成（Composite），不触发回流和重绘，性能最好。

**策略二：使用 CSS will-change 提示浏览器**

```css
.animated-element {
  will-change: transform, opacity;
  /* 提前告知浏览器这些属性即将变化，浏览器可以提前优化 */
}
```

注意：`will-change` 不要滥用，过多使用反而会消耗更多内存。

**策略三：批量修改 DOM**

```javascript
// 不推荐：逐个修改 DOM
list.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item;
  listElement.appendChild(li); // 每次都触发回流
});

// 推荐：使用 DocumentFragment 批量添加
const fragment = document.createDocumentFragment();
list.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item;
  fragment.appendChild(li); // 在 fragment 中操作，不触发回流
});
listElement.appendChild(fragment); // 只触发一次回流

// 推荐：使用 innerHTML（一次性替换）
listElement.innerHTML = list.map(item => `<li>${item}</li>`).join('');
```

**策略四：避免频繁读取布局属性**

```javascript
// 不推荐：读写交替
element.style.height = '100px';
console.log(element.offsetHeight); // 强制同步布局
element.style.height = '200px';
console.log(element.offsetHeight); // 再次强制同步布局

// 推荐：使用 requestAnimationFrame 分离读写
function update() {
  // 读取阶段
  const height = element.offsetHeight;

  // 写入阶段（在下一帧执行）
  requestAnimationFrame(() => {
    element.style.height = height + 10 + 'px';
  });
}
```

**策略五：使用 CSS 类名切换代替逐个修改样式**

```javascript
// 不推荐：逐个修改样式
element.style.width = '200px';
element.style.height = '100px';
element.style.background = 'red';

// 推荐：通过切换类名一次性修改
element.classList.add('active');
```

```css
.active {
  width: 200px;
  height: 100px;
  background: red;
}
```

**策略六：离线 DOM 操作**

```javascript
// 将元素从文档流中移除，修改后再放回
const parent = element.parentNode;
const nextSibling = element.nextSibling;
parent.removeChild(element);

// 修改元素（此时不在文档流中，不会触发回流）
element.style.width = '200px';
element.style.height = '100px';
element.innerHTML = 'new content';

// 放回文档流（只触发一次回流）
parent.insertBefore(element, nextSibling);

// 或者使用 display: none 隐藏后修改
element.style.display = 'none';
// ... 修改操作 ...
element.style.display = 'block';
```

**7. 回流和重绘的性能对比**

| 操作 | 触发回流 | 触发重绘 | 触发合成 | 性能影响 |
|------|---------|---------|---------|---------|
| 修改 `color` | 否 | 是 | 否 | 低 |
| 修改 `visibility` | 否 | 是 | 否 | 低 |
| 修改 `transform` | 否 | 否 | 是 | 最低 |
| 修改 `opacity` | 否 | 否 | 是 | 最低 |
| 修改 `width/height` | 是 | 是 | 否 | 高 |
| 修改 `top/left` | 是 | 是 | 否 | 高 |
| 读取 `offsetWidth` | 是 | - | - | 中 |

**考点：** 重绘和回流

---

---

### 题目15：`<link>` 标签引入 CSS 和 `@import` 引入 CSS 有什么区别？

**答案：**

**1. 基本用法**

**使用 `<link>` 标签：**

```html
<head>
  <link rel="stylesheet" href="styles.css">
</head>
```

**使用 `@import`：**

```html
<!-- 方式1：在 HTML 的 <style> 标签中使用 -->
<style>
  @import url('styles.css');
</style>

<!-- 方式2：在 CSS 文件中使用 -->
/* main.css */
@import url('reset.css');
@import url('layout.css');
@import url('theme.css');

body {
  font-family: Arial, sans-serif;
}
```

**2. 核心区别**

| 区别点 | `<link>` | `@import` |
|--------|----------|-----------|
| **加载时机** | HTML 解析时并行加载 | 等到 CSS 文件下载并解析到 `@import` 时才加载 |
| **加载方式** | 与 HTML 并行下载 | 串行加载，可能阻塞页面渲染 |
| **兼容性** | 无兼容性问题 | IE5+ 支持，但存在一些兼容性差异 |
| **使用位置** | 只能在 HTML 的 `<head>` 中 | 可以在 CSS 文件或 `<style>` 标签中使用 |
| **DOM 可操作性** | 可以通过 JavaScript 操作 DOM 来动态添加 | 不能通过 DOM 操作 |
| **权重** | 无权重差异 | 与 `<link>` 无权重差异 |
| **额外请求** | 直接加载 CSS 文件 | 如果在 CSS 文件中使用，会产生额外的请求链 |

**3. 加载时机的详细分析**

**`<link>` 的加载过程：**

```
浏览器解析 HTML
  → 遇到 <link> 标签
  → 发起 CSS 文件请求（并行下载，不阻塞 HTML 解析）
  → CSS 文件下载完成后解析样式
  → 继续渲染页面
```

**`@import` 的加载过程（在 CSS 文件中使用时）：**

```
浏览器解析 HTML
  → 遇到 <link> 引入 main.css
  → 下载 main.css
  → 解析 main.css，发现 @import url('reset.css')
  → 发起 reset.css 请求（此时才下载）
  → reset.css 下载完成后继续解析
  → 发现 @import url('layout.css')
  → 又发起 layout.css 请求
  → ... 形成串行加载链
```

```html
<!-- 问题演示 -->
<head>
  <link rel="stylesheet" href="main.css">
  <!-- main.css 中有 @import url('other.css') -->
  <!-- 浏览器必须先下载 main.css，解析到 @import 时才下载 other.css -->
  <!-- other.css 的加载被延迟了 -->
</head>
```

**4. JavaScript 动态操作**

```javascript
// <link> 可以通过 JavaScript 动态创建和插入
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'dynamic-styles.css';
document.head.appendChild(link);

// @import 无法通过 DOM 操作
// 但可以在动态创建的 <style> 标签中使用
const style = document.createElement('style');
style.textContent = '@import url("dynamic.css")';
document.head.appendChild(style);
// 注意：这种方式仍然存在加载延迟问题
```

**5. @import 的依赖加载问题**

```css
/* file-a.css */
@import url('file-b.css');

.a-class {
  color: red;
}
```

```css
/* file-b.css */
.b-class {
  color: blue;
}
```

```html
<link rel="stylesheet" href="file-a.css">
```

加载顺序：`file-a.css` → 解析发现 `@import` → 下载 `file-b.css` → 解析 `file-b.css` → 继续解析 `file-a.css` 剩余内容。

这种串行加载会显著增加页面加载时间，特别是在网络延迟较高的环境下。

**6. 多层 @import 的性能问题**

```css
/* style.css */
@import url('base.css');       /* base.css 中又 @import 了 reset.css */
@import url('components.css'); /* components.css 中又 @import 了 button.css */
@import url('layout.css');
```

这会形成一个串行加载链：

```
style.css → base.css → reset.css
         → components.css → button.css
         → layout.css
```

每个 `@import` 都会增加一次额外的网络往返，严重影响性能。

**7. 最佳实践**

```html
<!-- 推荐：使用多个 <link> 标签，浏览器会并行下载 -->
<head>
  <link rel="stylesheet" href="reset.css">
  <link rel="stylesheet" href="base.css">
  <link rel="stylesheet" href="components.css">
  <link rel="stylesheet" href="layout.css">
  <link rel="stylesheet" href="theme.css">
</head>

<!-- 不推荐：使用 @import 导致串行加载 -->
<head>
  <link rel="stylesheet" href="main.css">
  <!-- main.css 内部使用 @import 引入其他文件 -->
</head>

<!-- 在现代前端工程中，推荐使用构建工具打包合并 CSS -->
<!-- Webpack、Vite 等工具会将多个 CSS 文件合并为一个，减少请求数 -->
```

**8. 现代前端工程中的处理**

在现代前端开发中，无论是 `<link>` 还是 `@import`，最终都会通过构建工具（Webpack、Vite、Rollup 等）进行处理：

```javascript
// Webpack 中通过 css-loader 处理 @import
// css-loader 会将 @import 解析为 require/import
// 最终通过 mini-css-extract-plugin 提取为独立的 CSS 文件

// 开发环境：style-loader 将 CSS 注入到 <style> 标签中
// 生产环境：mini-css-extract-plugin 将 CSS 提取为 .css 文件，通过 <link> 引入
```

因此，在现代前端工程中，`@import` 主要用于 CSS 文件之间的模块化组织（开发阶段），最终打包后都会被转换为 `<link>` 或内联样式。

**考点：** link和@import区别

---