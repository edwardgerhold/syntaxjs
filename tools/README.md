testerjs
========

Tester is a simple tool, which can test results of syntaxjs.

I am thinking about integrating it into the main program, because
it is a great tool together with syntaxjs, because one can test 
code evaluated with.

```javascript

var Test = require("./tester0.js").Test;

var test = new Test();
test.add(function () {
    var code = "typeof Symbol();";
    var result = syntaxjs.toValue(code);
    this.assert(result, "symbol", code);
});

test.add(function (test) {
    var code = "class C {}; typeof C;";
    var result = syntaxjs.toValue(code);
    test.assert(result, "function", code); // 3rd is the message
});

test.run();
// test.print()
test.html({ el: "#logging" });

```
* test.add(callback) - adds a function (test) to the list. The assertions are reachable via (test) or "this".

Functions inside a test Callback added with test.add 
They can be called via this or the first argument of the callback.

* this.assert(act, exp, message) - message is always printed
* this.throws(callback, message) - something in the function should throw
* throwsNot		- this one shouldnt throw to pass the test
* equals		- same like assert
* instanceOf		- i had instanceof?
* notEquals		- notEquals(act, exp, message)	
* deepEquals		- deepEquals does almost, what deepEquals in commonjs/unittest does

Tester creates a collection of records if running the tests.

```javascript
test.run();
```

They can be printed with

```javascript
test.print();	// console.log
```

```javascript
test.print({ el: ".valid_selector" }); // .innerHTML
````

More about and with testerjs will come with syntaxjs over time.
