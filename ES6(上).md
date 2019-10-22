# 1. let 和 const命令

1. let命令

2. 块级作用域

3. const 命令

4. 顶层对象的属性

5. global对象

   

## 1. let命令

所声明的变量，只在`let`命令所在的代码块{}内有效。 

**基本用法**

```js
{
  let a = 10;
  var b = 1;
}

a // ReferenceError: a is not defined.
b // 1
```

**不存在变量提升**

let 所声明的变量不能在声明前使用，否则**报错**。 

```js
// var 的情况
console.log(foo); // 输出undefined
var foo = 2;

// let 的情况
console.log(bar); // 报错ReferenceError
let bar = 2;
```

**暂时性死区**

ES6 明确规定，如果**区块中存在`let`和`const`命令**，**这个区块**对这些**命令声明的变量**，从一开始就形成了封闭作用域。

凡是**在声明之前就使用这些变量**，就会**报错**。

**只要用到该变量就会报错** ! 

例如 :

**“暂时性死区”也意味着`typeof`不再是一个百分之百安全的操作** 

```js
typeof x; // ReferenceError
let x;


作为比较，如果一个变量根本没有被声明，使用typeof反而不会报错。
typeof undeclared_variable // "undefined"
```

总之，**在代码块内，使用`let`命令声明变量之前，该变量都是不可用的。**这在语法上，称为“**暂时性死区**”（temporal dead zone，简称 TDZ）。

只要块级作用域{}内存在**let**命令，**它所声明的变量**就**“绑定”**（binding）这个区域，不再受**外部**的影响。 

```js
var tmp = 123;

if (true) {
  tmp = 'abc'; // ReferenceError
  let tmp;
}
```

```js
if (true) {
  // 在let命令声明变量tmp之前，都属于变量tmp的“死区”
  // TDZ开始
  tmp = 'abc'; // ReferenceError
  console.log(tmp); // ReferenceError

  let tmp; // TDZ结束
  console.log(tmp); // undefined

  tmp = 123;
  console.log(tmp); // 123
}
```

**有些“死区”比较隐蔽，不太容易发现 ↓**

```js
// 情况1.
function bar(x = y, y = 2) {
 // 参数x默认值等于另一个参数y，
 // 但是此时y还没有声明，属于“死区”。
  return [x, y];
}

bar(); // 报错

// 情况2.
如果y = x , 就不会报错↓
function bar(x = 2, y = x) {
  return [x, y];
}
bar(); // [2, 2]

// 情况3.
var x = x; // 不报错
let x = x; // 报错 ReferenceError: x is not defined
使用let声明变量时，只要变量在还没有声明完成前使用，就会报错!
```

**不允许重复声明** 

`let`不允许在**相同作用域**内，**重复声明**同一个变量。 

```js
// 报错
function func() {
  let a = 10;
  var a = 1;
}

// 报错
function func() {
  let a = 10;
  let a = 1;
}
```

不能在**函数**内部**重新声明参数**。 

```js
function func(arg) {
  let arg;
}
func() // 报错

function func(arg) {
  {
    let arg;
  }
}
func() // 不报错
```

**`for`循环的计数器，就很合适使用`let`命令 ↓**

```js
for (let i = 0; i < 10; i++) {
  // ...
}

console.log(i);
// ReferenceError: i is not defined
// 计数器i只在for循环体内有效，在循环体外引用就会报错。
```

 **var** 与 **let**

```js
var a = [];
for (var i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i);
  };
}
a[6](); // 10

变量i在全局声明，所以全局只有一个变量i。
每一次循环，变量i的值都会被改变，
而循环内被赋给数组a的函数内部的console.log(i)，里面的i指向的就是全局的i。
所有数组a的成员里面的i，指向的都是同一个i，导致运行时输出的是最后一轮的i的值，也就是 10。

如果使用let，声明的变量仅在块级作用域内有效，最后输出的是 6。
var a = [];
for (let i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i);
  };
}
a[6](); // 6
```

`for`循环还有一个**特别之处** :

1. 设置循环变量的那部分是一个父作用域
2. 循环体内部是一个单独的子作用域

```js
for (let i = 0; i < 3; i++) {
  let i = 'abc';
  console.log(i);
}
// abc
// abc
// abc
函数内部的变量i与循环变量i不在同一个作用域，有各自单独的作用域
(循环变量是循环体内的父作用域)
```

## 2. 块级作用域

### 为什么需要块级作用域

**ES5** 只有**全局作用域**和**函数作用域**，没有**块级作用域**， 

这带来很多不合理的场景  : 

#### 第一种场景

**内层变量可能会覆盖外层变量** 

```js
var tmp = new Date();

function f() {
  console.log(tmp);
  if (false) {
    var tmp = 'hello world'; 
    // 即使if判断不成功 , 变量也会被提升创建
    // 变量提升到函数体顶部 , 值为undefined
  }
}

f(); // undefined
```



#### 第二种场景

用来**计数的循环变量**泄露为**全局变量** 

```js
var s = 'hello';

// 循环结束后，i并没有消失，泄露成了全局变量
for (var i = 0; i < s.length; i++) { // 变量i是全局的
  console.log(s[i]);
}

console.log(i); // 5
```

### Es6 的块级作用域

**let** 实际上为 JavaScript 新增了块级作用域。 

```js
// 情况1.
function f1() {
  let n = 5;
  if (true) {
    let n = 10;
  }
  console.log(n); // 5
}
```



Es6允许**块级作用域**的**任意嵌套**

```js
// 情况1.
{{{{{let insane = 'Hello World'}}}}};
// 情况2.
// 外层作用域无法读取内层作用域的变量
{{{{
  {let insane = 'Hello World'}
  console.log(insane); // 报错
}}}};
// 情况3.
// 内层作用域可以定义外层作用域的同名变量。
{{{{
  let insane = 'Hello World';
  {let insane = 'Hello World'}
}}}};
```

块级作用域的出现，使得立即执行函数表达式**（IIFE）不再是必要了。

```js
(function () {
  var tmp = ...;
  ...
}());

// 块级作用域写法
{
  let tmp = ...;
  ...
}
```

### 块级作用域与函数声明

函数能不能在块级作用域之中声明？ 

ES5 规定，函数只能在**顶层作用域**和**函数作用域**之中声明，不能在**块级作用域**声明。 

下面两种函数声明，根据 ES5 的规定都是**非法**的。
但是，浏览器没有遵守这个规定，为了兼容以前的旧代码，还是支持在块级作用域之中声明函数，因此下面两种情况实际都能运行，**不会报错**。

```js
// 情况一
if (true) {
  function f() {}
}

// 情况二
try {
  function f() {}
} catch(e) {
  // ...
}
// 都不会报错
```

**ES6** 引入了**块级作用域**，明确允许在**块级作用域之中声明函数**。

**ES6** 规定，**块级作用域**之中，**函数声明语句的行为类似于`let`**，在**块级作用域之外不可引用**。 

```js
function f() { console.log('I am outside!'); }

(function () {
  if (false) {
    // 重复声明一次函数f
    // f()函数会被提升到头部(顶层)
    function f() { console.log('I am inside!'); }
  }
  f(); // “I am inside!”
}());

上面代码在 ES5 中运行，会得到“I am inside!”，
因为在if内声明的函数f会被提升到函数头部，实际运行的代码如下。

// ES5 环境
function f() { console.log('I am outside!'); }

(function () {
  function f() { console.log('I am inside!'); }
  if (false) {
  }
  f();
}());
```

ES6 完全不一样，理论上会得到“I am outside!”。

因为块级作用域内声明的函数类似于  **let**，对**作用域之外**没有影响。

但是，如果你真的在 ES6 浏览器中运行一下上面的代码，是会报错的

```js
Uncaught TypeError: f is not a function
```

这是为什么呢？

原因 : 如果**改变了块级作用域内声明的函数的处理规则**，显然**会对老代码产生很大影响**。为了减轻因此产生的不兼容问题，

**ES6** 规定，浏览器的实现可以不遵守上面的规定，有自己的**行为方式** :

- 允许在**块级作用域**内声明**函数**。
- **函数声明类似于`var`**，即会提升到**全局作用域**或**函数作用域的头部**。
- 同时，**函数声明**还会提升到**所在的块级作用域的头部**。

注意，上面三条规则只对 ES6 的浏览器实现有效，其他环境的实现不用遵守，还是将块级作用域的函数声明当作`let`处理。

根据这三条规则，在**浏览器的 ES6 环境**中，**块级作用域**内声明的**函数**，行为类似于**`var`声明的变量**。 

```js
// 浏览器的 ES6 环境
function f() { console.log('I am outside!'); }

(function () {
  if (false) {
    // 重复声明一次函数f
    function f() { console.log('I am inside!'); }
  }

  f();// 找到函数体里的f , 但f的值却为undefined
}());
// Uncaught TypeError: f is not a function

上面的代码在符合 ES6 的浏览器中，都会报错，因为实际运行的是下面的代码。

// 浏览器的 ES6 环境
function f() { console.log('I am outside!'); }
(function () {
  var f = undefined;
  if (false) {
    function f() { console.log('I am inside!'); }
  }
  f();
}());
// Uncaught TypeError: f is not a function
```

考虑到环境导致的行为差异太大，应该避免在块级作用域内声明函数。

如果确实需要，也应该写成**函数表达式**，而不是**函数声明语句**。 

```js
// 函数声明语句
{
  let a = 'secret';
  function f() {
    return a;
  }
}

// 函数表达式
{
  let a = 'secret';
  let f = function () {
    return a;
  };
}
```

ES6 的块级作用域允许声明函数的规则，(使用了严格模式后)

只在使用**大括号的情况下成立**，如果没有使用大括号，就会**报错**。 

```js
// 不报错
'use strict';
if (true) {
  function f() {}
}

// 报错
'use strict';
if (true)
  function f() {}
```

## 3. const命令

### 基本用法

`const`声明一个**只读的常量**。一旦声明，**常量的值**就**不能改变**。 

```js
const PI = 3.1415;
PI // 3.1415

PI = 3;
// 报错
// TypeError: Assignment to constant variable.
```

`const`声明的**常量**不得**改变值**，这意味着 :

`const`一旦声明**常量**，就**必须立即初始化**，不能留到**以后赋值**。 (会报错)

```js
const foo;
// SyntaxError: Missing initializer in const declaration
```

`const`的**作用域**与 **let** 命令相同：只在**声明所在的块级作用域内有效**。 

```js
if (true) {
  const Num = 5;
}

Num // Uncaught ReferenceError: Num is not defined
```

`const`命令声明的常量也是**不提升**，同样**存在暂时性死区**，只能在声明的位置后面使用。

```js
if (true) {
  console.log(Num); // ReferenceError
  const Num = 5;
}
```

**const** 声明的常量，也与`let`一样**不可重复声明**。 

```js
var message = "Hello!";
let age = 25;

// 以下两行都会报错
const message = "Goodbye!";
const age = 30;
```

### 本质

`const`实际上保证的，**并不是变量的值不得改动**，

而是**变量指向的那个内存地址所保存的数据不得改动**。

对于**简单类型的数据**（数值、字符串、布尔值），值就保存在变量指向的那个内存地址，因此等同于常量。

但对于**复合类型的数据**（主要是对象和数组），变量指向的内存地址，**保存的只是一个指向实际数据的指针**，**`const`只能保证这个指针是固定的**（即总是指向另一个固定的地址），**至于它指向的数据结构是不是可变的**，**就完全不能控制了**。因此，**将一个对象声明为常量必须**非常**小心**。 

例如 :

```js
const foo = {};

// 为 foo 添加一个属性，可以成功
foo.prop = 123;
foo.prop // 123

// 将 foo 指向另一个对象，就会报错
foo = {}; // TypeError: "foo" is read-only
```

又例如 :

```js
const a = [];
a.push('Hello'); // 可执行
a.length = 0;    // 可执行
a = ['Dave'];    // 报错
```

如果真的想**将对象冻结**，应该使用`Object.freeze`方法。 

**Object.freeze()**方法:

```js
Object.freeze() 方法可以冻结一个对象。一个被冻结的对象再也不能被修改；冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。

语法 : 
Object.freeze(obj)
obj - 要被冻结的对象。
返回指 - 被冻结的对象。

const foo = Object.freeze({});

// 常规模式时，下面一行不起作用；
// 严格模式时，该行会报错
foo.prop = 123;
```

### Es6 声明变量的六中方法

**ES5** 只有**两种声明变量的方法**：`var`命令和`function`命令。

ES6 除了添加 **let **和 **const**命令，另外两种声明变量的方法：**import **命令和 **class **命令。

所以，ES6 一共有 6 种声明变量的方法。 

### 顶层对象的属性

顶层对象，在浏览器环境指的是**window**对象，在 Node 指的是**global**对象。

ES5 之中，**顶层对象的属性与全局变量是等价的**。 

```js
window.a = 1;
a // 1

a = 2;
window.a // 2

上面代码中，顶层对象的属性赋值与全局变量的赋值，是同一件事。
```

顶层对象的属性与全局变量挂钩，被认为是 JavaScript 语言最大的设计败笔之一。

```js
这样的设计带来了几个很大的问题，
1.没法在编译时就报出变量未声明的错误，只有运行时才能知道（因为全局变量可能是顶层对象的属性创造的，而属性的创造是动态的）
2.程序员很容易不知不觉地就创建了全局变量（比如打字出错）；最后，顶层对象的属性是到处可以读写的，这非常不利于模块化编程。
3.另一方面，`window`对象有实体含义，指的是浏览器的窗口对象，顶层对象是一个有实体含义的对象，也是不合适的。 
```

ES6 为了改变这一点，一方面规定，为了保持兼容性，`var`命令和`function`命令声明的全局变量，依旧是顶层对象的属性；另一方面规定，`let`命令、`const`命令、`class`命令声明的全局变量，不属于顶层对象的属性。也就是说，从 ES6 开始，全局变量将逐步与顶层对象的属性脱钩。 

```js
var a = 1;
// 如果在 Node 的 REPL 环境，可以写成 global.a
// 或者采用通用方法，写成 this.a
window.a // 1

let b = 1;
window.b // undefined
```

上面代码中，**全局变量**`a`由`var`命令声明，所以它是**顶层对象**的属性；

全局变量`b`由 **let** 命令声明，所以**它不是顶层对象的属性**，返回**undefined**。 

# 2. 变量的结构赋值

## 1. 数组的结构赋值

### 基本用法

**从数组和对象中提取值**，**对变量进行赋值**，这被称为**解构** 

以前，为变量赋值，只能直接指定值。 

```js
let a = 1;
let b = 2;
let c = 3;
```

**ES6** 允许写成下面这样。

```js
let [a, b, c] = [1, 2, 3];
```

本质上，这种写法属于“**模式匹配**”，只要**等号**两边的模式**相同**，左边的变量就会被赋予对应的值。

下面是一些使用嵌套数组进行解构的例子。 

```js
// 例子1.
let [foo, [[bar], baz]] = [1, [[2], 3]];
foo // 1
bar // 2
baz // 3

// 例子2.
let [ , , third] = ["foo", "bar", "baz"];
third // "baz"

// 例子3.
let [x, , y] = [1, 2, 3];
x // 1
y // 3

// 例子4.  ↓ 三点变成数组
let [head, ...tail] = [1, 2, 3, 4];
head // 1
tail // [2, 3, 4]

// 例子5.
let [x, y, ...z] = ['a'];
x // "a"
y // undefined
z // []
```

如果解构不成功，变量的值就等于**undefined**。

```js
let [foo] = [];
let [bar, foo] = [1];
// foo undefined
```

**不完全解构**，即**等号左边的模式**，只匹配**等号右边的数组的一部分**。

这种情况下，解构依然可以成功。 

```js
et [x, y] = [1, 2, 3];
x // 1
y // 2

let [a, [b], d] = [1, [2, 3], 4];
a // 1
b // 2  只取出第一个
d // 4
```

如果**等号的右边不是数组**（或者严格地说，不是可遍历的结构），那么将会报错。

```js
// 报错
let [foo] = 1;
let [foo] = false;
let [foo] = NaN;
let [foo] = undefined;
let [foo] = null;
let [foo] = {};

上面的语句都会报错，因为等号右边的值，
要么转为对象以后不具备 Iterator 接口（前五个表达式）
要么本身就不具备 Iterator 接口（最后一个表达式）。
```

对于 **Set** 结构，也可以使用数组的解构赋值。 

```js
let [x, y, z] = new Set(['a', 'b', 'c']);
x // "a"
```

只要某种数据结构具有 **Iterator** 接口，都可以采用数组形式的**解构赋值**。 

```js
function* fibs() {
  let a = 0;
  let b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

let [first, second, third, fourth, fifth, sixth] = fibs();
sixth // 5

上面代码中，fibs是一个 Generator 函数，原生具有 Iterator 接口。
解构赋值会依次从这个接口获取值。
```

### 默认值

**解构赋值允许指定默认值**

```js
let [foo = true] = [];
foo // true

let [x, y = 'b'] = ['a']; // x='a', y='b'
let [x, y = 'b'] = ['a', undefined]; // x='a', y='b'
```

**注意**，Es6内部使用严格相等运算符（`===`），判断一个位置是否有值。

所以，只有当一个数组成员**严格等于`undefined`**，默认值才会**生效**。 

```js
如果一个数组成员是`null`，默认值就不会生效，
因为null不严格等于undefined。

let [x = 1] = [undefined];
x // 1

let [x = 1] = [null];
x // null
```

如果**默认值是一个表达式**，那么这个表达式是**惰性求值**的

**惰性求值** : 只有在用到的时候，才会求值。

```js
function f() {
  console.log('aaa');
}
let [x = f()] = [1];

// 上面代码中，因为x能取到值，所以函数f根本不会执行。
// 上面的代码其实等价于下面的代码。

let x;
if ([1][0] === undefined) {
  x = f();
} else {
  x = [1][0];
}
```

默认值可以引用**解构赋值的其他变量**，但该变量**必须已经声明**。 

```js
let [x = 1, y = x] = [];     // x=1; y=1
let [x = 1, y = x] = [2];    // x=2; y=2
let [x = 1, y = x] = [1, 2]; // x=1; y=2
let [x = y, y = 1] = [];     // ReferenceError: y is not defined
```

## 2.  对象的解构赋值

**解构**不仅可以**用于数组**，还可以**用于对象**

```js
let { foo, bar } = { foo: "aaa", bar: "bbb" };
foo // "aaa"
bar // "bbb"
```

**对象**的解构与**数组**有一个重要**的不同** : 

**数组**的元素是按次序排列的，**变量的取值由它的位置决定**；

**对象**的属性没有次序，**变量必须与属性同名**，才能取到正确的值。 

```js
let { bar, foo } = { foo: "aaa", bar: "bbb" };
foo // "aaa"
bar // "bbb"

let { baz } = { foo: "aaa", bar: "bbb" };
baz // undefined
```

如果**变量名与属性名不一致**(重命名)，必须写成下面这样。 

```js
let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
baz // "aaa"

let obj = { first: 'hello', last: 'world' };
let { first: f, last: l } = obj;
f // 'hello'
l // 'world'
```

对象的**解构赋值**是下面形式**的简写** 

```js
let { foo: foo, bar: bar } = { foo: "aaa", bar: "bbb" };
```

对象的解构赋值的内部机制，是先找到同名属性，然后再赋给对应的变量。

真正被赋值的是**后者**，而不是**前者**。 

下面代码中，**`foo`是匹配的模式**，**`baz`才是变量**。真正**被赋值的是变量`baz`**，而不是模式`foo`。 

```js
let { foo: baz } = { foo: "aaa", bar: "bbb" };
baz // "aaa"
foo // error: foo is not defined
```

与数组一样，解构也可以用于**嵌套结构的对象**。 

```js
let obj = {
  p: [
    'Hello',
    { y: 'World' }
  ]
};

// 例子1.
let { p: [x, { y }] } = obj;
x // "Hello"
y // "World"

// 例子2.
let { p: [x, { y:b }] } = obj;
x // "Hello"
b // "World"

// 例子3.
let { p } = obj;
p // ["Hello", {y: "World"}]  实际上复制了引用
```

**嵌套赋值**的例子 : 

```js
let obj = {};
let arr = [];

({ foo: obj.prop, bar: arr[0] } = { foo: 123, bar: true });

obj // {prop:123}
arr // [true]
```

**对象的解构**也可以**指定默认值**

```js
var {x = 3} = {};
x // 3

var {x, y = 5} = {x: 1};
x // 1
y // 5

var {x: y = 3} = {};
y // 3

var {x: y = 3} = {x: 5};
y // 5

var { message: msg = 'Something went wrong' } = {};
msg // "Something went wrong"
```

**默认值生效的条件 : **对象的属性值严格等于 **undefined** 

下面代码中，属性`x`等于 **null** ，因为`null`与`undefined`不严格相等，所以是个有效的赋值，导致默认值`3`不会生效。

```js
var {x = 3} = {x: undefined};
x // 3

var {x = 3} = {x: null};
x // null
```

如果解构**失败**，变量的值等于 **undefined** (和数组一样)

```js
let {foo} = {bar: 'baz'};
foo // undefined
```

如果解构模式是**嵌套的对象**，而且**子对象所在的父属性不存在**，那么将会报错。

```js
let {foo: {bar}} = {baz: 'baz'};// 报错

let _tmp = {baz: 'baz'};
_tmp.foo.bar // 报错
```

如果要将一个**已经声明的变量用于解构赋值**，必须非常小心 :

```js
// 错误的写法
let x;
{x} = {x: 1};
// SyntaxError: syntax error 语法错误

JavaScript 引擎会将{x}理解成一个代码块，从而发生语法错误。
只有不将大括号写在行首，避免 JavaScript 将其解释为代码块，才能解决这个问题。

// 正确的写法
let x;
({x} = {x: 1});
```

解构赋值允许**等号左边的模式之中，不放置任何变量名**。 

```js
({} = [true, false]);
({} = 'abc');
({} = []);

虽然语法是合法的,可以执行,但没有任何意义
```

对象的解构赋值，**可以很方便地将现有对象的方法，赋值到某个变量**。

```js
let { log, sin, cos } = Math;

// 上面代码将Math对象的对数、正弦、余弦三个方法，赋值到对应的变量上，使用起来就会方便很多。
```

由于**数组**本质是**特殊的对象**，因此可以**对数组进行对象属性的解构**

```js
let arr = [1, 2, 3];
let {0 : first, [arr.length - 1] : last} = arr;
first // 1
last // 3

数组arr的0键对应的值是1，
[arr.length - 1]就是2键，对应的值是3。<-这种写法，属于“属性名表达式”
```

##  3. 字符串的解构赋值

字符串也可以**解构赋值**。

这是因为此时，字符串被转换成了一个**类似数组的对象**

字符串也可以解构赋值。这是因为此时，字符串被转换成了一个类似数组的对象。

```js
const [a, b, c, d, e] = 'hello';
a // "h"
b // "e"
c // "l"
d // "l"
e // "o"
```

类似数组的对象都有一个`length`属性，因此还可以对这个属性解构赋值。

```js
let {length : len} = 'hello';
len // 5
```

## 4. 数值和布尔值的解构赋值

解构赋值时，如果**等号右边是数值和布尔值，则会先转为对象**

```js
let {toString: s} = 123;
s === Number.prototype.toString // true

let {toString: s} = true;
s === Boolean.prototype.toString // true
```

解构赋值的规则是 : **只要等号右边的值不是对象或数组，就先将其转为对象**。

由于`undefined`和`null`**无法转为对象**，所以对它们进行解构赋值，**都会报错**。

```
let { prop: x } = undefined; // TypeError
let { prop: y } = null; // TypeError
```

## 5. 函数的解构赋值

函数的**参数**也可以使用**解构赋值**。 

```js
function add([x, y]){
  return x + y;
}

add([1, 2]); // 3
```

例子.

```js
[[1, 2], [3, 4]].map(([a, b]) => a + b);
// [ 3, 7 ]

.map方法
回调里面第一个参数是 值
回调里面第二个参数是 索引(下标)
回调里面第三个参数是 原对象
```

函数**参数的解构**也可以**使用默认值**

```js
function move({x = 0, y = 0} = {}) {
  return [x, y];
}

move({x: 3, y: 8}); // [3, 8]
move({x: 3}); // [3, 0]
move({}); // [0, 0]
move(); // [0, 0]
```

注意，**下面的写法会得到不一样的结果**。

```
function move({x, y} = { x: 0, y: 0 }) {
  return [x, y];
}

move({x: 3, y: 8}); // [3, 8]
move({x: 3}); // [3, undefined]
move({}); // [undefined, undefined]
move(); // [0, 0]

上面代码是为函数move的参数指定默认值，而不是为变量x和y指定默认值，
所以如果move没传实参,才是[0,0]

```

**undefined** 就会触发函数参数的默认值。

```js
[1, undefined, 3].map((x = 'yes') => x);
// [ 1, 'yes', 3 ]
```

## 6. 圆括号问题

### 不能使用圆括号的情况

以下**三种解构赋值**不得使用圆括号。

（1）**变量声明语句**

```js
// 全部报错
let [(a)] = [1];

let {x: (c)} = {};
let ({x: c}) = {};
let {(x: c)} = {};
let {(x): c} = {};

let { o: ({ p: p }) } = { o: { p: 2 } };
```

上面 6 个语句都会报错，因为它们都是变量声明语句，模式不能使用圆括号。

（2）**函数参数**

函数参数也属于变量声明，因此不能带有圆括号。

```js
// 报错
function f([(z)]) { return z; }
// 报错
function f([z,(x)]) { return x; }
// 报错
function f([(z),x]) { return x; }
```

（3）**赋值语句的模式**

```js
// 全部报错
({ p: a }) = { p: 42 };
([a]) = [5];
```

```js
// 报错
[({ p: a }), { x: c }] = [{}, {}];
```

上面代码将整个模式放在圆括号之中，导致报错。

### 可以使用圆括号的情况

可以使用圆括号的情况只有一种：**赋值语句的非模式部分，可以使用圆括号**。

```js
[(b)] = [3]; // 正确
({ p: (d) } = {}); // 正确
[(parseInt.prop)] = [3]; // 正确

上面三行语句都可以正确执行，因为首先它们都是赋值语句，而不是声明语句；其次它们的圆括号都不属于模式的一部分。
第一行语句中，模式是取数组的第一个成员，跟圆括号无关；
第二行语句中，模式是p，而不是d；
第三行语句与第一行语句的性质一致。
```

## 用途

**（1）交换变量的值**

```js
let x = 1;
let y = 2;

[x, y] = [y, x];
```

上面代码交换变量`x`和`y`的值，这样的写法不仅简洁，而且易读，语义非常清晰。

**（2）从函数返回多个值**

函数只能返回一个值，如果要返回多个值，只能将它们放在数组或对象里返回。有了解构赋值，取出这些值就非常方便。

```js
// 返回一个数组

function example() {
  return [1, 2, 3];
}
let [a, b, c] = example();

// 返回一个对象

function example() {
  return {
    foo: 1,
    bar: 2
  };
}
let { foo, bar } = example();
```

**（3）函数参数的定义**

解构赋值可以方便地将一组参数与变量名对应起来。

```js
// 参数是一组有次序的值
function f([x, y, z]) { ... }
f([1, 2, 3]);

// 参数是一组无次序的值
function f({x, y, z}) { ... }
f({z: 3, y: 2, x: 1});
```

**（4）提取 JSON 数据**

解构赋值对提取 JSON 对象中的数据，尤其有用。

```js
let jsonData = {
  id: 42,
  status: "OK",
  data: [867, 5309]
};

let { id, status, data: number } = jsonData;

console.log(id, status, number);
// 42, "OK", [867, 5309]
```

上面代码可以快速提取 JSON 数据的值。

**（5）函数参数的默认值**

```js
jQuery.ajax = function (url, {
  async = true,
  beforeSend = function () {},
  cache = true,
  complete = function () {},
  crossDomain = false,
  global = true,
  // ... more config
} = {}) {
  // ... do stuff
};
```

指定参数的默认值，就**避免了**在函数体内部再写 : 

**var foo = config.foo || default foo  **这样的语句。

**（6）遍历 Map 结构**

任何部署了 Iterator 接口的对象，都可以用`for...of`循环遍历。Map 结构原生支持 Iterator 接口，配合变量的解构赋值，获取键名和键值就非常方便。

```js
const map = new Map();
map.set('first', 'hello');
map.set('second', 'world');

for (let [key, value] of map) {
  console.log(key + " is " + value);
}
// first is hello
// second is world
```

如果只想获取键名，或者只想获取键值，可以写成下面这样。

```js
// 获取键名
for (let [key] of map) {
  // ...
}

// 获取键值
for (let [,value] of map) {
  // ...
}
```

**（7）输入模块的指定方法**

加载模块时，往往需要指定输入哪些方法。解构赋值使得输入语句非常清晰。

```js
const { SourceMapConsumer, SourceNode } = require("source-map");
```

# 3. 字符串的扩展

## 1. 字符串的遍历器接口

ES6 为**字符串**添加了**遍历器接口**，使得字符串可以被 **for**...**of **循环遍历。

```js
for (let count of 'foo') {
  console.log(count)
}
// "f"
// "o"
// "o"
```

除了遍历字符串，这个遍历器最大的优点是可以识别大于**0xFFFF**的码点，传统的`for`循环无法识别这样的码点。

```js
let text = String.fromCodePoint(0x20BB7);

for (let i = 0; i < text.length; i++) {
  console.log(text[i]);
}
// " "
// " "

for (let i of text) {
  console.log(i);
}
// "𠮷"
```

上面代码中，字符串`text`只有一个字符，但是**`for`循环会认为它包含两个字符**（都不可打印），而 **for...of 循环会正确识别出这一个字符**。

## 2. includes(), startsWith(), endsWith()

传统上，JavaScript 只有`indexOf`方法，可以用来确定一个字符串是否包含在另一个字符串中。

ES6 又提供了**三种新方法**。( **With是大写**,驼峰 ) 

- **includes()**：返回布尔值，表示是否找到了参数字符串。
- **startsWith()**：返回布尔值，表示参数字符串是否在原字符串的头部。
- **endsWith()**：返回布尔值，表示参数字符串是否在原字符串的尾部。

```js
let s = 'Hello world!';

s.startsWith('Hello') // true
s.endsWith('!') // true
s.includes('o') // true
```

这三个方法都支持**第二个参数，表示开始搜索的位置**。

```js
let s = 'Hello world!';

s.startsWith('world', 6) // true
s.endsWith('Hello', 5) // true
s.includes('Hello', 6) // false

使用第二个参数n时，endsWith的行为与其他两个方法有所不同。
它针对前n个字符，而其他两个方法针对从第n个位置直到字符串结束。
```

## 3. repeat()

`repeat`方法**返回**一个新字符串，表示**将原字符串重复`n`次**。

```js
'x'.repeat(3) // "xxx"
'hello'.repeat(2) // "hellohello"

'na'.repeat(0) // ""  (空)
```

**参数如果是小数，会被取整**。

```js
'na'.repeat(2.9) // "nana"
```

如果`repeat`的参数是负数或者`Infinity`，会报错。

```js
'na'.repeat(Infinity)
// RangeError
'na'.repeat(-1)
// RangeError
```

但是，如果参数是 0 到-1 之间的小数，则等同于 0，这是因为会先进行取整运算。0 到-1 之间的小数，取整以后等于`-0`，`repeat`视同为 0。

```js
'na'.repeat(-0.9) // ""
```

参数 **NaN** 等同于 0。

```js
'na'.repeat(NaN) // ""
```

如果`repeat`的参数是**字符串**，则会**先转换成数字**。

如果转换后是 **NaN , 等同于 0**

```js
'na'.repeat('na') // ""
'na'.repeat('3') // "nanana"
```

## 4. padStart()，padEnd()

**ES2017** 引入了**字符串补全长度**的**功能**。

**如果**某个字符串**不够指定长度**，会在**头部**或**尾部**补全。

**padStart()** 用于头部补全，**padEnd()** 用于尾部补全。

`padStart()`和`padEnd()`一共接受两个参数，**第一个参数**是字符串补全生效的**最大长度**，**第二个参数**是用来**补全的字符串**  (默认"" **空格**)。

```js
'x'.padStart(5, 'ab') // 'ababx'
'x'.padStart(4, 'ab') // 'abax'

'x'.padEnd(5, 'ab') // 'xabab'
'x'.padEnd(4, 'ab') // 'xaba'
```

如果补全生效的**最大长度**小于等于原字符串的长度，则**补全不生效**，**返回原字符串**。

```js
'xxx'.padStart(2, 'ab') // 'xxx'
'xxx'.padEnd(2, 'ab') // 'xxx'
```

如果用来补全的字符串与原字符串，两者的长度之和超过了最大长度，则会截去超出位数的补全字符串。

```js
'abc'.padStart(10, '0123456789')
// '0123456abc'
```

如果**省略第二个参数**，默认**使用空格补全长度**。

```js
'x'.padStart(4) // '   x'
'x'.padEnd(4) // 'x   '
```

**用途** : 

`padStart()`的常见用途是为数值补全指定位数。下面代码生成 10 位的数值字符串。

```js
'1'.padStart(10, '0') // "0000000001"
'12'.padStart(10, '0') // "0000000012"
'123456'.padStart(10, '0') // "0000123456"
```

另一个用途是提示字符串格式。

```js
'12'.padStart(10, 'YYYY-MM-DD') // "YYYY-MM-12"
'09-12'.padStart(10, 'YYYY-MM-DD') // "YYYY-09-12"
```

## 5. 模板字符串

**模板字符串**（template string）是增强版的字符串，用**反引号（`）**标识。

**可以当作普通字符串使用，也可以用来定义多行字符串**，或者在字符串中**嵌入变量**。 

如果在模板字符串**中需要使用反引号**，则前面要用**反斜杠转义**。

```js
let greeting = `\`Yo\` World!`;
```

如果使用模板字符串表示**多行字符串**，**所有的空格和缩进都会被保留在输出之中**。

```js
$('#list').html(`
<ul>
  <li>first</li>
  <li>second</li>
</ul>
`);
```

如果**不想要**这个**换行** 可以**使用trim方法**消除它。

**trim()** 会 **返回** 消除换行后的值 , 不会改动原对象

```js
$('#list').html(`
<ul>
  <li>first</li>
  <li>second</li>
</ul>
`.trim());

var str = `  hello`
str // "  hello"
str.trim() //
str // "  hello"
var str2 = str.trim()
str2 // "hello"
```

模板字符串中**嵌入变量**，需要将变量名写在 **${}** 之中。 

```js
var str = "peng"
var str2 = "guodon"
var str3 = `${str}${str2}`
str3 // "pengguodon"
```

**大括号内部**可以**放入**任意的 JavaScript **表达式**，可以**进行运算**。 

```js
let x = 1;
let y = 2;

`${x} + ${y} = ${x + y}`
// "1 + 2 = 3"

```

模版字符串之中可以**引用对象属性**

```js
let obj = {x: 1, y: 2};
`${obj.x + obj.y}`
// "3"
```

模板字符串之中还能**调用函数**。

```
function fn() {
  return "Hello World";
}

`foo ${fn()} bar`
// foo Hello World bar
```

如果大括号中的**值**不是字符串，将按照一般的规则**转为字符串**。

比如，大括号中是一个**对象**，将默认调用对象的`toString`方法。 

```js
var obj = {name:'pengguodon'}
var flag = `${obj}`
flag // "[object Object]"
```

如果模板字符串中的**变量没有声明**，将报错。

```js
// 变量place没有声明
let msg = `Hello, ${place}`;
// 报错
```

由于模板字符串的**大括号内部**，就是**执行 JavaScript 代码**，

如果大括号内部是一个**字符串**，将会**原样输出**。

```js
`Hello ${'World'}`
// "Hello World"
// 可以 , 但是没有意义
```

如果需要引用模板字符串本身，在需要时执行，可以像下面这样写。

```js
// 写法一
let str = 'return ' + '`Hello ${name}!`';
let func = new Function('name', str);
func('Jack') // "Hello Jack!"

// 写法二
let str = '(name) => `Hello ${name}!`';
let func = eval.call(null, str);
func('Jack') // "Hello Jack!"
```

## 6. 标签模板

模板字符串的功能，不仅仅是上面这些。

它可以紧跟在一个**函数名**后面，该**函数将被调用**来处理这个模板字符串。

这被称为“标签模板”功能（tagged template）。

```js
alert`123`
// 等同于
alert(123)
```

**标签模板**其实不是模板，而是**函数调用的一种特殊形式**。

“**标签**”指的就是**函数**，紧**跟在后面的模板字符串**就是它的**参数**。

但是，**如果**模板字符**里面有变量**，就不是简单的调用了，而是会**将模板字符串先处理成多个参数**，再调用函数。

```js
let a = 5;
let b = 10;

tag`Hello ${ a + b } world ${ a * b }`;
// 等同于
tag(['Hello ', ' world ', ''], 15, 50);
```

上面代码中，模板字符串前面有一个标识名`tag`，它是一个函数。

整个表达式的返回值，就是`tag`函数处理模板字符串后的返回值。

函数`tag`依次会接收到多个参数。

```
function tag(stringArr, value1, value2){
  // ...
}

// 等同于

function tag(stringArr, ...values){
  // ...
}
```

`tag`函数的**第一个参数是一个数组**，该数组的成员是模板字符串中那些**没有变量替换的部分**

`tag`函数的**其他参数**，都是**模板字符串各个变量被替换后的值**。

由于本例中，模板字符串含有两个变量，因此`tag`会接受到`value1`和`value2`两个参数。

`tag`函数所有参数的实际值如下。

- 第一个参数：`['Hello ', ' world ', '']` // 
- 如果模版里第一个或者最后一个是${} , 第一个参数第一位或者最后一位变成''
- 第二个参数:  15
- 第三个参数：50

也就是说，`tag`函数实际上以下面的形式调用。

```js
tag(['Hello ', ' world ', ''], 15, 50)
```

我们可以按照需要编写`tag`函数的代码。下面是`tag`函数的一种写法，以及运行结果。

```js
let a = 5;
let b = 10;

function tag(s, v1, v2) {
  console.log(s[0]);
  console.log(s[1]);
  console.log(s[2]);
  console.log(v1);
  console.log(v2);
  return "OK";
}

tag`Hello ${ a + b } world ${ a * b}`;
// 第一个参数数组里的值
// "Hello "
// " world "
// ""
// 剩下已经变量替换的部分
// 15
// 50
// return "ok"
// "OK"
```

例子:

```js
let total = 30;
let msg = passthru`The total is ${total} (${total*1.05} with tax)`;

function passthru(literals) {
  // literals:["The total is "," ("," with tax"]
  let result = '';
  let i = 0;

  while (i < literals.length) { 
    result += literals[i++]; // literals里的参数
    if (i < arguments.length) {
      result += arguments[i]; // 在放入变量替换后的那部分
    }
  }

  return result;
}

msg // "The total is 30 (31.5 with tax)"
```

# 4. 数值的扩展

## 1. 二进制和八进制表示法

**ES6** 提供了**二进制**和**八进制**数值的新的写法，

分别用 

**二进制** : `0b`（或`0B`）

**八进制** :`0o`（或`0O`）

```js
0b111110111 === 503 // true
0o767 === 503 // true
```

从 **ES5** 开始，在**严格模式**之中，八进制就不再允许使用前缀　**0**　表示，**ES6** 进一步明确，要使用前缀 **0o **表示。

```js
// 非严格模式
(function(){
  console.log(0o11 === 011);
})() // true

// 严格模式
(function(){
  'use strict';
  console.log(0o11 === 011);
})() // Uncaught SyntaxError: Octal literals are not allowed in strict mode.
```

如果要将`0b`和`0o`前缀的字符串数值**转为十进制**，要使用`Number`方法。

```js
Number('0b111')  // 7
Number('0o10')  // 8
```

## 2. Number.isFinite(), Number.isNaN() 

**ES6** 在`Number`对象上，

新提供了 **Number.isFinite()** 和 **Number.isNaN()** 两个方法。

`Number.isFinite()`用来检查一个数值是否为**有限的（finite）**，即**不是`Infinity`**。

```js
Number.isFinite(15); // true
Number.isFinite(0.8); // true

// 参数类型不是数值，Number.isFinite一律返回false
↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

Number.isFinite(NaN); // false
Number.isFinite(Infinity); // false
Number.isFinite(-Infinity); // false
Number.isFinite('foo'); // false
Number.isFinite('15'); // false
Number.isFinite(true); // false
```

注意，如果参数类型不是**数值**，`Number.isFinite`一律返回`false`。

`Number.isNaN()`用来检查一个值是否为`NaN`。

```js
Number.isNaN(NaN) // true
Number.isNaN(15) // false
Number.isNaN('15') // false
Number.isNaN("peng") // false
Number.isNaN(true) // false
Number.isNaN(9/NaN) // true
Number.isNaN('true' / 0) // true
Number.isNaN('true' / 'true') // true
```

如果**参数类型不是`NaN`**，`Number.isNaN`一律**返回`false`**。

**它们与传统的全局方法`isFinite()`和`isNaN()`的区别在于**，

传统方法先调用`Number()`将**非数值的值转为数值**，**再进行判断**，

而这两个新方法只对数值有效，

**`Number.isFinite()`对于非数值一律返回`false`**, 

**`Number.isNaN()`只有对于`NaN`才返回`true`**，非`NaN`一律返回`false`。

```js
isFinite(25) // true
isFinite("25") // true
Number.isFinite(25) // true
Number.isFinite("25") // false

isNaN(NaN) // true
isNaN("NaN") // true
Number.isNaN(NaN) // true
Number.isNaN("NaN") // false
Number.isNaN(1) // false
```

## 3.  Number.parseInt(), Number.parseFloat()

```js
// ES5的写法
parseInt('12.34') // 12
parseFloat('123.45#') // 123.45

// ES6的写法
Number.parseInt('12.34') // 12
Number.parseFloat('123.45#') // 123.45
```

这样做的目的，是**逐步减少全局性方法**，使得**语言逐步模块化**。

```js
Number.parseInt === parseInt // true
Number.parseFloat === parseFloat // true
```

## 4. Number.isInteger()

`Number.isInteger()`用来**判断一个数值是否为整数** , **不建议使用**

```js
Number.isInteger(25) // true
Number.isInteger(25.1) // false
```

JavaScript 内部，**整数和浮点数采用的是同样的储存方法**，所以 **25 和 25.0 被视为同一个值**。

```js
Number.isInteger(25) // true
Number.isInteger(25.0) // true
```

如果参数不是数值，`Number.isInteger`返回`false`。

```js
Number.isInteger() // false
Number.isInteger(null) // false
Number.isInteger('15') // false
Number.isInteger(true) // false
```

注意，由于 JavaScript 采用 IEEE 754 标准，数值存储为64位双精度格式，数值精度最多可以达到 53 个二进制位（1 个隐藏位与 52 个有效位）。

如果数值的精度超过这个限度，第54位及后面的位就会被丢弃，这种情况下，**`Number.isInteger`可能会误判**。

```js
Number.isInteger(3.0000000000000002) // true
```

上面代码中，`Number.isInteger`的参数明明不是整数，但是会返回`true`。

原因就是**这个小数的精度达到了小数点后16个十进制位**，转成**二进制位超过了53个二进制位**，导致**最后的那个`2`被丢弃**了。

类似的情况还有，如果一个数值的绝对值小于`Number.MIN_VALUE`（5E-324），即小于 JavaScript 能够分辨的最小值，会被自动转为 0。这时，`Number.isInteger`也会误判。

```
Number.isInteger(5E-324) // false
Number.isInteger(5E-325) // true
```

上面代码中，`5E-325`由于值太小，会被自动转为0，因此返回`true`。

**总之，如果对数据精度的要求较高，不建议使用`Number.isInteger()`判断一个数值是否为整数。!!!**

## 5. Math 对象的扩展

ES6 在 Math 对象上新增了 **17** 个与数学相关的方法。

所有这些方法都是**静态方法**，只能在 **Math 对象上调用**。 

### Math.sign()

`Math.sign`方法用来**判断一个数到底是正数、负数、还是零**。

对于**非数值**，会先将其转换为**数值**。

它会**返回五种值**。

- 参数为**正数**，返回`+1`；
- 参数为**负数**，返回`-1`；
- 参数为 **0**，返回`0`；
- 参数为 **-0**，返回`-0`;
- **其他值**，返回`NaN`。

```js
Math.sign(-5) // -1
Math.sign(5) // +1
Math.sign(0) // +0
Math.sign(-0) // -0
Math.sign(NaN) // NaN
```

如果参数是非数值，会自动转为数值。对于那些无法转为数值的值，会返回`NaN`。

```js
Math.sign('')  // 0
Math.sign(true)  // +1
Math.sign(false)  // 0
Math.sign(null)  // 0
Math.sign('9')  // +1
Math.sign('foo')  // NaN
Math.sign()  // NaN
Math.sign(undefined)  // NaN
```

对于没有部署这个方法的环境，可以用下面的**代码模拟**。

```js
Math.sign = Math.sign || function(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
};
```

### Math.cbrt()

`Math.cbrt`方法用于**计算一个数的立方根**。

```js
Math.cbrt(-1) // -1
Math.cbrt(0)  // 0
Math.cbrt(1)  // 1
Math.cbrt(2)  // 1.2599210498948734
```

对于非数值，`Math.cbrt`方法内部也是先使用`Number`方法将其转为数值。

```js
Math.cbrt('8') // 2
Math.cbrt('hello') // NaN
```

对于没有部署这个方法的环境，可以用下面的代码模拟。

```js
Math.cbrt = Math.cbrt || function(x) {
  var y = Math.pow(Math.abs(x), 1/3);
  return x < 0 ? -y : y;
};
```

### Math.hypot()

`Math.hypot`方法返回所有参数的**平方和的平方根**。

如果**参数不是数值**，`Math.hypot`方法会将其**转为数值**。只要**有一个参数无法转为数值，就会返回 NaN**。

```js
Math.hypot(3, 4);        // 5
Math.hypot(3, 4, 5);     // 7.0710678118654755
Math.hypot();            // 0
Math.hypot(NaN);         // NaN
Math.hypot(3, 4, 'foo'); // NaN
Math.hypot(3, 4, '5');   // 7.0710678118654755
Math.hypot(-3);          // 3
```

### 对数方法

ES6 新增了 **4 个对数**相关方法。

**（1） Math.expm1()**

`Math.expm1(x)`返回 ex - 1，即`Math.exp(x) - 1`。

```js
Math.expm1(-1) // -0.6321205588285577
Math.expm1(0)  // 0
Math.expm1(1)  // 1.718281828459045
```

对于没有部署这个方法的环境，可以用下面的**代码模拟**。

```js
Math.expm1 = Math.expm1 || function(x) {
  return Math.exp(x) - 1;
};
```

**（2）Math.log1p()**

`Math.log1p(x)`方法返回`1 + x`的自然对数，即`Math.log(1 + x)`。如果`x`小于-1，返回`NaN`。

```js
Math.log1p(1)  // 0.6931471805599453
Math.log1p(0)  // 0
Math.log1p(-1) // -Infinity
Math.log1p(-2) // NaN
```

对于没有部署这个方法的环境，可以用下面的代码模拟。

```js
Math.log1p = Math.log1p || function(x) {
  return Math.log(1 + x);
};
```

**（3）Math.log10()**

`Math.log10(x)`返回以 10 为底的`x`的对数。如果`x`小于 0，则返回 NaN。

```js
Math.log10(2)      // 0.3010299956639812
Math.log10(1)      // 0
Math.log10(0)      // -Infinity
Math.log10(-2)     // NaN
Math.log10(100000) // 5
```

对于没有部署这个方法的环境，可以用下面的代码模拟。

```js
Math.log10 = Math.log10 || function(x) {
  return Math.log(x) / Math.LN10;
};
```

**（4）Math.log2()**

`Math.log2(x)`返回以 2 为底的`x`的对数。如果`x`小于 0，则返回 NaN。

```js
Math.log2(3)       // 1.584962500721156
Math.log2(2)       // 1
Math.log2(1)       // 0
Math.log2(0)       // -Infinity
Math.log2(-2)      // NaN
Math.log2(1024)    // 10
Math.log2(1 << 29) // 29
```

对于没有部署这个方法的环境，可以用下面的代码模拟。

```js
Math.log2 = Math.log2 || function(x) {
  return Math.log(x) / Math.LN2;
};
```

## 6. 指数运算符

**ES2016** 新增了一个**指数运算符**（`**`）。

这个运算符的一个特点是右结合，而不是常见的左结合。多个指数运算符连用时，是从最右边开始计算的。

```js
2 ** 2 // 4
2 ** 3 // 8
```

```js
2 ** 3 ** 2
// 相当于 
// 2 ** (3 ** 2)
// 2 ** 9 (九个2)
// 512
```

上面代码中，**首先计算的是第二个指数运算符**，而不是第一个。

指数运算符可以与等号结合，形成一个新的赋值运算符（`**=`）。

```js
let a = 1.5;
a **= 2;
// 等同于 a = a * a;
// a = a**2

let b = 4;
b **= 3;
// 等同于 b = b * b * b;
// b = b**#
```

注意，V8 引擎的指数运算符与`Math.pow`的实现不相同，对于特别大的运算结果，两者会有细微的差异。

```js
Math.pow(99, 99)
// 3.697296376497263e+197

99 ** 99
// 3.697296376497268e+197
```

上面代码中，两个运算结果的**最后一位有效数字是有差异的**。

# 5. 函数的扩展

## 1. 函数参数的默认值

### 1. 基本用法 

ES6 之前，不能直接为函数的参数指定默认值，只能采用变通的方法。

```js
function log(x, y) {
  // 第一种
  if (typeof y === 'undefined') {
  y = 'World';
	}
  // 第二种
  // 如果参数y赋值了，但是对应的布尔值为false，则该赋值不起作用。
  y = y || 'World';
  console.log(x, y);
}

log('Hello') // Hello World
log('Hello', 'China') // Hello China
log('Hello', '') // Hello World
```

**ES6** 允许为函数的**参数设置默认值**，即直接写在**参数定义的后面**。 

```js
function Point(x = 0, y = 0) {
  this.x = x;
  this.y = y;
}

const p = new Point();
p // { x: 0, y: 0 }
```

参数变量是**默认声明**的，所以不能用`let`或`const`**再次声明**。

```js
function foo(x = 5) {
  let x = 1; // error
  const x = 2; // error
}
```

使用**参数默认值时**，函数**不能有同名参数**。

```js
// 不报错
function foo(x, x, y) {
  // ...
}

// 报错
function foo(x, x, y = 1) {
  // ...
}
// SyntaxError: Duplicate parameter name not allowed in this context
```

参数默认值不是**传值**的，而是每次都重新计算默认值表达式的值。

也就是说，参数默认值是**惰性求值**的。

需要使用时再求

```js
let x = 99;
function foo(p = x + 1) {
  console.log(p);
}

foo() // 100

x = 100;
foo() // 101
```

### 2. 与解构赋值默认值结合使用 

下面代码只使用了**对象的解构赋值默认值**，**没有使用函数参数的默认值**。

```js
function foo({x, y = 5}) {
  console.log(x, y);
}

foo({}) // undefined 5
foo({x: 1}) // 1 5
foo({x: 1, y: 2}) // 1 2
foo() // TypeError: Cannot read property 'x' of undefined
```

使用shiy函数参数的**默认值**

```js
function foo({x, y = 5} = {}) {
  console.log(x, y);
}

foo() // undefined 5
```

例如 : 

```js
function fetch(url, { body = '', method = 'GET', headers = {} }) {
  console.log(method);
}

fetch('http://example.com', {})
// "GET"

fetch('http://example.com')
// 报错

这种写法不能省略第二个参数，
如果结合函数参数的默认值，就可以省略第二个参数。
这时，就出现了双重默认值 :

function fetch(url, { body = '', method = 'GET', headers = {} } = {}) {
  console.log(method);
}

fetch('http://example.com')
// "GET"
```

练习 :

```js
// 写法一
function m1({x = 0, y = 0} = {}) {
  return [x, y];
}

// 写法二
function m2({x, y} = { x: 0, y: 0 }) {
  return [x, y];
}

// 函数没有参数的情况
m1() // [0, 0]
m2() // [0, 0]

// x 和 y 都有值的情况
m1({x: 3, y: 8}) // [3, 8]
m2({x: 3, y: 8}) // [3, 8]

// x 有值，y 无值的情况
m1({x: 3}) // [3, 0]
m2({x: 3}) // [3, undefined]

// x 和 y 都无值的情况
m1({}) // [0, 0];
m2({}) // [undefined, undefined]

m1({z: 3}) // [0, 0]
m2({z: 3}) // [undefined, undefined]
```

### 3. 参数默认值的位置

通常情况下，定义了**默认值的参数**，应该是**函数的尾参数**。 

如果非尾部的参数设置默认值，实际上这个参数是**没法省略**的(没意义)。 

```js
function f(x = 1, y) {
  return [x, y];
}

f() // [1, undefined]
f(2) // [2, undefined])
f(, 1) // 报错
f(undefined, 1) // [1, 1]
```

如果传入**undefined**，将触发该参数等于默认值，**null** 则没有这个效果。

```js
function foo(x = 5, y = 6) {
  console.log(x, y);
}

foo(undefined, null)
// 5 null
```

### 4. 函数的 length 属性 

指定了默认值以后，函数的`length`属性，将返回没有指定默认值的参数个数。也就是说，指定了默认值后，**`length`属性将失真**。

```
(function (a) {}).length // 1
(function (a = 5) {}).length // 0
(function (a, b, c = 5) {}).length // 2
```

因为`length`属性的含义是，该函数**预期传入的参数个数**。

某个**参数指定默认值**以后，**预期传入的参数个数就不包括这个参数**了 

### 5. 作用域

一旦设**置了参数的默认值**，**函数**进行**声明初始化**时，**参数会形成一个单独的作用域**（context）。

等到初**始化结束**，这个**作用域就会消失**。(在不设置参数默认值时不会出现)

**有就从形参作用域找**

```js
var x = 1;

function f(x, y = x) {
  console.log(y);
}

f(2) // 2
```

**没有就去外层的作用域里面找**(形参的外层)

直到找到window , 如果找不到会报错

```js
let x = 4
function one (){
	let x = 3
	function two (y = x){
    let x = 2       // 不会打印2 (因为找的是外层的作用域)
		console.log(y) // 3 (没有就去外层的作用域找)
	}
	two()
}
one()
```

## 2. rest 参数

**ES6** 引入 **rest 参数**（形式为 ...**变量名**），用于获取函数的多余参数，这样就不需要使用`arguments`对象了。

**rest** 参数搭配的变量**是一个数组**，该变量将多余的参数放入数组中。

注意，**rest 参数之后不能再有其他参数**（即只能是最后一个参数），**否则会报错。**

```js
// 报错
function f(a, ...b, c) {
  // ...
}
```

例子1.  求和函数，利用 rest 参数 

```js
function add(...values) {
  let sum = 0;
  for (var val of values) {
    sum += val;
  }
  console.log(values) // [2,5,3]
  console.log(sum); // 10
}

add(2, 5, 3) 
```

例子2.  rest 参数代替`arguments`变量的例子。

```js
// arguments变量的写法
function sortNumbers() {
  return Array.prototype.slice.call(arguments).sort();
  // arguments是类数组, 想使用数组的方法必须先转化为数组
  // slice()第一个参数是截取长度,不传默认返回原数组对象
}

// rest参数的写法
const sortNumbers = (...numbers) => numbers.sort();
```

例子3. 利用 rest 参数改写数组`push`方法 

```js
function push(array, ...items) {
  items.forEach(function(item) {
    array.push(item);
    console.log(item);
  });
}

var a = [];
push(a, 1, 2, 3)
```

函数的`length`属性，不包括 rest 参数。

```js
(function(a) {}).length  // 1
(function(...a) {}).length  // 0
(function(a, ...b) {}).length  // 1
```

## 3. 严格模式

从 **ES5** 开始，**函数内部可以设定为严格模式**。

```js
function doSomething(a, b) {
  'use strict';
  // code
}
```

**ES2016** 做了一点修改，规定**只要函数参数使用了默认值、解构赋值、或者扩展运算符**，那么**函数内部就不能显式设定为严格模式，否则会报错**。 

```js
// 报错
function doSomething(a, b = a) {
  'use strict';
  // code
}

// 报错
const doSomething = function ({a, b}) {
  'use strict';
  // code
};

// 报错
const doSomething = (...a) => {
  'use strict';
  // code
};

const obj = {
  // 报错
  doSomething({a, b}) {
    'use strict';
    // code
  }
};
```

**两种方法可以规避这种限制**。

**第一种**是设定全局性的严格模式，这是合法的。

```js
'use strict';

function doSomething(a, b = a) {
  // code
}
```

**第二种**是把函数包在一个无参数的立即执行函数里面。

```js
const doSomething = (function () {
  'use strict';
  return function(value = 42) {
    return value;
  };
}());
```

## 4. name 属性

函数的`name`属性，返回该函数的函数名。

```js
function foo() {}
foo.name // "foo"
```

这个属性早就被浏览器广泛支持，但是直到 ES6，才将其写入了标准。

需要注意的是，**ES6** 对这个属性的行为**做出了一些修改**。

如果将一个匿名函数赋值给一个变量，

**ES5** 的`name`属性，会返回**空字符串**，

**ES6** 的`name`属性会返回**实际的函数名**。

```js
var f = function () {};

// ES5
f.name // ""

// ES6
f.name // "f"
```

如果将一个**具名函数**赋值给一个变量，则 **ES5** 和 **ES6** 的`name`属性都返回这个具名**函数原本的名字**。

```js
const bar = function baz() {};

// ES5
bar.name // "baz"

// ES6
bar.name // "baz"
```

 **Function **构造函数返回的函数实例，`name`属性的值为 **anonymous**。

```js
(new Function).name // "anonymous"
```

**bind** 返回的函数，**name**属性值会加上 **bound** 前缀。

```js
function foo() {};
foo.bind({}).name // "bound foo"

(function(){}).bind({}).name // "bound "
```

## 5. 箭头函数

### 基本用法

ES6 允许使用“箭头”（`=>`）定义函数。

```js
var f = v => v;

// 等同于
var f = function (v) {
  return v;
};
```

如果箭头函数不需要参数或需要多个参数，就使用一个圆括号代表参数部分。

```js
var f = () => 5;
// 等同于
var f = function () { return 5 };

var sum = (num1, num2) => num1 + num2;
// 等同于
var sum = function(num1, num2) {
  return num1 + num2;
};
```

如果箭头函数的代码块部分**多于一条语句**，就要使用大括号将它们括起来，并且使用`return`语句返回。

```js
var sum = (num1, num2) => { return num1 + num2; }
```

由于大括号被解释为代码块，所以如果**箭头函数直接返回一个对象**，必须在对象外面加上括号，否则会报错。

```js
// 报错
let getTempItem = id => { id: id, name: "Temp" };

// 不报错
let getTempItem = id => ({ id: id, name: "Temp" });
```

下面是一种**特殊情况，虽然可以运行，但会得到错误的结果**。

```js
let foo = () => { a: 1 };
foo() // undefined
```

箭头函数可以**与变量解构结合**使用。

```js
const full = ({ first, last }) => first + ' ' + last;

// 等同于
function full(person) {
  return person.first + ' ' + person.last;
}
```

箭头函数使得表达更加简洁。

```js
const isEven = n => n % 2 === 0;
const square = n => n * n;
```

箭头函数的一个用处是**简化回调函数**。

```js
// 正常函数写法
[1,2,3].map(function (x) {
  return x * x;
});

// 箭头函数写法
[1,2,3].map(x => x * x);
```

### 使用注意点

**（1）**函数体内的`this`对象，就是**定义时所在的对象**，而**不是使用时所在的对象**。

**（2）**不可以当作构造函数，也就是说，不可以使用`new`命令，否则会抛出一个错误。

**（3）**不可以使用`arguments`对象，该对象在函数体内不存在。如果要用，可以用 **rest 参数代替**。

**（4）**不可以使用`yield`命令，因此箭头函数不能用作 Generator 函数。

例子

```js
function Timer() {
  this.s1 = 0;
  this.s2 = 0;
  // 箭头函数
  setInterval(() => this.s1++, 1000);
  // 普通函数
  setInterval(function () {
    this.s2++;
  }, 1000);
}

var timer = new Timer();

setTimeout(() => console.log('s1: ', timer.s1), 3100);
setTimeout(() => console.log('s2: ', timer.s2), 3100);
// s1: 3
// s2: 0

前者的this绑定定义时所在的作用域（即Timer函数），
后者的this指向运行时所在的作用域（即全局对象）。
所以，3100 毫秒之后，timer.s1被更新了 3 次，而timer.s2一次都没更新。
```

`this`指向的**固定化**，并不是因为箭头函数内部有绑定`this`的机制，

**实际原因是箭头函数根本没有自己的`this`，导致内部的`this`就是外层代码块的`this`**。正是因为它没有`this`，所以也就**不能用作构造函数**。 

```js
// ES6
function foo() {
  setTimeout(() => {
    console.log('id:', this.id);
  }, 100);
}

// ES5
function foo() {
  var _this = this;

  setTimeout(function () {
    console.log('id:', _this.id);
  }, 100);
}
```

**除了`this`**，以下**三个变量在箭头函数之中也是不存在的**，指向外层函数的对应变量：`arguments`、`super`、`new.target`。

```js
function foo() {
  setTimeout(() => {
    console.log('args:', arguments);
    // 找的是外层函数的arguments
  }, 100);
}

foo(2, 4, 6, 8)
// args: [2, 4, 6, 8]
```

另外，由于**箭头函数没有自己的`this`**，所以当然也**就不能用`call()`、`apply()`、`bind()`这些方法去改变`this`的指向**。

```js
(function() {
  return [
    (() => this.x).bind({ x: 'inner' })()
  ];
}).call({ x: 'outer' });
// ['outer']
```

### 不适用场合

由于箭头函数使得**`this`从“动态”变成“静态”**，下面两个场合不应该使用箭头函数。



```js
第一个场合是定义函数的方法，且该方法内部包括this。
const cat = {
  lives: 9,
  jumps: () => {
    this.lives--;
  }
}
如果是普通函数，该方法内部的this指向cat；
如果写成上面那样的箭头函数，使得this指向全局对象，没任何意义。(会污染全局)
```

```js
第二个场合是需要动态this的时候，也不应使用箭头函数。
var button = document.getElementById('press');
button.addEventListener('click', () => {
  this.classList.toggle('on'); // 报错
});

button的监听函数是一个箭头函数，导致里面的this就是全局对象。
```

## 6. 双冒号运算符

箭头函数可以绑定`this`对象，大大减少了显式绑定`this`对象的写法（`call`、`apply`、`bind`）。

但是，**箭头函数并不适用于所有场合**，所以现在有一个**提案**，

提出了**“函数绑定” 运算符**，**用来取代`call`、`apply`、`bind`调用**。 

```js
foo::bar;
// 等同于
bar.bind(foo);

foo::bar(...arguments);
// 等同于
bar.apply(foo, arguments);
```

如果双冒号**左边为空**，**右边是一个对象的方法**，则**等于将该方法绑定在该对象上面**。

```js
var method = obj::obj.foo;
// 等同于
var method = ::obj.foo;

let log = ::console.log;
// 等同于
var log = console.log.bind(console);
```

## 7. 尾调用优化

### 什么是尾调用？

尾调用一句话就能说清楚，就是**指某个函数的最后一步是调用另一个函数**。

```js
function f(x){
  return g(x);
}
```

上面代码中，函数`f`的最后一步是调用函数`g`，这就叫尾调用。

以下三种情况，都不属于尾调用。

```js
// 情况一
function f(x){
  let y = g(x);
   // 调用函数g之后，还有赋值操作，所以不属于尾调用
  return y;
}

// 情况二
function f(x){
  return g(x) + 1;
  // 调用后还有操作，即使写在一行内。 不属于尾调用
}

// 情况三
function f(x){
  g(x); // 不是最后一步操作
  // 没返回值 , 最后默认隐式返回undefined , 
}
// 情况三等同于下面代码: 由于不是最后一步操作 , 不属于尾调用
function f(x){
  g(x);
  return undefined;
}
```

尾调用不一定出现在函数尾部，**只要是最后一步操作** ( **中途 return** 也可以 )即可 : 

```js
function f(x) {
  if (x > 0) {
    return m(x)
  }
  return n(x);
}

上面代码中，函数m和n都属于尾调用，因为它们都是函数f的最后一步操作。
```

###  尾递归

函数调用自身，称为递归。如果**尾调用自身**，就称为**尾递归**。 

**递归非常耗费内存**，因为需要**同时保存成千上百个调用帧**，很容易发生“**栈溢出”错误**。

但对于尾递归来说，由于**只存在一个调用帧**，所以**永远不会发生“栈溢出”**错误。

```js
function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
  // 一直在等待下个结构返回 , 这将是非常耗费内存的
}

factorial(5) // 120
```

上面代码是一个阶乘函数，计算`n`的阶乘，最**多需要保存`n`个调用记录**，**复杂度 O(n)** 。

如果**改写成尾递归，只保留一个调用记录**，复杂度 O(1) 。

```js
function factorial(n, total) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5, 1) // 120
```

还有一个比较著名的例子，就是计算 Fibonacci 数列，也能充分说明尾递归优化的重要性。

非尾递归的 Fibonacci 数列实现如下。

```js
function Fibonacci (n) {
  if ( n <= 1 ) {return 1};

  return Fibonacci(n - 1) + Fibonacci(n - 2);
}

Fibonacci(10) // 89
Fibonacci(100) // 堆栈溢出
Fibonacci(500) // 堆栈溢出
```

尾递归优化过的 Fibonacci 数列实现如下。

```js
function Fibonacci2 (n , ac1 = 1 , ac2 = 1) {
  if( n <= 1 ) {return ac2};

  return Fibonacci2 (n - 1, ac2, ac1 + ac2);
}

Fibonacci2(100) // 573147844013817200000
Fibonacci2(1000) // 7.0330367711422765e+208
Fibonacci2(10000) // Infinity
```

配合采用 ES6 的函数默认值。

```js
function factorial(n, total = 1) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5) // 120
// 这样就不需要传入1了
```

# 6. 数组的扩展

## 1. 扩展运算符

含义

**扩展运算符**（spread）是三个点（...）。

它好比 rest 参数的**逆运算**，将一个**数组转为用逗号分隔的参数序列**。

```js
console.log(...[1, 2, 3])
// 1 2 3

console.log(1, ...[2, 3, 4], 5)
// 1 2 3 4 5

[...document.querySelectorAll('div')]
// [<div>, <div>, <div>]
```

**该运算符主要用于函数调用**。

```
function push(array, ...items) {
  array.push(...items);
}

function add(x, y) {
  return x + y;
}

const numbers = [4, 38];
add(...numbers) // 42
```

**扩展运算符与正常的函数参数可以结合使用**，非常灵活。

```js
function f(v, w, x, y, z) { }
const args = [0, 1];
f(-1, ...args, 2, ...[3]);
```

扩展运算符后面还可以**放置表达式**。

```js
var arr = [...(3>2?1:0)] // 报错 因为...结构的是数组

var arr = [...(3>2?[1]:[0])]
arr  // [1]
```

如果扩展运算符后面是**一个空数组**，则不产生任何效果。

```js
[...[], 1]
// [1]
```

注意，**扩展运算符**如果**放在括号中**，JavaScript **引擎就会认为这是函数调用**。

如果这时不是函数调用，就会报错。

```js
(...[1, 2])
// Uncaught SyntaxError: Unexpected number

console.log((...[1, 2]))
// Uncaught SyntaxError: Unexpected number

console.log(...[1, 2])
// 1 2
```

**替代函数的 apply 方法**

由于扩展运算符可以展开数组，所以不再需要`apply`方法，将**数组转为函数的参数**了。

```js
// ES5 的写法
function f(x, y, z) {
  // ...
}
var args = [0, 1, 2];
// 如果想把数组当函数参数 , 需要运用apply(第二个参数传的就是数组)
f.apply(null, args);

// ES6的写法
function f(x, y, z) {
  // ...
}
let args = [0, 1, 2];
f(...args);
```

**扩展运算符取代`apply`方法的一个实际的例子 :**

应用`Math.max`方法，**简化求出一个数组最大元素的写法**。

```js
// ES5 的写法
Math.max.apply(null, [14, 3, 77])

// ES6 的写法
Math.max(...[14, 3, 77])

// 等同于
Math.max(14, 3, 77);
```

**另一个例子** : 

是通过`push`函数，将一个数组添加到另一个数组的尾部。

```js
// ES5的 写法
var arr1 = [0, 1, 2];
var arr2 = [3, 4, 5];
Array.prototype.push.apply(arr1, arr2);

// ES6 的写法
let arr1 = [0, 1, 2];
let arr2 = [3, 4, 5];
arr1.push(...arr2);
```

### 扩展运算符的应用

#### **（1）复制数组**

数组是复合的数据类型，直接复制的话，只是复制了指向底层数据结构的指针，而不是克隆一个全新的数组。

```js
const a1 = [1, 2];
const a2 = a1;

a2[0] = 2;
a1 // [2, 2]
```

上面代码中，`a2`并不是`a1`的克隆，而是指向同一份数据的另一个指针。修改`a2`，会直接导致`a1`的变化。

ES5 只能用变通方法来复制数组。

```js
const a1 = [1, 2];
const a2 = a1.concat();
// concat() 方法用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。

a2[0] = 2;
a1 // [1, 2]
```

上面代码中，`a1`会返回原数组的克隆，再修改`a2`就不会对`a1`产生影响。

**扩展运算符**提供了复制数组的简便写法。

```js
const a1 = [1, 2];
// 写法一
const a2 = [...a1];
```

上面的两种写法，**`a2`都是`a1`的克隆**。

#### **（2）合并数组**

扩展运算符提供了数组合并的新写法。

```js
const arr1 = ['a', 'b'];
const arr2 = ['c'];
const arr3 = ['d', 'e'];

// ES5 的合并数组
arr1.concat(arr2, arr3);
// [ 'a', 'b', 'c', 'd', 'e' ]

// ES6 的合并数组
[...arr1, ...arr2, ...arr3]
// [ 'a', 'b', 'c', 'd', 'e' ]
```

```js
不过，这两种方法都是浅拷贝，使用的时候需要注意。
const a1 = [{ foo: 1 }];
const a2 = [{ bar: 2 }];

const a3 = a1.concat(a2);
const a4 = [...a1, ...a2];

a3[0] === a1[0] // true
a4[0] === a1[0] // true
```

上面代码中，**`a3`和`a4`**是用两种不同方法合并而成的新数组，但是**它们的成员都是对原数组成员的引用，这就是浅拷贝**。**如果修改了原数组的成员，会同步反映到新数组**。

#### **（3）与解构赋值结合**

扩展运算符可以与解构赋值结合起来，**用于生成数组**。

```js
// ES5
a = list[0], rest = list.slice(1)
// ES6
[a, ...rest] = list
```

下面是另外一些例子。

```js
const [first, ...rest] = [1, 2, 3, 4, 5];
first // 1
rest  // [2, 3, 4, 5]

const [first, ...rest] = [];
first // undefined
rest  // []

const [first, ...rest] = ["foo"];
first  // "foo"
rest   // []
```

如果将**扩展运算符用于数组赋值**，**只能放在参数的最后一位**，**否则**会**报错**。

```js
const [...butLast, last] = [1, 2, 3, 4, 5];
// 报错

const [first, ...middle, last] = [1, 2, 3, 4, 5];
// 报错
```

#### **（4）字符串**

扩展运算符还可以将字符串转为真正的数组。

```js
[...'hello']
// [ "h", "e", "l", "l", "o" ]
```

#### **（5）实现了 Iterator 接口的对象**

任何定义了遍历器（Iterator）接口的对象(类数组)，都可以用**扩展运算符转为真正的数组**。

```js
let nodeList = document.querySelectorAll('div');
let array = [...nodeList];
```

上面代码中，`querySelectorAll`方法返回的是一个`NodeList`对象。

它不是数组，而是一个类似数组的对象。

这时，扩展运算符可以将其转为真正的数组，原因就在于 **NodeList** 对象实现了 **Iterator**

**对于那些没有部署 Iterator 接口的类似数组的对象，扩展运算符就无法将其转为真正的数组**。

```js
let arrayLike = {
  '0': 'a',
  '1': 'b',
  '2': 'c',
  length: 3
};

// TypeError: Cannot spread non-iterable object. 报错
let arr = [...arrayLike];
```

#### **（6）Map 和 Set 结构，Generator 函数**

扩展运算符内部调用的是**数据结构的 Iterator 接口，因此只要具有 Iterator 接口的对象，都可以使用扩展运算符**，比如 **Map 结构**。

```js
let map = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
]);

let arr = [...map.keys()]; // [1, 2, 3]
```

**Generator** 函数运行后，返回一个遍历器对象，因此也可以使用扩展运算符。

```js
const go = function*(){
  yield 1;
  yield 2;
  yield 3;
};

[...go()] // [1, 2, 3]
```

上面代码中，变量`go`是一个 Generator 函数，执行后返回的是一个遍历器对象，对这个遍历器对象执行扩展运算符，就会将内部遍历得到的值，转为一个数组。

如果**对没有 Iterator 接口的对象，使用扩展运算符，将会报错**。

```js
const obj = {a: 1, b: 2};
let arr = [...obj]; // TypeError: Cannot spread non-iterable object
```

## 2. Array.from()

`Array.from`方法用于**将两类对象转为真正的数组**：

1. 类似数组的对象（类数组）
2. 可遍历（iterable）的对象（包括 ES6 新增的数据结构 Set 和 Map）。

例子:

```js
let arrayLike = {
    '0': 'a',
    '1': 'b',
    '2': 'c',
    length: 3
};

// ES5的写法
var arr1 = [].slice.call(arrayLike); // ['a', 'b', 'c']

// ES6的写法
let arr2 = Array.from(arrayLike); // ['a', 'b', 'c']
```

**实际应用**中，

常见的类似数组的对象是 DOM 操作返回的 NodeList 集合，以及函数内部的`arguments`对象。**`Array.from`都可以将它们转为真正的数组**。

```js
// NodeList对象
let ps = document.querySelectorAll('p');
// 返回的是一个类似数组的对象，可以将这个对象转为真正的数组，
// 再使用filter方法过滤不需要的属性
Array.from(ps).filter(p => {
  return p.textContent.length > 100;
});

// arguments对象
function foo() {
  var args = Array.from(arguments);
  // ...
}
```

**只要是部署了 Iterator 接口的数据结构**，`Array.from`都能将其转为数组。

```js
Array.from('hello')
// ['h', 'e', 'l', 'l', 'o']

let namesSet = new Set(['a', 'b'])
Array.from(namesSet) // ['a', 'b']

// 字符串和 Set 结构都具有 Iterator 接口，因此可以被Array.from转为真正的数组。
```

**如果参数是一个真正的数组**，`Array.from`会返回一个一模一样的新数组。

```js
Array.from([1, 2, 3])
// [1, 2, 3]
```

值得提醒的是，扩展运算符（`...`）也可以将某些数据结构转为数组。

```js
// arguments对象
function foo() {
  const args = [...arguments];
}

// NodeList对象
[...document.querySelectorAll('div')]
```

扩展运算符背后调用的是遍历器接口（`Symbol.iterator`），如果一个对象没有部署这个接口，就无法转换。

**`Array.from`方法还支持类似数组的对象**。**所谓类似数组的对象，本质特征只有一点，即必须有`length`属性。**因此，任何有`length`属性的对象，都**可以通过`Array.from`方法转为数组**，

但是此时**扩展运算符就无法转换**!

```js
Array.from({ length: 3 });
// [ undefined, undefined, undefined ]
// 能成功转为返回了数组,因为有length属性,
// 但是由于没有值,所以为undefined

Array.from返回了一个具有三个成员的数组，每个位置的值都是undefined。
如果是扩展运算符 转换不了这个对象。
```

**`Array.from`还可以接受第二个参数**，作用类似于数组的`map`方法，**用来对每个元素进行处理**，将处理后的值放入返回的数组。

```js
Array.from(arrayLike, x => x * x);
// 等同于
Array.from(arrayLike).map(x => x * x);

Array.from([1, 2, 3], (x) => x * x)
// [1, 4, 9]
```

对于还没有部署该方法的浏览器，可以用**`Array.prototype.slice`方法替代**

```js
const toArray = (() =>
  Array.from ? Array.from : obj => [].slice.call(obj)
)();
```

下面的例子将**数组中布尔值为`false`的成员转为`0`**。

```js
Array.from([1, , 2, , 3], (n) => n || 0)
// [1, 0, 2, 0, 3]
```

## 3. Array.of()

`Array.of`方法用于**将一组值，转换为数组**。

```js
Array.of(3, 11, 8) // [3,11,8]
Array.of(3) // [3]
Array.of(3).length // 1
```

这个方法的主要目的，是弥补数组构造函数`Array()`的不足。因为参数个数的不同，会导致`Array()`的行为有差异。

```js
只有当参数个数不少于 2 个时，Array()才会返回由参数组成的新数组。
参数个数只有一个时，实际上是指定数组的长度。

Array() // []
Array(3) // [, , ,]
Array(3, 11, 8) // [3, 11, 8]
```

**`Array.of`基本上可以用来替代`Array()`或`new Array()`**，并且不存在由于参数不同而导致的重载。它的行为非常统一。

```js
Array.of() // []
Array.of(undefined) // [undefined]
Array.of(1) // [1]
Array.of(1, 2) // [1, 2]
```

**Array.of**总是返回参数值组成的数组。如果没有参数，就返回一个空数组。

`Array.of`方法可以用下面的**代码模拟实现**。

```js
function ArrayOf(){
  return [].slice.call(arguments);
  // 把形参用slice方法放到[] , 返回新的[]数组
}
```
## 4. 数组实例的 copyWithin()

在当前数组内部，将**指定位置的成员 ****复制 到其他位置（**会覆盖原有成员**），然后**返回当前数组**。

也就是说，**使用这个方法，会修改当前数组**。

```js
Array.prototype.copyWithin(target, start = 0, end = this.length)
```

它接受三个参数。

- **target（必需）**：从该位置开始**替换数据**。如果为负值，表示倒数。
- **start（可选）**：从该位置开始**读取数据**，默认为 0。如果为负值，表示倒数。
- **end（可选）**：到该位置前停**止读取数据**，默认等于数组长度。如果为负值，表示倒数。

这三个参数都应该是数值，如果不是，会**自动转为数值**。

```js
[1, 2, 3, 4, 5].copyWithin(0, 3)
// 从第三开始读取数据 , 替换到第零位开始
// [4, 5, 3, 4, 5]
```

## 5. 数组实例的 find() 和 findIndex()

数组实例的 **find** 方法，用于找出**第一个符合条件的数组成员**。

它的**参数是一个回调函数**，**所有**数组**成员**依次**执行该回调函数**，**直到找出第一个返回值为`true`的成员**，然后返回该成员。如果全部**没有符合条件的成员，则返回`undefined`**。

```js
// find方法的`回调函数`可以接受三个参数 :
// 依次为当前的值、当前的位置和原数组。
[1, 5, 10, 15].find(function(value, index, arr) {
  return value > 9;
}) // 10
```

数组实例的 **findIndex** 方法的用法与`find`方法非常类似，

**返回**第一个**符合条件**的数组成员的**位置**，**如果所有成员都不符合条件，则返回`-1`**。

```js
[1, 5, 10, 15].findIndex(function(value, index, arr) {
  return value > 9;
}) // 2
```

这**两个方法**都可以**接受第二个参数**，用来**绑定回调函数的`this`对象**。

```js
function f(v){
  return v > this.age;
}
let person = {name: 'John', age: 20};
[10, 12, 26, 15].find(f, person);    // 26
```

这两个方法**都可以发现`NaN`**，弥补了**数组的`indexOf`方法的不足**。

```js
[NaN].indexOf(NaN)
// -1

[NaN].findIndex(y => Object.is(NaN, y))
// 0

上面代码中，indexOf方法无法识别数组的NaN成员，但是findIndex方法可以借助Object.is方法做到。
```

## 6. 数组实例的fill()

`fill`方法**使用给定值**，**填充一个数组**。(数组中**已有的元素**，会被**全部抹去**。 )

```js
['a', 'b', 'c'].fill(7)
// [7, 7, 7]

new Array(3).fill(7)
// [7, 7, 7]
```

如果**填充的类型为对象**，那么被赋值的是**同一个内存地址的对象**，而不是深拷贝对象。

```js
let arr = new Array(3).fill({name: "Mike"});
arr[0].name = "Ben";
arr
// [{name: "Ben"}, {name: "Ben"}, {name: "Ben"}]

let arr = new Array(3).fill([]);
arr[0].push(5);
arr
// [[5], [5], [5]]
```

## 7.  数组实例的 includes()

`Array.prototype.includes`方法**返回一个布尔值**，表示**某个数组是否包含给定的值**，

与**字符串的`includes`方法**类似。**ES2016 引入了该方法**。 



该方法的**第二个参数**表示**搜索的起始位置**，默认为`0`。

**如果**第二个参数**为负数**，则表示**倒数的位置**，

**如果**这时**它大于数组长度**（比如第二个参数为`-4`，但数组长度为`3`），则会**重置为从`0`开始**。 

没有该方法之前，我们通常使用数组的`indexOf`方法，检查**是否包含某个值**。

```js
if (arr.indexOf(el) !== -1) {
  // ...
}
```

`indexOf`方法有两个缺点 :

一是 , 不够语义化，它的含义是找到参数值的第一个出现位置，所以要去比较是否不等于`-1`，表达起来不够直观。

二是，它内部使用**严格相等运算符（`===`）进行判断**，这会导致对`NaN`的误判。

```js
[NaN].indexOf(NaN)
// -1
```

**`includes`使用的是不一样的判断算法**，就没有这个问题。

```js
[NaN].includes(NaN)
// true
```

## 8. 数组实例的 flat() , flatMap()

数组的成员有时还是数组，`Array.prototype.flat()`用于将嵌套的数组“拉平”，变成一维的数组。该方法返回一个新数组，对原数据没有影响。

```js
[1, 2, [3, 4]].flat()
// [1, 2, 3, 4]
```

**`flat()`默认只会“拉平”一层**，默认值为**1**。

想要“拉平”多层的嵌套数组，可以将**`flat()`方法的参数**写成一个**整数**表示想要拉平的层数

```js
[1, 2, [3, [4, 5]]].flat()
// [1, 2, 3, [4, 5]]

[1, 2, [3, [4, 5]]].flat(2)
// [1, 2, 3, 4, 5]
```

如果**不管有多少层嵌套**，都要转成一维数组，可以用`Infinity`关键字作为参数。

```js
[1, [2, [3]]].flat(Infinity)
// [1, 2, 3]
```

如果**原数组有空位**，`flat()`方法**会跳过空位**。

```js
[1, 2, , 4, 5].flat()
// [1, 2, 4, 5]
```

## 9. 数组的空位

数组的空位指，数组的某一个位置没有任何值。比如，`Array`构造函数返回的数组都是空位。

```js
Array(3) // [, , ,]

空位不是`undefined`，
一个位置的值等于undefined，依然是有值的。
空位是没有任何值，in运算符可以说明这一点。

0 in [undefined, undefined, undefined] // true
0 in [, , ,] // false
```

```js
// forEach(), filter(), reduce(), every() 和some()都会跳过空位。
// forEach方法
[,'a'].forEach((x,i) => console.log(i)); // 1

// filter方法
['a',,'b'].filter(x => true) // ['a','b']

// every方法
[,'a'].every(x => x==='a') // true

// reduce方法
[1,,2].reduce((x,y) => x+y) // 3

// some方法
[,'a'].some(x => x !== 'a') // false

// map()会跳过空位，但会保留这个值
// map方法
[,'a'].map(x => 1) // [,1]

//join()和toString()会将空位视为undefined，
// 而undefined和null会被处理成空字符串。
// join方法
[,'a',undefined,null].join('#') // "#a##"

// toString方法
[,'a',undefined,null].toString() // ",a,,"
```

**ES6** 则是明确**将空位转为`undefined`**。 

`Array.from`方法会将数组的空位，转为`undefined`，也就是说，这个方法不会忽略空位。

```js
Array.from(['a',,'b'])
// [ "a", undefined, "b" ]
```

扩展运算符（`...`）也会将空位转为`undefined`。

```js
[...['a',,'b']]
// [ "a", undefined, "b" ]
```

`copyWithin()`会连空位一起拷贝。

```js
[,'a','b',,].copyWithin(2,0) // [,"a",,"a"]
```

`fill()`会将空位视为正常的数组位置。

```js
new Array(3).fill('a') // ["a","a","a"]
```

`for...of`循环也会遍历空位。

```js
let arr = [, ,];
for (let i of arr) {
  console.log(1);
}
// 1
// 1
```

上面代码中，数组`arr`有两个空位，`for...of`并没有忽略它们。如果改成`map`方法遍历，空位是会跳过的。

`entries()`、`keys()`、`values()`、`find()`和`findIndex()`会将空位处理成`undefined`。

```js
// entries()
[...[,'a'].entries()] // [[0,undefined], [1,"a"]]

// keys()
[...[,'a'].keys()] // [0,1]

// values()
[...[,'a'].values()] // [undefined,"a"]

// find()
[,'a'].find(x => true) // undefined

// findIndex()
[,'a'].findIndex(x => true) // 0
```

由于空位的处理规则非常不统一，所以建议避免出现空位。

# 7. 对象的扩展

## 1. 属性的简洁表示法

**简洁写法的属性名**总是**字符串**

```js
ES6 允许直接写入变量和函数，作为对象的属性和方法。这样的书写更加简洁。

const foo = 'bar';
const baz = {foo}; // 等同于 const baz = {foo: foo};
baz // {foo: "bar"}


function f(x, y) {
  return {x, y};
}
// 等同于
function f(x, y) {
  return {x: x, y: y};
}
f(1, 2) // Object {x: 1, y: 2}
```

除了属性简写，**方法也可以简写**。 

```js
const o = {
  method() {
    return "Hello!";
  }
};

// 等同于

const o = {
  method: function() {
    return "Hello!";
  }
};
```

用于函数**的返回值**，将会非常方便。 

```js
function getPoint() {
  const x = 1;
  const y = 10;
  return {x, y};
}

getPoint()
// {x:1, y:10}
```

注意，**简洁写法的属性名**总是**字符串**，这会导致一些看上去比较奇怪的结果。

```js
const obj = {
  class () {}
};

// 等同于

var obj = {
  'class': function() {}
};

上面代码中，class是字符串，所以不会因为它属于关键字，而导致语法解析报错。
```

如果某个方法的**值是一个 Generator 函数**，前面**需要加上星号**。

```js
const obj = {
  * m() {
    yield 'hello world';
  }
};
```

## 2. 属性名表达式

JavaScript 定义对象的属性，有两种方法。

**方法一** 是直接用标识符作为属性名，

**方法二** 是用表达式作为属性名，这时要将表达式放在方括号之内。 

```js
// 方法一
obj.foo = true;

// 方法二
obj['a' + 'bc'] = 123;
```

**在 ES5 中** : 

如果使用**字面量方式**定义对象（使用大括号{}） 只能使用**方法一（标识符）**定义属性。 

**在 ES6 中** : 

**允许字面量定义**对象时，**用**方法二**（表达式）作为对象的属性名**，即把表达式放在方括号内。 

例子 :

```js
let propKey = 'foo';
let obj = {
  [propKey]: true,
  ['a' + 'bc']: 123
};

----------
  
let lastWord = 'last word';
const a = {
  'first word': 'hello',
  [lastWord]: 'world'
};
a['first word'] // "hello"
a[lastWord] // "world"
a['last word'] // "world"
```

**表达式**还可以**用于定义方法名**。

```js
let obj = {
  ['h' + 'ello']() {
    return 'hi';
  }
};

obj.hello() // hi
```

**属性名表达式**与**简洁表示法**，**不能同时使用**，**会报错**。

```js
// 报错
const foo = 'bar';
const baz = { [foo] }; // 报错

// 正确
const foo = 'bar';
const baz = { [foo]: 'abc'};
```

**属性名表达式**如果**是一个对象**，

默认情况下会自动将对象转为**字符串`[object Object]`**，这一点要特别小心。

```js
const keyA = {a: 1};
const keyB = {b: 2};

const myObject = {
  [keyA]: 'valueA',
  [keyB]: 'valueB'
};

myObject 
// [keyA]和[keyB]得到的都是[object Object]，
// 所以[keyB]会把[keyA]覆盖掉，而myObject最后只有一个[object Object]属性。
// 输出 Object {[object Object]: "valueB"}
```

## 3. 方法的name属性

**函数的`name`属性，返回函数名**。

**对象方法也是函数，因此也有`name`属性**

```js
const person = {
  sayName() {
    console.log('hello!');
  },
};
person.sayName.name   // "sayName"
```

**有两种特殊情况**：

**`bind`方法创造的函数**，`name`属性**返回`bound`加上原函数的名字**；

**Function** 构造函数创造的函数，`name`属性**返回`anonymous`**。

```js
(new Function()).name // "anonymous"

var doSomething = function() {
  // ...
};
doSomething.bind().name // "bound doSomething"
```

如果**对象的方法**是一个 Symbol 值，那么`name`属性**返回的是这个 Symbol 值的描述**

```js
const key1 = Symbol('description');
const key2 = Symbol();
let obj = {
  [key1]() {},
  [key2]() {},
};
obj[key1].name // "[description]" key1有描述
obj[key2].name // ""  ket2定义式没有描述
```

## 4. 属性的可枚举性和遍历

### 可枚举性

**对象的每个属性**都有一个**描述对象（Descriptor）**，用来控制该属性的行为。**`Object.getOwnPropertyDescriptor`方法**可以**获取该属性**的**描述对象**。

```js
let obj = { foo: 123 };
Object.getOwnPropertyDescriptor(obj, 'foo')
//  {
//    value: 123,
//    writable: true,
//    enumerable: true, // 可枚举性 值为false，就表示某些操作会忽略当前属性。
//    configurable: true
//  }
```

目前，有四个操作会忽略`enumerable`为`false`的属性。

- `for...in`循环：只遍历对象自身的和继承的可枚举的属性。
- `Object.keys()`：返回对象自身的所有可枚举的属性的键名。
- `JSON.stringify()`：只串行化对象自身的可枚举的属性。
- `Object.assign()`： 忽略`enumerable`为`false`的属性，只拷贝对象自身的可枚举的属性。

**四个操作之中，前三个是 ES5 就有的，最后一个`Object.assign()`是 ES6 新增的。** 

实际上，引入“可枚举”（`enumerable`）这个概念的最初目的 : 

就是让某些属性可以规避掉`for...in`操作，不然**所有内部属性和方法都会被遍历到**。 

**比如，**对象原型的`toString`方法，以及数组的`length`属性，就通过“可枚举性”，从而避免被`for...in`遍历到。

```js
Object.getOwnPropertyDescriptor(Object.prototype, 'toString').enumerable
// false

Object.getOwnPropertyDescriptor([], 'length').enumerable
// false

toString和length属性的enumerable都是false，
因此for...in不会遍历到这两个继承自原型的属性
```

**另外，ES6 规定**，所有 **Class 的原型的方法都是不可枚举**的。

```js
Object.getOwnPropertyDescriptor(class {foo() {}}.prototype, 'foo').enumerable
// false
```

### 属性的遍历

ES6 一共有 **5 种方法**可以遍历对象的属性。

**（1）for...in**

`for...in`循环遍历对象自身的和继承的可枚举属性（不含 Symbol 属性）。

**（2）Object.keys(obj)**

`Object.keys`返回一个数组，包括对象自身的（不含继承的）所有可枚举属性（不含 Symbol 属性）的键名。

**（3）Object.getOwnPropertyNames(obj)**

`Object.getOwnPropertyNames`返回一个数组，包含对象自身的所有属性（不含 Symbol 属性，但是包括不可枚举属性）的键名。

**（4）Object.getOwnPropertySymbols(obj)**

`Object.getOwnPropertySymbols`返回一个数组，包含对象自身的所有 Symbol 属性的键名。

**（5）Reflect.ownKeys(obj)**

`Reflect.ownKeys`返回一个数组，包含对象自身的所有键名，不管键名是 Symbol 或字符串，也不管是否可枚举。

以上的 5 种方法遍历对象的键名，都遵守同样的属性遍历的次序规则。

- 首先遍历所有数值键，按照数值升序排列。
- 其次遍历所有字符串键，按照加入时间升序排列。
- 最后遍历所有 Symbol 键，按照加入时间升序排列。

```js
Reflect.ownKeys({ [Symbol()]:0, b:0, 10:0, 2:0, a:0 })
// ['2', '10', 'b', 'a', Symbol()]
```

上面代码中，`Reflect.ownKeys`方法返回一个数组，包含了参数对象的所有属性。这个数组的属性次序是这样的，首先是数值属性`2`和`10`，其次是字符串属性`b`和`a`，最后是 Symbol 属性。

## 5. super关键字

我们知道，**`this`关键字**总是**指向函数所在的当前对象**，

ES6 又新增了另一个类似的**关键字`super`**，**指向当前对象的原型对象**。

```js
const proto = {
  foo: 'hello'
};

const obj = {
  foo: 'world',
  find() {
    return super.foo;
  }
};

Object.setPrototypeOf(obj, proto);
obj.find() // "hello"
```

**`super`关键字**表示原型对象时，只能用在**对象的方法**之中(**并且是对象方法的简写法** )，

用在其他地方都会报错。因为 :

**只有对象方法的简写法可以让 JavaScript 引擎确认**，**定义的是对象的方法** 

```js
// 报错
const obj = {
  foo: super.foo
}

// 报错
const obj = {
  foo: () => super.foo
}

// 报错
const obj = {
  foo: function () {
    return super.foo
  }
}
```

## 6. 对象的扩展运算符

### 解构赋值

结构赋值时 : { ...xxx } = { a : 1,b : 2 }  ...会生成新对象

```js
let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
x // 1
y // 2
z // { a: 3, b: 4 }
```

解构赋值要求等号右边是一个对象,如果等号**右边是`undefined`或`null**`，就会**报错**

**因为它们无法转为对象**。

```js
let { x, y, ...z } = null; // 运行时错误
let { x, y, ...z } = undefined; // 运行时错误
```

**解构赋值必须是最后一个参数，否则会报错。**

```js
let { ...x, y, z } = someObject; // 句法错误
let { x, ...y, ...z } = someObject; // 句法错误
```

注意，**解构赋值的拷贝是浅拷贝**，即**如果一个键的值是复合类型的值（数组、对象、函数）**、那么**解构赋值拷贝的是这个值的引用**，而**不是**这个值的**副本**。

```js
let obj = { a: { b: 1 } };
let { ...x } = obj; // ...将剩下的生成新对象
obj.a.b = 2;
x.a.b // 2
```

**解构赋值**的一个用处，是**扩展某个函数的参数**，引入其他操作。

```js
function baseFunction({ a, b }) {
  // ...
}
function wrapperFunction({ x, y, ...restConfig }) {
  // 使用 x 和 y 参数进行操作
  // 其余参数传给原始函数
  return baseFunction(restConfig);
}
```

### 扩展运算符

对象的扩展运算符（`...`）用于取出参数对象的所有可遍历属性，拷贝到当前对象之中。

```js
let z = { a: 3, b: 4 };
let n = { ...z };
n // { a: 3, b: 4 }
```

由于数组是特殊的对象，所以对象的扩展运算符也可以用于数组。

```js
let foo = { ...['a', 'b', 'c'] };
foo
// {0: "a", 1: "b", 2: "c"}
```

如果扩展运算符后面是一个空对象，则没有任何效果。

```js
{...{}, a: 1}
// { a: 1 }
```

如果扩展运算符后面不是对象，则会自动将其转为对象。

```js
// 等同于 {...Object(1)}
{...1} // {}
```

如果扩展运算符后面是字符串，它会自动转成一个类似数组的对象，因此返回的不是空对象。

```js
{...'hello'}
// {0: "h", 1: "e", 2: "l", 3: "l", 4: "o"}
```

扩展运算符**可以用于合并两个对象**。

```js
let ab = { ...a, ...b };
// 等同于
let ab = Object.assign({}, a, b);
```

如果用户**自定义的属性**，**放在扩展运算符后面**，则**扩展运算符内部的同名属性会被覆盖掉**。

```js
let a = {x : 10 , y : 20 }
let aWithOverrides = { ...a, x: 1, y: 2 };
aWithOverrides // {x: 1, y: 2}
```

与**数组的扩展运算符**一样，**对象的扩展运算符后面可以跟表达式**。

```js
let x = 2
const obj = {
  ...(x > 1 ? {a: 1} : {})
};
obj // {a: 1}
```
## 7. 对象的新增方法

### 1. Object.is()

**ES5** 比较两个值是否相等，只有**两个运算符**：

**相等运算符**（`==`）  ( 会自动转换数据类型 )

**严格相等运算符**（`===`）  (`NaN`不等于自身，以及`+0`等于`-0`)

**ES6** 提出“Same-value equality”（**同值相等）算法**，用来解决这个问题。

`Object.is`就是部署这个算法的新方法 :

它用来比较两个值是否严格相等，与严格比较运算符（===）的行为基本一致。

```js
Object.is('foo', 'foo')
// true
Object.is({}, {})
// false
```

**不同之处只有两个**：一是**`+0`不等于`-0`**，二是**`NaN`等于自身**。

```js
+0 === -0 //true
NaN === NaN // false

Object.is(+0, -0) // false
Object.is(NaN, NaN) // true
```

### 2. Object.assign()

#### 基本用法

`Object.assign`方法用于对象的合并，将**源对象**的**所有可枚举属性** **复制到目标对象**

如果目标对象与源对象有**同名属性**，或**多个源对象有同名属性**，则**后面的属性会覆盖前面的属性**。 

```js
例子1.
const target = { a: 1 };
const source1 = { b: 2 };
const source2 = { c: 3 };
Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}

例子2.
const target = { a: 1, b: 1 };
const source1 = { b: 2, c: 2 };
const source2 = { c: 3 };
Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}
```

如果只有一个参数，`Object.assign`会直接返回该参数。

```js
const obj = {a: 1};
Object.assign(obj) === obj // true
```

如果该参数不是对象，则会先转成对象，然后返回。

```js
typeof Object.assign(2) // "object"
```

由于**`undefined`和`null`无法转成对象**，所以**如果它们作为 首 参数**，就会报错。

```js
Object.assign(undefined) // 报错
Object.assign(null) // 报错
```

如果非对象参数出现在源对象的位置（**即非首参数**），那么处理规则有所不同。

如果`undefined`和`null`不在首参数，**就不会报错**。 

```js
let obj = {a: 1};
Object.assign(obj, undefined) === obj // true
Object.assign(obj, null) === obj // true
```

#### 注意点

**（1）浅拷贝**

`Object.assign`方法实行的是**浅拷贝**，而不是深拷贝。也就是说，如果源对象某个属性的值是对象，那么目标对象拷贝得到的是这个对象的引用。

```js
const obj1 = {a: {b: 1}};
const obj2 = Object.assign({}, obj1);

obj1.a.b = 2;
obj2.a.b // 2
```

**（2）同名属性的替换**

对于这种嵌套的对象，一旦遇到同名属性，`Object.assign`的处理方法是替换，而不是添加。

```js
const target = { a: { b: 'c', d: 'e' } }
const source = { a: { b: 'hello' } }
Object.assign(target, source)
// { a: { b: 'hello' } }
```

**（3）数组的处理**

`Object.assign`可以用来处理数组，但是会把数组视为对象。

```js
Object.assign([1, 2, 3], [4, 5])
// [4, 5, 3]

// Object.assign把数组视为属性名为 {0:1,1:2,2:3} {0:4,1:5}的对象，
// 因此源数组的 0 号属性4覆盖了目标数组的 0 号属性1。
```

**（4）取值函数的处理**

`Object.assign`只能进行值的复制，如果要复制的值是一个取值函数，那么将求值后再复制。

```js
const source = {
  get foo() { return 1 }
};
const target = {};

Object.assign(target, source)
// Object.assign不会复制这个取值函数，只会拿到值以后，将这个值复制过去。
// { foo: 1 }
```

#### 常见用途

`Object.assign`方法有很多用处。

##### **（1）为对象添加属性**

```js
class Point {
  constructor(x, y) {
    Object.assign(this, {x, y});
  }
}
// 通过Object.assign方法，将x属性和y属性添加到Point类的对象实例。
```

##### **（2）为对象添加方法**

```js
Object.assign(SomeClass.prototype, { 
  someMethod(arg1, arg2) { //  对象属性的简洁表示法，直接将两个函数放在大括号中
    ···
  },
  anotherMethod() {
    ···
  }
}); // 使用assign方法添加到SomeClass.prototype之中


// 等同于下面的写法
SomeClass.prototype.someMethod = function (arg1, arg2) {
  ···
};
SomeClass.prototype.anotherMethod = function () {
  ···
};

```

##### **（3）克隆对象**

```js
function clone(origin) {
  return Object.assign({}, origin);
}
```

上面代码将原始对象拷贝到一个空对象，就得到了原始对象的克隆。(克隆原始对象自身的值)

如果想要保持继承链，( **克隆它继承的值** ) 可以采用下面的代码。

```js
function clone(origin) {
  let originProto = Object.getPrototypeOf(origin);
  return Object.assign(Object.create(originProto), origin);
}
```

##### **（4）合并多个对象**

将多个对象合并到某个对象。

```js
const merge =
  (target, ...sources) => Object.assign(target, ...sources);
```

如果希望合并后返回一个新对象，可以改写上面函数，对一个空对象合并。

```js
const merge =
  (...sources) => Object.assign({}, ...sources);
```

##### **（5）为属性指定默认值**

```js
const DEFAULTS = {
  logLevel: 0,
  outputFormat: 'html'
};

function processContent(options) {
  options = Object.assign({}, DEFAULTS, options);
  console.log(options);
  // ...
}
// DEFAULTS对象是默认值，options对象是用户提供的参数。
// Object.assign方法将DEFAULTS和options合并成一个新对象，
// 如果两者有同名属性，则option的属性值会覆盖DEFAULTS的属性值。
```

注意，由于存在浅拷贝的问题，`DEFAULTS`对象和`options`对象的所有属性的值，最好都是简单类型，不要指向另一个对象。否则，`DEFAULTS`对象的该属性很可能不起作用。

```js
const DEFAULTS = {
  url: {
    host: 'example.com',
    port: 7070
  },
};

processContent({ url: {port: 8000} })
// {
//   url: {port: 8000}
// }
// 原意是将url.port改成 8000，url.host不变。
// 实际结果却是options.url覆盖掉DEFAULTS.url，
// 所以url.host就不存在了。
```

### 3. \__proto__属性，Object.setPrototypeOf()，Object.getPrototypeOf() 

#### \__proto__属性

`__proto__`属性（前后各两个下划线），用来读取或设置当前对象的`prototype`对象。目前，所有浏览器（包括 IE11）都部署了这个属性。

```js
// es5 的写法
const obj = {
  method: function() { ... }
};
obj.__proto__ = someOtherObj;

// es6 的写法
var obj = Object.create(someOtherObj);
obj.method = function() { ... };
```

**该属性没有写入 ES6 的正文**，而是写入了附录，**原因是`__proto__`前后的双下划线**，说明它本质上是一个内部属性，而不是一个正式的对外的 API，只是由于浏览器广泛支持，才被加入了 ES6。**标准明确规定**，**只有浏览器必须部署这个属性**，**其他运行环境不一定需要部署**，而且新的代码最好认为这个属性是不存在的。 

因此，无论从语义的角度，还是从兼容性的角度，都不要使用这个属性，而是使用下面的**`Object.setPrototypeOf()`（写操作）**、**`Object.getPrototypeOf()`（读操作）**、**`Object.create()`（生成操作）**代替。 

#### Object.setPrototypeOf()

`Object.setPrototypeOf`方法的作用与`__proto__`相同，用来设置一个对象的`prototype`对象，返回参数对象本身。它是 ES6 正式推荐的设置原型对象的方法。

```js
// 格式
Object.setPrototypeOf(object, prototype)

// 用法
const o = Object.setPrototypeOf({}, null);

// 等同于下面的函数。

function setPrototypeOf(obj, proto) {
  obj.__proto__ = proto;
  return obj;
}
```

例子 :

```js
let proto = {};
let obj = { x: 10 };
Object.setPrototypeOf(obj, proto);

proto.y = 20;
proto.z = 40;

obj.x // 10
obj.y // 20
obj.z // 40
```

如果**第一个参数是`undefined`或`null`**，就会报错。

```js
Object.setPrototypeOf(undefined, {})
// TypeError: Object.setPrototypeOf called on null or undefined

Object.setPrototypeOf(null, {})
// TypeError: Object.setPrototypeOf called on null or undefined
```

####  Object.getPrototypeOf()

该方法与`Object.setPrototypeOf`方法配套，用于读取一个对象的原型对象。

```js
Object.getPrototypeOf(obj);
```

```js
function Rectangle() {
  // ...
}

const rec = new Rectangle();

Object.getPrototypeOf(rec) === Rectangle.prototype
// true

Object.setPrototypeOf(rec, Object.prototype);
Object.getPrototypeOf(rec) === Rectangle.prototype
// false
```

如果参数不是对象，会被自动转为对象。

```js
// 等同于 Object.getPrototypeOf(Number(1))
Object.getPrototypeOf(1)
// Number {[[PrimitiveValue]]: 0}

// 等同于 Object.getPrototypeOf(String('foo'))
Object.getPrototypeOf('foo')
// String {length: 0, [[PrimitiveValue]]: ""}

// 等同于 Object.getPrototypeOf(Boolean(true))
Object.getPrototypeOf(true)
// Boolean {[[PrimitiveValue]]: false}

Object.getPrototypeOf(1) === Number.prototype // true
Object.getPrototypeOf('foo') === String.prototype // true
Object.getPrototypeOf(true) === Boolean.prototype // true
```

如果参数是`undefined`或`null`，它们无法转为对象，所以会报错。

```js
Object.getPrototypeOf(null)
// TypeError: Cannot convert undefined or null to object

Object.getPrototypeOf(undefined)
// TypeError: Cannot convert undefined or null to object
```

### 4. Object.keys()，Object.values()，Object.entries()

#### **Object.keys()**

**ES5** 引入了**`Object.keys`方法**，**返回一个数组**，成员是参数对象**自身的（不含继承的）所有可遍历（enumerable）属性**的**键名**。

```js
var obj = { foo: 'bar', baz: 42 };
Object.keys(obj)
// ["foo", "baz"]
```

**ES2017** [引入](https://github.com/tc39/proposal-object-values-entries)了跟`Object.keys`配套的`Object.values`和`Object.entries`，作为遍历一个对象的补充手段，供`for...of`循环使用。 

#### **Object.values()**

`Object.values`方法返回一个数组，成员是参数对象自身的（不含继承的）所有可遍历（enumerable）属性的键值。

```
const obj = { foo: 'bar', baz: 42 };
Object.values(obj)
// ["bar", 42]
```

`Object.values`**只返回对象自身的可遍历属性**。

```js
const obj = Object.create({}, {p: {value: 42}});
Object.values(obj) // []

Object.create方法的`第二个参数`添加的对象属性`（属性p）`，
如果`不显式声明，默认是不可遍历的 `，属性描述对象的enumerable默认是false，Object.values不会返回这个属性。只要把enumerable改成`true`，Object.values就会返回属性p的值。
解决方法 :
const obj = Object.create({}, {p:
  {
    value: 42,
    enumerable: true
  }
});
Object.values(obj) // [42]
```

`Object.values`会**过滤属性名为 Symbol 值的属性**。

```js
Object.values({ [Symbol()]: 123, foo: 'abc' });
// ['abc']
```

如果`Object.values`方法的**参数是一个字符串**，会返回**各个字符组成的一个数组**。

```js
Object.values('foo')
// ['f', 'o', 'o']
```

如果参数不是对象，`Object.values`会先将其转为对象。由于**数值和布尔值的包装对象，都不会为实例添加非继承的属性**。所以，**`Object.values`会返回空数组**。

```js
Object.values(42) // []
Object.values(true) // []
```

#### **Object.entries()**

`Object.entries()`方法返回一个数组，成员是参数对象自身的（不含继承的）**所有可遍历（enumerable）属性的键值对数组**。

```js
const obj = { foo: 'bar', baz: 42 };
Object.entries(obj)
// [ ["foo", "bar"], ["baz", 42] ]
```

`Object.entries`的基本用途是遍历对象的属性。

```js
let obj = { one: 1, two: 2 };
for (let [key, value] of Object.entries(obj)) {
  console.log(
    `${JSON.stringify(key)}: ${JSON.stringify(value)}`
  );
}
// "one": 1
// "two": 2
```

`Object.entries`方法的另一个用处是，将对象转为真正的`Map`结构。

```js
const obj = { foo: 'bar', baz: 42 };
const map = new Map(Object.entries(obj));
map // Map { foo: "bar", baz: 42 }
```
## 5. Object.fromEntries()

`Object.fromEntries()`方法是`Object.entries()`的逆操作，用于**将一个键值对数组转为对象**。

```js
Object.fromEntries([
  ['foo', 'bar'],
  ['baz', 42]
])
// { foo: "bar", baz: 42 }
```

该方法的主要目的，是将键值对的数据结构还原为对象，因此特别适合将 Map 结构转为对象。

```js
// 例一
const entries = new Map([
  ['foo', 'bar'],
  ['baz', 42]
]);

Object.fromEntries(entries)
// { foo: "bar", baz: 42 }

// 例二
const map = new Map().set('foo', true).set('bar', false);
Object.fromEntries(map)
// { foo: true, bar: false }
```