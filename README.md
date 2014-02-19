syntaxjs
========

Not bugfree EcmaScript 6 Interpreter written in EcmaScript 5

This is a true ECMA-262 implementation. But it isn´t completed yet. 
It´s "feature complete" like ES6 already is, but the features aren´t 
completed yet. Some thing fail, some don´t, some didn´t before, 
some do now. 

The whole project is living and i am activly working on, but somedays 
i do other things. Like this February 2014, where i start the same 
project (implementing EcmaScript Edition 6 from the draft) in Java, to 
learn how to code a real engine, but with the easier language first,
before i can do my best putting all my wisdom into a new ? C? engine.
So from time to time this project may look inactive, but we´ll see, what
happens, when the next draft arrives :-)

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


Missing

* Developer Documentation


Tests 

* There are some handwritten files, and some handwritten tests existing, but
the final testsuite shall be test262, the official testsuite for ecmascript,
which can already be run from the commandline.

