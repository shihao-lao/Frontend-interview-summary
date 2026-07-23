Object.prototype.myAssign = function (target, ...sources) {
    if (target === null) {
        throw new TypeError('Cannot convert null to object')
    }
    const to = Object(target)
    for (const source of sources) {
        if (source === null) {
            continue
        }
        for (const key of Reflect.ownKeys(source)) {
            to[key] = source[key]
            const srcObj = Object(source); // 防止 source 是基本类型
            const desc = Object.getOwnPropertyDescriptor(srcObj, key);
            console.log(desc)
            if (desc && desc.enumerable) {
                // 用 defineProperty 而非直接赋值
                // 原因：如果 source[key] 是 getter，直接赋值会触发一次 getter + 一次 target 的 setter
                // defineProperty 可以精确地把描述符搬过来（包括 value/get/set）
                Object.defineProperty(to, key, desc);
            }
        }
    }
    return to
}

const a = Object.myAssign({}, { a: 1 }, { b: 2 }, { c: 3 })
console.log(Object.getPrototypeOf(a))
console.log(a)
// { a: 1, b: 2, c: 3 }

const proto = Object.getPrototypeOf(a)
console.log(Object.prototype  === proto)
