JavaScript arrays come with many built-in methods. Here are the most commonly used ones grouped by purpose:

## 1. Adding & Removing Elements

```js
let arr = [1, 2, 3];
```

| Method      | Description                     |
| ----------- | ------------------------------- |
| `push()`    | Add element(s) to the end       |
| `pop()`     | Remove last element             |
| `unshift()` | Add element(s) to the beginning |
| `shift()`   | Remove first element            |

```js
arr.push(4);      // [1,2,3,4]
arr.pop();        // [1,2,3]

arr.unshift(0);   // [0,1,2,3]
arr.shift();      // [1,2,3]
```

---

## 2. Searching Elements

| Method          | Description                    |
| --------------- | ------------------------------ |
| `indexOf()`     | Returns first matching index   |
| `lastIndexOf()` | Returns last matching index    |
| `includes()`    | Checks if element exists       |
| `find()`        | Returns first matching element |
| `findIndex()`   | Returns index of first match   |

```js
let nums = [10, 20, 30, 40];

nums.includes(20);          // true
nums.indexOf(30);           // 2
nums.find(n => n > 25);     // 30
nums.findIndex(n => n > 25);// 2
```

---

## 3. Iteration Methods

| Method      | Description                                |
| ----------- | ------------------------------------------ |
| `forEach()` | Executes function for each element         |
| `map()`     | Creates new array by transforming elements |
| `filter()`  | Creates new array with matching elements   |
| `reduce()`  | Reduces array to a single value            |
| `some()`    | Checks if at least one element matches     |
| `every()`   | Checks if all elements match               |

```js
let arr = [1, 2, 3, 4];

arr.forEach(x => console.log(x));

let doubled = arr.map(x => x * 2);
// [2,4,6,8]

let even = arr.filter(x => x % 2 === 0);
// [2,4]

let sum = arr.reduce((acc, cur) => acc + cur, 0);
// 10

arr.some(x => x > 3);   // true
arr.every(x => x > 0);  // true
```

---

## 4. Modifying Arrays

| Method         | Description              |
| -------------- | ------------------------ |
| `splice()`     | Add/remove elements      |
| `slice()`      | Extract portion of array |
| `concat()`     | Merge arrays             |
| `fill()`       | Fill array with value    |
| `copyWithin()` | Copies part of array     |

```js
let arr = [1, 2, 3, 4];

arr.splice(1, 2);
// [1,4]

arr.slice(0, 2);
// [1,2]

[1,2].concat([3,4]);
// [1,2,3,4]
```

---

## 5. Sorting & Reversing

| Method      | Description   |
| ----------- | ------------- |
| `sort()`    | Sort elements |
| `reverse()` | Reverse array |

```js
let nums = [10, 5, 20];

nums.sort((a, b) => a - b);
// [5,10,20]

nums.reverse();
// [20,10,5]
```

---

## 6. Converting Arrays

| Method            | Description                 |
| ----------------- | --------------------------- |
| `join()`          | Converts array to string    |
| `toString()`      | Converts to string          |
| `Array.from()`    | Creates array from iterable |
| `Array.isArray()` | Checks if value is an array |

```js
["a", "b", "c"].join("-");
// "a-b-c"

Array.isArray([1,2]);
// true

Array.from("hello");
// ['h','e','l','l','o']
```

---

## 7. ES6+ Useful Methods

### `flat()`

Flattens nested arrays.

```js
[1, [2, [3]]].flat(2);
// [1,2,3]
```

### `flatMap()`

Map + flat in one step.

```js
["hello world", "JS"]
  .flatMap(str => str.split(" "));

// ["hello", "world", "JS"]
```

### `at()`

Access element using positive or negative index.

```js
let arr = [10, 20, 30];

arr.at(0);   // 10
arr.at(-1);  // 30
```

---

## Most Important Methods for Interviews

1. `map()`
2. `filter()`
3. `reduce()`
4. `forEach()`
5. `find()`
6. `some()`
7. `every()`
8. `slice()`
9. `splice()`
10. `sort()`
11. `includes()`
12. `flat()` / `flatMap()`

These are the methods you'll use most often in React, Node.js, and JavaScript interviews.
