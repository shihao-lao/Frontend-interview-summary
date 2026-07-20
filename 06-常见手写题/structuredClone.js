function myDeepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (map.has(obj)) {
    return map.get(obj);
  }
  if (obj instanceof Date) {
    return new Date(obj);
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  const cloned = Array.isArray(obj) ? [] : {};
  map.set(obj, cloned);
  // 静态方法返回目标对象自身属性键数组 包括symbol类型 不会像for in 去查找原型链上的属性
  for (const key of Reflect.ownKeys(obj)) {
    cloned[key] = myDeepClone(obj[key], map);
  }
  return cloned;
}
const nums = [1, 2, 3]
// console.log(Reflect.ownKeys(nums))
const num = { length: 3, 1: 1, 2: 2, 3: 3 }
const numArr = myDeepClone(nums)
console.log(numArr) 
