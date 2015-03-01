syntax.js
=========

Usage: node syntax0.js [filename.js]

```js
linux-qc59:/syntaxjs # ./es6
es6> let x = 10, y = [for (a of [1,2,3]) x*a];
undefined
es6> y.join()
10,20,30

```

```
linux-qc59:/syntaxjs # npm install -g
linux-qc59:/syntaxjs # node
>var s = require("syntaxjs");
undefined
>var realm = s.createRealm();
undefined
>realm.eval("let x = 10; eval('x')");
10
```


Broke my promise :-)
================
I promised to continue. I took a break for other stuff after checking
out assembly for the bytecode compiler, including a new pro php mvc framework,
which i could advertise daily because of the concise code in the book,
some studies of webgl and physics engines and today finally doing my math
and really taking that serious. Meanwhile the specification evolved a little
(it´s not the same program anymore) and this tool is from last years summer,
with a lack of bytecode and a stack machine instead of recursion, which
prohibited the generator feature without patching too much.
I still think, i will continue this tool, too. 


2015 RC1 ES6
============
The saga continues with draft 33. When the browsers are ready, i will be pretty, he.