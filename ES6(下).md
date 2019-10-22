# Promise

Promise实际上就是用来解决异步(回调地狱的问题的)

(⊙o⊙)…现实中使用的还是比较多的喔

------



## 基本用法

**ES6** 规定，**`Promise`对象**是一个**构造函数**，用来**生成`Promise`实例**。 

------

`Promise`构造函数**接受一个函数作为参数**，

该函数的两个参数分别是**`resolve`和`reject`**。

**`resolve`函数**的作用是，将`Promise`对象的状态从“未完成”变为“成功”（即从 pending 变为 resolved），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；

**`reject`函数**的作用是，将`Promise`对象的状态从“未完成”变为“失败”（即从 pending 变为 rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

**`Promise`实例生成以后**，可以**用`then`方法**分别**指定`resolved`状态和`rejected`状态的回调函数**。

```js
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});
promise.then(function(value) {
  // success
}, function(error) {
  // failure
});
```

**Promise 新建后就会立即执行**。

```js
let promise = new Promise(function(resolve, reject) {
  console.log('1');
  resolve();
});

promise.then(function() {
  console.log('2');
});

console.log('Hi!');

// 1
// Hi!
// 2
```

例子1.

```js
function timeout(ms) {
  return new Promise((resolve, reject) => {
    // resolve不用加括号 , setTimout帮你调用
    setTimeout(resolve, ms, 'done');
  });
}

timeout(100).then((value) => {
  console.log(value);
});
```

**异步加载图片的**例子。

```js
function loadImageAsync(url) {
  return new Promise(function(resolve, reject) {
    const image = new Image();

    image.onload = function() {
      resolve(image);
    };

    image.onerror = function() {
      reject(new Error('Could not load image at ' + url));
    };

    image.src = url;
  });
}
```

注意，**调用`resolve`或`reject`并不会终结 Promise 的参数函数的执行**。

因为立即 **resolved** 的 Promise 是在**本轮事件循环的末尾执行**，**总是晚于本轮循环的同步任务**。

一般来说，调用`resolve`或`reject`以后，Promise 的使命就完成了，后继操作应该放到`then`方法里面，而不应该直接写在`resolve`或`reject`的后面。**所以，最好在它们前面加上`return`语句，这样就不会有意外**。

```js
new Promise((resolve, reject) => {
  resolve(1);
  console.log(2);
}).then(r => {
  console.log(r);
});
// 2
// 1

new Promise((resolve, reject) => {
  return resolve(1);
  // 后面的语句不会执行
  console.log(2);
})
```
------



## Promise.prototype.then

Promise 实例具有`then`方法 ( 定义在原型对象  **Promise.prototype** )上。 

**`then`方法返回**的是一个**新的`Promise`实例**（注意，不是原来那个`Promise`实例）。因此**可以采用链式写法**，即`then`方法后面再调用另一个`then`方法。

```js
getJSON("/posts.json").then(function(json) {
  return json.post;
}).then(function(post) {
  // ...
});
```



------

## Promise.prototype.catch()

`Promise.prototype.catch`方法是`.then(null, rejection)`或`.then(undefined, rejection)`的别名，用于指定发生错误时的回调函数。 

```js
getJSON('/posts.json').then(function(posts) {
  // ...
}).catch(function(error) {
  // 处理 getJSON 和 前一个回调函数运行时发生的错误
  console.log('发生错误！', error);
});
```

`promise`抛出一个错误，就被`catch`方法指定的回调函数捕获。 

```js
// 写法一
const promise = new Promise(function(resolve, reject) {
  try {
    throw new Error('test');
  } catch(e) {
    reject(e);
  }
});
promise.catch(function(error) {
  console.log(error);
});

// 写法二
const promise = new Promise(function(resolve, reject) {
    // reject方法的作用，等同于抛出错误。
  reject(new Error('test'));
});
promise.catch(function(error) {
  console.log(error);
});
```

如果 **Promise 状态已经变成`resolved`**，**再抛出错误是无效的**。

```js
const promise = new Promise(function(resolve, reject) {
  resolve('ok');
  throw new Error('test');
});
promise
  .then(function(value) { console.log(value) })
  .catch(function(error) { console.log(error) });
// ok
```

Promise **对象的错误具有“冒泡”性质**，**会一直向后传递**，直到被捕获为止。也就是说，**错误总是会被下一个`catch`语句捕获**。

所以一般只要有一个.catch()即可

```js
getJSON('/post/1.json').then(function(post) {
  return getJSON(post.commentURL);
}).then(function(comments) {
  // some code
}).catch(function(error) {
  // 处理前面三个Promise产生的错误
});
```

一般来说，**不要在`then`方法里面定义 Reject 状态的回调函数**（即`then`的第二个参数），应该总是**使用`catch`方法**。

```js
// bad 差
promise
  .then(function(data) {
    // success
  }, function(err) {
    // error
  });

// good  好
promise
  .then(function(data) { //cb
    // success
  })
  .catch(function(err) {
    // error
  });
```

“**Promise 会吃掉错误**”。 

跟传统的`try/catch`代码块不同的是，如果没有使用`catch`方法指定错误处理的回调函数，Promise 对象抛出的错误不会传递到外层代码，即不会有任何反应。 

```js 
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2);
  });
};

someAsyncThing().then(function() {
  console.log('everything is great');
});
// 下面延时器代码仍然能执行

setTimeout(() => { console.log(123) }, 2000);
// Uncaught (in promise) ReferenceError: x is not defined
// 123  

// 解析: 
someAsyncThing函数产生的 Promise 对象，内部有语法错误。浏览器运行到这一行，会打印出错误提示ReferenceError: x is not defined，但是不会退出进程、终止脚本执行，2 秒之后还是会输出123。

这个脚本放在`服务器`执行，`退出码就是0（即表示执行成功）`。不过，`Node `有一个unhandledRejection事件，专门监听未捕获的reject错误，上面的脚本会触发这个事件的监听函数，可以在监听函数里面抛出错误。

process.on('unhandledRejection', function (err, p) {
  throw err;
});

unhandledRejection事件的监听函数有两个参数，第一个是错误对象，第二个是报错的 Promise 实例，它可以用来了解发生错误的环境信息。

注意，Node 有计划在未来`废除unhandledRejection事件`。如果 Promise 内部有未捕获的错误，会直接终止进程，并且进程的退出码不为 0。
```

**`catch`方法返回的还是一个 Promise 对象**，因此后面**还可以接着调用`then`方法**。

要是后面的`then`方法里面报错，就与前面的`catch`无关了。 

```js
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2);
  });
};

someAsyncThing()
.catch(function(error) {
  console.log('oh no', error);
})
.then(function() {
  console.log('carry on');
});
// oh no [ReferenceError: x is not defined]
// carry on
```

**`catch`方法之中，还能再抛出错误**。 

第二个`catch`方法用来捕获前一个`catch`方法抛出的错误。 

```js
// 第二个catch方法用来捕获前一个catch方法抛出的错误。

const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2);
  });
};

someAsyncThing().then(function() {
  return someOtherAsyncThing();
}).catch(function(error) {
  console.log('oh no', error);
  // 下面一行会报错，因为y没有声明
  y + 2;
}).catch(function(error) {
  console.log('carry on', error);
});
// oh no [ReferenceError: x is not defined]
// carry on [ReferenceError: y is not defined]
```

------

## Promise.prototype.finally()

**`finally`方法的回调函数不接受任何参数**，没有办法知道前面的 Promise 状态到底是`fulfilled`还是`rejected`。所以，`finally`方法里面的操作，应该是与状态无关的，不依赖于 Promise 的执行结果。 

`finally`方法用于指定**不管 Promise 对象最后状态如何，都会执行的操作**。该方法是 **ES2018** 引入标准的。 

不管`promise`最后的状态，**在执行完`then`或`catch`指定的回调函数**以后，**都会执行`finally`方法指定的回调函数** 

```js
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

**例子**1.

服务器使用 Promise 处理请求，然后使用`finally`方法关掉服务器。

```js
server.listen(port)
  .then(function () {
    // ...
  })
  .finally(server.stop);
```

------

# async 函数

含义

ES2017 标准引入了 async 函数，使得异步操作变得更加方便。

**async 函数**是什么？一句话，它**就是 Generator 函数的语法糖**。

------



```js
const fs = require('fs');

const readFile = function (fileName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, function(error, data) {
      if (error) return reject(error);
      resolve(data);
    });
  });
};

const gen = function* () {
  const f1 = yield readFile('/etc/fstab');
  const f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};

// 上面代码的函数gen可以写成async函数，就是下面这样。

const asyncReadFile = async function () {
  const f1 = await readFile('/etc/fstab');
  const f2 = await readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

------

`async`函数就是将 Generator 函数的星号**（`*`）替换成`async`**，将**`yield`替换成`await`**，仅此而已。 

```js
function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function asyncPrint(value, ms) {
  await timeout(ms);
  console.log(value);
}

asyncPrint('hello world', 50);
// 上面代码指定 50 毫秒以后，输出hello world。

由于`async函数返回的是 Promise 对象`，可以作为await命令的参数。所以，`上面的例子也可以写成下面的形式`。

async function timeout(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function asyncPrint(value, ms) {
  await timeout(ms);
  console.log(value);
}

asyncPrint('hello world', 50);
```

------

**async 函数有多种使用形式**。

```js
// 函数声明
async function foo() {}

// 函数表达式
const foo = async function () {};

// 对象的方法
let obj = { async foo() {} };
obj.foo().then(...)

// Class 的方法
class Storage {
  constructor() {
    this.cachePromise = caches.open('avatars');
  }

  async getAvatar(name) {
    const cache = await this.cachePromise;
    return cache.match(`/avatars/${name}.jpg`);
  }
}

const storage = new Storage();
storage.getAvatar('jake').then(…);

// 箭头函数
const foo = async () => {};
```
------

async 函数的优点

async 函数对 Generator 函数的改进，体现在以下*三点*。 

**（1）内置执行器。**
 Generator 函数的执行必须靠执行器，所以才有了 co 函数库，

 async 函数自带执行器。也就是说，async 函数的执行，与普通函数一模一样，只要一行。

> ```js
> var result = asyncReadFile();
> ```

**（2）更好的语义。** *async* 和 *await*，比起*星号*和 *yield*，语义更清楚了。async 表示函数里有异步操作，await 表示紧跟在后面的表达式需要等待结果。

**（3）更广的适用性。**

 co 函数库约定 : 

yield 命令后面*只能*是 Thunk 函数或 Promise 对象，

而 async 函数的 await 命令后面，可以跟 Promise 对象和原始类型的值（数值、字符串和布尔值，但这时等同于同步操作）。

**（4）返回值是 Promise**。

`async`函数的返回值是 Promise 对象，这比 Generator 函数的返回值是 Iterator 对象方便多了。你**可以用`then`方法指定下一步的操作**。

进一步说，`async`函数完全可以看作多个异步操作，包装成的一个 Promise 对象，而`await`命令就是内部`then`命令的语法糖。

------

# Thunk 函数

编译器的"*传名调用*"实现，往往是将*参数放到一个临时函数*之中，再将*这个临时函数传入函数体*。这个临时函数就叫做 **Thunk 函数**。 

**即函数的参数到底应该何时求值** ?

一种意见是 "*传值调用*" （call by value），*即在进入函数体之前*，*就计算* x + 5 的值（等于6），*再将这个值传入函数 f* 。C语言就采用这种策略。 

另一种意见是 "*传名调用*"（call by name），即直接将表达式 x + 5 传入函数体，*只在用到它的时候求值*。Hskell语言采用这种策略。 

## *传值调用*

```js
 var x = 1;
 function f(m){ return m * 2; } 
 f(x + 5) 

f(x + 5)
// 传值调用时，等同于
f(6) 
```

## *传名调用*

```js
	// function f(m){ return m * 2; } 
	// 等同于
	let thunk = function (x) { return x + 5; }; 
	function f(x){ return thunk(x) * 2; } 
	
	let num = f(1); 
	// 结果 12
```

------



# Generator 函数的语法

## 基本概念

Generator 函数是 *ES6* 提供的一种异步编程解决方案，语法行为与传统函数完全不同 

*形式上*，Generator 函数是一个普通函数，但是有两个特征。

**一是**，`function`关键字与函数名之间*有一个星号*；

**二是**，函数体内部使用*`yield`表达式*，定义不同的内部状态（`yield`在英语里的意思就是“*产出*”） 

执行 Generator 函数会*返回一个遍历器对象*，也就是说，Generator 函数除了状态机，还是一个遍历器对象生成函数。返回的遍历器对象，可以依次遍历 Generator 函数内部的每一个状态。 

*例子* : 

```js
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

var hw = helloWorldGenerator();

Generator 函数`helloWorldGenerator`，
它内部有两个yield表达式（hello和world），
即该函数有三个状态：hello，world 和 return 语句（结束执行）。

`Generator 函数的调用方法与普通函数一样`，也是在函数名后面加上一对圆括号。
不同的是，调用 Generator 函数后，`该函数并不执行`，返回的也不是函数运行结果，而是一个指向内部状态的指针对象，也就是上一章介绍的遍历器对象（Iterator Object）。

`下一步`，必须调用`遍历器对象的next`方法，使得指针移向下一个状态。
每次调用next方法，内部指针就从`函数头部`或`上一次停下来的地方`开始执行，
直到遇到下一个yield表达式（或return语句）为止。
换言之，Generator 函数是分段执行的，`yield表达式是暂停执行的标记`，`而next方法可以恢复执行`。 

hw.next()
// { value: 'hello', done: false }
hw.next()
// { value: 'world', done: false }
hw.next()
// { value: 'ending', done: true }
hw.next()
// { value: undefined, done: true }

一共调用了四次next方法

`第一次调用`，Generator 函数开始执行，直到遇到第一个yield表达式为止。
next方法返回一个对象，它的`value属性就是当前yield表达式的值hello`，`done属性的值false`，`表示遍历还没有结束`。

`第二次调用`，Generator 函数从上次yield表达式停下的地方，一直执行到下一个yield表达式。
next方法返回的对象的value属性就是`当前yield表达式的值world`，`done属性的值false`，`表示遍历还没有结束`。

`第三次调用`  从上次yield表达式停下的地方，一直执行到return语句（`如果没有return语句，就执行到函数结束`）。
next方法返回的对象的value属性，`就是紧跟在return语句后面的表达式的值`（`如果没有return语句，则value属性的值为undefined`），`done属性的值true`，`表示遍历已经结束`。

`第四次调用`，此时 Generator 函数已经运行完毕，next方法返回对象的value属性为undefined，`done属性为true`。
`以后再调用next方法，返回的都是这个值`
```

------

**ES6 没有规定**，`function`关键字与函数名之间的星号的位置。这导致*下面的写法都能通过*。

```js
function * foo(x, y) { ··· }
function *foo(x, y) { ··· }
function* foo(x, y) { ··· } // 推荐使用这种
function*foo(x, y) { ··· }
```

由于 Generator 函数仍然是普通函数，所以一般的写法是上面的第三种，即星号紧跟在`function`关键字后面。

------



## yield 表达式

Generator 函数返回的遍历器对象，只有*调用`next`方法*才会*遍历下一个内部状态*，

所以其实提供了一种*可以暂停执行的函数*。*`yield`表达式就是暂停标志*。 

------

**遍历器对象的`next`方法的运行逻辑如下** ---- ↓

*（1）遇到`yield`表达式*，就*暂停执行后面的操作*，并*将紧跟在`yield`后面的那个表达式的**值***，*作为返回的对象的`value`属性值*。

*（2）*下一次调用`next`方法时，再继续往下执行，直到遇到下一个`yield`表达式。

*（3）*如果没有再*遇到新的`yield`表达式*，*就一直运行到函数结束*，*直到`return`语句*为止，*并将`return`语句后面的表达式的**值**，作为返回的对象的`value`属性值*。

*（4）*如果该函数*没有`return`语句*，则返回的*对象的`value`属性值*为 **undefined** 

需要注意的是 : `yield`表达式后面的表达式，只有当调用`next`方法、内部指针指向该语句时才会执行(*惰性求值*)

------

Generator 函数*可以不用`yield`表达式*，这时就变成了一个*单纯的暂缓执行函数*。

```js
function* f() {
  console.log('执行了！') 
}

var generator = f(); // 不会执行打印

// 只有调用next方法时，函数f才会执行
generator.next()
// 打印了!
```

------

*`yield`表达式*只能用在 **Generator 函数里面**，*用在其他地方都会报错*。

例子1.

```js
(function (){
  yield 1;
})()
// SyntaxError: Unexpected number
```

例子2.

```js
var arr = [1, [[2, 3], 4], [5, 6]];

var flat = function* (a) {
  a.forEach(function (item) {
    if (typeof item !== 'number') {
      yield* flat(item);
    } else {
      yield item;
    }
  });
};

for (var f of flat(arr)){
  console.log(f);
}
```

因为*`forEach`方法*的*参数*是**一个普通函数**，*但是在里面使用了`yield`表达式*  , **报错 !**

一种**修改方法**是*改用`for`循环*。

```js
var arr = [1, [[2, 3], 4], [5, 6]];

var flat = function* (a) {
  var length = a.length;
  for (var i = 0; i < length; i++) {
    var item = a[i];
    if (typeof item !== 'number') {
      yield* flat(item);
    } else {
      yield item;
    }
  }
};

for (var f of flat(arr)) {
  console.log(f);
}
// 1, 2, 3, 4, 5, 6
```

------

另外，`yield`表达式如果*用在另一个表达式*之中，必须*放在圆括号里面*。

```js
function* demo() {
  console.log('Hello' + yield); // SyntaxError
  console.log('Hello' + yield 123); // SyntaxErrorjs

  console.log('Hello' + (yield)); // OK
  console.log('Hello' + (yield 123)); // OK
}
```

------

`yield`表达式用作*函数参数*或放在**赋值表达式的右边**，*可以不加括号*。

```js
function* demo() {
  foo(yield 'a', yield 'b'); // OK 函数参数
  let input = yield; // OK 赋值表达式的右边
}
```
# Class

## Class 的基本语法

### 类的由来

JavaScript 语言中，*生成实例对象的传统方法是通过构造函数*。下面是一个例子。

```js
function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.toString = function () {
  return '(' + this.x + ', ' + this.y + ')';
};

var p = new Point(1, 2);

//  ES6 的class改写 : 
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }
}
```

这种写法跟传统的*面向对象语言（比如 C++ 和 Java）*差异很大 

**ES6** 提供了更接近传统语言的写法，引入了 *Class（类）*这个概念，作为对象的模板。

*通过`class`关键字，可以定义类*。 

**ES6** 的`class`可以看作只是一个语法糖，

它的*绝大部分功能，ES5 都可以做到*，

新的`class`写法只是让对象原型的写法更加清晰、更像面向对象编程的语法而已 

------

定义“类”的方法的时候，*前面不需要加上`function`这个关键字*，直接把函数定义放进去了就可以了。

另外，*方法之间不需要逗号分隔，加了会报错*。 

------

**类** *必须*使**用`new`调用**，*否则会报错*。这是它跟普通构造函数 (*不用`new`也可以执行*) 的一个主要区别

```js
class Foo {
  constructor() {
    return Object.create(null);
  }
}

Foo()
// TypeError: Class constructor Foo cannot be invoked without 'new'
```

------

构造函数的`prototype`属性，在 ES6 的“类”上面继续存在。

事实上，**类的所有方法**都*定义在类的`prototype`属性上面*。

```js
class Point {
  constructor() {
    // ...
  }
  toString() {
    // ...
  }
  toValue() {
    // ...
  }
}

// 等同于

Point.prototype = {
  constructor() {},
  toString() {},
  toValue() {},
};
```

------

在类的实例上面调用方法，其实就是调用原型上的方法。

```js
class B {}
let b = new B();

b.constructor === B.prototype.constructor // true
```

------

由于*类的方法都定义在`prototype`对象*上面，所以类的新方法可以添加在`prototype`对象上面。*`Object.assign`方法*可以很方便地**一次向类添加多个方法**。

```js
class Point {
  constructor(){
    // ...
  }
}

Object.assign(Point.prototype, { // 往Point的原型对象上添加多个方法
  toString(){},
  toValue(){}
});
```

------

`prototype`对象的`constructor`属性，直接指向“类”的本身，这与 ES5 的行为是一致的。

```js
Point.prototype.constructor === Point // true
```

------

类的**内部** *所有定义的方法*，都是*不可枚举的*（non-enumerable）。

```js
class Point {
  constructor(x, y) {
    // ...
  }

  toString() {
    // ...
  }
}

Object.keys(Point.prototype)
// []  不可枚举所以无值
Object.getOwnPropertyNames(Point.prototype)
// ["constructor","toString"]
```

ES5 的行为。 下面代码采用 ES5 的写法，`toString`方法就是可枚举的。

```js
var Point = function (x, y) {
  // ...
};

Point.prototype.toString = function() {
  // ...
};

Object.keys(Point.prototype)
// ["toString"]
Object.getOwnPropertyNames(Point.prototype)
// ["constructor","toString"]
```

------



### constructor

`constructor`方法是类的*默认方法*，通过`new`命令生成对象实例时，*自动调用该方法*。

一个类*必须有`constructor`方法*，如果**没有显式定义**，一个*空*的`constructor`方法会被**默认添加**

```js
class Point {
}

// 等同于
class Point {
  constructor() {}
}
```

`constructor`方法*默认返回实例对象*（**即`this`**） 

也可以*指定*返回**另外一个对象** 

```js
class Foo {
  constructor() {
    return Object.create(null);
  }
}

new Foo() instanceof Foo
// instanceof 判断xxx实例是不是xx构造出来的
// false
```

------

### 类的实例

生成类的实例的写法，与 ES5 完全一样，*也是使用`new`命令*。

```js
class Point {
  // ...
}

// 报错
var point = Point(2, 3);

// 正确
var point = new Point(2, 3);
```

 

------

与 ES5 一样，实例的属性*除非显式定义在其本身*（**即定义在`this`对象上**），

否则都是定义在*原型*上（即定义在`class`上）。

```js
//定义类
class Point {

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }

}

var point = new Point(2, 3);

point.toString() // (2, 3)

point.hasOwnProperty('x') // true
point.hasOwnProperty('y') // true

point.hasOwnProperty('toString') // false
point.__proto__.hasOwnProperty('toString') // true
```

------

*与 ES5 一样*，类的所有**实例共享一个原型对象**。

```js
var p1 = new Point(2,3);
var p2 = new Point(3,2);

p1.__proto__ === p2.__proto__
//true
```

这也意味着，可以通过实例的`__proto__`属性(*不建议使用这个方法*)为“类”添加方法 

```js
var p1 = new Point(2,3);
var p2 = new Point(3,2);

p1.__proto__.printName = function () { return 'Oops' };

p1.printName() // "Oops"
p2.printName() // "Oops"

var p3 = new Point(4,2);
p3.printName() // "Oops"

`使用实例的__proto__属性改写原型，必须相当谨慎，不推荐使用`，
// 可以使用 Object.getPrototypeOf 方法来获取实例对象的原型，
// 然后再来为原型添加方法/属性。 
```

------



### 取值函数（getter）和存值函数（setter）

与 ES5 一样，在“*类”*的内部**可以使用`get`和`set`关键字**，

对某个属性*设置存值函数和取值函数*，**拦截该属性**的*存取行为*。 

```js
class MyClass {
  constructor() {
    // ...
  }
  get prop() {
    return 'getter';
  }
  set prop(value) {
    console.log('setter: '+value);
  }
}

let inst = new MyClass();

inst.prop = 123;
// setter: 123

inst.prop
// 'getter'
```

------

### *属性表*达式

**类的属性名，可以采用表达式**。 

下面代码中，`Square`类的方法名`getArea`，是*从表达式*得到的。

```js
let methodName = 'getArea';

class Square {
  constructor(length) {
    // ...
  }

  [methodName]() {
    // ...
  }
}
```

------

### **Class** 表达式

与函数一样，类也可以使用表达式的形式定义。

```js
const MyClass = class Me {
    // 只有这个函数内部才能使用访问Me
  getClassName() {
    return Me.name; // 返回me的名字 :　ｍｅ
  }
};

这个类的名字是Me，但是Me只在 Class 的内部可用，指代当前类。
在 Class 外部，这个类只能用MyClass引用 ↓

let inst = new MyClass();
inst.getClassName() // Me
Me.name // ReferenceError: Me is not defined

如果类的内部没用到的话，可以`省略Me`，也就是可以写成下面的形式。
// 相当于匿名
const MyClass = class { ．．． };
```

------

采用 Class 表达式，*可以写出立即执行的 Class*。

```js
// person是一个立即执行的类的实例。

let person = new class {
  constructor(name) {
    this.name = name;
  }

  sayName() {
    console.log(this.name);
  }
}('张三');

person.sayName(); // "张三"
```

### 注意点

#### **（1）严格模式**

*类和模块的内部*，**默认**就是*严格模式*，所以**不需要使用`use strict`指定运行模式**。

只要你的*代码*写**在类**或**模块**之中，*就只有严格模式可用*。

考虑到未来所有的代码，其实都是运行在模块之中，所以 ES6 实际上把整个语言升级到了严格模式。

------



#### **（2）不存在提升**

*类不存在变量提升*（hoist），这一点与 ES5 完全不同。

```js
new Foo(); // ReferenceError 报错
class Foo {}
```

------



#### **（3）name 属性**

由于本质上，ES6 的类只是 ES5 的构造函数的一层包装，所以函数的许多特性都被`Class`继承，包括`name`属性。

```js
class Point {}
Point.name // "Point"
```

`name`属性总是返回紧跟在`class`关键字后面的类名。

------

#### **（4）Generator 方法**

如果某个方法之前加上星号（`*`），就表示该方法是一个 Generator 函数。

```js
class Foo {
  constructor(...args) {
    this.args = args;
  }
  * [Symbol.iterator]() {
    for (let arg of this.args) {
      yield arg;
    }
  }
}

for (let x of new Foo('hello', 'world')) {
  console.log(x);
}
// hello
// world
```

上面代码中，`Foo`类的`Symbol.iterator`方法前有一个星号，表示该方法是一个 Generator 函数。`Symbol.iterator`方法返回一个`Foo`类的默认遍历器，`for...of`循环会自动调用这个遍历器。

------

#### **（5）this 的指向**

类的方法内部如果含有`this`，它默认指向类的实例。但是，必须非常小心，一旦单独使用该方法，很可能报错。

```js
class Logger {
  printName(name = 'there') {
    this.print(`Hello ${name}`);
  }

  print(text) {
    console.log(text);
  }
}

const logger = new Logger();

// 将这个方法提取出来单独使用
const { printName } = logger;
printName(); // TypeError: Cannot read property 'print' of undefined

// 将这个方法提取出来单独使用 ,
// this会指向该方法运行时所在的环境
// （由于 class 内部是严格模式，所以 this 实际指向的是undefined）
// 从而导致找不到print方法而报错。
```

一个比较简单的解决方法是，在构造方法中绑定`this`，这样就不会找不到`print`方法了。

```js
class Logger {
  constructor() {
    this.printName = this.printName.bind(this);
  }

  // ...
}
```

另一种解决方法是使用箭头函数。(*箭头函数this*的是**定义时**所在的*this*)

```js
class Logger {
  constructor() {
    this.printName = (name = 'there') => {
      this.print(`Hello ${name}`);
    };
  }

  // ...
}
```

------



### *静态方法*

*类*相当于实例的原型，*所有在类中定义的方法，都会被实例继承*。

**“静态方法”**  是什么 ? *↓*

在一个方法前，*加上`static`关键字*，就**表示该方法不会被实例继承**，而已*直接通过类*来**调用**

静态方法的 **this** , 指的是 *类* , 而不是实例对象

------

```js
class Foo {
  static classMethod() {
    return 'hello';
  }
}

// 构造函数本身有这个方法
Foo.classMethod() // 'hello'

var foo = new Foo();
foo.classMethod()
// 它的实例对象上没有这个方法
// 报错
// TypeError: foo.classMethod is not a function
```

------

*如果静态方法包含`this`关键字，这个`this`指的是类，而不是实例*。

```js
class Foo {
  static bar() {
    // this是值Foo  同于调用Foo.baz
    this.baz();
  }
  static baz() {
     // 执行了这个方法
    console.log('hello');
  }
  baz() { // 静态方法可以与`非静态`方法重名。
    console.log('world');
  }
}

Foo.bar() // hello
```

------

**父类的静态方法，可以被子类继承**。

```js
class Foo {
  static classMethod() {
    return 'hello';
  }
}

class Bar extends Foo {
}

Bar.classMethod() // 'hello'
```

静态方法也是*可以从`super`对象*上**调用(父类的)**的。

```js
class Foo {
  static classMethod() {
    return 'hello';
  }
}

class Bar extends Foo {
  static classMethod() {
      // super 调用父类的静态方法
    return super.classMethod() + ', too';
  }
}

Bar.classMethod() // "hello, too"
```

------



### **静态属性**

静态属性指的是 Class 本身的属性，即`Class.propName`，而不是定义在实例对象（`this`）上的属性。

------

实例 :

*方法1.*

```js
class Foo {
}

Foo.prop = 1;
Foo.prop // 1
```

*方法2.* (**试验不成功**,可能浏览器版本原因)

*ES6 明确规定*，Class **内部** *只有静态方法*，**没有静态属性**。

现在有一个[提案](https://github.com/tc39/proposal-class-fields)提供了类的静态属性，*写法是在实例属性法的前面*，**加上`static`关键字**。 

```js
class Foo {
  static prop = 42;
}
```

*总结对比*

```js
// 老写法
class Foo {
  // ...
}
Foo.prop = 1;

// 新写法
class Foo {
  static prop = 1;
}
```

## Class 的 *继承*   **详谈**

### 1. 简介

Class *可以通过`extends`关键字实现继承*

这比 ES5 的通过修改原型链实现继承，要清晰和方便很多。 

------

```js
class Point {
    ...
}


class ColorPoint extends Point {
  constructor(x, y, color) {
    super(x, y); // 调用父类的constructor(x, y)
    this.color = color;
  }

  toString() {
    return this.color + ' ' + super.toString(); // 调用父类的toString()
  }
}
```

------

子类*必须在`constructor`方法中调用`super`方法*，否则新建实例时会报错。 

因为子类自己的`this`对象，

必须先通过父类的构造函数完成塑造，

*得到与父类同样的实例属性和方法*，**然后再对其进行加工**，

加上子类自己的实例属性和方法。



*如果不调用`super`方法，子类就得不到`this`对象*。 

```js
class Point { /* ... */ }

class ColorPoint extends Point {
  constructor() {
  }
}

let cp = new ColorPoint(); // ReferenceError
```

**ES5** 的继承，实质是*先创造子类的实例对象`this`*，然后**再将父类的方法添加到`this`上面**（ **Parent.apply(this)** ）。

**ES6** 的继承机制完全不同，实质是*先将父类实例对象的属性和方法*，**加到`this`上面**（*所以必须先调用`super`方法*），然*后再用子类的构造函数修改`this`*。 

------

如果子类**没有定义`constructor`方法**，这个方法*会被默认添加*，

也就是说，**不管有没有显式定义，任何一个子类*都有`constructor`方法***。

```js
class ColorPoint extends Point {
}

// 等同于
class ColorPoint extends Point {
  constructor(...args) {
    super(...args);
  }
}
```

------

**注意**，在*子类*的构造函数**中**，*只有调用`super`之后*，**才可以使用`this`关键字**，*否则*会*报错*。

这是因为*子类实例的构建，基于父类实例*，只有`super`方法才能调用父类实例。 

```js
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class ColorPoint extends Point {
  constructor(x, y, color) {
    this.color = color; // ReferenceError
    super(x, y);
    this.color = color; // 正确
  }
}

----------
let cp = new ColorPoint(25, 8, 'green');

// 实例对象cp同时是ColorPoint和Point两个类的实例 
// 这与 ES5 的行为完全一致。
cp instanceof ColorPoint // true
cp instanceof Point // true
```

------

**父类的静态方法，也会被子类继承**。

```js
class A {
  static hello() {
    console.log('hello world');
  }
}

class B extends A {
}

B.hello()  // hello world
```

### 2. Object.getPrototypeOf()

`Object.getPrototypeOf`方法可以用来从子类上获取父类。

```js
class Point { /* ... */ }

class ColorPoint extends Point {
  constructor() {
		super()
  }
}

let cp = new ColorPoint(); 

Object.getPrototypeOf(ColorPoint) 
// class Point { /* ... */ }
Object.getPrototypeOf(ColorPoint)  === Point
// true
```

### 3. *super* 关键字

`super`关键字，既可以*当作函数使用*，也可以**当作对象使用**。

在这两种情况下，它的用法完全不同 



第一种情况，`super`作为函数调用时，代表父类的构造函数。

ES6 要求，子类的构造函数**必须执行一次`super`函数** !

```js
class A {}

class B extends A {
  constructor() {
    // super()在这里相当于A.prototype.constructor.call(this)
    super();
  }
}
```

**作为函数时**，`super()`只能用在子类的构造函数之中，用在其他地方就会报错。

*作为对象时* , **可以在其他地方使用**

```js
class A {}

class B extends A {
 constructor(){
     ...
  }
  m() {
      // 不在子类的constructor里调用
    super(); // 报错
  }
}
```

------

第二种情况，*`super`作为对象*时，在**普通方法**中，指向父类的**原型对象**；

而定义在*父类实例上的方法*或**属性**，是*无法通过`super`调用*的 

```js
class A {
  constructor() {
    this.p = 2;
  }
}

class B extends A {
  get m() {
      // 找不到super.p 
      // p是定义在A自己身上的,而super找的是A的原型对象上的p
    return super.p;
  }
}

let b = new B();
b.m // undefined

如果属性定义在`父类的原型对象上`，super就可以取到。

class A {}
// 定义在了原型对象上
A.prototype.x = 2;

class B extends A {
  constructor() {
    super();
      // 可以找到
    console.log(super.x) // 2
  }
}

let b = new B();
```

在**静态方法**中，*指向父类*。 

```js
class A {
  p() {
    return 2;
  }
}

class B extends A {
  constructor() {
    super();
    console.log(super.p()); // 2
      // 这时，super在普通方法之中，指向 A.prototype
      // 相当于A.prototype.p()
  }
}
```

 

------

**ES6 规定**，

在子类**普通方法中通过`super`调用父类**的*方法时*，

*方法内部的`this`指向当前的子类实例*。

```js
class A {
  constructor() {
    this.x = 1;
  }
  print() {
    console.log(this.x);
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
  }
  m() {
    super.print();
    // 实际上是指向  super.print.call(this)
  }
}

let b = new B();
// 调用了父类的print方法 , 但是当前的this已经是指向b实例 ,所以打印2
b.m() // 2
```

*由于`this`指向子类实例*，所以**如果通过`super`对某个属性赋值**，赋值的属性会*变成子类**实例**的属性*。

```js
class A {
  constructor() {
    this.x = 1;
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
      // 对super进行赋值 , 变成了子类(b)实例的属性
    super.x = 3;
    console.log(super.x); // undefined
    console.log(this.x); // 3
  }
}

let b = new B();
```

------

如果`super`作为对象，用在*静态方法之中*，**这时`super`将指向父类**，而不是父类的原型对象。

```js
class Parent {
    // 静态方法属于Parent本身的方法
  static myMethod(msg) {
    console.log('static', msg);
  }
    
 // 所有在class定义的属性和方法都是定义在prototype上的
  myMethod(msg) {
    console.log('instance', msg);
  }
}

class Child extends Parent {
  static myMethod(msg) {
      // 静态方法调用super时 , super指的是父类本身
    super.myMethod(msg);
  }
  
    // 普通方案调用super时, super指的是父类的prototype
  myMethod(msg) {
    super.myMethod(msg);
  }
}

Child.myMethod(1); // static 1

var child = new Child();
child.myMethod(2); // instance 2
```

------

在*子类的静态方法*中通过`super`调用父类的方法时，

*方法内部的`this`指向当前的子类*，而**不是指向子类的实例**。

```js
class A {
  constructor() {
    this.x = 1;
  }
  static print() {
    console.log(this.x);
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
  }
  static m() {
      // this指向 B , 而不是 b 的实例
    super.print();
  }
}

B.x = 3;
B.m() // 3
```

------

注意，*使用`super`的时候*，必须**显式**指定是**作为函数**、**还是作为对象**使用，**否则报错**。

```js
class A {}

class B extends A {
  constructor() {
    super();
      // 没有显式的指定是 作为函数 还是 作为对象 使用
    console.log(super); // 报错
  }
}
```

### 4. 类的 prototype 属性和__proto__属性

大多数浏览器的 ES5 实现之中，每一个对象都有`__proto__`属性，指向对应的构造函数的`prototype`属性。

Class 作为构造函数的语法糖，同时有`prototype`属性和`__proto__`属性，因此同时存在两条继承链 

**（1）**子类的`__proto__`属性，表示构造函数的继承，总是指向父类。

**（2）**子类`prototype`属性的`__proto__`属性，表示方法的继承，总是指向父类的`prototype`属性。

```js
class A {
}

class B extends A {
}

B.__proto__ === A // true
B.prototype.__proto__ === A.prototype // true
```

------

*extends* 关键字**后面 ** *可以跟多种类型的值*。

```js
class B extends A {
}
```

上面代码的`A`，只要是一个有`prototype`属性的函数，就能被`B`继承。

由于函数都有`prototype`属性（除了`Function.prototype`函数），因此`A`可以是任意函数。



下面，讨论两种情况。

**第一种，子类继承`Object`类**。

```js
class A extends Object {
}

A.__proto__ === Object // true
A.prototype.__proto__ === Object.prototype // true
```

这种情况下，`A`其实就是构造函数`Object`的复制，`A`的实例就是`Object`的实例。

**第二种情况，不存在任何继承**。

```js
class A {
}

A.__proto__ === Function.prototype // true
A.prototype.__proto__ === Object.prototype // true
```

这种情况下，`A`作为一个基类（即不存在任何继承），就是一个普通函数，所以直接继承`Function.prototype`。但是，`A`调用后返回一个空对象（即`Object`实例），所以`A.prototype.__proto__`指向构造函数（`Object`）的`prototype`属性。

------

### 5. 实例的 __proto__ 属性

子类实例的`__proto__`属性的`__proto__`属性，指向父类实例的`__proto__`属性。

也就是说，*子类的原型的原型*，**是父类的原型**。

```js
var p1 = new Point(2, 3);
var p2 = new ColorPoint(2, 3, 'red');

p2.__proto__ === p1.__proto__ // false
p2.__proto__.__proto__ === p1.__proto__ // true


// 通过子类实例的__proto__.__proto__属性，可以修改父类实例的行为
p2.__proto__.__proto__.printName = function () {
  console.log('Ha');
};

p1.printName() // "Ha"
```