## 第5章：TypeScript（15 题）

### 题目1：TypeScript 中 interface 和 type 有什么区别？分别在什么场景下使用？

**答案：**

`interface` 和 `type` 是 TypeScript 中定义类型的两种主要方式，它们在大多数场景下可以互换使用，但存在一些关键区别。

### 一、核心区别

**1. 扩展方式不同**

`interface` 通过 `extends` 关键字实现继承扩展，支持声明合并（Declaration Merging）。`type` 通过交叉类型（`&`）实现组合扩展，不支持声明合并。

```typescript
// interface 继承
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

const myDog: Dog = { name: "Buddy", breed: "Golden Retriever" };

// type 交叉组合
type AnimalType = {
  name: string;
};

type DogType = AnimalType & {
  breed: string;
};

const myDog2: DogType = { name: "Buddy", breed: "Golden Retriever" };
```

**2. 声明合并（Declaration Merging）**

`interface` 支持声明合并，同名 interface 会自动合并属性。`type` 不支持，同名 type 会报错。

```typescript
// interface 声明合并 —— 合法
interface User {
  name: string;
}

interface User {
  age: number;
}

// 合并后等价于：{ name: string; age: number }
const user: User = { name: "Alice", age: 25 };

// type 同名会报错
// type Config = { host: string };
// type Config = { port: number }; // Error: Duplicate identifier 'Config'
```

声明合并在实际开发中的典型应用场景是为第三方库扩展类型定义：

```typescript
// 扩展第三方库的类型
declare module "express" {
  interface Request {
    user?: { id: string; role: string };
  }
}
```

**3. 表达能力不同**

`type` 的表达能力更丰富，支持联合类型、交叉类型、元组类型、映射类型、条件类型等高级类型操作。`interface` 只能描述对象形状。

```typescript
// type 可以定义联合类型
type Status = "pending" | "success" | "error";
type ID = string | number;

// type 可以定义元组
type Point = [number, number];

// type 可以定义映射类型
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

// type 可以定义条件类型
type IsString<T> = T extends string ? true : false;

// type 可以用 typeof 获取类型
const config = { host: "localhost", port: 3000 };
type Config = typeof config;

// type 可以定义基本类型别名
type StringOrNumber = string | number;

// 以上这些，interface 都无法直接实现
```

**4. 类的实现**

`interface` 可以被类 `implements` 实现，`type` 中如果是对象类型也可以被 `implements`，但联合类型等不行。

```typescript
interface Serializable {
  serialize(): string;
}

class User implements Serializable {
  constructor(private name: string) {}
  serialize(): string {
    return JSON.stringify({ name: this.name });
  }
}

// type 也可以（仅限对象形状的 type）
type Loggable = {
  log(): void;
};

class Logger implements Loggable {
  log(): void {
    console.log("logging...");
  }
}
```

### 二、使用场景建议

| 场景 | 推荐使用 | 原因 |
|------|---------|------|
| 定义对象形状、类的契约 | `interface` | 语义更清晰，支持声明合并 |
| 定义 API 响应类型、配置类型 | `interface` | 可扩展性强，便于后续扩展 |
| 定义联合类型、元组、基本类型别名 | `type` | interface 无法表达 |
| 定义工具类型（Utility Types） | `type` | 需要映射类型、条件类型等高级特性 |
| 需要声明合并扩展第三方库类型 | `interface` | 利用声明合并特性 |

### 三、总结原则

> **一句话总结：能用 interface 就用 interface，需要 type 特有功能时才用 type。**

在团队协作中，保持一致性比选择哪个更重要。建议在项目规范中明确约定使用场景。

**考点：** interface、type、类型别名、声明合并、extends、交叉类型、联合类型

---

---

### 题目2：TypeScript 的基本类型有哪些？any、unknown、never、void 有什么区别？

**答案：**

### 一、TypeScript 基本类型总览

TypeScript 的类型系统包含以下基本类型：

```typescript
// 1. 原始类型（Primitive Types）
let str: string = "hello";
let num: number = 42;
let bool: boolean = true;
let big: bigint = 9007199254740991n;
let sym: symbol = Symbol("id");

// 2. null 和 undefined
let n: null = null;
let u: undefined = undefined;

// 3. 特殊类型
let a: any;
let unk: unknown;
let nev: never;
let v: void;

// 4. 数组类型
let arr1: number[] = [1, 2, 3];
let arr2: Array<number> = [1, 2, 3];

// 5. 元组类型
let tuple: [string, number] = ["age", 25];

// 6. 枚举类型
enum Direction { Up, Down, Left, Right }

// 7. 对象类型
let obj: { name: string; age: number } = { name: "Alice", age: 25 };

// 8. 函数类型
let fn: (x: number, y: number) => number = (x, y) => x + y;
```

### 二、any、unknown、never、void 的详细区别

这四个类型是 TypeScript 类型系统中最容易混淆的特殊类型，它们的核心区别在于**类型安全程度**和**使用目的**。

#### 1. `any` —— 完全放弃类型检查

`any` 表示任意类型，赋值给任何类型都不会报错，任何类型也可以赋值给它。它完全绕过了 TypeScript 的类型检查系统。

```typescript
let a: any = "hello";
a = 42;           // OK
a = true;         // OK
a.foo();          // OK，不会报错（运行时可能出错）
a.bar.baz();      // OK，不会报错

// any 可以赋值给任何类型
let str: string = a;   // OK
let num: number = a;   // OK
```

**使用场景：** 紧急迁移 JavaScript 项目时的过渡类型，或与没有类型定义的第三方库交互。

**危险之处：** 使用 `any` 等同于写 JavaScript，完全失去了 TypeScript 的类型保护。`any` 类型的值会"污染"其他变量——把 `any` 赋值给其他变量时，那些变量也会变成 `any`。

#### 2. `unknown` —— 类型安全的 any

`unknown` 是 TypeScript 3.0 引入的类型，表示"未知类型"。与 `any` 的关键区别在于：**unknown 类型的值不能直接使用，必须先进行类型收窄（Type Narrowing）后才能操作。**

```typescript
let value: unknown = "hello";
value = 42;
value = { name: "Alice" };

// 以下操作都会报错
// value.foo();          // Error: Object is of type 'unknown'
// let s: string = value; // Error: Type 'unknown' is not assignable to type 'string'

// 必须先进行类型检查
if (typeof value === "string") {
  console.log(value.toUpperCase()); // OK，此时 value 被收窄为 string
}

if (typeof value === "number") {
  console.log(value.toFixed(2));    // OK
}

// 使用类型断言（不推荐，绕过了类型检查）
console.log((value as string).toUpperCase());
```

**unknown 与 any 的核心区别：**

| 特性 | `any` | `unknown` |
|------|-------|-----------|
| 可以赋值给其他类型 | 可以 | 不可以（必须先类型收窄） |
| 可以调用任意方法 | 可以 | 不可以 |
| 类型安全 | 不安全 | 安全 |
| 使用场景 | 兼容旧代码 | 不确定类型时的安全选择 |

```typescript
let a: any = "hello";
let u: unknown = "hello";

let s1: string = a;   // OK —— any 会污染其他变量
let s2: string = u;   // Error —— unknown 不会污染其他变量
```

#### 3. `void` —— 无返回值

`void` 表示函数没有返回值，或者返回 `undefined`。它**只能用于函数返回类型**（不推荐用于变量声明）。

```typescript
// 正确用法：函数返回类型
function log(message: string): void {
  console.log(message);
  // 没有返回值，或 return undefined
}

function doSomething(): void {
  return; // 显式 return，不带值
}

// void 类型的变量只能赋值 undefined 或 null（如果 strictNullChecks 关闭）
let v: void = undefined;
// let v2: void = "hello"; // Error

// void 不用于变量声明的典型原因
let unusable: void = undefined;
// unusable 没有任何实际用途
```

#### 4. `never` —— 永远不会有值

`never` 表示永远不会出现的值的类型。它是 TypeScript 类型系统的"底部类型"（Bottom Type），是所有类型的子类型，但没有任何类型是它的子类型（除了 `never` 自身）。

```typescript
// 场景1：函数永远不会正常返回（抛出异常或无限循环）
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

// 场景2： exhaustive check（穷尽检查）
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle": return Math.PI;
    case "square": return 4;
    case "triangle": return 3;
    default:
      // 如果新增了 Shape 的类型但没有处理，这里会报错
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}

// 场景3：never 是所有类型的子类型
let n: never;
let s: string = n;   // OK，never 可以赋值给任何类型
// let n2: never = "hello"; // Error，任何类型都不能赋值给 never
```

### 三、类型安全程度排序

```
never > unknown > T (具体类型) > void > any
```

- `never`：最安全，不可能有值
- `unknown`：安全，必须收窄后才能使用
- 具体类型：正常使用
- `void`：仅用于函数返回值
- `any`：最不安全，完全放弃类型检查

**考点：** 基本类型、any、unknown、never、void、类型安全、类型收窄、底部类型

---

---

### 题目3：什么是泛型？泛型的使用场景有哪些？请举例说明

**答案：**

### 一、泛型的概念

泛型（Generics）是 TypeScript 中最强大的特性之一。它允许在定义函数、接口、类时不预先指定具体类型，而在使用时再指定类型。泛型的本质是**参数化类型**——将类型作为参数传递，使得代码可以适用于多种类型，同时保持类型安全。

用一句话概括：**泛型就是类型的变量。**

```typescript
// 不使用泛型 —— 要么丢失类型信息，要么要写重复代码
function identity1(arg: any): any {
  return arg; // 返回 any，丢失了类型信息
}

function identity2(arg: number): number {
  return arg; // 只能处理 number
}

function identity3(arg: string): string {
  return arg; // 只能处理 string
}

// 使用泛型 —— 一个函数处理所有类型，且保持类型安全
function identity<T>(arg: T): T {
  return arg;
}

const result1 = identity<string>("hello"); // result1 的类型是 string
const result2 = identity<number>(42);      // result2 的类型是 number
const result3 = identity(true);            // 自动推导，result3 的类型是 boolean
```

### 二、泛型的基础语法

**1. 泛型函数**

```typescript
// 基本语法
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = firstElement([1, 2, 3]);       // number
const str = firstElement(["a", "b", "c"]); // string

// 多个泛型参数
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

const lengths = map(["hello", "world"], s => s.length); // number[]

// 泛型约束
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello");     // OK，string 有 length 属性
logLength([1, 2, 3]);   // OK，数组有 length 属性
logLength({ length: 10 }); // OK
// logLength(123);       // Error: number 没有 length 属性
```

**2. 泛型接口**

```typescript
// 泛型接口
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 使用
type User = { id: string; name: string };
type Product = { id: string; price: number };

const userResponse: ApiResponse<User> = {
  code: 200,
  message: "success",
  data: { id: "1", name: "Alice" },
  timestamp: Date.now(),
};

const productListResponse: ApiResponse<Product[]> = {
  code: 200,
  message: "success",
  data: [{ id: "1", price: 99.9 }],
  timestamp: Date.now(),
};

// 泛型接口的默认类型参数
interface Container<T = string> {
  value: T;
}

const c1: Container = { value: "hello" };  // T 默认为 string
const c2: Container<number> = { value: 42 };
```

**3. 泛型类**

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
console.log(numberStack.pop()); // 2

const stringStack = new Stack<string>();
stringStack.push("hello");
console.log(stringStack.pop()); // "hello"
```

### 三、泛型约束（Generic Constraints）

泛型约束使用 `extends` 关键字限制泛型参数必须满足特定条件。

```typescript
// 1. 约束为具有特定属性的对象
interface HasId {
  id: string | number;
}

function findById<T extends HasId>(items: T[], id: string | number): T | undefined {
  return items.find(item => item.id === id);
}

const users = [{ id: "1", name: "Alice" }, { id: "2", name: "Bob" }];
const user = findById(users, "1"); // 类型为 { id: string; name: string } | undefined

// 2. 约束为构造函数类型
interface Constructor<T> {
  new (...args: any[]): T;
}

function createInstance<T>(ctor: Constructor<T>, ...args: any[]): T {
  return new ctor(...args);
}

class Person {
  constructor(public name: string) {}
}

const p = createInstance(Person, "Alice"); // Person

// 3. keyof 约束 —— 确保键是对象的有效属性
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "Alice", age: 25 };
const name = getProperty(person, "name"); // string
const age = getProperty(person, "age");   // number
// getProperty(person, "email"); // Error: "email" 不是 person 的属性
```

### 四、常见使用场景

**1. API 请求封装**

```typescript
async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(url, options);
  const data: ApiResponse<T> = await response.json();
  if (data.code !== 200) {
    throw new Error(data.message);
  }
  return data;
}

// 使用
interface User { id: string; name: string; }
const users = await request<User[]>("/api/users");
```

**2. React 组件 Props**

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// 使用
<List<User>
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

**3. 工具函数**

```typescript
// 深拷贝
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 防抖
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

### 五、泛型最佳实践

1. **优先使用类型推导**，不要到处写 `<T>`，让 TypeScript 自动推导
2. **使用有意义的泛型参数名**：`T`（Type）、`K`（Key）、`V`（Value）、`E`（Element）、`R`（Result）
3. **尽量使用泛型约束**，而不是在函数体内用 `any`
4. **泛型参数不要太多**，超过 3 个泛型参数时考虑重构

**考点：** 泛型、泛型函数、泛型接口、泛型类、泛型约束、extends、keyof、类型推导

---

---

### 题目4：TypeScript 中 type guard（类型守卫）是什么？有哪些方式？

**答案：**

### 一、类型守卫的概念

TypeScript 中，联合类型（Union Type）的变量在被直接使用时，只能访问所有类型共有的属性和方法。**类型守卫（Type Guard）** 是一种在运行时检查类型的方式，它能在条件分支中将变量的类型收窄（Narrow）为更具体的类型，从而允许访问该类型特有的属性和方法。

```typescript
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

type Pet = Bird | Fish;

function move(pet: Pet) {
  // 只能访问共有方法
  pet.layEggs(); // OK

  // pet.fly();  // Error: Property 'fly' does not exist on type 'Fish'
  // pet.swim(); // Error: Property 'swim' does not exist on type 'Bird'

  // 使用类型守卫后
  if ("fly" in pet) {
    pet.fly();  // OK，此处 pet 被收窄为 Bird
  } else {
    pet.swim(); // OK，此处 pet 被收窄为 Fish
  }
}
```

### 二、类型守卫的五种方式

#### 1. `typeof` 类型守卫

用于区分原始类型（`string`、`number`、`boolean`、`symbol`、`bigint`、`undefined`、`object`、`function`）。

```typescript
function double(value: string | number): string | number {
  if (typeof value === "string") {
    // 此处 value 被收窄为 string
    return value.repeat(2);
  }
  // 此处 value 被收窄为 number
  return value * 2;
}

// 注意：typeof 只能识别有限的类型字符串
// typeof x === "string"
// typeof x === "number"
// typeof x === "boolean"
// typeof x === "symbol"
// typeof x === "bigint"
// typeof x === "undefined"
// typeof x === "object"
// typeof x === "function"

// typeof 不能区分具体的对象类型
// typeof [] === "object"  —— 无法区分数组
// typeof null === "object" —— 经典的 JS 陷阱
```

#### 2. `instanceof` 类型守卫

用于通过原型链检查来区分类实例。

```typescript
class Car {
  drive() { console.log("Driving a car"); }
}

class Bicycle {
  ride() { console.log("Riding a bicycle"); }
}

type Vehicle = Car | Bicycle;

function operate(vehicle: Vehicle) {
  if (vehicle instanceof Car) {
    vehicle.drive();  // OK，此处 vehicle 被收窄为 Car
  } else {
    vehicle.ride();   // OK，此处 vehicle 被收窄为 Bicycle
  }
}
```

#### 3. `in` 操作符类型守卫

用于检查对象是否包含某个属性，适合区分接口类型。

```typescript
interface Admin {
  role: "admin";
  permissions: string[];
}

interface User {
  role: "user";
  email: string;
}

type Account = Admin | User;

function getAccountInfo(account: Account): string {
  if ("permissions" in account) {
    // 此处 account 被收窄为 Admin
    return `Admin with permissions: ${account.permissions.join(", ")}`;
  }
  // 此处 account 被收窄为 User
  return `User with email: ${account.email}`;
}
```

#### 4. 自定义类型守卫（Type Predicate）

通过 `parameterName is Type` 的语法，定义一个返回布尔值的函数，TypeScript 会根据返回值进行类型收窄。

```typescript
// 基本语法
function isFish(pet: Bird | Fish): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

// 使用
function move(pet: Bird | Fish) {
  if (isFish(pet)) {
    pet.swim(); // OK，TypeScript 知道这里是 Fish
  } else {
    pet.fly();  // OK，TypeScript 知道这里是 Bird
  }
}

// 实际开发中的常见用法
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

function isSuccess<T>(response: ApiResponse<T> | null): response is ApiResponse<T> {
  return response !== null && response.code === 200;
}

// 数组过滤中的类型守卫
interface Dog { kind: "dog"; bark(): void; }
interface Cat { kind: "cat"; meow(): void; }
type Pet = Dog | Cat;

const pets: Pet[] = [
  { kind: "dog", bark: () => console.log("woof") },
  { kind: "cat", meow: () => console.log("meow") },
  { kind: "dog", bark: () => console.log("woof") },
];

function isDog(pet: Pet): pet is Dog {
  return pet.kind === "dog";
}

// 没有 isDog 类型守卫，过滤后的类型仍然是 Pet[]
// 有了 isDog，过滤后的类型是 Dog[]
const dogs = pets.filter(isDog);
dogs.forEach(dog => dog.bark()); // OK
```

#### 5. 可辨识联合（Discriminated Union）

利用对象中一个共同的字面量类型属性（判别属性）来进行类型收窄。这是 TypeScript 中最推荐的联合类型处理方式。

```typescript
interface LoadingState {
  type: "loading";
}

interface SuccessState {
  type: "success";
  data: string;
}

interface ErrorState {
  type: "error";
  error: string;
}

type State = LoadingState | SuccessState | ErrorState;

function handleState(state: State): string {
  switch (state.type) {
    case "loading":
      return "Loading...";
    case "success":
      // 此处 state 被收窄为 SuccessState
      return `Data: ${state.data}`;
    case "error":
      // 此处 state 被收窄为 ErrorState
      return `Error: ${state.error}`;
    default:
      // 穷尽检查，确保所有 case 都被处理
      const _exhaustiveCheck: never = state;
      return _exhaustiveCheck;
  }
}
```

### 三、类型守卫的注意事项

```typescript
// 1. 类型守卫只在当前作用域生效
function example(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase()); // OK
  }
  // 这里 value 仍然是 string | number
}

// 2. 可空类型的守卫
function processValue(value: string | null | undefined) {
  // 方式1：真值检查
  if (value) {
    console.log(value.toUpperCase()); // OK，排除了 null 和 undefined
  }

  // 方式2：严格相等
  if (value !== null && value !== undefined) {
    console.log(value.toUpperCase()); // OK
  }

  // 方式3：非空断言（不推荐，不安全）
  console.log(value!.toUpperCase());
}
```

**考点：** 类型守卫、typeof、instanceof、in、自定义类型守卫、Type Predicate、可辨识联合、类型收窄

---

---

### 题目5：TypeScript 的条件类型和映射类型是什么？请举例说明

**答案：**

### 一、条件类型（Conditional Types）

条件类型是 TypeScript 的高级类型特性，语法类似于三元表达式：`T extends U ? X : Y`。它根据类型关系进行条件判断，返回不同的类型。

**1. 基本语法**

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
type C = IsString<"hello">; // true
type D = IsString<boolean>; // false
```

**2. 分布式条件类型（Distributive Conditional Types）**

当条件类型的泛型参数是联合类型时，条件类型会被"分发"——对联合类型的每个成员分别应用条件判断，然后将结果合并为新的联合类型。

```typescript
type ToArray<T> = T extends any ? T[] : never;

// 当 T 是联合类型时，分发规则生效
type Result = ToArray<string | number>;
// 等价于：
// ToArray<string> | ToArray<number>
// = string[] | number[]

// 对比：如果不使用条件类型，直接写 T[]
type NotDistributed = (string | number)[];
// 类型是 (string | number)[]，即元素是 string | number 的数组

// 实际应用：提取联合类型中的某些类型
type ExtractString<T> = T extends string ? T : never;

type Strings = ExtractString<"a" | "b" | 1 | 2>; // "a" | "b"

// 禁用分发：用方括号包裹 T
type NonDistributed<T> = [T] extends [any] ? T[] : never;
type Result2 = NonDistributed<string | number>; // (string | number)[]
```

**3. `infer` 关键字**

`infer` 用于在条件类型中推断（提取）某个位置的子类型，类似于正则表达式中的捕获组。

```typescript
// 提取函数返回值类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Fn1 = () => string;
type Fn2 = (x: number) => boolean;

type R1 = ReturnType<Fn1>; // string
type R2 = ReturnType<Fn2>; // boolean

// 提取函数参数类型
type FirstParam<T> = T extends (first: infer F, ...args: any[]) => any ? F : never;

type P1 = FirstParam<(name: string, age: number) => void>; // string

// 提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never;

type E1 = ElementType<string[]>;   // string
type E2 = ElementType<number[]>;   // number
type E3 = ElementType<string[][]>; // string[]

// 提取 Promise 内部类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type U1 = UnwrapPromise<Promise<string>>;  // string
type U2 = UnwrapPromise<Promise<number>>;  // number
type U3 = UnwrapPromise<string>;           // string（不是 Promise，直接返回 T）

// 提取字符串字面量类型的第一个字符
type FirstChar<T> = T extends `${infer F}${string}` ? F : never;

type FC1 = FirstChar<"hello">; // "h"
type FC2 = FirstChar<"abc">;   // "a"
```

**4. 内置条件类型**

TypeScript 内置了一些常用的条件类型：

```typescript
// Exclude<T, U> —— 从 T 中排除 U
type T1 = Exclude<"a" | "b" | "c", "a">;          // "b" | "c"
type T2 = Exclude<string | number | boolean, number>; // string | boolean

// Extract<T, U> —— 从 T 中提取 U
type T3 = Extract<"a" | "b" | "c", "a" | "b">;    // "a" | "b"

// NonNullable<T> —— 排除 null 和 undefined
type T4 = NonNullable<string | null | undefined>;  // string

// ReturnType<T> —— 获取函数返回值类型
type T5 = ReturnType<() => string>;                // string

// Parameters<T> —— 获取函数参数类型元组
type T6 = Parameters<(a: string, b: number) => void>; // [string, number]

// InstanceType<T> —— 获取构造函数的实例类型
class MyClass { x = 0; }
type T7 = InstanceType<typeof MyClass>;            // MyClass
```

### 二、映射类型（Mapped Types）

映射类型通过遍历一个类型的所有属性键，生成一个新的类型。它类似于 JavaScript 中的 `Array.map()`，只不过操作的是类型。

**1. 基本语法**

```typescript
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type Optional<T> = {
  [K in keyof T]?: T[K];
};

interface User {
  name: string;
  age: number;
  email: string;
}

type ReadonlyUser = Readonly<User>;
// { readonly name: string; readonly age: number; readonly email: string; }

type OptionalUser = Optional<User>;
// { name?: string; age?: number; email?: string; }
```

**2. 映射类型修饰符**

TypeScript 提供了 `+`（添加）和 `-`（移除）修饰符来控制属性的 `readonly` 和 `?`（可选）修饰符。

```typescript
// 移除 readonly
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

// 添加可选
type PartialWithNew<T> = {
  [K in keyof T]?: T[K];
};

// 移除可选
type Required<T> = {
  [K in keyof T]-?: T[K];
};

interface Config {
  readonly host: string;
  readonly port: number;
  debug?: boolean;
}

type MutableConfig = Mutable<Config>;
// { host: string; port: number; debug?: boolean; }

type RequiredConfig = Required<Config>;
// { readonly host: string; readonly port: number; debug: boolean; }
```

**3. 键重映射（Key Remapping）**

TypeScript 4.1 引入了通过 `as` 子句对映射类型的键进行重新映射。

```typescript
// 将所有键变为 getter 方法名
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
// }

// 过滤属性：通过 never 移除不需要的属性
type RemoveMethods<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

class Example {
  name = "hello";
  age = 25;
  greet() { return "hi"; }
}

type ExampleData = RemoveMethods<Example>;
// { name: string; age: number; }
```

**4. 模板字面量类型与映射类型结合**

```typescript
// 生成事件处理器类型
type EventHandlers<T extends string> = {
  [K in T as `on${Capitalize<K>}`]: (event: { type: K }) => void;
};

type ButtonEvents = EventHandlers<"click" | "focus" | "blur">;
// {
//   onClick: (event: { type: "click" }) => void;
//   onFocus: (event: { type: "focus" }) => void;
//   onBlur: (event: { type: "blur" }) => void;
// }
```

### 三、条件类型与映射类型的组合

```typescript
// 根据值的类型决定属性是否可选
type OptionalIfNullable<T> = {
  [K in keyof T]: null extends T[K] ? { [P in K]?: T[P] } : { [P in K]: T[P] }
}[keyof T];

// 简化版：将值为 null 的属性变为可选
type MakeNullableOptional<T> = {
  [K in keyof T]: undefined extends T[K] ? T[K] | undefined : T[K];
};
```

**考点：** 条件类型、映射类型、分布式条件类型、infer、keyof、模板字面量类型、键重映射

---

---

### 题目6：TypeScript 中内置的工具类型有哪些？（Partial、Required、Pick、Omit、Record 等）

**答案：**

TypeScript 内置了大量实用的工具类型（Utility Types），它们都基于映射类型和条件类型实现，位于 `lib.es5.d.ts` 中。掌握这些工具类型是高效使用 TypeScript 的关键。

### 一、完整工具类型列表与详解

#### 1. `Partial<T>` —— 将所有属性变为可选

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

// 所有属性变为可选
type PartialUser = Partial<User>;
// 等价于：{ id?: string; name?: string; email?: string; avatar?: string; }

// 典型使用场景：更新操作，只传需要更新的字段
function updateUser(id: string, updates: Partial<User>): User {
  const existingUser = findUserById(id);
  return { ...existingUser, ...updates };
}

updateUser("1", { name: "New Name" }); // 只更新 name
updateUser("1", { email: "new@email.com", avatar: "/new.jpg" }); // 更新多个字段
```

#### 2. `Required<T>` —— 将所有属性变为必选

```typescript
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

type RequiredConfig = Required<Config>;
// 等价于：{ host: string; port: number; debug: boolean; }

// 典型使用场景：确保配置完整
function createServer(config: Required<Config>) {
  // 这里 config.host、config.port、config.debug 都是 string/number/boolean
  // 不需要再做 undefined 检查
}
```

#### 3. `Readonly<T>` —— 将所有属性变为只读

```typescript
interface Point {
  x: number;
  y: number;
}

type ReadonlyPoint = Readonly<Point>;
// 等价于：{ readonly x: number; readonly y: number; }

const origin: ReadonlyPoint = { x: 0, y: 0 };
// origin.x = 1; // Error: Cannot assign to 'x' because it is a read-only property

// 典型使用场景：不可变数据、常量定义
const INITIAL_STATE: Readonly<AppState> = {
  count: 0,
  user: null,
};

// 使用 Object.freeze 配合
const frozen = Object.freeze({ x: 0, y: 0 }) as Readonly<Point>;
```

#### 4. `Pick<T, K>` —— 从 T 中选取部分属性

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// 只选取 id 和 name
type UserPreview = Pick<User, "id" | "name">;
// 等价于：{ id: string; name: string; }

// 典型使用场景：列表展示时只取需要的字段
function getUserList(): UserPreview[] {
  return db.users.map(u => ({
    id: u.id,
    name: u.name,
  }));
}
```

#### 5. `Omit<T, K>` —— 从 T 中排除部分属性

```typescript
// 排除 password 和 createdAt
type SafeUser = Omit<User, "password" | "createdAt">;
// 等价于：{ id: string; name: string; email: string; }

// 典型使用场景：API 响应中排除敏感字段
function getPublicProfile(user: User): SafeUser {
  const { password, createdAt, ...publicInfo } = user;
  return publicInfo;
}
```

#### 6. `Record<K, V>` —— 构造键值对类型

```typescript
// K 是键的类型，V 是值的类型
type PageInfo = Record<string, { title: string; url: string }>;

const pages: PageInfo = {
  home: { title: "Home", url: "/" },
  about: { title: "About", url: "/about" },
  contact: { title: "Contact", url: "/contact" },
};

// 典型使用场景：字典/映射结构
type RolePermissions = Record<Role, Permission[]>;

enum Role {
  Admin = "admin",
  Editor = "editor",
  Viewer = "viewer",
}

const permissions: RolePermissions = {
  [Role.Admin]: ["read", "write", "delete"],
  [Role.Editor]: ["read", "write"],
  [Role.Viewer]: ["read"],
};

// Record 与联合类型组合
type StatusMap = Record<"pending" | "success" | "error", string>;
// { pending: string; success: string; error: string; }
```

#### 7. `Exclude<T, U>` —— 从联合类型 T 中排除 U

```typescript
type T1 = Exclude<"a" | "b" | "c" | "d", "a" | "c">; // "b" | "d"
type T2 = Exclude<string | number | boolean, number>;  // string | boolean

// 典型使用场景：过滤事件类型
type EventName = "click" | "hover" | "focus" | "blur";
type MouseEvent = Exclude<EventName, "focus" | "blur">; // "click" | "hover"
```

#### 8. `Extract<T, U>` —— 从联合类型 T 中提取 U

```typescript
type T1 = Extract<"a" | "b" | "c", "a" | "c">; // "a" | "c"
type T2 = Extract<string | number | (() => void), Function>; // () => void
```

#### 9. `NonNullable<T>` —— 排除 null 和 undefined

```typescript
type T1 = NonNullable<string | null | undefined>; // string
type T2 = NonNullable<number | null>;              // number

// 典型使用场景：确保值不为空
function processValue(value: string | null | undefined) {
  const ensured: NonNullable<typeof value> = value ?? "default";
  console.log(ensured.toUpperCase()); // 安全
}
```

#### 10. `ReturnType<T>` —— 获取函数返回值类型

```typescript
function createUser(name: string): { id: string; name: string } {
  return { id: crypto.randomUUID(), name };
}

type UserReturn = ReturnType<typeof createUser>;
// { id: string; name: string; }

// 典型使用场景：根据函数推导返回值类型
async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}

type Data = Awaited<ReturnType<typeof fetchData<User>>>;
// User
```

#### 11. `Parameters<T>` —— 获取函数参数类型元组

```typescript
function greet(name: string, age: number, greeting: string): string {
  return `${greeting}, ${name}! You are ${age} years old.`;
}

type GreetParams = Parameters<typeof greet>;
// [name: string, age: number, greeting: string]

// 提取第一个参数类型
type FirstArg = Parameters<typeof greet>[0]; // string
```

#### 12. `ReadonlyArray<T>` —— 只读数组

```typescript
const arr: ReadonlyArray<number> = [1, 2, 3];
// arr.push(4); // Error
// arr[0] = 10; // Error
const first = arr[0]; // OK，只读
```

#### 13. 其他实用工具类型

```typescript
// NoInfer<T>（TypeScript 5.4+）—— 阻止 TypeScript 从某个位置推断类型
function createRoute<T>(path: string, handler: (params: T) => void): void {
  // ...
}
// 使用 NoInfer 防止从 handler 参数反推 T
function createRoute2<T>(path: string, handler: (params: NoInfer<T>) => void): void {}

// NoUndefined<T> —— 排除 undefined（自定义）
type NoUndefined<T> = T extends undefined ? never : T;

// DeepPartial<T> —— 深度 Partial（自定义）
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface NestedConfig {
  db: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
}

type PartialConfig = DeepPartial<NestedConfig>;
// 所有层级的属性都变为可选
```

### 二、工具类型组合使用

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  createdAt: Date;
  updatedAt: Date;
}

// 创建用户时的输入类型（排除自动生成的字段，所有字段可选用于部分更新）
type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">;
// { name: string; email: string; role: "admin" | "editor" | "viewer"; }

// 更新用户时的输入类型（排除自动生成的字段，所有字段可选）
type UpdateUserInput = Partial<CreateUserInput>;
// { name?: string; email?: string; role?: "admin" | "editor" | "viewer"; }

// 用户列表展示类型（只取需要的字段，且为只读）
type UserListItem = Readonly<Pick<User, "id" | "name" | "role">>;
// { readonly id: string; readonly name: string; readonly role: "admin" | "editor" | "viewer"; }

// API 响应类型
type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

type UserListResponse = ApiResponse<ReadonlyArray<UserListItem>>;
```

**考点：** 工具类型、Partial、Required、Readonly、Pick、Omit、Record、Exclude、Extract、ReturnType、Parameters、映射类型

---

---

### 题目7：什么是装饰器（Decorator）？类装饰器、方法装饰器、属性装饰器的使用？

**答案：**

### 一、装饰器的概念

装饰器（Decorator）是一种特殊的声明，可以附加到类、方法、属性、参数或访问器上，用于修改或扩展它们的行为。装饰器的本质是一个**高阶函数**，它接收目标元素并返回一个增强后的版本。

装饰器在 TypeScript 中是一项实验性功能，需要在 `tsconfig.json` 中启用：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

> **注意：** TypeScript 5.0 引入了新的装饰器标准（TC39 Stage 3），与传统的实验性装饰器语法不同。本题目主要讲解传统的实验性装饰器，因为目前大多数项目仍在使用。

### 二、五种装饰器类型

#### 1. 类装饰器（Class Decorator）

类装饰器应用于类构造函数，可以用来修改、替换或扩展类的行为。

```typescript
// 类装饰器函数签名
function classDecorator<T extends { new (...args: any[]): {} }>(
  constructor: T
) {
  return class extends constructor {
    newProperty = "new";
    hello() {
      return "override";
    }
  };
}

// 实际应用：为类添加日志功能
function LogClass(target: Function) {
  console.log(`Class ${target.name} is created`);
}

@LogClass
class MyClass {
  constructor() {
    console.log("MyClass instantiated");
  }
}
// 输出：Class MyClass is created

// 实际应用：单例模式
function Singleton<T extends { new (...args: any[]): {} }>(constructor: T) {
  let instance: any;
  return class extends constructor {
    constructor(...args: any[]) {
      if (instance) {
        return instance;
      }
      super(...args);
      instance = this;
    }
  };
}

@Singleton
class Database {
  constructor() {
    console.log("Database connection created");
  }
}

const db1 = new Database(); // "Database connection created"
const db2 = new Database(); // 不再输出，db2 === db1
console.log(db1 === db2);   // true
```

#### 2. 方法装饰器（Method Decorator）

方法装饰器应用于类的方法，可以用来监控、修改或替换方法的行为。

```typescript
// 方法装饰器函数签名
function methodDecorator(
  target: any,           // 类的原型（对于静态方法是类本身）
  propertyKey: string,   // 方法名
  descriptor: PropertyDescriptor  // 属性描述符
) {
  // ...
}

// 实际应用：日志记录
function Log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`${propertyKey} returned:`, result);
    return result;
  };

  return descriptor;
}

class Calculator {
  @Log
  add(a: number, b: number): number {
    return a + b;
  }

  @Log
  multiply(a: number, b: number): number {
    return a * b;
  }
}

const calc = new Calculator();
calc.add(2, 3);
// 输出：Calling add with args: [2, 3]
// 输出：add returned: 5

// 实际应用：性能监控
function MeasurePerformance(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    console.log(`${propertyKey} took ${end - start}ms`);
    return result;
  };

  return descriptor;
}

class DataService {
  @MeasurePerformance
  processData(data: number[]): number[] {
    return data.filter(n => n > 0).map(n => n * 2).sort();
  }
}

// 实际应用：防抖
function Debounce(delay: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    let timer: ReturnType<typeof setTimeout>;

    descriptor.value = function (...args: any[]) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        originalMethod.apply(this, args);
      }, delay);
    };

    return descriptor;
  };
}

class SearchComponent {
  @Debounce(300)
  onSearch(query: string) {
    console.log("Searching for:", query);
    // 发送 API 请求
  }
}
```

#### 3. 属性装饰器（Property Decorator）

属性装饰器应用于类的属性，可以用来添加元数据、验证等。

```typescript
// 属性装饰器函数签名
function propertyDecorator(
  target: any,        // 类的原型（对于静态属性是类本身）
  propertyKey: string // 属性名
) {
  // ...
}

// 实际应用：为属性添加元数据
function MinLength(min: number) {
  return function (target: any, propertyKey: string) {
    // 使用 Reflect.defineMetadata 存储元数据
    Reflect.defineMetadata("minLength", min, target, propertyKey);
  };
}

// 实际应用：只读属性
function ReadOnly(
  target: any,
  propertyKey: string,
  descriptor?: PropertyDescriptor
) {
  Object.defineProperty(target, propertyKey, {
    writable: false,
    configurable: true,
  });
}

class Config {
  @ReadOnly
  readonly version: string = "1.0.0";

  constructor() {
    this.version = "2.0.0"; // 严格模式下会报错
  }
}

// 实际应用：日志属性变化
function LogChanges(target: any, propertyKey: string) {
  let value: any;

  const getter = function () {
    return value;
  };

  const setter = function (newVal: any) {
    console.log(`${propertyKey} changed from ${value} to ${newVal}`);
    value = newVal;
  };

  Object.defineProperty(target, propertyKey, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true,
  });
}

class User {
  @LogChanges
  name: string = "";

  constructor(name: string) {
    this.name = name; // 输出：name changed from undefined to Alice
  }
}
```

#### 4. 参数装饰器（Parameter Decorator）

参数装饰器应用于方法的参数，通常与 `Reflect` 元数据 API 配合使用。

```typescript
// 参数装饰器函数签名
function parameterDecorator(
  target: any,        // 类的原型
  methodName: string, // 方法名
  parameterIndex: number // 参数在参数列表中的索引
) {
  // ...
}

// 实际应用：标记需要验证的参数
function Required(target: any, methodName: string, parameterIndex: number) {
  const existingRequired: number[] =
    Reflect.getOwnMetadata("required", target, methodName) || [];
  existingRequired.push(parameterIndex);
  Reflect.defineMetadata("required", existingRequired, target, methodName);
}

class UserService {
  createUser(@Required name: string, @Required email: string) {
    // 验证逻辑可以通过读取元数据自动生成
  }
}
```

#### 5. 访问器装饰器（Accessor Decorator）

访问器装饰器应用于 getter/setter，与方法装饰器类似。

```typescript
function Validate(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalSetter = descriptor.set;

  descriptor.set = function (value: any) {
    if (value < 0) {
      throw new Error("Value must be positive");
    }
    originalSetter?.call(this, value);
  };

  return descriptor;
}

class Temperature {
  private _celsius: number = 0;

  @Validate
  set celsius(value: number) {
    this._celsius = value;
  }

  get celsius(): number {
    return this._celsius;
  }
}

const temp = new Temperature();
temp.celsius = 25;   // OK
// temp.celsius = -5; // Error: Value must be positive
```

### 三、装饰器工厂

装饰器工厂是一个返回装饰器函数的函数，用于向装饰器传递参数。

```typescript
// 装饰器工厂
function Injectable(token: string) {
  return function (target: any) {
    Reflect.defineMetadata("injectToken", token, target);
  };
}

function Min(min: number) {
  return function (target: any, propertyKey: string) {
    // ...
  };
}

function Max(max: number) {
  return function (target: any, propertyKey: string) {
    // ...
  };
}

class Settings {
  @Min(0)
  @Max(100)
  volume: number = 50;
}
```

### 四、装饰器执行顺序

```typescript
@ClassDecorator
class Example {
  @PropertyDecorator
  property: string;

  @MethodDecorator
  method(@ParameterDecorator param: string) {}

  @AccessorDecorator
  get accessor(): string { return ""; }
}

// 执行顺序：
// 1. 属性装饰器
// 2. 方法装饰器
// 3. 参数装饰器
// 4. 访问器装饰器
// 5. 类装饰器
// 注意：同类型的多个装饰器从下往上执行（从右到左）
```

### 五、装饰器在实际框架中的应用

装饰器在 Angular、NestJS、TypeORM 等框架中被广泛使用：

```typescript
// NestJS 风格
@Controller("/users")
class UserController {
  @Get(":id")
  @UseGuards(AuthGuard)
  async getUser(@Param("id") id: string) {
    return this.userService.findById(id);
  }
}

// TypeORM 风格
@Entity("users")
class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
```

**考点：** 装饰器、类装饰器、方法装饰器、属性装饰器、参数装饰器、装饰器工厂、Reflect、执行顺序、元数据

---

---

### 题目8：TypeScript 的类型推导机制是什么？什么是类型窄化（Type Narrowing）？

**答案：**

### 一、类型推导（Type Inference）

类型推导是指 TypeScript 编译器根据上下文自动推断变量、表达式、函数返回值等的类型，无需开发者显式标注。良好的类型推导可以减少代码中的类型标注，同时保持类型安全。

#### 1. 变量初始化推导

```typescript
// TypeScript 根据初始值自动推导类型
let name = "Alice";           // 推导为 string（不是 "Alice" 字面量类型）
let age = 25;                 // 推导为 number
let isActive = true;          // 推导为 boolean
let items = [1, 2, 3];        // 推导为 number[]（不是 (number | number | number)[]）
let user = { name: "Alice", age: 25 }; // 推导为 { name: string; age: number }

// 注意：let 和 const 的推导结果不同
let x = "hello";    // string —— let 允许重新赋值，所以推导为宽类型
const y = "hello";  // "hello" —— const 不可变，所以推导为字面量类型
```

#### 2. 最佳通用类型（Best Common Type）

当需要从多个表达式推导出一个类型时，TypeScript 会计算它们的"最佳通用类型"。

```typescript
// 多个元素的数组 —— 推导为所有元素类型的联合
let arr = [1, "hello", true]; // (string | number | boolean)[]

// 多个对象 —— 推导为所有属性类型的交集
let obj = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30, email: "bob@example.com" },
];
// 推导为 ({ name: string; age: number; } | { name: string; age: number; email: string; })[]

// 显式类型标注可以覆盖推导
let arr2: (number | string)[] = [1, "hello", 2, "world"];
```

#### 3. 上下文类型推导（Contextual Typing）

TypeScript 可以根据使用位置（上下文）来推导类型，这在回调函数中尤为常见。

```typescript
// 事件处理器的类型推导
document.addEventListener("click", (event) => {
  // event 自动推导为 MouseEvent，无需显式标注
  console.log(event.clientX, event.clientY);
});

// 数组方法的回调
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter((n) => n % 2 === 0); // n 推导为 number

// Promise 的回调
const promise = new Promise<string>((resolve, reject) => {
  // resolve 推导为 (value: string) => void
  // reject 推导为 (reason?: any) => void
  resolve("hello");
});

// 根据上下文推导函数参数类型
type Callback = (data: string, index: number) => boolean;

function processItems(items: string[], callback: Callback) {
  return items.filter(callback);
}

processItems(["a", "b", "c"], (data, index) => {
  // data 推导为 string，index 推导为 number
  return data.length > index;
});
```

#### 4. 函数返回值推导

```typescript
// 根据返回语句自动推导
function add(a: number, b: number) {
  return a + b; // 推导返回类型为 number
}

function createUser(name: string) {
  return { name, id: crypto.randomUUID(), createdAt: new Date() };
  // 推导返回类型为 { name: string; id: string; createdAt: Date; }
}

// 如果返回语句有多个不同的类型，推导为联合类型
function getValue(flag: boolean) {
  if (flag) return "hello";
  return 42;
}
// 推导返回类型为 string | number
```

### 二、类型窄化（Type Narrowing）

类型窄化是指 TypeScript 在控制流分析中，根据条件判断将变量类型从宽类型收窄为窄类型的过程。类型窄化是 TypeScript 类型系统中最实用的特性之一。

#### 1. `typeof` 窄化

```typescript
function formatValue(value: string | number): string {
  if (typeof value === "string") {
    // value: string
    return value.toUpperCase();
  }
  // value: number
  return value.toFixed(2);
}
```

#### 2. `instanceof` 窄化

```typescript
function formatError(error: Error | string): string {
  if (error instanceof Error) {
    // error: Error
    return error.message;
  }
  // error: string
  return error;
}
```

#### 3. `in` 操作符窄化

```typescript
interface Car { drive(): void; type: "car"; }
interface Boat { sail(): void; type: "boat"; }

function travel(vehicle: Car | Boat) {
  if ("drive" in vehicle) {
    vehicle.drive(); // vehicle: Car
  } else {
    vehicle.sail();  // vehicle: Boat
  }
}
```

#### 4. 真值检查窄化（Truthiness Narrowing）

```typescript
function processValue(value: string | null | undefined) {
  if (value) {
    // value: string（排除了 null、undefined、""、0、false、NaN）
    console.log(value.toUpperCase());
  }
}

// 更精确的检查
function processValue2(value: string | null | undefined) {
  if (value !== null && value !== undefined) {
    // value: string
    console.log(value.toUpperCase());
  }
}
```

#### 5. 可辨识联合窄化（Discriminated Union Narrowing）

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}
```

#### 6. 赋值窄化（Assignment Narrowing）

```typescript
let x: string | number = "hello";
x.toUpperCase(); // OK，x 是 string

x = 42;
// x.toFixed(2); // OK，x 是 number
// x.toUpperCase(); // Error，x 是 number
```

#### 7. 控制流分析（Control Flow Analysis）

TypeScript 的控制流分析非常智能，能追踪变量在代码流中的类型变化。

```typescript
function example(x: string | number | boolean) {
  if (typeof x === "string") {
    x; // string
  } else if (typeof x === "number") {
    x; // number
  } else {
    x; // boolean
  }
}

// 对 null 的检查
function safeAccess(obj: { prop?: string }) {
  if (obj.prop !== undefined) {
    obj.prop; // string（不是 string | undefined）
  }
}

// 类型守卫函数
function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

const items: (string | undefined)[] = ["a", undefined, "b"];
const definedItems = items.filter(isDefined); // string[]
```

#### 8. `satisfies` 操作符（TypeScript 4.9+）

`satisfies` 用于验证表达式是否匹配某个类型，但不改变表达式的推导类型。

```typescript
// 不使用 satisfies —— 类型被拓宽
const config1 = {
  host: "localhost",
  port: 3000,
} as const;
// 类型是 { readonly host: "localhost"; readonly port: 3000; }

// 使用 satisfies —— 保持精确类型，同时验证类型正确
type Colors = "red" | "green" | "blue";
type RGB = [number, number, number];

const palette = {
  red: [255, 0, 0],
  green: [0, 255, 0],
  blue: [0, 0, 255],
} satisfies Record<Colors, RGB | string>;

// palette.red 推导为 [number, number, number]，而不是 RGB | string
// 但如果某个值不符合 RGB | string，会报错
```

**考点：** 类型推导、类型窄化、typeof、instanceof、in、可辨识联合、控制流分析、上下文类型、satisfies

---

---

### 题目9：TypeScript 中 enum 和 const enum 的区别？枚举的优缺点？

**答案：**

### 一、枚举（Enum）的基本概念

枚举是 TypeScript 提供的一种组织相关常量的方式，它将一组具名的常量值组织在一起，提高代码可读性。

```typescript
// 数字枚举 —— 默认从 0 开始自增
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right,   // 3
}

// 可以手动指定起始值
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  ServerError = 500,
}

// 字符串枚举 —— 每个成员必须手动赋值
enum UserRole {
  Admin = "ADMIN",
  Editor = "EDITOR",
  Viewer = "VIEWER",
}

// 混合枚举（不推荐）
enum Mixed {
  No = 0,
  Yes = "YES",
}
```

### 二、enum 和 const enum 的区别

#### 1. 普通 enum（Regular Enum）

普通枚举在编译后会生成真实的 JavaScript 对象代码。

```typescript
// TypeScript
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

// 编译后的 JavaScript
var Direction;
(function (Direction) {
  Direction[Direction["Up"] = 0] = "Up";
  Direction[Direction["Down"] = 1] = "Down";
  Direction[Direction["Left"] = 2] = "Left";
  Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
```

生成的 JavaScript 对象支持**反向映射**（从值到名称）：

```typescript
Direction.Up;     // 0
Direction[0];     // "Up" —— 反向映射
Direction["Up"];  // 0
```

#### 2. const enum（常量枚举）

常量枚举在编译后**不会生成任何 JavaScript 代码**，所有使用枚举值的地方会被内联替换为对应的常量值。

```typescript
// TypeScript
const enum Direction {
  Up,
  Down,
  Left,
  Right,
}

function move(dir: Direction) {
  // ...
}

move(Direction.Up);
move(Direction.Down);

// 编译后的 JavaScript
function move(dir) {
  // ...
}
move(0 /* Direction.Up */);
move(1 /* Direction.Down */);
```

#### 3. 核心区别对比

| 特性 | enum | const enum |
|------|------|------------|
| 编译产物 | 生成 JS 对象 | 内联替换，无额外代码 |
| 反向映射 | 支持 | 不支持 |
| 运行时访问 | 可以（`Direction.Up`） | 不可以 |
| 代码体积 | 较大（生成对象代码） | 较小（内联替换） |
| 作用域 | 有独立的作用域 | 无独立作用域 |
| 跨模块使用 | 正常 | 需要注意 isolatedModules |

```typescript
// const enum 的限制：不能在运行时使用
const enum Color {
  Red = "RED",
  Blue = "BLUE",
}

// const colors = Object.values(Color); // Error!
// const colorName = Color[0];           // Error!

// const enum 在 isolatedModules 模式下的限制
// 当 tsconfig.json 中设置了 "isolatedModules": true 时
// 跨文件使用 const enum 会报错
// 解决方案：使用普通 enum 或 as const 对象
```

### 三、枚举的优缺点

#### 优点

```typescript
// 1. 提高代码可读性
function handleRequest(method: HttpMethod) {
  switch (method) {
    case HttpMethod.Get:
      // 比 case "GET" 更有语义
      break;
    case HttpMethod.Post:
      break;
  }
}

// 2. 集中管理常量，避免魔法字符串/数字
enum HttpStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalServerError = 500,
}

// 3. 类型安全 —— 只能使用枚举中定义的值
function setRole(role: UserRole) {
  // role 只能是 "ADMIN" | "EDITOR" | "VIEWER"
}

setRole("ADMIN");        // Error，必须使用 UserRole.Admin
setRole(UserRole.Admin); // OK

// 4. 自动补全和重构支持
// IDE 可以自动列出所有枚举成员
```

#### 缺点

```typescript
// 1. 运行时开销 —— 普通 enum 会生成额外的 JavaScript 代码
// 2. 与 JavaScript 生态不兼容 —— 纯 JS 项目无法使用
// 3. 树摇（Tree Shaking）不友好 —— 即使只使用一个枚举值，整个枚举对象都会被打包
// 4. const enum 在 isolatedModules 模式下有限制
// 5. 数字枚举的反向映射可能导致意外行为
```

### 四、现代替代方案：`as const` + 联合类型

在 TypeScript 现代实践中，越来越多的开发者倾向于使用 `as const` 对象替代枚举，因为它更轻量、更符合 JavaScript 原生习惯。

```typescript
// 传统枚举方式
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

// 现代替代方案：as const 对象
const Direction = {
  Up: "UP",
  Down: "DOWN",
  Left: "LEFT",
  Right: "RIGHT",
} as const;

type Direction = typeof Direction[keyof typeof Direction];
// 类型为 "UP" | "DOWN" | "LEFT" | "RIGHT"

// 使用方式完全相同
function move(dir: Direction) {
  console.log(dir);
}

move(Direction.Up); // OK
// move("UP");       // Error，类型安全

// as const 的优势：
// 1. 零运行时开销 —— 编译后就是普通对象
// 2. 支持树摇 —— 未使用的值可以被移除
// 3. 兼容 JavaScript —— 纯 JS 也能使用
// 4. 更灵活 —— 可以是任意值类型
```

### 五、使用建议

| 场景 | 推荐方案 |
|------|---------|
| 需要反向映射 | 普通 `enum` |
| 性能敏感、内联替换 | `const enum`（注意 isolatedModules） |
| 现代项目、需要树摇 | `as const` 对象 + 联合类型 |
| 与后端 API 交互 | `as const` 对象 |
| 团队统一规范 | 选择一种方式，保持一致性 |

**考点：** enum、const enum、反向映射、编译产物、as const、联合类型、isolatedModules、树摇

---

---

### 题目10：什么是声明文件（.d.ts）？如何编写和使用声明文件？

**答案：**

### 一、声明文件的概念

声明文件（Declaration File）是 TypeScript 中用于描述 JavaScript 模块、库或全局变量类型的文件，文件扩展名为 `.d.ts`。它的作用是告诉 TypeScript 编译器某个 JavaScript 代码的类型信息，使得在 TypeScript 项目中使用 JavaScript 库时也能获得类型检查和智能提示。

声明文件中只能包含**类型声明**，不能包含任何可执行的 JavaScript 代码。

```typescript
// 声明文件示例：my-lib.d.ts
declare module "my-lib" {
  export function greet(name: string): string;
  export interface Config {
    host: string;
    port: number;
  }
  export class Logger {
    log(message: string): void;
  }
}
```

### 二、declare 关键字

`declare` 关键字用于告诉 TypeScript："这个变量/函数/类/模块已经存在，只需要声明它的类型，不需要实现。"

```typescript
// 声明全局变量
declare const GLOBAL_CONFIG: {
  apiBaseUrl: string;
  debug: boolean;
};

// 声明全局函数
declare function fetch(url: string, options?: RequestInit): Promise<Response>;

// 声明全局类
declare class jQuery {
  constructor(selector: string);
  html(content: string): this;
  css(prop: string, value: string): this;
  on(event: string, handler: (e: Event) => void): this;
  static ajax(options: any): Promise<any>;
}

// 声明全局类型
declare type Callback = (data: any) => void;

// 声明全局枚举
declare enum HttpStatus {
  OK = 200,
  NotFound = 404,
}
```

### 三、声明全局变量和模块

#### 1. 全局声明

```typescript
// globals.d.ts —— 声明全局变量
// 使用 declare global 时，不需要 declare 前缀

// 方式1：直接声明（在 .d.ts 文件中）
declare var process: {
  env: {
    NODE_ENV: string;
    API_URL: string;
  };
};

declare function setTimeout(callback: (...args: any[]) => void, ms: number): number;

// 方式2：使用 declare global（在模块文件中）
// some-module.ts
export {};

declare global {
  interface Window {
    myCustomProperty: string;
    myCustomMethod(): void;
  }

  // 扩展已有的全局接口
  interface String {
    toKebabCase(): string;
  }
}

// 使用
window.myCustomProperty = "hello";
"helloWorld".toKebabCase();
```

#### 2. 模块声明（declare module）

```typescript
// 声明第三方模块（没有类型定义的 npm 包）
declare module "lodash" {
  export function chunk<T>(array: T[], size: number): T[][];
  export function debounce(
    fn: (...args: any[]) => any,
    wait: number
  ): (...args: any[]) => void;
  export function throttle(
    fn: (...args: any[]) => any,
    wait: number
  ): (...args: any[]) => void;
}

// 声明模块的通配符
declare module "my-lib/*" {
  const value: any;
  export default value;
}

// 声明 UMD 模块（既可以通过 import 引入，也可以作为全局变量使用）
declare module "moment" {
  function moment(date?: string | number | Date): Moment;
  interface Moment {
    format(format?: string): string;
    add(amount: number, unit: string): Moment;
    subtract(amount: number, unit: string): Moment;
  }
  export = moment;
}
```

#### 3. 声明文件中的模块

```typescript
// types/my-module.d.ts
// 使用 "export" 而不是 "declare module"

export interface MyModuleOptions {
  debug?: boolean;
  version?: string;
}

export interface MyModule {
  init(options?: MyModuleOptions): void;
  doSomething(input: string): Promise<string>;
}

declare const _default: MyModule;
export default _default;
```

### 四、`/// <reference>` 指令

三斜线指令用于声明文件之间的依赖关系。

```typescript
/// <reference path="./other-types.d.ts" />
/// <reference types="node" />

// 声明依赖其他类型
interface MyConfig {
  path: string; // 来自 other-types.d.ts
}
```

### 五、常见声明文件模式

#### 1. 为 npm 包编写声明文件

```typescript
// node_modules/@types/my-lib/index.d.ts
// 或者项目中的 types/my-lib.d.ts

declare module "my-lib" {
  // 导出函数
  export function createApp(options: AppOptions): App;

  // 导出接口
  export interface AppOptions {
    port: number;
    host?: string;
    middleware?: Middleware[];
  }

  // 导出类
  export class App {
    constructor(options: AppOptions);
    listen(port: number): void;
    use(middleware: Middleware): this;
    close(): Promise<void>;
  }

  // 导出类型
  export type Middleware = (
    req: Request,
    res: Response,
    next: () => void
  ) => void;

  export interface Request {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: any;
  }

  export interface Response {
    status(code: number): this;
    json(data: any): this;
    send(data: string): this;
  }

  // 命名空间导出
  export namespace Utils {
    function formatDate(date: Date): string;
    function parseJSON(str: string): any;
  }
}
```

#### 2. 扩展第三方库的类型

```typescript
// 扩展 Express 的 Request 类型
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
    requestId?: string;
  }
}

// 扩展 Array 原型
interface Array<T> {
  myCustomMap<U>(callback: (item: T, index: number) => U): U[];
}

// 使用
[1, 2, 3].myCustomMap(n => n * 2);
```

#### 3. 声明图片等静态资源模块

```typescript
// 声明 .svg 文件模块
declare module "*.svg" {
  const content: string;
  export default content;
}

// 声明图片文件模块
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

// 声明 CSS Modules
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// 声明 JSON 文件（通常不需要，tsconfig 中 resolveJsonModule 即可）
declare module "*.json" {
  const value: any;
  export default value;
}
```

### 六、tsconfig.json 中的类型配置

```json
{
  "compilerOptions": {
    // 自动包含 node_modules/@types 下的类型声明
    "types": ["node", "jest"],

    // typeRoots 指定类型声明的搜索路径
    "typeRoots": ["./node_modules/@types", "./src/types"],

    // 不自动包含所有 @types 包（需要手动在 types 中指定）
    "types": []
  }
}
```

### 七、@types 组织

DefinitelyTyped 是一个社区维护的类型定义仓库，为没有内置类型定义的 JavaScript 库提供 `.d.ts` 文件。

```bash
# 安装第三方库的类型定义
npm install --save-dev @types/lodash
npm install --save-dev @types/express
npm install --save-dev @types/node
```

### 八、声明文件编写最佳实践

1. **不要在声明文件中写实现**，只写类型声明
2. **使用 `export` 导出**模块类型的声明，使用 `declare global` 扩展全局类型
3. **优先使用 DefinitelyTyped** 中已有的类型定义，不要重复造轮子
4. **使用 `strict` 模式**编写声明文件，确保类型精确
5. **善用泛型**，使声明文件更灵活

**考点：** 声明文件、.d.ts、declare、declare module、declare global、@types、DefinitelyTyped、三斜线指令、模块声明、全局声明

---

---

### 题目11：TypeScript 中 implements 和 extends 的区别？

**答案：**

### 一、核心区别

`implements` 和 `extends` 是 TypeScript 中两个不同的关键字，分别用于**实现接口**和**继承类**。它们的概念来自面向对象编程中的"接口实现"和"类继承"。

| 特性 | `implements` | `extends` |
|------|-------------|-----------|
| 作用对象 | 接口（Interface） | 类（Class） |
| 关系 | 实现契约 | 继承 |
| 多重性 | 可以实现多个接口 | 只能继承一个类 |
| 成员实现 | 必须实现接口中定义的所有成员 | 可以重写或直接使用父类成员 |
| 构造函数 | 不涉及 | 子类必须调用 `super()` |
| 类型检查 | 检查是否满足接口的结构 | 检查类型兼容性 |

### 二、extends —— 类继承

`extends` 用于创建一个类的子类，子类继承父类的所有属性和方法。

```typescript
// 基类
class Animal {
  constructor(public name: string) {}

  move(distance: number): void {
    console.log(`${this.name} moved ${distance} meters.`);
  }

  makeSound(): void {
    console.log("Some generic sound");
  }
}

// 子类继承父类
class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name); // 必须调用 super()
  }

  // 重写父类方法
  makeSound(): void {
    console.log("Woof! Woof!");
  }

  // 新增方法
  fetch(item: string): void {
    console.log(`${this.name} fetched the ${item}`);
  }
}

const dog = new Dog("Buddy", "Golden Retriever");
dog.move(10);       // 继承自 Animal
dog.makeSound();    // 重写的方法
dog.fetch("ball");  // Dog 特有的方法
console.log(dog.name);  // 继承自 Animal
console.log(dog.breed); // Dog 特有的属性
```

**继承链：**

```typescript
class Shape {
  constructor(public color: string) {}
  getArea(): number {
    return 0;
  }
}

class Rectangle extends Shape {
  constructor(color: string, public width: number, public height: number) {
    super(color);
  }

  getArea(): number {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  constructor(color: string, public side: number) {
    super(color, side, side);
  }
}

const square = new Square("red", 5);
console.log(square.getArea()); // 25
console.log(square.color);     // "red" —— 继承自 Shape
```

**方法重写规则：**

```typescript
class Parent {
  greet(): string {
    return "Hello from Parent";
  }

  // 使用 protected 允许子类访问
  protected secret(): string {
    return "Parent's secret";
  }
}

class Child extends Parent {
  // 重写方法 —— 返回类型必须兼容
  greet(): string {
    return "Hello from Child";
  }

  // 可以调用父类方法
  greetParent(): string {
    return super.greet(); // "Hello from Parent"
  }

  // 可以访问 protected 成员
  revealSecret(): string {
    return this.secret(); // OK
  }
}
```

### 三、implements —— 接口实现

`implements` 表示一个类承诺实现某个接口定义的所有属性和方法。接口只定义"形状"，不提供实现。

```typescript
// 定义接口
interface Serializable {
  serialize(): string;
}

interface Loggable {
  log(message: string): void;
}

interface Identifiable {
  id: string;
}

// 实现单个接口
class User implements Serializable {
  constructor(public id: string, public name: string) {}

  // 必须实现接口中定义的方法
  serialize(): string {
    return JSON.stringify({ id: this.id, name: this.name });
  }
}

// 实现多个接口
class Document implements Serializable, Loggable, Identifiable {
  constructor(public id: string, public content: string) {}

  serialize(): string {
    return JSON.stringify({ id: this.id, content: this.content });
  }

  log(message: string): void {
    console.log(`[${this.id}] ${message}`);
  }
}

const doc = new Document("1", "Hello World");
doc.serialize(); // '{"id":"1","content":"Hello World"}'
doc.log("Created"); // "[1] Created"
```

### 四、extends 和 implements 的组合使用

一个类可以同时继承一个类并实现多个接口。

```typescript
interface Printable {
  print(): void;
}

interface Scannable {
  scan(): string;
}

class Machine {
  constructor(public brand: string) {}

  start(): void {
    console.log(`${this.brand} machine started`);
  }
}

// 继承 Machine，同时实现 Printable 和 Scannable
class Printer extends Machine implements Printable, Scannable {
  constructor(brand: string, public ppm: number) {
    super(brand);
  }

  print(): void {
    console.log(`Printing at ${this.ppm} pages per minute`);
  }

  scan(): string {
    return "Scanned content";
  }
}

const printer = new Printer("HP", 30);
printer.start();  // 继承自 Machine
printer.print();  // 实现 Printable
printer.scan();   // 实现 Scannable
```

### 五、接口继承接口

接口也可以使用 `extends` 继承其他接口。

```typescript
interface BasicUser {
  id: string;
  name: string;
  email: string;
}

interface AdminUser extends BasicUser {
  permissions: string[];
  role: "admin" | "superadmin";
}

interface EditorUser extends BasicUser {
  canEdit: boolean;
  categories: string[];
}

// AdminUser 包含 BasicUser 的所有属性加上自己的属性
const admin: AdminUser = {
  id: "1",
  name: "Alice",
  email: "alice@example.com",
  permissions: ["read", "write", "delete"],
  role: "admin",
};

// 多接口继承
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface SoftDeletable {
  deletedAt: Date | null;
}

interface Auditable extends Timestamped, SoftDeletable {
  updatedBy: string;
}

// 类实现继承后的接口
class Record implements Auditable {
  constructor(
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
    public updatedBy: string
  ) {}
}
```

### 六、抽象类（Abstract Class）

抽象类是介于接口和普通类之间的概念，使用 `abstract` 关键字定义。抽象类可以包含已实现的方法和抽象方法（没有实现的方法）。

```typescript
// 抽象类
abstract class Shape {
  constructor(public color: string) {}

  // 抽象方法 —— 子类必须实现
  abstract getArea(): number;

  // 已实现的方法 —— 子类可以直接使用
  describe(): string {
    return `A ${this.color} shape with area ${this.getArea()}`;
  }
}

// 子类必须实现抽象方法
class Circle extends Shape {
  constructor(color: string, public radius: number) {
    super(color);
  }

  getArea(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(color: string, public width: number, public height: number) {
    super(color);
  }

  getArea(): number {
    return this.width * this.height;
  }
}

// 不能直接实例化抽象类
// const shape = new Shape("red"); // Error

const circle = new Circle("blue", 5);
console.log(circle.describe()); // "A blue shape with area 78.53981633974483"
```

### 七、接口 vs 抽象类

| 特性 | 接口（Interface） | 抽象类（Abstract Class） |
|------|------------------|------------------------|
| 多重实现 | 可以实现多个 | 只能继承一个 |
| 构造函数 | 无 | 有 |
| 字段初始化 | 不能 | 可以 |
| 方法实现 | 不能（TS 4.2+ 可以有默认实现） | 可以 |
| 访问修饰符 | 无 | 有（public、private、protected） |
| 使用场景 | 定义契约/规范 | 提供部分实现 + 强制子类实现 |

**考点：** implements、extends、接口、继承、抽象类、多重实现、方法重写、super、访问修饰符

---

---

### 题目12：TypeScript 中如何实现函数重载？

**答案：**

### 一、函数重载的概念

函数重载（Function Overloading）允许同一个函数根据传入参数的不同（类型、数量）具有不同的返回类型或行为。TypeScript 中的函数重载是一种**编译时类型检查机制**，最终编译为 JavaScript 后只有一个函数实现。

### 二、基本语法

函数重载由**重载签名（Overload Signatures）**和**实现签名（Implementation Signature）**组成：

```typescript
// 重载签名 —— 只包含类型声明，不包含实现
function reverse(value: string): string;
function reverse(value: number[]): number[];
function reverse(value: boolean): boolean;

// 实现签名 —— 包含实际的函数实现
// 实现签名的参数类型必须兼容所有重载签名
function reverse(value: string | number[] | boolean): string | number[] | boolean {
  if (typeof value === "string") {
    return value.split("").reverse().join("");
  }
  if (Array.isArray(value)) {
    return value.slice().reverse();
  }
  return !value;
}

// 使用 —— 根据参数类型自动匹配对应的重载签名
const r1 = reverse("hello");  // string —— 匹配第一个重载
const r2 = reverse([1, 2, 3]); // number[] —— 匹配第二个重载
const r3 = reverse(true);      // boolean —— 匹配第三个重载
```

### 三、实际应用场景

#### 1. 不同参数类型的重载

```typescript
// 根据参数类型返回不同类型
function parseInput(input: string): number;
function parseInput(input: number): string;
function parseInput(input: string | number): number | string {
  if (typeof input === "string") {
    return parseInt(input, 10);
  }
  return input.toString();
}

const result1 = parseInput("42");   // number
const result2 = parseInput(42);     // string
```

#### 2. 不同参数数量的重载

```typescript
// 不同参数数量
function createElement(tag: string): HTMLElement;
function createElement(tag: string, props: Record<string, string>): HTMLElement;
function createElement(tag: string, props: Record<string, string>, children: string[]): HTMLElement;
function createElement(tag: string, props?: Record<string, string>, children?: string[]): HTMLElement {
  const element = document.createElement(tag);
  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  if (children) {
    children.forEach(child => {
      element.appendChild(document.createTextNode(child));
    });
  }
  return element;
}

// 使用
const div1 = createElement("div");
const div2 = createElement("div", { class: "container" });
const div3 = createElement("div", { class: "container" }, ["Hello", "World"]);
```

#### 3. 联合类型参数的精确重载

```typescript
// 事件监听器重载
interface EventMap {
  click: MouseEvent;
  keydown: KeyboardEvent;
  scroll: UIEvent;
}

function addEventListener<K extends keyof EventMap>(
  element: HTMLElement,
  event: K,
  handler: (event: EventMap[K]) => void
): void;

function addEventListener(
  element: HTMLElement,
  event: string,
  handler: (event: Event) => void
): void;

function addEventListener(
  element: HTMLElement,
  event: string,
  handler: (event: any) => void
): void {
  element.addEventListener(event, handler);
}

// 使用 —— handler 的参数类型根据 event 自动推导
const button = document.querySelector("button")!;

addEventListener(button, "click", (e) => {
  // e 的类型是 MouseEvent
  console.log(e.clientX, e.clientY);
});

addEventListener(button, "keydown", (e) => {
  // e 的类型是 KeyboardEvent
  console.log(e.key);
});
```

#### 4. 类构造函数重载

```typescript
class DateTime {
  private date: Date;

  // 重载签名
  constructor(timestamp: number);
  constructor(dateString: string);
  constructor(year: number, month: number, day: number);
  constructor(date: Date);

  // 实现签名
  constructor(dateOrTimestampOrYear?: number | string | Date, month?: number, day?: number) {
    if (dateOrTimestampOrYear instanceof Date) {
      this.date = dateOrTimestampOrYear;
    } else if (typeof dateOrTimestampOrYear === "number") {
      if (month !== undefined && day !== undefined) {
        this.date = new Date(dateOrTimestampOrYear, month - 1, day);
      } else {
        this.date = new Date(dateOrTimestampOrYear);
      }
    } else if (typeof dateOrTimestampOrYear === "string") {
      this.date = new Date(dateOrTimestampOrYear);
    } else {
      this.date = new Date();
    }
  }

  format(pattern: string): string {
    // 格式化逻辑
    return this.date.toISOString();
  }
}

const dt1 = new DateTime(1700000000000); // 时间戳
const dt2 = new DateTime("2024-01-01");  // 日期字符串
const dt3 = new DateTime(2024, 1, 1);    // 年月日
const dt4 = new DateTime(new Date());     // Date 对象
```

### 四、方法重载

类的方法也支持重载：

```typescript
class List<T> {
  private items: T[] = [];

  // 方法重载
  get(index: number): T | undefined;
  get(start: number, end: number): T[];
  get(indexOrStart: number, end?: number): T | T[] | undefined {
    if (end !== undefined) {
      return this.items.slice(indexOrStart, end);
    }
    return this.items[indexOrStart];
  }
}

const list = new List<number>();
const item = list.get(0);       // number | undefined
const slice = list.get(0, 5);   // number[]
```

### 五、函数重载的注意事项

```typescript
// 1. 实现签名对外不可见
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  if (typeof value === "string") {
    return value.trim();
  }
  return value.toFixed(2);
}

// format(true); // Error —— 实现签名不接受 boolean
// 即使实现签名可以处理 boolean，但重载签名中没有声明，所以报错

// 2. 重载签名的顺序很重要
// TypeScript 从上到下匹配重载签名，使用第一个匹配的签名
function example(x: string): string;
function example(x: any): number;
function example(x: any): any {
  return x;
}

const r = example("hello"); // string —— 匹配第一个签名
const r2 = example(42);     // number —— 跳过第一个，匹配第二个

// 3. 实现签名的参数类型必须兼容所有重载签名
// 错误示例：
// function wrong(x: string): string;
// function wrong(x: number): number;
// function wrong(x: boolean): boolean;
// function wrong(x: any): any { ... }
// 这里的实现签名 x: any 是兼容的，但最好精确

// 4. 尽量把最精确的重载签名放在前面
```

### 六、替代方案：联合类型 + 条件返回类型

在某些场景下，可以使用条件类型替代函数重载，代码更简洁：

```typescript
// 函数重载方式
function process(value: string): string;
function process(value: number): number;
function process(value: string | number): string | number {
  return typeof value === "string" ? value.toUpperCase() : value * 2;
}

// 条件类型方式（更简洁）
function process<T extends string | number>(value: T): T extends string ? string : number {
  if (typeof value === "string") {
    return value.toUpperCase() as any;
  }
  return (value * 2) as any;
}

const r1 = process("hello"); // string
const r2 = process(42);     // number
```

**考点：** 函数重载、重载签名、实现签名、方法重载、构造函数重载、联合类型、条件类型

---

---

### 题目13：TypeScript 的 tsconfig.json 常用配置项有哪些？

**答案：**

### 一、tsconfig.json 概述

`tsconfig.json` 是 TypeScript 项目的配置文件，它位于项目根目录，定义了编译器选项、文件包含/排除规则等。TypeScript 编译器（`tsc`）会读取这个文件来确定如何编译代码。

```json
{
  "compilerOptions": {
    // 编译器选项
  },
  "include": [],
  "exclude": [],
  "files": [],
  "extends": "",
  "references": []
}
```

### 二、核心编译器选项

#### 1. 严格模式相关

```json
{
  "compilerOptions": {
    // 开启所有严格类型检查（推荐）
    "strict": true,

    // strict 包含以下所有选项：
    "strictNullChecks": true,       // 严格空值检查，null 和 undefined 不能赋值给其他类型
    "strictFunctionTypes": true,    // 严格函数类型检查，函数参数逆变
    "strictBindCallApply": true,    // 严格的 bind/call/apply 类型检查
    "strictPropertyInitialization": true, // 类属性必须在构造函数中初始化
    "noImplicitAny": true,          // 禁止隐式 any 类型
    "noImplicitThis": true,         // 禁止隐式 this 类型
    "alwaysStrict": true,           // 始终以严格模式输出 JS

    // 额外的严格选项
    "noUncheckedIndexedAccess": true,  // 索引访问结果包含 undefined（TypeScript 4.1+）
    "exactOptionalPropertyTypes": true // 精确的可选属性类型（TypeScript 4.4+）
  }
}
```

**strictNullChecks 示例：**

```typescript
// strictNullChecks: false（默认）
let name: string = null; // OK

// strictNullChecks: true
let name: string = null; // Error
let name: string | null = null; // OK，显式声明
```

**noUncheckedIndexedAccess 示例：**

```typescript
// noUncheckedIndexedAccess: false
const arr = [1, 2, 3];
const first = arr[0]; // number

// noUncheckedIndexedAccess: true
const arr = [1, 2, 3];
const first = arr[0]; // number | undefined（因为索引可能越界）
```

#### 2. 模块相关

```json
{
  "compilerOptions": {
    // 模块系统
    "module": "ESNext",          // 输出的模块系统：CommonJS、ESNext、AMD、UMD、ES6 等
    "moduleResolution": "bundler", // 模块解析策略：classic、node、bundler
    "target": "ES2020",          // 编译目标：ES3、ES5、ES2015、ES2020、ESNext 等
    "lib": ["ES2020", "DOM", "DOM.Iterable"], // 编译时包含的类型库定义

    // 模块解析相关
    "baseUrl": "./src",          // 模块解析的基础路径
    "paths": {                   // 路径映射（别名）
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@utils/*": ["utils/*"]
    },
    "rootDirs": ["src", "generated"], // 多个根目录
    "resolveJsonModule": true,   // 允许导入 JSON 模块
    "esModuleInterop": true,     // 允许 CommonJS 和 ES Module 互操作
    "allowSyntheticDefaultImports": true, // 允许从没有默认导出的模块中默认导入
    "isolatedModules": true,     // 确保每个文件可以独立转译（重要！Babel/swc 需要）
    "allowArbitraryExtensions": false, // 允许任意文件扩展名
    "noResolve": false           // 不自动添加引入的文件
  }
}
```

**paths 路径映射示例：**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

```typescript
// 不使用路径映射
import { Button } from "../../../components/Button";
import { formatDate } from "../../../utils/date";

// 使用路径映射
import { Button } from "@components/Button";
import { formatDate } from "@utils/date";
```

#### 3. 输出相关

```json
{
  "compilerOptions": {
    "outDir": "./dist",          // 输出目录
    "rootDir": "./src",          // 输入根目录
    "declaration": true,         // 生成 .d.ts 声明文件
    "declarationDir": "./types", // 声明文件输出目录
    "declarationMap": true,      // 生成声明文件的 source map
    "sourceMap": true,           // 生成 source map
    "noEmit": true,              // 不输出文件（只做类型检查）
    "emitDeclarationOnly": true, // 只输出声明文件
    "removeComments": true,      // 移除注释
    "preserveConstEnums": true,  // 保留 const enum
    "downlevelIteration": true,  // 降级 for...of 等迭代语法
    "importHelpers": true        // 从 tslib 导入辅助函数
  }
}
```

#### 4. 类型检查相关

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,      // 报告未使用的局部变量
    "noUnusedParameters": true,  // 报告未使用的函数参数
    "noImplicitReturns": true,   // 函数所有路径都必须有返回值
    "noFallthroughCasesInSwitch": true, // switch 语句必须有 break
    "noPropertyAccessFromIndexSignature": true, // 禁止通过索引签名访问已知属性
    "allowUnusedLabels": false,  // 不允许未使用的标签
    "allowUnreachableCode": false, // 不允许不可达代码
    "exactOptionalPropertyTypes": true // 可选属性不能显式赋值 undefined
  }
}
```

**noImplicitReturns 示例：**

```typescript
// noImplicitReturns: false
function getLength(value: string | null): number {
  if (value === null) {
    return; // 隐式返回 undefined
  }
  return value.length;
}

// noImplicitReturns: true
// 上面的函数会报错，因为 if 分支隐式返回了 undefined
// 修复：
function getLength(value: string | null): number {
  if (value === null) {
    return 0; // 显式返回
  }
  return value.length;
}
```

#### 5. JSX 相关

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",          // JSX 模式：preserve、react、react-jsx、react-native
    "jsxFactory": "React.createElement", // JSX 工厂函数
    "jsxFragmentFactory": "React.Fragment", // JSX Fragment 工厂函数
    "jsxImportSource": "react"   // JSX 导入源（react-jsx 模式下）
  }
}
```

#### 6. 实验性功能

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,  // 启用装饰器
    "emitDecoratorMetadata": true    // 为装饰器生成元数据
  }
}
```

### 三、文件包含/排除

```json
{
  // 包含的文件/目录（glob 模式）
  "include": [
    "src/**/*",
    "tests/**/*"
  ],

  // 排除的文件/目录
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts",
    "**/*.test.ts"
  ],

  // 显式包含的文件（优先级高于 include/exclude）
  "files": [
    "src/index.ts",
    "src/types.d.ts"
  ]
}
```

### 四、项目引用（Project References）

TypeScript 支持项目引用，将大型项目拆分为多个子项目。

```json
// 根目录 tsconfig.json
{
  "references": [
    { "path": "./core" },
    { "path": "./web" },
    { "path": "./server" }
  ]
}

// core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,    // 启用项目引用
    "declaration": true,
    "outDir": "../dist/core"
  },
  "include": ["src/**/*"]
}

// web/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "../dist/web",
    "references": [
      { "path": "../core" }  // 引用 core 项目
    ]
  },
  "include": ["src/**/*"]
}
```

### 五、extends 继承配置

```json
// tsconfig.base.json —— 基础配置
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}

// tsconfig.json —— 继承基础配置并覆盖
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}
```

### 六、推荐的配置模板

```json
{
  "compilerOptions": {
    // 严格模式
    "strict": true,
    "noUncheckedIndexedAccess": true,

    // 模块
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    // JSX
    "jsx": "react-jsx",

    // 路径
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    // 输出
    "noEmit": true,
    "declaration": true,
    "sourceMap": true,

    // 代码质量
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**考点：** tsconfig.json、strict、module、target、paths、declaration、sourceMap、noEmit、includes、extends、Project References

---

---

### 题目14：TypeScript 中 never 类型的使用场景？

**答案：**

### 一、never 类型的定义

`never` 是 TypeScript 类型系统中的**底部类型（Bottom Type）**，表示永远不会出现的值的类型。它是所有类型的子类型，但没有任何类型是它的子类型（除了 `never` 自身）。

```typescript
// never 是所有类型的子类型
let n: never;
let s: string = n;    // OK
let num: number = n;  // OK
let obj: object = n;  // OK

// 没有任何值可以赋值给 never（除了 never 自身）
let n2: never = "hello"; // Error
let n3: never = 42;      // Error
let n4: never = null;    // Error
let n5: never = undefined; // Error
let n6: never = n;       // OK，never 可以赋值给 never
```

### 二、never 的核心使用场景

#### 场景1：永远不会返回的函数

当函数永远不会有正常的返回值时（总是抛出异常或进入无限循环），其返回类型就是 `never`。

```typescript
// 抛出异常的函数
function throwError(message: string): never {
  throw new Error(message);
}

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

// 无限循环
function infiniteLoop(): never {
  while (true) {
    // 永远不会退出
  }
}

// 进程退出
function exitProcess(code: number): never {
  process.exit(code);
}

// 在控制流中，throwError 之后的代码永远不会执行
function processValue(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
    return;
  }

  if (typeof value === "number") {
    console.log(value.toFixed(2));
    return;
  }

  // value 的类型在这里是 never（因为所有可能的情况都已处理）
  // 如果在前面添加了新的类型分支但没有在这里处理，TypeScript 会报错
  const exhaustiveCheck: never = value;
}
```

#### 场景2：穷尽检查（Exhaustive Check）

这是 `never` 最重要、最实用的使用场景。在 `switch` 或 `if-else` 中，利用 `never` 类型可以确保所有联合类型的成员都被处理了。如果未来新增了类型但没有处理，TypeScript 会在编译时报错。

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      // 如果 Shape 新增了成员（如 "square"）但没有处理，
      // shape 在 default 分支的类型是 "square"，不是 never
      // 赋值给 never 会报编译错误，从而提醒开发者
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}

// 实际示例：状态机
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: Error };

function handleState(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "Ready to send request";
    case "loading":
      return "Request is in progress...";
    case "success":
      return `Data received: ${state.data}`;
    case "error":
      return `Error: ${state.error.message}`;
    default:
      const _exhaustiveCheck: never = state;
      return _exhaustiveCheck;
  }
}
```

#### 场景3：类型收窄中的 never

在类型守卫中，当所有可能的类型都被排除后，剩余的类型就是 `never`。

```typescript
type NetworkState =
  | { state: "online"; latency: number }
  | { state: "offline" }
  | { state: "degraded"; latency: number; packetLoss: number };

function checkNetwork(ns: NetworkState): string {
  if (ns.state === "online") {
    return `Online, latency: ${ns.latency}ms`;
  }

  if (ns.state === "offline") {
    return "Offline";
  }

  // 此处 ns 的类型被收窄为 { state: "degraded"; latency: number; packetLoss: number }
  return `Degraded, latency: ${ns.latency}ms, packet loss: ${ns.packetLoss}%`;
}

// 更复杂的类型收窄
type Admin = { role: "admin"; permissions: string[] };
type Editor = { role: "editor"; canPublish: boolean };
type Viewer = { role: "viewer" };
type User = Admin | Editor | Viewer;

function getPermissions(user: User): string[] {
  if (user.role === "admin") {
    return user.permissions;
  }

  if (user.role === "editor") {
    return user.canPublish ? ["read", "write", "publish"] : ["read", "write"];
  }

  // 此处 user 的类型是 Viewer
  return ["read"];
}
```

#### 场景4：不可能的类型组合

`never` 可以表示不可能的类型组合，常用于条件类型中。

```typescript
// 如果 T 不是 string，则返回 never
type OnlyString<T> = T extends string ? T : never;

type A = OnlyString<string>;   // string
type B = OnlyString<number>;   // never
type C = OnlyString<"hello">;  // "hello"

// Exclude 的实现原理
type MyExclude<T, U> = T extends U ? never : T;

type D = MyExclude<"a" | "b" | "c", "a">; // "b" | "c"
// 原理：
// "a" extends "a" ? never : "a" => never
// "b" extends "a" ? never : "b" => "b"
// "c" extends "a" ? never : "c" => "c"
// 合并：never | "b" | "c" => "b" | "c"

// Extract 的实现原理
type MyExtract<T, U> = T extends U ? T : never;

type E = MyExtract<"a" | "b" | "c", "a" | "b">; // "a" | "b"
```

#### 场景5：不可能的函数重载

```typescript
// 表示某些参数组合是不允许的
function createWindow(options: { fullscreen: true }): void;
function createWindow(options: { fullscreen: false; width: number; height: number }): void;
function createWindow(options: any): void {
  // 实现
}

// OK
createWindow({ fullscreen: true });
createWindow({ fullscreen: false, width: 800, height: 600 });

// Error：fullscreen 为 false 时必须提供 width 和 height
// createWindow({ fullscreen: false });
```

#### 场景6：工具类型中的 never

```typescript
// 移除联合类型中的某些类型
type RemoveString<T> = T extends string ? never : T;

type Result = RemoveString<string | number | boolean | string[]>;
// number | boolean | string[]
// string 被移除了，string[] 没有被移除（string[] 不是 string）

// 如果要移除 string 和 string[]：
type RemoveAllString<T> = T extends string ? never : T;
// 需要更精确的条件
type RemoveAllStrings<T> = T extends string | string[] ? never : T;

// 在映射类型中使用 never 来过滤属性
type RemoveMethods<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

class Example {
  name = "hello";
  age = 25;
  greet() { return "hi"; }
}

type ExampleData = RemoveMethods<Example>;
// { name: string; age: number; }
// greet 方法被过滤掉了
```

### 三、never 与 void 的区别

```typescript
// void —— 函数没有返回值（正常返回，只是没有值）
function log(message: string): void {
  console.log(message);
  // 函数正常执行完毕，只是不返回任何值
}

// never —— 函数永远不会正常返回
function fail(message: string): never {
  throw new Error(message);
  // 函数永远不会正常返回，要么抛出异常，要么永远不退出
}

// 关键区别：
// void 类型的函数可以正常返回（只是返回 undefined）
// never 类型的函数永远无法正常返回

// void 可以被赋值
let v: void = undefined; // OK

// never 不能被赋值（除了 never 自身）
let n: never = undefined; // Error
```

### 四、never 的类型推导

```typescript
// TypeScript 会自动推导某些场景下的 never 类型

// 1. 永远为 false 的条件类型
type Impossible = string & number; // never（string 和 number 没有交集）

// 2. 空的联合类型
type EmptyUnion = never; // never 是空的联合类型

// 3. 在控制流中的 never
function example(x: string | number) {
  if (typeof x === "string") {
    x; // string
  } else if (typeof x === "number") {
    x; // number
  } else {
    x; // never —— 所有情况都已处理
  }
}
```

**考点：** never、底部类型、穷尽检查、类型收窄、条件类型、Exclude、void 与 never 的区别、Exhaustive Check

---

---

### 题目15：什么是 Utility Types？手写实现 Pick、Omit、Partial 等工具类型？

**答案：**

### 一、Utility Types 概述

Utility Types（工具类型）是 TypeScript 内置的一组泛型类型工具，用于基于已有类型快速生成新的类型。它们本质上都是使用 TypeScript 的高级类型特性（映射类型、条件类型、`infer` 等）实现的。

### 二、手写实现核心工具类型

#### 1. `Partial<T>` —— 将所有属性变为可选

```typescript
// 原理：遍历 T 的所有属性，为每个属性添加 ? 修饰符
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// 测试
interface User {
  id: string;
  name: string;
  email: string;
}

type PartialUser = MyPartial<User>;
// { id?: string; name?: string; email?: string; }

// 使用示例
function updateUser(id: string, updates: MyPartial<User>): void {
  // ...
}

updateUser("1", { name: "New Name" }); // 只更新 name
```

#### 2. `Required<T>` —— 将所有属性变为必选

```typescript
// 原理：遍历 T 的所有属性，使用 -? 移除可选修饰符
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

// 测试
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

type RequiredConfig = MyRequired<Config>;
// { host: string; port: number; debug: boolean; }
```

#### 3. `Readonly<T>` —— 将所有属性变为只读

```typescript
// 原理：遍历 T 的所有属性，添加 readonly 修饰符
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// 测试
interface Point {
  x: number;
  y: number;
}

type ReadonlyPoint = MyReadonly<Point>;
// { readonly x: number; readonly y: number; }
```

#### 4. `Pick<T, K>` —— 从 T 中选取部分属性

```typescript
// 原理：遍历 K 中的每个属性键，从 T 中取出对应的值类型
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 测试
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

type UserPreview = MyPick<User, "id" | "name">;
// { id: string; name: string; }

type UserCredentials = MyPick<User, "email" | "password">;
// { email: string; password: string; }
```

#### 5. `Omit<T, K>` —— 从 T 中排除部分属性

```typescript
// 原理：先获取 T 的所有属性键，然后排除 K 中的键，再用 Pick 选取剩余的键
// 方式1：使用 Pick + Exclude
type MyOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// 方式2：使用映射类型 + 条件类型（更直观）
type MyOmit2<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// 测试
type SafeUser = MyOmit<User, "password" | "createdAt">;
// { id: string; name: string; email: string; }
```

#### 6. `Record<K, V>` —— 构造键值对类型

```typescript
// 原理：将 K 中的每个键映射为 V 类型的值
type MyRecord<K extends string | number | symbol, V> = {
  [P in K]: V;
};

// 测试
type PageInfo = MyRecord<string, { title: string; url: string }>;
// { [x: string]: { title: string; url: string; } }

type RoleMap = MyRecord<"admin" | "editor" | "viewer", string[]>;
// { admin: string[]; editor: string[]; viewer: string[]; }
```

#### 7. `Exclude<T, U>` —— 从联合类型 T 中排除 U

```typescript
// 原理：分布式条件类型，如果 T 的成员 extends U 则返回 never，否则返回该成员
type MyExclude<T, U> = T extends U ? never : T;

// 测试
type T1 = MyExclude<"a" | "b" | "c", "a">;     // "b" | "c"
type T2 = MyExclude<string | number | boolean, number>; // string | boolean
```

#### 8. `Extract<T, U>` —— 从联合类型 T 中提取 U

```typescript
// 原理：与 Exclude 相反，如果 T 的成员 extends U 则返回该成员，否则返回 never
type MyExtract<T, U> = T extends U ? T : never;

// 测试
type T1 = MyExtract<"a" | "b" | "c", "a" | "c">; // "a" | "c"
type T2 = MyExtract<string | number | (() => void), Function>; // () => void
```

#### 9. `NonNullable<T>` —— 排除 null 和 undefined

```typescript
// 原理：使用 Exclude 排除 null 和 undefined
type MyNonNullable<T> = T extends null | undefined ? never : T;

// 测试
type T1 = MyNonNullable<string | null | undefined>; // string
type T2 = MyNonNullable<number | null>;              // number
```

#### 10. `ReturnType<T>` —— 获取函数返回值类型

```typescript
// 原理：使用条件类型 + infer 推断返回值类型
type MyReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : any;

// 测试
type R1 = MyReturnType<() => string>;                // string
type R2 = MyReturnType<(x: number) => boolean>;       // boolean
type R3 = MyReturnType<() => { id: string; name: string }>; // { id: string; name: string; }
```

#### 11. `Parameters<T>` —— 获取函数参数类型元组

```typescript
// 原理：使用条件类型 + infer 推断参数类型
type MyParameters<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

// 测试
type P1 = MyParameters<(name: string, age: number) => void>; // [name: string, age: number]
type P2 = MyParameters<() => void>;                           // []
type FirstArg = MyParameters<(a: string, b: number) => void>[0]; // string
```

### 三、进阶工具类型手写实现

#### 1. `DeepPartial<T>` —— 深度 Partial

```typescript
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// 测试
interface NestedConfig {
  db: {
    host: string;
    port: number;
    auth: {
      username: string;
      password: string;
    };
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
}

type PartialConfig = DeepPartial<NestedConfig>;
// 所有层级的属性都变为可选
const config: PartialConfig = {
  db: {
    // host 和 port 都是可选的
    auth: {
      // username 和 password 都是可选的
    },
  },
};
```

#### 2. `DeepReadonly<T>` —— 深度 Readonly

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// 测试
interface Data {
  user: {
    name: string;
    address: {
      city: string;
      zip: string;
    };
  };
}

type ReadonlyData = DeepReadonly<Data>;
// 所有层级的属性都变为只读
```

#### 3. `DeepRequired<T>` —— 深度 Required

```typescript
type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};
```

#### 4. `Mutable<T>` —— 移除 readonly

```typescript
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

// 测试
interface ReadonlyUser {
  readonly id: string;
  readonly name: string;
}

type MutableUser = Mutable<ReadonlyUser>;
// { id: string; name: string; } —— 不再是 readonly
```

#### 5. `RequiredBy<T, K>` —— 将指定属性变为必选

```typescript
type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// 测试
interface Form {
  name?: string;
  email?: string;
  phone?: string;
}

type RequiredForm = RequiredBy<Form, "name" | "email">;
// { name: string; email: string; phone?: string; }
// name 和 email 变为必选，phone 仍然是可选
```

#### 6. `OptionalBy<T, K>` —— 将指定属性变为可选

```typescript
type OptionalBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 测试
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

type UpdateUser = OptionalBy<User, "name" | "email" | "password">;
// { id: string; name?: string; email?: string; password?: string; }
// 只有 id 是必选的
```

#### 7. `DeepOmit<T, K>` —— 深度 Omit

```typescript
type DeepOmit<T, Paths extends string> =
  T extends object
    ? {
        [K in keyof T as K extends Paths ? never : K]: DeepOmit<T[K], Paths>;
      }
    : T;

// 测试
interface ApiData {
  user: {
    id: string;
    name: string;
    password: string;
    profile: {
      avatar: string;
      bio: string;
    };
  };
  meta: {
    timestamp: string;
    debug: boolean;
  };
}

type SanitizedData = DeepOmit<ApiData, "password" | "debug">;
// 移除了所有层级的 password 和 debug 字段
```

#### 8. `UnionToIntersection<T>` —— 联合类型转交叉类型

```typescript
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

// 测试
type Result = UnionToIntersection<{ a: string } | { b: number }>;
// { a: string } & { b: number }
```

#### 9. `PromiseType<T>` —— 提取 Promise 内部类型

```typescript
type PromiseType<T> = T extends Promise<infer U> ? U : T;

// 测试
type T1 = PromiseType<Promise<string>>;  // string
type T2 = PromiseType<Promise<number>>;  // number
type T3 = PromiseType<string>;           // string

// 深度解包
type DeepPromiseType<T> = T extends Promise<infer U>
  ? DeepPromiseType<U>
  : T;

type T4 = DeepPromiseType<Promise<Promise<string>>>; // string
```

### 四、工具类型的组合使用

```typescript
// 实际开发中，工具类型经常组合使用

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// 创建用户 DTO —— 排除自动生成的字段
type CreateUserDTO = Omit<User, "id" | "createdAt" | "updatedAt">;

// 更新用户 DTO —— 排除自动生成的字段，所有字段可选
type UpdateUserDTO = Partial<CreateUserDTO>;

// 用户列表展示 —— 只取需要的字段，只读
type UserListItem = Readonly<Pick<User, "id" | "name" | "role">>;

// 用户详情展示 —— 排除敏感字段
type UserDetail = Omit<User, "password">;

// API 响应
type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

type UserListResponse = ApiResponse<ReadonlyArray<UserListItem>>;
type UserDetailResponse = ApiResponse<UserDetail>;
type CreateUserResponse = ApiResponse<User>;
```

**考点：** 工具类型、映射类型、条件类型、infer、keyof、Partial、Required、Readonly、Pick、Omit、Record、Exclude、Extract、ReturnType、Parameters、DeepPartial、DeepReadonly

---

> 以上 15 道面试题覆盖了 TypeScript 的核心知识点，包括类型系统基础、高级类型、泛型、装饰器、类型推导、声明文件、配置等。建议在面试前结合实际项目经验进行练习，理解每个概念背后的设计原理和使用场景。