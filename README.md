syntaxjs
========

Not bugfree EcmaScript 6 Interpreter written in EcmaScript 5

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

The other day, i fix it :-)

Current status is "broken". A couple of mistakes is uncleared since december.
But not the problem. 

- Currently underspecified, but the documents may arrive fast the next days.
- Have to write up the documentation, and to split the file up into modules, 
that you can have and edit pieces of.
- Have filled out a few issues for myself.
- Have an english book at hand, next time i will write better.
- Then i will have to tell you again.

Hope to annoy you not too much with the bugs!


 