const arr = [
  {
    id: 1,
    parentId: 0,
    name: "111",
  },
  {
    id: 2,
    parentId: 0,
    name: "222",
  },
  {
    id: 3,
    parentId: 1,
    name: "333",
  },
  {
    id: 4,
    parentId: 2,
    name: "444",
  },
];
function arrToTree(arr) {
  const ans = [];
  const map = new Map();
  arr.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });
  for (let i of arr) {
    if (i.parentId === 0 || i.parentId === null) {
      ans.push(map.get(i.id));
    } else {
      map.get(i.parentId).children.push(map.get(i.id));
    }
  }
  return ans;
}
console.log(arrToTree(arr));
