## 第3章：JavaScript 基础（10 题）

### 题目1：JavaScript 有哪些数据类型？如何准确判断一个值的类型？

**答案：**

JavaScript 的数据类型分为两大类：**基本数据类型（原始类型）** 和 **引用数据类型**。

**基本数据类型（7 种）：**
- `Number`：数值，包括整数和浮点数，以及特殊值 `NaN`、`Infinity`、`-Infinity`
- `String`：字符串
- `Boolean`：布尔值 `true` / `false`
- `undefined`：未定义
- `null`：空值
- `Symbol`（ES6）：唯一的、不可变的数据类型
- `BigInt`（ES2020）：用于表示任意精度的整数

**引用数据类型（1 种）：**
- `Object`：对象，包括普通对象、数组、函数、正则、日期等

**类型判断方法：**

1. **`typeof`**：返回一个字符串表示操作数的类型

```javascript
typeof 123          // "number"
typeof 'hello'      // "string"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof null         // "object" —— 这是 JS 的历史 bug
typeof Symbol()     // "symbol"
typeof 42n          // "bigint"
typeof {}           // "object"
typeof []           // "object" —— 无法区分数组
typeof function(){} // "function"
```

> 注意：`typeof null` 返回 `"object"` 是 JavaScript 语言设计初期的 bug，至今未修复。`typeof` 能准确判断基本类型（除 `null` 外），也能判断函数，但无法区分数组和普通对象。

2. **`instanceof`**：检测构造函数的 `prototype` 是否出现在实例的原型链上

```javascript
[] instanceof Array    // true
{} instanceof Object   // true
/abc/ instanceof RegExp // true
```

> 缺点：只能判断引用类型，不能判断基本类型；且跨 iframe 场景下原型链断裂会失效。

3. **`Object.prototype.toString.call()`**：最准确的类型判断方式

```javascript
Object.prototype.toString.call(123)          // "[object Number]"
Object.prototype.toString.call('hello')      // "[object String]"
Object.prototype.toString.call(true)         // "[object Boolean]"
Object.prototype.toString.call(undefined)    // "[object Undefined]"
Object.prototype.toString.call(null)         // "[object Null]"
Object.prototype.toString.call(Symbol())     // "[object Symbol]"
Object.prototype.toString.call(42n)          // "[object BigInt]"
Object.prototype.toString.call({})           // "[object Object]"
Object.prototype.toString.call([])           // "[object Array]"
Object.prototype.toString.call(function(){}) // "[object Function]"
Object.prototype.toString.call(/abc/)        // "[object RegExp]"
Object.prototype.toString.call(new Date())   // "[object Date]"
```

4. **`Array.isArray()`**：专门用于判断数组

```javascript
Array.isArray([])     // true
Array.isArray({})     // false
```

**总结：** 日常开发中，`typeof` 用于判断基本类型和函数，`Array.isArray()` 判断数组，`Object.prototype.toString.call()` 作为万能方法处理复杂场景。

**考点：** 数据类型、typeof、instanceof、Object.prototype.toString

---

---

### 题目2：什么是闭包？闭包有哪些应用场景和注意事项？

**答案：**

**闭包（Closure）** 是指一个函数能够记住并访问它所在的词法作用域，即使这个函数在其词法作用域之外执行。简单来说，闭包就是**函数与其词法环境的组合**。

**闭包的本质：** 当一个内部函数被返回到外部并在外部调用时，它仍然可以访问外部函数的变量，因为内部函数持有对外部函数作用域的引用，导致外部函数的作用域不会被垃圾回收。

**经典示例：**

```javascript
function createCounter() {
  let count = 0; // 这个变量被闭包"捕获"

  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
console.log(counter.getCount());  // 1
```

**常见应用场景：**

1. **数据私有化 / 模拟私有变量**

```javascript
function Person(name) {
  let _name = name; // 私有变量

  return {
    getName() { return _name; },
    setName(newName) { _name = newName; }
  };
}
```

2. **函数柯里化**

```javascript
function add(a) {
  return function(b) {
    return a + b;
  };
}
const add5 = add(5);
console.log(add5(3)); // 8
```

3. **防抖和节流**（见题目10）

4. **模块模式**

```javascript
const module = (function() {
  let privateVar = 0;

  function privateMethod() {
    console.log('private');
  }

  return {
    publicMethod() {
      privateVar++;
      privateMethod();
    },
    getValue() {
      return privateVar;
    }
  };
})();
```

5. **循环中的闭包问题（经典面试题）**

```javascript
// 错误写法 —— 所有 setTimeout 回调共享同一个 i
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 3, 3, 3
  }, 1000);
}

// 解决方案1：使用 let（推荐）
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 0, 1, 2
  }, 1000);
}

// 解决方案2：使用 IIFE 创建闭包
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j); // 0, 1, 2
    }, 1000);
  })(i);
}
```

**注意事项：**
- **内存泄漏**：闭包会使得外部函数的变量一直存在于内存中，不会被垃圾回收。如果不再使用，应将引用设为 `null`。
- **性能**：闭包涉及作用域链的查找，过度使用可能影响性能。
- **调试困难**：闭包中的变量不容易被外部访问，调试时可能不太直观。

**考点：** 闭包、作用域链、词法作用域、内存管理

---

---

### 题目3：请详细解释 JavaScript 的原型链，并说明原型链的查找机制。

**答案：**

JavaScript 是基于原型的语言，每个对象都有一个内部属性 `[[Prototype]]`（可以通过 `__proto__` 或 `Object.getPrototypeOf()` 访问），指向它的原型对象。原型对象本身也是对象，也有自己的原型，这样就形成了一条**原型链（Prototype Chain）**，最终指向 `null`。

**核心关系：**

```javascript
function Person(name) {
  this.name = name;
}
Person.prototype.sayHello = function() {
  console.log('Hello, ' + this.name);
};

const p = new Person('Alice');

// 三角关系
console.log(p.__proto__ === Person.prototype);            // true
console.log(Person.prototype.constructor === Person);      // true
console.log(p.constructor === Person);                     // true（通过原型链查找到）

// 原型链的顶端
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__);                      // null
```

**原型链查找机制：**

当访问对象的某个属性或方法时，引擎会按照以下顺序查找：

1. 首先在对象自身（实例属性）上查找
2. 如果没找到，沿着 `__proto__` 到原型对象上查找
3. 如果还没找到，继续沿着原型链向上查找，直到 `Object.prototype`
4. 如果到 `Object.prototype` 仍未找到，返回 `undefined`（属性）或报 `TypeError`（方法）

```javascript
function Animal(name) {
  this.name = name;
}
Animal.prototype.type = '动物';

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.bark = function() {
  console.log('汪汪！');
};

const dog = new Dog('旺财', '柴犬');

console.log(dog.breed);    // "柴犬" —— 自身属性
console.log(dog.type);     // "动物" —— 来自 Animal.prototype
console.log(dog.toString); // [Function: toString] —— 来自 Object.prototype
console.log(dog.fly);      // undefined —— 原型链上不存在
```

**相关方法：**

```javascript
// 判断属性是否在自身上（不在原型链上）
dog.hasOwnProperty('name');    // true
dog.hasOwnProperty('type');    // false

// 判断对象是否是某个构造函数的实例（沿原型链查找）
dog instanceof Dog;    // true
dog instanceof Animal; // true
dog instanceof Object; // true

// 获取对象的所有可枚举属性（包括原型链上的）
Object.keys(dog);           // ["name", "breed"]
for (let key in dog) {
  console.log(key); // "name", "breed", "type", "bark"
}

// 获取对象自身的所有属性（包括不可枚举的）
Object.getOwnPropertyNames(dog); // ["name", "breed"]
```

**考点：** 原型链、__proto__、prototype、constructor、继承机制

---

---

### 题目4：请详细说明 this 的指向规则，以及在各种场景下 this 的值。

**答案：**

`this` 的值取决于函数的**调用方式**，而不是定义位置。可以分为以下几种情况：

**1. 默认绑定（全局调用）**

在非严格模式下，独立调用的函数中 `this` 指向全局对象（浏览器中是 `window`，Node.js 中是 `global`）；严格模式下 `this` 为 `undefined`。

```javascript
function foo() {
  console.log(this);
}
foo();           // 非严格模式：Window；严格模式：undefined

// 注意：严格模式下，如果函数是被直接调用的，this 为 undefined
// 但如果函数是作为对象的方法调用的，this 仍然指向该对象
```

**2. 隐式绑定（对象方法调用）**

当函数作为对象的方法调用时，`this` 指向该对象。

```javascript
const obj = {
  name: 'Alice',
  sayName() {
    console.log(this.name);
  }
};
obj.sayName(); // "Alice" —— this 指向 obj

// 隐式丢失：将方法赋值给变量后调用
const fn = obj.sayName;
fn(); // undefined —— this 不再指向 obj
```

**3. 隐式丢失的典型场景：回调函数**

```javascript
const obj = {
  name: 'Alice',
  sayName() {
    console.log(this.name);
  }
};

setTimeout(obj.sayName, 1000); // undefined —— 回调函数被当作普通函数调用

// 解决方案：使用箭头函数或 bind
setTimeout(() => obj.sayName(), 1000); // "Alice"
setTimeout(obj.sayName.bind(obj), 1000); // "Alice"
```

**4. 显式绑定（call / apply / bind）**

```javascript
function greet(greeting) {
  console.log(greeting + ', ' + this.name);
}

const person = { name: 'Bob' };

greet.call(person, 'Hello');      // "Hello, Bob"
greet.apply(person, ['Hi']);      // "Hi, Bob"
const boundGreet = greet.bind(person);
boundGreet('Hey');                // "Hey, Bob"
```

**5. new 绑定**

使用 `new` 调用构造函数时，`this` 指向新创建的实例。

```javascript
function Person(name) {
  this.name = name; // this 指向新创建的实例
}
const p = new Person('Alice');
console.log(p.name); // "Alice"
```

**6. 箭头函数中的 this**

箭头函数没有自己的 `this`，它的 `this` 继承自外层词法作用域中的 `this`，且一旦绑定不可更改（`call`、`apply`、`bind` 对箭头函数无效）。

```javascript
const obj = {
  name: 'Alice',
  sayName: () => {
    console.log(this.name); // this 不是 obj，而是外层的 this
  },
  sayNameRegular() {
    const inner = () => {
      console.log(this.name); // this 继承自 sayNameRegular 的 this，即 obj
    };
    inner();
  }
};

obj.sayName();        // undefined（外层 this 可能是 window）
obj.sayNameRegular(); // "Alice"
```

**7. DOM 事件处理函数中的 this**

```javascript
const btn = document.getElementById('btn');
btn.addEventListener('click', function() {
  console.log(this); // 指向触发事件的 DOM 元素（btn）
});

btn.addEventListener('click', () => {
  console.log(this); // 指向外层 this（通常是 window 或 undefined）
});
```

**8. 类（Class）中的 this**

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }

  // 普通方法：this 取决于调用方式
  sayName() {
    console.log(this.name);
  }

  // 箭头函数属性：this 绑定到实例
  sayNameArrow = () => {
    console.log(this.name);
  };
}

const p = new Person('Alice');
const { sayName } = p;
sayName(); // undefined —— 方法被提取后 this 丢失

const { sayNameArrow } = p;
sayNameArrow(); // "Alice" —— 箭头函数的 this 已绑定
```

**优先级总结：** `new 绑定` > `显式绑定（bind）` > `隐式绑定` > `默认绑定`

**考点：** this 指向、call/apply/bind、箭头函数、优先级

---

---

### 题目5：请详细解释 JavaScript 的事件循环（Event Loop）机制。

**答案：**

JavaScript 是**单线程**语言，为了不阻塞主线程，采用事件循环机制来实现异步操作。事件循环是 JavaScript 运行时的核心机制，负责执行代码、收集和处理事件、执行队列中的子任务。

**核心概念：**

1. **调用栈（Call Stack）**：代码执行的地方，遵循后进先出（LIFO）原则
2. **任务队列（Task Queue）**：存放异步操作的回调
3. **微任务队列（Microtask Queue）**：存放微任务
4. **宏任务队列（Macrotask Queue）**：存放宏任务

**宏任务（Macrotask）：**
- `setTimeout` / `setInterval`
- `I/O 操作
- UI 渲染
- `setImmediate`（Node.js）
- `requestAnimationFrame`（浏览器）

**微任务（Microtask）：**
- `Promise.then/catch/finally`
- `MutationObserver`
- `process.nextTick`（Node.js，优先级高于其他微任务）
- `queueMicrotask()`

**事件循环执行流程：**

1. 执行同步代码（这些代码属于宏任务）
2. 调用栈清空后，检查微任务队列，**依次执行所有微任务**（直到微任务队列为空）
3. 微任务全部执行完毕后，开始渲染（如果需要）
4. 取出宏任务队列中的**第一个**宏任务执行
5. 执行完毕后再次清空微任务队列
6. 重复步骤 3-5

**经典面试题：**

```javascript
console.log('1'); // 同步

setTimeout(() => {
  console.log('2'); // 宏任务
  Promise.resolve().then(() => {
    console.log('3'); // 微任务（在宏任务2中产生）
  });
}, 0);

Promise.resolve().then(() => {
  console.log('4'); // 微任务
  setTimeout(() => {
    console.log('5'); // 宏任务（在微任务4中产生）
  }, 0);
});

console.log('6'); // 同步

// 输出顺序：1, 6, 4, 2, 3, 5
```

**详细解析：**
1. 执行同步代码：输出 `1`
2. 遇到 `setTimeout`，回调放入宏任务队列
3. 遇到 `Promise.resolve().then()`，回调放入微任务队列
4. 执行同步代码：输出 `6`
5. 调用栈清空，开始执行微任务：输出 `4`；在微任务中又产生一个 `setTimeout`，放入宏任务队列
6. 微任务队列清空，取第一个宏任务执行：输出 `2`；在宏任务中又产生一个 `Promise`，放入微任务队列
7. 执行微任务：输出 `3`
8. 取下一个宏任务执行：输出 `5`

**更复杂的例子：**

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');

// 输出顺序：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

> 注意：`await` 之后的代码相当于放在 `Promise.then()` 的回调中，是微任务。

**考点：** 事件循环、宏任务、微任务、异步编程、执行顺序

---

---

### 题目6：var、let、const 有什么区别？

**答案：**

`var`、`let`、`const` 都用于声明变量，但它们在作用域、变量提升、重复声明和重新赋值等方面有重要区别。

| 特性 | `var` | `let` | `const` |
|------|-------|-------|---------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 提升（初始化为 `undefined`） | 提升（但不初始化，存在暂时性死区） | 提升（但不初始化，存在暂时性死区） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 全局声明 | 挂载到 `window` 上 | 不挂载到 `window` | 不挂载到 `window` |

**1. 作用域区别**

```javascript
// var 是函数作用域
function testVar() {
  if (true) {
    var x = 1;
  }
  console.log(x); // 1 —— var 不受块级作用域限制
}

// let/const 是块级作用域
function testLet() {
  if (true) {
    let y = 1;
    const z = 2;
  }
  console.log(y); // ReferenceError: y is not defined
  console.log(z); // ReferenceError: z is not defined
}
```

**2. 变量提升**

```javascript
console.log(a); // undefined —— var 声明的变量被提升，但值为 undefined
var a = 1;

console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 2;      // 暂时性死区（TDZ）：从块作用域开始到 let 声明语句之间，变量不可访问

console.log(c); // ReferenceError: Cannot access 'c' before initialization
const c = 3;    // 同样存在暂时性死区
```

**3. 重复声明**

```javascript
var a = 1;
var a = 2;     // 允许，a 被覆盖为 2

let b = 1;
let b = 2;     // SyntaxError: Identifier 'b' has already been declared

const c = 1;
const c = 2;   // SyntaxError: Identifier 'c' has already been declared
```

**4. const 的特性**

```javascript
const obj = { name: 'Alice' };
obj.name = 'Bob';       // 允许！修改对象属性不会报错
obj = { name: 'Bob' };  // TypeError: Assignment to constant variable

const arr = [1, 2, 3];
arr.push(4);            // 允许！修改数组内容不会报错
arr = [4, 5, 6];        // TypeError: Assignment to constant variable
```

> `const` 保证的是**变量绑定（内存地址）不可变**，而不是值不可变。如果声明的是基本类型，值确实不可变；如果声明的是引用类型，对象的属性仍然可以修改。要使对象不可变，可以使用 `Object.freeze()`。

**5. 全局声明**

```javascript
var globalVar = 'hello';
console.log(window.globalVar); // "hello" —— 挂载到 window 上

let globalLet = 'world';
console.log(window.globalLet); // undefined —— 不挂载到 window 上
```

**最佳实践：**
- 默认使用 `const`，只有需要重新赋值时才使用 `let`
- 避免使用 `var`，防止变量提升和作用域问题带来的 bug

**考点：** 作用域、变量提升、暂时性死区、块级作用域

---

---

### 题目7：请详细解释 Promise 的原理、API 及常见用法。

**答案：**

**Promise** 是 JavaScript 中处理异步操作的一种方案，表示一个异步操作的最终完成（或失败）及其结果值。

**三种状态：**
- `pending`（进行中）：初始状态
- `fulfilled`（已成功）：操作成功完成
- `rejected`（已失败）：操作失败

状态一旦改变就**不可逆**：`pending` -> `fulfilled` 或 `pending` -> `rejected`。

**基本用法：**

```javascript
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('操作成功'); // 将状态从 pending 变为 fulfilled
    } else {
      reject('操作失败');  // 将状态从 pending 变为 rejected
    }
  }, 1000);
});

promise
  .then(value => {
    console.log(value); // "操作成功"
    return '处理后的值';
  })
  .then(value => {
    console.log(value); // "处理后的值"
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    console.log('无论成功失败都会执行');
  });
```

**核心 API：**

1. **`Promise.all()`**：所有 Promise 都成功才成功，有一个失败就失败

```javascript
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then(values => console.log(values)); // [1, 2, 3]

// 有一个失败的情况
Promise.all([p1, p2, Promise.reject('error')])
  .then(values => console.log(values))
  .catch(err => console.log(err)); // "error"
```

2. **`Promise.race()`**：返回最先改变状态的 Promise 的结果

```javascript
const fast = new Promise(resolve => setTimeout(() => resolve('快'), 100));
const slow = new Promise(resolve => setTimeout(() => resolve('慢'), 500));

Promise.race([fast, slow])
  .then(value => console.log(value)); // "快"
```

3. **`Promise.allSettled()`**：等待所有 Promise 完成（无论成功失败），返回每个 Promise 的结果

```javascript
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then(results => {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'error' },
  //   { status: 'fulfilled', value: 3 }
  // ]
});
```

4. **`Promise.any()`**：返回最先成功的 Promise，全部失败才失败

```javascript
Promise.any([
  Promise.reject('error1'),
  Promise.resolve('success'),
  Promise.reject('error2')
]).then(value => console.log(value)); // "success"
```

5. **`Promise.resolve()` / `Promise.reject()`**：快速创建已解决/已拒绝的 Promise

```javascript
Promise.resolve(42).then(v => console.log(v)); // 42
Promise.reject('err').catch(e => console.log(e)); // "err"
```

**手写简易 Promise：**

```javascript
class MyPromise {
  constructor(executor) {
    this.status = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status === 'pending') {
        this.status = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.status === 'pending') {
        this.status = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason; };

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === 'fulfilled') {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            resolve(x);
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this.status === 'rejected') {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            resolve(x);
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this.status === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onFulfilled(this.value);
              resolve(x);
            } catch (e) {
              reject(e);
            }
          });
        });
        this.onRejectedCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onRejected(this.reason);
              resolve(x);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });

    return promise2;
  }
}
```

**考点：** Promise、异步编程、状态机、链式调用、Promise API

---

---

### 题目8：async/await 的原理是什么？与 Promise 有什么关系？

**答案：**

`async/await` 是 ES2017 引入的语法糖，用于简化 Promise 的异步操作写法，使异步代码看起来像同步代码。

**基本用法：**

```javascript
// Promise 写法
function fetchUser() {
  return fetch('/api/user')
    .then(response => response.json())
    .then(user => {
      return fetch(`/api/posts?userId=${user.id}`)
        .then(response => response.json())
        .then(posts => ({ user, posts }));
    });
}

// async/await 写法 —— 更清晰
async function fetchUser() {
  const response = await fetch('/api/user');
  const user = await response.json();
  const postsResponse = await fetch(`/api/posts?userId=${user.id}`);
  const posts = await postsResponse.json();
  return { user, posts };
}
```

**核心原理：**

`async/await` 本质上是 Promise + Generator 的语法糖。编译器会将 `async` 函数转换为一个自动执行的 Generator，`await` 相当于 `yield`。

转换原理（简化版）：

```javascript
// async/await 写法
async function foo() {
  const a = await Promise.resolve(1);
  const b = await Promise.resolve(2);
  return a + b;
}

// 等价的 Promise 写法
function foo() {
  return Promise.resolve().then(() => {
    return Promise.resolve(1).then(a => {
      return Promise.resolve(2).then(b => {
        return a + b;
      });
    });
  });
}
```

**关键特性：**

1. **async 函数总是返回 Promise**

```javascript
async function foo() {
  return 42;
}
foo().then(v => console.log(v)); // 42

async function bar() {
  throw new Error('出错了');
}
bar().catch(e => console.log(e.message)); // "出错了"
```

2. **await 只能在 async 函数中使用**（模块顶层除外，ES2022 支持顶层 await）

```javascript
// ES2022 之前：await 只能在 async 函数中使用
// ES2022+：支持顶层 await（在 ES Module 中）
// module.js
const data = await fetch('/api/data').then(r => r.json());
```

3. **await 的执行顺序**

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end'); // 这行是微任务
}

async function async2() {
  console.log('async2');
}

console.log('script start');
async1();
console.log('script end');

// 输出：
// script start
// async1 start
// async2
// script end
// async1 end
```

> `await` 之后的代码会被放入微任务队列，类似于 `.then()` 回调。

4. **错误处理**

```javascript
// 方式1：try/catch
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('请求失败：', error);
    throw error;
  }
}

// 方式2：.catch()
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}
fetchData().catch(error => console.error('请求失败：', error));
```

5. **并发执行**

```javascript
// 错误：串行执行，耗时较长
async function loadAll() {
  const user = await fetchUser();      // 等待 1s
  const posts = await fetchPosts();    // 再等待 1s，总共 2s
  return { user, posts };
}

// 正确：并行执行
async function loadAll() {
  const [user, posts] = await Promise.all([
    fetchUser(),   // 同时发起
    fetchPosts()   // 同时发起
  ]); // 总共只需 1s
  return { user, posts };
}
```

**考点：** async/await、Promise、Generator、微任务、并发控制

---

---

### 题目9：什么是深拷贝和浅拷贝？如何实现深拷贝？

**答案：**

**浅拷贝（Shallow Copy）** 只复制对象的第一层属性，如果属性值是引用类型，则复制的是引用（地址），新旧对象共享同一块内存。

**深拷贝（Deep Copy）** 会递归复制对象的所有层级，新旧对象完全独立，互不影响。

**浅拷贝的实现方式：**

```javascript
const original = { name: 'Alice', hobbies: ['reading', 'coding'] };

// 1. Object.assign()
const shallow1 = Object.assign({}, original);
shallow1.name = 'Bob';
shallow1.hobbies.push('gaming');
console.log(original.name);    // "Alice" —— 基本类型不受影响
console.log(original.hobbies); // ["reading", "coding", "gaming"] —— 引用类型被修改

// 2. 展开运算符（Spread）
const shallow2 = { ...original };

// 3. Array.prototype.slice() / concat() —— 仅适用于数组
const arr = [1, [2, 3]];
const shallowArr = arr.slice();
shallowArr[1].push(4);
console.log(arr[1]); // [2, 3, 4] —— 嵌套数组被修改
```

**深拷贝的实现方式：**

1. **`JSON.parse(JSON.stringify())`** —— 最简单但有局限性

```javascript
const obj = {
  name: 'Alice',
  date: new Date(),
  regex: /abc/g,
  fn: function() {},
  undef: undefined,
  sym: Symbol('id'),
  nested: { arr: [1, 2, 3] }
};

const deepCopy = JSON.parse(JSON.stringify(obj));
console.log(deepCopy);
// { name: 'Alice', date: '2024-01-01T00:00:00.000Z', nested: { arr: [1, 2, 3] } }
// 缺点：
// - 函数、undefined、Symbol 丢失
// - Date 变成字符串
// - RegExp 变成空对象
// - 循环引用会报错
// - NaN、Infinity 变成 null
// - Map、Set 变成空对象
```

2. **手写递归深拷贝**

```javascript
function deepClone(obj, map = new WeakMap()) {
  // 处理基本类型和 null/undefined
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理循环引用
  if (map.has(obj)) {
    return map.get(obj);
  }

  // 处理日期
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // 处理正则
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // 处理 Map
  if (obj instanceof Map) {
    const copy = new Map();
    map.set(obj, copy);
    obj.forEach((value, key) => {
      copy.set(deepClone(key, map), deepClone(value, map));
    });
    return copy;
  }

  // 处理 Set
  if (obj instanceof Set) {
    const copy = new Set();
    map.set(obj, copy);
    obj.forEach(value => {
      copy.add(deepClone(value, map));
    });
    return copy;
  }

  // 处理数组
  if (Array.isArray(obj)) {
    const copy = [];
    map.set(obj, copy);
    obj.forEach((item, index) => {
      copy[index] = deepClone(item, map);
    });
    return copy;
  }

  // 处理普通对象
  const copy = Object.create(Object.getPrototypeOf(obj));
  map.set(obj, copy);

  // 复制 Symbol 属性
  const symbolKeys = Object.getOwnPropertySymbols(obj);
  symbolKeys.forEach(key => {
    copy[key] = deepClone(obj[key], map);
  });

  // 复制普通属性（包括不可枚举属性）
  Reflect.ownKeys(obj).forEach(key => {
    if (key !== '__proto__') {
      copy[key] = deepClone(obj[key], map);
    }
  });

  return copy;
}
```

3. **`structuredClone()`** —— Web API（现代浏览器和 Node.js 17+）

```javascript
const obj = {
  name: 'Alice',
  date: new Date(),
  nested: { arr: [1, 2, 3] },
  map: new Map([['key', 'value']])
};

const cloned = structuredClone(obj);
// 支持大部分类型，但不支持函数、DOM 节点、Symbol 属性等
```

**考点：** 深拷贝、浅拷贝、递归、WeakMap、循环引用

---

---

### 题目10：请手写实现防抖（debounce）和节流（throttle）函数。

**答案：**

**防抖（Debounce）**：事件触发后延迟执行回调，如果在延迟时间内再次触发，则重新计时。适用于搜索框输入、窗口 resize 等场景。

```javascript
/**
 * 防抖函数
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @param {boolean} immediate - 是否立即执行（首次触发时）
 * @returns {Function} 防抖处理后的函数
 */
function debounce(fn, delay = 300, immediate = false) {
  let timer = null;

  const debounced = function(...args) {
    // 清除上一次的定时器
    if (timer) clearTimeout(timer);

    if (immediate) {
      // 立即执行模式
      const callNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, delay);
      if (callNow) {
        fn.apply(this, args);
      }
    } else {
      // 延迟执行模式
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    }
  };

  // 取消防抖
  debounced.cancel = function() {
    clearTimeout(timer);
    timer = null;
  };

  return debounced;
}

// 使用示例
const searchInput = document.getElementById('search');
const handleSearch = debounce(function(e) {
  console.log('搜索：', e.target.value);
  // 发送 AJAX 请求
}, 500);

searchInput.addEventListener('input', handleSearch);

// 取消防抖
// handleSearch.cancel();
```

**节流（Throttle）**：在一定时间间隔内只执行一次回调。适用于滚动事件、按钮重复点击等场景。

```javascript
/**
 * 节流函数（时间戳版）
 * @param {Function} fn - 需要节流的函数
 * @param {number} interval - 时间间隔（毫秒）
 * @returns {Function} 节流处理后的函数
 */
function throttle(fn, interval = 300) {
  let lastTime = 0;

  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 节流函数（定时器版）
 * 特点：第一次触发不会立即执行，停止触发后还会执行一次
 */
function throttleTimer(fn, interval = 300) {
  let timer = null;

  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, interval);
    }
  };
}

/**
 * 节流函数（时间戳 + 定时器结合版）
 * 特点：首次触发立即执行，停止触发后还会执行一次
 */
function throttleCombined(fn, interval = 300) {
  let lastTime = 0;
  let timer = null;

  return function(...args) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);

    if (remaining <= 0) {
      // 距离上次执行已超过间隔时间，立即执行
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(this, args);
    } else if (!timer) {
      // 设置定时器，确保最后一次触发也能执行
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

// 使用示例
const handleScroll = throttle(function() {
  console.log('滚动位置：', window.scrollY);
}, 200);

window.addEventListener('scroll', handleScroll);
```

**防抖 vs 节流对比：**

| 特性 | 防抖 | 节流 |
|------|------|------|
| 执行时机 | 事件停止触发后执行 | 每隔固定时间执行一次 |
| 触发次数 | 事件停止后执行 1 次 | 事件持续期间可能执行多次 |
| 典型场景 | 搜索框输入、表单验证 | 滚动加载、按钮防重复点击 |
| 效果 | 高频事件变为低频 | 高频事件降频 |

**考点：** 防抖、节流、闭包、定时器、this 指向、性能优化

---