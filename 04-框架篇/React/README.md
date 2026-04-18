## 第10章：React（7 题）

### 题目24：React生命周期

**答案：**

**1. React 16.3+ 生命周期**

```
挂载：constructor -> getDerivedStateFromProps -> render -> componentDidMount
更新：getDerivedStateFromProps -> shouldComponentUpdate -> render -> getSnapshotBeforeUpdate -> componentDidUpdate
卸载：componentWillUnmount
错误：getDerivedStateFromError -> componentDidCatch
```

**废弃的生命周期：** `componentWillMount`、`componentWillReceiveProps`、`componentWillUpdate`

**2. 各生命周期详解**

```jsx
class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { count: 0 };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.userId !== state.prevUserId) {
            return { prevUserId: props.userId, data: null };
        }
        return null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.count !== this.state.count;
    }

    componentDidMount() {
        fetch('/api/data').then(res => res.json()).then(data => {
            this.setState({ data });
        });
        window.addEventListener('resize', this.handleResize);
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        return this.listRef.scrollHeight;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.userId !== this.props.userId) {
            this.fetchUser(this.props.userId);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        this.timer && clearInterval(this.timer);
    }

    render() { return <div>{this.state.count}</div>; }
}
```

**3. Hooks替代生命周期**

```jsx
function MyComponent({ userId }) {
    const [count, setCount] = useState(0);

    // componentDidMount + componentDidUpdate（依赖count）
    useEffect(() => { document.title = `Count: ${count}`; }, [count]);

    // componentDidMount（只执行一次）
    useEffect(() => {
        const chart = echarts.init(chartRef.current);
        return () => { chart.dispose(); }; // componentWillUnmount
    }, []);

    // componentDidUpdate（监听userId变化）
    useEffect(() => {
        if (userId) fetchUser(userId).then(setData);
    }, [userId]);
}
```

**考点：** 生命周期钩子、废弃的生命周期、Hooks替代、父子组件执行顺序

---

---

### 题目25：React Hooks

**答案：**

**1. useState**

```jsx
const [count, setCount] = useState(0);
setCount(prev => prev + 1); // 函数式更新
setUser(prev => ({ ...prev, name: '张三' })); // 不可变更新
```

**2. useEffect**

```jsx
// 每次渲染后执行
useEffect(() => { console.log('渲染完成'); });

// 只在挂载后执行一次
useEffect(() => {
    const timer = setInterval(() => console.log('tick'), 1000);
    return () => clearInterval(timer); // 清理函数
}, []);

// 依赖变化时执行
useEffect(() => { document.title = `Count: ${count}`; }, [count]);
```

**3. useRef**

```jsx
const inputRef = useRef(null);
inputRef.current.focus(); // 获取DOM引用
const timerRef = useRef(null); // 存储可变值（不触发重新渲染）
```

**4. useMemo / useCallback**

```jsx
const expensiveValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const handleClick = useCallback(() => { setCount(prev => prev + 1); }, []);
```

**5. useContext**

```jsx
const ThemeContext = React.createContext('light');
<ThemeContext.Provider value="dark"><App /></ThemeContext.Provider>
function App() { const theme = useContext(ThemeContext); }
```

**6. useReducer**

```jsx
const reducer = (state, action) => {
    switch (action.type) {
        case 'increment': return { count: state.count + 1 };
        default: return state;
    }
};
const [state, dispatch] = useReducer(reducer, { count: 0 });
```

**7. 自定义Hook**

```jsx
function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initialValue;
    });
    useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
    return [value, setValue];
}
```

**8. Hooks使用规则**

1. 只在顶层调用Hook（不能在循环、条件中调用）。
2. 只在React函数中调用（函数组件或自定义Hook）。

**考点：** 常用Hooks、useEffect依赖、useMemo/useCallback、自定义Hook、Hooks规则

---

---

### 题目26：setState同步异步

**答案：**

**1. React 18之前**

```jsx
// React事件处理函数中 -> 异步（批量更新）
handleClick = () => {
    this.setState({ count: this.state.count + 1 });
    console.log(this.state.count); // 还是旧值
};

// setTimeout中 -> 同步
setTimeout(() => {
    this.setState({ count: this.state.count + 1 });
    console.log(this.state.count); // 新值
}, 0);
```

**2. React 18自动批处理**

React 18引入了自动批处理（Automatic Batching），所有场景下的 `setState` 都是异步的。

```jsx
// React 18中，所有场景都是批量更新
handleClick = () => {
    this.setState({ count: this.state.count + 1 });
    setTimeout(() => {
        this.setState({ count: this.state.count + 1 }); // 也是异步
    }, 0);
};

// 如果需要立即获取更新后的状态，使用flushSync
import { flushSync } from 'react-dom';
flushSync(() => { this.setState({ count: this.state.count + 1 }); });
console.log(this.state.count); // 新值
```

**3. 函数式更新（推荐）**

```jsx
// 解决闭包问题
this.setState((prevState) => ({ count: prevState.count + 1 }));
this.setState((prevState) => ({ count: prevState.count + 1 }));
// 最终count + 2

// Hooks中
setCount(prev => prev + 1);
setCount(prev => prev + 1);
// 最终count + 2
```

**考点：** setState同步异步机制、批量更新、React 18自动批处理、函数式更新

---

---

### 题目27：React组件通信

**答案：**

**1. Props（父传子）**

```jsx
function Parent() { return <Child name="张三" age={25} />; }
function Child({ name, age }) { return <div>{name} - {age}</div>; }
```

**2. 回调函数（子传父）**

```jsx
function Parent() {
    const handleMessage = (msg) => setMessage(msg);
    return <Child onMessage={handleMessage} />;
}
function Child({ onMessage }) {
    return <button onClick={() => onMessage('来自子组件的消息')}>发送</button>;
}
```

**3. Context（跨层级通信）**

```jsx
const ThemeContext = React.createContext();
function App() {
    const [theme, setTheme] = useState('dark');
    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <Toolbar />
        </ThemeContext.Provider>
    );
}
function ThemedButton() {
    const { theme, setTheme } = useContext(ThemeContext);
    return <button className={theme} onClick={() => setTheme('light')}>Toggle</button>;
}
```

**4. useRef / forwardRef（父访问子）**

```jsx
const Child = React.forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current.focus(),
        getValue: () => inputRef.current.value
    }));
    const inputRef = useRef();
    return <input ref={inputRef} />;
});
```

**5. 状态提升（兄弟组件通信）**

```jsx
function Parent() {
    const [sharedState, setSharedState] = useState('');
    return (
        <>
            <SiblingA value={sharedState} onChange={setSharedState} />
            <SiblingB value={sharedState} />
        </>
    );
}
```

**通信方式总结：**

| 方式 | 方向 | 适用场景 |
|------|------|----------|
| Props | 父 -> 子 | 父子通信 |
| 回调函数 | 子 -> 父 | 子传父 |
| Context | 跨层级 | 主题、语言、用户信息 |
| useRef | 父 -> 子 | 父调用子方法 |
| 状态提升 | 兄弟 | 兄弟组件共享状态 |
| Redux/Zustand | 任意 | 全局状态管理 |

**考点：** 组件通信方式、Context使用、forwardRef、状态管理

---

---

### 题目28：Vue和React的区别

**答案：**

| 对比项 | Vue | React |
|--------|-----|-------|
| 理念 | 渐进式框架 | UI库 |
| 数据流 | 双向绑定（v-model） | 单向数据流 |
| 模板 | HTML模板 + 指令 | JSX |
| 响应式 | Proxy / defineProperty | 不可变数据 + setState |
| 状态管理 | Vuex / Pinia | Redux / Zustand / Context |
| 路由 | Vue Router | React Router |
| Diff算法 | 双端Diff（Vue 2）/ 快速Diff（Vue 3） | 仅右端Diff |
| 更新粒度 | 组件级 + 属性级 | 组件级 |
| 学习曲线 | 较低 | 中等 |

```javascript
// Vue：直接修改数据
this.count++;
this.user.name = '李四';

// React：创建新对象
setCount(prev => prev + 1);
setUser(prev => ({ ...prev, name: '李四' }));
```

**如何选择：**
- **选Vue**：中小型项目、快速开发。
- **选React**：大型项目、复杂交互、丰富生态系统。

**考点：** 设计理念、响应式原理、模板vs JSX、Diff算法、生态对比

---

---

### 题目29：高阶组件（HOC）

**答案：**

**1. 什么是高阶组件**

高阶组件是一个函数，接收一个组件作为参数，返回一个新的增强组件。

```jsx
function withEnhancement(WrappedComponent) {
    return function EnhancedComponent(props) {
        return <WrappedComponent {...props} extraProp="value" />;
    };
}
const EnhancedButton = withEnhancement(Button);
```

**2. 常见HOC应用场景**

**（1）权限控制**

```jsx
function withAuth(WrappedComponent) {
    return function AuthComponent(props) {
        const isLoggedIn = useContext(AuthContext);
        if (!isLoggedIn) return <Navigate to="/login" />;
        return <WrappedComponent {...props} isLoggedIn={isLoggedIn} />;
    };
}
const ProtectedPage = withAuth(Dashboard);
```

**（2）注入状态**

```jsx
function withLoading(WrappedComponent) {
    return function LoadingComponent({ fetchData, ...props }) {
        const [loading, setLoading] = useState(false);
        const [data, setData] = useState(null);
        useEffect(() => {
            setLoading(true);
            fetchData().then(setData).finally(() => setLoading(false));
        }, []);
        if (loading) return <Spinner />;
        return <WrappedComponent data={data} {...props} />;
    };
}
```

**3. HOC注意事项**

- 不要在render中创建HOC（会导致旧组件unmount + 新组件mount）。
- 复制静态方法（使用 `hoistNonReactStatic`）。
- refs传递（使用 `React.forwardRef`）。

**4. HOC vs Hooks**

| 对比项 | HOC | Hooks |
|--------|-----|-------|
| 复用逻辑 | 包装组件 | 自定义Hook |
| 嵌套问题 | 可能多层嵌套 | 扁平 |
| 命名冲突 | 属性名可能冲突 | 无冲突 |
| TypeScript | 支持较差 | 完美支持 |

**考点：** HOC原理、属性代理、HOC vs Hooks、注意事项

---

---

### 题目30：React Fiber架构

**答案：**

**1. 为什么需要Fiber**

React 15使用递归（Stack Reconciler）进行虚拟DOM对比和更新，递归一旦开始就无法中断，大组件树会导致页面卡顿。

**2. Fiber是什么**

Fiber是React 16引入的新的协调引擎，将渲染工作拆分为多个小单元，可以暂停、恢复、丢弃。

**Fiber节点的数据结构：**

```javascript
const fiber = {
    tag: FunctionComponent,
    type: App,
    key: null,
    return: parentFiber,      // 父Fiber
    child: firstChildFiber,   // 第一个子Fiber
    sibling: nextFiber,       // 下一个兄弟Fiber
    pendingProps: {},
    memoizedProps: {},
    memoizedState: {},
    flags: Placement,
    alternate: currentFiber,  // 双缓冲
};
```

**3. 双缓冲机制**

React维护两棵Fiber树：
- **current树**：当前屏幕上显示的内容。
- **workInProgress树**：正在构建的新树。

构建完成后切换指针，使workInProgress成为current。

**4. 两个阶段**

**阶段一：Reconciliation（协调阶段）-- 可中断**
- 遍历Fiber树，对比新旧虚拟DOM，标记需要更新的节点。

**阶段二：Commit（提交阶段）-- 不可中断**
- 将所有变更一次性应用到DOM，执行生命周期和useEffect。

**5. 优先级调度**

```
ImmediatePriority    // 同步任务（用户输入）
UserBlockingPriority // 用户交互（点击、输入）
NormalPriority       // 正常更新
LowPriority          // 数据预加载
IdlePriority         // 空闲时执行
```

高优先级任务可以中断低优先级任务。

**6. 时间切片（Concurrent Mode）**

```jsx
import { startTransition } from 'react';

function SearchPage() {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);

    const handleChange = (e) => {
        setKeyword(e.target.value); // 高优先级
        startTransition(() => {
            setResults(searchResults(e.target.value)); // 低优先级
        });
    };
}
```

**考点：** Fiber架构、双缓冲、时间切片、优先级调度、两阶段渲染

---

## 第四部分：性能优化 + 算法 + 工程化

---