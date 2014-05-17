primitive tools:
================

tools which help

* tester.js - simple tool with standard node.js style assertions and console and browser logging.


* testmaker.js - simple tool to call tester.js by processing a .json configuration (hot! extension)

* promise.js - handwritten promise (caution: not a+ compliant now! has mistakes!)

* inlinefiles.js - Tool to recursivly inline files in a file with ```//#include "name.js";```
    This tool has now become the main build tool for syntax.js.


* replace_strings.js - replaces a string-regexp arg with g flag case sensitive with a new string arg in the remaining file args


Docs
====


inlinefiles.js
==============
Currently the main build tool for syntax.js
it translates //#include "name.js"; directives back into code with string.replace;

```
node inlinefiles.js build_syntax.js syntax.js
```
is the command which reads in build_syntax.js and replaces recursivly all //#include "name.js"; directives.



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

testmaker.js
============
```js
{
	"name for test1":
	{
	    "init":	"let x = 10;",
	    "tests":
	    [
		["x",10],
		["x+x;", 20]
	    ]
	},

	"name for test2":
	{
	    "init": "const x = 20;",
	    "tests":
	    [
		["x = 30; x;", 20],
		["x-=10", 10],
		["x", 20]
	    ]
	}
}
```

The .json contains one object literal.
This literal contains "name of test" keys with object literal values as the tests.
A test contains two properties, init and tests.
"init" is the code which initialises the environment. That´s the setUp() code.
"tests" is containing an array of arrays
The first field of the array is the code which will give a result for an assertion.
The second field of the array is the expected result.
So "test": { "init": "let x = 10", "tests": [ ["x + 10", 20] ] } will first eval
The init code and then secondly iterate through the array, eval the tests[i][0] field and
assert with expectation of the tests[i][1] field.

Tests against NaN aren´t possible now, a test[i][2] field can hold certain commands for
the assertion to be made, and for test against undefined you have to omit tests[i][1] because
JSON is not parsing undefined values.

```
node testmaker.js testmaker.json
```
A -v option prints out the json each test. For little convenience i changed the output
of tester.js a little to make it easy to simply run

```
./testall
```
which calls ```for f in /test/json/*.json; do testmaker $f; done```

promise.js
=========

This fails 65 and succeeds in 133 tests or around 1/3 in a promise aplus test.
There are points i am missing about the construction and architecture of promises,
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


