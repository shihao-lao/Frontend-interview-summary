function myNew(constructor, ...args) {
    if (typeof constructor !== 'function') {
        throw new TypeError(`${constructor} is not a constructor`);
    }
    
    const obj = Object.create(constructor.prototype);
    const result = constructor.apply(obj, args);
    
    return result instanceof Object ? result : obj;
}
function Person(name, age) {
    this.name = name;
    this.age = age;
}

const p = myNew(Person, "adc", 18);
console.log(p);