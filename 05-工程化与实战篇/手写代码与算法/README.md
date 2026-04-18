## 第12章：手写代码与算法（5 题）

### 题目36：数组去重多种方式

**答案：**

```javascript
const arr = [1, 2, 3, 2, 1, 4, 5, 4, NaN, NaN];

// 1. Set（最简单，推荐）
const unique1 = [...new Set(arr)];
// [1, 2, 3, 4, 5, NaN]

// 2. filter + indexOf
const unique2 = arr.filter((item, index) => arr.indexOf(item) === index);
// 注意：无法正确处理NaN

// 3. reduce + includes
const unique3 = arr.reduce((acc, cur) => {
    if (!acc.includes(cur)) acc.push(cur);
    return acc;
}, []);

// 4. Map（可以处理NaN）
const unique4 = [...new Map(arr.map(item => [item, item])).values()];

// 5. 对象键值对（仅适用于基本类型）
const unique5 = Object.keys(arr.reduce((acc, cur) => {
    acc[cur] = true;
    return acc;
}, {})).map(Number);

// 6. 双重for循环
function unique6(arr) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        let isDuplicate = false;
        for (let j = 0; j < result.length; j++) {
            if (arr[i] === result[j]) { isDuplicate = true; break; }
        }
        if (!isDuplicate) result.push(arr[i]);
    }
    return result;
}

// 7. 排序后去重
function unique7(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const result = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1]) result.push(sorted[i]);
    }
    return result;
}

// 8. 对象数组去重（根据某个属性）
const users = [
    { id: 1, name: '张三' },
    { id: 2, name: '李四' },
    { id: 1, name: '张三' }
];
const uniqueUsers = [...new Map(users.map(item => [item.id, item])).values()];
```

**各方式对比：**

| 方式 | 时间复杂度 | 是否处理NaN | 适用场景 |
|------|-----------|------------|----------|
| Set | O(n) | 是 | 基本类型（推荐） |
| filter+indexOf | O(n^2) | 否 | 简单场景 |
| reduce+includes | O(n^2) | 否 | 简单场景 |
| Map | O(n) | 是 | 基本类型 |
| 双重for循环 | O(n^2) | 否 | 面试手写 |

**考点：** 数组去重、Set、Map、时间复杂度、边界情况（NaN）

---

---

### 题目37：手写防抖节流

**答案：**

**1. 防抖（Debounce）**

事件触发后等待一段时间再执行，如果在等待期间再次触发则重新计时。

```javascript
function debounce(fn, delay = 300) {
    let timer = null;
    return function (...args) {
        // 每次触发时清除上一次的定时器
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
            timer = null;
        }, delay);
    };
}

// 使用
const handleSearch = debounce((keyword) => {
    console.log('搜索：', keyword);
    fetch(`/api/search?keyword=${keyword}`);
}, 500);

input.addEventListener('input', (e) => handleSearch(e.target.value));
```

**防抖的进阶版本（立即执行 + 取消功能）：**

```javascript
function debounce(fn, delay = 300, immediate = false) {
    let timer = null;

    const debounced = function (...args) {
        if (timer) clearTimeout(timer);

        if (immediate) {
            // 立即执行模式：第一次触发时立即执行
            const callNow = !timer;
            timer = setTimeout(() => { timer = null; }, delay);
            if (callNow) fn.apply(this, args);
        } else {
            timer = setTimeout(() => {
                fn.apply(this, args);
                timer = null;
            }, delay);
        }
    };

    debounced.cancel = () => {
        if (timer) { clearTimeout(timer); timer = null; }
    };

    return debounced;
}
```

**2. 节流（Throttle）**

事件在指定时间间隔内只执行一次。

```javascript
// 方式1：时间戳
function throttle(fn, interval = 300) {
    let lastTime = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastTime >= interval) {
            fn.apply(this, args);
            lastTime = now;
        }
    };
}

// 方式2：定时器
function throttle(fn, interval = 300) {
    let timer = null;
    return function (...args) {
        if (!timer) {
            timer = setTimeout(() => {
                fn.apply(this, args);
                timer = null;
            }, interval);
        }
    };
}

// 方式3：时间戳 + 定时器（首次立即执行，最后一次也执行）
function throttle(fn, interval = 300) {
    let lastTime = 0;
    let timer = null;

    return function (...args) {
        const now = Date.now();
        const remaining = interval - (now - lastTime);

        if (remaining <= 0) {
            if (timer) { clearTimeout(timer); timer = null; }
            fn.apply(this, args);
            lastTime = now;
        } else if (!timer) {
            timer = setTimeout(() => {
                fn.apply(this, args);
                lastTime = Date.now();
                timer = null;
            }, remaining);
        }
    };
}

// 使用
const handleScroll = throttle(() => {
    console.log('滚动位置：', window.scrollY);
}, 200);

window.addEventListener('scroll', handleScroll);
```

**3. 防抖 vs 节流对比**

| 对比项 | 防抖 | 节流 |
|--------|------|------|
| 行为 | 等待一段时间后执行一次 | 每隔一段时间执行一次 |
| 适用场景 | 搜索输入、窗口resize | 滚动事件、按钮重复点击 |
| 效果 | 减少执行次数到最少 | 保证固定频率执行 |

**考点：** 防抖节流原理、手写实现、应用场景、进阶版本

---

---

### 题目38：手写深拷贝

**答案：**

```javascript
function deepClone(obj, hash = new WeakMap()) {
    // 1. 基本类型直接返回
    if (obj === null || typeof obj !== 'object') return obj;

    // 2. 处理日期
    if (obj instanceof Date) return new Date(obj);

    // 3. 处理正则
    if (obj instanceof RegExp) return new RegExp(obj);

    // 4. 处理Map
    if (obj instanceof Map) {
        const clone = new Map();
        obj.forEach((value, key) => {
            clone.set(deepClone(key, hash), deepClone(value, hash));
        });
        return clone;
    }

    // 5. 处理Set
    if (obj instanceof Set) {
        const clone = new Set();
        obj.forEach((value) => {
            clone.add(deepClone(value, hash));
        });
        return clone;
    }

    // 6. 处理循环引用
    if (hash.has(obj)) return hash.get(obj);

    // 7. 处理数组和对象
    const clone = Array.isArray(obj) ? [] : {};
    hash.set(obj, clone); // 存入hash，解决循环引用

    // 8. 拷贝Symbol属性
    const allKeys = [
        ...Object.keys(obj),
        ...Object.getOwnPropertySymbols(obj)
    ];

    allKeys.forEach((key) => {
        clone[key] = deepClone(obj[key], hash);
    });

    return clone;
}

// 测试
const obj = {
    name: '张三',
    age: 25,
    hobbies: ['reading', 'coding'],
    address: { city: '北京', district: '海淀' },
    date: new Date(),
    regex: /abc/g,
    map: new Map([['key1', 'value1']]),
    set: new Set([1, 2, 3]),
    func: function () { return this.name; },
    [Symbol('id')]: 123
};
obj.self = obj; // 循环引用

const cloned = deepClone(obj);
console.log(cloned !== obj); // true
console.log(cloned.address !== obj.address); // true
console.log(cloned.self === cloned); // true（循环引用正确处理）
```

**structuredClone（现代浏览器原生API）：**

```javascript
const cloned = structuredClone(obj); // 浏览器原生深拷贝
```

**考点：** 深拷贝实现、循环引用、特殊类型处理、WeakMap

---

---

### 题目39：手写Promise

**答案：**

```javascript
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    constructor(executor) {
        this.status = PENDING;
        this.value = undefined;
        this.reason = undefined;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];

        const resolve = (value) => {
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;
                this.onFulfilledCallbacks.forEach((fn) => fn());
            }
        };

        const reject = (reason) => {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = reason;
                this.onRejectedCallbacks.forEach((fn) => fn());
            }
        };

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    then(onFulfilled, onRejected) {
        // 参数校验，确保是函数
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
        onRejected = typeof onRejected === 'function' ? onRejected : (reason) => { throw reason; };

        const promise2 = new MyPromise((resolve, reject) => {
            if (this.status === FULFILLED) {
                queueMicrotask(() => {
                    try {
                        const x = onFulfilled(this.value);
                        this.resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            } else if (this.status === REJECTED) {
                queueMicrotask(() => {
                    try {
                        const x = onRejected(this.reason);
                        this.resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            } else {
                // pending状态，将回调存入队列
                this.onFulfilledCallbacks.push(() => {
                    queueMicrotask(() => {
                        try {
                            const x = onFulfilled(this.value);
                            this.resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    });
                });
                this.onRejectedCallbacks.push(() => {
                    queueMicrotask(() => {
                        try {
                            const x = onRejected(this.reason);
                            this.resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    });
                });
            }
        });

        return promise2;
    }

    resolvePromise(promise2, x, resolve, reject) {
        if (promise2 === x) {
            return reject(new TypeError('Chaining cycle detected'));
        }
        if (x instanceof MyPromise) {
            x.then(resolve, reject);
        } else {
            resolve(x);
        }
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }

    finally(callback) {
        return this.then(
            (value) => MyPromise.resolve(callback()).then(() => value),
            (reason) => MyPromise.resolve(callback()).then(() => { throw reason; })
        );
    }

    static resolve(value) {
        if (value instanceof MyPromise) return value;
        return new MyPromise((resolve) => resolve(value));
    }

    static reject(reason) {
        return new MyPromise((_, reject) => reject(reason));
    }

    static all(promises) {
        return new MyPromise((resolve, reject) => {
            const results = [];
            let count = 0;
            promises.forEach((promise, index) => {
                MyPromise.resolve(promise).then((value) => {
                    results[index] = value;
                    count++;
                    if (count === promises.length) resolve(results);
                }, reject);
            });
        });
    }

    static race(promises) {
        return new MyPromise((resolve, reject) => {
            promises.forEach((promise) => {
                MyPromise.resolve(promise).then(resolve, reject);
            });
        });
    }
}
```

**考点：** Promise状态机、then链式调用、异步队列、静态方法、手写实现

---

---

### 题目40：发布订阅模式 EventEmitter

**答案：**

```javascript
class EventEmitter {
    constructor() {
        this.events = {};
    }

    // 订阅事件
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this; // 支持链式调用
    }

    // 取消订阅
    off(event, listener) {
        if (!this.events[event]) return this;
        this.events[event] = this.events[event].filter((fn) => fn !== listener && fn.raw !== listener);
        return this;
    }

    // 触发事件（只触发一次）
    once(event, listener) {
        const wrapper = (...args) => {
            listener.apply(this, args);
            this.off(event, wrapper);
        };
        wrapper.raw = listener; // 保存原始引用，用于off
        this.on(event, wrapper);
        return this;
    }

    // 发布事件
    emit(event, ...args) {
        if (!this.events[event]) return false;
        this.events[event].forEach((listener) => {
            listener.apply(this, args);
        });
        return true;
    }
}

// 使用
const emitter = new EventEmitter();

const handler1 = (data) => console.log('handler1:', data);
const handler2 = (data) => console.log('handler2:', data);

emitter.on('data', handler1);
emitter.on('data', handler2);
emitter.once('connect', () => console.log('已连接'));

emitter.emit('data', { name: '张三' }); // handler1和handler2都会执行
emitter.emit('connect'); // 只执行一次
emitter.emit('connect'); // 不会执行

emitter.off('data', handler1); // 取消handler1
emitter.emit('data', { name: '李四' }); // 只有handler2执行
```

**Vue 2的EventBus就是基于发布订阅模式实现的。**

**考点：** 发布订阅模式、on/off/emit/once、链式调用、Vue EventBus

---