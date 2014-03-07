syntaxjs
========

Not bugfree EcmaScript 6 Interpreter written in EcmaScript 5

This is a true ECMA-262 implementation. But it isn´t completed yet. 
It´s "feature complete" like ES6 already is, but the features aren´t 
completed yet. Some thing fail, some don´t, some didn´t before, 
some do now. 

_New: Multiple Realms_

Creation of an eval realm.
You can have as many realms as you want.
Each realm has own environments, and is independent from each other.
The intrinsic objects (the global builtins) are created once each realm.
About optimizing that code i know something on my list, but that´s out of scope here.
Just install syntaxjs for node.js.

```bash
npm install -g  #to install syntaxjs from it´s directory
```

Then call it in you javascript to evaluate es6 code.


```javascript
var realm = require("syntaxjs").createRealm();
realm.eval("let x = 10");
realm.eval("x"); 
// 10

var realm2 = require("syntaxjs").createRealm();
realm2.eval("x");
// Error: GetValue: 'x' is an unresolvable Reference

realm2.eval("let x = 20");
realm2.eval("x");
// 20
realm.eval("x");
// 10
```

Caveat: Objects are coming out as their ES6 internal representation.
I know about adding adapters and transformers for or to create JSON message passing,
it´s on the list. But for now, you can use [[.Get]], [[.DefineOwnProperty]], [[.Set]],
[[.GetOwnProperty]] on the objects returned directly. If you want to know, how they
work, refer to Ecma-262 Edition 6.



_Regular Usage_
It can be tried with simply typing node syntax0.js. 

```bash
linux-www5:~ # node syntax0.js [exec_me.js]
````

executes a file or just starts the shell (a readline) when called without arguments

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
es6> let name = "Edward";
undefined
es6> String.raw(`${name} is stupid`);
Edward is stupid
es6> String.raw`${name} is stupid`;
Edward is a stupid
es6> ObjeOct.create(null)
{ Bindings: {}, Symbols: {}, Prototype: null, Extensible: true }
es6> for (let i = 0; 
...> i < 3; i++) console.log(i);
0
1
2
undefined
es6> .print id
{
    "type": "Program",
    "body": [
	{
	    "type": "ExpressionStatement",
	    "expression": {
		"type": "Identifier",
		"name": "id",
		"loc": {}
	    },
	    "loc": {}
	},
    ],
    "loc": {}
}
```
Even with some weeks of nothing happening around the project, this is a living
creature.

And almost all of the stuff written below will be done in around a year. Some
thing will be done in a couple of weeks.

_New is /lib_
New overview: Meanwhile i´ve cut the Megabyte of code into the
big modules and can already see the mess i left in some modules,
i didn´t develop very far. And what was going on. Softwareengineering
is right and empiric with the knowledge about codes. The mess i see
is that what they said.
But i´m optimistic and like do continue. Pieces like the parser look
now very small and handy to browse and to edit. Scrolling around doesn´t
let you end up in some other code block. Hey. The API module is around
500k, and i think first i will cut out the make of the intrinsics and
then the making of the global object.

Yes, with adding /lib i have seen some desastrous engineering left beetween the main parts.

_Known Bugs, _
* Generators: The code Evaluation Stack is not fixed. The tool started with Evaluate(node) as indirect recursion function (being called again from a function called by Evaluate), but using a stack instead of real recursion makes resumability available, which is needed for the generator. I had little trouble imagining resuming and suspending a context, coz i forgot to directly use a stack machine. The problem can be fixed locally just for the generator i estimate by thinking it out.
* I found already various possibilities by thinking through, the latest is putting the last child of a list first onto the stack (much work) or just reading the doubly linked list forward with a pop_front. just fifo. but the stack storage is needed for suspending and resuming of the context, which indirect recursion by calls has not.
* Classes. I just have a bug in the code, they are easy. Super References. I just have a bug in the code, they are easy.
* Have to rewrite in parser.PropertyDefinitionList and MethodDefinition the part for the computedPropertyName [sym](). It´s working, but not DRY but DUPING the Code extra for the computed key.
* Lock-Ups, Hanging Terminals: After releasing it and writing wrong inputs, i got it. I have one of the loops not breaking.
* Source Characters: The character set is incomplete and unicode is disabled.
* TypedArrays: Incomplete Implementation (used TypedArrays in the background then) am not finished writing it down from the spec. 
* Date: Incomplete but already installed with a lot of functions.
* String Functions: Incomplete but already a lot of functions
* Number Functions: Incomplete .toFixed, .toPrecision, but i have managed converting numbers meanwhile (four weeks ago i hadn´t practiced much, but meanwhile i did for a lot of numbers)
* More? Probably. But the list of done things is longer. :-)

Uh, oh? Not really. Had a lot of fun with until today.

_Long Term Goal_
Long Term Goal: Completing it. Keeping it up-to-date with ES7 and
adding a a) Compiler and b) TypedArray Heap, which could have been
there from the beginning on, but i decided to stick with the begun
code and to refactor it with Search & Replace. 

Compatibility with Esprima is not achieved now, but a long term goal
and a must, too.


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
the nodes contents by an interface function, which could in effect return
bytecode. For that, all the accesses have to be searched and replaced, too,
i just added into a handful of accesses to begin.
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
The GOOD. They are already called by callInternalSlot("DefineOwnProperty", obj, ...)

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


