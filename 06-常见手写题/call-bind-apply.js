Function.prototype.mycall = function (thisArg, ...args) {
  // 处理 null/undefined -> 全局对象
  if (thisArg == null) {
    thisArg = globalThis;
  }
  // 原始值包装为对象
  thisArg = Object(thisArg);

  const fn = Symbol(); // 用 Symbol 避免属性冲突
  thisArg[fn] = this; // 把当前函数挂到 context 上
  const result = thisArg[fn](...args); // 通过 context 调用，this 自然指向 context
  delete thisArg[fn]; // 清理临时属性
  return result;
};
Function.prototype.myApply = function (thisArg, args) {
  if (thisArg == null) {
    thisArg = globalThis;
  }
  thisArg = Object(thisArg);
  const fn = Symbol();
  console.log(this);
  thisArg[fn] = this;
  const result = thisArg[fn](...args);
  delete thisArg[fn];
  return result;
};

Function.prototype.mybind = function (thisArg, ...args) {
  if (thisArg == null) {
    thisArg = globalThis;
  }
  thisArg = Object(thisArg);
  const originalFn = this;
  // 注：bind 返回的是一个函数，绑定this 并且支持柯里化
  return function (...innerArgs) {
    return originalFn.call(thisArg, ...args, ...innerArgs);
  };
};

function add(a, b) {
  return a + b;
}
console.log(add.mycall("adc", 1, 2));
console.log(add.myApply("adc", [1, 2]));
console.log(add.mybind("adc", 1, 2));
console.log(globalThis);
