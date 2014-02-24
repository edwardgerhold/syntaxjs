syntaxjs
========

Not bugfree EcmaScript 6 Interpreter written in EcmaScript 5

This is a true ECMA-262 implementation. But it isn´t completed yet. 
It´s "feature complete" like ES6 already is, but the features aren´t 
completed yet. Some thing fail, some don´t, some didn´t before, 
some do now. 



_Usage_
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

_Known Bugs_
* Generators: The code Evaluation Stack is not fixed. The tool started with Evaluate(node) as indirect recursion function (being called again from a function called by Evaluate), but using a stack instead of real recursion makes resumability available, which is needed for the generator. I had little trouble imagining resuming and suspending a context, coz i forgot to directly use a stack machine. The problem can be fixed locally just for the generator i estimate by thinking it out.
* btw. i never tried to create code blocks from the ast to put the loops into blocks each iteration. From the function body of SomeIterationStatement the inner could become extracted. A little
editing is to be done for reentering the loops for the generators. That´s done by looking up "am resuming" ok "then get index of next instruction plus my environment" and
the special case for returning the value to yield is not working through the mistake with the
Evaluate(node) at the beginning. [[ Apologies block: It´s the first time i tried to write such a thing and if i finish it,
it is my first project ever. (I have neither studied CS nor worked in the job yet, but on a website for a jobcenter euro-job, four years ago, and have no
experience since i wrote tools with 16/17 in PPL for PCBoard in ´93/´94. I just kept the hobby from time to time, but
got not to work with PHP or Linux a decade ago..) ]]
* Classes. I just have a bug in the code, they are easy. Super References. I just have a bug in the code, they are easy.
* Have to rewrite in parser.PropertyDefinitionList and MethodDefinition the part for the computedPropertyName [sym](). It´s working, but not DRY but DUPING the Code extra for the computed key.
* Lock-Ups, Hanging Terminals: After releasing it and writing wrong inputs i got it. I have one of the loops not breaking.
* Source Characters: The character set is incomplete and unicode is disabled.

_Long Term Goal_
Long Term Goal: Completing it. Keeping it up-to-date with ES7 and
adding a a) Compiler and b) TypedArray Heap, which could have been
there from the beginning on, but i decided to stick with the begun
code and to refactor it with Search & Replace. 

_Design Mistakes_
Issue to do for b): Replacing all {} with createGenericRecord({}), all
regular rec[val] with getRec(rec, val) and rec[val] = value with 
setRec(rec, val, value) as well as [] with createGenericList([])
and a.push(x) with push(a, x) and a.length with length(a) and 
a[x] with getRec(a, x) and a[x] = v with setRec(a,x,v);
Reason: The internal slots set with such records want to be put into
the TypedArray, but for that, also generic maps and arrays have to be
serialised.

Issue for a): Have to write an independent heap, with operations to
read and write exactly EcmaScript values with a[0] = type and a[1..] = value;
And maps as HashTable of Pointers to Name/Value Pairs (type, length, data/
type, length, data). Array are arrays with Pointers to some values. This
is all not to difficult, but the whole code has to be searched and replaced,
partly manually, of course. (Sorry, my mistake).

Other stuff. A lot of DefineOwnProperty calls with an explicit Descriptor,
which has to be replaced by a generic function, which came from copying and
pasting a function body for the next function and for the next and so on, 
thinking i could replace it later. Now i have the mess there for doing so. :-)

_ByteCode_
The worst thing was, that i couldnt decide to which numbers i want to map
the AST node contents. The other thing was, that Mozilla AST doesnt meet
the ES6 AST 101. The next was, that i never wrote a compiler, and just watched
Aiken and Ullman for Compilers and Automata and Berkeley for Languages and
MIT for Algorithms and such.

_AST_
I found out, that the AST Evaluation is reusable for ByteCode if i fetch
the nodes Contents by and Interface Function, which could in effect return
bytecode. For that, all the accesses have to be searched and replaced, too,
i just added it to a handful of accesses to begin.
After replacing this, and the Array Accesses (StatementLists, FunctionBodies)
with a getIndex(list, x), the SAME Function can be used with a ByteCode.
Coz the Evaluate() returns the result in a completion, which can be explored
and returned if abrupt or replaced by getvalue. (In JavaScript the extra 
Variable and Type Casting is missing).

_Exception Handling_
The worst is, that the Parser and Tokenizer throw REAL Exceptions and the
Evaluation uses ReturnIfAbrupt(x) unless i hit the outer eval function, where
i change the internal exception into a real one. The JSON Parser is called
from within the Evaluation and works different that the parser, because it
loads ReturnIfAbrupt and uses the "return withError(type, msg);" function.
While developing i had to give up my simple "module structure", just separating
the big parts from each other. The most important part was, coz i kept a 
single file, that i wanted to separate the AST Node using functions from all
other, to have it easier to change them for bytecode. Well, currently i have
the feeling, that some exception stack is lost in my last edits. Mainly i miss
my regular exceptions, but am not to stupid not to know what i am doing or did,
so i wonder a little.


_Object Refactoring_
For the ByteCode + Heap (ByteCode can be run without putting them all into
an Array, ByteCode ist not depending on Heap, while Heap can only store Bytecode)
all OrdinaryObject.prototype (Essential Methods) have to be replaced by a function
taking the object (ptr) as argument.

_Design Patterns_
Doing something else than JavaScript. I wanted i typed version of Ecma-262 and started
with Java this february. 
Today i am trying Java the first time and try JSR000223 together with ES6 while
trying out the language and trying books about design patterns. Together with my
little new knowledge i find it´s possible and relevant, that i keep both functions
for bytecode and AST and add a stage setting the right one up before them. The Books
teach me loose coupling and patterns currently not being in the syntax.js tool.
But like i already stated, this is a long term project, not a short living buggy toy
to drop. Future compatibility with Esprima is easily achieved by editing the ES6 AST
evaluation a little. Developers helping me with are always welcome.

_Optimizing_

For Proof of Concept i really wrote down the whole type checks. This can be
replaced with some easier JavaScript which will speed up the thing a lot. 
As this was my first code and first attempt i wanted to try out what´s really
in the spec. Now, where i understand, what is going on, a lot of functions
could be made easier.

_Offline Times_
The whole project is living and i am activly working on, but somedays 
i do other things. Like this February 2014, where i start the same 
project (implementing EcmaScript Edition 6 from the draft) in Java, to 
learn how to code a real engine, but with the easier language first.
We´ll see what happens with my JavaScript Version, when the next draft
arrives.
Since a few Files i am learning "design patterns" together with the 
Java language after times of letting them pass me by. This will influence
the syntax.js JavaScript Version soon, coz i am sometimes hot to refactor.


Missing

* Developer Documentation


Tests 

* There are some handwritten files, and some handwritten tests existing, but
the final testsuite shall be test262, the official testsuite for ecmascript,
which can already be run from the commandline.

