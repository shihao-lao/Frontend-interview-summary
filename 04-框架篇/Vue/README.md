## 第9章：Vue（8 题）

### 题目16：Vue响应式原理

**答案：**

**1. Vue 2 响应式原理（Object.defineProperty）**

Vue 2使用 `Object.defineProperty` 劫持对象属性的 `getter` 和 `setter`，实现数据变化时自动更新视图。

```javascript
// 简化版Vue 2响应式实现
function observe(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    Object.keys(obj).forEach((key) => {
        defineReactive(obj, key, obj[key]);
    });
}

function defineReactive(obj, key, val) {
    observe(val); // 递归观察嵌套对象
    const dep = new Dep(); // 每个属性都有一个依赖收集器

    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get() {
            if (Dep.target) dep.addSub(Dep.target); // 收集依赖
            return val;
        },
        set(newVal) {
            if (newVal === val) return;
            val = newVal;
            dep.notify(); // 派发更新
        }
    });
}

class Dep {
    constructor() { this.subs = []; }
    addSub(watcher) { this.subs.push(watcher); }
    notify() { this.subs.forEach((w) => w.update()); }
}

class Watcher {
    constructor(vm, exp, cb) {
        this.vm = vm;
        this.cb = cb;
        Dep.target = this;
        this.value = vm[exp]; // 触发getter，收集依赖
        Dep.target = null;
    }
    update() {
        const newVal = this.vm[this.exp];
        this.cb(newVal);
    }
}
```

**Vue 2响应式的缺陷：**
- 无法检测对象属性的添加和删除（需要 `Vue.set` / `Vue.delete`）。
- 无法检测数组索引的直接赋值和长度修改。
- 需要递归遍历所有属性，性能开销较大。

Vue 2对数组的处理：重写了数组的7个变异方法（push、pop、shift、unshift、splice、sort、reverse）。

**2. Vue 3 响应式原理（Proxy）**

Vue 3使用 `Proxy` 替代 `Object.defineProperty`，解决了上述缺陷。

```javascript
function reactive(target) {
    if (typeof target !== 'object' || target === null) return target;

    const handler = {
        get(target, key, receiver) {
            const result = Reflect.get(target, key, receiver);
            track(target, key); // 收集依赖
            if (typeof result === 'object' && result !== null) {
                return reactive(result); // 懒代理
            }
            return result;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);
            if (oldValue !== value) trigger(target, key); // 派发更新
            return result;
        },
        deleteProperty(target, key) {
            const hadKey = key in target;
            const result = Reflect.deleteProperty(target, key);
            if (hadKey) trigger(target, key);
            return result;
        }
    };

    return new Proxy(target, handler);
}

const targetMap = new WeakMap();
let activeEffect;

function track(target, key) {
    if (!activeEffect) return;
    let depsMap = targetMap.get(target);
    if (!depsMap) { depsMap = new Map(); targetMap.set(target, depsMap); }
    let dep = depsMap.get(key);
    if (!dep) { dep = new Set(); depsMap.set(key, dep); }
    dep.add(activeEffect);
}

function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    const dep = depsMap.get(key);
    if (dep) dep.forEach((effect) => effect());
}

function effect(fn) {
    activeEffect = fn;
    fn();
    activeEffect = null;
}
```

**3. Vue 2 vs Vue 3 响应式对比**

| 对比项 | Vue 2 (defineProperty) | Vue 3 (Proxy) |
|--------|----------------------|---------------|
| 新增属性 | 无法检测，需Vue.set | 可以检测 |
| 删除属性 | 无法检测，需Vue.delete | 可以检测 |
| 数组索引修改 | 无法检测 | 可以检测 |
| 性能 | 初始化时递归遍历 | 惰性代理，按需代理 |
| Map/Set | 不支持 | 支持 |
| 兼容性 | IE9+ | 不支持IE |

**考点：** 响应式原理、defineProperty、Proxy、依赖收集与派发更新、Vue2与Vue3区别

---

---

### 题目17：Vue生命周期

**答案：**

**1. Vue 2 生命周期**

```
beforeCreate -> created -> beforeMount -> mounted -> beforeUpdate -> updated -> beforeDestroy -> destroyed
```

| 钩子 | 说明 | 常用场景 |
|------|------|----------|
| `beforeCreate` | 实例初始化后，数据观测之前 | 几乎不用 |
| `created` | 实例创建完成，数据观测、方法已配置 | 发起初始化异步请求 |
| `beforeMount` | 模板编译完成，即将挂载 | 几乎不用 |
| `mounted` | 实例挂载到DOM完成 | 操作DOM、初始化第三方库 |
| `beforeUpdate` | 数据变化后，DOM更新之前 | 访问更新前的DOM状态 |
| `updated` | DOM重新渲染完成 | 避免在此修改数据（可能死循环） |
| `beforeDestroy` | 实例销毁之前 | 清除定时器、解绑事件 |
| `destroyed` | 实例销毁完成 | 几乎不用 |

**2. Vue 3 组合式API生命周期**

```javascript
import { onMounted, onUnmounted, onBeforeUpdate, onUpdated } from 'vue';

export default {
    setup() {
        onMounted(() => { console.log('组件已挂载'); });
        onUnmounted(() => { console.log('组件已卸载'); });
    }
};
```

**Vue 2 vs Vue 3 生命周期对比：**

| Vue 2 | Vue 3 (Composition API) |
|-------|------------------------|
| `beforeCreate` / `created` | 使用 `setup()` |
| `beforeMount` | `onBeforeMount` |
| `mounted` | `onMounted` |
| `beforeUpdate` | `onBeforeUpdate` |
| `updated` | `onUpdated` |
| `beforeDestroy` | `onBeforeUnmount` |
| `destroyed` | `onUnmounted` |

**3. 父子组件生命周期执行顺序**

**挂载阶段：**
```
父 beforeCreate -> 父 created -> 父 beforeMount
  -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted
-> 父 mounted
```

**更新阶段：**
```
父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated
```

**销毁阶段：**
```
父 beforeUnmount -> 子 beforeUnmount -> 子 unmounted -> 父 unmounted
```

**考点：** 生命周期钩子、执行顺序、父子组件生命周期、Vue3 Composition API

---

---

### 题目18：Vue组件通信

**答案：**

**1. Props / Emit（父子通信）**

```vue
<!-- 父组件 -->
<template>
    <Child :name="name" @update:name="name = $event" />
</template>
```

```vue
<!-- 子组件 -->
<script>
export default {
    props: { name: { type: String, required: true } },
    methods: {
        updateName(newName) { this.$emit('update:name', newName); }
    }
};
</script>
```

**2. provide / inject（跨层级通信）**

```javascript
// 祖先组件
export default {
    provide() { return { theme: this.theme }; },
    data() { return { theme: 'dark' }; }
};

// 后代组件
export default {
    inject: ['theme']
};
```

Vue 3中使用：
```javascript
import { provide, ref, inject } from 'vue';
const theme = ref('dark');
provide('theme', theme); // 祖先
const theme = inject('theme'); // 后代
```

**3. EventBus（Vue 3已移除，用mitt替代）**

```javascript
import mitt from 'mitt';
const emitter = mitt();
emitter.emit('event', data);
emitter.on('event', (data) => {});
emitter.off('event');
```

**4. Vuex / Pinia（全局状态管理）**

```javascript
import { defineStore } from 'pinia';
export const useUserStore = defineStore('user', {
    state: () => ({ name: '张三', token: '' }),
    actions: { login(token) { this.token = token; } }
});
```

**5. $refs（父访问子）**

```vue
<template><Child ref="childRef" /></template>
<script>
export default {
    mounted() { this.$refs.childRef.someMethod(); }
};
</script>
```

**通信方式总结：**

| 方式 | 适用场景 | Vue 2 | Vue 3 |
|------|----------|-------|-------|
| Props / Emit | 父子通信 | 支持 | 支持 |
| v-model | 父子双向绑定 | 支持 | 支持 |
| provide / inject | 跨层级通信 | 支持 | 支持 |
| EventBus | 兄弟/跨组件 | 支持 | 移除（用mitt） |
| Vuex / Pinia | 全局状态 | 支持 | 支持 |
| $refs | 父访问子 | 支持 | 支持 |

**考点：** 组件通信方式、适用场景、Vue2与Vue3差异

---

---

### 题目19：computed和watch的区别

**答案：**

**1. computed（计算属性）**

computed是基于依赖进行缓存的计算属性，只有依赖变化时才会重新计算。

```javascript
export default {
    data() {
        return { firstName: '张', lastName: '三', list: [1, 2, 3, 4, 5] };
    },
    computed: {
        fullName() {
            return this.firstName + this.lastName; // 有缓存
        },
        fullNameWithSetter: {
            get() { return this.firstName + ' ' + this.lastName; },
            set(value) {
                const parts = value.split(' ');
                this.firstName = parts[0];
                this.lastName = parts[1];
            }
        },
        filteredList() {
            return this.list.filter((item) => item > 2); // 有缓存
        }
    }
};
```

**2. watch（侦听器）**

watch用于监听数据变化并执行副作用。

```javascript
export default {
    watch: {
        keyword(newVal, oldVal) {
            this.search(newVal); // 异步API请求
        },
        user: {
            handler(newVal) { console.log('user变化：', newVal); },
            deep: true,     // 深度监听
            immediate: true // 立即执行一次
        },
        'user.name'(newVal, oldVal) {
            console.log('name变化：', oldVal, '->', newVal);
        }
    }
};
```

**3. Vue 3 Composition API写法**

```javascript
import { ref, computed, watch, watchEffect } from 'vue';

const firstName = ref('张');
const fullName = computed(() => firstName.value + lastName.value);

watch(firstName, (newVal, oldVal) => {
    console.log('firstName变化：', oldVal, '->', newVal);
});

watchEffect(() => {
    console.log('fullName:', fullName.value); // 自动收集依赖，立即执行
});
```

**4. computed vs watch 对比**

| 对比项 | computed | watch |
|--------|----------|-------|
| 是否有缓存 | 有缓存，依赖不变不重新计算 | 无缓存，每次都执行 |
| 是否支持异步 | 不支持（必须同步返回值） | 支持 |
| 是否支持setter | 支持 | 不适用 |
| 适用场景 | 派生新数据（格式化、过滤、计算） | 执行副作用（API请求、DOM操作） |
| 返回值 | 必须有返回值 | 不需要返回值 |

**5. 使用原则**

- **computed**：一个值依赖其他值，需要缓存。
- **watch**：数据变化时需要执行操作（如API请求）。

**考点：** computed缓存机制、watch深度监听、使用场景、Vue3 Composition API

---

---

### 题目20：nextTick原理

**答案：**

**1. 什么是nextTick**

Vue的DOM更新是异步的。当数据变化后，DOM不会立即更新，而是在下一个"事件循环"中批量更新。`nextTick` 用于在DOM更新完成后执行回调。

```javascript
this.message = '新消息';
console.log(this.$el.textContent); // 还是旧值

this.$nextTick(() => {
    console.log(this.$el.textContent); // 新值
});
```

**2. 为什么需要nextTick**

Vue采用异步更新策略，将多次数据变更合并为一次DOM更新，避免频繁操作DOM。

```javascript
this.count = 1;
this.count = 2;
this.count = 3;
// DOM只更新一次，最终值为3
```

**3. nextTick实现原理**

Vue内部维护了一个微任务队列，数据变化时将Watcher推入队列，在下一个微任务中统一执行。

```javascript
const callbacks = [];
let pending = false;

function nextTick(cb) {
    callbacks.push(cb);
    if (!pending) {
        pending = true;
        if (typeof Promise !== 'undefined') {
            Promise.resolve().then(flushCallbacks);
        } else if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(flushCallbacks);
            const textNode = document.createTextNode('1');
            observer.observe(textNode, { characterData: true });
            textNode.data = '2';
        } else if (typeof setImmediate !== 'undefined') {
            setImmediate(flushCallbacks);
        } else {
            setTimeout(flushCallbacks, 0);
        }
    }
}

function flushCallbacks() {
    pending = false;
    const copies = callbacks.slice(0);
    callbacks.length = 0;
    copies.forEach((cb) => cb());
}
```

优先级：Promise -> MutationObserver -> setImmediate -> setTimeout

**4. 事件循环与微任务/宏任务**

```
宏任务：setTimeout、setInterval、setImmediate、I/O、UI渲染
微任务：Promise.then、MutationObserver、queueMicrotask

执行顺序：
1. 执行同步代码
2. 执行微任务队列（清空所有微任务）
3. 执行一个宏任务
4. 执行微任务队列
5. 渲染DOM
6. 循环...
```

**5. 实际应用场景**

```javascript
// 修改数据后操作DOM
this.showModal = true;
this.$nextTick(() => { this.$refs.modalInput.focus(); });

// 在created中操作DOM
created() {
    this.$nextTick(() => { console.log(this.$el); });
}

// 获取更新后的DOM尺寸
this.list.push(...newItems);
this.$nextTick(() => {
    const height = this.$refs.listContainer.scrollHeight;
});
```

**考点：** 异步更新机制、微任务与宏任务、nextTick原理、使用场景

---

---

### 题目21：Vue Router hash模式和history模式

**答案：**

**1. hash模式**

```
URL示例：https://example.com/#/home
```

**原理：** 监听 `hashchange` 事件。

```javascript
class HashRouter {
    constructor() {
        this.routes = {};
        window.addEventListener('hashchange', () => this.handleRoute());
    }
    register(path, callback) { this.routes[path] = callback; }
    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        this.routes[hash]?.();
    }
}
```

特点：URL中有 `#`，兼容性好（IE9+），不需要服务器配置。

**2. history模式**

```
URL示例：https://example.com/home
```

**原理：** 使用 `history.pushState` 和 `popstate` 事件。

```javascript
class HistoryRouter {
    constructor() {
        this.routes = {};
        window.addEventListener('popstate', () => this.handleRoute());
    }
    push(path) {
        history.pushState({}, null, path);
        this.handleRoute();
    }
    handleRoute() {
        const path = window.location.pathname;
        this.routes[path]?.();
    }
}
```

特点：URL美观，需要服务器配置（否则刷新404）。

**服务器配置：**

```nginx
location / { try_files $uri $uri/ /index.html; }
```

**3. 两种模式对比**

| 对比项 | hash模式 | history模式 |
|--------|---------|------------|
| URL美观度 | 有 `#` | 无 `#` |
| 兼容性 | IE9+ | IE10+ |
| 服务器配置 | 不需要 | 需要 |
| SEO | 不友好 | 友好 |

**4. 路由守卫**

```javascript
// 全局前置守卫
router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem('token');
    if (to.meta.requiresAuth && !isLoggedIn) {
        next('/login');
    } else {
        next();
    }
});

// 组件内守卫
export default {
    beforeRouteLeave(to, from, next) {
        if (this.hasUnsavedChanges) {
            const confirmed = window.confirm('确定离开？');
            confirmed ? next() : next(false);
        } else {
            next();
        }
    }
};
```

**考点：** hash/history模式原理、区别、服务器配置、路由守卫

---

---

### 题目22：Vuex和Pinia的区别

**答案：**

**1. Vuex**

```javascript
export default new Vuex.Store({
    state: { count: 0 },
    getters: { doubleCount: (state) => state.count * 2 },
    mutations: { INCREMENT(state) { state.count++; } },
    actions: { incrementAsync({ commit }) { setTimeout(() => commit('INCREMENT'), 1000); } },
    modules: {
        cart: {
            namespaced: true,
            state: { items: [] },
            mutations: { ADD_ITEM(state, item) { state.items.push(item); } }
        }
    }
});
```

**2. Pinia**

```javascript
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({ name: '张三', token: '' }),
    getters: { isLoggedIn: (state) => !!state.token },
    actions: {
        async login(credentials) {
            const res = await api.login(credentials);
            this.token = res.token;
        }
    }
});

// Composition API风格
export const useCounterStore = defineStore('counter', () => {
    const count = ref(0);
    const doubleCount = computed(() => count.value * 2);
    function increment() { count.value++; }
    return { count, doubleCount, increment };
});
```

**3. Vuex vs Pinia 对比**

| 对比项 | Vuex | Pinia |
|--------|------|-------|
| Mutations | 必须通过mutation修改state | 不需要，直接修改state |
| TypeScript | 支持较差 | 完美支持 |
| 模块化 | 需要modules + namespaced | 每个store独立文件 |
| 代码量 | 较多 | 较少 |
| 学习成本 | 较高 | 较低 |

**考点：** Vuex核心概念、Pinia使用、两者区别、状态管理选型

---

---

### 题目23：React虚拟DOM和Diff算法

**答案：**

**1. 虚拟DOM（Virtual DOM）**

虚拟DOM是真实DOM的JavaScript对象表示，用于在内存中进行DOM操作的模拟，最终批量更新到真实DOM。

```javascript
// 真实DOM
<div class="container"><h1>Hello</h1></div>

// 虚拟DOM
const vNode = {
    type: 'div',
    props: {
        className: 'container',
        children: [{ type: 'h1', props: { children: 'Hello' } }]
    }
};
```

**2. Diff算法三大策略**

**策略1：树级别比较** -- 只比较同一层级的节点，不跨层级比较。

**策略2：组件级别比较** -- 同类型组件继续比较，不同类型直接替换。

**策略3：元素级别比较** -- 通过key识别节点。

**3. 列表Diff（key的作用）**

```jsx
// 有key
旧: [{key:'a', A}, {key:'b', B}, {key:'c', C}]
新: [{key:'c', C}, {key:'a', A}, {key:'b', B}]
// React知道：只是顺序变了，移动节点即可 -> 0次更新，3次移动

// 没有key（按索引比较）
旧: [A, B, C]
新: [C, A, B]
// React认为：A变成C，B变成A，C变成B -> 更新3个节点（全更新！）
```

**4. 为什么不能用index作为key**

```jsx
// 在头部插入一项：[{id:0,X}, {id:1,A}, {id:2,B}, {id:3,C}]
// 使用index作为key：3次更新 + 1次插入
// 使用id作为key：1次插入
```

**考点：** 虚拟DOM原理、Diff算法三大策略、key的作用、列表Diff

---