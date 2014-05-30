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

This project will proove the speed of compiled JavaScript Code versus the speed 
of recursivly evaluating a syntax tree. As well as compare the version using JavaScript
Objects for simulating the internal object´s structures with the version using a 
few numbers behind some array slots and a lot reads and writes on the Buffer.

Both have to use distinct API´s.

My first thought when creating the AST Version was, to make it changeable for
TypedArrays. But i didn´t really know, that my register machine has the slots
on the context for the registers and the local vars. Which look like the environment
records on the ast, but .LexEnv and .VarEnv won´t work anymore. My old aim was to
reuse these and just to move the code to STACK32 and the objects to HEAP32 and to
edit these to work with both

Now i will write a complete second version in the same branch. And show how both
versions will execute javascript code and care for

a) cleaning up the old version
b) making a competitive second version which is still around when es7 is prototyped,
but then running everything from a few compiled intcodes
c) writing papers up for both version


Main goal: Education
====================
Telling the world my experiences with implementing EcmaScript. There are so many
people which want to know what a virtual machine is, how these engines work, and
where the differences are in the approach of coding such a machine. 


If i had a boss, i bet i´d worked cleverer, because of the team around and the
experience of these people i hadn´t taken the wrong branch. 



Register blueprint
==================
* Unlimited registers are cool
* Push and pop of the registers must be possibly
* There will be typed registers and dynamic registers
* Each callframe get´s local registers, which can be saved
*

Constant Pool
=============
* How much, Function Declaration Nodes, VariableDeclaration Nodes, BoundNames Lists, lexNames Lists, and what lands in the constant pool is unclear. It´s from anything which isn´t fitting into the Int32Array to nothing, because we encoded all.
  Will be discovered by development. But the POOL is available and has ByteCodes and Operations.
* Maybe i store additional compiler information here. Do i encode the boundNames and
just use the numbers and restore the name behind the number on demand or do i keep a 
hidden class in the constant pool (so each objectliteral produces some garbage there?)  
  


Memory blueprint
================
* Three (or four) Segments. At last CODE, STACK and HEAP. And a constant POOL (which isn´t a typed array, but a dynamic pool) 
  Code is reserved space from the compiler. Three Segments to make it more readable.
* Stack is the runtime organization and the memory scratchpad and heap is allocating space for objects
  and storing compiled code of in the runtime created function expressions.

Compiler blueprint:
===================
* Compile each expression down to basic blocks, label the entrance. Have a goto at the end. Each block is atomic and can not be left.
* The compiled gotos make sense in this very expressive language form.The compiled jumps make it unecessary to load the program counter manually by doing stack[++pc] = nextPtr and the code walks from beginning to end.
* Compile CODE into a Code segment.
* the STACK gets it´s own segment above the compiled code
* The HEAP and the STACK may meet

Code Optimization
=================
* Learning to generate three address code
* This is analyzable and optimizable
* There are a dozen well-known optimizer techniques which all have to have their
interface and their use in this system, but writing this down is new for me.

Runtime blueprint
=================
* HEAP32[0] = TYPES_OBJECT | ((BITS_EXTENSIBLE|SLOTS_ORDINARYOBJECT) << 16) 
* Objects have a refcount int, And another free int
* A freed object´s space gets typed to TYPES.FREELISTNODE and has the size of
* the Object, so it could serve a new object, for example.


Cleaning up the old syntax.js:
==============================

1. I´ll make the Generator possible like i promised (it wasn´t the problem, the whole vm 101 was more to learn than how suspending and resuming a cc will work)
2.I´ll fix the unicode interpretation for the source code and all stringLiterals
3. I´ll replace recursive descent AssignmentExpression with a LOOP to get more depth
4. I´ll replace the main loop of the interpreter with a main loop doing all task queues
and then if the script task is available i execute the code there. And that execution
will do the following:  Put all nodes into a Queue (no more stack, FIFO is the easy way round here,
don´t use shift, just ++pos)) and work them off and keep the counter.
Replacing the RD-eval with a LOOP-eval will make the system clean.
5. And making static semantics cache their values will help much saving timne when executing
functions multiple times with their boundnames and loops. 
6. Removing "execute" and other functions which are not clear and not needed.




