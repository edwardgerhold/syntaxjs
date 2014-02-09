syntaxjs
========

Not bugfree EcmaScript 6 Interpreter written in EcmaScript 5

Almost "feature complete" prototype of an Interpreter. But with
some design issues, like heap and compiler, which will be added
in a later iteration, over already introduced interfaces, from
one day to another. The standard library is still incomplete, a
lot of functions have to be added to their prototypes still.

It can be tried with simply typing node syntax0.js. 

linux-www5:~ # node syntax0.js [exec_me.js]

```javascript
es6> let f = x => x*x;
undefined
es6> f(100);
10000
es6>
undefined
es6> let s = Symbol.for("Test");
undefined
es6> let obj = { [s]() { return Symbol.keyFor(s); } };
undefined
es6> Object.getOwnPropertyDescriptor(obj, s).value.name;
[Test]
es6> obj[s]()
Test
es6>
undefined
es6>
```

Sometimes i break code here, sometimes there. 
Sometimes i don´t call for a week.

The other day, i fix it :-)
---------------------------

Current status is "broken". A couple of mistakes is uncleared since december.
But not the problem. 

- Currently underspecified, but the documents may arrive fast the next days.
- Or a few weeks later. But a complete documentation is one goal.
- Have to write up the documentation, and to split the file up into modules, 
that you can have and edit pieces of.
- Have filled out a few issues for myself.
- Have an english book at hand, next time i will write better.
- Then i will have to tell you again.

Hope to annoy you not too much with the bugs!


### from time to time nothing happens

I opened the repo last month, and thought i could be straight.
But i am not and sometimes nothing happens. Other days a little.
And on some i will write the good code.

### meanwhile, i invented a new function

```js
var syntaxjs = require("syntaxjs").syntaxjs;
var promise = syntaxjs.evalAsync(code);

var syntaxjs = require("syntaxjs").syntaxjs;
var promise2 = syntaxjs.evalAsyncXfrm(code);

```

The latter tries to convert the internal ordinary object
into normal javascript objects and may call functions behind
wrappers. The function is just outlined and not really a specified
one. But asynchronous communication with the results over promises
is an idea i have in mind for a long time now.

### currently strict mode fails (one of many current bugs)

(I discovered, that i changed the code in many places, meanwhile)

Which is not a problem. it just fails in the current version. i´ll remove this note,
when i fixed it. I need to, because i want the test262 cases to pass in strict mode again.

On my homepage the older version proves, that strict mode was already implemented correctly.
The current version is broken and i just have to search for, last time i discovered it, i 
checked the parser first with the .print command but strict mode is parsed correctly. It must
be somewhere while evaluating. At instantiate global or function or when evaluating the call,
nothing special, but is a to do.


### i tried test262 with syntax0.js 

(passing test262 is a longterm goal to close this tools file as a successful project)

https://github.com/tc39/test262 is the official testsuite for ecmascript. If you remove
in the last block of the file the command syntaxjs.nodeShell() which starts the shell, 
test262 is running without break

```bash
annexB/B.2.1 passed in non-strict mode
annexB/B.2.1.propertyCheck passed in non-strict mode
annexB/B.2.2 passed in non-strict mode
annexB/B.2.2.propertyCheck passed in non-strict mode
annexB/B.2.3 passed in non-strict mode
annexB/B.2.4 passed in non-strict mode
annexB/B.2.4.propertyCheck passed in non-strict mode
annexB/B.2.5 passed in non-strict mode
annexB/B.2.5.propertyCheck passed in non-strict mode
annexB/B.2.6 passed in non-strict mode
annexB/B.2.6.propertyCheck passed in non-strict mode
annexB/B.RegExp.prototype.compile passed in non-strict mode
=== bestPractice/Sbp_12.5_A9_T3 was expected to fail in non-strict mode, but didn't ===
=== bestPractice/Sbp_12.6.1_A13_T3 was expected to fail in non-strict mode, but didn't ===
=== bestPractice/Sbp_12.6.2_A13_T3 was expected to fail in non-strict mode, but didn't ===
=== bestPractice/Sbp_12.6.4_A13_T3 was expected to fail in non-strict mode, but didn't ===
=== bestPractice/Sbp_7.8.4_A6.1_T4 was expected to fail in non-strict mode, but didn't ===
=== bestPractice/Sbp_7.8.4_A6.2_T1 was expected to fail in non-strict mode, but didn't ===
=== bestPractice/Sbp_7.8.4_A6.2_T2 was expected to fail in non-strict mode, but didn't ===
bestPractice/Sbp_7.9_A9_T3 passed in non-strict mode
bestPractice/Sbp_7.9_A9_T4 passed in non-strict mode
bestPractice/Sbp_A10_T1 passed in non-strict mode
bestPractice/Sbp_A10_T2 passed in non-strict mode
=== bestPractice/Sbp_A1_T1 was expected to fail in strict mode, but didn't ===
=== bestPractice/Sbp_A2_T1 was expected to fail in strict mode, but didn't ===
=== bestPractice/Sbp_A2_T2 was expected to fail in strict mode, but didn't ===
=== bestPractice/Sbp_A3_T1 was expected to fail in strict mode, but didn't ===
=== bestPractice/Sbp_A3_T2 was expected to fail in strict mode, but didn't ===
=== bestPractice/Sbp_A4_T1 was expected to fail in strict mode, but didn't ===
=== bestPractice/Sbp_A4_T2 was expected to fail in strict mode, but didn't ===
=== bestPractice/Sbp_A5_T1 was expected to fail in strict mode, but didn't ===
=== bestPractice/Sbp_A5_T2 was expected to fail in strict mode, but didn't ===
...
```
Says i got to fix strict mode. My tester.js Tests are giving a little more information,
but for now i am early at the beginning to work with the official tests.

Test262 can be run with a single command

```bash
TEST262DIR=/www/test262
${TEST262DIR}/tools/packaging/test262.py --command="node /www/syntax0.js" --tests=${TEST262DIR}
```
