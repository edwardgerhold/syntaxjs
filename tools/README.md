tester.js
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
test.html({ el: ".valid_selector" }); // .innerHTML
````

More about and with testerjs will come with syntaxjs over time.


promise.js
=========

This fails 65 and succeeds in 133 tests or around 1/3 in a promise aplus test.
Maybe it has bugs. I have not used it in practice yet. But this file is the
placeholder for _the_ promise i will use for the tools here, coz that´s my 
best attempt to write one so far. This was developed cleanly and fast with the
little knowledge i have about. The result says 1/3 fails, or it has unseen bugs.
But it creates new Promises and uses setTimeout, so i think i can use it as
placeholder for a compliant promise.

```javascript

var makePromise = require("promise.js").makePromise;

var deferred = makePromise(); // gives a "deferred" with { resolve, reject, promise }
			    // in the spec called promise capability
			    
var promise = makePromise(function (resolve, reject) { resolve("value"); });
		// the function will be executed on a setTimeout
		
var promise2 = promise.then(function (value) { return value + "stuff"; }, function (error) { handleError(error); });		


// It exports the aplus test adapter with deferred, resolve, reject and the makePromise.
    
```
