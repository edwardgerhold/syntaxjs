syntax.js
=========

EcmaScript 6 Interpreter and beyond written with JavaScript or EcmaScript 5.

For node.js (shell) and browser (syntaxhighlighter for PRE with controls 
possible and CODE without controls, but that kind of design is temporary)

Not working: Generators, and the module loader is still disconnected. And maybe 
the destructuring to a LeftHandSideExpression Target is not completed, plus
a few little things inside which make the program fail in running itself with
node syntax0.js syntax0.js

Running a file

```
> ./es6 [filename]
> node syntax0.js [filename]

```

Example creating a realm

```js
> var syntaxjs = require("./syntax0.js").syntaxjs;
> var realm = syntaxjs.createRealm();
> var code = "let name = 'I'; let s = String.raw(`${name} wrote this`); print(s);"
> realm.eval(code);
I wrote this
```

Accessing the internal modules

```js
var tables = syntaxjs.require("tables")
var parse = syntaxjs.require("parser");
var parseGoal = syntaxjs.require("parser").parseGoal;
var program = parse("function x() {}");	// output a full parse to "Program" 
var fdecl = parseGoal("FunctionDeclaration", "function x() {}"); // starts at "FunctionDeclaration"
```


Most Tests are now in test/json

One of the biggest lacks, or the biggest lack is the weak test coverage of syntax.js
I had a couple of tests written for tester.js and my homepage, and since last month
i am collecting tests in test/json, but they don´t cover all bugs, so i got still to
do

```
./testall   # runs the tests with syntaxjs.eval()
./showfail  # shows all bugs marked with FAIL:
./showpass  # tells what i´ve already finished
./testall -r  # tests with realm.eval()

```

syntaxjs.eval() and realm.eval() are currently slightly minimal different,
i guess syntaxjs.eval handles the TaskQueues correctly and for the realm 
i don´t know the result now, but both will go away and move into the realm.
syntaxjs.eval() will soon just use the realm behind, currently there is a
whole function.


Example just using the eval function with a new environment each time
This is the old syntaxjs interface and i subject to change internally
because it was my first one and is more than deprecated and overthought.

```js
// the deprecated eval interface
var result = syntaxjs.eval(code);
result = syntaxjs.eval(code, true); // evals and keeps the environment alive for the next call
result = syntaxjs.eval(code, true); // evals and keeps the environment alive for the next call
result = syntaxjs.eval(code, true); // evals and keeps the environment alive for the next call
result = syntaxjs.eval(code, true, true); // enough, keep alive, but reset the realm once
```

Project goal: getting it complete and giving not up. It´s my first application.
And it looks like my first application. Here i learn to write much, the spec is
better written, than i coded, and i learn from. I refactor a lot by replacing 
code with other code, and search and replace globally with regexp to replace old
strings or names with better ones. Currently it has no garbage collection, no
weak maps and uses plain javascript objects. One ES6 Object is made out of three
JS Objects for the Object with it´s slots, plus bindings (properties) and symbols
(es5 uses stringkeys, and the second object makes it impossible to collide.
Later it should use typed memory, serialized object, slots in array form, hidden
classes instead of hashing, lists and arrays, and have own garbage collection,
together with WeakMaps, WeakSets, and WeakRefs. The code is so far designed to be
changeable, to be exchangeable with new code.


From the project directory, it´s currently not in npm.

```js
npm install -g

```

The generator functions are not working because of a design mistake to simply
use the recursive evaluation by ast walking. A walk can not simply be suspended
and resumed. On the other side, it will overflow the callstack on larger codes,
i can grant for now, without having experienced it. The solution for both is,
to put a stack under a main loop and to pop the nodes of the code stack and push
the results onto the operand stack. That code eval state can simply be suspended
and resumed, and comes with a small cost, maybe one call each function call, so 
the stack is exactly as high as the function calls of the interpreted code plus
one or two operations operating upon, and not a long list of functions waiting
for the return of the Evaluate(node) call within.

This change will happen in the next time. I think then the AST interpreter is
good. On the other hand, i started developing the compiler now, and will figure
out a good bytecode. While collapsing the nodes over compilation i already figured
out, that their node names can be replaced by better bytecode. That let´s us end up
with something like JVM code, or simply Assembly.

The parser performs in about 4x the time esprima takes to parse the same file.
One of my goals is to make the AST input and output compatible to esprima and
the other Parser_API parsers. 

History
=======

This thing is developed between a few minutes and an hour or two a day. Sometimes
i do more, sometimes i give myself at last one or two tasks to solve before i go.
That´s not too much, but i am also the only one motivating me.

12/2012 - syntax.js was a 99 loc highlighter based on a few regex and css classes
1/2013 - syntax.js had a tokenizer and a partially implemented parser api ast
6/2013 - i decided to continue my syntax highlighter after our Pet Gizmo die
7/2013 - i download the ecma 262 edition 6 release of july 15,
8/2013 - i get a copy printed, i start figuring out, how ecmascript works
9/2013 - i had to option to program without javascript objects and with heap
12/2013 - i have already an ast interpreter, but broke the program this month 
1/2014 - i continue with the loader, i still suffer from the broken project
2/2014 - i program java and write parser and lexer in java with parser api like ast
3/2014 - i continue writing this program from time to time, i spot the CST
4/2014 - i continue over the month with testing and fixing bugs, still a plenty of left
5/2014 - i start writing a bytecode compiler and runtime, typed, with constant pool




