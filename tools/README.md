primitive tools:
================

tools which help

* tester.js - simple tool with standard node.js style assertions and console and browser logging.
* promise.js - handwritten promise (caution: not a+ compliant now! has mistakes!)
* inlinefiles.js - Tool to recursivly inline files in a file.
* returnifabrupt.js - contains a function to replace ReturnIfAbrupt(x) with the long form. (unused macro)
  I should have used macros from the beginning on, but most of the newbies get cleverer later...
  Like "i should have learned design patterns from the beginning on" to communicate the code structure...
* replace_strings.js - replaces a string-regexp arg with g flag case sensitive with a new string arg in the remaining file args

tester.js
=========

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
There a points i am missing about the construction and architecture of promises,
and maybe it has just bugs i haven´t seen. It was written "cleanly" (in much 
under half an hour) and while ringing for words i see this as placeholder for the
Promise i will using during development of possible additions. There is still an
unsolved Communicationsproblem with other Vats, where this will apply certainly.

```javascript

var makePromise = require("promise.js").makePromise;

var deferred = makePromise(); // gives a "deferred" with { resolve, reject, promise }
			    // in the spec called promise capability
			    
var promise = makePromise(function (resolve, reject) { resolve("value"); });
		// the function will be executed on a setTimeout
		
var promise2 = promise.then(function (value) { return value + "stuff"; }, function (error) { handleError(error); });		


// It exports the aplus test adapter with deferred, resolve, reject and the makePromise.

```

replace_strings.js
================

```bash

node replace_strings.js "old" "new" file1.js file2.js ... filen.js

```

should replace all occurences of "old" with "new"
first used to replace the module names beetween files
can be used for few refactorings
