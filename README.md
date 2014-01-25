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

Have to write up the documentation


Meanwhile this weekend i search for and try to restore the old state,
where almost everything except the unwritten is working. Currently i
figured out, that i have some of same bugs, i had three months ago.
They are quite logical, i deviated somewhere from the algorithms. But
knowing this bug lets me know, where to search for and to fix it.
Just want to let you know until i fixed it. 



Hope to annoy you not too much with the bugs!

