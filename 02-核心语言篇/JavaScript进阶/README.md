## 第4章：JavaScript 进阶（15 题）

### 题目11：请解释 call、apply、bind 的作用和区别，并手写实现。

**答案：**

`call`、`apply`、`bind` 都是 `Function.prototype` 上的方法，用于改变函数执行时的 `this` 指向。

**区别：**

| 方法 | 参数形式 | 是否立即执行 | 返回值 |
|------|----------|-------------|--------|
| `call` | `fn.call(thisArg, arg1, arg2, ...)` | 立即执行 | 函数的返回值 |
| `apply` | `fn.apply(thisArg, [arg1, arg2, ...])` | 立即执行 | 函数的返回值 |
| `bind` | `fn.bind(thisArg, arg1, arg2, ...)` | 不立即执行，返回新函数 | 新函数 |

**使用示例：**

```javascript
function greet(greeting, punctuation) {
  console.log(greeting + ', ' + this.name + punctuation);
}

const person = { name: 'Alice' };

greet.call(person, 'Hello', '!');      // "Hello, Alice!"
greet.apply(person, ['Hi', '...']);    // "Hi, Alice..."

const boundGreet = greet.bind(person, 'Hey');
boundGreet('~');                        // "Hey, Alice~"
```

**手写 call：**

```javascript
Function.prototype.myCall = function(thisArg, ...args) {
  // thisArg 为 null 或 undefined 时，指向全局对象
  thisArg = thisArg == null ? globalThis : Object(thisArg);

  // 使用 Symbol 避免属性名冲突
  const key = Symbol('fn');
  thisArg[key] = this;

  const result = thisArg[key](...args);

  // 删除临时属性
  delete thisArg[key];

  return result;
};

// 测试
function sayName() {
  console.log(this.name);
}
sayName.myCall({ name: 'Alice' }); // "Alice"
```

**手写 apply：**

```javascript
Function.prototype.myApply = function(thisArg, args = []) {
  thisArg = thisArg == null ? globalThis : Object(thisArg);

  const key = Symbol('fn');
  thisArg[key] = this;

  const result = thisArg[key](...args);

  delete thisArg[key];

  return result;
};

// 测试
function greet(greeting) {
  console.log(greeting + ', ' + this.name);
}
greet.myApply({ name: 'Bob' }, ['Hello']); // "Hello, Bob"
```

**手写 bind：**

```javascript
Function.prototype.myBind = function(thisArg, ...outerArgs) {
  const originalFn = this;

  const boundFn = function(...innerArgs) {
    // 如果是 new 调用，this 应该指向新创建的实例
    // 否则 this 指向绑定的 thisArg
    const isNewCall = new.target !== undefined;
    const context = isNewCall ? this : thisArg;

    return originalFn.apply(context, [...outerArgs, ...innerArgs]);
  };

  // 维护原型链，使 new 调用时能正确继承
  boundFn.prototype = Object.create(originalFn.prototype);

  return boundFn;
};

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.sayHello = function() {
  console.log('Hello, ' + this.name);
};

const BoundPerson = Person.myBind(null, 'Alice');
const p = new BoundPerson(25);
console.log(p.name); // "Alice"
console.log(p.age);  // 25
p.sayHello();        // "Hello, Alice"
```

**考点：** call、apply、bind、this 指向、手写实现、new 绑定优先级

---

---

### 题目12：什么是事件委托？有什么优点？

**答案：**

**事件委托（Event Delegation）** 是利用事件冒泡机制，将子元素的事件监听器绑定到父元素上，通过事件对象的 `target` 属性来判断实际触发事件的元素。

**事件冒泡：** 当一个元素上的事件被触发后，事件会从触发元素开始，沿着 DOM 树向上传播，直到 document。

**基本原理：**

```html
<ul id="list">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
  <li>Item 4</li>
  <li>Item 5</li>
</ul>
```

```javascript
// 不使用事件委托 —— 每个元素都绑定事件（性能差）
const items = document.querySelectorAll('#list li');
items.forEach(item => {
  item.addEventListener('click', function() {
    console.log(this.textContent);
  });
});

// 使用事件委托 —— 只在父元素上绑定一个事件（推荐）
document.getElementById('list').addEventListener('click', function(e) {
  // e.target 是实际被点击的元素
  // e.currentTarget 是绑定事件的元素（即 ul）
  if (e.target.tagName === 'LI') {
    console.log(e.target.textContent);
    // e.target.style.color = 'red';
  }
});
```

**更完善的实现：**

```javascript
class EventDelegate {
  constructor(root) {
    this.root = root;
    this.handlers = {};
  }

  /**
   * 注册事件委托
   * @param {string} event - 事件类型
   * @param {string} selector - CSS 选择器
   * @param {Function} handler - 事件处理函数
   */
  on(event, selector, handler) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
      this.root.addEventListener(event, (e) => {
        this.handlers[event].forEach(({ selector: sel, handler: fn }) => {
          // 从 target 向上查找匹配的元素
          const target = e.target.closest(sel);
          if (target && this.root.contains(target)) {
            fn.call(target, e);
          }
        });
      });
    }
    this.handlers[event].push({ selector, handler });
  }

  /**
   * 移除事件委托
   */
  off(event, selector, handler) {
    if (!this.handlers[event]) return;
    this.handlers[event] = this.handlers[event].filter(
      item => !(item.selector === selector && item.handler === handler)
    );
  }
}

// 使用示例
const delegate = new EventDelegate(document.body);
delegate.on('click', '#list li', function(e) {
  console.log(this.textContent); // this 指向匹配的 li 元素
});
```

**事件委托的优点：**

1. **减少内存消耗**：只需绑定一个事件监听器，而不是为每个子元素都绑定
2. **动态元素自动生效**：后续动态添加的子元素无需重新绑定事件
3. **代码更简洁**：管理更方便

```javascript
// 动态添加的元素也能响应事件
const ul = document.getElementById('list');
ul.addEventListener('click', function(e) {
  if (e.target.tagName === 'LI') {
    console.log('点击了：', e.target.textContent);
  }
});

// 动态添加新的 li
const newLi = document.createElement('li');
newLi.textContent = 'New Item';
ul.appendChild(newLi);
// 点击 New Item 也能触发事件
```

**注意事项：**
- 并非所有事件都冒泡（如 `focus`、`blur`、`mouseenter`、`mouseleave`），需要用 `focusin`、`focusout`、`mouseover`、`mouseout` 替代
- 如果子元素内部还有嵌套元素，需要使用 `e.target.closest()` 向上查找匹配的元素
- 事件委托过多层级时，应考虑就近委托，不要全部委托到 document

**考点：** 事件冒泡、事件委托、性能优化、closest 方法

---

---

### 题目13：JavaScript 有哪些继承方式？请分别举例说明。

**答案：**

JavaScript 的继承方式经历了从原型链继承到 ES6 class 语法糖的演进。

**1. 原型链继承**

```javascript
function Animal(name) {
  this.name = name;
  this.colors = ['white', 'black'];
}
Animal.prototype.getName = function() {
  return this.name;
};

function Dog() {}
Dog.prototype = new Animal(); // 子类的原型指向父类的实例

const dog1 = new Dog();
const dog2 = new Dog();

dog1.colors.push('brown');
console.log(dog2.colors); // ['white', 'black', 'brown'] —— 引用类型被共享
```

> 缺点：引用类型的属性被所有实例共享；创建子类实例时无法向父类构造函数传参。

**2. 借用构造函数（经典继承）**

```javascript
function Animal(name) {
  this.name = name;
  this.colors = ['white', 'black'];
}

function Dog(name) {
  Animal.call(this, name); // 借用父类构造函数
}

const dog1 = new Dog('旺财');
const dog2 = new Dog('来福');

dog1.colors.push('brown');
console.log(dog1.colors); // ['white', 'black', 'brown']
console.log(dog2.colors); // ['white', 'black'] —— 互不影响
```

> 缺点：方法只能定义在构造函数中，无法复用；父类原型上的方法子类无法访问。

**3. 组合继承（原型链 + 借用构造函数）**

```javascript
function Animal(name) {
  this.name = name;
  this.colors = ['white', 'black'];
}
Animal.prototype.getName = function() {
  return this.name;
};

function Dog(name, breed) {
  Animal.call(this, name); // 第二次调用 Animal
}
Dog.prototype = new Animal(); // 第一次调用 Animal
Dog.prototype.constructor = Dog;

Dog.prototype.getBreed = function() {
  return this.breed;
};

const dog = new Dog('旺财', '柴犬');
console.log(dog.getName()); // "旺财"
```

> 缺点：父类构造函数被调用了两次，存在不必要的属性。

**4. 原型式继承**

```javascript
function createObject(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}

const animal = {
  name: 'Animal',
  colors: ['white', 'black']
};

const dog = createObject(animal);
dog.name = 'Dog';
dog.colors.push('brown');

const cat = createObject(animal);
console.log(cat.colors); // ['white', 'black', 'brown'] —— 引用类型共享
```

> 本质与 `Object.create()` 相同。缺点：引用类型属性共享。

**5. 寄生式继承**

```javascript
function createAnother(original) {
  const clone = Object.create(original);
  clone.sayHi = function() {
    console.log('Hi');
  };
  return clone;
}

const animal = { name: 'Animal' };
const dog = createAnother(animal);
dog.sayHi(); // "Hi"
```

> 缺点：方法无法复用，与借用构造函数类似。

**6. 寄生组合继承（最佳实践）**

```javascript
function inheritPrototype(SubType, SuperType) {
  // 创建父类原型的副本
  const prototype = Object.create(SuperType.prototype);
  // 修正 constructor 指向
  prototype.constructor = SubType;
  // 设置子类的原型
  SubType.prototype = prototype;
}

function Animal(name) {
  this.name = name;
  this.colors = ['white', 'black'];
}
Animal.prototype.getName = function() {
  return this.name;
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

inheritPrototype(Dog, Animal);

Dog.prototype.getBreed = function() {
  return this.breed;
};

const dog = new Dog('旺财', '柴犬');
console.log(dog.getName());  // "旺财"
console.log(dog.getBreed()); // "柴犬"
console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true
```

> 优点：只调用一次父类构造函数，原型链保持完整，是最理想的继承方式。

**7. ES6 class 继承**

```javascript
class Animal {
  constructor(name) {
    this.name = name;
    this.colors = ['white', 'black'];
  }

  getName() {
    return this.name;
  }

  // 静态方法
  static create(name) {
    return new Animal(name);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 必须在 this 之前调用
    this.breed = breed;
  }

  getBreed() {
    return this.breed;
  }

  // 重写父类方法
  getName() {
    return super.getName() + ' (' + this.breed + ')';
  }
}

const dog = new Dog('旺财', '柴犬');
console.log(dog.getName());  // "旺财 (柴犬)"
console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true
```

> ES6 的 `class` 本质上是语法糖，底层仍然是原型链继承，但写法更清晰、更接近面向对象的风格。

**考点：** 继承、原型链、组合继承、寄生组合继承、class 语法

---

---

### 题目14：什么是变量提升和函数提升？请详细说明。

**答案：**

**变量提升（Hoisting）** 是指 JavaScript 引擎在代码执行前，会将 `var` 声明的变量和 `function` 声明的函数提升到其所在作用域的顶部。但提升只是将声明提升，赋值操作留在原地。

**变量提升：**

```javascript
console.log(a); // undefined —— 变量 a 被提升，但尚未赋值
var a = 1;

// 等价于：
var a;          // 声明被提升到作用域顶部
console.log(a); // undefined
a = 1;          // 赋值留在原地
```

**函数提升：**

```javascript
foo(); // "Hello" —— 函数声明被完整提升（包括函数体）

function foo() {
  console.log('Hello');
}
```

**函数声明 vs 函数表达式：**

```javascript
// 函数声明 —— 整个函数被提升
foo(); // "Hello"
function foo() {
  console.log('Hello');
}

// 函数表达式 —— 只有变量声明被提升，赋值留在原地
bar(); // TypeError: bar is not a function
var bar = function() {
  console.log('World');
};

// 等价于：
var bar;
bar(); // TypeError: bar is not a function
bar = function() {
  console.log('World');
};
```

**函数提升优先于变量提升：**

```javascript
console.log(foo); // [Function: foo] —— 函数声明覆盖了变量声明

var foo = 'variable';

function foo() {
  console.log('function');
}

console.log(foo); // "variable" —— 赋值操作覆盖了函数声明

// 等价于：
function foo() {         // 函数声明先被提升
  console.log('function');
}
var foo;                 // 变量声明被提升（但已存在同名函数，声明被忽略）
console.log(foo);        // [Function: foo]
foo = 'variable';        // 赋值操作
console.log(foo);        // "variable"
```

**let/const 的提升（暂时性死区）：**

```javascript
// let 和 const 也有提升，但存在暂时性死区（TDZ）
console.log(a); // ReferenceError: Cannot access 'a' before initialization
let a = 1;

// 在以下代码中，从块开始到 let 声明之间的区域就是 TDZ
{
  // TDZ 开始
  console.log(typeof x); // ReferenceError
  // TDZ 结束
  let x = 1;
}
```

> `let` 和 `const` 声明的变量确实被提升了，但它们在声明之前处于"暂时性死区"，任何访问都会抛出 `ReferenceError`。这与 `var` 不同，`var` 提升后值为 `undefined`。

**实际面试题：**

```javascript
var a = 1;
function foo() {
  console.log(a); // undefined —— 局部变量 a 被提升，覆盖了全局变量
  var a = 2;
}
foo();
console.log(a); // 1 —— 全局变量不受影响

// 等价于：
var a = 1;
function foo() {
  var a;          // 局部变量 a 被提升
  console.log(a); // undefined
  a = 2;
}
foo();
console.log(a);   // 1
```

```javascript
function foo() {
  return a;
  var a = 1;
}
console.log(foo()); // undefined —— return 之后的 var 声明仍然被提升

// 等价于：
function foo() {
  var a;
  return a;
  a = 1;
}
```

**考点：** 变量提升、函数提升、暂时性死区、作用域、执行上下文

---

---

### 题目15：null 和 undefined 有什么区别？

**答案：**

`null` 和 `undefined` 都表示"没有值"，但它们的语义和使用场景不同。

**基本区别：**

| 特性 | `null` | `undefined` |
|------|--------|-------------|
| 含义 | 空值，表示"此处应该有一个值，但当前为空" | 未定义，表示"此处没有定义值" |
| 类型 | `object`（历史 bug） | `undefined` |
| 转为数值 | `0` | `NaN` |
| JSON 支持 | 支持（`JSON.stringify(null)` => `"null"`） | 不支持（`JSON.stringify(undefined)` => `undefined`，会被忽略） |
| 主动赋值 | 可以主动赋值 | 不建议主动赋值 |

**详细说明：**

```javascript
// undefined 的出现场景
let a;
console.log(a); // undefined —— 声明但未赋值

function foo(b) {
  console.log(b);
}
foo(); // undefined —— 参数未传递

const obj = {};
console.log(obj.name); // undefined —— 访问不存在的属性

function bar() {}
console.log(bar()); // undefined —— 函数没有返回值

// null 的出现场景
// 通常由开发者主动赋值，表示"空"或"无"
let data = null; // 表示 data 当前为空，后续可能会赋值

// DOM 操作中
const el = document.getElementById('not-exist');
console.log(el); // null —— 元素不存在

// 原型链的顶端
console.log(Object.prototype.__proto__); // null
```

**类型判断：**

```javascript
typeof null;      // "object" —— 历史 bug
typeof undefined; // "undefined"

// 准确判断
Object.prototype.toString.call(null);      // "[object Null]"
Object.prototype.toString.call(undefined); // "[object Undefined]"
```

**相等比较：**

```javascript
null == undefined;   // true  —— 宽松相等时它们相等
null === undefined;  // false —— 严格相等时它们不相等

null == 0;           // false
null == false;       // false
null == '';          // false

undefined == 0;      // false
undefined == false;  // false
undefined == '';     // false
```

**实际开发中的最佳实践：**

```javascript
// 检查变量是否为 null 或 undefined
if (value == null) {
  // 同时匹配 null 和 undefined
}

if (value === null) {
  // 只匹配 null
}

if (typeof value === 'undefined') {
  // 只匹配 undefined
}

// 使用空值合并运算符（ES2020）
const result = value ?? 'default'; // value 为 null 或 undefined 时使用默认值

// 使用可选链（ES2020）
const name = user?.profile?.name ?? '匿名';
```

**考点：** null、undefined、类型判断、宽松相等、空值合并运算符

---

---

### 题目16：== 和 === 有什么区别？请详细说明隐式类型转换规则。

**答案：**

`==` 是**宽松相等**（抽象相等），在比较前会进行隐式类型转换；`===` 是**严格相等**，不会进行类型转换，要求类型和值都相同。

**严格相等（===）：**

```javascript
1 === 1           // true
1 === '1'         // false —— 类型不同
null === null     // true
undefined === undefined // true
null === undefined      // false
NaN === NaN       // false —— NaN 不等于自身
```

> 注意：`NaN === NaN` 返回 `false`，判断 NaN 应使用 `Number.isNaN()` 或 `Object.is(NaN, NaN)`。

**宽松相等（==）的隐式类型转换规则：**

类型转换的优先级：**ToNumber > ToBoolean > ToString**

```javascript
// 1. 字符串与数字比较：字符串转为数字
'1' == 1    // true  —— '1' 转为 1
'' == 0     // true  —— '' 转为 0
'abc' == 1  // false —— 'abc' 转为 NaN，NaN != 1

// 2. 布尔值与其他类型比较：布尔值先转为数字
true == 1    // true  —— true 转为 1
false == 0   // true  —— false 转为 0
true == '1'  // true  —— true 转为 1，'1' 转为 1
true == '2'  // false —— true 转为 1，'2' 转为 2

// 3. null 和 undefined 的特殊规则
null == undefined  // true
null == 0          // false
null == ''         // false
null == false      // false
undefined == 0     // false
undefined == ''    // false
undefined == false // false

// 4. 对象与原始值比较：对象调用 ToPrimitive 转为原始值
// ToPrimitive 的规则：先调用 valueOf()，如果返回的不是原始值，再调用 toString()
[] == 0           // true  —— [] -> '' -> 0
[] == ''          // true  —— [] -> ''
[] == false       // true  —— [] -> '' -> 0, false -> 0
[1] == '1'        // true  —— [1] -> '1'
[1, 2] == '1,2'   // true  —— [1,2] -> '1,2'
{} == '[object Object]' // true —— {} -> '[object Object]'
{} == 0           // false —— {} -> '[object Object]' -> NaN

// 5. 其他
'' == false       // true  —— '' -> 0, false -> 0
'0' == false      // true  —— '0' -> 0, false -> 0
'0' == ''         // false —— '0' -> 0, '' -> 0, 但 0 != 0 是 false... 实际 '0' 是 0, '' 是 0, 0 == 0 为 true
// 修正：'0' == '' => 0 == 0 => true? 不对，实际是 false
// '0' 转为 0，'' 转为 0，0 == 0 => true
// 实际测试：'0' == '' => false
// 原因：'' == false => true, '0' == false => true, 但 '0' == '' => false
// 这里需要更仔细的分析：
// '0' == '' => 两边都是字符串，直接比较 => false（不进行类型转换）
```

**ToPrimitive 转换规则：**

当对象需要转换为原始值时：
1. 如果是 `Date` 对象，优先调用 `toString()`
2. 其他对象优先调用 `valueOf()`
3. 如果返回的不是原始值，则调用另一个方法
4. 如果都不是原始值，抛出 `TypeError`

```javascript
const obj = {
  valueOf() {
    console.log('valueOf');
    return 42;
  },
  toString() {
    console.log('toString');
    return 'hello';
  }
};

console.log(obj + '');    // "42" —— 先调用 valueOf，返回原始值 42，再转为 "42"
console.log(String(obj)); // "hello" —— String() 优先调用 toString
```

**最佳实践：**
- 始终使用 `===` 进行比较，避免隐式类型转换带来的意外结果
- 使用 `Object.is()` 处理特殊场景（如 `NaN` 和 `-0`）

```javascript
Object.is(NaN, NaN);     // true
Object.is(0, -0);        // false
Object.is(+0, -0);       // false
0 === -0                 // true
```

**考点：** 隐式类型转换、ToPrimitive、宽松相等、严格相等、Object.is

---

---

### 题目17：请详细说明 ES6 解构赋值的用法和各种场景。

**答案：**

**解构赋值（Destructuring Assignment）** 是 ES6 引入的语法，允许从数组或对象中提取值并赋给变量。

**1. 数组解构**

```javascript
// 基本用法
const [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1, 2, 3

// 跳过元素
const [x, , z] = [1, 2, 3];
console.log(x, z); // 1, 3

// 默认值
const [p, q = 2] = [1];
console.log(p, q); // 1, 2

// 剩余元素
const [first, ...rest] = [1, 2, 3, 4];
console.log(first, rest); // 1, [2, 3, 4]

// 交换变量
let m = 1, n = 2;
[m, n] = [n, m];
console.log(m, n); // 2, 1

// 嵌套解构
const [a, [b, [c]]] = [1, [2, [3]]];
console.log(a, b, c); // 1, 2, 3

// 函数参数解构
function sum([a, b]) {
  return a + b;
}
console.log(sum([1, 2])); // 3
```

**2. 对象解构**

```javascript
// 基本用法
const { name, age } = { name: 'Alice', age: 25 };
console.log(name, age); // "Alice", 25

// 重命名
const { name: myName, age: myAge } = { name: 'Alice', age: 25 };
console.log(myName, myAge); // "Alice", 25

// 默认值
const { name, role = 'user' } = { name: 'Alice' };
console.log(name, role); // "Alice", "user"

// 嵌套解构
const { address: { city, country } } = {
  name: 'Alice',
  address: { city: 'Beijing', country: 'China' }
};
console.log(city, country); // "Beijing", "China"

// 剩余属性
const { name, ...rest } = { name: 'Alice', age: 25, city: 'Beijing' };
console.log(name, rest); // "Alice", { age: 25, city: 'Beijing' }

// 函数参数解构
function greet({ name, greeting = 'Hello' }) {
  console.log(greeting + ', ' + name);
}
greet({ name: 'Alice' }); // "Hello, Alice"
greet({ name: 'Bob', greeting: 'Hi' }); // "Hi, Bob"

// 已声明变量的解构（需要加括号）
let x, y;
({ x, y } = { x: 1, y: 2 });
console.log(x, y); // 1, 2
```

**3. 函数返回值解构**

```javascript
function getUser() {
  return { name: 'Alice', age: 25, email: 'alice@example.com' };
}

const { name, age, email } = getUser();

// 只取需要的字段
function getFullName({ firstName, lastName }) {
  return firstName + ' ' + lastName;
}
console.log(getFullName({ firstName: 'Alice', lastName: 'Smith', age: 25 }));
// "Alice Smith"
```

**4. 实际应用场景**

```javascript
// 1. 交换变量
let a = 1, b = 2;
[a, b] = [b, a];

// 2. 函数返回多个值
function getMinMax(arr) {
  return [Math.min(...arr), Math.max(...arr)];
}
const [min, max] = getMinMax([3, 1, 4, 1, 5, 9]);

// 3. 解构导入模块
import { useState, useEffect } from 'react';

// 4. 解构 Map
const map = new Map([['name', 'Alice'], ['age', 25]]);
for (const [key, value] of map) {
  console.log(key, value);
}

// 5. 忽略某些返回值
const [, second] = [10, 20, 30]; // 只取第二个

// 6. 嵌套函数参数
function config({
  server: { host, port },
  database: { name, user }
}) {
  console.log(host, port, name, user);
}

config({
  server: { host: 'localhost', port: 3306 },
  database: { name: 'test', user: 'root' }
});
```

**考点：** 解构赋值、数组解构、对象解构、默认值、剩余参数

---

---

### 题目18：请详细说明 Map 和 Set 的特点、API 及与普通对象和数组的区别。

**答案：**

**Map** 是一种键值对集合，与普通对象类似，但 key 可以是任意类型。**Set** 是一种值的集合，其中的值唯一，不重复。

**Map：**

```javascript
// 创建
const map = new Map();

// 添加键值对
map.set('name', 'Alice');
map.set(1, 'number key');
map.set(true, 'boolean key');
map.set({ id: 1 }, 'object key'); // 对象作为 key
map.set(NaN, 'NaN key');

// 获取值
map.get('name'); // "Alice"
map.get(1);      // "number key"
map.get(NaN);    // "NaN key" —— Map 中 NaN 等于 NaN

// 检查键是否存在
map.has('name'); // true

// 删除
map.delete('name'); // true

// 大小
map.size; // 4

// 清空
map.clear();

// 初始化
const map2 = new Map([
  ['name', 'Alice'],
  ['age', 25]
]);

// 遍历
for (const [key, value] of map2) {
  console.log(key, value);
}

map2.forEach((value, key) => {
  console.log(key, value);
});
```

**Set：**

```javascript
// 创建
const set = new Set([1, 2, 3, 2, 1]); // Set(3) {1, 2, 3}

// 添加值
set.add(4);
set.add(4); // 重复添加无效

// 检查值是否存在
set.has(2); // true

// 删除
set.delete(2); // true

// 大小
set.size; // 3

// 清空
set.clear();

// 数组去重
const arr = [1, 2, 3, 2, 1, 4];
const unique = [...new Set(arr)]; // [1, 2, 3, 4]

// 字符串去重
const str = 'hello';
const uniqueChars = [...new Set(str)].join(''); // "helo"

// 交集、并集、差集
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

const union = new Set([...a, ...b]);         // 并集 Set {1, 2, 3, 4}
const intersection = new Set([...a].filter(x => b.has(x))); // 交集 Set {2, 3}
const difference = new Set([...a].filter(x => !b.has(x))); // 差集 Set {1}

// 遍历
for (const value of set) {
  console.log(value);
}
set.forEach(value => {
  console.log(value);
});
```

**Map vs Object：**

| 特性 | Map | Object |
|------|-----|--------|
| 键的类型 | 任意类型 | 字符串或 Symbol |
| 键的顺序 | 按插入顺序排列 | 基本按插入顺序（整数键按升序） |
| 大小 | `map.size` | `Object.keys(obj).length` |
| 性能 | 频增删操作更优 | 静态数据更优 |
| 序列化 | 不支持 JSON | 支持 JSON |
| 原型链 | 无原型 | 有原型，需要注意 `toString` 等内置属性 |

**Set vs Array：**

| 特性 | Set | Array |
|------|-----|-------|
| 唯一性 | 自动去重 | 允许重复 |
| 查找 | `O(1)`（has） | `O(n)`（includes） |
| 插入 | `O(1)`（add） | `O(1)`（push） |
| 删除 | `O(1)`（delete） | `O(n)`（splice） |
| 有序性 | 按插入顺序 | 按索引顺序 |
| 索引访问 | 不支持 | 支持 |

**考点：** Map、Set、数据结构、去重、集合运算

---

---

### 题目19：请详细说明 Symbol 的作用和使用场景。

**答案：**

**Symbol** 是 ES6 引入的一种基本数据类型，表示**唯一的、不可变的值**。每个通过 `Symbol()` 创建的值都是独一无二的，即使描述相同也不相等。

**基本用法：**

```javascript
const s1 = Symbol('description');
const s2 = Symbol('description');
console.log(s1 === s2); // false —— 即使描述相同，也是不同的 Symbol

const s3 = Symbol();
console.log(typeof s3); // "symbol"

// Symbol 不能用 new 调用
// new Symbol(); // TypeError: Symbol is not a constructor
```

**Symbol 的使用场景：**

**1. 作为对象属性键，避免属性名冲突**

```javascript
const id = Symbol('id');
const user = {
  name: 'Alice',
  [id]: 12345
};

console.log(user[id]);    // 12345
console.log(user['id']);  // undefined —— Symbol 属性不能用点语法或字符串键访问

// Symbol 属性不会被 for...in、Object.keys() 遍历
for (const key in user) {
  console.log(key); // "name" —— 不包含 Symbol 属性
}

console.log(Object.keys(user)); // ["name"]

// 获取 Symbol 属性
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(id)]

// 获取所有属性（包括 Symbol）
console.log(Reflect.ownKeys(user)); // ["name", Symbol(id)]
```

**2. 消除魔术字符串**

```javascript
// 不使用 Symbol：魔术字符串容易出错
function handleAction(action) {
  switch (action) {
    case 'OPEN_MODAL': break;
    case 'CLOSE_MODAL': break;
    case 'SUBMIT_FORM': break;
  }
}

// 使用 Symbol：更安全
const Actions = {
  OPEN_MODAL: Symbol('OPEN_MODAL'),
  CLOSE_MODAL: Symbol('CLOSE_MODAL'),
  SUBMIT_FORM: Symbol('SUBMIT_FORM')
};

function handleAction(action) {
  switch (action) {
    case Actions.OPEN_MODAL: break;
    case Actions.CLOSE_MODAL: break;
    case Actions.SUBMIT_FORM: break;
  }
}
```

**3. 内置 Symbol（Well-known Symbols）**

JavaScript 内置了一些 Symbol 常量，用于自定义对象的行为：

```javascript
// Symbol.iterator —— 自定义迭代行为
const obj = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    let index = 0;
    const data = this.data;
    return {
      next() {
        return index < data.length
          ? { value: data[index++], done: false }
          : { value: undefined, done: true };
      }
    };
  }
};

for (const val of obj) {
  console.log(val); // 1, 2, 3
}

// Symbol.toPrimitive —— 自定义类型转换
const money = {
  amount: 100,
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') return '$' + this.amount;
    if (hint === 'number') return this.amount;
    return this.amount;
  }
};
console.log(String(money)); // "$100"
console.log(Number(money)); // 100
console.log(money + 50);    // 150

// Symbol.hasInstance —— 自定义 instanceof 行为
class Even {
  static [Symbol.hasInstance](num) {
    return typeof num === 'number' && num % 2 === 0;
  }
}
console.log(2 instanceof Even);  // true
console.log(3 instanceof Even);  // false

// 其他内置 Symbol
// Symbol.toStringTag —— 自定义 Object.prototype.toString 的标签
// Symbol.asyncIterator —— 异步迭代器
// Symbol.species —— 派生对象构造器
```

**4. Symbol.for() 和 Symbol.keyFor()**

```javascript
// Symbol.for() 在全局 Symbol 注册表中创建/查找 Symbol
const s1 = Symbol.for('shared');
const s2 = Symbol.for('shared');
console.log(s1 === s2); // true —— 同一个描述返回同一个 Symbol

// Symbol.keyFor() 获取全局 Symbol 的描述
console.log(Symbol.keyFor(s1)); // "shared"

// 注意：Symbol() 创建的不是全局 Symbol
const s3 = Symbol('local');
console.log(Symbol.keyFor(s3)); // undefined
```

**考点：** Symbol、唯一性、内置 Symbol、对象属性、迭代器

---

---

### 题目20：请详细说明 Proxy 和 Reflect 的作用和使用场景。

**答案：**

**Proxy** 是 ES6 引入的元编程特性，用于拦截和自定义对象的基本操作（如属性查找、赋值、枚举、函数调用等）。**Reflect** 是一个内置对象，提供了一系列与 Proxy 拦截器对应的方法，用于执行对象的默认行为。

**Proxy 基本用法：**

```javascript
const target = { name: 'Alice', age: 25 };

const proxy = new Proxy(target, {
  // 拦截属性读取
  get(target, property, receiver) {
    console.log(`读取属性：${property}`);
    return Reflect.get(target, property, receiver);
  },

  // 拦截属性设置
  set(target, property, value, receiver) {
    console.log(`设置属性：${property} = ${value}`);
    return Reflect.set(target, property, value, receiver);
  },

  // 拦截属性删除
  deleteProperty(target, property) {
    console.log(`删除属性：${property}`);
    return Reflect.deleteProperty(target, property);
  },

  // 拦截 in 操作符
  has(target, property) {
    console.log(`检查属性：${property}`);
    return Reflect.has(target, property);
  },

  // 拦截 Object.keys()
  ownKeys(target) {
    console.log('获取属性列表');
    return Reflect.ownKeys(target);
  },

  // 拦截 for...in 循环
  // ownKeys + getOwnPropertyDescriptor

  // 拦截函数调用（当 target 是函数时）
  apply(target, thisArg, args) {
    console.log(`调用函数，参数：${args}`);
    return Reflect.apply(target, thisArg, args);
  },

  // 拦截 new 操作
  construct(target, args, newTarget) {
    console.log(`new 操作，参数：${args}`);
    return Reflect.construct(target, args, newTarget);
  }
});

proxy.name;            // 读取属性：name => "Alice"
proxy.age = 26;        // 设置属性：age = 26
'name' in proxy;       // 检查属性：name => true
delete proxy.age;      // 删除属性：age
Object.keys(proxy);    // 获取属性列表
```

**实际应用场景：**

**1. 数据验证**

```javascript
function createValidator(target, rules) {
  return new Proxy(target, {
    set(target, property, value) {
      if (rules[property] && !rules[property](value)) {
        throw new TypeError(`属性 ${property} 的值 ${value} 不合法`);
      }
      target[property] = value;
      return true;
    }
  });
}

const rules = {
  age: v => typeof v === 'number' && v > 0 && v < 150,
  name: v => typeof v === 'string' && v.length > 0
};

const user = createValidator({}, rules);
user.name = 'Alice'; // OK
user.age = 25;       // OK
user.age = -1;       // TypeError: 属性 age 的值 -1 不合法
```

**2. 响应式数据（Vue 3 的核心原理）**

```javascript
function reactive(target, callback) {
  return new Proxy(target, {
    set(target, property, value, receiver) {
      const oldValue = target[property];
      const result = Reflect.set(target, property, value, receiver);
      if (oldValue !== value) {
        callback(property, value, oldValue);
      }
      return result;
    },

    deleteProperty(target, property) {
      const hadProperty = property in target;
      const result = Reflect.deleteProperty(target, property);
      if (hadProperty) {
        callback(property, undefined, target[property]);
      }
      return result;
    }
  });
}

const state = reactive({ count: 0, name: 'Alice' }, (key, newValue, oldValue) => {
  console.log(`属性 ${key} 从 ${oldValue} 变为 ${newValue}`);
});

state.count = 1; // 属性 count 从 0 变为 1
state.name = 'Bob'; // 属性 name 从 Alice 变为 Bob
```

**3. 实现私有属性**

```javascript
const privateData = new WeakMap();

function createPrivateObject(obj) {
  return new Proxy(obj, {
    get(target, property) {
      if (property.startsWith('_')) {
        throw new Error('私有属性不可访问');
      }
      return target[property];
    },
    set(target, property, value) {
      if (property.startsWith('_')) {
        throw new Error('私有属性不可设置');
      }
      target[property] = value;
      return true;
    }
  });
}

const obj = createPrivateObject({ name: 'Alice', _secret: 'hidden' });
console.log(obj.name);   // "Alice"
console.log(obj._secret); // Error: 私有属性不可访问
```

**Reflect 的作用：**

```javascript
// Reflect 提供了与 Object 操作对应的方法，返回值更合理
Reflect.get(obj, 'name');           // 等同于 obj.name
Reflect.set(obj, 'name', 'Bob');    // 等同于 obj.name = 'Bob'，返回 boolean
Reflect.has(obj, 'name');           // 等同于 'name' in obj
Reflect.deleteProperty(obj, 'name'); // 等同于 delete obj.name，返回 boolean
Reflect.ownKeys(obj);               // 等同于 Object.getOwnPropertyNames + GetOwnPropertySymbols
Reflect.apply(fn, thisArg, args);   // 等同于 fn.apply(thisArg, args)
Reflect.construct(Target, args);    // 等同于 new Target(...args)

// 与 Object 方法的区别
// Object.defineProperty 失败时抛出异常
// Reflect.defineProperty 失败时返回 false
try {
  Object.defineProperty({}, 'x', { value: 1 });
} catch (e) {
  console.log('失败');
}

const success = Reflect.defineProperty({}, 'x', { value: 1 });
if (!success) {
  console.log('失败');
}
```

**考点：** Proxy、Reflect、元编程、拦截器、Vue 3 响应式原理

---

---

### 题目21：请详细说明 CommonJS 和 ES Module 的区别。

**答案：**

**CommonJS** 是 Node.js 的模块规范，**ES Module（ESM）** 是 JavaScript 官方的模块标准（ES6 引入）。两者在语法、加载机制和运行时行为上有重要区别。

**语法区别：**

```javascript
// ===== CommonJS =====

// 导出
module.exports = {
  name: 'Alice',
  sayHello() {
    console.log('Hello');
  }
};

// 或者
exports.name = 'Alice';
exports.sayHello = function() {
  console.log('Hello');
};

// 导入
const module = require('./module');
const { name, sayHello } = require('./module');

// ===== ES Module =====

// 导出（命名导出）
export const name = 'Alice';
export function sayHello() {
  console.log('Hello');
}
export class Person {}

// 或者统一导出
const name = 'Alice';
function sayHello() { console.log('Hello'); }
export { name, sayHello };

// 默认导出
export default class Person {}

// 导入
import module from './module.js';           // 默认导入
import { name, sayHello } from './module.js'; // 命名导入
import * as module from './module.js';       // 全部导入
import Person, { name } from './module.js';  // 混合导入

// 动态导入（返回 Promise）
import('./module.js').then(module => {
  console.log(module);
});
```

**核心区别：**

| 特性 | CommonJS | ES Module |
|------|----------|-----------|
| 加载时机 | 运行时加载 | 编译时加载（静态分析） |
| 输出方式 | 值的拷贝（浅拷贝） | 值的引用（动态绑定） |
| 加载机制 | 同步加载 | 异步加载 |
| this | 指向 module.exports | 指向 undefined |
| 循环依赖 | 已执行的模块输出部分值 | 开发者需自行处理 |
| 顶层变量 | module, exports, require, __filename, __dirname | import, export |
| 动态导入 | 支持（require 可以在条件语句中使用） | 静态 import 不支持；动态 import() 支持 |
| Tree Shaking | 不支持 | 支持（静态分析可确定依赖） |

**值的拷贝 vs 值的引用：**

```javascript
// ===== CommonJS：值的拷贝 =====
// counter.js
let count = 0;
function increment() {
  count++;
}
module.exports = { count, increment };

// main.js
const counter = require('./counter');
console.log(counter.count); // 0
counter.increment();
console.log(counter.count); // 0 —— count 没有变化！因为导出的是值的拷贝

// ===== ES Module：值的引用 =====
// counter.js
export let count = 0;
export function increment() {
  count++;
}

// main.js
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1 —— count 实时更新！因为导出的是值的引用
```

**循环依赖处理：**

```javascript
// ===== CommonJS 循环依赖 =====
// a.js
const b = require('./b');
console.log('a.js 中 b.done =', b.done); // false —— b.js 还没执行完
exports.done = true;

// b.js
const a = require('./a');
console.log('b.js 中 a.done =', a.done); // undefined —— a.js 还没执行完
exports.done = true;

// main.js
const a = require('./a');
// 输出：
// b.js 中 a.done = undefined
// a.js 中 b.done = false

// ===== ES Module 循环依赖 =====
// ES Module 遇到循环依赖时，已解析的模块会返回其导出值的实时引用
// 但开发者需要确保在使用前模块已初始化完成
```

**ES Module 的注意事项：**
- ES Module 在浏览器中使用时，需要 `<script type="module">` 标签
- Node.js 中使用 ES Module 需要将文件扩展名改为 `.mjs`，或在 `package.json` 中设置 `"type": "module"`
- ES Module 中 `this` 在顶层指向 `undefined`（CommonJS 中指向 `module.exports`）
- import 语句会被提升到模块顶部

**考点：** CommonJS、ES Module、模块化、值拷贝与引用、循环依赖、Tree Shaking

---

---

### 题目22：请详细说明 WeakMap 和 WeakSet 的特点和使用场景。

**答案：**

**WeakMap** 和 **WeakSet** 分别是 Map 和 Set 的"弱引用"版本。它们的键（WeakMap）或值（WeakSet）必须是对象，并且是弱引用的，不会阻止垃圾回收器回收这些对象。

**WeakMap：**

```javascript
// 创建
const weakMap = new WeakMap();

let obj = { name: 'Alice' };
weakMap.set(obj, 'some data');

console.log(weakMap.get(obj)); // "some data"
console.log(weakMap.has(obj)); // true

weakMap.delete(obj); // true

// 键必须是对象
// weakMap.set('key', 'value'); // TypeError: Invalid value used as weak map key

// 没有遍历方法（因为弱引用，随时可能被回收）
// weakMap.size;    // undefined
// weakMap.keys();  // undefined
// weakMap.values(); // undefined
// weakMap.forEach(); // undefined
```

**WeakSet：**

```javascript
// 创建
const weakSet = new WeakSet();

let obj1 = { name: 'Alice' };
let obj2 = { name: 'Bob' };

weakSet.add(obj1);
weakSet.add(obj2);

console.log(weakSet.has(obj1)); // true

weakSet.delete(obj1); // true

// 值必须是对象
// weakSet.add(1); // TypeError: Invalid value used in weak set

// 同样没有遍历方法和 size 属性
```

**弱引用的意义：**

```javascript
// Map 的问题：强引用会阻止垃圾回收
const map = new Map();
let user = { name: 'Alice' };
map.set(user, 'data');
user = null; // user 被置为 null，但 Map 中仍然持有对原对象的引用
// 原对象不会被垃圾回收，造成内存泄漏

// WeakMap 的解决方案：弱引用不会阻止垃圾回收
const weakMap = new WeakMap();
let user2 = { name: 'Bob' };
weakMap.set(user2, 'data');
user2 = null; // user2 被置为 null，WeakMap 中不再持有强引用
// 原对象可以被垃圾回收，WeakMap 中对应的条目自动移除
```

**WeakMap 的使用场景：**

**1. 为 DOM 元素添加额外数据**

```javascript
// 为 DOM 元素绑定数据，元素被移除后数据自动回收
const elementData = new WeakMap();

function setupElement(el) {
  elementData.set(el, {
    clickCount: 0,
    lastClickTime: null
  });

  el.addEventListener('click', () => {
    const data = elementData.get(el);
    data.clickCount++;
    data.lastClickTime = Date.now();
  });
}

// 当 DOM 元素被移除后，WeakMap 中的数据会自动被垃圾回收
```

**2. 私有数据存储**

```javascript
const privateData = new WeakMap();

class Person {
  constructor(name, secret) {
    this.name = name;
    privateData.set(this, { secret });
  }

  getSecret() {
    return privateData.get(this).secret;
  }
}

const alice = new Person('Alice', 'my secret');
console.log(alice.getSecret()); // "my secret"
// alice 被回收后，privateData 中的对应条目也会被回收
```

**3. 缓存计算结果**

```javascript
const cache = new WeakMap();

function process(obj) {
  if (cache.has(obj)) {
    return cache.get(obj);
  }
  const result = expensiveComputation(obj);
  cache.set(obj, result);
  return result;
}
```

**WeakSet 的使用场景：**

**1. 标记对象**

```javascript
const processed = new WeakSet();

function processItem(item) {
  if (processed.has(item)) {
    return; // 已处理过
  }
  // 处理逻辑
  processed.add(item);
}
```

**2. 防止重复添加**

```javascript
const addedElements = new WeakSet();

function addElement(el) {
  if (addedElements.has(el)) {
    console.log('元素已添加');
    return;
  }
  addedElements.add(el);
  // 添加元素到容器
}
```

**Map/Set vs WeakMap/WeakSet 对比：**

| 特性 | Map / Set | WeakMap / WeakSet |
|------|-----------|-------------------|
| 引用类型 | 强引用 | 弱引用 |
| 键/值类型 | 任意类型 | 必须是对象 |
| 遍历 | 支持 | 不支持 |
| size 属性 | 有 | 无 |
| 垃圾回收 | 手动管理 | 自动回收 |
| 性能 | 适合大量数据 | 适合临时数据 |

**考点：** WeakMap、WeakSet、弱引用、垃圾回收、内存管理

---

---

### 题目23：for...in 和 for...of 有什么区别？

**答案：**

`for...in` 和 `for...of` 都用于遍历，但它们的遍历目标、遍历内容和机制完全不同。

**for...in：**
- 遍历对象的可枚举属性（包括继承的可枚举属性）
- 遍历的是**键（key）**，且键是**字符串**
- 主要用于遍历普通对象的属性

**for...of：**
- 遍历可迭代对象（实现了 `[Symbol.iterator]` 的对象）
- 遍历的是**值（value）**
- 主要用于遍历数组、Map、Set、字符串、arguments、NodeList 等

**详细对比：**

```javascript
// ===== for...in =====
const obj = { name: 'Alice', age: 25 };
for (const key in obj) {
  console.log(key);    // "name", "age" —— 键是字符串
  console.log(typeof key); // "string"
}

// ===== for...of =====
const arr = ['a', 'b', 'c'];
for (const value of arr) {
  console.log(value); // "a", "b", "c" —— 值
}

// for...of 不能遍历普通对象
// for (const value of obj) { } // TypeError: obj is not iterable

// 但可以用 for...in 遍历数组（不推荐）
for (const index in arr) {
  console.log(index); // "0", "1", "2" —— 字符串类型的索引
  console.log(typeof index); // "string"
}
```

**for...in 遍历数组的问题：**

```javascript
Array.prototype.customMethod = function() {};

const arr = ['a', 'b', 'c'];

for (const index in arr) {
  console.log(index); // "0", "1", "2", "customMethod" —— 会遍历到原型链上的属性
}

// 解决方案：使用 hasOwnProperty 过滤
for (const index in arr) {
  if (arr.hasOwnProperty(index)) {
    console.log(index); // "0", "1", "2"
  }
}

// 更好的方案：使用 for...of
for (const value of arr) {
  console.log(value); // "a", "b", "c" —— 不会遍历原型链上的属性
}
```

**for...of 支持的可迭代对象：**

```javascript
// 1. 数组
for (const value of [1, 2, 3]) {
  console.log(value); // 1, 2, 3
}

// 2. 字符串
for (const char of 'hello') {
  console.log(char); // "h", "e", "l", "l", "o"
}

// 3. Map
const map = new Map([['name', 'Alice'], ['age', 25]]);
for (const [key, value] of map) {
  console.log(key, value); // "name" "Alice", "age" 25
}

// 4. Set
const set = new Set([1, 2, 3]);
for (const value of set) {
  console.log(value); // 1, 2, 3
}

// 5. arguments
function foo() {
  for (const arg of arguments) {
    console.log(arg);
  }
}
foo(1, 2, 3); // 1, 2, 3

// 6. NodeList
// for (const node of document.querySelectorAll('div')) { ... }

// 7. Generator
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}
for (const value of gen()) {
  console.log(value); // 1, 2, 3
}
```

**使普通对象支持 for...of：**

```javascript
const obj = { name: 'Alice', age: 25 };

// 方式1：使用 Object.entries()
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value);
}

// 方式2：给对象添加 Symbol.iterator
obj[Symbol.iterator] = function() {
  const keys = Object.keys(this);
  let index = 0;
  return {
    next: () => {
      if (index < keys.length) {
        return { value: this[keys[index++]], done: false };
      }
      return { value: undefined, done: true };
    }
  };
};

for (const value of obj) {
  console.log(value); // "Alice", 25
}
```

**总结：**
- 遍历数组：优先使用 `for...of` 或 `forEach`、`map`
- 遍历对象属性：使用 `for...in`（配合 `hasOwnProperty`）或 `Object.keys()`/`Object.entries()`
- 遍历 Map/Set：使用 `for...of`

**考点：** for...in、for...of、可迭代对象、Symbol.iterator、遍历机制

---

---

### 题目24：请详细说明迭代器（Iterator）和生成器（Generator）的原理和使用场景。

**答案：**

**迭代器（Iterator）** 是一种统一的遍历机制，为各种数据结构提供统一的访问接口。任何实现了 `[Symbol.iterator]` 方法的对象都是可迭代对象。

**迭代器协议：**

1. **可迭代协议（Iterable Protocol）**：对象必须实现 `[Symbol.iterator]()` 方法，该方法返回一个迭代器对象
2. **迭代器协议（Iterator Protocol）**：迭代器对象必须实现 `next()` 方法，返回 `{ value, done }` 对象

```javascript
// 自定义迭代器
const iterable = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    let index = 0;
    const data = this.data;
    return {
      next() {
        if (index < data.length) {
          return { value: data[index++], done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

// 使用 for...of 遍历
for (const value of iterable) {
  console.log(value); // 1, 2, 3
}

// 手动使用迭代器
const iterator = iterable[Symbol.iterator]();
console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

**生成器（Generator）：**

生成器是 ES6 引入的一种特殊的函数，使用 `function*` 声明，可以通过 `yield` 暂停和恢复执行。生成器函数返回一个迭代器对象。

**基本用法：**

```javascript
function* generator() {
  console.log('开始');
  yield 1;
  console.log('暂停后恢复');
  yield 2;
  console.log('再次恢复');
  yield 3;
  console.log('结束');
}

const gen = generator();

console.log(gen.next()); // "开始" -> { value: 1, done: false }
console.log(gen.next()); // "暂停后恢复" -> { value: 2, done: false }
console.log(gen.next()); // "再次恢复" -> { value: 3, done: false }
console.log(gen.next()); // "结束" -> { value: undefined, done: true }
```

**生成器的进阶用法：**

```javascript
// 1. yield* —— 委托给另一个生成器
function* inner() {
  yield 'a';
  yield 'b';
}

function* outer() {
  yield 'start';
  yield* inner(); // 委托
  yield 'end';
}

for (const value of outer()) {
  console.log(value); // "start", "a", "b", "end"
}

// 2. next() 传参 —— 将值传回生成器
function* createIdGenerator() {
  let id = 0;
  while (true) {
    const reset = yield ++id;
    if (reset) id = 0;
  }
}

const idGen = createIdGenerator();
console.log(idGen.next());    // { value: 1, done: false }
console.log(idGen.next());    // { value: 2, done: false }
console.log(idGen.next(true)); // { value: 1, done: false } —— 传参 true，id 被重置
console.log(idGen.next());    // { value: 2, done: false }

// 3. return() —— 提前结束生成器
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const g = gen();
console.log(g.next()); // { value: 1, done: false }
console.log(g.return('end')); // { value: 'end', done: true }
console.log(g.next()); // { value: undefined, done: true }

// 4. throw() —— 在生成器内部抛出错误
function* gen() {
  try {
    yield 1;
    yield 2;
  } catch (e) {
    console.log('捕获错误：', e.message);
  }
  yield 3;
}

const g2 = gen();
console.log(g2.next()); // { value: 1, done: false }
console.log(g2.throw(new Error('出错了'))); // "捕获错误：出错了" -> { value: 3, done: false }
```

**实际应用场景：**

**1. 惰性求值（无限序列）**

```javascript
// 斐波那契数列
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
console.log(fib.next().value); // 0
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2
console.log(fib.next().value); // 3

// 取前 10 个
function take(n, iterable) {
  const result = [];
  for (const value of iterable) {
    result.push(value);
    if (result.length >= n) break;
  }
  return result;
}

console.log(take(10, fibonacci())); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

**2. 异步迭代器（async generator）**

```javascript
async function* fetchPages(url) {
  let page = 1;
  while (true) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();
    if (data.length === 0) return;
    yield data;
    page++;
  }
}

// 使用 for await...of
async function getAllData() {
  for await (const pageData of fetchPages('/api/items')) {
    console.log('收到数据：', pageData);
  }
}
```

**3. 实现异步流程控制**

```javascript
// 使用生成器实现类似 async/await 的效果
function run(gen) {
  const iterator = gen();

  function step(value) {
    const result = iterator.next(value);
    if (result.done) return result.value;
    return Promise.resolve(result.value).then(step);
  }

  return step();
}

run(function* () {
  const user = yield fetch('/api/user').then(r => r.json());
  const posts = yield fetch(`/api/posts?userId=${user.id}`).then(r => r.json());
  console.log(user, posts);
});
```

**考点：** 迭代器、生成器、Symbol.iterator、yield、惰性求值、异步迭代

---

---

### 题目25：请手写实现 new 操作符。

**答案：**

`new` 操作符做了以下几件事：
1. 创建一个新的空对象
2. 将这个空对象的原型指向构造函数的 `prototype`
3. 将构造函数的 `this` 绑定到这个新对象上，并执行构造函数
4. 如果构造函数返回一个对象，则返回该对象；否则返回新创建的对象

**手写实现：**

```javascript
function myNew(Constructor, ...args) {
  // 1. 判断 Constructor 是否为函数
  if (typeof Constructor !== 'function') {
    throw new TypeError('Constructor must be a function');
  }

  // 2. 创建新对象，并将其原型指向 Constructor.prototype
  // 方式1：使用 Object.create
  const obj = Object.create(Constructor.prototype);

  // 方式2：不使用 Object.create 的写法
  // function F() {}
  // F.prototype = Constructor.prototype;
  // const obj = new F();

  // 3. 执行构造函数，将 this 绑定到新对象
  const result = Constructor.apply(obj, args);

  // 4. 判断构造函数的返回值
  // 如果返回值是对象（非 null），则返回该对象
  // 否则返回新创建的对象
  return result !== null && (typeof result === 'object' || typeof result === 'function')
    ? result
    : obj;
}
```

**测试验证：**

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function() {
  console.log('Hello, ' + this.name);
};

// 使用原生 new
const p1 = new Person('Alice', 25);
console.log(p1.name);        // "Alice"
console.log(p1.age);         // 25
p1.sayHello();               // "Hello, Alice"
console.log(p1 instanceof Person); // true

// 使用手写 myNew
const p2 = myNew(Person, 'Bob', 30);
console.log(p2.name);        // "Bob"
console.log(p2.age);         // 30
p2.sayHello();               // "Hello, Bob"
console.log(p2 instanceof Person); // true
```

**边界情况测试：**

```javascript
// 1. 构造函数返回对象
function Factory() {
  this.name = 'default';
  return { name: 'custom' }; // 返回自定义对象
}

const f1 = new Factory();
console.log(f1.name); // "custom" —— 返回的是构造函数中的对象

const f2 = myNew(Factory);
console.log(f2.name); // "custom" —— 与原生 new 行为一致

// 2. 构造函数返回函数
function FuncFactory() {
  this.name = 'default';
  return function() { return 'function'; };
}

const ff1 = new FuncFactory();
console.log(typeof ff1); // "function"

const ff2 = myNew(FuncFactory);
console.log(typeof ff2); // "function"

// 3. 构造函数返回基本类型
function PrimitiveFactory() {
  this.name = 'default';
  return 42; // 返回基本类型，会被忽略
}

const pf1 = new PrimitiveFactory();
console.log(pf1.name); // "default"

const pf2 = myNew(PrimitiveFactory);
console.log(pf2.name); // "default"

// 4. 构造函数返回 null
function NullFactory() {
  this.name = 'default';
  return null; // null 不是对象，会被忽略
}

const nf1 = new NullFactory();
console.log(nf1.name); // "default"

const nf2 = myNew(NullFactory);
console.log(nf2.name); // "default"

// 5. 构造函数无参数
function NoArgs() {
  this.value = 42;
}

const na1 = new NoArgs();
console.log(na1.value); // 42

const na2 = myNew(NoArgs);
console.log(na2.value); // 42
```

**考点：** new 操作符、原型链、Object.create、apply、instanceof