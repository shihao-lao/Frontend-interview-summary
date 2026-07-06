const arr = [1, 2, 3, 4, 5, 3, 2, 1];

//z 1. 使用 Set 去重
console.log(Array.from(new Set(arr)));
// 2, 使用 filter 去重
console.log(
  arr.filter((item, index) => {
    return arr.indexOf(item) === index;
  })
);
// 3,使用reduce去重(第二个参数表示初始值)
console.log(
  arr.reduce((pre, cur) => {
    if (!pre.includes(cur)) {
      pre.push(cur);
    }
    return pre;
  }, [])
);
//4.使用map去重
const map = new Map();
const res = [];
for (const item of arr) {
  if (!map.has(item)) {
    map.set(item, true);
    res.push(item);
  }
}
console.log(res);
