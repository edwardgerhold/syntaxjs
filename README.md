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

From a ninety nine line syntax highlighter of a poor man´s homepage 
To a thirty thousand line abstract syntax tree interpreter as a milestone
To a real JavaScript-ByteCode-Compiler with a dedicated instruction set and
a virtual machine capable of executing the code which has an unknown amount
of code, but i think, we´ll reach the fifty or sixty thousand, when it´s working.

First Version

The first syntaxhighlighter was matching a few tokens, keywords, operators,
strings, comments with regular expressions. That wasn´t perfect without perfect
expressions, and matching quoted strings means not to try on HTML or you get a 
mess. So a week later the tool had an array of tokens, on which the highlighting
could be applied.

It was one, two months before my first algorithms video lecture. I used Arrays and
.indexOf the first time for looking up the keywords. I could watch the highlighter
tokenizing and highlighting with. After changing a ["a","b"] Set into { a: true, b: true}
the highlighter suddenly broke all speed records.

A more worse problem was not to forget about using first class functions as first class
option. I started with OR-ing a few functions WhiteSpace()||Comment()||Keywords()||Operator()
and lost a few hundred ms by calling the function first and looking then, if we are in the right
one, and returning for getting with OR to the next, or stopping.

The object sets, in the "tables" module, can beat regular expressions by comparing oneOfSix[x] 
instead of calling (/one|two|three|four|five|six/).test(x). The more complex the regular expression
is, the slower it get´s. But the object[key] can get beaten by switches and a small number of if 
cases. If the number of if-else-if clauses grow, the one [[Get]](P) Operation is much faster.

Second Version

After developing about 60% of the AST parser, just for my homepage, in one or two weeks, after 
Christmas 2012, it wasn´t clear, that i will peek into the EcmaScript Specification half a year later.
In 2012 i begun with JavaScript for fun. I reverse engineered the EventTarget as well as YUI which i
didn´t release, because function (lib) was so bitten. I wrote my own AMD loader. I wrote data structures
and algorithms. Was fascinated by graphs and trees on the canvas. That was in early 2013. In the middle
of the year, in July, i started reading EcmaScript 6 because i was bored of either doing HTML5 or being
no JavaScript Programmer and i could read the Specification as Code, but not as the right model.

A few days before taking normal JavaScript Objects for the Objects i wrote a Garbage Collector for a 
Typed Array, which could cleanup and resize. By doing Mark and Sweep as well as Stop and Copy. Just by
watching an MIT 6.172 Performance Engineering Lecture handling mark and sweep and freelists.

However. I wrote this AST interpreter. I fought not often with bugs except once, where i overworked about
a third of the code (400 to 600K or so) but broke the project. In January i didn´t continue, coz it was 
broken for unknown reasons. 

Biggest Mistake

Not enough test. What i did is a no go for any professional project. I miss a lot, hundreds of tests, which
tell me when i break something, so i got then there a new bug, then there and didn´t notice it, while other
people looking at the tool by simply starting it, did.


Third.

The AST simulation is almost complete except for more little than difficult bugs. It was already half that
complete half a year ago, that was, where i broke the project later. After restoring it and loosing two months
i decided to put it onto github for whatever reasons..

Oh, no. Let´s make it short. Now it´s time for RE-DESIGN.

I´ll do "the Compiler with Register Machine".

For that all object become a few IntCodes in the HEAP32.
For that all StackFrames become a few fields of the STACK32.
For that all Code will be compiled into it´s CODE32 segment.

When compiling down the Code for the first time, i noticed, that all the instructions needed for executing a 
crunched version of the ast repeat, and a regular machine language instruction set makes more sense than anything else.

So this project will get a assembly-bytecode-dsl (with own parser for writing assembly scripts run by the interpreter as a project tool to play around with).

This project will proove the speed of compiled JavaScript Code versus the speed of recursivly evaluating a syntax tree.



