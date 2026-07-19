const nums = [1, 2, 3, 4, 5];
console.log(nums instanceof Array);
// prototype 是构造函数特有的  __proto__ 是对象特有的指向原型的指针
function myInstanceof(left, right) {
  let leftProto = left.__proto__;
  while (leftProto) {
    console.log(leftProto);
    if (leftProto === right.prototype) {
      return true;
    }
    leftProto = leftProto.__proto__;
  }
  return false;
}

console.log(myInstanceof(nums, Object));
console.log(Object.__proto__);
console.log(Object.prototype);
